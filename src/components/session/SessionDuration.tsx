
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface SessionDurationProps {
  sessionLength: number;
  setSessionLength: (length: number) => void;
  pricePerMinute: number | null; // Allow null for "Not Available"
}

const SessionDuration = ({ sessionLength, setSessionLength, pricePerMinute }: SessionDurationProps) => {
  const handleSessionLengthChange = (value: number[]) => {
    setSessionLength(value[0]);
  };
  
  const sessionCost = pricePerMinute !== null ? (sessionLength * pricePerMinute).toFixed(2) : '0.00';
  
  return (
    <Card tooltip="Configure the length of each interview session">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Session Duration
        </CardTitle>
        <CardDescription>
          Set the duration for each interview session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex justify-between">
            <Label htmlFor="session-length">Minutes per session</Label>
            <span className="font-medium">{sessionLength} minutes</span>
          </div>
          
          <Slider 
            id="session-length"
            min={10} 
            max={30} 
            step={1} 
            value={[sessionLength]} 
            onValueChange={handleSessionLengthChange}
          />
          
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>10 min</span>
            <span>20 min</span>
            <span>30 min</span>
          </div>
          
          <div className="bg-muted p-3 rounded-md text-sm">
            <div className="flex justify-between mb-1">
              <span>Session duration:</span>
              <span className="font-medium">{sessionLength} minutes</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Price per minute:</span>
              <span>
                {pricePerMinute !== null ? `$${pricePerMinute.toFixed(2)}` : 'Not Available'}
              </span>
            </div>
            <div className="h-px bg-border my-2"></div>
            <div className="flex justify-between font-medium">
              <span>Cost per session:</span>
              <span>
                {pricePerMinute !== null ? `$${(sessionLength * pricePerMinute).toFixed(2)}` : 'Not Available'}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionDuration;
