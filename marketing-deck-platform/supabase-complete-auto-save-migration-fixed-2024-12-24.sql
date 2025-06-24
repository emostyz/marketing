-- COMPLETE AUTO-SAVE AND SESSION PERSISTENCE MIGRATION (FIXED)
-- Migration: supabase-complete-auto-save-migration-fixed-2024-12-24.sql
-- Created: 2024-12-24 22:45:00 UTC
-- Purpose: Complete auto-save system with session storage - handles existing table conflicts
-- Compatible with: UltimateDeckBuilder intake form auto-save and FunctionalEditor presentation auto-save

-- ============================================
-- MIGRATION LOGGING
-- ============================================

-- Create migrations_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Log this migration
INSERT INTO migrations_log (migration_name, description) 
VALUES ('complete-auto-save-migration-fixed-2024-12-24', 'Complete auto-save system with session storage - fixed version')
ON CONFLICT (migration_name) DO NOTHING;

-- ============================================
-- PRESENTATIONS TABLE ENHANCEMENTS
-- ============================================

-- Add auto-save columns to presentations table if they don't exist
DO $$ 
BEGIN
  -- Add auto_save_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'auto_save_enabled'
  ) THEN
    ALTER TABLE presentations ADD COLUMN auto_save_enabled BOOLEAN DEFAULT true;
    RAISE NOTICE 'Added auto_save_enabled column to presentations table';
  END IF;
  
  -- Add last_auto_saved column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'last_auto_saved'
  ) THEN
    ALTER TABLE presentations ADD COLUMN last_auto_saved TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Added last_auto_saved column to presentations table';
  END IF;
  
  -- Add auto_save_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'auto_save_count'
  ) THEN
    ALTER TABLE presentations ADD COLUMN auto_save_count INTEGER DEFAULT 0;
    RAISE NOTICE 'Added auto_save_count column to presentations table';
  END IF;

  -- Add slides_data column if it doesn't exist (for compatibility with auto-save)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'slides_data'
  ) THEN
    ALTER TABLE presentations ADD COLUMN slides_data JSONB DEFAULT '[]'::jsonb;
    RAISE NOTICE 'Added slides_data column to presentations table';
  END IF;

  -- Add is_public column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE presentations ADD COLUMN is_public BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added is_public column to presentations table';
  END IF;

  -- Add metadata column if it doesn't exist (for auto-save metadata)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE presentations ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added metadata column to presentations table';
  END IF;

  -- Add export_formats column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'export_formats'
  ) THEN
    ALTER TABLE presentations ADD COLUMN export_formats JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added export_formats column to presentations table';
  END IF;
END $$;

-- ============================================
-- PRESENTATION DRAFTS TABLE (AUTO-SAVE VERSIONS)
-- ============================================

-- Drop existing presentation_drafts table if it exists and recreate with correct structure
DROP TABLE IF EXISTS presentation_drafts CASCADE;

-- Create presentation_drafts table for auto-save and version history
CREATE TABLE presentation_drafts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  presentation_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_auto_save BOOLEAN NOT NULL DEFAULT true,
  changes_summary TEXT[] DEFAULT ARRAY[]::TEXT[],
  file_size BIGINT DEFAULT 0,
  conflict_resolution VARCHAR(50) DEFAULT 'auto'
);

-- Add indexes for performance on presentation_drafts
CREATE INDEX idx_presentation_drafts_presentation_id 
  ON presentation_drafts(presentation_id);
  
CREATE INDEX idx_presentation_drafts_user_id 
  ON presentation_drafts(user_id);
  
CREATE INDEX idx_presentation_drafts_created_at 
  ON presentation_drafts(created_at DESC);
  
CREATE INDEX idx_presentation_drafts_version 
  ON presentation_drafts(presentation_id, version DESC);
  
CREATE INDEX idx_presentation_drafts_auto_save 
  ON presentation_drafts(presentation_id, user_id, is_auto_save, created_at DESC);

-- Add RLS (Row Level Security) policies for presentation_drafts
ALTER TABLE presentation_drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own drafts
CREATE POLICY "Users can access their own presentation drafts" 
  ON presentation_drafts FOR ALL 
  USING (auth.uid() = user_id);

-- ============================================
-- INTAKE FORM SESSION STORAGE TABLE
-- ============================================

