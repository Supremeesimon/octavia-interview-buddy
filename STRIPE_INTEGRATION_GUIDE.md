# Stripe Integration Guide

This guide explains how to set up and configure Stripe payment processing for the Octavia Interview Buddy platform.

## Overview

The Stripe integration enables institutions to purchase interview sessions for their students through secure payment processing. The integration includes:

1. Payment processing for session purchases
2. Customer management for institutions
3. Payment method storage and management
4. Invoice generation and history tracking
5. Webhook handling for payment status updates

## Prerequisites

Before implementing the Stripe integration, ensure you have:

1. A Stripe account (https://dashboard.stripe.com/register)
2. API keys from your Stripe dashboard:
   - Publishable key (for frontend)
   - Secret key (for backend)
   - Webhook signing secret

## Setup Instructions

### 1. Environment Configuration

Add the following environment variables to your backend [.env](file:///Users/simon/AI%20interview%20Buddy%20/octavia-interview-buddy/backend/.env.example) file:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

For production, use your live keys instead of test keys.

### 2. Database Schema Update

The integration requires adding a `stripe_customer_id` column to the institutions table. Run the migration:

```bash
# Apply the migration to add stripe_customer_id column
psql -d your_database -f database/migrations/004_add_stripe_customer_id_column.sql
```

### 3. Backend Services

The integration includes the following backend components:

- **Stripe Service** (`backend/services/stripe.service.js`): Handles all Stripe API interactions
- **Stripe Controller** (`backend/controllers/stripe.controller.js`): Manages webhook events and payment-related operations
- **Session Controller** (`backend/controllers/session.controller.js`): Updated to create payment intents for session purchases
- **Stripe Routes** (`backend/routes/stripe.routes.js`): API endpoints for payment processing

### 4. Frontend Components

The integration updates the following frontend components:

- **BillingControls** (`src/components/BillingControls.tsx`): Institution billing dashboard with real data fetching
- **SessionPurchase** (`src/components/session/SessionPurchase.tsx`): Session purchase workflow with Stripe integration

## How It Works

### Session Purchase Flow

1. Institution selects number of sessions to purchase in the frontend
2. Frontend sends request to backend `/api/sessions/purchases` endpoint
3. Backend creates a Stripe payment intent and session purchase record
4. Backend returns client secret to frontend
5. Frontend uses Stripe.js to confirm the payment with the client secret
6. Upon successful payment, Stripe sends a webhook to the backend
7. Backend updates the session purchase record status to "completed"
8. Institution's session pool is updated with the new sessions

### Webhook Handling

The integration includes webhook handling for:

- `payment_intent.succeeded`: Updates session purchase status to completed
- `payment_intent.payment_failed`: Updates session purchase status to failed

## API Endpoints

### Session Purchases
- `POST /api/sessions/purchases` - Create a new session purchase with payment intent

### Stripe Operations
- `POST /api/stripe/webhook` - Handle Stripe webhook events
- `GET /api/stripe/payment-methods` - Get institution's saved payment methods
- `POST /api/stripe/payment-methods` - Save a new payment method
- `GET /api/stripe/invoices` - Get institution's invoice history

## Security Considerations

1. **Secret Key Protection**: Never expose the Stripe secret key in frontend code
2. **Webhook Validation**: All webhooks are validated using the signing secret
3. **PCI Compliance**: Card data is handled securely by Stripe Elements
4. **Authentication**: All payment-related endpoints require authentication

## Testing

### Test Cards

Use Stripe's test cards for development:
- `4242 4242 4242 4242` - Visa, succeeds
- `4000 0000 0000 0002` - Visa, fails

### Webhook Testing

Use the Stripe CLI for local webhook testing:
```bash
stripe listen --forward-to localhost:3005/api/stripe/webhook
```

## Troubleshooting

### Common Issues

1. **Payment fails with "No such payment_intent"**
   - Ensure the client secret is correctly passed from backend to frontend

2. **Webhook verification fails**
   - Check that `STRIPE_WEBHOOK_SECRET` matches the secret in your Stripe dashboard

3. **"Invalid API Key" errors**
   - Verify that `STRIPE_SECRET_KEY` is correctly set in environment variables

### Logs

Check backend logs for detailed error information:
```bash
# In your backend directory
npm run dev
```

## Customization

### Pricing

Update session pricing in:
- `PRICE_PER_SESSION_ANNUAL` in BillingControls component
- `PRICE_PER_SESSION_QUARTERLY` in BillingControls component

### Payment Methods

To add support for additional payment methods:
1. Update the Stripe Elements form in the frontend
2. Modify the payment method handling in `stripe.service.js`

## Maintenance

### Updating Stripe Library

To update the Stripe Node.js library:
```bash
cd backend
npm install stripe@latest
```

### Monitoring

Monitor payment success rates and failure reasons in the Stripe dashboard.

## Support

For issues with the Stripe integration, check:
1. Stripe Dashboard - https://dashboard.stripe.com/
2. Stripe Documentation - https://stripe.com/docs
3. Platform logs in the backend