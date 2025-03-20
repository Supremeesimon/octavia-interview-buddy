
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
import { toast } from "sonner";

interface InterviewEmailReminderProps {
  interviewDate: string;
  interviewTime: string;
  studentName: string;
  onSendReminder: () => void;
}

const InterviewEmailReminder = ({ 
  interviewDate, 
  interviewTime, 
  studentName, 
  onSendReminder 
}: InterviewEmailReminderProps) => {
  const [isSending, setIsSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  
  const handleSendReminder = () => {
    setIsSending(true);
    
    // Simulate sending email reminder
    setTimeout(() => {
      setIsSending(false);
      setSent(true);
      toast.success("Email reminder sent successfully!");
      onSendReminder();
    }, 1500);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          Interview Reminder
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="mb-2">
              Send a reminder email to <span className="font-medium">{studentName}</span> for their upcoming interview:
            </p>
            
            <div className="bg-muted/30 p-4 rounded-md">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{interviewDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{interviewTime}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Email will include:</h3>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Google Calendar invitation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Accept/Decline options</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Link to start the interview</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="text-sm">Interview preparation tips</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSendReminder} 
          className="w-full flex items-center gap-2"
          disabled={isSending || sent}
        >
          {isSending ? (
            <>Sending reminder...</>
          ) : sent ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Reminder Sent
            </>
          ) : (
            <>
              <Mail className="h-4 w-4" />
              Send Reminder Email
              <ArrowRight className="h-4 w-4 ml-auto" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InterviewEmailReminder;
