-- ================================================
-- COMPREHENSIVE FEEDBACK LOOPS MIGRATION
-- Implements complete AI feedback system for AEDRIN
-- ================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS ai_learning CASCADE;
DROP TABLE IF EXISTS feedback_loops CASCADE;
DROP TABLE IF EXISTS qa_results CASCADE;
DROP TABLE IF EXISTS chart_configs CASCADE;
DROP TABLE IF EXISTS analysis_sessions CASCADE;
DROP TABLE IF EXISTS export_history CASCADE;
DROP TABLE IF EXISTS collaboration_sessions CASCADE;
DROP TABLE IF EXISTS presentation_analytics CASCADE;
DROP VIEW IF EXISTS presentation_analytics CASCADE;

-- ================================================
-- 1. ANALYSIS SESSIONS WITH FEEDBACK
-- ================================================
CREATE TABLE analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  session_id TEXT NOT NULL,
  data_fingerprint TEXT NOT NULL, -- Hash of uploaded data for tracking
  raw_data JSONB NOT NULL,
  analysis_results JSONB NOT NULL,
  feedback_loops JSONB DEFAULT '[]'::jsonb,
  attempts INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  quality_score NUMERIC(3,2) DEFAULT 0,
  user_context TEXT,
  business_goals TEXT[],
  ai_confidence NUMERIC(3,2) DEFAULT 0,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_analysis_sessions_user_id ON analysis_sessions(user_id);
CREATE INDEX idx_analysis_sessions_session_id ON analysis_sessions(session_id);
CREATE INDEX idx_analysis_sessions_approved ON analysis_sessions(approved);
CREATE INDEX idx_analysis_sessions_quality_score ON analysis_sessions(quality_score);

-- ================================================
-- 2. CHART CONFIGURATIONS AND INTERACTIONS
-- ================================================
CREATE TABLE chart_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID REFERENCES presentations(id),
  session_id TEXT NOT NULL,
  chart_type TEXT NOT NULL,
  library TEXT NOT NULL CHECK (library IN ('tremor', 'recharts', 'echarts')),
  data_mapping JSONB NOT NULL,
  raw_data JSONB NOT NULL,
  processed_data JSONB NOT NULL,
  config JSONB NOT NULL,
  user_interactions JSONB DEFAULT '[]'::jsonb,
  ai_insights JSONB,
  ai_recommendations JSONB,
  user_modifications JSONB DEFAULT '{}'::jsonb,
  performance_metrics JSONB DEFAULT '{}'::jsonb,
  mckinsey_compliant BOOLEAN DEFAULT false,
  interactive BOOLEAN DEFAULT true,
  editable BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_chart_configs_presentation_id ON chart_configs(presentation_id);
CREATE INDEX idx_chart_configs_session_id ON chart_configs(session_id);
CREATE INDEX idx_chart_configs_chart_type ON chart_configs(chart_type);
CREATE INDEX idx_chart_configs_library ON chart_configs(library);
CREATE INDEX idx_chart_configs_mckinsey_compliant ON chart_configs(mckinsey_compliant);

-- ================================================
-- 3. QA RESULTS AND TESTING
-- ================================================
CREATE TABLE qa_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID REFERENCES presentations(id),
  session_id TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('data_accuracy', 'narrative_coherence', 'visual_clarity', 'executive_readiness', 'mckinsey_compliance')),
  test_version TEXT DEFAULT 'v1.0',
  passed BOOLEAN NOT NULL,
  score NUMERIC(5,2) NOT NULL,
  max_score NUMERIC(5,2) DEFAULT 100,
  details JSONB NOT NULL,
  issues JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  refinements JSONB,
  auto_fixes_applied JSONB DEFAULT '[]'::jsonb,
  processing_time_ms INTEGER,
  ai_model TEXT DEFAULT 'gpt-4-turbo-preview',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_qa_results_presentation_id ON qa_results(presentation_id);
CREATE INDEX idx_qa_results_session_id ON qa_results(session_id);
CREATE INDEX idx_qa_results_test_type ON qa_results(test_type);
CREATE INDEX idx_qa_results_passed ON qa_results(passed);
CREATE INDEX idx_qa_results_score ON qa_results(score);

