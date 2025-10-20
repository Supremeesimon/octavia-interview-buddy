-- Migration: Add stripe_customer_id column to institutions table
-- Description: Add a column to store Stripe customer IDs for institutions
-- Date: 2025-10-15

ALTER TABLE institutions 
ADD COLUMN stripe_customer_id VARCHAR(255);

-- Add a comment to describe the column
COMMENT ON COLUMN institutions.stripe_customer_id IS 'Stripe customer ID for the institution';