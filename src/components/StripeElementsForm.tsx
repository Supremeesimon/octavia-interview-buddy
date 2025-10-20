import React, { useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SessionService } from '@/services/session.service';

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// loadStripe is initialized with your real test publishable API key.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface StripeElementsFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CheckoutForm = ({ onSuccess, onCancel }: StripeElementsFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setLoading(true);

    try {
      // Get a reference to a mounted CardElement. Elements knows how
      // to find your CardElement because there can only ever be one of
      // each type of element.
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        toast({
          title: "Error",
          description: "Card element not found",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create a payment method using the card element
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast({
          title: "Payment method creation failed",
          description: error.message || "An error occurred while creating the payment method",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (paymentMethod) {
        // Save the payment method to the backend
        await SessionService.savePaymentMethod(paymentMethod.id);
        
        toast({
          title: "Payment method added",
          description: "Your payment method has been added successfully",
        });
        
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-md p-3 bg-white">
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
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading ? "Adding..." : "Add Payment Method"}
        </Button>
      </div>
    </form>
  );
};

interface StripeElementsFormWrapperProps extends StripeElementsFormProps {}

const StripeElementsForm = (props: StripeElementsFormWrapperProps) => {
  const options = {
    // Fully customizable with appearance API.
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <div className="p-1">
      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm {...props} />
      </Elements>
    </div>
  );
};

export default StripeElementsForm;