-- ================================================
-- 4. FEEDBACK LOOPS TRACKING
-- ================================================
CREATE TABLE feedback_loops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  loop_type TEXT NOT NULL CHECK (loop_type IN ('analysis', 'chart', 'slide', 'export', 'qa')),
  loop_subtype TEXT, -- e.g., 'chart_selection', 'data_validation', etc.
  iteration INTEGER NOT NULL,
  user_feedback JSONB NOT NULL,
  ai_response JSONB NOT NULL,
  ai_confidence NUMERIC(3,2) DEFAULT 0,
  outcome TEXT NOT NULL CHECK (outcome IN ('approved', 'refined', 'rejected', 'timeout')),
  improvement_applied BOOLEAN DEFAULT false,
  learning_captured BOOLEAN DEFAULT false,
  processing_time_ms INTEGER,
  context_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_feedback_loops_session_id ON feedback_loops(session_id);
CREATE INDEX idx_feedback_loops_loop_type ON feedback_loops(loop_type);
CREATE INDEX idx_feedback_loops_outcome ON feedback_loops(outcome);
CREATE INDEX idx_feedback_loops_created_at ON feedback_loops(created_at);

-- ================================================
-- 5. AI LEARNING AND PATTERN RECOGNITION
-- ================================================
CREATE TABLE ai_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  learning_type TEXT NOT NULL CHECK (learning_type IN ('chart_preference', 'style_preference', 'data_pattern', 'business_context', 'quality_standard')),
  context_type TEXT NOT NULL,
  original_output JSONB NOT NULL,
  user_correction JSONB NOT NULL,
  learned_pattern JSONB NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0,
  applied_count INTEGER DEFAULT 0,
  success_rate NUMERIC(3,2) DEFAULT 0,
  domain TEXT, -- e.g., 'finance', 'marketing', 'operations'
  tags TEXT[] DEFAULT '{}',
  validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_applied_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes
CREATE INDEX idx_ai_learning_user_id ON ai_learning(user_id);
CREATE INDEX idx_ai_learning_learning_type ON ai_learning(learning_type);
CREATE INDEX idx_ai_learning_context_type ON ai_learning(context_type);
CREATE INDEX idx_ai_learning_confidence_score ON ai_learning(confidence_score);
CREATE INDEX idx_ai_learning_success_rate ON ai_learning(success_rate);

