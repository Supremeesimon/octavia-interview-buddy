import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConfirmationDialog from '../ConfirmationDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { loadStripe } from '@stripe/stripe-js';
import { SessionService } from '@/services/session.service';

interface SessionPurchaseProps {
  sessionLength: number;
  sessionCost: string;
  onSessionPurchase?: (sessions: number, cost: number) => void;
}

const SessionPurchase = ({ sessionLength, sessionCost, onSessionPurchase }: SessionPurchaseProps) => {
  const [additionalSessions, setAdditionalSessions] = useState('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [stripePromise, setStripePromise] = useState<any>(null);
  
  useEffect(() => {
    const initializeStripe = async () => {
      if (process.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        const stripe = await loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY);
        setStripePromise(stripe);
      }
    };
    
    initializeStripe();
  }, []);
  
  const handleAddSessions = async () => {
    const sessionsToAdd = parseInt(additionalSessions);
    if (isNaN(sessionsToAdd) || sessionsToAdd <= 0) {
      toast({
        title: "Invalid session count",
        description: "Please enter a valid number of sessions to add",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const response = await fetch('/api/sessions/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionCount: sessionsToAdd,
          pricePerSession: parseFloat(sessionCost)
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle different error statuses appropriately
        if (response.status >= 500) {
          // Server error - show toast
          toast({
            title: "Server error",
            description: result.message || "Failed to process session purchase",
            variant: "destructive"
          });
        } else if (response.status >= 400) {
          // Client error - show toast with specific message
          toast({
            title: "Purchase failed",
            description: result.message || "Invalid purchase request",
            variant: "destructive"
          });
        }
        return;
      }
      
      if (result.data.clientSecret && stripePromise) {
        const stripe = await stripePromise;
        if (stripe) {
          const { error } = await stripe.confirmCardPayment(result.data.clientSecret);
          
          if (error) {
            toast({
              title: "Payment failed",
              description: error.message,
              variant: "destructive"
            });
            return;
          }
          
          const totalCost = parseFloat((sessionsToAdd * parseFloat(sessionCost)).toFixed(2));
          
          toast({
            title: "Sessions purchased",
            description: `${sessionsToAdd} sessions added to your pool for $${totalCost.toFixed(2)}`,
          });
          
          if (onSessionPurchase) {
            onSessionPurchase(sessionsToAdd, totalCost);
          }
          
          setAdditionalSessions('');
        }
      } else {
        const totalCost = parseFloat((sessionsToAdd * parseFloat(sessionCost)).toFixed(2));
        
        toast({
          title: "Sessions purchased",
          description: `${sessionsToAdd} sessions added to your pool for $${totalCost.toFixed(2)}`,
        });
        
        if (onSessionPurchase) {
          onSessionPurchase(sessionsToAdd, totalCost);
        }
        
        setAdditionalSessions('');
      }
    } catch (error: any) {
      // Handle network errors and other unexpected errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        toast({
          title: "Network error",
          description: "Unable to connect to the server. Please check your connection.",
          variant: "destructive"
        });
      } else {
        // Unexpected error
        toast({
          title: "Purchase failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
          variant: "destructive"
        });
      }
      console.error('Purchase error:', error);
    }
  };
  
  const calculateBundleCost = (sessions: number) => {
    return (sessions * parseFloat(sessionCost)).toFixed(2);
  };

  const calculateTotalCost = () => {
    const sessions = parseInt(additionalSessions) || 0;
    return (sessions * parseFloat(sessionCost)).toFixed(2);
  };
  
  return (
    <Card tooltip="Purchase additional interview sessions for your institution's pool">
      <CardHeader className="bg-primary/5 border-b">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Purchase Interview Sessions
        </CardTitle>
        <CardDescription>
          Buy additional interview sessions for your students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-sessions">Number of sessions to purchase</Label>
              <div className="flex space-x-2">
                <Input
                  id="add-sessions"
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={additionalSessions}
                  onChange={(e) => setAdditionalSessions(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Each session allows one student to have a {sessionLength}-minute interview with Octavia AI.
              </p>
            </div>
            
            <div className="space-y-2 mt-4">
              <div className="font-medium">Quick Purchase Options</div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2">
                <ConfirmationDialog
                  details={{
                    title: "Confirm Purchase",
                    description: "Are you sure you want to purchase 100 interview sessions?",
                    items: [
                      { label: 'Number of Sessions', value: '100' },
                      { label: 'Session Duration', value: `${sessionLength} minutes` },
                      { label: 'Cost per Session', value: `$${sessionCost}` },
                      { label: 'Total Cost', value: `$${calculateBundleCost(100)}` },
                    ],
                    confirmText: "Complete Purchase",
                  }}
                  trigger={
                    <Button variant="outline" className="w-full text-xs md:text-sm">
                      <span className="truncate">100 Sessions</span>
                      <span className="ml-1 text-muted-foreground whitespace-nowrap">${calculateBundleCost(100)}</span>
                    </Button>
                  }
                  onConfirm={() => {
                    setAdditionalSessions('100');
                    handleAddSessions();
                  }}
                />
                <ConfirmationDialog
                  details={{
                    title: "Confirm Purchase",
                    description: "Are you sure you want to purchase 500 interview sessions?",
                    items: [
                      { label: 'Number of Sessions', value: '500' },
                      { label: 'Session Duration', value: `${sessionLength} minutes` },
                      { label: 'Cost per Session', value: `$${sessionCost}` },
                      { label: 'Total Cost', value: `$${calculateBundleCost(500)}` },
                    ],
                    confirmText: "Complete Purchase",
                  }}
                  trigger={
                    <Button variant="outline" className="w-full text-xs md:text-sm">
                      <span className="truncate">500 Sessions</span>
                      <span className="ml-1 text-muted-foreground whitespace-nowrap">${calculateBundleCost(500)}</span>
                    </Button>
                  }
                  onConfirm={() => {
                    setAdditionalSessions('500');
                    handleAddSessions();
                  }}
                />
                <ConfirmationDialog
                  details={{
                    title: "Confirm Purchase",
                    description: "Are you sure you want to purchase 1000 interview sessions?",
                    items: [
                      { label: 'Number of Sessions', value: '1000' },
                      { label: 'Session Duration', value: `${sessionLength} minutes` },
                      { label: 'Cost per Session', value: `$${sessionCost}` },
                      { label: 'Total Cost', value: `$${calculateBundleCost(1000)}` },
                    ],
                    confirmText: "Complete Purchase",
                  }}
                  trigger={
                    <Button variant="outline" className="w-full text-xs md:text-sm">
                      <span className="truncate">1000 Sessions</span>
                      <span className="ml-1 text-muted-foreground whitespace-nowrap">${calculateBundleCost(1000)}</span>
                    </Button>
                  }
                  onConfirm={() => {
                    setAdditionalSessions('1000');
                    handleAddSessions();
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-medium text-lg mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span>Sessions:</span>
                <span>{additionalSessions || 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Duration per session:</span>
                <span>{sessionLength} minutes</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Price per session:</span>
                <span>${sessionCost}</span>
              </div>
              <div className="h-px bg-border my-2"></div>
              <div className="flex justify-between font-medium text-lg">
                <span>Total:</span>
                <span>${calculateTotalCost()}</span>
              </div>
              
              <ConfirmationDialog
                details={{
                  title: "Confirm Purchase",
                  description: "Are you sure you want to complete this purchase?",
                  items: [
                    { label: 'Number of Sessions', value: additionalSessions || '0' },
                    { label: 'Session Duration', value: `${sessionLength} minutes` },
                    { label: 'Cost per Session', value: `$${sessionCost}` },
                    { label: 'Total Cost', value: `$${calculateTotalCost()}` },
                  ],
                  confirmText: "Complete Purchase",
                }}
                trigger={
                  <Button 
                    disabled={!additionalSessions || parseFloat(additionalSessions) <= 0}
                    className="w-full mt-4"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Purchase
                  </Button>
                }
                onConfirm={handleAddSessions}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionPurchase;