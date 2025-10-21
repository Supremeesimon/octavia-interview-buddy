import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const SessionPurchase = ({ sessionLength, sessionCost, onSessionPurchase }: SessionPurchaseProps) => {
  const [additionalSessions, setAdditionalSessions] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [stripePromise, setStripePromise] = useState<any>(null);
  
  useEffect(() => {
    const initializeStripe = async () => {
      // Use import.meta.env instead of process.env for Vite projects
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (stripeKey) {
        const stripe = await loadStripe(stripeKey);
        setStripePromise(stripe);
      }
    };
    
    initializeStripe();
  }, []);
  
  // Fetch payment methods when component mounts
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setLoadingPaymentMethods(true);
      try {
        const methods = await SessionService.getPaymentMethods();
        // Ensure methods is an array before using it
        const safeMethods = Array.isArray(methods) ? methods : [];
        setPaymentMethods(safeMethods);
        // Set the default payment method as selected
        const defaultMethod = safeMethods.find((method: PaymentMethod) => method.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.id);
        } else if (safeMethods.length > 0) {
          setSelectedPaymentMethod(safeMethods[0].id);
        }
      } catch (error: any) {
        console.error('Failed to fetch payment methods:', error);
        // Set empty array on error to prevent null reference
        setPaymentMethods([]);
        
        // Provide user-friendly error message for token issues
        if (error.status === 403 && error.message === 'Invalid or expired token') {
          toast({
            title: "Session expired",
            description: "Please log in again to view your payment methods.",
            variant: "destructive"
          });
        } else if (error.status === 401) {
          toast({
            title: "Authentication required",
            description: "Please log in to view your payment methods.",
            variant: "destructive"
          });
        } else if (error.status >= 500) {
          toast({
            title: "Server error",
            description: "Unable to load payment methods. Please try again later.",
            variant: "destructive"
          });
        }
        // For other errors, we don't show a toast to avoid spamming the user
      } finally {
        setLoadingPaymentMethods(false);
      }
    };
    
    fetchPaymentMethods();
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
    
    // Call the shared handler with the parsed value
    await handleAddSessionsInternal(sessionsToAdd);
  };
  
  // New function to handle sessions with a specific count (for quick purchase buttons)
  const handleAddSessionsWithCount = async (sessionCount: number) => {
    if (sessionCount <= 0) {
      toast({
        title: "Invalid session count",
        description: "Please enter a valid number of sessions to add",
        variant: "destructive"
      });
      return;
    }
    
    // Call the shared handler with the provided count
    await handleAddSessionsInternal(sessionCount);
  };
  
  // Shared handler for both manual entry and quick purchase
  const handleAddSessionsInternal = async (sessionsToAdd: number) => {
    try {
      // Check if user has a payment method selected or needs to enter card details
      if ((!selectedPaymentMethod || selectedPaymentMethod === '') && 
          (!paymentMethods || paymentMethods.length === 0)) {
        toast({
          title: "Payment method required",
          description: "Please enter your card details when prompted to complete this purchase.",
        });
        // We'll still proceed with the purchase, as Stripe will handle the card entry
      }
      
      // Use SessionService instead of direct fetch for consistency
      const purchaseData = {
        sessionCount: sessionsToAdd,
        pricePerSession: sessionLength * parseFloat(sessionCost), // Price per session, not per minute
        paymentMethodId: selectedPaymentMethod || undefined // Only include if we have a selected method
      };

      const result = await SessionService.createSessionPurchase(purchaseData);
      
      // Handle the response
      if (result?.data?.clientSecret && stripePromise) {
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
          
          // Calculate the correct total cost (sessions × duration × price per minute)
          const costPerSession = sessionLength * parseFloat(sessionCost);
          const totalCost = parseFloat((sessionsToAdd * costPerSession).toFixed(2));
          
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
        // Calculate the correct total cost (sessions × duration × price per minute)
        const costPerSession = sessionLength * parseFloat(sessionCost);
        const totalCost = parseFloat((sessionsToAdd * costPerSession).toFixed(2));
        
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
      // Provide more specific error messages based on the error type
      let errorMessage = "Purchase failed";
      let errorDescription = error.message || "An unexpected error occurred";
      
      if (error.status === 401) {
        errorMessage = "Authentication required";
        errorDescription = "Please log in again to complete this purchase";
      } else if (error.status === 403) {
        if (error.message === 'Invalid or expired token') {
          errorMessage = "Session expired";
          errorDescription = "Please log in again to complete this purchase";
        } else {
          errorMessage = "Permission denied";
          errorDescription = "You don't have permission to purchase sessions";
        }
      } else if (error.status === 404) {
        errorMessage = "Purchase endpoint not found";
        errorDescription = "The session purchase service is currently unavailable";
      } else if (error.status >= 500) {
        errorMessage = "Server error";
        errorDescription = "There was a problem processing your purchase. Please try again later.";
      } else if (error.status === 400) {
        errorMessage = "Invalid request";
        errorDescription = error.message || "Please check your purchase details and try again";
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: "destructive"
      });
      
      console.error('Purchase error:', error);
    }
  };
  
  const calculateBundleCost = (sessions: number) => {
    // Calculate the cost per session (duration × price per minute)
    const costPerSession = sessionLength * parseFloat(sessionCost);
    // Calculate total cost for the bundle
    return (sessions * costPerSession).toFixed(2);
  };

  const calculateTotalCost = () => {
    const sessions = parseInt(additionalSessions) || 0;
    // Calculate the cost per session (duration × price per minute)
    const costPerSession = sessionLength * parseFloat(sessionCost);
    // Calculate total cost
    return (sessions * costPerSession).toFixed(2);
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
      <CardContent className="space-y-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Purchase Options */}
          <div className="lg:col-span-2 space-y-6">
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
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                {loadingPaymentMethods ? (
                  <p className="text-sm text-muted-foreground">Loading payment methods...</p>
                ) : paymentMethods && paymentMethods.length > 0 ? (
                  <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.id} value={method.id}>
                          {method.brand} •••• {method.last4} (Expires {method.expMonth}/{method.expYear.toString().slice(-2)})
                          {method.isDefault && " (Default)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="rounded-md border border-dashed border-muted-foreground/50 p-4 text-center">
                    <CreditCard className="mx-auto h-6 w-6 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No saved payment methods found. You'll be prompted to enter your card details when you complete your purchase.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Purchase Options */}
            <div className="space-y-3">
              <div className="font-medium">Quick Purchase Options</div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3">
                <ConfirmationDialog
                  details={{
                    title: "Confirm Purchase",
                    description: "Are you sure you want to purchase 100 interview sessions?",
                    items: [
                      { label: 'Number of Sessions', value: '100' },
                      { label: 'Session Duration', value: `${sessionLength} minutes` },
                      { label: 'Cost per Session', value: `$${(sessionLength * parseFloat(sessionCost)).toFixed(2)}` },
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
                    // Pass the session count directly to avoid state update delays
                    handleAddSessionsWithCount(100);
                  }}
                />
                <ConfirmationDialog
                  details={{
                    title: "Confirm Purchase",
                    description: "Are you sure you want to purchase 500 interview sessions?",
                    items: [
                      { label: 'Number of Sessions', value: '500' },
                      { label: 'Session Duration', value: `${sessionLength} minutes` },
                      { label: 'Cost per Session', value: `$${(sessionLength * parseFloat(sessionCost)).toFixed(2)}` },
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
                    // Pass the session count directly to avoid state update delays
                    handleAddSessionsWithCount(500);
                  }}
                />
                <ConfirmationDialog
                  details={{
                    title: "Confirm Purchase",
                    description: "Are you sure you want to purchase 1000 interview sessions?",
                    items: [
                      { label: 'Number of Sessions', value: '1000' },
                      { label: 'Session Duration', value: `${sessionLength} minutes` },
                      { label: 'Cost per Session', value: `$${(sessionLength * parseFloat(sessionCost)).toFixed(2)}` },
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
                    // Pass the session count directly to avoid state update delays
                    handleAddSessionsWithCount(1000);
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <h3 className="font-medium text-lg mb-4">Order Summary</h3>
            <div className="space-y-3">
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
                <span>${(sessionLength * parseFloat(sessionCost)).toFixed(2)}</span>
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
                    { label: 'Cost per Session', value: `$${(sessionLength * parseFloat(sessionCost)).toFixed(2)}` },
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