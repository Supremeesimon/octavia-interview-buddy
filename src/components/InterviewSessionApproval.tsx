import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SessionRequestService, SessionRequest } from '@/services/session-request.service';

interface InterviewSessionApprovalProps {
  departmentId: string;
  institutionId: string;
  currentUserId: string; // ID of the teacher reviewing requests
}

const InterviewSessionApproval = ({ 
  departmentId, 
  institutionId,
  currentUserId
}: InterviewSessionApprovalProps) => {
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const { toast } = useToast();
  
  // Fetch session requests for the department
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoadingRequests(true);
        const departmentRequests = await SessionRequestService.getDepartmentSessionRequests(departmentId);
        setRequests(departmentRequests);
      } catch (error) {
        console.error('Error fetching session requests:', error);
        toast({
          title: "Error",
          description: "Failed to load session requests. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoadingRequests(false);
      }
    };
    
    if (departmentId) {
      fetchRequests();
    }
  }, [departmentId, toast]);
  
  const handleApproveRequest = async (requestId: string) => {
    setLoading(true);
    try {
      // Update request status to approved
      const updatedRequest = await SessionRequestService.updateSessionRequestStatus(requestId, {
        status: 'approved',
        reviewedBy: currentUserId
      });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? updatedRequest : req
      ));
      
      toast({
        title: "Request Approved",
        description: "Interview sessions have been allocated to the student.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRejectRequest = async (requestId: string) => {
    setLoading(true);
    try {
      // Update request status to rejected
      const updatedRequest = await SessionRequestService.updateSessionRequestStatus(requestId, {
        status: 'rejected',
        reviewedBy: currentUserId
      });
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? updatedRequest : req
      ));
      
      toast({
        title: "Request Rejected",
        description: "The interview session request has been rejected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');
  
  if (loadingRequests) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Pending Requests
            </CardTitle>
            <CardDescription>
              Review and approve interview session requests from students in your department
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Student ID: {request.studentId}</span>
                      <Badge variant="secondary">Department: {request.departmentId}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Requested {request.createdAt.toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{request.sessionCount} interview session(s)</span> requested
                    </p>
                    {request.reason && (
                      <p className="text-sm text-muted-foreground">
                        "{request.reason}"
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={loading}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={loading}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* Recently Processed Requests */}
      {processedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recently Processed</CardTitle>
            <CardDescription>
              Previously reviewed interview session requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {processedRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Student ID: {request.studentId}</span>
                      <Badge variant="secondary">Department: {request.departmentId}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Requested {request.createdAt.toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium">{request.sessionCount} interview session(s)</span> requested
                    </p>
                    {request.reason && (
                      <p className="text-sm text-muted-foreground">
                        "{request.reason}"
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'approved' ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </div>
                </div>
                {request.reviewedAt && request.reviewedBy && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Processed on {request.reviewedAt.toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      
      {/* No Requests Message */}
      {pendingRequests.length === 0 && processedRequests.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
            <h3 className="font-medium mb-1">No Requests</h3>
            <p className="text-sm text-muted-foreground">
              There are no interview session requests from students in your department at this time.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Students</span> can request interview sessions directly from their dashboard.
          </p>
          <p>
            <span className="font-medium">Teachers</span> review and approve these requests, allocating the requested sessions to students.
          </p>
          <p>
            Once approved, students can use their allocated interview sessions for practice with Octavia.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewSessionApproval;