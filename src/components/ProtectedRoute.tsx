import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading, isAuthenticated } = useFirebaseAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    toast.error('Please log in to access this page');
    return <Navigate to="/login" replace />;
  }

  // Check role requirements if specified
  if (requiredRole && user.role !== requiredRole) {
    toast.error('You do not have permission to access this page');
    // Redirect based on user role
    switch (user.role) {
      case 'student':
        return <Navigate to="/student" replace />;
      case 'institution_admin':
        return <Navigate to="/dashboard" replace />;
      case 'platform_admin':
        return <Navigate to="/admin" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;