-- ================================================
-- 6. EXPORT HISTORY AND VALIDATION
-- ================================================
CREATE TABLE export_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID REFERENCES presentations(id),
  session_id TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('pptx', 'pdf', 'google_slides', 'keynote', 'html')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  file_url TEXT,
  file_size_bytes BIGINT,
  download_count INTEGER DEFAULT 0,
  validation_results JSONB,
  pre_export_fixes JSONB DEFAULT '[]'::jsonb,
  export_settings JSONB DEFAULT '{}'::jsonb,
  error_details JSONB,
  processing_time_ms INTEGER,
  quality_score NUMERIC(3,2),
  user_satisfaction INTEGER CHECK (user_satisfaction BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Add indexes
CREATE INDEX idx_export_history_presentation_id ON export_history(presentation_id);
CREATE INDEX idx_export_history_session_id ON export_history(session_id);
CREATE INDEX idx_export_history_format ON export_history(format);
CREATE INDEX idx_export_history_status ON export_history(status);
CREATE INDEX idx_export_history_created_at ON export_history(created_at);

-- ================================================
-- 7. REAL-TIME COLLABORATION TRACKING
-- ================================================
CREATE TABLE collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presentation_id UUID REFERENCES presentations(id),
  session_id TEXT NOT NULL,
  active_users JSONB DEFAULT '[]'::jsonb,
  changes_log JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  real_time_edits JSONB DEFAULT '[]'::jsonb,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  conflicts_resolved INTEGER DEFAULT 0,
  collaboration_quality TEXT DEFAULT 'good' CHECK (collaboration_quality IN ('excellent', 'good', 'fair', 'poor')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes
CREATE INDEX idx_collaboration_sessions_presentation_id ON collaboration_sessions(presentation_id);
CREATE INDEX idx_collaboration_sessions_session_id ON collaboration_sessions(session_id);
CREATE INDEX idx_collaboration_sessions_last_activity_at ON collaboration_sessions(last_activity_at);

-- ================================================
-- 8. UPDATE EXISTING TABLES FOR BACKWARD COMPATIBILITY
-- ================================================

-- Update profiles table with missing fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS business_context TEXT,
ADD COLUMN IF NOT EXISTS key_metrics JSONB,
ADD COLUMN IF NOT EXISTS data_preferences JSONB;

-- Create presentation_sessions table if it doesn't exist (for compatibility)
CREATE TABLE IF NOT EXISTS presentation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for presentation_sessions
CREATE INDEX IF NOT EXISTS idx_presentation_sessions_user_id ON presentation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_sessions_created_at ON presentation_sessions(created_at);

-- Add cleanup function for old presentation sessions (from your original migration)
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

-- Update presentations table with new fields
ALTER TABLE presentations 
ADD COLUMN IF NOT EXISTS ai_context JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS feedback_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS qa_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS iteration_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS quality_score NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS mckinsey_compliant BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ai_model_version TEXT DEFAULT 'gpt-4-turbo-preview',
ADD COLUMN IF NOT EXISTS processing_metrics JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS user_satisfaction INTEGER,
ADD COLUMN IF NOT EXISTS export_ready BOOLEAN DEFAULT false;

-- Add constraints separately (they can't be added with IF NOT EXISTS)
DO $$
BEGIN
  -- Add qa_status constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'presentations_qa_status_check'
  ) THEN
    ALTER TABLE presentations ADD CONSTRAINT presentations_qa_status_check 
    CHECK (qa_status IN ('pending', 'in_progress', 'passed', 'failed', 'needs_review'));
  END IF;
  
  -- Add user_satisfaction constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'presentations_user_satisfaction_check'
  ) THEN
    ALTER TABLE presentations ADD CONSTRAINT presentations_user_satisfaction_check 
    CHECK (user_satisfaction BETWEEN 1 AND 5);
  END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_presentations_qa_status ON presentations(qa_status);
CREATE INDEX IF NOT EXISTS idx_presentations_quality_score ON presentations(quality_score);
CREATE INDEX IF NOT EXISTS idx_presentations_mckinsey_compliant ON presentations(mckinsey_compliant);

-- ================================================
-- 9. ENABLE ROW LEVEL SECURITY
-- ================================================
ALTER TABLE analysis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_loops ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 10. RLS POLICIES
-- ================================================

-- Analysis Sessions Policies
CREATE POLICY "Users can view own analysis sessions" ON analysis_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analysis sessions" ON analysis_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis sessions" ON analysis_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Chart Configs Policies
CREATE POLICY "Users can view charts from own presentations" ON chart_configs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM presentations 
      WHERE presentations.id = chart_configs.presentation_id 
      AND presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create charts for own presentations" ON chart_configs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM presentations 
      WHERE presentations.id = chart_configs.presentation_id 
      AND presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own charts" ON chart_configs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM presentations 
      WHERE presentations.id = chart_configs.presentation_id 
      AND presentations.user_id = auth.uid()
    )
  );

-- QA Results Policies
CREATE POLICY "Users can view QA results for own presentations" ON qa_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM presentations 
      WHERE presentations.id = qa_results.presentation_id 
      AND presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create QA results for own presentations" ON qa_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM presentations 
      WHERE presentations.id = qa_results.presentation_id 
      AND presentations.user_id = auth.uid()
    )
  );

-- Feedback Loops Policies (more permissive for system functionality)
CREATE POLICY "Users can view own feedback loops" ON feedback_loops
  FOR SELECT USING (
    session_id IN (
      SELECT DISTINCT session_id FROM analysis_sessions 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create feedback loops" ON feedback_loops
  FOR INSERT WITH CHECK (true); -- System needs to create these

CREATE POLICY "System can update feedback loops" ON feedback_loops
  FOR UPDATE USING (true); -- System needs to update these

-- AI Learning Policies
CREATE POLICY "Users can view own AI learning data" ON ai_learning
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create AI learning data" ON ai_learning
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL); -- Allow system access

CREATE POLICY "System can update AI learning data" ON ai_learning
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL); -- Allow system access

