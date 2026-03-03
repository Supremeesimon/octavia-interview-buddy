import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Chrome } from "lucide-react";
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAccountSwitcher } from '@/hooks/use-account-switcher';

const Login = () => {
  const [email, setEmail] = useState(localStorage.getItem('remembered_email') || '');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, isLoading } = useFirebaseAuth();
  const { addCurrentAccount } = useAccountSwitcher();
  const navigate = useNavigate();
  
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('remembered_email', email);
    
    try {
      console.log('Starting login process for:', email);
      const result = await login(email, password);
      console.log('Login successful, user role:', result.user.role);
      
      // Navigate based on user role (normal login flow)
      console.log('Normal login flow, navigating to:', result.user.role);
      toast.success(`Welcome back, ${result.user.name}!`);
      
      // Navigate immediately - auth state should be updated by useFirebaseAuth hook
      // Further reduced delay to 50ms for snappy response
      setTimeout(() => {
        switch (result.user.role) {
          case 'student':
            navigate('/student', { replace: true });
            break;
          case 'institution_admin':
            navigate('/dashboard', { replace: true });
            break;
          case 'platform_admin':
            navigate('/admin', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      }, 50);
    } catch (error: any) {
      console.error('Login error:', error);
      // Provide more specific error messages for OAuth users
      if (error.message.includes('wrong password') && email.includes('gmail.com')) {
        toast.error('Accounts created with Google cannot use email/password login. Please use "Sign in with Google" instead.');
      } else {
        toast.error(error.message || 'Login failed');
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      
      // Navigate based on user role (normal login flow)
      switch (result.user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'institution_admin':
          navigate('/dashboard');
          break;
        case 'platform_admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
      
      toast.success(`Welcome back, ${result.user.name}!`);
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-36 px-4 mt-16">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-lg rounded-xl">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <img 
                  src="/images/octavia-logo.jpg" 
                  alt="Octavia Logo" 
                  className="w-16 h-16 rounded-full object-cover shadow-sm"
                />
              </div>
              <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>
            
            {/* Info box for Google account users */}
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription>
                Master the art of conversation with Artificial Intelligence
              </AlertDescription>
            </Alert>
            
            <Button 
              variant="outline" 
              className="w-full mb-6 border-primary text-primary hover:bg-primary/5" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="h-4 w-4 mr-2" />
              Sign in with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or sign in with email</span>
              </div>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="your.name@university.edu" 
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Enter your password" 
                    className="mt-1"
                    autoComplete="current-password"
                  />
                  <div className="flex justify-end mt-2">
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Login;