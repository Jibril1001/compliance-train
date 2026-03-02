import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetcher } from '../api';
import Navbar from '../components/Navbar';
import { CheckCircle, Loader2 } from 'lucide-react';

type EnrollmentWithTraining = {
  _id: string;
  userId: string;
  trainingId: {
    _id: string;
    title: string;
    description: string;
    date: string;
  };
  status: 'assigned' | 'completed';
  completedAt?: string;
};

export default function EmployeeDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: enrollments, isPending, isError, error } =
    useQuery<EnrollmentWithTraining[]>({
      queryKey: ['my-trainings'],
      queryFn: () => fetcher('/enrollments/my-trainings'),
    });

  const completeTraining = useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetcher(`/enrollments/complete/${id}`, { method: 'POST' }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-trainings'] });
    },
  });

  const total = enrollments?.length || 0;
  const completed =
    enrollments?.filter((e) => e.status === 'completed').length || 0;

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto py-10 px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('myTrainings')}
          </h1>
          <p className="text-gray-500 mt-1">
            Track your progress and stay compliant
          </p>
        </div>

        {/* PROGRESS CARD */}
        <div className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-2xl font-bold text-gray-900">
              {completed} / {total} completed
            </p>
          </div>

          <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{
                width: `${total ? (completed / total) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* ERROR */}
        {isError && (
          <div className="bg-red-100 text-red-600 p-4 rounded-lg">
            {error?.message}
          </div>
        )}

        {/* EMPTY STATE */}
        {enrollments?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              🎉 {t('noTrainings')}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              You're all caught up. Enjoy the calm.
            </p>
          </div>
        )}

        {/* CARDS */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {enrollments?.map((enrollment) => {
            const isCompleted = enrollment.status === 'completed';

            return (
              <div
                key={enrollment._id}
                className="bg-white rounded-xl shadow hover:shadow-md transition p-6 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {enrollment.trainingId?.title}
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    {enrollment.trainingId?.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {t('dueDate')}:{' '}
                      {enrollment.trainingId?.date
                        ? new Date(
                            enrollment.trainingId.date
                          ).toLocaleDateString()
                        : '—'}
                    </span>

                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {isCompleted ? t('completed') : t('assigned')}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  {!isCompleted ? (
                    <button
                      onClick={() =>
                        completeTraining.mutate(enrollment._id)
                      }
                      disabled={completeTraining.isPending}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {completeTraining.isPending && (
                        <Loader2 className="animate-spin" size={16} />
                      )}
                      {t('complete')}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle size={16} />
                      {t('completed')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}