-- SQL SCRIPT TO FIX INSTITUTION CONNECTIONS
-- This script will create the missing institutions and users based on contact form submissions

-- Create institution for Awolowo University
INSERT INTO institutions (id, name, domain, approval_status, is_active, created_at, updated_at)
VALUES ('0mKFfYGDNigbyc8w6AS9', 'Awolowo University', '', 'approved', true, NOW(), NOW());

-- Create user for oluwaferanmionabanjo@gmail.com (Femi)
-- Note: Using a temporary password hash that will require password reset
INSERT INTO users (email, password_hash, name, role, institution_id, is_email_verified, created_at, updated_at)
VALUES ('oluwaferanmionabanjo@gmail.com', '$2b$12$example_hash_replace_with_real_hash', 'Femi', 'institution_admin', '0mKFfYGDNigbyc8w6AS9', false, NOW(), NOW());

-- Create institution for Leadcity University
INSERT INTO institutions (id, name, domain, approval_status, is_active, created_at, updated_at)
VALUES ('o27XAYG3ifHmWKM56aTV', 'Leadcity University', '', 'approved', true, NOW(), NOW());

-- Create user for outreach@autolawn.cloud (Sarah)
-- Note: Using a temporary password hash that will require password reset
INSERT INTO users (email, password_hash, name, role, institution_id, is_email_verified, created_at, updated_at)
VALUES ('outreach@autolawn.cloud', '$2b$12$example_hash_replace_with_real_hash', 'Sarah', 'institution_admin', 'o27XAYG3ifHmWKM56aTV', false, NOW(), NOW());

-- Verify the connections were created properly
SELECT 'Users created:' as result;
SELECT email, name, role, institution_id FROM users WHERE email IN ('oluwaferanmionabanjo@gmail.com', 'outreach@autolawn.cloud');

SELECT 'Institutions created:' as result;
SELECT id, name, approval_status, is_active FROM institutions WHERE id IN ('0mKFfYGDNigbyc8w6AS9', 'o27XAYG3ifHmWKM56aTV');