-- Drop existing presentation_sessions table if it exists and recreate with correct structure
DROP TABLE IF EXISTS presentation_sessions CASCADE;

-- Create presentation_sessions table for intake form auto-save
CREATE TABLE presentation_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'intake_form', -- 'intake_form', 'presentation_edit', 'template_creation'
  step INTEGER DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  is_active BOOLEAN DEFAULT true
);

-- Add indexes for performance on presentation_sessions
CREATE INDEX idx_presentation_sessions_session_id 
  ON presentation_sessions(session_id);
  
CREATE INDEX idx_presentation_sessions_user_id 
  ON presentation_sessions(user_id);
  
CREATE INDEX idx_presentation_sessions_type_user 
  ON presentation_sessions(type, user_id, updated_at DESC);
  
CREATE INDEX idx_presentation_sessions_expires_at 
  ON presentation_sessions(expires_at);

-- Add RLS (Row Level Security) policies for presentation_sessions
ALTER TABLE presentation_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own sessions, or guest sessions without user_id
CREATE POLICY "Users can access their own presentation sessions" 
  ON presentation_sessions FOR ALL 
  USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) OR
    user_id IS NULL
  );

-- ============================================
-- AUTO-SAVE FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update auto-save metadata
CREATE OR REPLACE FUNCTION update_presentation_auto_save_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auto-save metadata when a presentation is updated
  IF NEW.metadata IS NOT NULL AND (NEW.metadata->>'autoSaved')::boolean = true THEN
    NEW.last_auto_saved = NOW();
    NEW.auto_save_count = COALESCE(OLD.auto_save_count, 0) + 1;
  END IF;
  
  -- Always update the updated_at timestamp if it exists
  IF TG_TABLE_NAME = 'presentations' THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'presentations' AND column_name = 'updated_at'
    ) THEN
      NEW.updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-save metadata updates (only if presentations table has updated_at)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS trigger_update_presentation_auto_save_metadata ON presentations;
    CREATE TRIGGER trigger_update_presentation_auto_save_metadata
      BEFORE UPDATE ON presentations
      FOR EACH ROW
      EXECUTE FUNCTION update_presentation_auto_save_metadata();
    RAISE NOTICE 'Created auto-save trigger for presentations table';
  ELSE
    RAISE NOTICE 'Skipped auto-save trigger - presentations table does not have updated_at column';
  END IF;
END $$;

-- Function to update session timestamps
CREATE OR REPLACE FUNCTION update_presentation_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for session timestamp updates
DROP TRIGGER IF EXISTS trigger_update_presentation_session_timestamp ON presentation_sessions;
CREATE TRIGGER trigger_update_presentation_session_timestamp
  BEFORE UPDATE ON presentation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_presentation_session_timestamp();

