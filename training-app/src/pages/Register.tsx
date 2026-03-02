import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetcher } from '../api';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

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
    <div className="min-h-screen flex">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-12 flex-col justify-between">
        
        <div>
          <h1 className="text-3xl font-bold">ComplianceHub</h1>
          <p className="mt-4 text-purple-100">
            Set up your company’s training system in minutes.
          </p>
        </div>

        {/* Onboarding Steps */}
        <div className="space-y-4">
          <p className="text-lg font-semibold">What happens next?</p>

          <div className="space-y-3 text-sm text-purple-100">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} /> Create your company workspace
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} /> Invite your employees
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} /> Assign compliance trainings
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md space-y-8">

          <div>
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              {t('register')}
            </h2>
            <p className="text-sm text-gray-500 text-center mt-2">
              Create your company workspace ✨
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Company Name */}
            <div>
              <input
                {...register('companyName')}
                type="text"
                placeholder={t('companyName')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition"
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
              disabled={registerMutation.isPending}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {registerMutation.isPending && (
                <Loader2 className="animate-spin" size={16} />
              )}
              {registerMutation.isPending
                ? t('registering')
                : 'Create Workspace'}
            </button>

            {/* Footer */}
            <p className="text-sm text-center text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline">
                {t('login')}
              </Link>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}