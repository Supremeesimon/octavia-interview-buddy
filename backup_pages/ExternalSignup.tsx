import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Mail, User, Chrome } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import type { SignupRequest } from '@/types';

const ExternalSignup = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, isLoading } = useFirebaseAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    yearOfStudy: ''
  });

  const validateForm = (): boolean => {
    if (!form.fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: 'student', // External users are students by default
        department: form.department,
        yearOfStudy: form.yearOfStudy
      });
      
      navigate('/student');
      toast.success(`Welcome ${result.user.name}! Please check your email to verify your account.`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await loginWithGoogle();
      
      // Navigate based on user role
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
      
      toast.success(`Welcome ${result.user.name}!`);
    } catch (error: any) {
      toast.error(error.message || 'Google sign in failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-24 px-4 mt-16">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-lg rounded-xl">
            <div className="text-center mb-8">
              <User className="h-12 w-12 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">Join Octavia</h1>
              <p className="text-muted-foreground">Create your account as an external student</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={form.fullName}
                  onChange={(e) => setForm({...form, fullName: e.target.value})}
                  required
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  required
                  placeholder="your.name@email.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  required
                  placeholder="Create a secure password"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  required
                  placeholder="Confirm your password"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="department">Department (Optional)</Label>
                <Input
                  id="department"
                  value={form.department}
                  onChange={(e) => setForm({...form, department: e.target.value})}
                  placeholder="Enter your department"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="yearOfStudy">Year of Study (Optional)</Label>
                <select
                  id="yearOfStudy"
                  value={form.yearOfStudy}
                  onChange={(e) => setForm({...form, yearOfStudy: e.target.value})}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Year (Optional)</option>
                  {Array.from({ length: 50 }, (_, i) => 2001 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Sign Up"}
              </Button>
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
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              <Chrome className="h-4 w-4 mr-2" />
              Sign up with Google
            </Button>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ExternalSignup;