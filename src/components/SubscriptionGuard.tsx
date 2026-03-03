import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, Briefcase, Brain, AlertCircle } from 'lucide-react';
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

const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  
  useEffect(() => {
    let i = 0;
    setDisplayText(''); // Reset text when prop changes
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText((prev) => text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 20);
    
    return () => clearInterval(timer);
  }, [text]);

  return <span className="ml-2 font-mono text-sm">{displayText}</span>;
};

const AIArtisticAnimation = () => {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8 flex items-center justify-center">
      {/* Central Pulsating AI Core */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.7, 0.3],
          boxShadow: [
            "0 0 20px rgba(var(--primary), 0.2)",
            "0 0 50px rgba(var(--primary), 0.6)",
            "0 0 20px rgba(var(--primary), 0.2)",
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center z-10"
      >
        <Brain className="w-8 h-8 text-primary" />
      </motion.div>

      {/* Orbiting Interview Elements */}
      {[
        { Icon: Mic, delay: 0 },
        { Icon: MessageSquare, delay: 0.75 },
        { Icon: Briefcase, delay: 1.5 },
        { Icon: AlertCircle, delay: 2.25 }
      ].map((item, idx) => (
        <motion.div
          key={idx}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
            delay: -item.delay
          }}
          className="absolute w-full h-full flex items-start justify-center"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
            className="p-1.5 bg-background border rounded-full shadow-sm"
          >
            <item.Icon className="w-4 h-4 text-primary" />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useFirebaseAuth();
  const [hasCheckedSubscription, setHasCheckedSubscription] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isManagingSubscription, setIsManagingSubscription] = useState(false);
  const navigate = useNavigate();

  const handleManageSubscription = async () => {
    try {
      setIsManagingSubscription(true);
      const response = await apiClient.post('/stripe/create-portal-session', {
        returnUrl: window.location.href
      });
      if (response.data.success) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to open subscription portal');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      toast.error('Failed to open subscription portal. Please try again later.');
    } finally {
      setIsManagingSubscription(false);
    }
  };

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <TypewriterText text="Authenticating..." />
      </div>
    );
  }

  // If user is not authenticated, show a message and redirect
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <CardHeader className="text-center">
            <AIArtisticAnimation />
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
                className="w-full flex items-center justify-center gap-2"
              >
                <img 
                  src="/images/octavia-logo.jpg" 
                  alt="Octavia Logo" 
                  className="w-5 h-5 rounded-full object-cover"
                />
                Begin 14 Days Free Trial
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
            <AIArtisticAnimation />
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
                variant="secondary" 
                onClick={handleManageSubscription}
                disabled={isManagingSubscription} 
                className="w-full"
              >
                {isManagingSubscription ? 'Opening Portal...' : 'Manage Account'}
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