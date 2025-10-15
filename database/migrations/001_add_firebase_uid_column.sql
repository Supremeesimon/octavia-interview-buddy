-- Migration to add firebase_uid column to users table
-- This allows us to link Firebase users with our backend users

-- Add the firebase_uid column to the users table
ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE;

-- Add an index for better performance when querying by firebase_uid
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

-- Add a comment to document the purpose of the column
COMMENT ON COLUMN users.firebase_uid IS 'Firebase UID for users authenticated via Firebase';