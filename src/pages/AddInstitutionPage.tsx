
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ArrowLeft, Building, Users } from 'lucide-react';

const AddInstitutionPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-28">
        <div className="container max-w-3xl mx-auto px-4">
          <TooltipProvider>
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                className="mr-2"
                onClick={() => navigate('/admin')}
                tooltip="Return to admin dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">Add New Institution</h1>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5" />
                  Institution Details
                </CardTitle>
                <CardDescription>
                  Enter information to onboard a new institution to the Octavia platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Institution Name *</Label>
                    <Input
                      id="institutionName"
                      placeholder="e.g. University of Technology"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="institutionType">Institution Type *</Label>
                    <Select>
                      <SelectTrigger id="institutionType" tooltip="Select the type of institution">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="university">University</SelectItem>
                          <SelectItem value="college">College</SelectItem>
                          <SelectItem value="community_college">Community College</SelectItem>
                          <SelectItem value="technical_school">Technical School</SelectItem>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="corporate">Corporate</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    placeholder="https://www.institution.edu"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Full address"
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Admin Contact
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Admin Name *</Label>
                      <Input
                        id="adminName"
                        placeholder="Full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Admin Email *</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        placeholder="admin@institution.edu"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminPhone">Admin Phone</Label>
                      <Input
                        id="adminPhone"
                        placeholder="Phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="adminTitle">Admin Title</Label>
                      <Input
                        id="adminTitle"
                        placeholder="e.g. Career Services Director"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan">Subscription Plan *</Label>
                  <Select>
                    <SelectTrigger id="plan" tooltip="Select subscription plan for the institution">
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="build">Build (66 students)</SelectItem>
                        <SelectItem value="ship">Ship (533 students)</SelectItem>
                        <SelectItem value="scale">Scale (3,000 students)</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information or special requirements"
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin')}
                  tooltip="Cancel and return to admin dashboard"
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    tooltip="Save as draft to complete later"
                  >
                    Save as Draft
                  </Button>
                  <Button 
                    tooltip="Create the new institution and set up their account"
                  >
                    Create Institution
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TooltipProvider>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AddInstitutionPage;