-- Export History Policies
CREATE POLICY "Users can view own export history" ON export_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM presentations 
      WHERE presentations.id = export_history.presentation_id 
      AND presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage export history" ON export_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM presentations 
      WHERE presentations.id = export_history.presentation_id 
      AND presentations.user_id = auth.uid()
    )
  );

-- Collaboration Sessions Policies
CREATE POLICY "Users can view collaboration for own presentations" ON collaboration_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM presentations 
      WHERE presentations.id = collaboration_sessions.presentation_id 
      AND presentations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage collaboration for own presentations" ON collaboration_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM presentations 
      WHERE presentations.id = collaboration_sessions.presentation_id 
      AND presentations.user_id = auth.uid()
    )
  );

-- ================================================
-- 11. UTILITY FUNCTIONS
-- ================================================

-- Function to get session statistics
CREATE OR REPLACE FUNCTION get_session_stats(p_session_id TEXT)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_iterations', COUNT(*),
    'approved_loops', COUNT(*) FILTER (WHERE outcome = 'approved'),
    'refined_loops', COUNT(*) FILTER (WHERE outcome = 'refined'),
    'rejected_loops', COUNT(*) FILTER (WHERE outcome = 'rejected'),
    'loop_types', array_agg(DISTINCT loop_type),
    'avg_processing_time', AVG(processing_time_ms),
    'total_processing_time', SUM(processing_time_ms)
  ) INTO result
  FROM feedback_loops
  WHERE session_id = p_session_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get AI learning insights for a user
