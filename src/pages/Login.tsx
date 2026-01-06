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

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, isLoading } = useFirebaseAuth();
  const navigate = useNavigate();
  
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await login(email, password);
      
      // Navigate based on user role
      switch (result.user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'teacher':
          navigate('/teacher-dashboard');
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
      
      // Navigate based on user role
      switch (result.user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'teacher':
          navigate('/teacher-dashboard');
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
              <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>
            
            {/* Info box for Google account users */}
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertDescription>
                <strong>Note:</strong> If you signed up with Google, please use the "Sign in with Google" button below.
              </AlertDescription>
            </Alert>
            
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
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <Chrome className="h-4 w-4 mr-2" />
              Sign in with Google
            </Button>
            
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