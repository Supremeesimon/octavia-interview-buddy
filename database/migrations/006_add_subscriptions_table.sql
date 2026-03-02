-- Add subscriptions table for external users
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'cancelled', 'expired', 'past_due');

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE, -- Stripe subscription ID
    stripe_customer_id VARCHAR(255) NOT NULL, -- Stripe customer ID
    plan_type VARCHAR(50) NOT NULL, -- 'monthly' or 'quarterly'
    status subscription_status DEFAULT 'inactive',
    price_cents INTEGER NOT NULL, -- Price in cents (e.g., 2000 for $20)
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_ids ON subscriptions(stripe_subscription_id, stripe_customer_id);

-- Add subscription-related columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_active_subscription BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;