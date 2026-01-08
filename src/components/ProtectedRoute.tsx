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
  const { isSwitching } = useAccountSwitcher(); // Add account switcher state
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  console.log('ProtectedRoute check:', { user, isLoading, isAuthenticated, requiredRole, isSwitching, isAccountSwitching });

  // Add a small delay to prevent immediate re-evaluation during account switching
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 100); // Small delay to allow state to settle

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking auth
  if (isLoading || isCheckingAuth) {
    console.log('ProtectedRoute: Still loading auth state');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading authentication...</span>
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
  // Skip role check if an account switch is in progress to avoid premature redirects
  if (requiredRole && user?.role !== requiredRole && !isSwitching && !isAccountSwitching) {
    console.log('ProtectedRoute: User role mismatch', { userRole: user?.role, requiredRole, isSwitching, isAccountSwitching });
    // Only show permission error if we're not in the middle of an account switch
    if (!isSwitching && !isAccountSwitching) {
      toast.error('You do not have permission to access this page');
    }
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
  
  // If an account switch is in progress, show loading state instead of redirecting
  if (requiredRole && user?.role !== requiredRole && (isSwitching || isAccountSwitching)) {
    console.log('ProtectedRoute: Account switch in progress, showing loading');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Switching account...</span>
      </div>
    );
  }

  console.log('ProtectedRoute: User authorized, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;