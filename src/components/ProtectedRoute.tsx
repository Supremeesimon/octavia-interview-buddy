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
  
  console.log('ProtectedRoute check:', { user, isLoading, isAuthenticated, requiredRole });

  // Show loading state while checking auth
  if (isLoading) {
    console.log('ProtectedRoute: Still loading auth state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Handle authentication errors
  if (!isAuthenticated && !isLoading) {
    console.log('ProtectedRoute: User not authenticated');
    toast.error('Please log in to access this page');
    return <Navigate to="/login" replace />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('ProtectedRoute: No user found');
    toast.error('Please log in to access this page');
    return <Navigate to="/login" replace />;
  }

  // Check role requirements if specified
  if (requiredRole && user.role !== requiredRole) {
    console.log('ProtectedRoute: User role mismatch', { userRole: user.role, requiredRole });
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

  console.log('ProtectedRoute: User authorized, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;