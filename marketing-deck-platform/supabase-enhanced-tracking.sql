-- =====================================================
-- ENHANCED SUPABASE TRACKING - COMPREHENSIVE USER JOURNEY CAPTURE
-- This migration captures EVERY user interaction and insight generation
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================
-- 1. ENHANCED USER PROFILES WITH COMPREHENSIVE TRACKING
-- ============================================

-- Drop existing profiles table if exists and recreate with enhanced structure
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    
    -- COMPREHENSIVE BUSINESS CONTEXT
    company_name TEXT,
    job_title TEXT,
    phone TEXT,
    avatar_url TEXT,
    industry TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    business_context TEXT,
    business_goals TEXT,
    data_description TEXT,
    
    -- USER BEHAVIOR & PREFERENCES
    key_metrics TEXT[],
    dataset_types TEXT[],
    usage_plan TEXT DEFAULT 'free',
    language_preference TEXT DEFAULT 'en',
    chart_style_preference TEXT DEFAULT 'modern',
    narrative_style TEXT DEFAULT 'executive',
    
    -- ADVANCED PERSONALIZATION
    brand_colors JSONB DEFAULT '{}',
    preferred_templates TEXT[],
    color_schemes JSONB DEFAULT '[]',
    font_preferences JSONB DEFAULT '{}',
    slide_layout_preferences JSONB DEFAULT '{}',
    
    -- USAGE ANALYTICS
    presentation_count INTEGER DEFAULT 0,
    total_slides_created INTEGER DEFAULT 0,
    total_insights_generated INTEGER DEFAULT 0,
    favorite_chart_types TEXT[],
    most_used_data_sources TEXT[],
    avg_presentation_length INTEGER DEFAULT 10,
    typical_audience_size TEXT DEFAULT 'small',
    
    -- ENGAGEMENT METRICS
    session_count INTEGER DEFAULT 0,
    total_time_spent_minutes INTEGER DEFAULT 0,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- SUBSCRIPTION & FEATURES
    subscription_plan TEXT DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    onboarding_completed BOOLEAN DEFAULT false,
    profile_completeness_score INTEGER DEFAULT 0,
    
    -- AI & FEEDBACK
    features_used JSONB DEFAULT '{}',
    ai_suggestions_accepted INTEGER DEFAULT 0,
    ai_suggestions_rejected INTEGER DEFAULT 0,
    feedback_scores JSONB DEFAULT '{}',
    custom_instructions TEXT,
    
    -- COLLABORATION
    team_id UUID,
    sharing_preferences JSONB DEFAULT '{}',
    collaboration_history JSONB DEFAULT '[]',
    
    -- EXPORT & DELIVERY
    total_exports INTEGER DEFAULT 0,
    export_formats_used TEXT[],
    presentation_sharing_count INTEGER DEFAULT 0,
    
    -- SUCCESS TRACKING
    business_outcomes JSONB DEFAULT '{}',
    presentation_effectiveness_scores JSONB DEFAULT '{}',
    roi_tracking JSONB DEFAULT '{}'
);

-- ============================================
-- 2. PRESENTATION SESSIONS - COMPLETE USER JOURNEY
-- ============================================

CREATE TABLE public.presentation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    
    -- SESSION METADATA
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_duration_minutes INTEGER DEFAULT 0,
    
    -- INTAKE DATA (Step 1)
    industry TEXT,
    target_audience TEXT,
    business_context TEXT,
    data_description TEXT,
    business_goals TEXT,
    
    -- FILE UPLOAD DATA (Step 2)
    uploaded_files JSONB DEFAULT '[]',
    file_processing_status TEXT DEFAULT 'pending',
    parsed_data_summary JSONB DEFAULT '{}',
    data_quality_score INTEGER,
    
    -- NARRATIVE CONFIRMATION (Step 3)
    ai_generated_narrative JSONB DEFAULT '{}',
    user_narrative_feedback TEXT,
    narrative_customizations JSONB DEFAULT '{}',
    narrative_approval_status TEXT DEFAULT 'pending',
    
    -- DESIGN TEMPLATE SELECTION (Step 4)
    selected_design_template TEXT,
    design_customizations JSONB DEFAULT '{}',
    template_applied_at TIMESTAMP WITH TIME ZONE,
    
    -- FUNCTIONAL STRUCTURE SELECTION (Step 5)
    selected_structure_template TEXT,
    structure_customizations JSONB DEFAULT '{}',
    structure_applied_at TIMESTAMP WITH TIME ZONE,
    
    -- AI ANALYSIS & INSIGHT GENERATION (Step 6)
    analysis_started_at TIMESTAMP WITH TIME ZONE,
    analysis_completed_at TIMESTAMP WITH TIME ZONE,
    insights_generated INTEGER DEFAULT 0,
    novelty_scores DECIMAL[],
    confidence_scores DECIMAL[],
    business_impact_categories TEXT[],
    
    -- SLIDE GENERATION (Step 7)
    slides_generated INTEGER DEFAULT 0,
    slide_generation_time_seconds INTEGER,
    slides_data JSONB DEFAULT '{}',
    generation_parameters JSONB DEFAULT '{}',
    
    -- USER FEEDBACK & ITERATIONS (Step 8)
    feedback_rounds INTEGER DEFAULT 0,
    total_modifications INTEGER DEFAULT 0,
    user_satisfaction_score INTEGER,
    final_approval_status TEXT DEFAULT 'pending',
    
    -- FINAL OUTPUT
    final_slide_count INTEGER,
    export_formats TEXT[],
    sharing_settings JSONB DEFAULT '{}',
    presentation_title TEXT,
    
    -- TECHNICAL METRICS
    api_calls_made INTEGER DEFAULT 0,
    processing_time_ms INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_details JSONB DEFAULT '[]',
    
    -- SESSION STATUS
    current_step TEXT DEFAULT 'intake',
    session_status TEXT DEFAULT 'active',
    abandonment_point TEXT,
    completion_percentage INTEGER DEFAULT 0
);

-- ============================================
-- 3. INSIGHTS TRACKING - AI INTELLIGENCE CAPTURE
-- ============================================

CREATE TABLE public.generated_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.presentation_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- INSIGHT METADATA
    insight_type TEXT NOT NULL, -- 'trend_anomaly', 'correlation_discovery', etc.
    insight_title TEXT NOT NULL,
    insight_headline TEXT NOT NULL,
    narrative TEXT NOT NULL,
    
    -- AI ANALYSIS METRICS
    confidence_score DECIMAL NOT NULL,
    novelty_score DECIMAL NOT NULL,
    business_impact TEXT NOT NULL, -- 'transformational', 'significant', etc.
    complexity_level TEXT DEFAULT 'medium',
    
    -- DATA EVIDENCE
    source_data JSONB NOT NULL,
    statistical_evidence JSONB DEFAULT '{}',
    supporting_metrics JSONB DEFAULT '{}',
    data_quality_indicators JSONB DEFAULT '{}',
    
    -- VISUALIZATION CONFIG
    recommended_chart_type TEXT,
    visualization_config JSONB DEFAULT '{}',
    color_scheme TEXT[],
    interactive_features TEXT[],
    
    -- USER INTERACTION
    user_approved BOOLEAN DEFAULT NULL,
    user_feedback TEXT,
    modifications_requested TEXT,
    final_usage_status TEXT DEFAULT 'pending', -- 'used', 'modified', 'rejected'
    
    -- RECOMMENDATIONS GENERATED
    actionable_recommendations JSONB DEFAULT '[]',
    priority_level TEXT DEFAULT 'medium',
    estimated_impact TEXT,
    implementation_timeline TEXT,
    
    -- TRACKING
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    slide_usage_count INTEGER DEFAULT 0
);

-- ============================================
-- 4. SLIDE GENERATION TRACKING
-- ============================================

CREATE TABLE public.generated_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.presentation_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    insight_id UUID REFERENCES public.generated_insights(id) ON DELETE SET NULL,
    
    -- SLIDE METADATA
    slide_number INTEGER NOT NULL,
    slide_type TEXT NOT NULL, -- 'executive_summary', 'key_insight', etc.
    slide_title TEXT NOT NULL,
    slide_subtitle TEXT,
    layout_type TEXT NOT NULL,
    
    -- CONTENT STRUCTURE
    narrative_content TEXT[],
    key_points TEXT[],
    call_to_action TEXT,
    speaker_notes TEXT[],
    
    -- VISUALIZATION DATA
    charts_data JSONB DEFAULT '[]',
    interactive_elements JSONB DEFAULT '[]',
    design_elements JSONB DEFAULT '{}',
    
    -- DESIGN APPLICATION
    template_applied TEXT,
    color_scheme TEXT[],
    typography_config JSONB DEFAULT '{}',
    animations_applied TEXT[],
    
    -- USER MODIFICATIONS
    user_edits JSONB DEFAULT '[]',
    edit_count INTEGER DEFAULT 0,
    last_edited_at TIMESTAMP WITH TIME ZONE,
    
    -- QUALITY METRICS
    content_quality_score INTEGER,
    visual_appeal_score INTEGER,
    insight_density_score INTEGER,
    executive_readiness_score INTEGER,
    
    -- EXPORT & SHARING
    exported_formats TEXT[],
    shared_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- TECHNICAL DATA
    generation_time_ms INTEGER,
    file_size_bytes INTEGER,
    complexity_score INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. USER INTERACTION EVENTS - GRANULAR TRACKING
-- ============================================

CREATE TABLE public.user_interaction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.presentation_sessions(id) ON DELETE SET NULL,
    
    -- EVENT METADATA
    event_type TEXT NOT NULL, -- 'click', 'input', 'navigation', 'feedback', etc.
    event_category TEXT NOT NULL, -- 'ui_interaction', 'data_upload', 'slide_edit', etc.
    event_action TEXT NOT NULL,
    event_label TEXT,
    
    -- CONTEXT DATA
    page_url TEXT,
    ui_element TEXT,
    element_position TEXT,
    
    -- USER INPUT DATA
    input_value TEXT,
    input_type TEXT,
    validation_status TEXT,
    
    -- TIMING
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_time_offset_ms INTEGER,
    interaction_duration_ms INTEGER,
    
    -- DEVICE & TECHNICAL
    user_agent TEXT,
    device_type TEXT,
    screen_resolution TEXT,
    ip_address INET,
    
    -- BUSINESS CONTEXT
    business_value TEXT,
    conversion_event BOOLEAN DEFAULT FALSE,
    error_occurred BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    
    -- METADATA
    additional_data JSONB DEFAULT '{}'
);

-- ============================================
-- 6. FEEDBACK & ITERATION TRACKING
-- ============================================

CREATE TABLE public.feedback_iterations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.presentation_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- FEEDBACK METADATA
    iteration_number INTEGER NOT NULL,
    feedback_type TEXT NOT NULL, -- 'narrative', 'design', 'insights', 'slides'
    feedback_scope TEXT NOT NULL, -- 'global', 'specific_slide', 'specific_insight'
    target_element_id TEXT,
    
    -- USER FEEDBACK
    feedback_text TEXT NOT NULL,
    feedback_category TEXT, -- 'content', 'design', 'accuracy', 'clarity'
    feedback_sentiment TEXT, -- 'positive', 'neutral', 'negative'
    feedback_priority TEXT DEFAULT 'medium',
    
    -- AI RESPONSE
    ai_interpretation JSONB DEFAULT '{}',
    changes_implemented JSONB DEFAULT '[]',
    implementation_success BOOLEAN,
    
    -- QUALITY MEASURES
    feedback_clarity_score INTEGER,
    implementation_accuracy_score INTEGER,
    user_satisfaction_change INTEGER,
    
    -- TIMING
    feedback_submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changes_applied_at TIMESTAMP WITH TIME ZONE,
    processing_time_ms INTEGER,
    
    -- RESULTS
    resulting_changes TEXT[],
    quality_improvement BOOLEAN DEFAULT FALSE,
    user_approved_changes BOOLEAN DEFAULT NULL
);

-- ============================================
-- 7. BUSINESS OUTCOMES TRACKING
-- ============================================

CREATE TABLE public.presentation_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.presentation_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- PRESENTATION DELIVERY
    presentation_date TIMESTAMP WITH TIME ZONE,
    audience_size INTEGER,
    audience_type TEXT,
    presentation_duration_minutes INTEGER,
    
    -- IMMEDIATE OUTCOMES
    audience_engagement_score INTEGER,
    questions_received INTEGER,
    positive_feedback_received INTEGER,
    follow_up_meetings_scheduled INTEGER,
    
    -- BUSINESS RESULTS
    decisions_influenced TEXT[],
    budget_approved DECIMAL,
    projects_initiated TEXT[],
    strategic_changes TEXT[],
    
    -- SUCCESS METRICS
    primary_objective_achieved BOOLEAN,
    success_rating INTEGER, -- 1-10
    roi_estimate DECIMAL,
    time_saved_hours INTEGER,
    
    -- COMPETITIVE ADVANTAGE
    market_opportunities_identified TEXT[],
    competitive_insights_gained TEXT[],
    strategic_positioning_improved BOOLEAN,
    
    -- FOLLOW-UP TRACKING
    follow_up_presentations_requested INTEGER,
    template_reuse_count INTEGER,
    insights_applied_to_business INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_industry ON public.profiles(industry);
CREATE INDEX idx_profiles_subscription ON public.profiles(subscription_plan);
CREATE INDEX idx_profiles_activity ON public.profiles(last_login_at);

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON public.presentation_sessions(user_id);
CREATE INDEX idx_sessions_status ON public.presentation_sessions(session_status);
CREATE INDEX idx_sessions_step ON public.presentation_sessions(current_step);
CREATE INDEX idx_sessions_completed ON public.presentation_sessions(completed_at);

-- Insights indexes
CREATE INDEX idx_insights_session ON public.generated_insights(session_id);
CREATE INDEX idx_insights_type ON public.generated_insights(insight_type);
CREATE INDEX idx_insights_novelty ON public.generated_insights(novelty_score);
CREATE INDEX idx_insights_confidence ON public.generated_insights(confidence_score);

-- Slides indexes
CREATE INDEX idx_slides_session ON public.generated_slides(session_id);
CREATE INDEX idx_slides_type ON public.generated_slides(slide_type);
CREATE INDEX idx_slides_quality ON public.generated_slides(executive_readiness_score);

-- Events indexes
CREATE INDEX idx_events_user_time ON public.user_interaction_events(user_id, timestamp);
CREATE INDEX idx_events_type ON public.user_interaction_events(event_type);
CREATE INDEX idx_events_session ON public.user_interaction_events(session_id);

-- Feedback indexes
CREATE INDEX idx_feedback_session ON public.feedback_iterations(session_id);
CREATE INDEX idx_feedback_type ON public.feedback_iterations(feedback_type);

-- Outcomes indexes
CREATE INDEX idx_outcomes_session ON public.presentation_outcomes(session_id);
CREATE INDEX idx_outcomes_success ON public.presentation_outcomes(success_rating);

-- ============================================
-- 9. ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interaction_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_iterations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_outcomes ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
CREATE POLICY "Users can manage own data" ON public.profiles
    FOR ALL USING (auth.uid()::text = id::text);

CREATE POLICY "Users can manage own sessions" ON public.presentation_sessions
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own insights" ON public.generated_insights
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own slides" ON public.generated_slides
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own events" ON public.user_interaction_events
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own feedback" ON public.feedback_iterations
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own outcomes" ON public.presentation_outcomes
    FOR ALL USING (auth.uid()::text = user_id::text);

-- ============================================
-- 10. TRIGGERS FOR AUTO-UPDATES
-- ============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.presentation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insights_updated_at BEFORE UPDATE ON public.generated_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON public.generated_slides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. ANALYTICS FUNCTIONS
-- ============================================

-- Function to calculate user engagement score
CREATE OR REPLACE FUNCTION calculate_user_engagement(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    engagement_score INTEGER;
BEGIN
    SELECT 
        LEAST(100, 
            (session_count * 10) + 
            (total_slides_created * 2) + 
            (ai_suggestions_accepted * 5) +
            (total_exports * 15) +
            (CASE WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 20 ELSE 0 END)
        )
    INTO engagement_score
    FROM public.profiles
    WHERE id = user_uuid;
    
    RETURN COALESCE(engagement_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to track session progress
CREATE OR REPLACE FUNCTION update_session_progress(session_uuid UUID, step_name TEXT)
RETURNS VOID AS $$
DECLARE
    progress_percentage INTEGER;
BEGIN
    -- Calculate progress based on step
    progress_percentage := CASE step_name
        WHEN 'intake' THEN 10
        WHEN 'upload' THEN 20
        WHEN 'narrative' THEN 40
        WHEN 'design' THEN 60
        WHEN 'structure' THEN 70
        WHEN 'analysis' THEN 80
        WHEN 'slides' THEN 90
        WHEN 'complete' THEN 100
        ELSE 0
    END;
    
    UPDATE public.presentation_sessions
    SET 
        current_step = step_name,
        completion_percentage = progress_percentage,
        last_activity_at = NOW()
    WHERE id = session_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'ENHANCED TRACKING MIGRATION COMPLETE!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'COMPREHENSIVE USER JOURNEY CAPTURE:';
    RAISE NOTICE '• Complete user profiles with business context';
    RAISE NOTICE '• End-to-end session tracking (8 detailed steps)';
    RAISE NOTICE '• AI insight generation with novelty scoring';
    RAISE NOTICE '• Granular slide creation and modification tracking';
    RAISE NOTICE '• Real-time user interaction event capture';
    RAISE NOTICE '• Iterative feedback loop documentation';
    RAISE NOTICE '• Business outcome and ROI measurement';
    RAISE NOTICE '';
    RAISE NOTICE 'ANALYTICS CAPABILITIES:';
    RAISE NOTICE '• User engagement scoring';
    RAISE NOTICE '• Session progress tracking';
    RAISE NOTICE '• Insight quality measurement';
    RAISE NOTICE '• Business impact assessment';
    RAISE NOTICE '• Conversion funnel analysis';
    RAISE NOTICE '';
    RAISE NOTICE 'READY FOR PRODUCTION AI PLATFORM!';
    RAISE NOTICE '=====================================================';
END $$;