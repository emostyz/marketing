-- AI Slide Generation System Database Schema (FIXED)
-- Migration for comprehensive slide generation pipeline

-- Create datasets table for data intake system
CREATE TABLE IF NOT EXISTS datasets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    file_type TEXT NOT NULL CHECK (file_type IN ('csv', 'xlsx', 'json')),
    size_bytes BIGINT NOT NULL,
    rows_count INTEGER NOT NULL,
    columns_data JSONB NOT NULL, -- Array of column names
    schema_data JSONB NOT NULL, -- Column name to type mapping
    preview_data JSONB NOT NULL, -- First 10 rows
    processed BOOLEAN DEFAULT false,
    validation_errors JSONB, -- Array of error messages
    metadata JSONB NOT NULL, -- hasHeaders, encoding, delimiter, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for datasets
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at);
CREATE INDEX IF NOT EXISTS idx_datasets_file_type ON datasets(file_type);

-- Create AI analysis results table
CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL CHECK (analysis_type IN ('first_pass', 'refined', 'final')),
    analysis_data JSONB NOT NULL, -- The full analysis JSON
    metadata JSONB, -- Processing time, confidence, model used, etc.
    context JSONB, -- User goals, business context, etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analysis results
CREATE INDEX IF NOT EXISTS idx_analysis_results_user_id ON ai_analysis_results(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_dataset_id ON ai_analysis_results(dataset_id);
CREATE INDEX IF NOT EXISTS idx_analysis_results_type ON ai_analysis_results(analysis_type);
CREATE INDEX IF NOT EXISTS idx_analysis_results_created_at ON ai_analysis_results(created_at);

-- Create analysis logs table for monitoring
CREATE TABLE IF NOT EXISTS ai_analysis_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL,
    attempt_data JSONB NOT NULL, -- Success/failure, errors, context
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for analysis logs
CREATE INDEX IF NOT EXISTS idx_analysis_logs_user_id ON ai_analysis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_logs_timestamp ON ai_analysis_logs(timestamp);

-- Create feedback iterations table
CREATE TABLE IF NOT EXISTS feedback_iterations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_result_id UUID NOT NULL REFERENCES ai_analysis_results(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    iteration_number INTEGER NOT NULL,
    user_feedback JSONB NOT NULL, -- Feedback data
    refined_analysis JSONB, -- Refined analysis if generated
    slide_structure JSONB, -- Generated slide structure
    processing_time INTEGER, -- Milliseconds
    success BOOLEAN NOT NULL,
    errors JSONB, -- Array of error messages
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for feedback iterations
CREATE INDEX IF NOT EXISTS idx_feedback_iterations_user_id ON feedback_iterations(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_iterations_analysis_id ON feedback_iterations(analysis_result_id);
CREATE INDEX IF NOT EXISTS idx_feedback_iterations_session_id ON feedback_iterations(session_id);

-- Create slide structures table
CREATE TABLE IF NOT EXISTS slide_structures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_result_id UUID NOT NULL REFERENCES ai_analysis_results(id) ON DELETE CASCADE,
    presentation_title TEXT NOT NULL,
    slides_data JSONB NOT NULL, -- Array of slide objects
    narrative_flow JSONB NOT NULL, -- Narrative flow object
    recommended_duration INTEGER NOT NULL, -- Minutes
    target_audience TEXT NOT NULL,
    key_metrics JSONB NOT NULL, -- Array of key metrics
    version INTEGER DEFAULT 1,
    is_final BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for slide structures
CREATE INDEX IF NOT EXISTS idx_slide_structures_user_id ON slide_structures(user_id);
CREATE INDEX IF NOT EXISTS idx_slide_structures_analysis_id ON slide_structures(analysis_result_id);
CREATE INDEX IF NOT EXISTS idx_slide_structures_is_final ON slide_structures(is_final);

-- Create chart specifications table
CREATE TABLE IF NOT EXISTS chart_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slide_structure_id UUID NOT NULL REFERENCES slide_structures(id) ON DELETE CASCADE,
    slide_id TEXT NOT NULL, -- Reference to slide within structure
    chart_type TEXT NOT NULL CHECK (chart_type IN ('line', 'bar', 'pie', 'scatter', 'funnel', 'heatmap', 'area', 'donut')),
    title TEXT NOT NULL,
    description TEXT,
    data_mapping JSONB NOT NULL, -- x, y, series, groupBy mappings
    chart_data JSONB NOT NULL, -- Processed data for the chart
    styling JSONB, -- Chart styling options
    interactivity JSONB, -- Interactive features
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for chart specifications
CREATE INDEX IF NOT EXISTS idx_chart_specs_user_id ON chart_specifications(user_id);
CREATE INDEX IF NOT EXISTS idx_chart_specs_structure_id ON chart_specifications(slide_structure_id);
CREATE INDEX IF NOT EXISTS idx_chart_specs_slide_id ON chart_specifications(slide_id);

-- Create final presentations table (extends existing presentations table)
-- This assumes the presentations table already exists from the previous schema
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS source_dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS source_analysis_id UUID REFERENCES ai_analysis_results(id) ON DELETE SET NULL;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS slide_structure_id UUID REFERENCES slide_structures(id) ON DELETE SET NULL;
ALTER TABLE presentations ADD COLUMN IF NOT EXISTS generation_metadata JSONB; -- Processing stats, confidence, etc.

-- Create presentation drafts table for version history (extends auto-save functionality)
CREATE TABLE IF NOT EXISTS presentation_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presentation_id TEXT NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slides JSONB NOT NULL,
    metadata JSONB,
    version INTEGER NOT NULL,
    is_auto_save BOOLEAN DEFAULT false,
    changes_summary JSONB, -- Array of change descriptions
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for presentation drafts
CREATE INDEX IF NOT EXISTS idx_presentation_drafts_presentation_id ON presentation_drafts(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_drafts_user_id ON presentation_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_drafts_created_at ON presentation_drafts(created_at);
CREATE INDEX IF NOT EXISTS idx_presentation_drafts_is_auto_save ON presentation_drafts(is_auto_save);

-- Create processing queue table for pipeline orchestration
CREATE TABLE IF NOT EXISTS ai_processing_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES datasets(id) ON DELETE SET NULL,
    pipeline_stage TEXT NOT NULL CHECK (pipeline_stage IN (
        'data_intake', 'first_pass_analysis', 'user_review', 'feedback_processing', 
        'slide_structure', 'structure_editing', 'content_generation', 'chart_generation', 
        'qa_validation', 'final_export'
    )),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    input_data JSONB NOT NULL,
    output_data JSONB,
    error_data JSONB,
    processing_time INTEGER, -- Milliseconds
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    priority INTEGER DEFAULT 5, -- 1-10, higher is more important
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for processing queue
CREATE INDEX IF NOT EXISTS idx_processing_queue_user_id ON ai_processing_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_processing_queue_status ON ai_processing_queue(status);
CREATE INDEX IF NOT EXISTS idx_processing_queue_stage ON ai_processing_queue(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_processing_queue_priority ON ai_processing_queue(priority);
CREATE INDEX IF NOT EXISTS idx_processing_queue_scheduled_at ON ai_processing_queue(scheduled_at);

-- Create QA results table
CREATE TABLE IF NOT EXISTS qa_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    presentation_id TEXT NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
    qa_type TEXT NOT NULL CHECK (qa_type IN ('data_accuracy', 'narrative_coherence', 'visual_clarity', 'executive_readiness')),
    test_results JSONB NOT NULL, -- Test results with pass/fail and issues
    overall_passed BOOLEAN NOT NULL,
    issues_found JSONB, -- Array of issues
    fixes_applied JSONB, -- Array of fixes that were applied
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for QA results
CREATE INDEX IF NOT EXISTS idx_qa_results_user_id ON qa_results(user_id);
CREATE INDEX IF NOT EXISTS idx_qa_results_presentation_id ON qa_results(presentation_id);
CREATE INDEX IF NOT EXISTS idx_qa_results_qa_type ON qa_results(qa_type);
CREATE INDEX IF NOT EXISTS idx_qa_results_overall_passed ON qa_results(overall_passed);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_iterations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slide_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_results ENABLE ROW LEVEL SECURITY;

-- Policies for datasets
CREATE POLICY "Users can view their own datasets" ON datasets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own datasets" ON datasets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets" ON datasets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets" ON datasets
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for ai_analysis_results
CREATE POLICY "Users can view their own analysis results" ON ai_analysis_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis results" ON ai_analysis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis results" ON ai_analysis_results
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for ai_analysis_logs
CREATE POLICY "Users can view their own analysis logs" ON ai_analysis_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analysis logs" ON ai_analysis_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for feedback_iterations
CREATE POLICY "Users can view their own feedback iterations" ON feedback_iterations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own feedback iterations" ON feedback_iterations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for slide_structures
CREATE POLICY "Users can view their own slide structures" ON slide_structures
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own slide structures" ON slide_structures
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own slide structures" ON slide_structures
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for chart_specifications
CREATE POLICY "Users can view their own chart specifications" ON chart_specifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chart specifications" ON chart_specifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chart specifications" ON chart_specifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for presentation_drafts
CREATE POLICY "Users can view their own presentation drafts" ON presentation_drafts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own presentation drafts" ON presentation_drafts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentation drafts" ON presentation_drafts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentation drafts" ON presentation_drafts
    FOR DELETE USING (auth.uid() = user_id);

-- Policies for ai_processing_queue
CREATE POLICY "Users can view their own processing queue items" ON ai_processing_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own processing queue items" ON ai_processing_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own processing queue items" ON ai_processing_queue
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for qa_results
CREATE POLICY "Users can view their own QA results" ON qa_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own QA results" ON qa_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analysis_results_updated_at BEFORE UPDATE ON ai_analysis_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slide_structures_updated_at BEFORE UPDATE ON slide_structures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chart_specifications_updated_at BEFORE UPDATE ON chart_specifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentation_drafts_updated_at BEFORE UPDATE ON presentation_drafts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_processing_queue_updated_at BEFORE UPDATE ON ai_processing_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_ai_data()
RETURNS void AS $$
BEGIN
    -- Delete analysis logs older than 30 days
    DELETE FROM ai_analysis_logs WHERE timestamp < NOW() - INTERVAL '30 days';
    
    -- Delete failed processing queue items older than 7 days
    DELETE FROM ai_processing_queue 
    WHERE status = 'failed' AND created_at < NOW() - INTERVAL '7 days';
    
    -- Delete old auto-save drafts (keep only last 10 per presentation)
    WITH ranked_drafts AS (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY presentation_id ORDER BY created_at DESC) as rn
        FROM presentation_drafts 
        WHERE is_auto_save = true
    )
    DELETE FROM presentation_drafts 
    WHERE id IN (SELECT id FROM ranked_drafts WHERE rn > 10);
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;