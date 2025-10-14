import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from "sonner";
import { Clock, UserPlus, Mail, Phone, Eye, LinkIcon, CheckCircle, Trash2 } from 'lucide-react';
import { InstitutionInterestService } from '@/services/institution-interest.service';
import { InstitutionHierarchyService } from '@/services/institution-hierarchy.service';
import { User } from '@/types'; // Import the User type

// Define the InstitutionInterest interface locally since it's not in the types file
interface InstitutionInterest {
  id?: string;
  institutionName: string;
  contactName: string;
  email: string;
  phone: string;
  studentCapacity: string;
  message: string;
  createdAt: Date;
  status: 'pending' | 'contacted' | 'processed';
  processedAt?: Date;
  processedBy?: string;
  approvedBy?: string;
  customSignupToken?: string;
  customSignupLink?: string;
}

// Add prop interface
interface InstitutionInterestsProps {
  currentUser?: User; // Use the proper User type
}

const InstitutionInterests = ({ currentUser }: InstitutionInterestsProps) => {
  const [interests, setInterests] = useState<InstitutionInterest[]>([]);
  const [selectedInterest, setSelectedInterest] = useState<InstitutionInterest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    try {
      const data = await InstitutionInterestService.getAllInterests();
      setInterests(data);
    } catch (error) {
      toast.error("Failed to fetch institution interests");
      console.error("Error fetching institution interests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInterest = async (id: string) => {
    try {
      await InstitutionInterestService.deleteInterest(id);
      setInterests(interests.filter(interest => interest.id !== id));
      toast.success("Interest request deleted successfully");
    } catch (error) {
      toast.error("Failed to delete interest request");
      console.error("Error deleting interest request:", error);
    }
  };

  const handleGenerateLink = (interest: InstitutionInterest, userType: 'student' | 'teacher' | 'admin' = 'student') => {
    // Check if the institution has been processed
    if (interest.status !== 'processed') {
      toast.warning(
        <div className="flex flex-col gap-2">
          <span>Please mark this institution as "Processed" first to generate a proper custom signup link.</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleMarkAsProcessed(interest)}
          >
            Mark as Processed
          </Button>
        </div>,
        { duration: 10000 }
      );
      return;
    }
    
    // For processed institutions, direct them to use the proper institutional management page
    toast.info(
      <div className="flex flex-col gap-2">
        <span>Custom signup links for processed institutions are available in the Institution Management section.</span>
        <span className="text-sm text-muted-foreground">After marking as processed, a custom signup link was generated and can be copied from the success notification.</span>
      </div>,
      { duration: 10000 }
    );
  };

  const handleCopyLink = async (interest: InstitutionInterest, userType: 'student' | 'teacher' | 'admin' = 'student') => {
    // Check if the institution has been processed
    if (interest.status !== 'processed') {
      toast.warning(
        <div className="flex flex-col gap-2">
          <span>Please mark this institution as "Processed" first to generate a proper custom signup link.</span>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleMarkAsProcessed(interest)}
          >
            Mark as Processed
          </Button>
        </div>,
        { duration: 10000 }
      );
      return;
    }
    
    // For processed institutions, generate and copy the appropriate link
    try {
      // We need to find the institution in the database to get its custom signup link
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      // Trim the institution name to avoid whitespace issues
      const trimmedInstitutionName = interest.institutionName.trim();
      
      const q = query(
        collection(db, 'institutions'),
        where('name', '==', trimmedInstitutionName)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const institutionDoc = querySnapshot.docs[0];
        const institutionData = institutionDoc.data();
        const customSignupLink = institutionData.customSignupLink;
        
        if (customSignupLink) {
          // Add user type parameter to the link
          const linkWithUserType = `${customSignupLink}?type=${userType}`;
          await navigator.clipboard.writeText(linkWithUserType);
          toast.success(`${userType.charAt(0).toUpperCase() + userType.slice(1)} signup link copied to clipboard!`);
          return;
        }
      }
      
      toast.error("Failed to find custom signup link for this institution. Please try refreshing the page.");
    } catch (error) {
      toast.error("Failed to generate signup link");
      console.error("Error generating signup link:", error);
    }
  };

  const handleViewMessage = (interest: InstitutionInterest) => {
    setSelectedInterest(interest);
    setIsDialogOpen(true);
  };

  const handleMarkAsProcessed = async (interest: InstitutionInterest) => {
    try {
      // Update the interest status to 'processed'
      if (interest.id) {
        await InstitutionInterestService.updateInterestStatus(interest.id, 'processed', currentUser?.id);
        
        // Check if an institution with this name already exists
        // Trim the institution name to avoid trailing/leading spaces
        const trimmedInstitutionName = interest.institutionName.trim();
        
        // Query for existing institution with the same name
        const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        const q = query(
          collection(db, 'institutions'),
          where('name', '==', trimmedInstitutionName)
        );
        
        const querySnapshot = await getDocs(q);
        
        let institutionId = '';
        let existingInstitution = null;
        
        if (!querySnapshot.empty) {
          // Institution already exists
          const institutionDoc = querySnapshot.docs[0];
          institutionId = institutionDoc.id;
          const institutionData = institutionDoc.data();
          existingInstitution = {
            id: institutionId,
            ...institutionData,
            customSignupLink: institutionData.customSignupLink || '',
            customSignupToken: institutionData.customSignupToken || ''
          };
        
          // Check if the institution doesn't have a platform_admin_id and we have a current user
          if ((!institutionData.platform_admin_id || institutionData.platform_admin_id === '') && currentUser?.id) {
            // Update the institution with the current admin's ID
            try {
              const updateData: any = {
                platform_admin_id: currentUser.id,
                approvalStatus: 'approved'
              };
            
              await updateDoc(doc(db, 'institutions', institutionId), updateData);
              toast.success(`Updated institution ${trimmedInstitutionName} with platform admin ID and approval status.`);
            } catch (updateError) {
              console.error('Error updating institution with admin ID:', updateError);
              toast.error("Failed to update institution with admin ID");
            }
          }
          
          // Update the institution interest with the custom signup token
          try {
            const { updateDoc, doc } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            
            await updateDoc(doc(db, 'institution_interests', interest.id), {
              customSignupToken: institutionData.customSignupToken,
              customSignupLink: institutionData.customSignupLink
            });
          } catch (updateError) {
            console.error('Error updating institution interest with signup token:', updateError);
          }
        
          toast.success(`Marked as processed. Institution ${trimmedInstitutionName} already exists.`);
        } else {
          // Create a new institution
          const institutionData = {
            name: trimmedInstitutionName,
            domain: '', // No automatic domain generation
            platform_admin_id: currentUser?.id || '', // Set the platform admin ID of who created this institution
            approvalStatus: 'approved',
            settings: {
              allowedBookingsPerMonth: 100,
              sessionLength: 30,
              requireResumeUpload: true,
              enableDepartmentAllocations: true,
              enableStudentGroups: true,
              emailNotifications: {
                enableInterviewReminders: true,
                enableFeedbackEmails: true,
                enableWeeklyReports: true,
                reminderHours: 24
              }
            },
            sessionPool: {
              id: '',
              institutionId: '',
              totalSessions: 0,
              usedSessions: 0,
              availableSessions: 0,
              allocations: [],
              purchases: [],
              createdAt: new Date(),
              updatedAt: new Date()
            },
            stats: {
              totalStudents: 0,
              activeStudents: 0,
              totalInterviews: 0,
              averageScore: 0,
              sessionUtilization: 0,
              topPerformingDepartments: [],
              monthlyUsage: []
            },
            isActive: true
          };
    
          institutionId = await InstitutionHierarchyService.createInstitution(institutionData);
        
          // Get the institution to retrieve the custom signup link
          // Add a small delay to ensure the document is fully created
          await new Promise(resolve => setTimeout(resolve, 1000));
          existingInstitution = await InstitutionHierarchyService.getInstitutionById(institutionId);
          
          // Update the institution interest with the custom signup token
          if (existingInstitution && existingInstitution.customSignupToken) {
            try {
              const { updateDoc, doc } = await import('firebase/firestore');
              const { db } = await import('@/lib/firebase');
              
              await updateDoc(doc(db, 'institution_interests', interest.id), {
                customSignupToken: existingInstitution.customSignupToken,
                customSignupLink: existingInstitution.customSignupLink
              });
            } catch (updateError) {
              console.error('Error updating institution interest with signup token:', updateError);
            }
          }
        }
      
        // Show success message with option to copy the custom signup link
        if (existingInstitution && existingInstitution.customSignupLink) {
          toast(
            <div className="flex flex-col gap-2">
              <span>Marked as processed and added {trimmedInstitutionName} to institutions</span>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(existingInstitution.customSignupLink!);
                    toast.success("Custom signup link copied to clipboard!");
                  } catch (error) {
                    toast.error("Failed to copy link to clipboard");
                    console.error("Error copying to clipboard:", error);
                  }
                }}
              >
                Copy Custom Signup Link
              </Button>
            </div>,
            { duration: 10000 }
          );
        } else {
          // Even if we couldn't get the link immediately, the institution was created/processed
          toast.success(`Marked as processed and added ${trimmedInstitutionName} to institutions. Refresh the page to see the custom signup link.`);
        }
      
        // Update the local state to reflect the status change
        setInterests(interests.map(i => 
          i.id === interest.id ? { ...i, status: 'processed' } : i
        ));
      }
    } catch (error) {
      toast.error("Failed to mark as processed or add institution");
      console.error("Error marking as processed:", error);
    }
};

  const formatDate = (date: Date) => {
    if (!date) return 'Unknown';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return <Badge variant="default">Processed</Badge>;
      case 'contacted':
        return <Badge variant="secondary">Contacted</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Institution Interest Requests</CardTitle>
        <CardDescription>
          Institutions that have expressed interest in partnering with Octavia
        </CardDescription>
      </CardHeader>
      <CardContent>
        {interests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No institution interest requests at this time.</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interests.map((interest) => (
                  <TableRow key={interest.id}>
                    <TableCell>
                      <div className="font-medium">{interest.institutionName}</div>
                      {interest.message && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {interest.message.length > 50 ? (
                            <div className="flex items-center">
                              <span>{interest.message.substring(0, 50)}...</span>
                              <Button
                                variant="link"
                                size="sm"
                                className="ml-2 h-auto p-0 text-xs"
                                onClick={() => handleViewMessage(interest)}
                              >
                                View full message
                              </Button>
                            </div>
                          ) : (
                            interest.message
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <UserPlus className="h-4 w-4" />
                          {interest.contactName}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {interest.email}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {interest.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{interest.studentCapacity}</TableCell>
                    <TableCell>{formatDate(interest.createdAt)}</TableCell>
                    <TableCell>{getStatusBadge(interest.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {interest.message && (
                          <Button
                            size="sm"
                            variant="outline"
                            tooltip="View full message"
                            onClick={() => handleViewMessage(interest)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              tooltip="Generate custom signup link"
                            >
                              <LinkIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleCopyLink(interest, 'student')}>
                              Student Signup Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyLink(interest, 'teacher')}>
                              Teacher Signup Link
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyLink(interest, 'admin')}>
                              Admin Signup Link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          size="sm"
                          variant="outline"
                          tooltip="Mark as processed"
                          onClick={() => handleMarkAsProcessed(interest)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          tooltip="Delete request"
                          onClick={() => interest.id && handleDeleteInterest(interest.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Message Detail Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Institution Interest Details</DialogTitle>
                  <DialogDescription>
                    Full details of the interest request from {selectedInterest?.institutionName}
                  </DialogDescription>
                </DialogHeader>
                {selectedInterest && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-lg">{selectedInterest.institutionName}</h3>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Contact Person</p>
                          <p>{selectedInterest.contactName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p>{selectedInterest.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p>{selectedInterest.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Student Capacity</p>
                          <p>{selectedInterest.studentCapacity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Date Submitted</p>
                          <p>{formatDate(selectedInterest.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p>{getStatusBadge(selectedInterest.status)}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Message</p>
                      <div className="mt-2 p-4 bg-muted rounded-lg">
                        <p className="whitespace-pre-wrap">{selectedInterest.message}</p>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default InstitutionInterests;