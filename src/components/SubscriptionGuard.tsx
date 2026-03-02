import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionExpiresAt?: string;
}

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useFirebaseAuth();
  const [hasCheckedSubscription, setHasCheckedSubscription] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      if (isLoading || !isAuthenticated) {
        setLoading(true);
        return;
      }

      // If user is not authenticated, redirect to login
      if (!user) {
        setLoading(false);
        setHasCheckedSubscription(true);
        setIsAllowed(false);
        return;
      }

      // Allow institutional users (students with institutions) to access
      if (user.institutionId) {
        setIsAllowed(true);
        setLoading(false);
        setHasCheckedSubscription(true);
        return;
      }

      // Check if the user already has subscription info in their profile
      if (typeof user.hasActiveSubscription !== 'undefined') {
        if (user.hasActiveSubscription) {
          setIsAllowed(true);
        } else {
          // Redirect external users without active subscriptions to the subscription page
          toast.info('Please subscribe to access premium features like interviews.');
          navigate('/subscribe');
        }
        setLoading(false);
        setHasCheckedSubscription(true);
        return;
      }

      try {
        // For external users without subscription info in profile, check via API
        const response = await apiClient.get('/users/me');
        const userData = response.data.data;

        if (userData.hasActiveSubscription) {
          setIsAllowed(true);
        } else {
          // Redirect external users without active subscriptions to the subscription page
          toast.info('Please subscribe to access premium features like interviews.');
          navigate('/subscribe');
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
        // If API call fails, allow access but show a warning
        toast.warning('Could not verify subscription status. Please refresh if you encounter issues.');
        setIsAllowed(true);
      } finally {
        setLoading(false);
        setHasCheckedSubscription(true);
      }
    };

    // Use a timeout to prevent indefinite loading
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('Subscription check timed out, allowing access');
        setLoading(false);
        setHasCheckedSubscription(true);
        setIsAllowed(true);
      }
    }, 5000); // 5 second timeout

    checkSubscription();
    
    return () => clearTimeout(timer);
  }, [user, isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication and subscription
  if (loading || !hasCheckedSubscription) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Checking subscription status...</span>
      </div>
    );
  }

  // If user is not authenticated, show a message and redirect
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Access Restricted</CardTitle>
            <CardDescription>Please log in to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              You need to be logged in to access this feature.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full"
              >
                Log In
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/subscribe')} 
                className="w-full"
              >
                Subscribe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is authenticated but doesn't have access (no subscription), show subscription prompt
  if (!isAllowed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Subscribe to Continue</CardTitle>
            <CardDescription>Unlock premium features with our subscription plans</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              You need an active subscription to access premium features like the interview simulator.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => navigate('/subscribe')} 
                className="w-full bg-primary hover:bg-primary/90"
              >
                View Subscription Plans
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/student')} 
                className="w-full"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is authenticated and has access, render the children
  return <>{children}</>;
};

export default SubscriptionGuard;