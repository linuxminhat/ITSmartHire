import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Spinner from '@/components/Spinner';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRoleName = user?.role?.name;
  
  if (!userRoleName || !allowedRoles.includes(userRoleName)) { 
    return <Navigate to="/login" state={{ message: "Bạn không có quyền truy cập trang này." }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;