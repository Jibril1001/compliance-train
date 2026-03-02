import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { fetcher } from '../api';
import Navbar from '../components/Navbar';

/* =======================
   Types
======================= */

type Employee = {
  _id: string;
  name?: string;
  email: string;
  role: string;
};

type Training = {
  _id: string;
  title: string;
  description: string;
  date: string;
};

type PerTrainingStat = {
  trainingId: string;
  title: string;
  enrolled: number;
  completed: number;
  completionRate: number;
};

type Summary = {
  totalEnrolled: number;
  totalCompleted: number;
  completionRate: number;
  perTraining: PerTrainingStat[];
};

/* =======================
   Schemas
======================= */

const employeeSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

const trainingSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  date: z.string().min(1).refine(
    (val) => new Date(val) >= new Date(new Date().toDateString()),
    { message: 'Date must be today or in the future' }
  ),
});

const enrollmentSchema = z.object({
  userId: z.string().min(1),
  trainingId: z.string().min(1),
});

type EmployeeForm = z.infer<typeof employeeSchema>;
type TrainingForm = z.infer<typeof trainingSchema>;
type EnrollmentForm = z.infer<typeof enrollmentSchema>;

/* =======================
   Component
======================= */

export default function AdminDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'employees' | 'trainings' | 'summary'>('employees');

  /* =======================
     Queries
  ======================= */

  const { data: employees, error: employeesError, isError: isEmployeesError } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => fetcher('/employees'),
  });

  const { data: trainings, error: trainingsError, isError: isTrainingsError } = useQuery<Training[]>({
    queryKey: ['trainings'],
    queryFn: () => fetcher('/trainings'),
  });

  const { data: summary, error: summaryError, isError: isSummaryError } = useQuery<Summary>({
    queryKey: ['summary'],
    queryFn: () => fetcher('/enrollments/summary'),
  });

  /* =======================
     Mutations
  ======================= */

  const createEmployee = useMutation<void, Error, EmployeeForm>({
    mutationFn: (data) =>
      fetcher('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const createTraining = useMutation<void, Error, TrainingForm>({
    mutationFn: (data) =>
      fetcher('/trainings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
    },
  });

  const deleteTraining = useMutation<void, Error, string>({
    mutationFn: (id) =>
      fetcher(`/trainings/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const enrollEmployee = useMutation<void, Error, EnrollmentForm>({
    mutationFn: (data) =>
      fetcher('/enrollments/enroll', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  /* =======================
     Forms
  ======================= */

  const {
    register: registerEmployee,
    handleSubmit: handleSubmitEmployee,
    reset: resetEmployee,
    formState: { errors: employeeErrors },
  } = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  const {
    register: registerTraining,
    handleSubmit: handleSubmitTraining,
    reset: resetTraining,
    formState: { errors: trainingErrors },
  } = useForm<TrainingForm>({
    resolver: zodResolver(trainingSchema),
  });

  const {
    register: registerEnrollment,
    handleSubmit: handleSubmitEnrollment,
    reset: resetEnrollment,
  } = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
  });

  const onEmployeeSubmit = (data: EmployeeForm) => {
    createEmployee.mutate(data);
    resetEmployee();
  };

  const onTrainingSubmit = (data: TrainingForm) => {
    createTraining.mutate(data);
    resetTraining();
  };

  const onEnrollmentSubmit = (data: EnrollmentForm) => {
    enrollEmployee.mutate(data);
    resetEnrollment();
  };

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Tabs */}
          <div className="flex space-x-4 mb-6">
            {(['employees', 'trainings', 'summary'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md ${activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {t(tab)}
              </button>
            ))}
          </div>

          {/* ===================== Employees Tab ===================== */}
          {activeTab === 'employees' && (
            <div className="bg-white shadow rounded-lg p-6">
              {/* Query Error */}
              {isEmployeesError && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <span className="text-red-400 mr-2">⚠️</span>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">{t('errorLoadingEmployees')}</h3>
                      <p className="mt-1 text-sm text-red-700">{employeesError?.message}</p>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-medium mb-4">
                {t('inviteEmployee')}
              </h3>

              <form
                onSubmit={handleSubmitEmployee(onEmployeeSubmit)}
                className="space-y-4 mb-8"
              >
                <input
                  {...registerEmployee('name')}
                  placeholder={t('name')}
                  className="border p-2 rounded w-full"
                />
                <div>
                  <input
                    {...registerEmployee('email')}
                    placeholder={t('email')}
                    className="border p-2 rounded w-full"
                  />
                  {employeeErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{employeeErrors.email.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...registerEmployee('password')}
                    type="password"
                    placeholder={t('password')}
                    className="border p-2 rounded w-full"
                  />
                  {employeeErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{employeeErrors.password.message}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={createEmployee.isPending}
                  className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-indigo-700"
                >
                  {t('create')}
                </button>

                {/* Mutation Error */}
                {createEmployee.isError && (
                  <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-3">
                    <p className="text-sm text-red-700">❌ {createEmployee.error?.message || t('errorCreatingEmployee')}</p>
                  </div>
                )}
                {createEmployee.isSuccess && (
                  <div className="mt-3 rounded-md bg-green-50 border border-green-200 p-3">
                    <p className="text-sm text-green-700">✓ {t('employeeCreated')}</p>
                  </div>
                )}
              </form>

              {/* Employee data table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('name')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('email')}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('role')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees?.map(emp => (
                      <tr key={emp._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.name || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emp.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t(emp.role)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== Trainings Tab ===================== */}
          {activeTab === 'trainings' && (
            <div className="space-y-6">
              {/* Query Error */}
              {isTrainingsError && (
                <div className="rounded-md bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <span className="text-red-400 mr-2">⚠️</span>
                    <div>
                      <h3 className="text-sm font-medium text-red-800">{t('errorLoadingTrainings')}</h3>
                      <p className="mt-1 text-sm text-red-700">{trainingsError?.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Create Training Form */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">
                  {t('createTraining')}
                </h3>

                <form
                  onSubmit={handleSubmitTraining(onTrainingSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <input
                      {...registerTraining('title')}
                      placeholder={t('title')}
                      className="border p-2 rounded w-full"
                    />
                    {trainingErrors.title && (
                      <p className="text-red-500 text-xs mt-1">{trainingErrors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      {...registerTraining('description')}
                      placeholder={t('description')}
                      className="border p-2 rounded w-full"
                    />
                    {trainingErrors.description && (
                      <p className="text-red-500 text-xs mt-1">{trainingErrors.description.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      {...registerTraining('date')}
                      type="date"
                      className="border p-2 rounded w-full"
                    />
                    {trainingErrors.date && (
                      <p className="text-red-500 text-xs mt-1">{trainingErrors.date.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={createTraining.isPending}
                    className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-indigo-700"
                  >
                    {t('create')}
                  </button>

                  {createTraining.isError && (
                    <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-3">
                      <p className="text-sm text-red-700">❌ {createTraining.error?.message || t('errorCreatingTraining')}</p>
                    </div>
                  )}
                  {createTraining.isSuccess && (
                    <div className="mt-3 rounded-md bg-green-50 border border-green-200 p-3">
                      <p className="text-sm text-green-700">✓ {t('trainingCreated')}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Enroll Employee Form */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">
                  {t('enrollEmployee')}
                </h3>

                <form
                  onSubmit={handleSubmitEnrollment(onEnrollmentSubmit)}
                  className="space-y-4"
                >
                  <select
                    {...registerEnrollment('userId')}
                    className="border p-2 rounded w-full"
                    defaultValue=""
                  >
                    <option value="" disabled>{t('selectEmployee')}</option>
                    {employees?.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name ? `${emp.name} (${emp.email})` : emp.email}
                      </option>
                    ))}
                  </select>

                  <select
                    {...registerEnrollment('trainingId')}
                    className="border p-2 rounded w-full"
                    defaultValue=""
                  >
                    <option value="" disabled>{t('selectTraining')}</option>
                    {trainings?.map(tr => (
                      <option key={tr._id} value={tr._id}>
                        {tr.title}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={enrollEmployee.isPending}
                    className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50 hover:bg-green-700"
                  >
                    {t('enroll')}
                  </button>

                  {enrollEmployee.isError && (
                    <div className="mt-3 rounded-md bg-red-50 border border-red-200 p-3">
                      <p className="text-sm text-red-700">❌ {enrollEmployee.error?.message || t('errorEnrolling')}</p>
                    </div>
                  )}
                  {enrollEmployee.isSuccess && (
                    <div className="mt-3 rounded-md bg-green-50 border border-green-200 p-3">
                      <p className="text-sm text-green-700">✓ {t('enrollmentSuccess')}</p>
                    </div>
                  )}
                </form>
              </div>

              {/* Training List */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">{t('trainings')}</h3>
                <ul className="divide-y divide-gray-200">
                  {trainings?.map(tr => (
                    <li key={tr._id} className="py-4 flex justify-between items-start">
                      <div>
                        <div className="font-bold">{tr.title}</div>
                        <div className="text-sm text-gray-500">{tr.description}</div>
                        <div className="text-sm text-gray-500">
                          {t('dueDate')}: {new Date(tr.date).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTraining.mutate(tr._id)}
                        disabled={deleteTraining.isPending}
                        className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        {t('delete')}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ===================== Summary Tab ===================== */}
          {activeTab === 'summary' && isSummaryError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <div className="flex">
                <span className="text-red-400 mr-2">⚠️</span>
                <div>
                  <h3 className="text-sm font-medium text-red-800">{t('errorLoadingSummary')}</h3>
                  <p className="mt-1 text-sm text-red-700">{summaryError?.message}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'summary' && summary && (
            <div className="space-y-6">
              {/* Overall Stats */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">
                  {t('summary')}
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <Stat value={summary.totalEnrolled} label={t('totalEnrolled')} />
                  <Stat value={summary.totalCompleted} label={t('totalCompleted')} />
                  <Stat value={`${summary.completionRate.toFixed(1)}%`} label={t('completionRate')} />
                </div>
              </div>

              {/* Per-Training Breakdown */}
              {summary.perTraining && summary.perTraining.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">{t('perTraining')}</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('title')}</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('totalEnrolled')}</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('totalCompleted')}</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('completionRate')}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {summary.perTraining.map(stat => (
                          <tr key={stat.trainingId}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.enrolled}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.completed}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.completionRate.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* Small helper component */
function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-gray-500">{label}</div>
    </div>
  );
}