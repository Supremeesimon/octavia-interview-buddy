import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { SessionRequestService } from '@/services/session-request.service';

interface InterviewSessionRequestProps {
  studentId: string;
  departmentId?: string;
  institutionId?: string;
  onSessionRequested?: () => void;
}

const InterviewSessionRequest = ({ 
  studentId, 
  departmentId, 
  institutionId,
  onSessionRequested 
}: InterviewSessionRequestProps) => {
  const [sessionCount, setSessionCount] = useState(1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(departmentId || '');
  const { toast } = useToast();
  
  const handleRequestSession = async () => {
    if (!studentId || !institutionId) {
      toast({
        title: "Error",
        description: "Missing required information to request interview sessions.",
        variant: "destructive"
      });
      return;
    }
    
    if (sessionCount <= 0) {
      toast({
        title: "Error",
        description: "Please specify a valid number of interview sessions.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedDepartment) {
      toast({
        title: "Error",
        description: "Please select your department.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      // Create session request
      await SessionRequestService.createSessionRequest({
        studentId,
        institutionId,
        departmentId: selectedDepartment,
        sessionCount,
        reason
      });
      
      toast({
        title: "Request Submitted",
        description: `Your request for ${sessionCount} interview session(s) has been submitted to your department head for approval.`,
      });
      
      // Reset form
      setSessionCount(1);
      setReason('');
      
      // Notify parent component
      if (onSessionRequested) {
        onSessionRequested();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit interview session request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Interview Sessions</CardTitle>
        <CardDescription>
          Request additional interview sessions from your department head
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger id="department">
              <SelectValue placeholder="Select your department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="arts">Arts & Humanities</SelectItem>
              <SelectItem value="sciences">Sciences</SelectItem>
              <SelectItem value="medicine">Medicine</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sessionCount">Number of Sessions</Label>
          <Input
            id="sessionCount"
            type="number"
            min="1"
            max="10"
            value={sessionCount}
            onChange={(e) => setSessionCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
          />
          <p className="text-sm text-muted-foreground">
            Request between 1-10 interview sessions
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Request</Label>
          <Textarea
            id="reason"
            placeholder="Explain why you need additional interview sessions..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleRequestSession}
          disabled={loading || !selectedDepartment}
        >
          {loading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              Submitting Request...
            </>
          ) : (
            'Submit Request'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewSessionRequest;