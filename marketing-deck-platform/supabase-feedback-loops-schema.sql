-- ==========================================
-- AEDRIN FEEDBACK LOOPS SCHEMA
-- Comprehensive schema for AI feedback loops and analytics
-- ==========================================

-- Enable RLS on all tables
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Create schema for feedback loops
CREATE SCHEMA IF NOT EXISTS feedback_loops;

-- ==========================================
-- CORE FEEDBACK TABLES
-- ==========================================

-- 1. Feedback Sessions Table
CREATE TABLE IF NOT EXISTS public.feedback_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN (
        'data_analysis', 'chart_selection', 'slide_generation', 'export_validation'
    )),
    session_data JSONB NOT NULL DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    iteration_count INTEGER DEFAULT 0,
    final_score DECIMAL(5,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AI Analysis Feedback Table
CREATE TABLE IF NOT EXISTS public.ai_analysis_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    iteration_number INTEGER NOT NULL DEFAULT 1,
    input_data JSONB NOT NULL,
    user_context TEXT,
    user_goals TEXT,
    ai_response JSONB NOT NULL,
    validation_score DECIMAL(5,2),
    validation_issues JSONB DEFAULT '[]',
    auto_approved BOOLEAN DEFAULT FALSE,
    user_feedback JSONB DEFAULT '{}',
    improvements_applied JSONB DEFAULT '{}',
    response_time_ms INTEGER,
    tokens_used INTEGER,
    model_version TEXT DEFAULT 'gpt-4-turbo-preview',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Chart Selection Feedback Table
CREATE TABLE IF NOT EXISTS public.chart_selection_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    data_summary JSONB NOT NULL,
    ai_recommendations JSONB NOT NULL,
    user_preferences JSONB DEFAULT '{}',
    selected_charts JSONB NOT NULL,
    user_modifications JSONB DEFAULT '{}',
    acceptance_rate DECIMAL(5,2),
    time_to_selection INTEGER, -- seconds
    chart_performance_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Slide Generation QA Table
CREATE TABLE IF NOT EXISTS public.slide_generation_qa (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    iteration_number INTEGER NOT NULL DEFAULT 1,
    input_data JSONB NOT NULL,
    insights JSONB NOT NULL,
    charts JSONB NOT NULL,
    generated_slides JSONB NOT NULL,
    qa_test_results JSONB NOT NULL,
    overall_qa_score DECIMAL(5,2),
    qa_issues JSONB DEFAULT '[]',
    refinement_applied BOOLEAN DEFAULT FALSE,
    refinement_prompt TEXT,
    final_slides JSONB,
    generation_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Export Validation Feedback Table
CREATE TABLE IF NOT EXISTS public.export_validation_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    presentation_id UUID,
    export_format TEXT NOT NULL CHECK (export_format IN ('pptx', 'pdf', 'json', 'png')),
    pre_validation_issues JSONB DEFAULT '[]',
    auto_fixes_applied JSONB DEFAULT '[]',
    post_validation_score DECIMAL(5,2),
    export_successful BOOLEAN DEFAULT FALSE,
    file_size_bytes BIGINT,
    export_time_ms INTEGER,
    user_download_completed BOOLEAN DEFAULT FALSE,
    user_feedback_rating INTEGER CHECK (user_feedback_rating BETWEEN 1 AND 5),
    user_feedback_comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- USER INTERACTION TRACKING
-- ==========================================

-- 6. User Interaction Events Table
CREATE TABLE IF NOT EXISTS public.user_interaction_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'page_view', 'button_click', 'data_upload', 'chart_edit', 'slide_edit',
        'export_request', 'ai_request', 'error_encountered', 'feedback_submitted'
    )),
    event_data JSONB NOT NULL DEFAULT '{}',
    page_url TEXT,
    user_agent TEXT,
    ip_address INET,
    session_duration INTEGER, -- seconds
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. AI Performance Metrics Table
CREATE TABLE IF NOT EXISTS public.ai_performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK (metric_type IN (
        'response_time', 'accuracy_score', 'user_satisfaction', 'error_rate',
        'recommendation_acceptance', 'iteration_count', 'token_usage'
    )),
    metric_value DECIMAL(10,4) NOT NULL,
    context_data JSONB DEFAULT '{}',
    model_version TEXT,
    prompt_version TEXT,
    measurement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- LEARNING AND IMPROVEMENT TABLES
-- ==========================================

-- 8. Prompt Engineering Iterations Table
CREATE TABLE IF NOT EXISTS public.prompt_engineering_iterations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prompt_type TEXT NOT NULL CHECK (prompt_type IN (
        'data_analysis', 'chart_recommendation', 'slide_generation', 'content_quality'
    )),
    version_number INTEGER NOT NULL,
    prompt_template TEXT NOT NULL,
    performance_metrics JSONB DEFAULT '{}',
    success_rate DECIMAL(5,2),
    average_score DECIMAL(5,2),
    user_feedback_summary JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prompt_type, version_number)
);

-- 9. Machine Learning Features Table
CREATE TABLE IF NOT EXISTS public.ml_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_type TEXT NOT NULL CHECK (feature_type IN (
        'user_preference', 'data_pattern', 'chart_style', 'content_pattern', 'success_indicator'
    )),
    feature_vector JSONB NOT NULL,
    feature_importance DECIMAL(5,4),
    context JSONB DEFAULT '{}',
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. A/B Test Results Table
CREATE TABLE IF NOT EXISTS public.ab_test_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    test_name TEXT NOT NULL,
    variant TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.feedback_sessions(id) ON DELETE CASCADE,
    outcome_metric TEXT NOT NULL,
    outcome_value DECIMAL(10,4),
    test_data JSONB DEFAULT '{}',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- AGGREGATED ANALYTICS VIEWS
-- ==========================================

-- Create view for session success metrics
CREATE OR REPLACE VIEW public.session_success_metrics AS
SELECT 
    fs.session_type,
    COUNT(*) as total_sessions,
    AVG(fs.final_score) as avg_final_score,
    COUNT(CASE WHEN fs.status = 'completed' THEN 1 END) as completed_sessions,
    COUNT(CASE WHEN fs.status = 'failed' THEN 1 END) as failed_sessions,
    AVG(fs.iteration_count) as avg_iterations,
    AVG(EXTRACT(EPOCH FROM (fs.completed_at - fs.started_at))) as avg_duration_seconds,
    DATE_TRUNC('day', fs.created_at) as date
FROM public.feedback_sessions fs
WHERE fs.created_at >= NOW() - INTERVAL '30 days'
GROUP BY fs.session_type, DATE_TRUNC('day', fs.created_at)
ORDER BY date DESC;

-- Create view for AI performance overview
CREATE OR REPLACE VIEW public.ai_performance_overview AS
SELECT 
    aaf.model_version,
    COUNT(*) as total_requests,
    AVG(aaf.validation_score) as avg_validation_score,
    AVG(aaf.response_time_ms) as avg_response_time_ms,
    COUNT(CASE WHEN aaf.auto_approved = true THEN 1 END) as auto_approved_count,
    SUM(aaf.tokens_used) as total_tokens_used,
    DATE_TRUNC('day', aaf.created_at) as date
FROM public.ai_analysis_feedback aaf
WHERE aaf.created_at >= NOW() - INTERVAL '7 days'
GROUP BY aaf.model_version, DATE_TRUNC('day', aaf.created_at)
ORDER BY date DESC;

-- Create view for user engagement metrics
CREATE OR REPLACE VIEW public.user_engagement_metrics AS
SELECT 
    uie.user_id,
    COUNT(*) as total_events,
    COUNT(DISTINCT uie.session_id) as unique_sessions,
    AVG(uie.session_duration) as avg_session_duration,
    COUNT(CASE WHEN uie.event_type = 'data_upload' THEN 1 END) as data_uploads,
    COUNT(CASE WHEN uie.event_type = 'export_request' THEN 1 END) as export_requests,
    COUNT(CASE WHEN uie.event_type = 'error_encountered' THEN 1 END) as errors,
    MAX(uie.timestamp) as last_activity,
    DATE_TRUNC('week', uie.timestamp) as week
FROM public.user_interaction_events uie
WHERE uie.timestamp >= NOW() - INTERVAL '30 days'
GROUP BY uie.user_id, DATE_TRUNC('week', uie.timestamp)
ORDER BY week DESC;

-- ==========================================
-- FUNCTIONS FOR FEEDBACK LOOP OPERATIONS
-- ==========================================

-- Function to start a new feedback session
CREATE OR REPLACE FUNCTION public.start_feedback_session(
    p_user_id UUID,
    p_session_type TEXT,
    p_session_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
    session_id UUID;
BEGIN
    INSERT INTO public.feedback_sessions (user_id, session_type, session_data)
    VALUES (p_user_id, p_session_type, p_session_data)
    RETURNING id INTO session_id;
    
    RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a feedback session
CREATE OR REPLACE FUNCTION public.complete_feedback_session(
    p_session_id UUID,
    p_final_score DECIMAL DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.feedback_sessions 
    SET 
        status = 'completed',
        completed_at = NOW(),
        final_score = COALESCE(p_final_score, final_score),
        updated_at = NOW()
    WHERE id = p_session_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record AI analysis feedback
CREATE OR REPLACE FUNCTION public.record_ai_analysis_feedback(
    p_session_id UUID,
    p_user_id UUID,
    p_iteration_number INTEGER,
    p_input_data JSONB,
    p_user_context TEXT,
    p_user_goals TEXT,
    p_ai_response JSONB,
    p_validation_score DECIMAL,
    p_validation_issues JSONB DEFAULT '[]',
    p_auto_approved BOOLEAN DEFAULT FALSE,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_tokens_used INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    feedback_id UUID;
BEGIN
    INSERT INTO public.ai_analysis_feedback (
        session_id, user_id, iteration_number, input_data, user_context,
        user_goals, ai_response, validation_score, validation_issues,
        auto_approved, response_time_ms, tokens_used
    ) VALUES (
        p_session_id, p_user_id, p_iteration_number, p_input_data, p_user_context,
        p_user_goals, p_ai_response, p_validation_score, p_validation_issues,
        p_auto_approved, p_response_time_ms, p_tokens_used
    ) RETURNING id INTO feedback_id;
    
    -- Update session iteration count
    UPDATE public.feedback_sessions 
    SET iteration_count = p_iteration_number,
        updated_at = NOW()
    WHERE id = p_session_id;
    
    RETURN feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track user interaction events
CREATE OR REPLACE FUNCTION public.track_user_interaction(
    p_user_id UUID,
    p_session_id UUID,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}',
    p_page_url TEXT DEFAULT NULL,
    p_session_duration INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO public.user_interaction_events (
        user_id, session_id, event_type, event_data, page_url, session_duration
    ) VALUES (
        p_user_id, p_session_id, p_event_type, p_event_data, p_page_url, p_session_duration
    ) RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Feedback sessions indexes
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_user_id ON public.feedback_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_type_status ON public.feedback_sessions(session_type, status);
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_created_at ON public.feedback_sessions(created_at);

-- AI analysis feedback indexes
CREATE INDEX IF NOT EXISTS idx_ai_analysis_feedback_session_id ON public.ai_analysis_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_feedback_user_id ON public.ai_analysis_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_feedback_created_at ON public.ai_analysis_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_feedback_model_version ON public.ai_analysis_feedback(model_version);

-- Chart selection feedback indexes
CREATE INDEX IF NOT EXISTS idx_chart_selection_feedback_session_id ON public.chart_selection_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_chart_selection_feedback_user_id ON public.chart_selection_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_chart_selection_feedback_created_at ON public.chart_selection_feedback(created_at);

-- Slide generation QA indexes
CREATE INDEX IF NOT EXISTS idx_slide_generation_qa_session_id ON public.slide_generation_qa(session_id);
CREATE INDEX IF NOT EXISTS idx_slide_generation_qa_user_id ON public.slide_generation_qa(user_id);
CREATE INDEX IF NOT EXISTS idx_slide_generation_qa_created_at ON public.slide_generation_qa(created_at);

-- Export validation feedback indexes
CREATE INDEX IF NOT EXISTS idx_export_validation_feedback_session_id ON public.export_validation_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_export_validation_feedback_user_id ON public.export_validation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_export_validation_feedback_format ON public.export_validation_feedback(export_format);
CREATE INDEX IF NOT EXISTS idx_export_validation_feedback_created_at ON public.export_validation_feedback(created_at);

-- User interaction events indexes
CREATE INDEX IF NOT EXISTS idx_user_interaction_events_user_id ON public.user_interaction_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interaction_events_session_id ON public.user_interaction_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interaction_events_type ON public.user_interaction_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_interaction_events_timestamp ON public.user_interaction_events(timestamp);

-- AI performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_user_id ON public.ai_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_type ON public.ai_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_ai_performance_metrics_date ON public.ai_performance_metrics(measurement_date);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.feedback_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_selection_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slide_generation_qa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_validation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompt_engineering_iterations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;

-- Policies for feedback_sessions
CREATE POLICY "Users can view their own feedback sessions" ON public.feedback_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback sessions" ON public.feedback_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback sessions" ON public.feedback_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for ai_analysis_feedback
CREATE POLICY "Users can view their own AI analysis feedback" ON public.ai_analysis_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI analysis feedback" ON public.ai_analysis_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for chart_selection_feedback
CREATE POLICY "Users can view their own chart selection feedback" ON public.chart_selection_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chart selection feedback" ON public.chart_selection_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for slide_generation_qa
CREATE POLICY "Users can view their own slide generation QA" ON public.slide_generation_qa
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own slide generation QA" ON public.slide_generation_qa
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for export_validation_feedback
CREATE POLICY "Users can view their own export validation feedback" ON public.export_validation_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export validation feedback" ON public.export_validation_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for user_interaction_events
CREATE POLICY "Users can view their own interaction events" ON public.user_interaction_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interaction events" ON public.user_interaction_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for ai_performance_metrics
CREATE POLICY "Users can view their own AI performance metrics" ON public.ai_performance_metrics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI performance metrics" ON public.ai_performance_metrics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin-only policies for prompt engineering and ML features
CREATE POLICY "Admin can manage prompt engineering iterations" ON public.prompt_engineering_iterations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admin can manage ML features" ON public.ml_features
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policies for A/B test results
CREATE POLICY "Users can view their own A/B test results" ON public.ab_test_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert A/B test results" ON public.ab_test_results
    FOR INSERT WITH CHECK (true); -- Allow service to insert

-- ==========================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ==========================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for feedback_sessions
CREATE TRIGGER update_feedback_sessions_updated_at
    BEFORE UPDATE ON public.feedback_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SAMPLE DATA INSERTION (FOR TESTING)
-- ==========================================

-- Insert sample prompt engineering iterations
INSERT INTO public.prompt_engineering_iterations (prompt_type, version_number, prompt_template, is_active) VALUES
('data_analysis', 1, 'You are an expert data analyst. Analyze the provided data and generate insights.', false),
('data_analysis', 2, 'You are an expert data analyst specializing in business intelligence. Analyze the provided data with focus on actionable insights.', true),
('chart_recommendation', 1, 'Recommend optimal chart types for the given data.', false),
('chart_recommendation', 2, 'As a data visualization expert, recommend the most effective chart types based on data relationships and audience needs.', true)
ON CONFLICT (prompt_type, version_number) DO NOTHING;

-- ==========================================
-- GRANT NECESSARY PERMISSIONS
-- ==========================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated, anon;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================

-- Log completion
DO $$ 
BEGIN 
    RAISE NOTICE 'AEDRIN Feedback Loops Schema installation completed successfully!';
    RAISE NOTICE 'Created tables: feedback_sessions, ai_analysis_feedback, chart_selection_feedback, slide_generation_qa, export_validation_feedback, user_interaction_events, ai_performance_metrics, prompt_engineering_iterations, ml_features, ab_test_results';
    RAISE NOTICE 'Created views: session_success_metrics, ai_performance_overview, user_engagement_metrics';
    RAISE NOTICE 'Created functions: start_feedback_session, complete_feedback_session, record_ai_analysis_feedback, track_user_interaction';
    RAISE NOTICE 'RLS policies enabled for all tables';
END $$;