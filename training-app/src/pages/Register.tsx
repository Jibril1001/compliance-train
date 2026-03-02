import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '../api'; // adjust path if needed

const schema = z.object({
  companyName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

type RegisterForm = z.infer<typeof schema>;

type RegisterResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
    companyId: string;
  };
};

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

  // ✅ React Query mutation
  const registerMutation = useMutation<RegisterResponse, Error, RegisterForm>({
    mutationFn: (data) =>
      fetcher('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    onSuccess: (res) => {
      const { token, user } = res;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate('/admin');
    },

    onError: (err) => {
      setError(err.message || 'Registration failed');
    },
  });

  const onSubmit = (data: RegisterForm) => {
    setError('');
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('register')}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">

            {/* Company Name */}
            <div>
              <input
                {...register('companyName')}
                type="text"
                placeholder={t('companyName')}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.companyName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder={t('email')}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <input
                {...register('password')}
                type="password"
                placeholder={t('password')}
                className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {/* Button */}
          <div>
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-2 px-4 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {registerMutation.isPending ? t('registering') : t('register')}
            </button>
          </div>

          {/* Login link */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              {t('login')}
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}