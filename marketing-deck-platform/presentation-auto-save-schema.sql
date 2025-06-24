-- Enhanced Auto-Save and Draft System for Presentations
-- Migration: presentation-auto-save-schema.sql
-- Created: 2024-12-19
-- Purpose: Add comprehensive auto-save and version history support

-- Create presentation_drafts table for auto-save and version history
CREATE TABLE IF NOT EXISTS presentation_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id VARCHAR(255) NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_auto_save BOOLEAN NOT NULL DEFAULT true,
  changes_summary TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_presentation_drafts_presentation_id 
  ON presentation_drafts(presentation_id);
  
CREATE INDEX IF NOT EXISTS idx_presentation_drafts_user_id 
  ON presentation_drafts(user_id);
  
CREATE INDEX IF NOT EXISTS idx_presentation_drafts_created_at 
  ON presentation_drafts(created_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_presentation_drafts_version 
  ON presentation_drafts(presentation_id, version DESC);
  
CREATE INDEX IF NOT EXISTS idx_presentation_drafts_auto_save 
  ON presentation_drafts(presentation_id, user_id, is_auto_save, created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE presentation_drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own drafts
CREATE POLICY "Users can access their own presentation drafts" 
  ON presentation_drafts FOR ALL 
  USING (auth.uid() = user_id);

-- Add auto-save metadata columns to existing presentations table (if they don't exist)
DO $$ 
BEGIN
  -- Add auto_save_enabled column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'auto_save_enabled'
  ) THEN
    ALTER TABLE presentations ADD COLUMN auto_save_enabled BOOLEAN DEFAULT true;
  END IF;
  
  -- Add last_auto_saved column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'last_auto_saved'
  ) THEN
    ALTER TABLE presentations ADD COLUMN last_auto_saved TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add auto_save_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'auto_save_count'
  ) THEN
    ALTER TABLE presentations ADD COLUMN auto_save_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Function to update auto-save metadata
CREATE OR REPLACE FUNCTION update_presentation_auto_save_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update auto-save metadata when a presentation is updated
  IF NEW.metadata IS NOT NULL AND (NEW.metadata->>'autoSaved')::boolean = true THEN
    NEW.last_auto_saved = NOW();
    NEW.auto_save_count = COALESCE(OLD.auto_save_count, 0) + 1;
  END IF;
  
  -- Always update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-save metadata updates
DROP TRIGGER IF EXISTS trigger_update_presentation_auto_save_metadata ON presentations;
CREATE TRIGGER trigger_update_presentation_auto_save_metadata
  BEFORE UPDATE ON presentations
  FOR EACH ROW
  EXECUTE FUNCTION update_presentation_auto_save_metadata();

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

-- Create session recovery view for easy access to latest drafts
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
  changes_summary
FROM presentation_drafts
ORDER BY presentation_id, user_id, created_at DESC;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON presentation_drafts TO authenticated;
GRANT SELECT ON latest_presentation_drafts TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_auto_save_drafts() TO service_role;

-- Create a scheduled cleanup job (requires pg_cron extension)
-- Note: This should be run by a database administrator
-- SELECT cron.schedule('cleanup-auto-save-drafts', '0 2 * * *', 'SELECT cleanup_old_auto_save_drafts();');

-- Insert sample data for testing (optional - remove in production)
-- This helps verify the schema is working correctly
INSERT INTO presentation_drafts (
  presentation_id, 
  user_id, 
  title, 
  slides, 
  metadata,
  version,
  is_auto_save,
  changes_summary
) 
SELECT 
  'test_presentation_' || generate_random_uuid()::text,
  auth.uid(),
  'Test Auto-Save Draft',
  '[{"id": "slide_1", "title": "Test Slide", "content": "Auto-saved content"}]'::jsonb,
  '{"autoSaved": true, "lastChangesSummary": ["test_change"]}'::jsonb,
  1,
  true,
  ARRAY['Initial auto-save test']
WHERE auth.uid() IS NOT NULL;

-- Verification queries (run these to test the setup)
/*
-- Check if tables exist and have correct structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('presentations', 'presentation_drafts')
ORDER BY table_name, ordinal_position;

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('presentations', 'presentation_drafts')
ORDER BY tablename, indexname;

-- Test auto-save draft insertion
SELECT COUNT(*) as draft_count FROM presentation_drafts WHERE is_auto_save = true;

-- Test latest drafts view
SELECT * FROM latest_presentation_drafts LIMIT 5;
*/

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Presentation auto-save schema migration completed successfully!';
  RAISE NOTICE 'Tables created: presentation_drafts';
  RAISE NOTICE 'Functions created: update_presentation_auto_save_metadata, cleanup_old_auto_save_drafts';
  RAISE NOTICE 'Views created: latest_presentation_drafts';
  RAISE NOTICE 'Indexes and RLS policies applied.';
END $$;