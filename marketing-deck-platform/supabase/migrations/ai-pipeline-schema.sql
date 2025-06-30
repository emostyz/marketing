-- AI Pipeline Schema Migration
-- Creates tables and columns needed for CSV→AI Analysis→Slide JSON pipeline

-- Add AI-specific columns to existing presentations table
ALTER TABLE presentations 
  ADD COLUMN IF NOT EXISTS slide_json JSONB,
  ADD COLUMN IF NOT EXISTS analysis_summary JSONB,
  ADD COLUMN IF NOT EXISTS ai_status VARCHAR(20) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS generated_at TIMESTAMP WITH TIME ZONE;

-- Create table for tracking deck generation progress (for SSE)
CREATE TABLE IF NOT EXISTS deck_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  step VARCHAR(50) NOT NULL, -- analyzing | planning | chart_building | composing | done | error
  message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_presentations_ai_status ON presentations(ai_status);
CREATE INDEX IF NOT EXISTS idx_presentations_generated_at ON presentations(generated_at);
CREATE INDEX IF NOT EXISTS idx_deck_progress_deck_id ON deck_progress(deck_id);
CREATE INDEX IF NOT EXISTS idx_deck_progress_step ON deck_progress(step);

-- Create table for storing dataset analysis results
CREATE TABLE IF NOT EXISTS dataset_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dataset_id UUID NOT NULL,
  analysis_type VARCHAR(50) NOT NULL, -- 'pandas_profile' | 'statistical_summary' | 'correlation_matrix'
  analysis_data JSONB NOT NULL,
  quality_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dataset_analyses_dataset_id ON dataset_analyses(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_analyses_type ON dataset_analyses(analysis_type);

-- Create table for storing AI agent interactions and costs
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  agent_type VARCHAR(50) NOT NULL, -- 'slide_planner' | 'chart_builder' | 'layout_styler'
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,4) DEFAULT 0,
  model_used VARCHAR(100),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_deck_id ON ai_interactions(deck_id);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_agent_type ON ai_interactions(agent_type);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at);

-- Update RLS policies for new tables
ALTER TABLE deck_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policy for deck_progress (users can only see progress for their own decks)
CREATE POLICY "Users can view progress for their own decks" 
ON deck_progress FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM presentations 
    WHERE presentations.id = deck_progress.deck_id 
    AND presentations.user_id = auth.uid()
  )
);

-- RLS policy for dataset_analyses (basic access control)
CREATE POLICY "Users can view dataset analyses" 
ON dataset_analyses FOR SELECT 
USING (true); -- Can be restricted based on dataset ownership if needed

-- RLS policy for ai_interactions (users can only see interactions for their own decks)
CREATE POLICY "Users can view AI interactions for their own decks" 
ON ai_interactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM presentations 
    WHERE presentations.id = ai_interactions.deck_id 
    AND presentations.user_id = auth.uid()
  )
);

-- Insert policies for service role
CREATE POLICY "Service role can insert deck progress" 
ON deck_progress FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can insert dataset analyses" 
ON dataset_analyses FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can insert AI interactions" 
ON ai_interactions FOR INSERT 
WITH CHECK (true);

-- Update policies for service role
CREATE POLICY "Service role can update deck progress" 
ON deck_progress FOR UPDATE 
USING (true);

CREATE POLICY "Service role can update dataset analyses" 
ON dataset_analyses FOR UPDATE 
USING (true);

-- Add helpful comments
COMMENT ON TABLE deck_progress IS 'Tracks real-time progress of AI deck generation for SSE updates';
COMMENT ON TABLE dataset_analyses IS 'Stores Python analysis results from pandas profiling and statistical analysis';
COMMENT ON TABLE ai_interactions IS 'Logs all OpenAI API calls with token usage and costs for monitoring';
COMMENT ON COLUMN presentations.slide_json IS 'Final composed slide JSON compatible with SlideCanvas/SlideElementRenderer';
COMMENT ON COLUMN presentations.analysis_summary IS 'Aggregated insights from Python analysis for OpenAI context';
COMMENT ON COLUMN presentations.ai_status IS 'Current status: pending|analyzing|planning|chart_building|composing|done|error';