import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { toast } from 'sonner';
import type { UserRole } from '@/types';
// import { useAccountSwitcher } from "@/hooks/use-account-switcher"; // Removed

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, isLoading, isAuthenticated, isAccountSwitching } = useFirebaseAuth();
  // const { isSwitching } = useAccountSwitcher(); // Removed
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  console.log('ProtectedRoute check:', { user, isLoading, isAuthenticated, requiredRole, isAccountSwitching });

  // Use a much shorter delay or no delay if we already have a user
  useEffect(() => {
    // If we have user data, we can stop checking immediately
    if (user && isAuthenticated) {
      setIsCheckingAuth(false);
    } 
    // If we're not loading anymore but have no user, we should also stop checking
    else if (!isLoading && !user) {
      setIsCheckingAuth(false);
    }
    // Otherwise, use a small timeout to allow state to settle
    else {
      const timer = setTimeout(() => {
        setIsCheckingAuth(false);
      }, 50); 
      return () => clearTimeout(timer);
    }
  }, [user, isAuthenticated, isLoading]);

  // Show loading state while checking auth
  if (isLoading || isCheckingAuth) {
    // Only show loading spinner if it takes longer than 200ms
    // This prevents flickering for fast loads
    return (
      <div className="flex items-center justify-center min-h-screen opacity-0 animate-in fade-in duration-300 delay-200 fill-mode-forwards">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (!isAuthenticated && !isLoading) {
    console.log('ProtectedRoute: User not authenticated');
    // Only show toast if we're not on the login page already
    if (window.location.pathname !== '/login') {
      toast.error('Please log in to access this page');
    }
    return <Navigate to="/login" replace />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('ProtectedRoute: No user found');
    // Only show toast if we're not on the login page already
    if (window.location.pathname !== '/login') {
      toast.error('Please log in to access this page');
    }
    return <Navigate to="/login" replace />;
  }

  // Check role requirements if specified
  if (requiredRole && user?.role !== requiredRole) {
    console.log('ProtectedRoute: User role mismatch', { userRole: user?.role, requiredRole });
    toast.error('You do not have permission to access this page');
    // Redirect based on user role
    switch (user?.role) {
      case 'student':
        return <Navigate to="/student" replace />;
      case 'teacher':
        return <Navigate to="/teacher-dashboard" replace />;
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