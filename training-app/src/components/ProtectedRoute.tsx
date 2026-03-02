import { Navigate, Outlet } from 'react-router-dom';
import type { User } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  let user: Partial<User> = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role ?? '')) {
    return <Navigate to="/" replace />; // Redirect to home or unauthorized page
  }

  return <Outlet />;
}
