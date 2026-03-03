import React, { useState } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, RotateCcw, ChartLine, History, Headphones, Zap, Mic, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';

// Load stripe promise
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Payment Form Component
interface PaymentFormProps {
  planType: 'monthly' | 'quarterly';
  onComplete: (paymentMethodId: string, email: string, name: string) => void;
  onCancel: () => void;
}

const PaymentFormInner: React.FC<PaymentFormProps> = ({ planType, onComplete, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
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

      // Pass the payment method ID to the parent component along with user details
      onComplete(paymentMethod.id, email, name);
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
              hidePostalCode: true,
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
            `Start Trial (Pay $${planType === 'monthly' ? '20' : '45'} in 14 days)`
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
};

// Main component
const PremiumSubscriptionPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const handlePaymentSuccess = async (paymentMethodId: string, email: string, name: string) => {
    // For guest checkout, we'll store the payment details to process after signup
    const paymentIntentData = {
      planType: selectedPlan,
      email,
      name
    };
    
    // Store the payment intent data in localStorage to be used after signup
    localStorage.setItem('pendingPaymentIntent', JSON.stringify(paymentIntentData));
    localStorage.setItem('pendingPaymentMethodId', paymentMethodId);

    // Show success message
    toast.success('Payment secured! Now complete your account setup.');

    // Close payment dialog
    setShowPaymentDialog(false);

    // Redirect to signup page
    window.location.href = '/signup-external';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Unlock Premium Interview Features</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Subscribe to access unlimited interview sessions, advanced feedback, and career coaching tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card className="border-primary border-2 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Monthly Plan</span>
                  <Badge variant="secondary" className="text-lg py-1 px-3">$20<span className="text-sm ml-1">/mo</span></Badge>
                </CardTitle>
                <CardDescription>Perfect for occasional practice</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 text-sm text-muted-foreground flex-1">
                  <div className="pb-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-primary mb-2">Core Features</p>
                    <div className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Unlimited interview sessions</strong>
                          <div className="text-xs">Practice key scenarios</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChartLine className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Advanced AI feedback</strong>
                          <div className="text-xs">Summary and score after sessions</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <History className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Career coaching tools</strong>
                          <div className="text-xs">Review your recent progress</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Headphones className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Priority support</strong>
                          <div className="text-xs">Email assistance</div>
                        </div>
                      </li>
                    </div>
                  </div>
                  <li className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>14-day free trial</span>
                  </li>
                </div>
                <Button 
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-6 text-lg"
                  onClick={() => {
                    setSelectedPlan('monthly');
                    setShowPaymentDialog(true);
                  }}
                >
                  Begin 14 Days Free Trial
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary border-2 bg-primary/5 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Quarterly Plan</span>
                  <Badge variant="secondary" className="text-lg py-1 px-3 bg-purple-500 text-white">$45<span className="text-sm ml-1">/quarter</span></Badge>
                </CardTitle>
                <CardDescription className="text-purple-700">Best value - save 25%</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 text-sm text-muted-foreground flex-1">
                  <div className="pb-1">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-primary mb-2">Core Features</p>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-foreground">Everything in Monthly Plan</strong>
                        <div className="text-xs">More practice, faster results</div>
                      </div>
                    </li>
                  </div>
                  <div className="pt-2 pb-1 border-t border-border/50">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-primary mb-2">Advanced Features</p>
                    <div className="space-y-3">
                      <li className="flex items-start gap-2">
                        <ChartLine className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Resume builder tools</strong>
                          <div className="text-xs">Deeper behavioral insights</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Interview scheduling assistant</strong>
                          <div className="text-xs">Live coaching during the call</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Mic className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Mock interview recordings</strong>
                          <div className="text-xs">Full review capabilities</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <History className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                        <div>
                          <strong className="text-foreground">Expert career advice</strong>
                          <div className="text-xs">Long-term progress tracking</div>
                        </div>
                      </li>
                    </div>
                  </div>
                  <li className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span>14-day free trial</span>
                  </li>
                </div>
                <Button 
                  className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white py-6 text-lg"
                  onClick={() => {
                    setSelectedPlan('quarterly');
                    setShowPaymentDialog(true);
                  }}
                >
                  Begin 14 Days Free Trial
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Payment Dialog */}
          {showPaymentDialog && selectedPlan && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Complete Your Payment</h3>
                  <button 
                    onClick={() => setShowPaymentDialog(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-1">14-Day Free Trial Active</h4>
                  <p className="text-sm text-blue-700">
                    You will <strong>not</strong> be charged today. 
                    Your first payment of <strong>${selectedPlan === 'monthly' ? '20' : '45'}</strong> will be processed on <strong>{new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>.
                  </p>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your payment details to start your trial. You can cancel anytime before the trial ends to avoid being charged.
                  After setting up your trial, you'll create your account.
                </p>
                
                <PaymentForm 
                  planType={selectedPlan} 
                  onComplete={handlePaymentSuccess} 
                  onCancel={() => setShowPaymentDialog(false)} 
                />
              </div>
            </div>
          )}

          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Why Choose Our Premium Plan?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-muted rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">95%</div>
                <h3 className="font-semibold mb-1">Interview Success Rate</h3>
                <p className="text-sm text-muted-foreground">Users who practice with our platform report higher success rates</p>
              </div>
              <div className="p-6 bg-muted rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">10k+</div>
                <h3 className="font-semibold mb-1">Practice Sessions</h3>
                <p className="text-sm text-muted-foreground">Our users complete thousands of practice interviews monthly</p>
              </div>
              <div className="p-6 bg-muted rounded-lg">
                <div className="text-4xl font-bold text-primary mb-2">4.9/5</div>
                <h3 className="font-semibold mb-1">User Rating</h3>
                <p className="text-sm text-muted-foreground">Trusted by professionals worldwide</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still not convinced? Try our free features first!</p>
            <Link to="/demo">
              <Button variant="outline" className="mr-4">
                Explore Free Features
              </Button>
            </Link>
            <Link to="/signup-external">
              <Button>
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PremiumSubscriptionPage;