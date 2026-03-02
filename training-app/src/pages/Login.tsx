import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '../api';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof schema>;

type LoginResponse = {
  token: string;
  user: {
    role: string;
  };
};

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

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

      navigate(user.role === 'admin' ? '/admin' : '/employee');
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
    <div className="min-h-screen flex">
      
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold">ComplianceHub</h1>
          <p className="mt-4 text-indigo-100">
            Manage employee training, track compliance, and stay audit-ready.
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-lg font-semibold">
            Secure. Scalable. Simple.
          </p>
          <p className="text-indigo-200 text-sm">
            Built for modern companies that take security seriously.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md space-y-8">

          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              {t('login')}
            </h2>
            <p className="text-sm text-gray-500 text-center mt-2">
              Welcome back
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Email */}
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder={t('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder={t('password')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>

              {errors.password && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-100 text-red-600 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loginMutation.isPending && <Loader2 className="animate-spin" size={16} />}
              {loginMutation.isPending ? t('logging_in') : t('login')}
            </button>

            {/* Footer */}
            <p className="text-sm text-center gap-1 font-semibold text-gray-500">
              {t('no_account')}{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:underline">
                {t('register')}
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}