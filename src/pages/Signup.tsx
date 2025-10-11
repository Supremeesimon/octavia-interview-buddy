import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { Mail, GraduationCap, Users, Shield, Chrome } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import type { SignupRequest } from '@/types';

const Signup = () => {
  const [activeTab, setActiveTab] = useState('student');
  const navigate = useNavigate();
  const { register, loginWithGoogle, isLoading } = useFirebaseAuth();

  // Student form state
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  // Teacher/Institution Admin form state
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  // Platform Admin form state
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const validateEducationalEmail = (email: string): boolean => {
    return email.endsWith('.edu') || email.includes('.edu.');
  };

  const validateGenericEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isPersonalEmail = (email: string): boolean => {
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return personalDomains.includes(domain);
  };
  
  const handleStudentSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEducationalEmail(studentForm.email)) {
      toast.error("Please use a valid educational email address (.edu)");
      return;
    }

    if (isPersonalEmail(studentForm.email)) {
      toast.error("Personal emails (Gmail, Yahoo, etc.) are not permitted for student accounts");
      return;
    }

    try {
      const result = await register({
        name: studentForm.fullName,
        email: studentForm.email,
        password: studentForm.password,
        institutionDomain: studentForm.email.split('@')[1]
      });
      
      navigate('/student');
      toast.success(`Welcome ${result.user.name}! Please check your email to verify your account.`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleTeacherSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateGenericEmail(teacherForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      // For teacher signup, we need to pass additional data to indicate the role
      const result = await register({
        name: teacherForm.fullName,
        email: teacherForm.email,
        password: teacherForm.password,
        role: 'institution_admin' // Teachers are institution admins in our system
      });
      
      // For now, we'll navigate to dashboard, but we should enhance this to properly handle teacher roles
      navigate('/dashboard');
      toast.success(`Welcome ${result.user.name}! Please check your email to verify your account.`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleAdminSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateGenericEmail(adminForm.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      // For admin signup, we need to pass additional data to indicate the role
      const result = await register({
        name: adminForm.fullName,
        email: adminForm.email,
        password: adminForm.password,
        role: 'platform_admin' // Platform admin role
      });
      
      // Navigate based on the actual role assigned by Firebase
      switch (result.user.role) {
        case 'platform_admin':
          navigate('/admin');
          break;
        case 'institution_admin':
          navigate('/dashboard');
          break;
        default:
          navigate('/');
      }
      
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
              <h1 className="text-2xl font-bold mb-2">Join Octavia</h1>
              <p className="text-muted-foreground">Create your account to get started</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="hidden sm:inline">Student</span>
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Teacher</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </TabsTrigger>
              </TabsList>

              {/* Student Registration */}
              <TabsContent value="student" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Student Registration</h2>
                  <p className="text-sm text-muted-foreground">Sign up with your educational email</p>
                </div>

                <form onSubmit={handleStudentSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="student-name">Full Name</Label>
                    <Input
                      id="student-name"
                      value={studentForm.fullName}
                      onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})}
                      required
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      value={studentForm.email}
                      onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                      required
                      placeholder="your.name@university.edu"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Please use your institutional email. Personal emails (e.g., Gmail, Yahoo) are not permitted for student accounts.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      value={studentForm.password}
                      onChange={(e) => setStudentForm({...studentForm, password: e.target.value})}
                      required
                      placeholder="Create a secure password"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Sign Up as Student"}
                  </Button>
                </form>

                <div className="relative">
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

                <p className="text-xs text-center text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="underline hover:text-primary">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
                </p>
              </TabsContent>

              {/* Teacher Registration */}
              <TabsContent value="teacher" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Teacher Registration</h2>
                  <p className="text-sm text-muted-foreground">Sign up to manage your students</p>
                </div>

                <form onSubmit={handleTeacherSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="teacher-name">Full Name</Label>
                    <Input
                      id="teacher-name"
                      value={teacherForm.fullName}
                      onChange={(e) => setTeacherForm({...teacherForm, fullName: e.target.value})}
                      required
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="teacher-email">Email</Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                      required
                      placeholder="your.name@email.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="teacher-password">Password</Label>
                    <Input
                      id="teacher-password"
                      type="password"
                      value={teacherForm.password}
                      onChange={(e) => setTeacherForm({...teacherForm, password: e.target.value})}
                      required
                      placeholder="Create a secure password"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Sign Up as Teacher"}
                  </Button>
                </form>

                <div className="relative">
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

                <p className="text-xs text-center text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="underline hover:text-primary">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
                </p>
              </TabsContent>

              {/* Admin Registration */}
              <TabsContent value="admin" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Admin Registration</h2>
                  <p className="text-sm text-muted-foreground">Sign up to manage the institution</p>
                </div>

                <form onSubmit={handleAdminSignup} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-name">Full Name</Label>
                    <Input
                      id="admin-name"
                      value={adminForm.fullName}
                      onChange={(e) => setAdminForm({...adminForm, fullName: e.target.value})}
                      required
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={adminForm.email}
                      onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                      required
                      placeholder="your.name@email.com"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={adminForm.password}
                      onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                      required
                      placeholder="Create a secure password"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Sign Up as Admin"}
                  </Button>
                </form>

                <div className="relative">
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

                <p className="text-xs text-center text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="underline hover:text-primary">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="underline hover:text-primary">Privacy Policy</Link>
                </p>
              </TabsContent>
            </Tabs>

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

export default Signup;