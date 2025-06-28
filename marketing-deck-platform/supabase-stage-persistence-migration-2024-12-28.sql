-- STAGE PERSISTENCE MIGRATION
-- Migration: supabase-stage-persistence-migration-2024-12-28.sql
-- Created: 2024-12-28 12:00:00 UTC
-- Purpose: Add JSON columns to persist each stage of presentation building
-- Tables: presentations (add insights_json, outline_json, styled_slides_json, chart_data_json, final_deck_json)

-- ============================================
-- MIGRATION LOGGING
-- ============================================

-- Log this migration
INSERT INTO migrations_log (migration_name, description) 
VALUES ('stage-persistence-migration-2024-12-28', 'Add JSON columns for each stage of presentation building process')
ON CONFLICT (migration_name) DO NOTHING;

-- ============================================
-- PRESENTATIONS TABLE STAGE PERSISTENCE COLUMNS
-- ============================================

-- Add stage persistence columns to presentations table
DO $$ 
BEGIN
  -- Add insights_json column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'insights_json'
  ) THEN
    ALTER TABLE presentations ADD COLUMN insights_json JSONB DEFAULT NULL;
    RAISE NOTICE 'Added insights_json column to presentations table';
  END IF;
  
  -- Add outline_json column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'outline_json'
  ) THEN
    ALTER TABLE presentations ADD COLUMN outline_json JSONB DEFAULT NULL;
    RAISE NOTICE 'Added outline_json column to presentations table';
  END IF;
  
  -- Add styled_slides_json column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'styled_slides_json'
  ) THEN
    ALTER TABLE presentations ADD COLUMN styled_slides_json JSONB DEFAULT NULL;
    RAISE NOTICE 'Added styled_slides_json column to presentations table';
  END IF;

  -- Add chart_data_json column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'chart_data_json'
  ) THEN
    ALTER TABLE presentations ADD COLUMN chart_data_json JSONB DEFAULT NULL;
    RAISE NOTICE 'Added chart_data_json column to presentations table';
  END IF;

  -- Add final_deck_json column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'final_deck_json'
  ) THEN
    ALTER TABLE presentations ADD COLUMN final_deck_json JSONB DEFAULT NULL;
    RAISE NOTICE 'Added final_deck_json column to presentations table';
  END IF;

  -- Add stage_progress column to track which stages are completed
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'stage_progress'
  ) THEN
    ALTER TABLE presentations ADD COLUMN stage_progress JSONB DEFAULT '{
      "insights": false,
      "outline": false,
      "styled_slides": false,
      "chart_data": false,
      "final_deck": false,
      "last_updated_stage": null,
      "completion_percentage": 0
    }'::jsonb;
    RAISE NOTICE 'Added stage_progress column to presentations table';
  END IF;

  -- Add stages_metadata column for additional stage-specific metadata
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'presentations' AND column_name = 'stages_metadata'
  ) THEN
    ALTER TABLE presentations ADD COLUMN stages_metadata JSONB DEFAULT '{
      "insights": {"created_at": null, "version": 1, "source": null},
      "outline": {"created_at": null, "version": 1, "source": null},
      "styled_slides": {"created_at": null, "version": 1, "source": null},
      "chart_data": {"created_at": null, "version": 1, "source": null},
      "final_deck": {"created_at": null, "version": 1, "source": null}
    }'::jsonb;
    RAISE NOTICE 'Added stages_metadata column to presentations table';
  END IF;
END $$;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Add indexes for JSON queries on stage data
CREATE INDEX IF NOT EXISTS idx_presentations_insights_json_gin 
  ON presentations USING GIN (insights_json);

CREATE INDEX IF NOT EXISTS idx_presentations_outline_json_gin 
  ON presentations USING GIN (outline_json);

CREATE INDEX IF NOT EXISTS idx_presentations_styled_slides_json_gin 
  ON presentations USING GIN (styled_slides_json);

CREATE INDEX IF NOT EXISTS idx_presentations_chart_data_json_gin 
  ON presentations USING GIN (chart_data_json);

CREATE INDEX IF NOT EXISTS idx_presentations_final_deck_json_gin 
  ON presentations USING GIN (final_deck_json);

