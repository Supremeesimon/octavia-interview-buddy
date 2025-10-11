import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Link as LinkIcon, 
  Copy, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  Phone, 
  Mail,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { InstitutionInterestService } from '@/services/institution-interest.service';
import { InstitutionService } from '@/services/institution.service';
import { InstitutionInterest, Institution } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const InstitutionInterests = () => {
  const [interests, setInterests] = useState<InstitutionInterest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterest, setSelectedInterest] = useState<InstitutionInterest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleGenerateLink = (institutionName: string) => {
    // Generate a custom signup link for the institution
    const cleanName = institutionName.toLowerCase().replace(/\s+/g, '-');
    const link = `${window.location.origin}/signup?institution=${encodeURIComponent(institutionName)}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(link);
    toast.success("Custom signup link copied to clipboard!");
  };

  const handleViewMessage = (interest: InstitutionInterest) => {
    setSelectedInterest(interest);
    setIsDialogOpen(true);
  };

  const handleMarkAsProcessed = async (interest: InstitutionInterest) => {
    try {
      // Update the interest status to 'processed'
      if (interest.id) {
        await InstitutionInterestService.updateInterestStatus(interest.id, 'processed');
        
        // Create the institution in the institutions collection
        const institutionData: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'> = {
          name: interest.institutionName,
          domain: '', // This would need to be set by the admin later
          adminId: '', // This would need to be set when an admin is assigned
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
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await InstitutionService.createInstitution(institutionData);
        
        // Update the local state to reflect the status change
        setInterests(interests.map(i => 
          i.id === interest.id ? { ...i, status: 'processed' } : i
        ));
        
        toast.success(`Marked as processed and added ${interest.institutionName} to institutions`);
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
                        <Button
                          size="sm"
                          variant="outline"
                          tooltip="Generate custom signup link"
                          onClick={() => handleGenerateLink(interest.institutionName)}
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
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