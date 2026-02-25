-- Migration: Add LinkedIn URL column to users table

-- Add the linkedin_url column to the users table
ALTER TABLE users ADD COLUMN linkedin_url TEXT;

-- Add a check constraint to validate LinkedIn URL format
ALTER TABLE users ADD CONSTRAINT valid_linkedin_url CHECK (
    linkedin_url IS NULL OR 
    linkedin_url ~* '^https?://([a-z]+\.)?linkedin\.com/.*'
);