CREATE INDEX IF NOT EXISTS idx_presentations_stage_progress_gin 
  ON presentations USING GIN (stage_progress);

-- Add index for stage completion queries
CREATE INDEX IF NOT EXISTS idx_presentations_stage_completion 
  ON presentations(user_id, ((stage_progress->>'completion_percentage')::integer) DESC);

-- Add index for last updated stage
CREATE INDEX IF NOT EXISTS idx_presentations_last_stage 
  ON presentations(user_id, (stage_progress->>'last_updated_stage'), updated_at DESC);

-- ============================================
-- FUNCTIONS FOR STAGE MANAGEMENT
-- ============================================

-- Function to update stage progress when JSON data is saved
CREATE OR REPLACE FUNCTION update_stage_progress()
RETURNS TRIGGER AS $$
DECLARE
  completed_stages INTEGER := 0;
  total_stages INTEGER := 5;
  completion_percentage INTEGER;
  last_updated_stage TEXT := NULL;
BEGIN
  -- Count completed stages
  IF NEW.insights_json IS NOT NULL THEN 
    completed_stages := completed_stages + 1;
    last_updated_stage := 'insights';
  END IF;
  
  IF NEW.outline_json IS NOT NULL THEN 
    completed_stages := completed_stages + 1;
    last_updated_stage := 'outline';
  END IF;
  
  IF NEW.styled_slides_json IS NOT NULL THEN 
    completed_stages := completed_stages + 1;
    last_updated_stage := 'styled_slides';
  END IF;
  
  IF NEW.chart_data_json IS NOT NULL THEN 
    completed_stages := completed_stages + 1;
    last_updated_stage := 'chart_data';
  END IF;
  
  IF NEW.final_deck_json IS NOT NULL THEN 
    completed_stages := completed_stages + 1;
    last_updated_stage := 'final_deck';
  END IF;
  
  -- Calculate completion percentage
  completion_percentage := (completed_stages * 100) / total_stages;
  
  -- Update stage_progress
  NEW.stage_progress = jsonb_build_object(
    'insights', NEW.insights_json IS NOT NULL,
    'outline', NEW.outline_json IS NOT NULL,
    'styled_slides', NEW.styled_slides_json IS NOT NULL,
    'chart_data', NEW.chart_data_json IS NOT NULL,
    'final_deck', NEW.final_deck_json IS NOT NULL,
    'last_updated_stage', last_updated_stage,
    'completion_percentage', completion_percentage,
    'updated_at', NOW()
  );
  
  -- Update stages_metadata if a specific stage was updated
  IF last_updated_stage IS NOT NULL THEN
    NEW.stages_metadata = jsonb_set(
      COALESCE(NEW.stages_metadata, '{}'::jsonb),
      ARRAY[last_updated_stage],
      jsonb_build_object(
        'created_at', NOW(),
        'version', COALESCE((OLD.stages_metadata->last_updated_stage->>'version')::integer, 0) + 1,
        'source', 'api_update'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for stage progress updates
DROP TRIGGER IF EXISTS trigger_update_stage_progress ON presentations;
CREATE TRIGGER trigger_update_stage_progress
  BEFORE UPDATE ON presentations
  FOR EACH ROW
  WHEN (
    NEW.insights_json IS DISTINCT FROM OLD.insights_json OR
    NEW.outline_json IS DISTINCT FROM OLD.outline_json OR
    NEW.styled_slides_json IS DISTINCT FROM OLD.styled_slides_json OR
    NEW.chart_data_json IS DISTINCT FROM OLD.chart_data_json OR
    NEW.final_deck_json IS DISTINCT FROM OLD.final_deck_json
  )
  EXECUTE FUNCTION update_stage_progress();

-- ============================================
-- HELPER FUNCTIONS FOR STAGE DATA ACCESS
-- ============================================

-- Function to get stage completion summary for a user
CREATE OR REPLACE FUNCTION get_user_stage_completion_summary(user_uuid UUID)
RETURNS TABLE (
  total_presentations BIGINT,
  avg_completion_percentage NUMERIC,
  completed_presentations BIGINT,
  incomplete_presentations BIGINT,
  stage_stats JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_presentations,
    ROUND(AVG((stage_progress->>'completion_percentage')::integer), 2) as avg_completion_percentage,
    COUNT(*) FILTER (WHERE (stage_progress->>'completion_percentage')::integer = 100) as completed_presentations,
    COUNT(*) FILTER (WHERE (stage_progress->>'completion_percentage')::integer < 100) as incomplete_presentations,
    jsonb_build_object(
      'insights_completed', COUNT(*) FILTER (WHERE insights_json IS NOT NULL),
      'outline_completed', COUNT(*) FILTER (WHERE outline_json IS NOT NULL),
      'styled_slides_completed', COUNT(*) FILTER (WHERE styled_slides_json IS NOT NULL),
      'chart_data_completed', COUNT(*) FILTER (WHERE chart_data_json IS NOT NULL),
      'final_deck_completed', COUNT(*) FILTER (WHERE final_deck_json IS NOT NULL)
    ) as stage_stats
  FROM presentations 
  WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VIEWS FOR STAGE DATA ACCESS
-- ============================================

-- Create view for stage completion overview
CREATE OR REPLACE VIEW presentation_stage_overview AS
SELECT 
  p.id,
  p.user_id,
  p.title,
  p.created_at,
  p.updated_at,
  p.stage_progress,
  p.stages_metadata,
  (p.stage_progress->>'completion_percentage')::integer as completion_percentage,
  p.stage_progress->>'last_updated_stage' as last_updated_stage,
  CASE 
    WHEN p.insights_json IS NOT NULL THEN 'completed'
    ELSE 'pending'
  END as insights_status,
  CASE 
    WHEN p.outline_json IS NOT NULL THEN 'completed'
    ELSE 'pending'
  END as outline_status,
  CASE 
    WHEN p.styled_slides_json IS NOT NULL THEN 'completed'
    ELSE 'pending'
  END as styled_slides_status,
  CASE 
    WHEN p.chart_data_json IS NOT NULL THEN 'completed'
    ELSE 'pending'
  END as chart_data_status,
  CASE 
    WHEN p.final_deck_json IS NOT NULL THEN 'completed'
    ELSE 'pending'
  END as final_deck_status
FROM presentations p;

-- ============================================
-- RLS POLICIES FOR STAGE DATA
-- ============================================

-- The existing RLS policies on presentations table will automatically
-- apply to the new columns since they're part of the same table

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions for the new view and function
GRANT SELECT ON presentation_stage_overview TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stage_completion_summary(UUID) TO authenticated;

-- ============================================
-- DATA INITIALIZATION
-- ============================================

-- Initialize stage_progress for existing presentations
UPDATE presentations 
SET 
  stage_progress = jsonb_build_object(
    'insights', insights_json IS NOT NULL,
    'outline', outline_json IS NOT NULL,
    'styled_slides', styled_slides_json IS NOT NULL,
    'chart_data', chart_data_json IS NOT NULL,
    'final_deck', final_deck_json IS NOT NULL,
    'last_updated_stage', NULL,
    'completion_percentage', (
      CASE WHEN insights_json IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN outline_json IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN styled_slides_json IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN chart_data_json IS NOT NULL THEN 1 ELSE 0 END +
      CASE WHEN final_deck_json IS NOT NULL THEN 1 ELSE 0 END
    ) * 20,
    'updated_at', NOW()
  ),
  stages_metadata = COALESCE(stages_metadata, '{
    "insights": {"created_at": null, "version": 1, "source": null},
    "outline": {"created_at": null, "version": 1, "source": null},
    "styled_slides": {"created_at": null, "version": 1, "source": null},
    "chart_data": {"created_at": null, "version": 1, "source": null},
    "final_deck": {"created_at": null, "version": 1, "source": null}
  }'::jsonb)
WHERE stage_progress IS NULL OR stages_metadata IS NULL;

-- ============================================
-- SUCCESS MESSAGE AND VERIFICATION
-- ============================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ STAGE PERSISTENCE MIGRATION SUCCESSFUL!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 COLUMNS ADDED TO PRESENTATIONS TABLE:';
  RAISE NOTICE '   • insights_json (JSONB)';
  RAISE NOTICE '   • outline_json (JSONB)';
  RAISE NOTICE '   • styled_slides_json (JSONB)';
  RAISE NOTICE '   • chart_data_json (JSONB)';
  RAISE NOTICE '   • final_deck_json (JSONB)';
  RAISE NOTICE '   • stage_progress (JSONB)';
  RAISE NOTICE '   • stages_metadata (JSONB)';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 FEATURES ADDED:';
  RAISE NOTICE '   • Stage-by-stage persistence';
  RAISE NOTICE '   • Automatic progress tracking';
  RAISE NOTICE '   • Stage completion analytics';
  RAISE NOTICE '   • Metadata tracking per stage';
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  FUNCTIONS CREATED:';
  RAISE NOTICE '   • update_stage_progress() trigger function';
  RAISE NOTICE '   • get_user_stage_completion_summary()';
  RAISE NOTICE '';
  RAISE NOTICE '👁️  VIEWS CREATED:';
  RAISE NOTICE '   • presentation_stage_overview';
  RAISE NOTICE '';
  RAISE NOTICE '📈 INDEXES CREATED:';
  RAISE NOTICE '   • GIN indexes for JSON queries';
  RAISE NOTICE '   • Stage completion performance indexes';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Stage persistence system is ready!';
  RAISE NOTICE '============================================';
END $$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Verify new columns exist
DO $$
DECLARE
  insights_col INTEGER;
  outline_col INTEGER;
  styled_slides_col INTEGER;
  chart_data_col INTEGER;
  final_deck_col INTEGER;
  stage_progress_col INTEGER;
  stages_metadata_col INTEGER;
BEGIN
  SELECT COUNT(*) INTO insights_col FROM information_schema.columns 
  WHERE table_name = 'presentations' AND column_name = 'insights_json';
  
  SELECT COUNT(*) INTO outline_col FROM information_schema.columns 
  WHERE table_name = 'presentations' AND column_name = 'outline_json';
  
  SELECT COUNT(*) INTO styled_slides_col FROM information_schema.columns 
  WHERE table_name = 'presentations' AND column_name = 'styled_slides_json';
  
  SELECT COUNT(*) INTO chart_data_col FROM information_schema.columns 
  WHERE table_name = 'presentations' AND column_name = 'chart_data_json';
  
  SELECT COUNT(*) INTO final_deck_col FROM information_schema.columns 
  WHERE table_name = 'presentations' AND column_name = 'final_deck_json';
  
  SELECT COUNT(*) INTO stage_progress_col FROM information_schema.columns 
  WHERE table_name = 'presentations' AND column_name = 'stage_progress';
  
  SELECT COUNT(*) INTO stages_metadata_col FROM information_schema.columns 
  WHERE table_name = 'presentations' AND column_name = 'stages_metadata';
  
  RAISE NOTICE '';
  RAISE NOTICE '🔍 VERIFICATION RESULTS:';
  RAISE NOTICE '   • insights_json column: % (should be 1)', insights_col;
  RAISE NOTICE '   • outline_json column: % (should be 1)', outline_col;
  RAISE NOTICE '   • styled_slides_json column: % (should be 1)', styled_slides_col;
  RAISE NOTICE '   • chart_data_json column: % (should be 1)', chart_data_col;
  RAISE NOTICE '   • final_deck_json column: % (should be 1)', final_deck_col;
  RAISE NOTICE '   • stage_progress column: % (should be 1)', stage_progress_col;
  RAISE NOTICE '   • stages_metadata column: % (should be 1)', stages_metadata_col;
  
  IF insights_col = 1 AND outline_col = 1 AND styled_slides_col = 1 AND 
     chart_data_col = 1 AND final_deck_col = 1 AND stage_progress_col = 1 AND
     stages_metadata_col = 1 THEN
    RAISE NOTICE '   ✅ All stage persistence columns exist!';
  ELSE
    RAISE NOTICE '   ⚠️  Some columns may be missing - check above';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 STAGE PERSISTENCE VERIFICATION COMPLETE!';
END $$;