-- Migration script to add 'teacher' role to user_role enum
-- This script adds the missing 'teacher' role to support the teacher dashboard functionality

-- First, we need to drop the existing enum type and recreate it with the new value
-- But since we can't directly modify enum types in PostgreSQL, we need to:
-- 1. Create a new enum type with the additional value
-- 2. Update the column to use the new type
-- 3. Drop the old enum type
-- 4. Rename the new enum type to the original name

-- Step 1: Create new enum type with 'teacher' role
CREATE TYPE user_role_new AS ENUM ('student', 'teacher', 'institution_admin', 'platform_admin');

-- Step 2: Update the users table column to use the new type
ALTER TABLE users 
ALTER COLUMN role TYPE user_role_new 
USING role::TEXT::user_role_new;

-- Step 3: Drop the old enum type
DROP TYPE user_role;

-- Step 4: Rename the new enum type to the original name
ALTER TYPE user_role_new RENAME TO user_role;

-- Add comment to clarify the updated enum
COMMENT ON TYPE user_role IS 'User roles: student, teacher, institution_admin, platform_admin';