-- Add missing fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS business_context TEXT,
ADD COLUMN IF NOT EXISTS key_metrics JSONB,
ADD COLUMN IF NOT EXISTS data_preferences JSONB;

-- Create presentation_sessions table to replace in-memory storage
CREATE TABLE IF NOT EXISTS presentation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_presentation_sessions_user_id ON presentation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_sessions_created_at ON presentation_sessions(created_at);

-- Add cleanup trigger to remove old sessions (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_old_sessions() RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM presentation_sessions WHERE created_at < NOW() - INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run cleanup on new inserts
DROP TRIGGER IF EXISTS cleanup_sessions_trigger ON presentation_sessions;
CREATE TRIGGER cleanup_sessions_trigger
AFTER INSERT ON presentation_sessions
EXECUTE FUNCTION cleanup_old_sessions();