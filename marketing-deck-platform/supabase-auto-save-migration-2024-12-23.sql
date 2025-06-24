-- AUTO-SAVE MIGRATION FOR PRESENTATION SYSTEM
-- Migration: supabase-auto-save-migration-2024-12-23.sql
-- Created: 2024-12-23
-- Purpose: Add comprehensive auto-save and draft functionality to presentations

-- Create migrations_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- Log this migration
INSERT INTO migrations_log (migration_name, description) 
VALUES ('auto-save-migration-2024-12-23', 'Added presentation auto-save and draft system')
ON CONFLICT (migration_name) DO NOTHING;

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

-- Create presentation_drafts table for auto-save and version history
CREATE TABLE IF NOT EXISTS presentation_drafts (
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
  changes_summary TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Add indexes for performance on presentation_drafts
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

-- Add RLS (Row Level Security) policies for presentation_drafts
ALTER TABLE presentation_drafts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own drafts
DROP POLICY IF EXISTS "Users can access their own presentation drafts" ON presentation_drafts;
CREATE POLICY "Users can access their own presentation drafts" 
  ON presentation_drafts FOR ALL 
  USING (auth.uid() = user_id);

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

-- Update existing presentations to enable auto-save by default
UPDATE presentations 
SET auto_save_enabled = true, 
    auto_save_count = 0,
    metadata = COALESCE(metadata, '{}'::jsonb)
WHERE auto_save_enabled IS NULL;

-- Create storage bucket for slide exports if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('slide-exports', 'slide-exports', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for slide exports
DROP POLICY IF EXISTS "Anyone can view slide exports" ON storage.objects;
CREATE POLICY "Anyone can view slide exports"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'slide-exports');

DROP POLICY IF EXISTS "Users can upload slide exports" ON storage.objects;
CREATE POLICY "Users can upload slide exports"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'slide-exports' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their slide exports" ON storage.objects;
CREATE POLICY "Users can update their slide exports"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'slide-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their slide exports" ON storage.objects;
CREATE POLICY "Users can delete their slide exports"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'slide-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Auto-save migration completed successfully!';
  RAISE NOTICE '📊 Tables updated: presentations (added auto-save columns)';
  RAISE NOTICE '📋 Tables created: presentation_drafts';
  RAISE NOTICE '⚙️  Functions created: update_presentation_auto_save_metadata, cleanup_old_auto_save_drafts';
  RAISE NOTICE '👁️  Views created: latest_presentation_drafts';
  RAISE NOTICE '🔒 RLS policies and indexes applied';
  RAISE NOTICE '💾 Storage bucket configured for slide exports';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your presentation auto-save system is now ready!';
END $$;

-- Verification queries (uncomment to test)
/*
-- Check if auto-save columns exist
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('presentations', 'presentation_drafts')
  AND column_name LIKE '%auto%' OR column_name IN ('slides_data', 'metadata', 'export_formats')
ORDER BY table_name, ordinal_position;

-- Check if presentation_drafts table exists
SELECT COUNT(*) as table_exists FROM information_schema.tables 
WHERE table_name = 'presentation_drafts';

-- Check indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('presentations', 'presentation_drafts')
  AND indexname LIKE '%auto%' OR indexname LIKE '%draft%'
ORDER BY tablename, indexname;

-- Test latest drafts view
SELECT COUNT(*) as view_works FROM latest_presentation_drafts;
*/