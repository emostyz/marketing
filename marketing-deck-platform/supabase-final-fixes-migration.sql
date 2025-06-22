-- Final Fixes Migration - Incremental to all previous migrations
-- This migration ensures the platform is fully functional
-- Applied after all other supabase-*.sql files

-- 1. Add missing fields to profiles table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'industry') THEN
        ALTER TABLE profiles ADD COLUMN industry TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'target_audience') THEN
        ALTER TABLE profiles ADD COLUMN target_audience TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'business_context') THEN
        ALTER TABLE profiles ADD COLUMN business_context TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'key_metrics') THEN
        ALTER TABLE profiles ADD COLUMN key_metrics JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'data_preferences') THEN
        ALTER TABLE profiles ADD COLUMN data_preferences JSONB;
    END IF;
END $$;

-- 2. Create presentation_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS presentation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_presentation_sessions_user_id ON presentation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_sessions_created_at ON presentation_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 4. Add RLS policies for presentation_sessions
ALTER TABLE presentation_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own presentation sessions" ON presentation_sessions;
DROP POLICY IF EXISTS "Users can create own presentation sessions" ON presentation_sessions;
DROP POLICY IF EXISTS "Users can update own presentation sessions" ON presentation_sessions;
DROP POLICY IF EXISTS "Users can delete own presentation sessions" ON presentation_sessions;

-- Create new policies
CREATE POLICY "Users can view own presentation sessions" ON presentation_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own presentation sessions" ON presentation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentation sessions" ON presentation_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentation sessions" ON presentation_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger for presentation_sessions
DROP TRIGGER IF EXISTS update_presentation_sessions_updated_at ON presentation_sessions;
CREATE TRIGGER update_presentation_sessions_updated_at 
  BEFORE UPDATE ON presentation_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Create cleanup function for old sessions (older than 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_presentation_sessions() 
RETURNS void AS $$
BEGIN
  DELETE FROM presentation_sessions 
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 8. Ensure profiles table has proper constraints
ALTER TABLE profiles ALTER COLUMN email SET NOT NULL;

-- 9. Add session management function for mock auth compatibility
CREATE OR REPLACE FUNCTION get_or_create_profile(user_email TEXT)
RETURNS UUID AS $$
DECLARE
  profile_id UUID;
BEGIN
  -- Try to get existing profile
  SELECT id INTO profile_id FROM profiles WHERE email = user_email;
  
  -- If not found, create new profile
  IF profile_id IS NULL THEN
    INSERT INTO profiles (email, created_at, updated_at)
    VALUES (user_email, NOW(), NOW())
    RETURNING id INTO profile_id;
  END IF;
  
  RETURN profile_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_profile TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_presentation_sessions TO anon, authenticated;

-- 11. Create index on presentations table for better performance
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_created_at ON presentations(created_at);
CREATE INDEX IF NOT EXISTS idx_presentations_status ON presentations(status);

-- 12. Ensure templates table exists with proper structure
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  structure JSONB,
  tags TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add RLS for templates
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public templates are viewable by everyone" ON templates;
DROP POLICY IF EXISTS "Users can create templates" ON templates;

CREATE POLICY "Public templates are viewable by everyone" ON templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE 'Final fixes migration completed successfully!';
  RAISE NOTICE 'The following updates were applied:';
  RAISE NOTICE '- Added missing fields to profiles table';
  RAISE NOTICE '- Created presentation_sessions table for persistent storage';
  RAISE NOTICE '- Added proper indexes for performance';
  RAISE NOTICE '- Set up RLS policies for security';
  RAISE NOTICE '- Created helper functions for session management';
  RAISE NOTICE '- Ensured templates table exists and is properly configured';
END $$;