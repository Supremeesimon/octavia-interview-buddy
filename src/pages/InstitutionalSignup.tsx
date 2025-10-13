import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Mail, GraduationCap } from 'lucide-react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { InstitutionService } from '@/services/institution.service';
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';

const InstitutionalSignup = () => {
  const { institutionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register, isLoading } = useFirebaseAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    yearOfStudy: '',
    experience: ''
  });
  
  const [institution, setInstitution] = useState<any>(null);
  const [loadingInstitution, setLoadingInstitution] = useState(true);
  
  const userType = searchParams.get('type') || 'student';

  // Fetch institution details
  useEffect(() => {
    const fetchInstitution = async () => {
      if (!institutionId) {
        toast.error("Invalid signup link");
        navigate("/signup");
        return;
      }
      
      try {
        // First try to get institution by token (new method)
        const institutionData = await InstitutionHierarchyService.getInstitutionByToken(institutionId);
        if (institutionData) {
          setInstitution(institutionData);
          return;
        }
        
        // Fallback to old method for backward compatibility
        const oldInstitutionData = await InstitutionService.getInstitutionById(institutionId);
        console.log("Institution data fetched:", oldInstitutionData); // Debug log
        if (!oldInstitutionData) {
          toast.error("Invalid institution");
          navigate("/signup");
          return;
        }
        setInstitution(oldInstitutionData);
      } catch (error) {
        console.error("Error fetching institution:", error);
        toast.error("Failed to load institution details");
        navigate("/signup");
      } finally {
        setLoadingInstitution(false);
      }
    };
    
    fetchInstitution();
  }, [institutionId, navigate]);

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

    if (!institution) {
      toast.error("Institution details not loaded. Please try refreshing the page.");
      return;
    }

    // Additional check for institution domain
    if (!institution.domain) {
      toast.error("Institution domain information is missing. Please contact support.");
      return;
    }

    try {
      // Register user in Firebase Auth
      const result = await register({
        name: form.fullName,
        email: form.email,
        password: form.password,
        role: userType === 'teacher' ? 'institution_admin' : 'student', // Set role based on user type
        department: form.department,
        yearOfStudy: userType === 'teacher' ? form.experience : form.yearOfStudy,
        institutionDomain: institution.domain // Pass the institution domain
      });
      
      // Create user in the hierarchical structure based on their role
      if (userType === 'teacher') {
        // For teachers, create a department first if it doesn't exist
        let departmentId = '';
        
        // Check if department already exists
        // In a real implementation, we'd search for existing departments with the same name
        // For now, we'll create a new department
        departmentId = await InstitutionHierarchyService.createDepartment(
          institution.id, 
          form.department || 'Default Department', 
          result.user.id
        );
        
        // Create the teacher in the department
        await InstitutionHierarchyService.createTeacher(institution.id, departmentId, {
          ...result.user,
          department: form.department
        });
        
        navigate('/dashboard');
      } else {
        // For students, find or create a department
        let departmentId = '';
        
        // Check if department already exists
        // In a real implementation, we'd search for existing departments with the same name
        // For now, we'll create a new department
        departmentId = await InstitutionHierarchyService.createDepartment(
          institution.id, 
          form.department || 'Default Department', 
          result.user.id
        );
        
        // Create the student in the department
        await InstitutionHierarchyService.createStudent(institution.id, departmentId, {
          ...result.user,
          department: form.department,
          yearOfStudy: form.yearOfStudy
        });
        
        navigate('/student');
      }
      
      toast.success(`Welcome ${result.user.name}! Please check your email to verify your account.`);
    } catch (error: any) {
      // Provide more specific guidance for email already registered error
      if (error.message === 'Email address is already registered') {
        toast.error(
          `This email is already registered. Please try: 
          1. Using a different email address, or 
          2. Going to the login page if you already have an account.`,
          {
            duration: 10000, // Show for 10 seconds
          }
        );
      } else if (error.message && error.message.includes('Unsupported field value: undefined')) {
        toast.error(
          `There was an issue with the institution data. Please try: 
          1. Using a different signup link, or 
          2. Contacting support if the problem persists.`,
          {
            duration: 10000, // Show for 10 seconds
          }
        );
      } else {
        toast.error(error.message || 'Registration failed');
      }
    }
  };

  if (loadingInstitution) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-24 px-4 mt-16">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-lg rounded-xl">
            <div className="text-center mb-8">
              <GraduationCap className="h-12 w-12 mx-auto text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">Join {institution?.name || 'Unknown Institution'}</h1>
              <p className="text-muted-foreground">Create your {userType === 'teacher' ? 'teacher' : 'student'} account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div className="text-left">
                <Label htmlFor="full-name" className="text-left">Full Name</Label>
                <Input
                  id="full-name"
                  value={form.fullName}
                  onChange={(e) => setForm({...form, fullName: e.target.value})}
                  required
                  placeholder="Enter your full name"
                  className="mt-1 text-left"
                />
              </div>

              <div className="text-left">
                <Label htmlFor="email" className="text-left">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  required
                  placeholder="your.name@university.edu"
                  className="mt-1 text-left"
                />
                <p className="text-xs text-muted-foreground mt-2 text-left">
                  Please use your institutional email (.edu domain)
                </p>
              </div>
              
              {userType === 'teacher' && (
                <>
                  <div className="text-left">
                    <Label htmlFor="department" className="text-left">Department</Label>
                    <Input
                      id="department"
                      value={form.department || ''}
                      onChange={(e) => setForm({...form, department: e.target.value})}
                      required
                      placeholder="Enter your department"
                      className="mt-1 text-left"
                    />
                  </div>
                  
                  <div className="text-left">
                    <Label htmlFor="experience" className="text-left">Years of Teaching Experience</Label>
                    <select
                      id="experience"
                      value={form.experience || ''}
                      onChange={(e) => setForm({...form, experience: e.target.value})}
                      required
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 50 }, (_, i) => 2001 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              
              {userType === 'student' && (
                <>
                  <div className="text-left">
                    <Label htmlFor="department" className="text-left">Department</Label>
                    <Input
                      id="department"
                      value={form.department || ''}
                      onChange={(e) => setForm({...form, department: e.target.value})}
                      required
                      placeholder="Enter your department"
                      className="mt-1 text-left"
                    />
                  </div>
                  
                  <div className="text-left">
                    <Label htmlFor="yearOfStudy" className="text-left">Year of Study</Label>
                    <select
                      id="yearOfStudy"
                      value={form.yearOfStudy || ''}
                      onChange={(e) => setForm({...form, yearOfStudy: e.target.value})}
                      required
                      className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-left"
                    >
                      <option value="">Select Year</option>
                      {Array.from({ length: 50 }, (_, i) => 2001 + i).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="text-left">
                <Label htmlFor="password" className="text-left">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  required
                  placeholder="Create a secure password"
                  className="mt-1 text-left"
                />
              </div>

              <div className="text-left">
                <Label htmlFor="confirm-password" className="text-left">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  required
                  placeholder="Confirm your password"
                  className="mt-1 text-left"
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
    </div>
  );
};

export default InstitutionalSignup;