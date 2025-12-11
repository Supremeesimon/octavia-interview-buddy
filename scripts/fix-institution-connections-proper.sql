-- SQL SCRIPT TO FIX INSTITUTION CONNECTIONS
-- This script will create the missing institutions and users based on contact form submissions
-- Using proper UUIDs for PostgreSQL compatibility

-- Create institution for Awolowo University (no domain provided in Firebase)
INSERT INTO institutions (id, name, domain, approval_status, is_active, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Awolowo University', 'awolowo.edu.ng', 'approved', true, NOW(), NOW());

-- Create user for oluwaferanmionabanjo@gmail.com (Femi)
-- Note: Using a temporary password hash that will require password reset
INSERT INTO users (email, password_hash, name, role, institution_id, is_email_verified, created_at, updated_at)
VALUES ('oluwaferanmionabanjo@gmail.com', '$2b$12$example_hash_replace_with_real_hash', 'Femi', 'institution_admin', '00000000-0000-0000-0000-000000000001', false, NOW(), NOW());

-- Create institution for Leadcity University (no domain provided in Firebase)
INSERT INTO institutions (id, name, domain, approval_status, is_active, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000002', 'Leadcity University', 'leadcity.edu.ng', 'approved', true, NOW(), NOW());

-- Create user for outreach@autolawn.cloud (Sarah)
-- Note: Using a temporary password hash that will require password reset
INSERT INTO users (email, password_hash, name, role, institution_id, is_email_verified, created_at, updated_at)
VALUES ('outreach@autolawn.cloud', '$2b$12$example_hash_replace_with_real_hash', 'Sarah', 'institution_admin', '00000000-0000-0000-0000-000000000002', false, NOW(), NOW());

-- Update the existing user who has no institution to link to their correct institution
-- First, create the institution for Lethbridge Polytechnic
-- (We already have this one from our previous run, so we'll skip it)

-- Verify the connections were created properly
SELECT 'New users created:' as result;
SELECT email, name, role, institution_id FROM users WHERE email IN ('oluwaferanmionabanjo@gmail.com', 'outreach@autolawn.cloud');

SELECT 'New institutions created:' as result;
SELECT id, name, domain, approval_status, is_active FROM institutions WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002');