CREATE OR REPLACE FUNCTION get_user_ai_insights(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  top_patterns JSONB[];
BEGIN
  -- Get top 5 patterns separately
  SELECT array_agg(learned_pattern) INTO top_patterns
  FROM (
    SELECT learned_pattern 
    FROM ai_learning 
    WHERE user_id = p_user_id 
    ORDER BY confidence_score DESC 
    LIMIT 5
  ) top_five;
  
  SELECT json_build_object(
    'total_learnings', COUNT(*),
    'chart_preferences', COUNT(*) FILTER (WHERE learning_type = 'chart_preference'),
    'style_preferences', COUNT(*) FILTER (WHERE learning_type = 'style_preference'),
    'avg_success_rate', AVG(success_rate),
    'top_patterns', COALESCE(top_patterns, ARRAY[]::JSONB[]),
    'domains', array_agg(DISTINCT domain) FILTER (WHERE domain IS NOT NULL)
  ) INTO result
  FROM ai_learning
  WHERE user_id = p_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate presentation quality score
CREATE OR REPLACE FUNCTION calculate_presentation_quality(p_presentation_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  qa_avg NUMERIC;
  chart_count INTEGER;
  feedback_quality NUMERIC;
  final_score NUMERIC;
BEGIN
  -- Get average QA score
  SELECT AVG(score) INTO qa_avg
  FROM qa_results
  WHERE presentation_id = p_presentation_id AND passed = true;
  
  -- Get chart configuration quality
  SELECT COUNT(*) INTO chart_count
  FROM chart_configs
  WHERE presentation_id = p_presentation_id AND mckinsey_compliant = true;
  
  -- Get feedback loop quality
  SELECT AVG(ai_confidence) INTO feedback_quality
  FROM feedback_loops fl
  JOIN analysis_sessions as_table ON as_table.session_id = fl.session_id
  WHERE as_table.approved = true;
  
  -- Calculate final score (weighted average)
  final_score := COALESCE(qa_avg * 0.5, 0) + 
                 COALESCE(LEAST(chart_count * 10, 50) * 0.3, 0) + 
                 COALESCE(feedback_quality * 100 * 0.2, 0);
  
  -- Update the presentation
  UPDATE presentations 
  SET quality_score = final_score,
      updated_at = NOW()
  WHERE id = p_presentation_id;
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 12. TRIGGERS FOR AUTOMATIC UPDATES
-- ================================================

-- Trigger to update presentation quality when QA results change
CREATE OR REPLACE FUNCTION trigger_update_presentation_quality()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_presentation_quality(NEW.presentation_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_presentation_quality_on_qa
  AFTER INSERT OR UPDATE ON qa_results
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_presentation_quality();

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_analysis_sessions
  BEFORE UPDATE ON analysis_sessions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_chart_configs
  BEFORE UPDATE ON chart_configs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();

-- ================================================
-- 13. SAMPLE DATA FOR TESTING (OPTIONAL)
-- ================================================

-- Insert sample analysis session (will only work with valid user_id)
-- INSERT INTO analysis_sessions (user_id, session_id, data_fingerprint, raw_data, analysis_results)
-- VALUES (
--   (SELECT id FROM profiles LIMIT 1),
--   'test_session_001',
--   'sample_data_hash_123',
--   '{"sample": "data"}',
--   '{"insights": [], "recommendations": []}'
-- );

-- ================================================
-- MIGRATION COMPLETE
-- ================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create helpful view for dashboard analytics (with error handling)
DO $$
BEGIN
  -- Drop existing view/table if it exists
  DROP VIEW IF EXISTS presentation_analytics CASCADE;
  DROP TABLE IF EXISTS presentation_analytics CASCADE;
  
  -- Create the view
  EXECUTE '
  CREATE VIEW presentation_analytics AS
  SELECT 
    p.id,
    p.title,
    p.user_id,
    COALESCE(p.quality_score, 0) as quality_score,
    COALESCE(p.qa_status, ''pending'') as qa_status,
    COALESCE(p.mckinsey_compliant, false) as mckinsey_compliant,
    COALESCE(p.iteration_count, 0) as iteration_count,
    COUNT(DISTINCT cc.id) as chart_count,
    COUNT(DISTINCT fl.id) as feedback_loops,
    COUNT(DISTINCT qa.id) as qa_tests,
    COALESCE(AVG(qa.score), 0) as avg_qa_score,
    p.created_at,
    p.updated_at
  FROM presentations p
  LEFT JOIN chart_configs cc ON p.id = cc.presentation_id
  LEFT JOIN feedback_loops fl ON p.id::text = fl.session_id
  LEFT JOIN qa_results qa ON p.id = qa.presentation_id
  GROUP BY p.id, p.title, p.user_id, p.quality_score, p.qa_status, p.mckinsey_compliant, p.iteration_count, p.created_at, p.updated_at
  ';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not create presentation_analytics view: %', SQLERRM;
    -- Create a simple fallback view
    EXECUTE '
    CREATE VIEW presentation_analytics AS
    SELECT 
      p.id,
      p.title,
      p.user_id,
      p.created_at,
      p.updated_at
    FROM presentations p
    ';
END $$;

COMMENT ON TABLE analysis_sessions IS 'Tracks AI data analysis with user feedback loops';
COMMENT ON TABLE chart_configs IS 'Stores interactive chart configurations and user modifications';
COMMENT ON TABLE qa_results IS 'Records quality assurance test results for presentations';
COMMENT ON TABLE feedback_loops IS 'Tracks all AI-user feedback iterations across the system';
COMMENT ON TABLE ai_learning IS 'Captures AI learning patterns from user interactions';
COMMENT ON TABLE export_history IS 'Tracks presentation exports and validation';
COMMENT ON TABLE collaboration_sessions IS 'Manages real-time collaboration data';

-- Log successful migration
DO $$
BEGIN
  RAISE NOTICE 'AEDRIN Comprehensive Feedback Loops Migration completed successfully at %', NOW();
  RAISE NOTICE 'Tables created: analysis_sessions, chart_configs, qa_results, feedback_loops, ai_learning, export_history, collaboration_sessions';
  RAISE NOTICE 'Utility functions: get_session_stats, get_user_ai_insights, calculate_presentation_quality';
  RAISE NOTICE 'View created: presentation_analytics';
END $$;