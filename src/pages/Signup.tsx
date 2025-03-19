
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate email is from an educational institution
    const isEduEmail = email.endsWith('.edu') || email.includes('.edu.');
    
    if (!isEduEmail) {
      toast.error("Please use a valid educational email address");
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      toast.success("Sign up successful! Awaiting approval from your institution.");
      navigate('/');
      setIsSubmitting(false);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-36 px-4 mt-16">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-lg rounded-xl">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Student Registration</h1>
              <p className="text-muted-foreground">Sign up with your educational email</p>
            </div>
            
            <form onSubmit={handleSignup}>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    required 
                    placeholder="Enter your full name" 
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Educational Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    placeholder="your.name@university.edu" 
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Must be a valid educational email (.edu)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder="Create a secure password" 
                    className="mt-1"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Sign Up"}
                </Button>
              </div>
            </form>
            
            <div className="mt-8 text-center text-sm">
              <p className="text-muted-foreground">
                By signing up, you agree to our Terms of Service and Privacy Policy
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
