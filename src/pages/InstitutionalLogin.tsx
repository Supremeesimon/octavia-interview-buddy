import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';
import { firebaseAuthService } from '@/services/firebase-auth.service';

const InstitutionalLogin = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get token from URL params
  useEffect(() => {
    const urlToken = token || '';
    
    // Validate token on mount
    const validateToken = async () => {
      if (urlToken) {
        try {
          const institution = await InstitutionHierarchyService.getInstitutionByToken(urlToken);
          
          if (!institution) {
            // Try to find by ID as fallback
            try {
              const institutionById = await InstitutionHierarchyService.getInstitutionById(urlToken);
              if (institutionById) {
                setInstitutionName(institutionById.name);
                return;
              }
            } catch (error) {
              console.error('Error fetching institution by ID:', error);
            }
            
            toast.error('Invalid or expired link');
            navigate('/login');
            return;
          }
          
          setInstitutionName(institution.name);
        } catch (error) {
          console.error('Error validating token:', error);
          toast.error('Invalid or expired link');
          navigate('/login');
        }
      } else {
        toast.error('Invalid or expired link');
        navigate('/login');
      }
    };
    
    validateToken();
  }, [token, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Use Firebase Auth to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verify user belongs to this institution
      const userId = userCredential.user.uid;
      const userSearchResult = await InstitutionHierarchyService.findUserById(userId);
      
      if (!userSearchResult) {
        await signOut(auth);
        throw new Error('User account not found');
      }
      
      const { user, role, institutionId } = userSearchResult;
      
      // Get the institution for this login token
      const institution = await InstitutionHierarchyService.getInstitutionByToken(token);
      if (!institution) {
        // Try by ID as fallback
        try {
          const institutionById = await InstitutionHierarchyService.getInstitutionById(token);
          if (!institutionById) {
            await signOut(auth);
            throw new Error('Invalid or expired link');
          }
        } catch (error) {
          await signOut(auth);
          throw new Error('Invalid or expired link');
        }
      }
      
      // Verify user belongs to this institution
      const validInstitution = institution || await InstitutionHierarchyService.getInstitutionById(token);
      if (!institutionId || (validInstitution && institutionId !== validInstitution.id)) {
        await signOut(auth);
        throw new Error('You are not authorized to access this institution');
      }
      
      // Redirect based on role
      switch (role) {
        case 'teacher':
          navigate('/teacher-dashboard');
          break;
        case 'student':
          navigate('/student');
          break;
        case 'institution_admin':
          navigate('/dashboard');
          break;
        default:
          navigate('/');
      }
      
      toast.success(`Welcome back, ${user.name}!`);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-36 px-4 mt-16">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-lg rounded-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Institutional Login</h1>
              {institutionName && (
                <p className="text-muted-foreground">Sign in to {institutionName}</p>
              )}
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
                    placeholder="your.name@institution.edu" 
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
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <a href={`/signup-institution/${token}`} className="text-primary hover:underline">
                  Sign up
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

export default InstitutionalLogin;