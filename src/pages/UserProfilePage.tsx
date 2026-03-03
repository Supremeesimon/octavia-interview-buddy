
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { toast } from 'sonner';
import { User, Mail, Building, GraduationCap, Calendar, Shield, Save, Loader2 } from 'lucide-react';
import { firebaseAuthService } from '@/services/firebase-auth.service';
import ExternalUserSubscription from '@/components/ExternalUserSubscription';

const UserProfilePage = () => {
  const { user, isLoading } = useFirebaseAuth();
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setLinkedinUrl(user.linkedinUrl || '');
      setDepartment(user.department || '');
      setYearOfStudy(user.yearOfStudy || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await firebaseAuthService.updateUserProfile({
        name,
        linkedinUrl,
        department,
        yearOfStudy
      });
      toast.success('Profile updated successfully');
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and personal information</p>
      </div>

      <div className="grid gap-6">
        {/* Subscription Management */}
        <ExternalUserSubscription />

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    value={user.email} 
                    disabled 
                    className="pl-9 bg-muted" 
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="pl-9" 
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                <div className="relative">
                  <Input 
                    id="linkedin" 
                    value={linkedinUrl} 
                    onChange={(e) => setLinkedinUrl(e.target.value)} 
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
              </div>

              {user.role === 'student' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="department">Department / Major</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="department" 
                          value={department} 
                          onChange={(e) => setDepartment(e.target.value)} 
                          className="pl-9" 
                          placeholder="Computer Science"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="yearOfStudy">Year of Study</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="yearOfStudy" 
                          value={yearOfStudy} 
                          onChange={(e) => setYearOfStudy(e.target.value)} 
                          className="pl-9" 
                          placeholder="Senior"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Account Details
            </CardTitle>
            <CardDescription>View your account status and membership</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Account Role</p>
                <p className="font-semibold capitalize flex items-center gap-2">
                  {user.role?.replace('_', ' ')}
                </p>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Member Since</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Institution</p>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {user.institutionId ? 'Institution Member' : 'Individual User'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="font-medium">Active</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfilePage;
