import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Info } from "lucide-react";
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { requestPasswordReset } = useFirebaseAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset link");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-36 px-4 mt-16">
        <div className="w-full max-w-md">
          <Card className="p-8 shadow-lg rounded-xl">
            {!isSubmitted ? (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Reset Your Password</h1>
                  <p className="text-muted-foreground">
                    Enter your email address and we'll send you a link to reset your password
                  </p>
                </div>
                
                {/* Info box about email branding */}
                <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                  <Info className="h-4 w-4 text-yellow-600 inline mr-2" />
                  <AlertDescription>
                    <strong>Note:</strong> Password reset emails may show "project-XXXXXX" in the subject. 
                    This will be fixed when we update our Firebase project branding.
                  </AlertDescription>
                </Alert>
                
                <form onSubmit={handleSubmit}>
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
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="space-y-5">
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription>
                    If an account with that email exists, we've sent a password reset link to {email}. 
                    Please check your inbox and follow the instructions to reset your password.
                  </AlertDescription>
                </Alert>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Link>
                </Button>
              </div>
            )}
            
            <div className="mt-8 text-center text-sm">
              <p className="text-muted-foreground">
                Remember your password?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;