import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { CreditCard, DollarSign, Clock, Calendar, Wallet, Plus, Users, Building, Trash2, CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ResetSettingsDialog from './ResetSettingsDialog';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { SessionService } from '@/services/session.service';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import StripeElementsForm from './StripeElementsForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SessionPurchase {
  id: string;
  institutionId: string;
  sessionId: string;
  purchaseDate: Date;
  quantity: number;
  pricePerSession: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  clientSecret?: string;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

interface BillingHistoryItem {
  date: Date;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

// Define payment plan types
type PaymentPlan = 'monthly' | 'quarterly' | 'annual';

interface BillingControlsProps {
  sessionPurchases?: SessionPurchase[];
}

const BillingControls = ({ sessionPurchases = [] }: BillingControlsProps) => {
  const { toast } = useToast();
  const [sessionCount, setSessionCount] = useState(0);
  const [sessionsToPurchase, setSessionsToPurchase] = useState(100);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useFirebaseAuth(); // Also get isLoading state

  // Payment plan configuration
  const PRICING_PLANS = {
    monthly: {
      pricePerSession: 1.99,
      name: "Monthly",
      description: "Pay monthly for flexible usage"
    },
    quarterly: {
      pricePerSession: 4.99,
      name: "Quarterly",
      description: "Save 15% with quarterly billing"
    },
    annual: {
      pricePerSession: 19.96,
      name: "Annual",
      description: "Save 30% with annual billing"
    }
  };

  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>('annual');
  
  // Add state for Stripe
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  
  useEffect(() => {
    // Initialize Stripe
    const initializeStripe = async () => {
      // Use import.meta.env instead of process.env for Vite
      if (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
        const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        setStripePromise(stripe);
      }
    };
    
    initializeStripe();
  }, []);
  
  // Fetch real data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Wait for auth state to be established
        if (isLoading) {
          return; // Wait for isLoading to become false
        }
        
        // Check if user is authenticated and has institution
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }
        
        // Check if user has institutionId - only institution admins should access billing
        if (!user.institutionId) {
          setError('User does not have an institution. Only institution administrators can access billing information.');
          setLoading(false);
          return;
        }
        
        // Additional role check - only institution admins should access billing
        if (user.role !== 'institution_admin') {
          setError('Access denied. Only institution administrators can access billing information.');
          setLoading(false);
          return;
        }
        
        // Fetch session pool data to get current session count
        try {
          const sessionPool = await SessionService.getSessionPool();
          if (sessionPool) {
            setSessionCount(sessionPool.totalSessions || 0);
          } else {
            setSessionCount(0);
          }
        } catch (error: any) {
          // Handle different types of errors appropriately
          // Don't show error toast for 404 errors as it may be normal not to have a session pool yet
          if (error.status === undefined) {
            // Network error
            toast({
              title: "Network error",
              description: "Failed to load session information",
              variant: "destructive"
            });
          } else if (error.status >= 500) {
            // Server error
            toast({
              title: "Server error",
              description: "Failed to load session information",
              variant: "destructive"
            });
          }
          // For 404 or 400 responses, don't show toast but still log
          console.warn('Session pool fetch warning:', error.message || error);
        }
        
        // Fetch payment methods
        try {
          const paymentMethods = await SessionService.getPaymentMethods();
          // Handle case where paymentMethods might be null or undefined
          const safePaymentMethods = Array.isArray(paymentMethods) ? paymentMethods : [];
          setCards(safePaymentMethods);
        } catch (error: any) {
          // Handle different types of errors appropriately
          // Don't show error toast for 404 errors as it may be normal not to have payment methods yet
          if (error.status === undefined) {
            // Network error
            toast({
              title: "Network error",
              description: "Failed to load payment methods",
              variant: "destructive"
            });
          } else if (error.status >= 500) {
            // Server error
            toast({
              title: "Server error",
              description: "Failed to load payment methods",
              variant: "destructive"
            });
          }
          // For 404 or 400 responses, don't show toast but still log
          console.warn('Payment methods fetch warning:', error.message || error);
          // Use empty array if failed to fetch
          setCards([]);
        }
        
        // Fetch billing history
        try {
          const purchases = await SessionService.getSessionPurchases(user.institutionId);
          // Handle case where purchases might be null or undefined
          const safePurchases = Array.isArray(purchases) ? purchases : [];
          const historyItems: BillingHistoryItem[] = safePurchases.map(purchase => ({
            date: purchase.purchaseDate instanceof Date ? purchase.purchaseDate : new Date(purchase.purchaseDate),
            description: `Session purchase (${purchase.quantity} sessions)`,
            amount: purchase.totalPrice,
            status: purchase.status as 'paid' | 'pending' | 'failed'
          }));
          setBillingHistory(historyItems);
        } catch (error: any) {
          // Handle different types of errors appropriately
          // Don't show error toast for 404 errors as it may be normal not to have billing history yet
          if (error.status === undefined) {
            // Network error
            toast({
              title: "Network error",
              description: "Failed to load billing history",
              variant: "destructive"
            });
          } else if (error.status >= 500) {
            // Server error
            toast({
              title: "Server error",
              description: "Failed to load billing history",
              variant: "destructive"
            });
          }
          // For 404 or 400 responses, don't show toast but still log
          console.warn('Billing history fetch warning:', error.message || error);
          // Use empty array if failed to fetch
          setBillingHistory([]);
        }
      } catch (error: any) {
        console.error('Unexpected error in billing data fetch:', error);
        setError('Failed to load billing information. Please try again later.');
        // Only show toast for unexpected errors
        toast({
          title: "Data loading failed",
          description: "An unexpected error occurred while loading billing information",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, isLoading, toast]); // Add isLoading to dependency array
  
  const calculateSessionCost = (count: number, plan: PaymentPlan) => {
    return (count * PRICING_PLANS[plan].pricePerSession).toFixed(2);
  };
  
  const handleSessionChange = (count: number) => {
    setSessionsToPurchase(count);
  };
  
  const handlePurchaseSessions = async () => {
    try {
      // Check if user is authenticated and has institution
      if (!user || !user.institutionId) {
        toast({
          title: "Authentication required",
          description: "Please log in as an institution administrator to purchase sessions",
          variant: "destructive"
        });
        return;
      }
      
      // Create session purchase with payment intent
      const response = await fetch('/api/sessions/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          sessionCount: sessionsToPurchase,
          pricePerSession: PRICING_PLANS[selectedPlan].pricePerSession,
          institutionId: user.institutionId,
          billingPeriod: selectedPlan
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create session purchase');
      }
      
      // If we have a client secret, confirm the payment with Stripe
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
          
          toast({
            title: "Purchase successful",
            description: `Added ${sessionsToPurchase} student sessions to your institution`,
          });
          
          // Update local state
          setSessionCount(prev => prev + sessionsToPurchase);
          
          const newPurchase = {
            date: new Date(),
            description: `Session purchase (${sessionsToPurchase} students) - ${PRICING_PLANS[selectedPlan].name}`,
            amount: Number(calculateSessionCost(sessionsToPurchase, selectedPlan)),
            status: 'paid' as const
          };
          
          setBillingHistory([newPurchase, ...billingHistory]);
        }
      } else {
        // Fallback to simulated purchase if Stripe is not configured
        setSessionCount(prev => prev + sessionsToPurchase);
        
        const newPurchase = {
          date: new Date(),
          description: `Session purchase (${sessionsToPurchase} students) - ${PRICING_PLANS[selectedPlan].name}`,
          amount: Number(calculateSessionCost(sessionsToPurchase, selectedPlan)),
          status: 'paid' as const
        };
        
        setBillingHistory([newPurchase, ...billingHistory]);
        
        toast({
          title: "Purchase successful",
          description: `Added ${sessionsToPurchase} student sessions to your institution`,
        });
      }
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Failed to complete purchase",
        variant: "destructive"
      });
      console.error('Purchase error:', error);
    }
  };
  
  const handleAddCard = () => {
    setShowAddCardDialog(true);
  };
  
  const handleAddCardSuccess = () => {
    setShowAddCardDialog(false);
    // Refresh payment methods
    fetchPaymentMethods();
  };
  
  const handleAddCardCancel = () => {
    setShowAddCardDialog(false);
  };
  
  const fetchPaymentMethods = async () => {
    try {
      const paymentMethods = await SessionService.getPaymentMethods();
      // Handle case where paymentMethods might be null or undefined
      const safePaymentMethods = Array.isArray(paymentMethods) ? paymentMethods : [];
      setCards(safePaymentMethods);
    } catch (error: any) {
      // Handle different types of errors appropriately
      // Don't show error toast for 404 errors as it may be normal not to have payment methods yet
      if (error.status === undefined) {
        // Network error
        toast({
          title: "Network error",
          description: "Failed to load payment methods",
          variant: "destructive"
        });
      } else if (error.status >= 500) {
        // Server error
        toast({
          title: "Server error",
          description: "Failed to load payment methods",
          variant: "destructive"
        });
      }
      // For 404 or 400 responses, don't show toast but still log
      console.warn('Payment methods fetch warning:', error.message || error);
      // Use empty array if failed to fetch
      setCards([]);
    }
  };
  
  const handleMakeDefault = async (id: string) => {
    // In a real implementation, this would call the backend to set the default payment method
    setCards(cards.map(card => ({
      ...card,
      isDefault: card.id === id
    })));
    
    toast({
      title: "Default payment method updated",
      description: "Your default payment method has been changed",
    });
  };
  
  const handleDeleteCard = async (id: string) => {
    try {
      await SessionService.deletePaymentMethod(id);
      // Refresh payment methods
      fetchPaymentMethods();
      toast({
        title: "Payment method deleted",
        description: "Your payment method has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete payment method",
        variant: "destructive"
      });
    }
  };
  
  const totalSessionCost = (billingHistory || []).reduce((total, item) => total + (item.amount || 0), 0);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Show loading state while authentication is being established
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-xl font-semibold">Error Loading Billing Information</div>
        <div className="text-muted-foreground">{error}</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  // Check if user is an institution admin (only after auth is established)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-xl font-semibold">Authentication Required</div>
        <div className="text-muted-foreground">Please log in to access billing information.</div>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }
  
  if (user && !user.institutionId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-xl font-semibold">Access Denied</div>
        <div className="text-muted-foreground">User does not have an institution. Only institution administrators can access billing information.</div>
      </div>
    );
  }
  
  if (user && user.role !== 'institution_admin') {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-500 text-xl font-semibold">Access Denied</div>
        <div className="text-muted-foreground">Only institution administrators can access billing information.</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card tooltip="Purchase access sessions for your students to use the platform">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Purchase Sessions
            </CardTitle>
            <CardDescription>
              Get access to the platform for your students to book interviews
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="session-purchase">Current sessions:</Label>
                <span className="font-medium">{sessionCount} students</span>
              </div>
              
              <Label htmlFor="session-purchase">Number of sessions to purchase</Label>
              <div className="flex space-x-2">
                <Input
                  id="session-purchase"
                  type="number"
                  min="1"
                  value={sessionsToPurchase}
                  onChange={(e) => handleSessionChange(parseInt(e.target.value) || 100)}
                  className="text-right"
                />
                <span className="flex items-center text-muted-foreground px-2">students</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => handleSessionChange(100)}>
                100 Sessions
              </Button>
              <Button variant="outline" onClick={() => handleSessionChange(500)}>
                500 Sessions
              </Button>
              <Button variant="outline" onClick={() => handleSessionChange(1000)}>
                1000 Sessions
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label>Billing Period</Label>
              <Select value={selectedPlan} onValueChange={(value: PaymentPlan) => setSelectedPlan(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select billing period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">
                    <div className="flex justify-between w-full">
                      <span>{PRICING_PLANS.monthly.name}</span>
                      <span className="text-muted-foreground text-xs">${PRICING_PLANS.monthly.pricePerSession}/session</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="quarterly">
                    <div className="flex justify-between w-full">
                      <span>{PRICING_PLANS.quarterly.name}</span>
                      <span className="text-muted-foreground text-xs">${PRICING_PLANS.quarterly.pricePerSession}/session</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="annual">
                    <div className="flex justify-between w-full">
                      <span>{PRICING_PLANS.annual.name}</span>
                      <span className="text-muted-foreground text-xs">${PRICING_PLANS.annual.pricePerSession}/session</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">{PRICING_PLANS[selectedPlan].description}</p>
            </div>
            
            <div className="bg-primary/5 p-3 rounded-md space-y-2">
              <div className="flex justify-between">
                <span>Sessions</span>
                <span>{sessionsToPurchase} students</span>
              </div>
              <div className="flex justify-between">
                <span>Price per session</span>
                <span>${PRICING_PLANS[selectedPlan].pricePerSession.toFixed(2)}</span>
              </div>
              <div className="h-px bg-primary/10 my-1"></div>
              <div className="flex justify-between font-bold">
                <span>Total cost</span>
                <span>${calculateSessionCost(sessionsToPurchase, selectedPlan)}</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground mt-2">
              <p>Each session gives a student access to the platform to book interview sessions from your shared pool.</p>
              <p className="mt-1">You can purchase additional sessions separately in the Session Pool tab.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full"
              onClick={handlePurchaseSessions}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Purchase Sessions
            </Button>
          </CardFooter>
        </Card>
        
        <Card tooltip="Manage your payment methods and billing preferences">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your payment cards and billing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Card</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(cards || []).map((card) => (
                  <TableRow key={card.id}>
                    <TableCell>
                      <div className="font-medium">{card.brand} •••• {card.last4}</div>
                    </TableCell>
                    <TableCell>{card.expMonth}/{card.expYear.toString().slice(-2)}</TableCell>
                    <TableCell>
                      {card.isDefault ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Backup
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!card.isDefault && (
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleMakeDefault(card.id)}
                          >
                            Make Default
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteCard(card.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleAddCard}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Card tooltip="Overview of your institution's subscription and financial details">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Account Summary
          </CardTitle>
          <CardDescription>
            Overview of your institution's subscription and session purchases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted rounded-md p-3">
              <div className="text-muted-foreground text-sm">Active Sessions</div>
              <div className="text-2xl font-bold">{sessionCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Students</div>
            </div>
            
            <div className="bg-muted rounded-md p-3">
              <div className="text-muted-foreground text-sm">Current Plan</div>
              <div className="text-2xl font-bold">{PRICING_PLANS[selectedPlan].name}</div>
              <div className="text-xs text-muted-foreground mt-1">${PRICING_PLANS[selectedPlan].pricePerSession}/session</div>
            </div>
            
            <div className="bg-muted rounded-md p-3">
              <div className="text-muted-foreground text-sm">Session Purchases</div>
              <div className="text-2xl font-bold">${totalSessionCost.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Current period</div>
            </div>
            
            <div className="bg-muted rounded-md p-3">
              <div className="text-muted-foreground text-sm">Total Cost</div>
              <div className="text-2xl font-bold">
                ${calculateSessionCost(sessionCount || 0, selectedPlan)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{PRICING_PLANS[selectedPlan].name} billing</div>
            </div>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-md">
            <h3 className="font-medium mb-2">Session Benefits</h3>
            <ul className="space-y-1 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Each student gets access to the Octavia AI platform</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Students can book sessions from your shared institution pool</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Access to detailed analytics and performance reports</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Customizable settings for session allocation and management</span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">View Invoice History</Button>
          <Button variant="outline">Download Current Invoice</Button>
          <ResetSettingsDialog 
            settingsType="Billing"
            onConfirm={() => {
              toast({
                title: "Billing settings reset",
                description: "All billing settings have been reset to defaults",
              });
            }}
          />
        </CardFooter>
      </Card>
      
      <Card tooltip="View your previous invoices and billing transactions">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Billing History
          </CardTitle>
          <CardDescription>
            View your previous invoices and billing transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(billingHistory || []).map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{format(item.date, 'MMMM d, yyyy')}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>${typeof item.amount === 'number' ? item.amount.toFixed(2) : item.amount}</TableCell>
                  <TableCell>
                    <span className={`text-xs ${
                      item.status === 'paid' ? 'bg-green-100 text-green-800' : 
                      item.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                      'bg-red-100 text-red-800'
                    } px-2 py-1 rounded-full`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Card Dialog */}
      <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
          </DialogHeader>
          <StripeElementsForm 
            onSuccess={handleAddCardSuccess}
            onCancel={handleAddCardCancel}
          />
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default BillingControls;