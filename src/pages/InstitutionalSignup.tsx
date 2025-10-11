import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Mail, GraduationCap } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import type { SignupRequest } from '@/types';

const InstitutionalSignup = () => {
  const { institutionId } = useParams();
  const navigate = useNavigate();
  const { register, isLoading } = useFirebaseAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // In a real implementation, you would fetch institution details from the backend
  const institutionName = institutionId ? `Institution ${institutionId}` : 'Unknown Institution';

  useEffect(() => {
    // Validate institution ID
    if (!institutionId) {
      toast.error("Invalid signup link");
      navigate("/signup");
    }
  }, [institutionId, navigate]);

  const validateEducationalEmail = (email: string): boolean => {
    return email.endsWith('.edu') || email.includes('.edu.');
  };

  const validateForm = (): boolean => {
    if (!form.fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    if (!form.email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }

    if (!validateEducationalEmail(form.email)) {
      toast.error("Please use a valid educational email address (.edu)");
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
        institutionDomain: form.email.split('@')[1],
        role: 'student' // Students signing up through institutional links are students
      });
      
      navigate('/student');
      toast.success(`Welcome ${result.user.name}! Please check your email to verify your account.`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-24 px-4 mt-16">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-lg rounded-xl">
            <div className="text-center mb-8">
              <GraduationCap className="h-12 w-12 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">Join {institutionName}</h1>
              <p className="text-muted-foreground">Create your student account</p>
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
                  placeholder="your.name@university.edu"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Please use your institutional email (.edu domain)
                </p>
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Sign Up"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{' '}
                <a href="/login" className="text-primary hover:underline">
                  Sign in
                </a>
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstitutionalSignup;