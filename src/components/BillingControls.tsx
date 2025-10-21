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

interface BillingControlsProps {
  sessionPurchases?: SessionPurchase[];
}

const BillingControls = ({ sessionPurchases = [] }: BillingControlsProps) => {
  const { toast } = useToast();
  const [sessionCount, setSessionCount] = useState(0);
  const [usedSessions, setUsedSessions] = useState(0);
  const [sessionsToPurchase, setSessionsToPurchase] = useState(100);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading } = useFirebaseAuth(); // Also get isLoading state

  // Simple pricing - no plans, just credit-based pricing
  const PRICE_PER_SESSION = 1.99;

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
          console.log('Session pool data fetched:', sessionPool);
          if (sessionPool) {
            setSessionCount(sessionPool.totalSessions || 0);
            setUsedSessions(sessionPool.usedSessions || 0);
          } else {
            setSessionCount(0);
            setUsedSessions(0);
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
  
  const calculateSessionCost = (count: number) => {
    return (count * PRICE_PER_SESSION).toFixed(2);
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
  const availableSessions = sessionCount - usedSessions;
  
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
      {/* Account Summary and Payment Methods in a responsive grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Summary Card */}
        <Card className="lg:col-span-2" tooltip="Overview of your institution's subscription and financial details">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Account Summary
            </CardTitle>
            <CardDescription>
              Overview of your institution's interview session usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-md p-3">
                <div className="text-muted-foreground text-sm">Total Interview Sessions</div>
                <div className="text-2xl font-bold">{sessionCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Purchased sessions</div>
              </div>
              
              <div className="bg-muted rounded-md p-3">
                <div className="text-muted-foreground text-sm">Used Interview Sessions</div>
                <div className="text-2xl font-bold">{usedSessions}</div>
                <div className="text-xs text-muted-foreground mt-1">Sessions consumed</div>
              </div>
              
              <div className="bg-muted rounded-md p-3">
                <div className="text-muted-foreground text-sm">Available Interview Sessions</div>
                <div className="text-2xl font-bold">{availableSessions}</div>
                <div className="text-xs text-muted-foreground mt-1">Ready for students</div>
              </div>
              
              <div className="bg-muted rounded-md p-3">
                <div className="text-muted-foreground text-sm">Total Spent</div>
                <div className="text-2xl font-bold">${totalSessionCost.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground mt-1">All time</div>
              </div>
            </div>
            
            <div className="bg-primary/5 p-4 rounded-md">
              <h3 className="font-medium mb-2">Interview Session Usage</h3>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Total Interview Sessions: All sessions purchased by your institution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Used Interview Sessions: Sessions already consumed by students</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Available Interview Sessions: Sessions remaining for student use</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
        
        {/* Payment Methods Card */}
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
      
      {/* Billing History */}
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