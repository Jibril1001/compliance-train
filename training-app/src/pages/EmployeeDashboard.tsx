import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { fetcher } from '../api';
import Navbar from '../components/Navbar';

// Matches the populated Enrollment from the API
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

  const { data: enrollments, isPending, error: queryError, isError: isQueryError } = useQuery<EnrollmentWithTraining[]>({
    queryKey: ['my-trainings'],
    queryFn: () => fetcher('/enrollments/my-trainings'),
  });

  const completeTraining = useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetcher(`/enrollments/complete/${id}`, {
        method: 'POST',
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-trainings'] });
    },
  });

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500 text-lg">{t('loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t('myTrainings')}
          </h1>

          {/* Query Error */}
          {isQueryError && (
            <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <span className="text-red-400 mr-2">⚠️</span>
                <div>
                  <h3 className="text-sm font-medium text-red-800">{t('errorLoadingTrainings')}</h3>
                  <p className="mt-1 text-sm text-red-700">{queryError?.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mutation Error */}
          {completeTraining.isError && (
            <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <span className="text-red-400 mr-2">❌</span>
                <div>
                  <h3 className="text-sm font-medium text-red-800">{t('errorCompletingTraining')}</h3>
                  <p className="mt-1 text-sm text-red-700">{completeTraining.error?.message}</p>
                </div>
              </div>
            </div>
          )}

          {enrollments?.length === 0 ? (
            <div className="text-gray-500">{t('noTrainings')}</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrollments?.map((enrollment) => (
                <div
                  key={enrollment._id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {enrollment.trainingId?.title}
                    </h3>

                    <div className="mt-2 text-sm text-gray-500">
                      <p>{enrollment.trainingId?.description}</p>
                    </div>

                    <div className="mt-3 text-sm text-gray-500">
                      <p>
                        {t('dueDate')}: {enrollment.trainingId?.date ? new Date(enrollment.trainingId.date).toLocaleDateString() : '—'}
                      </p>

                      <p>
                        {t('status')}:{' '}
                        <span
                          className={
                            enrollment.status === 'completed'
                              ? 'text-green-600 font-bold'
                              : 'text-yellow-600 font-bold'
                          }
                        >
                          {t(enrollment.status)}
                        </span>
                      </p>
                    </div>

                    <div className="mt-5">
                      {enrollment.status !== 'completed' ? (
                        <button
                          onClick={() =>
                            completeTraining.mutate(enrollment._id)
                          }
                          disabled={completeTraining.isPending}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {completeTraining.isPending
                            ? t('loading')
                            : t('complete')}
                        </button>
                      ) : (
                        <span className="text-green-600 font-medium">
                          ✓ {t('completed')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}