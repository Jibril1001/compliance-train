import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { fetcher } from '../api';
import Navbar from '../components/Navbar';


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

type Summary = {
  totalEnrolled: number;
  totalCompleted: number;
  completionRate: number;
};


type Tab = 'employees' | 'trainings' | 'summary';
const tabs: Tab[] = ['employees', 'trainings', 'summary'];

const employeeSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

const trainingSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(5),
  date: z.string().min(1),
});

const enrollmentSchema = z.object({
  userId: z.string().min(1),
  trainingId: z.string().min(1),
});

type EmployeeForm = z.infer<typeof employeeSchema>;
type TrainingForm = z.infer<typeof trainingSchema>;
type EnrollmentForm = z.infer<typeof enrollmentSchema>;

export default function AdminDashboard() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>('employees');

  const employeesQuery = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => fetcher('/employees'),
  });

  const trainingsQuery = useQuery<Training[]>({
    queryKey: ['trainings'],
    queryFn: () => fetcher('/trainings'),
  });

  const summaryQuery = useQuery<Summary>({
    queryKey: ['summary'],
    queryFn: () => fetcher('/enrollments/summary'),
  });


  const createEmployee = useMutation({
    mutationFn: (data: EmployeeForm) =>
      fetcher('/employees', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const createTraining = useMutation({
    mutationFn: (data: TrainingForm) =>
      fetcher('/trainings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trainings'] }),
  });

  const deleteTraining = useMutation({
    mutationFn: (id: string) =>
      fetcher(`/trainings/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
    },
  });

  const enrollEmployee = useMutation({
    mutationFn: (data: EnrollmentForm) =>
      fetcher('/enrollments/enroll', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['summary'] }),
  });

  const employeeForm = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
  });

  const trainingForm = useForm<TrainingForm>({
    resolver: zodResolver(trainingSchema),
  });

  const enrollmentForm = useForm<EnrollmentForm>({
    resolver: zodResolver(enrollmentSchema),
  });

  const onEmployeeSubmit = (data: EmployeeForm) => {
    createEmployee.mutate(data);
    employeeForm.reset();
  };

  const onTrainingSubmit = (data: TrainingForm) => {
    createTraining.mutate(data);
    trainingForm.reset();
  };

  const onEnrollmentSubmit = (data: EnrollmentForm) => {
    enrollEmployee.mutate(data);
    enrollmentForm.reset();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 px-4">

        {/* Tabs */}
        <div className="flex gap-2 bg-white p-2 rounded-xl shadow-sm w-fit mb-8">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t(tab)}
            </button>
          ))}
        </div>

        {/* ================= EMPLOYEES ================= */}
        {activeTab === 'employees' && (
          <div className="space-y-8">

            <div>
              <h2 className="text-2xl font-semibold">Employee Management</h2>
              <p className="text-gray-500 text-sm">Manage your team</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <form
                onSubmit={employeeForm.handleSubmit(onEmployeeSubmit)}
                className="grid md:grid-cols-3 gap-4"
              >
                <input {...employeeForm.register('name')} placeholder="Name" className="input-modern" />
                <input {...employeeForm.register('email')} placeholder="Email" className="input-modern" />
                <input {...employeeForm.register('password')} type="password" placeholder="Password" className="input-modern" />

                <button className="col-span-full bg-indigo-600 text-white py-2 rounded-lg">
                  Create Employee
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {employeesQuery.data?.length ? (
                <table className="w-full">
                  <thead className="bg-gray-50 text-sm text-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employeesQuery.data.map(emp => (
                      <tr key={emp._id} className="border-t hover:bg-gray-50">
                        <td className="px-6 py-4">{emp.name || '—'}</td>
                        <td className="px-6 py-4">{emp.email}</td>
                        <td className="px-6 py-4">{emp.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No employees yet
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= TRAININGS ================= */}
        {activeTab === 'trainings' && (
          <div className="space-y-6">

            <form onSubmit={trainingForm.handleSubmit(onTrainingSubmit)} className="bg-white p-6 rounded-xl shadow-sm space-y-3">
              <input {...trainingForm.register('title')} placeholder="Title" className="input-modern" />
              <input {...trainingForm.register('description')} placeholder="Description" className="input-modern" />
              <input {...trainingForm.register('date')} type="date" className="input-modern" />
              <button className="bg-indigo-600 text-white py-2 rounded-lg">Create Training</button>
            </form>

            <form onSubmit={enrollmentForm.handleSubmit(onEnrollmentSubmit)} className="bg-white p-6 rounded-xl shadow-sm space-y-3">
              <select {...enrollmentForm.register('userId')} className="input-modern">
                <option value="">Select employee</option>
                {employeesQuery.data?.map(e => (
                  <option key={e._id} value={e._id}>{e.email}</option>
                ))}
              </select>

              <select {...enrollmentForm.register('trainingId')} className="input-modern">
                <option value="">Select training</option>
                {trainingsQuery.data?.map(t => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>

              <button className="bg-green-600 text-white py-2 rounded-lg">Enroll</button>
            </form>

            <div className="grid md:grid-cols-2 gap-6">
              {trainingsQuery.data?.map(tr => (
                <div key={tr._id} className="bg-white p-6 rounded-xl shadow-sm">
                  <h4 className="font-semibold">{tr.title}</h4>
                  <p className="text-gray-500 text-sm">{tr.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(tr.date).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => deleteTraining.mutate(tr._id)}
                    className="text-red-500 mt-3 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ================= SUMMARY ================= */}
        {activeTab === 'summary' && summaryQuery.data && (
          <div className="grid md:grid-cols-3 gap-6">

            <StatCard title="Total Enrolled" value={summaryQuery.data.totalEnrolled} />
            <StatCard title="Total Completed" value={summaryQuery.data.totalCompleted} />
            <StatCard title="Completion Rate" value={`${summaryQuery.data.completionRate}%`} />

          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}