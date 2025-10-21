import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { CreditCard, DollarSign, Clock, Calendar, Wallet, Plus, Users, Building, Trash2, CalendarIcon, Download } from 'lucide-react';
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
  DialogDescription,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { jsPDF } from 'jspdf';

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
  id: string;
  date: Date;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'cancelled';
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

  // Add state for delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState<{id: string, description: string} | null>(null);

  // Add state for invoice dialog
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<BillingHistoryItem | null>(null);

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
          
          const mappedItems = safePurchases.map(purchase => {
            // Validate and sanitize the purchase data
            const quantity = (typeof purchase.quantity === 'number' && !isNaN(purchase.quantity) && purchase.quantity > 0) ? purchase.quantity : 0;
            
            // Calculate total price with multiple fallbacks
            let totalPrice = 0;
            if (typeof purchase.totalPrice === 'number' && !isNaN(purchase.totalPrice) && purchase.totalPrice > 0) {
              // Use the provided totalPrice if available and valid
              totalPrice = purchase.totalPrice;
            } else if (typeof purchase.quantity === 'number' && typeof purchase.pricePerSession === 'number' && 
                      !isNaN(purchase.quantity) && !isNaN(purchase.pricePerSession) && 
                      purchase.quantity > 0 && purchase.pricePerSession > 0) {
              // Calculate from quantity and price per session
              totalPrice = purchase.quantity * purchase.pricePerSession;
            } else {
              // If all else fails, try to parse any string values
              const quantityValue = typeof purchase.quantity === 'string' ? parseFloat(purchase.quantity) : purchase.quantity;
              const priceValue = typeof purchase.pricePerSession === 'string' ? parseFloat(purchase.pricePerSession) : purchase.pricePerSession;
              
              if (typeof quantityValue === 'number' && typeof priceValue === 'number' && 
                  !isNaN(quantityValue) && !isNaN(priceValue) && 
                  quantityValue > 0 && priceValue > 0) {
                totalPrice = quantityValue * priceValue;
              }
            }
            
            const status = purchase.status && typeof purchase.status === 'string' ? purchase.status : 'pending';
            
            // Map status to BillingHistoryItem status type
            const billingStatus: 'paid' | 'pending' | 'failed' | 'cancelled' = 
              status === 'completed' ? 'paid' : 
              status === 'pending' ? 'pending' :
              status === 'cancelled' ? 'cancelled' : 'failed';
            
            return {
              id: typeof purchase.id === 'string' ? purchase.id : '',
              date: purchase.purchaseDate instanceof Date ? purchase.purchaseDate : new Date(purchase.purchaseDate || Date.now()),
              description: `Session purchase (${quantity} sessions)`,
              amount: totalPrice,
              status: billingStatus
            };
          }).filter(item => item.id); // Filter out items without valid IDs
          
          const historyItems: BillingHistoryItem[] = mappedItems;
          
          setBillingHistory(historyItems);
          console.log('Billing history loaded:', historyItems);
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

  // Add function to handle delete session purchase
  const handleDeleteSessionPurchase = (id: string, description: string) => {
    setPurchaseToDelete({ id, description });
    setDeleteDialogOpen(true);
  };

  const confirmDeleteSessionPurchase = async () => {
    if (!purchaseToDelete) return;

    try {
      await SessionService.deleteSessionPurchase(purchaseToDelete.id);
      // Refresh billing history
      if (user) {
        const purchases = await SessionService.getSessionPurchases(user.institutionId);
        const safePurchases = Array.isArray(purchases) ? purchases : [];
        const mappedItems = safePurchases.map(purchase => {
          // Validate and sanitize the purchase data
          const quantity = (typeof purchase.quantity === 'number' && !isNaN(purchase.quantity) && purchase.quantity > 0) ? purchase.quantity : 0;
          
          // Calculate total price with multiple fallbacks
          let totalPrice = 0;
          if (typeof purchase.totalPrice === 'number' && !isNaN(purchase.totalPrice) && purchase.totalPrice > 0) {
            // Use the provided totalPrice if available and valid
            totalPrice = purchase.totalPrice;
          } else if (typeof purchase.quantity === 'number' && typeof purchase.pricePerSession === 'number' && 
                    !isNaN(purchase.quantity) && !isNaN(purchase.pricePerSession) && 
                    purchase.quantity > 0 && purchase.pricePerSession > 0) {
            // Calculate from quantity and price per session
            totalPrice = purchase.quantity * purchase.pricePerSession;
          } else {
            // If all else fails, try to parse any string values
            const quantityValue = typeof purchase.quantity === 'string' ? parseFloat(purchase.quantity) : purchase.quantity;
            const priceValue = typeof purchase.pricePerSession === 'string' ? parseFloat(purchase.pricePerSession) : purchase.pricePerSession;
            
            if (typeof quantityValue === 'number' && typeof priceValue === 'number' && 
                !isNaN(quantityValue) && !isNaN(priceValue) && 
                quantityValue > 0 && priceValue > 0) {
              totalPrice = quantityValue * priceValue;
            }
          }
          
          const status = purchase.status && typeof purchase.status === 'string' ? purchase.status : 'pending';
          
          // Map status to BillingHistoryItem status type
          const billingStatus: 'paid' | 'pending' | 'failed' | 'cancelled' = 
            status === 'completed' ? 'paid' : 
            status === 'pending' ? 'pending' :
            status === 'cancelled' ? 'cancelled' : 'failed';
          
          return {
            id: typeof purchase.id === 'string' ? purchase.id : '',
            date: purchase.purchaseDate instanceof Date ? purchase.purchaseDate : new Date(purchase.purchaseDate || Date.now()),
            description: `Session purchase (${quantity} sessions)`,
            amount: totalPrice,
            status: billingStatus
          };
        }).filter(item => item.id); // Filter out items without valid IDs
        
        const historyItems: BillingHistoryItem[] = mappedItems;
        setBillingHistory(historyItems);
      }
      toast({
        title: "Session purchase deleted",
        description: "Your session purchase has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete session purchase",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setPurchaseToDelete(null);
    }
  };

  const cancelDeleteSessionPurchase = () => {
    setDeleteDialogOpen(false);
    setPurchaseToDelete(null);
  };

  // Add function to handle view invoice
  const handleViewInvoice = (purchase: BillingHistoryItem) => {
    setSelectedPurchase(purchase);
    setInvoiceDialogOpen(true);
  };

  const handleDownloadInvoice = () => {
    if (!selectedPurchase) return;
    
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set the company name properly
    doc.setFontSize(20);
    doc.text('Octavia Practice Interviewer', 20, 20);
    
    doc.setFontSize(12);
    doc.text('AI Interview Practice Platform', 20, 30);
    doc.text('San Francisco, CA', 20, 37);
    doc.text('support@octavia-interview.com', 20, 44);
    
    // Add invoice title
    doc.setFontSize(16);
    doc.text('INVOICE', 150, 20);
    
    // Add invoice details
    doc.setFontSize(12);
    doc.text(`Date: ${format(selectedPurchase.date, 'MMMM d, yyyy')}`, 150, 30);
    doc.text(`Invoice #: INV-${selectedPurchase.id.substring(0, 8).toUpperCase()}`, 150, 37);
    
    // Add a line separator
    doc.line(20, 50, 190, 50);
    
    // Add billing information
    doc.setFontSize(14);
    doc.text('Bill To:', 20, 60);
    
    doc.setFontSize(12);
    if (user) {
      doc.text(user.name || 'Unknown Customer', 20, 70);
      if (user.email) {
        doc.text(user.email, 20, 77);
      }
    }
    
    // Add line items header
    doc.setFontSize(14);
    doc.text('Description', 20, 90);
    doc.text('Amount', 170, 90);
    
    doc.line(20, 95, 190, 95);
    
    // Add the actual line item
    doc.setFontSize(12);
    doc.text(selectedPurchase.description, 20, 105);
    doc.text(`$${typeof selectedPurchase.amount === 'number' ? selectedPurchase.amount.toFixed(2) : '0.00'}`, 170, 105);
    
    // Add total
    doc.line(150, 120, 190, 120);
    doc.setFontSize(14);
    doc.text('Total:', 150, 130);
    doc.text(`$${typeof selectedPurchase.amount === 'number' ? selectedPurchase.amount.toFixed(2) : '0.00'}`, 170, 130);
    
    // Add status
    doc.setFontSize(12);
    doc.text(`Status: ${selectedPurchase.status.charAt(0).toUpperCase() + selectedPurchase.status.slice(1)}`, 20, 130);
    
    // Add footer
    doc.setFontSize(10);
    doc.text('Thank you for your business!', 20, 150);
    doc.text('For any questions regarding this invoice, please contact our support team.', 20, 157);
    
    // Save the PDF with a proper filename
    const fileName = `invoice-${format(selectedPurchase.date, 'yyyy-MM-dd')}-${selectedPurchase.id.substring(0, 8)}.pdf`;
    doc.save(fileName);
    
    toast({
      title: "Invoice Downloaded",
      description: "Your invoice has been downloaded successfully.",
    });
  };

  // Calculate total spent - include all purchases regardless of status
  const totalSessionCost = (billingHistory || []).reduce((total, item) => {
    // Ensure amount is a valid number
    const amount = (typeof item.amount === 'number' && !isNaN(item.amount) && isFinite(item.amount)) ? item.amount : 0;
    return total + amount;
  }, 0);
  
  const availableSessions = sessionCount - usedSessions;
  
  // Ensure totalSessionCost is a valid number
  const validTotalSessionCost = (typeof totalSessionCost === 'number' && !isNaN(totalSessionCost) && isFinite(totalSessionCost)) ? totalSessionCost : 0;
  console.log('Total session cost calculation:', { totalSessionCost, validTotalSessionCost, billingHistory });
  
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
                <div className="text-2xl font-bold">${validTotalSessionCost.toFixed(2)}</div>
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
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewInvoice(item)}
                      >
                        View Invoice
                      </Button>
                      {item.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteSessionPurchase(item.id, item.description)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
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
      
      {/* Delete Session Purchase Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the session purchase "{purchaseToDelete?.description}"? 
              This action cannot be undone and only pending purchases can be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteSessionPurchase}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSessionPurchase} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
            <DialogDescription>
              View details of your session purchase invoice
            </DialogDescription>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Purchase Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{format(selectedPurchase.date, 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Description:</span>
                    <span>{selectedPurchase.description}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">${typeof selectedPurchase.amount === 'number' ? selectedPurchase.amount.toFixed(2) : selectedPurchase.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`${
                      selectedPurchase.status === 'paid' ? 'text-green-600' : 
                      selectedPurchase.status === 'pending' ? 'text-amber-600' : 
                      'text-red-600'
                    }`}>
                      {selectedPurchase.status.charAt(0).toUpperCase() + selectedPurchase.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4">
                <Button variant="outline" onClick={handleDownloadInvoice}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </Button>
                <Button onClick={() => setInvoiceDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
};

export default BillingControls;