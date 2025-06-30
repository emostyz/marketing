-- Enhanced AI Pipeline Extensions Migration
-- Extends existing comprehensive schema with enhanced AI pipeline features
-- Compatible with existing stage persistence and progress tracking

-- Extend existing presentations table with enhanced AI fields (idempotent)
ALTER TABLE presentations 
  ADD COLUMN IF NOT EXISTS enhanced_ai_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS python_analysis_quality INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS openai_model_used VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pipeline_version VARCHAR(20) DEFAULT '2.0.0';

-- Add indexes for enhanced AI fields
CREATE INDEX IF NOT EXISTS idx_presentations_enhanced_ai_status ON presentations(enhanced_ai_status);
CREATE INDEX IF NOT EXISTS idx_presentations_python_quality ON presentations(python_analysis_quality);

-- Enhance existing deck_progress table with more granular steps
-- Note: This table may already exist - using IF NOT EXISTS for safety
CREATE TABLE IF NOT EXISTS enhanced_deck_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  pipeline_step VARCHAR(50) NOT NULL, -- analyzing | planning | chart_building | layout_styling | composing | done | error
  step_message TEXT,
  step_metadata JSONB DEFAULT '{}',
  execution_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enhanced_deck_progress_presentation_id ON enhanced_deck_progress(presentation_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_deck_progress_step ON enhanced_deck_progress(pipeline_step);
CREATE INDEX IF NOT EXISTS idx_enhanced_deck_progress_created_at ON enhanced_deck_progress(created_at);

-- Enhanced AI agent interaction tracking
CREATE TABLE IF NOT EXISTS ai_agent_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  agent_type VARCHAR(50) NOT NULL, -- python_analyzer | slide_planner | chart_builder | layout_styler | deck_composer
  input_size_bytes INTEGER DEFAULT 0,
  output_size_bytes INTEGER DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  token_usage JSONB DEFAULT '{}', -- {"input_tokens": 0, "output_tokens": 0, "cost_usd": 0}
  success BOOLEAN DEFAULT true,
  error_details TEXT,
  model_config JSONB DEFAULT '{}', -- Model parameters, version, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_interactions_presentation_id ON ai_agent_interactions(presentation_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_interactions_agent_type ON ai_agent_interactions(agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_agent_interactions_success ON ai_agent_interactions(success);

-- Python analysis results extension table
CREATE TABLE IF NOT EXISTS python_analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  dataset_id UUID, -- May reference datasets table if it exists
  analysis_type VARCHAR(50) NOT NULL, -- 'comprehensive' | 'statistical' | 'correlation' | 'segmentation'
  quality_score INTEGER NOT NULL DEFAULT 0,
  data_summary JSONB NOT NULL DEFAULT '{}',
  insights_extracted JSONB DEFAULT '{}',
  chart_recommendations JSONB DEFAULT '{}',
  narrative_suggestions JSONB DEFAULT '{}',
  processing_metadata JSONB DEFAULT '{}', -- Python version, pandas version, processing time, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_python_analysis_results_presentation_id ON python_analysis_results(presentation_id);
CREATE INDEX IF NOT EXISTS idx_python_analysis_results_quality_score ON python_analysis_results(quality_score);
CREATE INDEX IF NOT EXISTS idx_python_analysis_results_analysis_type ON python_analysis_results(analysis_type);

-- Enhanced slide layout specifications
CREATE TABLE IF NOT EXISTS slide_layout_specifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  slide_number INTEGER NOT NULL,
  layout_template VARCHAR(100) NOT NULL, -- 'executive-summary' | 'text-left-chart-right' | 'chart-focus' etc.
  element_positions JSONB NOT NULL DEFAULT '[]', -- Array of positioned elements
  design_metadata JSONB DEFAULT '{}', -- Colors, fonts, spacing, etc.
  quality_validation JSONB DEFAULT '{}', -- Layout validation results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_slide_layout_specs_presentation_id ON slide_layout_specifications(presentation_id);
CREATE INDEX IF NOT EXISTS idx_slide_layout_specs_slide_number ON slide_layout_specifications(slide_number);

-- Chart generation specifications and cache
CREATE TABLE IF NOT EXISTS chart_generation_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  chart_hash VARCHAR(64) NOT NULL, -- Hash of data + chart type + styling for caching
  chart_type VARCHAR(50) NOT NULL, -- 'bar' | 'line' | 'area' | 'donut' | 'scatter' | 'metrics'
  chart_data JSONB NOT NULL,
  tremor_config JSONB NOT NULL DEFAULT '{}',
  styling_metadata JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}', -- Generation time, data size, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chart_generation_cache_presentation_id ON chart_generation_cache(presentation_id);
CREATE INDEX IF NOT EXISTS idx_chart_generation_cache_hash ON chart_generation_cache(chart_hash);
CREATE INDEX IF NOT EXISTS idx_chart_generation_cache_type ON chart_generation_cache(chart_type);

-- Pipeline execution history for debugging and optimization
CREATE TABLE IF NOT EXISTS pipeline_execution_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  pipeline_version VARCHAR(20) NOT NULL,
  execution_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  execution_end_time TIMESTAMP WITH TIME ZONE,
  total_duration_ms INTEGER,
  step_durations JSONB DEFAULT '{}', -- {"analyzing": 15000, "planning": 8000, ...}
  success BOOLEAN,
  error_step VARCHAR(50), -- Which step failed (if any)
  error_details TEXT,
  performance_metrics JSONB DEFAULT '{}', -- Memory usage, CPU time, etc.
  user_context JSONB DEFAULT '{}', -- Business context provided by user
  data_characteristics JSONB DEFAULT '{}', -- Dataset size, complexity, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_execution_history_presentation_id ON pipeline_execution_history(presentation_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_execution_history_success ON pipeline_execution_history(success);
CREATE INDEX IF NOT EXISTS idx_pipeline_execution_history_version ON pipeline_execution_history(pipeline_version);

-- Update existing presentations table to support enhanced metadata
-- This extends the existing JSONB columns rather than adding new ones
UPDATE presentations 
SET metadata = COALESCE(metadata, '{}') 
WHERE metadata IS NULL;

UPDATE presentations 
SET analytics_data = COALESCE(analytics_data, '{"timeSpentEditing": 0, "slidesCreated": 0, "chartsAdded": 0, "exportsGenerated": 0}') 
WHERE analytics_data IS NULL;

-- Add enhanced AI pipeline support to existing stage_progress JSONB
-- This is a data migration to add new fields to existing records
UPDATE presentations 
SET stage_progress = jsonb_set(
  COALESCE(stage_progress, '{}'),
  '{enhanced_pipeline_enabled}',
  'false'
) WHERE stage_progress IS NOT NULL OR stage_progress IS NULL;

UPDATE presentations 
SET stage_progress = jsonb_set(
  COALESCE(stage_progress, '{}'),
  '{python_analysis_completed}',
  'false'
) WHERE stage_progress IS NOT NULL OR stage_progress IS NULL;

UPDATE presentations 
SET stage_progress = jsonb_set(
  COALESCE(stage_progress, '{}'),
  '{openai_interactions_count}',
  '0'
) WHERE stage_progress IS NOT NULL OR stage_progress IS NULL;

-- RLS policies for new tables
ALTER TABLE enhanced_deck_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE python_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE slide_layout_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_generation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_execution_history ENABLE ROW LEVEL SECURITY;

-- User access policies (users can only see their own data)
CREATE POLICY "Users can view their enhanced deck progress" 
ON enhanced_deck_progress FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM presentations 
    WHERE presentations.id = enhanced_deck_progress.presentation_id 
    AND presentations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their AI agent interactions" 
ON ai_agent_interactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM presentations 
    WHERE presentations.id = ai_agent_interactions.presentation_id 
    AND presentations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their Python analysis results" 
ON python_analysis_results FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM presentations 
    WHERE presentations.id = python_analysis_results.presentation_id 
    AND presentations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their slide layout specs" 
ON slide_layout_specifications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM presentations 
    WHERE presentations.id = slide_layout_specifications.presentation_id 
    AND presentations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their chart generation cache" 
ON chart_generation_cache FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM presentations 
    WHERE presentations.id = chart_generation_cache.presentation_id 
    AND presentations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their pipeline execution history" 
ON pipeline_execution_history FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM presentations 
    WHERE presentations.id = pipeline_execution_history.presentation_id 
    AND presentations.user_id = auth.uid()
  )
);

-- Service role policies for backend operations
CREATE POLICY "Service role can manage enhanced deck progress" 
ON enhanced_deck_progress FOR ALL 
USING (true);

CREATE POLICY "Service role can manage AI agent interactions" 
ON ai_agent_interactions FOR ALL 
USING (true);

CREATE POLICY "Service role can manage Python analysis results" 
ON python_analysis_results FOR ALL 
USING (true);

CREATE POLICY "Service role can manage slide layout specs" 
ON slide_layout_specifications FOR ALL 
USING (true);

CREATE POLICY "Service role can manage chart generation cache" 
ON chart_generation_cache FOR ALL 
USING (true);

CREATE POLICY "Service role can manage pipeline execution history" 
ON pipeline_execution_history FOR ALL 
USING (true);

-- Useful comments for documentation
COMMENT ON TABLE enhanced_deck_progress IS 'Real-time progress tracking for enhanced AI pipeline with granular step information';
COMMENT ON TABLE ai_agent_interactions IS 'Detailed logging of all AI agent interactions with token usage and performance metrics';
COMMENT ON TABLE python_analysis_results IS 'Comprehensive Python analysis results with quality scoring and metadata';
COMMENT ON TABLE slide_layout_specifications IS 'Precise slide layout specifications with absolute positioning and design metadata';
COMMENT ON TABLE chart_generation_cache IS 'Performance cache for chart generation to avoid regenerating identical charts';
COMMENT ON TABLE pipeline_execution_history IS 'Complete execution history for debugging, optimization, and analytics';

COMMENT ON COLUMN presentations.enhanced_ai_status IS 'Enhanced AI pipeline status: pending|analyzing|planning|chart_building|layout_styling|composing|done|error';
COMMENT ON COLUMN presentations.python_analysis_quality IS 'Quality score (0-100) from Python statistical analysis';
COMMENT ON COLUMN presentations.openai_model_used IS 'OpenAI model version used for slide generation';
COMMENT ON COLUMN presentations.pipeline_version IS 'Enhanced AI pipeline version for compatibility tracking';

-- Create a view for easy pipeline monitoring
CREATE OR REPLACE VIEW pipeline_status_overview AS
SELECT 
  p.id as presentation_id,
  p.title,
  p.user_id,
  p.enhanced_ai_status,
  p.python_analysis_quality,
  p.pipeline_version,
  p.created_at,
  p.updated_at,
  COALESCE(peh.total_duration_ms, 0) as last_execution_duration_ms,
  COALESCE(peh.success, false) as last_execution_success,
  (
    SELECT COUNT(*) 
    FROM ai_agent_interactions aai 
    WHERE aai.presentation_id = p.id
  ) as total_ai_interactions,
  (
    SELECT COUNT(*) 
    FROM enhanced_deck_progress edp 
    WHERE edp.presentation_id = p.id
  ) as total_progress_steps
FROM presentations p
LEFT JOIN LATERAL (
  SELECT * FROM pipeline_execution_history peh_inner 
  WHERE peh_inner.presentation_id = p.id 
  ORDER BY peh_inner.created_at DESC 
  LIMIT 1
) peh ON true
WHERE p.enhanced_ai_status IS NOT NULL;

COMMENT ON VIEW pipeline_status_overview IS 'Comprehensive overview of enhanced AI pipeline status and performance metrics';

-- Success message
INSERT INTO public.migration_log (migration_name, executed_at, status) 
VALUES ('20241229000000_enhanced_ai_pipeline_extensions', NOW(), 'completed')
ON CONFLICT DO NOTHING;