-- Migration script to update session_allocations table
-- This script removes the group_id column and ensures student_id column exists

-- Check if group_id column exists and remove it
ALTER TABLE session_allocations 
DROP COLUMN IF EXISTS group_id;

-- Check if student_id column exists, add it if it doesn't
ALTER TABLE session_allocations 
ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Update any existing allocations to ensure data consistency
-- Set student_id to NULL for department allocations
UPDATE session_allocations 
SET student_id = NULL 
WHERE department_id IS NOT NULL;

-- Add comment to clarify the table structure
COMMENT ON TABLE session_allocations IS 'Session allocations for departments or individual students';