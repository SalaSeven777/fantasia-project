import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { UserRole } from '../../types';
import { getDefaultRouteForRole } from '../../utils/auth';
import { checkAuth } from '../../store/slices/authSlice';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    // Redirect to default page based on user role
    const defaultRoute = getDefaultRouteForRole(user?.role || 'CL');
    return <Navigate to={defaultRoute} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard; 