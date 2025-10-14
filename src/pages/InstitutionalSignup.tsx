import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from "sonner";
import { Mail, GraduationCap, Users, Shield, Chrome } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';
import EnhancedDepartmentSelector from '@/components/EnhancedDepartmentSelector';
import type { SignupRequest } from '@/types';

const InstitutionalSignup = () => {
  const { institutionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, loginWithGoogle, isLoading } = useFirebaseAuth();
  const [activeTab, setActiveTab] = useState('student');
  
  // Form states for different user types
  const [studentForm, setStudentForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    yearOfStudy: ''
  });
  
  const [teacherForm, setTeacherForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    experience: ''
  });
  
  const [adminForm, setAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Department management (no longer used as EnhancedDepartmentSelector handles its own state)
  
  const userType = searchParams.get('type') || 'student';
  const [institutionName, setInstitutionName] = useState('Unknown Institution');
  // Get token from query parameters first, then from path parameters if query param is empty
  const customSignupToken = searchParams.get('token') || institutionId || '';
  
  // Debug logging
  console.log('URL Parameters:', {
    institutionId,
    institutionName,
    userType,
    customSignupToken,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  // Fetch institution name when component mounts
  useEffect(() => {
    const fetchInstitutionName = async () => {
      if (customSignupToken) {
        try {
          // First, try to get institution by token (for custom signup links)
          const institution = await InstitutionHierarchyService.getInstitutionByToken(customSignupToken);
          if (institution) {
            setInstitutionName(institution.name);
            return;
          }
          
          // If that fails, try to find a processed institution interest by token
          // This handles cases where the signup link was generated from an interest request
          const { collection, query, where, getDocs } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          
          const interestsRef = collection(db, 'institution_interests');
          const interestsQuery = query(
            interestsRef,
            where('customSignupToken', '==', customSignupToken),
            where('status', '==', 'processed')
          );
          
          const interestsSnapshot = await getDocs(interestsQuery);
          if (!interestsSnapshot.empty) {
            const interestData = interestsSnapshot.docs[0].data();
            if (interestData.institutionName) {
              setInstitutionName(interestData.institutionName);
              return;
            }
          }
          
          // If that fails, try to find institution by name in query params
          const institutionNameFromParams = searchParams.get('institution');
          if (institutionNameFromParams) {
            setInstitutionName(institutionNameFromParams);
            return;
          }
          
          // As a last resort, try to find the institution by querying the database with the token
          // This handles cases where the token might be stored differently
          const q = query(
            collection(db, 'institutions'),
            where('customSignupToken', '==', customSignupToken)
          );
          
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const institutionDoc = querySnapshot.docs[0];
            const institutionData = institutionDoc.data();
            if (institutionData.name) {
              setInstitutionName(institutionData.name);
              return;
            }
          }
          
          // Try to find by ID if the token is actually an institution ID
          try {
            const institutionById = await InstitutionHierarchyService.getInstitutionById(customSignupToken);
            if (institutionById) {
              setInstitutionName(institutionById.name);
              return;
            }
          } catch (error) {
            console.error('Error fetching institution by ID:', error);
          }
          
          // If all methods fail, show a more informative message
          setInstitutionName('Unknown Institution');
        } catch (error) {
          console.error('Error fetching institution by token:', error);
          // Even on error, ensure we have a clean state
          setInstitutionName('Unknown Institution');
        }
      } else {
        // No token provided, show a generic message
        setInstitutionName('Unknown Institution');
      }
    };

    fetchInstitutionName();
  }, [customSignupToken, institutionId, searchParams]);

  // Validate institution ID or name
  useEffect(() => {
    // Only show error if we don't have any way to identify the institution
    // and we're not on a generic signup page
    if (!institutionId && !institutionName && !customSignupToken) {
      toast.error("Invalid signup link");
      navigate("/signup");
    }
    
    // Set the active tab based on user type from URL
    if (userType) {
      setActiveTab(userType);
    }
  }, [institutionId, institutionName, userType, customSignupToken, navigate]);

  const validateEducationalEmail = (email: string): boolean => {
    // For now, allow any email domain for institutional signup
    // In a real implementation, you might want to validate against the institution's domain
    return email.includes('@') && email.length > 5;
  };

  const validateForm = (formType: string, formData: any): boolean => {
    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      return false;
    }

    // Remove the educational email restriction for now
    // if (formType !== 'admin' && !validateEducationalEmail(formData.email)) {
    //   toast.error("Please use a valid educational email address (.edu)");
    //   return false;
    // }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }

    // For teachers and students, validate that department is provided
    if ((formType === 'teacher' || formType === 'student') && !formData.department.trim()) {
      toast.error("Please select or enter your department");
      return false;
    }

    return true;
  };



  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm('student', studentForm)) {
      return;
    }

    try {
      const result = await register({
        name: studentForm.fullName,
        email: studentForm.email,
        password: studentForm.password,
        institutionDomain: institutionName, // Use institution name from URL params instead of email domain
        role: 'student',
        department: studentForm.department,
        yearOfStudy: studentForm.yearOfStudy
      });
      
      navigate('/student');
      toast.success(`Welcome ${result.user.name}! Please check your email to verify your account.`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm('teacher', teacherForm)) {
      return;
    }

    try {
      const result = await register({
        name: teacherForm.fullName,
        email: teacherForm.email,
        password: teacherForm.password,
        institutionDomain: institutionName, // Use institution name from URL params instead of email domain
        role: 'teacher', // Teachers should have the 'teacher' role
        department: teacherForm.department
        // Note: Teachers don't have yearOfStudy, so we don't pass it
      });
      
      navigate('/dashboard');
      toast.success(`Welcome ${result.user.name}! Please check your email to verify your account.`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm('admin', adminForm)) {
      return;
    }

    try {
      const result = await register({
        name: adminForm.fullName,
        email: adminForm.email,
        password: adminForm.password,
        role: 'institution_admin',
        institutionDomain: institutionName // Use institution name from URL params instead of email domain
      });
      
      navigate('/dashboard');
      toast.success(`Welcome ${result.user.name}! Please check your email to verify your account.`);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const handleGoogleSignup = async () => {
    try {
      console.log('Google signup initiated with context:', {
        institutionName,
        userType: activeTab
      });
      
      const result = await loginWithGoogle({
        institutionName: institutionName,
        userType: activeTab
      });
      
      // Redirect based on user type
      if (activeTab === 'student') {
        navigate('/student');
      } else if (activeTab === 'teacher' || activeTab === 'admin') {
        navigate('/dashboard');
      }
      
      toast.success(`Welcome ${result.user.name}!`);
    } catch (error: any) {
      console.error('Google signup error:', error);
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
              <GraduationCap className="h-12 w-12 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">Join {institutionName}</h1>
              <p className="text-muted-foreground">Create your institutional account</p>
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
                  <p className="text-sm text-muted-foreground">Sign up with your email</p>
                </div>

                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="student-full-name">Full Name</Label>
                    <Input
                      id="student-full-name"
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
                      placeholder="your.name@example.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      You can use any email domain for institutional signup
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="student-department">Department</Label>
                    <EnhancedDepartmentSelector
                      institutionName={institutionName}
                      value={studentForm.department}
                      onChange={(value) => setStudentForm({...studentForm, department: value})}
                      placeholder="Select or type department"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="student-year">Year of Study</Label>
                    <select
                      id="student-year"
                      value={studentForm.yearOfStudy}
                      onChange={(e) => setStudentForm({...studentForm, yearOfStudy: e.target.value})}
                      required
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 50 }, (_, i) => 2001 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
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

                  <div>
                    <Label htmlFor="student-confirm-password">Confirm Password</Label>
                    <Input
                      id="student-confirm-password"
                      type="password"
                      value={studentForm.confirmPassword}
                      onChange={(e) => setStudentForm({...studentForm, confirmPassword: e.target.value})}
                      required
                      placeholder="Confirm your password"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Sign Up as Student"}
                  </Button>
                </form>
              </TabsContent>

              {/* Teacher Registration */}
              <TabsContent value="teacher" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Teacher Registration</h2>
                  <p className="text-sm text-muted-foreground">Sign up to manage your students</p>
                </div>

                <form onSubmit={handleTeacherSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="teacher-full-name">Full Name</Label>
                    <Input
                      id="teacher-full-name"
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
                      placeholder="your.name@example.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      You can use any email domain for institutional signup
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="teacher-department">Department</Label>
                    <EnhancedDepartmentSelector
                      institutionName={institutionName}
                      value={teacherForm.department}
                      onChange={(value) => setTeacherForm({...teacherForm, department: value})}
                      placeholder="Select or type department"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="teacher-experience">Years of Teaching Experience</Label>
                    <select
                      id="teacher-experience"
                      value={teacherForm.experience}
                      onChange={(e) => setTeacherForm({...teacherForm, experience: e.target.value})}
                      required
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 50 }, (_, i) => 2001 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
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

                  <div>
                    <Label htmlFor="teacher-confirm-password">Confirm Password</Label>
                    <Input
                      id="teacher-confirm-password"
                      type="password"
                      value={teacherForm.confirmPassword}
                      onChange={(e) => setTeacherForm({...teacherForm, confirmPassword: e.target.value})}
                      required
                      placeholder="Confirm your password"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Sign Up as Teacher"}
                  </Button>
                </form>
              </TabsContent>

              {/* Admin Registration */}
              <TabsContent value="admin" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold">Admin Registration</h2>
                  <p className="text-sm text-muted-foreground">Sign up to manage the institution</p>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="admin-full-name">Full Name</Label>
                    <Input
                      id="admin-full-name"
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
                      placeholder="your.name@example.com"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      You can use any email domain for institutional signup
                    </p>
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

                  <div>
                    <Label htmlFor="admin-confirm-password">Confirm Password</Label>
                    <Input
                      id="admin-confirm-password"
                      type="password"
                      value={adminForm.confirmPassword}
                      onChange={(e) => setAdminForm({...adminForm, confirmPassword: e.target.value})}
                      required
                      placeholder="Confirm your password"
                      className="mt-1"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Processing..." : "Sign Up as Admin"}
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
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InstitutionalSignup;