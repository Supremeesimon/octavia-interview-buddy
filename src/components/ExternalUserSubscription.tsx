import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { toast } from 'sonner';
import { DollarSign, Calendar, CreditCard, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

// Make sure to load the stripe promise outside of the component
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface Subscription {
  id: string;
  stripeSubscriptionId: string;
  planType: 'monthly' | 'quarterly';
  status: 'active' | 'inactive' | 'cancelled' | 'expired' | 'past_due';
  priceCents: number;
  periodStart: Date;
  periodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ExternalUserSubscription = () => {
  const { user } = useFirebaseAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly'>('monthly');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Fetch user's subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/subscriptions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            setSubscription({
              ...data.data,
              periodStart: new Date(data.data.period_start),
              periodEnd: new Date(data.data.period_end),
              cancelledAt: data.data.cancelled_at ? new Date(data.data.cancelled_at) : undefined,
              createdAt: new Date(data.data.created_at),
              updatedAt: new Date(data.data.updated_at)
            });
          }
        } else {
          console.error('Failed to fetch subscription:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription information');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user?.id]);

  const handleSubscribe = async (paymentMethodId: string) => {
    if (!user?.id) {
      toast.error('Please sign up or log in first to complete your subscription');
      // Redirect to signup page
      window.location.href = '/signup-external';
      return;
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planType: selectedPlan,
          paymentMethodId
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Subscription created successfully!');
        // Refresh subscription data
        setSubscription({
          id: result.data.id,
          stripeSubscriptionId: result.data.stripeSubscriptionId,
          planType: selectedPlan,
          status: result.data.status,
          priceCents: selectedPlan === 'monthly' ? 2000 : 4500,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + (selectedPlan === 'monthly' ? 30 : 90) * 24 * 60 * 60 * 1000),
          cancelAtPeriodEnd: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setShowPaymentDialog(false);
      } else {
        toast.error(result.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          atPeriodEnd: true // Cancel at the end of the current period
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Subscription scheduled for cancellation');
        // Update local state
        if (subscription) {
          setSubscription({
            ...subscription,
            status: 'cancelled',
            cancelAtPeriodEnd: true
          });
        }
        setCancelDialogOpen(false);
      } else {
        toast.error(result.message || 'Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'past_due':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <RotateCcw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription to access premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)} Plan
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ${subscription.priceCents / 100} {subscription.planType === 'monthly' ? 'per month' : 'per quarter'}
                  </p>
                </div>
                <Badge className={getStatusBadgeVariant(subscription.status)}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Current Period</span>
                  </div>
                  <p className="text-sm">
                    {formatDate(subscription.periodStart)} - {formatDate(subscription.periodEnd)}
                  </p>
                </div>

                {subscription.cancelAtPeriodEnd && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Cancellation Notice</span>
                    </div>
                    <p className="text-sm text-yellow-600">
                      Subscription will be cancelled after current period ends
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                  <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10">
                        Cancel Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Subscription?</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel your subscription? Your access will continue until{' '}
                          {formatDate(subscription.periodEnd)}. After that, you will lose access to premium features.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setCancelDialogOpen(false)}
                        >
                          Keep Subscription
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleCancelSubscription}
                        >
                          Cancel Subscription
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {(subscription.status === 'cancelled' || subscription.cancelAtPeriodEnd) && (
                  <Button variant="outline" disabled>
                    Subscription Cancelled
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center py-4">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium">No Active Subscription</h3>
                <p className="text-muted-foreground mt-1">
                  Subscribe to unlock premium features and unlimited practice sessions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`border-2 ${selectedPlan === 'monthly' ? 'border-primary shadow-md' : 'border-border'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Monthly Plan</h4>
                      <Badge variant="secondary">$20/month</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Unlimited interview sessions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Advanced feedback
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Priority support
                      </li>
                    </ul>
                    <Button
                      className="w-full mt-4"
                      variant={selectedPlan === 'monthly' ? 'default' : 'outline'}
                      onClick={() => setSelectedPlan('monthly')}
                    >
                      Select
                    </Button>
                  </CardContent>
                </Card>

                <Card className={`border-2 ${selectedPlan === 'quarterly' ? 'border-primary shadow-md' : 'border-border'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Quarterly Plan</h4>
                      <Badge variant="secondary">$45/quarter</Badge>
                    </div>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Unlimited interview sessions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Advanced feedback
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Priority support
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        25% savings vs monthly
                      </li>
                    </ul>
                    <Button
                      className="w-full mt-4"
                      variant={selectedPlan === 'quarterly' ? 'default' : 'outline'}
                      onClick={() => setSelectedPlan('quarterly')}
                    >
                      Select
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center pt-4">
                <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="px-8">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Subscribe Now - ${selectedPlan === 'monthly' ? '20' : '45'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Complete Your Subscription</DialogTitle>
                      <DialogDescription>
                        Enter your payment details to subscribe to the {selectedPlan} plan for ${selectedPlan === 'monthly' ? '20' : '45'}.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Elements stripe={stripePromise}>
                      <PaymentForm 
                        planType={selectedPlan} 
                        onComplete={handleSubscribe} 
                        onCancel={() => setShowPaymentDialog(false)} 
                      />
                    </Elements>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Payment Form Component
interface PaymentFormProps {
  planType: 'monthly' | 'quarterly';
  onComplete: (paymentMethodId: string) => void;
  onCancel: () => void;
}

const PaymentFormInner: React.FC<PaymentFormProps> = ({ planType, onComplete, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      toast.error('Stripe.js has not loaded yet. Please try again.');
      return;
    }

    setProcessing(true);

    try {
      // Create a payment method using the card element
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        toast.error('Card element not found');
        setProcessing(false);
        return;
      }
      
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name,
          email,
        },
      });

      if (error) {
        console.error('Payment method creation error:', error);
        toast.error(error.message || 'Payment method creation failed');
        setProcessing(false);
        return;
      }

      // Pass the payment method ID to the parent component
      onComplete(paymentMethod.id);
      setProcessing(false);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Card Details</label>
        <div className="p-3 border rounded-md focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">Cardholder Name</label>
        <input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={processing || !stripe}>
          {processing ? (
            <>
              <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${planType === 'monthly' ? '20' : '45'}`
          )}
        </Button>
      </div>
    </form>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  );

export default ExternalUserSubscription;