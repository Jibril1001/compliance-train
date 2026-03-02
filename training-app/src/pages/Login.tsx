import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '../api';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof schema>;

type LoginResponse = {
  token: string;
  user: {
    role: string;
    // add more fields if needed
  };
};

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  // ✅ React Query mutation (v5 correct syntax + types)
  const loginMutation = useMutation<LoginResponse, Error, LoginForm>({
    mutationFn: (data) =>
      fetcher('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    onSuccess: (res) => {
      const { token, user } = res;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/employee');
      }
    },

    onError: (err) => {
      setError(err.message || 'Login failed');
    },
  });

  const onSubmit = (data: LoginForm) => {
    setError('');
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('login')}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            
            {/* Email */}
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder={t('email')}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              disabled={loginMutation.isPending}
              className="w-full flex justify-center py-2 px-4 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loginMutation.isPending ? t('logging_in') : t('login')}
            </button>
          </div>

          {/* Register link */}
          <div className="text-center">
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-500 text-sm"
            >
              {t('register')}
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}