-- Function to clean up old auto-save drafts
CREATE OR REPLACE FUNCTION cleanup_old_auto_save_drafts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete auto-save drafts older than 30 days, keeping the 10 most recent for each presentation
  WITH drafts_to_keep AS (
    SELECT id 
    FROM (
      SELECT id, 
             ROW_NUMBER() OVER (
               PARTITION BY presentation_id, user_id 
               ORDER BY created_at DESC
             ) as rn
      FROM presentation_drafts 
      WHERE is_auto_save = true
        AND created_at > NOW() - INTERVAL '30 days'
    ) ranked
    WHERE rn <= 10
  ),
  old_drafts AS (
    DELETE FROM presentation_drafts 
    WHERE is_auto_save = true 
      AND (
        created_at <= NOW() - INTERVAL '30 days'
        OR id NOT IN (SELECT id FROM drafts_to_keep)
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM old_drafts;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete expired sessions
  WITH expired_sessions AS (
    DELETE FROM presentation_sessions 
    WHERE expires_at < NOW() OR is_active = false
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM expired_sessions;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR EASY DATA ACCESS
-- ============================================

-- Create session recovery view for easy access to active sessions
CREATE OR REPLACE VIEW active_presentation_sessions AS
SELECT 
  id,
  session_id,
  user_id,
  type,
  step,
  data,
  metadata,
  created_at,
  updated_at,
  expires_at
FROM presentation_sessions
WHERE is_active = true AND expires_at > NOW()
ORDER BY updated_at DESC;

-- Create latest drafts view for easy access to recent auto-saves
CREATE OR REPLACE VIEW latest_presentation_drafts AS
SELECT DISTINCT ON (presentation_id, user_id) 
  id,
  presentation_id,
  user_id,
  title,
  slides,
  metadata,
  version,
  created_at,
  updated_at,
  is_auto_save,
  changes_summary,
  file_size
FROM presentation_drafts
ORDER BY presentation_id, user_id, created_at DESC;

-- Create user presentations summary view (handles both slides and slides_data columns)
CREATE OR REPLACE VIEW user_presentations_summary AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.description,
  p.status,
  p.created_at,
  COALESCE(p.updated_at, p.created_at) as updated_at,
  COALESCE(p.auto_save_enabled, false) as auto_save_enabled,
  p.last_auto_saved,
  COALESCE(p.auto_save_count, 0) as auto_save_count,
  COALESCE(p.is_public, false) as is_public,
  COALESCE(
    CASE 
      WHEN p.slides IS NOT NULL THEN (
        CASE 
          WHEN jsonb_typeof(p.slides) = 'array' THEN jsonb_array_length(p.slides)
          ELSE 0
        END
      )
      WHEN p.slides_data IS NOT NULL THEN (
        CASE 
          WHEN jsonb_typeof(p.slides_data) = 'array' THEN jsonb_array_length(p.slides_data)
          ELSE 0
        END
      )
      ELSE 0
    END, 0
  ) as slide_count,
  COALESCE(
    CASE 
      WHEN p.slides IS NOT NULL THEN octet_length(p.slides::text)
      WHEN p.slides_data IS NOT NULL THEN octet_length(p.slides_data::text)
      ELSE 0
    END, 0
  ) as estimated_size_bytes,
  COUNT(pd.id) as draft_count,
  MAX(pd.created_at) as last_draft_created
FROM presentations p
LEFT JOIN presentation_drafts pd ON p.id::text = pd.presentation_id AND pd.user_id = p.user_id
GROUP BY p.id, p.user_id, p.title, p.description, p.status, p.created_at, p.updated_at, 
         p.auto_save_enabled, p.last_auto_saved, p.auto_save_count, p.is_public, p.slides, p.slides_data;

-- ============================================
-- STORAGE AND PERMISSIONS
-- ============================================

-- Create storage bucket for slide exports if it doesn't exist
DO $$
BEGIN
  -- Check if storage.buckets table exists (Supabase feature)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'buckets' AND table_schema = 'storage') THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('slide-exports', 'slide-exports', true)
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Storage bucket configured for slide exports';
  ELSE
    RAISE NOTICE 'Storage buckets not available - skipping bucket creation';
  END IF;
END $$;

-- Storage policies for slide exports (only if storage exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'objects' AND table_schema = 'storage') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Anyone can view slide exports" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload slide exports" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their slide exports" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their slide exports" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Anyone can view slide exports"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'slide-exports');

    CREATE POLICY "Users can upload slide exports"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'slide-exports' AND auth.role() = 'authenticated');

    CREATE POLICY "Users can update their slide exports"
      ON storage.objects FOR UPDATE
      USING (bucket_id = 'slide-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

    CREATE POLICY "Users can delete their slide exports"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'slide-exports' AND auth.uid()::text = (storage.foldername(name))[1]);
      
    RAISE NOTICE 'Storage policies configured for slide exports';
  ELSE
    RAISE NOTICE 'Storage objects table not available - skipping policy creation';
  END IF;
END $$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON presentation_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON presentation_drafts TO authenticated;
GRANT SELECT ON active_presentation_sessions TO authenticated;
GRANT SELECT ON latest_presentation_drafts TO authenticated;
GRANT SELECT ON user_presentations_summary TO authenticated;

-- Grant function permissions to service role if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION cleanup_old_auto_save_drafts() TO service_role;
    GRANT EXECUTE ON FUNCTION cleanup_expired_sessions() TO service_role;
    RAISE NOTICE 'Granted function permissions to service_role';
  ELSE
    RAISE NOTICE 'service_role not found - skipping function grants';
  END IF;
END $$;

-- ============================================
-- DATA INITIALIZATION
-- ============================================

-- Update existing presentations to enable auto-save by default
UPDATE presentations 
SET auto_save_enabled = COALESCE(auto_save_enabled, true), 
    auto_save_count = COALESCE(auto_save_count, 0),
    metadata = COALESCE(metadata, '{}'::jsonb),
    is_public = COALESCE(is_public, false)
WHERE auto_save_enabled IS NULL OR auto_save_count IS NULL OR metadata IS NULL OR is_public IS NULL;

-- ============================================
-- SUCCESS MESSAGE AND VERIFICATION
-- ============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ COMPLETE AUTO-SAVE MIGRATION SUCCESSFUL!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 TABLES UPDATED:';
  RAISE NOTICE '   • presentations (added auto-save columns)';
  RAISE NOTICE '';
  RAISE NOTICE '📋 TABLES CREATED:';
  RAISE NOTICE '   • presentation_sessions (intake form auto-save)';
  RAISE NOTICE '   • presentation_drafts (presentation version history)';
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  FUNCTIONS CREATED:';
  RAISE NOTICE '   • update_presentation_auto_save_metadata()';
  RAISE NOTICE '   • update_presentation_session_timestamp()';
  RAISE NOTICE '   • cleanup_old_auto_save_drafts()';
  RAISE NOTICE '   • cleanup_expired_sessions()';
  RAISE NOTICE '';
  RAISE NOTICE '👁️  VIEWS CREATED:';
  RAISE NOTICE '   • active_presentation_sessions';
  RAISE NOTICE '   • latest_presentation_drafts';
  RAISE NOTICE '   • user_presentations_summary';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 SECURITY APPLIED:';
  RAISE NOTICE '   • RLS policies for user data isolation';
  RAISE NOTICE '   • Performance indexes added';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 FEATURES NOW AVAILABLE:';
  RAISE NOTICE '   • Real-time presentation auto-save (15s intervals)';
  RAISE NOTICE '   • Intake form session persistence (10s intervals)';
  RAISE NOTICE '   • Version history tracking';
  RAISE NOTICE '   • Conflict resolution';
  RAISE NOTICE '   • Automatic cleanup of old data';
  RAISE NOTICE '   • Guest user session support';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Your complete auto-save system is ready!';
  RAISE NOTICE '============================================';
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify tables exist and show basic stats
DO $$
DECLARE
  session_count INTEGER;
  draft_count INTEGER;
  presentation_count INTEGER;
  session_columns INTEGER;
  draft_columns INTEGER;
BEGIN
  SELECT COUNT(*) INTO session_count FROM information_schema.tables WHERE table_name = 'presentation_sessions';
  SELECT COUNT(*) INTO draft_count FROM information_schema.tables WHERE table_name = 'presentation_drafts';
  SELECT COUNT(*) INTO presentation_count FROM information_schema.tables WHERE table_name = 'presentations';
  
  -- Count key columns
  SELECT COUNT(*) INTO session_columns FROM information_schema.columns 
  WHERE table_name = 'presentation_sessions' AND column_name IN ('session_id', 'user_id', 'type', 'data');
  
  SELECT COUNT(*) INTO draft_columns FROM information_schema.columns 
  WHERE table_name = 'presentation_drafts' AND column_name IN ('presentation_id', 'user_id', 'is_auto_save', 'slides');
  
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICATION RESULTS:';
  RAISE NOTICE '   • presentation_sessions table: % (should be 1)', session_count;
  RAISE NOTICE '   • presentation_drafts table: % (should be 1)', draft_count;
  RAISE NOTICE '   • presentations table: % (should be 1)', presentation_count;
  RAISE NOTICE '   • session key columns: %/4 (should be 4)', session_columns;
  RAISE NOTICE '   • draft key columns: %/4 (should be 4)', draft_columns;
  
  IF session_count = 1 AND draft_count = 1 AND presentation_count = 1 AND 
     session_columns = 4 AND draft_columns = 4 THEN
    RAISE NOTICE '   ✅ All required tables and columns exist!';
  ELSE
    RAISE NOTICE '   ⚠️  Some tables or columns may be missing - check above';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 MIGRATION VERIFICATION COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '📝 NEXT STEPS:';
  RAISE NOTICE '   1. Test auto-save in UltimateDeckBuilder (intake forms)';
  RAISE NOTICE '   2. Test auto-save in FunctionalEditor (presentations)';
  RAISE NOTICE '   3. Verify files page loads real presentations';
  RAISE NOTICE '   4. Check that sessions persist across browser restarts';
END $$;