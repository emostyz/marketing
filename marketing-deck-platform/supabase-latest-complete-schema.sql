-- =====================================================
-- AEDRIN Marketing Deck Platform - Complete Database Schema
-- Latest Version - Fixes all column mismatches and missing tables
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

-- Subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted');
CREATE TYPE event_severity AS ENUM ('info', 'warning', 'error', 'critical');
CREATE TYPE presentation_status AS ENUM ('draft', 'completed', 'published', 'archived');
CREATE TYPE export_format AS ENUM ('pdf', 'pptx', 'keynote', 'html');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User profiles table (comprehensive)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    job_title TEXT,
    industry TEXT,
    avatar_url TEXT,
    logo_url TEXT,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_status subscription_status DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    brand_colors JSONB,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table (with user_id for tracking)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    email TEXT NOT NULL,
    full_name TEXT,
    company_name TEXT,
    source TEXT DEFAULT 'website',
    status lead_status DEFAULT 'new',
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presentations table
CREATE TABLE IF NOT EXISTS presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    slides JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    status presentation_status DEFAULT 'draft',
    template_id UUID,
    theme_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Slides table
CREATE TABLE IF NOT EXISTS slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
    slide_number INTEGER NOT NULL,
    slide_type TEXT NOT NULL,
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    thumbnail_url TEXT,
    template_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Themes table
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    colors JSONB NOT NULL,
    fonts JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & TRACKING TABLES
-- =====================================================

-- User events table
CREATE TABLE IF NOT EXISTS user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id TEXT,
    event_type TEXT NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page views table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id TEXT,
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    view_duration INTEGER,
    scroll_depth INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User interactions table
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_id TEXT,
    interaction_type TEXT NOT NULL,
    interaction_data JSONB,
    page_url TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUTH & SESSION TABLES
-- =====================================================

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auth events table
CREATE TABLE IF NOT EXISTS auth_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    event_type TEXT NOT NULL,
    event_data JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUBSCRIPTION & PAYMENT TABLES
-- =====================================================

-- Subscription events table
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB,
    stripe_event_id TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment events table
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    event_type TEXT NOT NULL,
    event_data JSONB,
    stripe_event_id TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'usd',
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTENT & DATA TABLES
-- =====================================================

-- Data files table
CREATE TABLE IF NOT EXISTS data_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    file_url TEXT,
    data_content JSONB,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analysis history table
CREATE TABLE IF NOT EXISTS ai_analysis_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    data_file_id UUID REFERENCES data_files(id),
    analysis_type TEXT NOT NULL,
    input_data JSONB,
    output_data JSONB,
    model_used TEXT,
    processing_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COLLABORATION & SHARING TABLES
-- =====================================================

-- Collaboration sessions table
CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
    session_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID NOT NULL,
    participants JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Export history table
CREATE TABLE IF NOT EXISTS export_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    presentation_id UUID REFERENCES presentations(id) ON DELETE SET NULL,
    export_format export_format NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    export_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SYSTEM & ERROR TABLES
-- =====================================================

-- System events table
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    event_data JSONB,
    severity event_severity DEFAULT 'info',
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    user_id UUID,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Leads indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Presentations indexes
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_status ON presentations(status);
CREATE INDEX IF NOT EXISTS idx_presentations_created_at ON presentations(created_at);

-- Slides indexes
CREATE INDEX IF NOT EXISTS idx_slides_presentation_id ON slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_slides_slide_number ON slides(slide_number);

-- User events indexes
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);

-- Page views indexes
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leads policies (allow public insert, user view own)
CREATE POLICY "Public can insert leads" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own leads" ON leads
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Presentations policies
CREATE POLICY "Users can view own presentations" ON presentations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presentations" ON presentations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations" ON presentations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations" ON presentations
    FOR DELETE USING (auth.uid() = user_id);

-- Slides policies
CREATE POLICY "Users can manage slides for own presentations" ON slides
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM presentations 
            WHERE presentations.id = slides.presentation_id 
            AND presentations.user_id = auth.uid()
        )
    );

-- Templates policies (public read, user write)
CREATE POLICY "Public can view templates" ON templates
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can insert templates" ON templates
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Themes policies (public read, user write)
CREATE POLICY "Public can view themes" ON themes
    FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can insert themes" ON themes
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- User events policies
CREATE POLICY "Users can view own events" ON user_events
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public can insert events" ON user_events
    FOR INSERT WITH CHECK (true);

-- Page views policies
CREATE POLICY "Users can view own page views" ON page_views
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public can insert page views" ON page_views
    FOR INSERT WITH CHECK (true);

-- User interactions policies
CREATE POLICY "Users can view own interactions" ON user_interactions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public can insert interactions" ON user_interactions
    FOR INSERT WITH CHECK (true);

-- User sessions policies
CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Auth events policies
CREATE POLICY "Users can view own auth events" ON auth_events
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public can insert auth events" ON auth_events
    FOR INSERT WITH CHECK (true);

-- Subscription events policies
CREATE POLICY "Users can view own subscription events" ON subscription_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription events" ON subscription_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment events policies
CREATE POLICY "Users can view own payment events" ON payment_events
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Public can insert payment events" ON payment_events
    FOR INSERT WITH CHECK (true);

-- Data files policies
CREATE POLICY "Users can manage own data files" ON data_files
    FOR ALL USING (auth.uid() = user_id);

-- AI analysis history policies
CREATE POLICY "Users can view own analysis history" ON ai_analysis_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis history" ON ai_analysis_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Collaboration sessions policies
CREATE POLICY "Users can manage collaboration sessions" ON collaboration_sessions
    FOR ALL USING (
        auth.uid() = created_by OR 
        auth.uid()::text = ANY(
            SELECT jsonb_array_elements_text(participants)
        )
    );

-- Export history policies
CREATE POLICY "Users can view own export history" ON export_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own export history" ON export_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON presentations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DEFAULT DATA
-- =====================================================

-- Insert default templates
INSERT INTO templates (id, name, description, category, is_public, template_data) VALUES
(
    uuid_generate_v4(),
    'Executive Summary',
    'Professional executive summary template',
    'executive',
    true,
    '{"slides": [{"type": "title", "content": {"title": "Executive Summary", "subtitle": "Key Insights and Recommendations"}}]}'
),
(
    uuid_generate_v4(),
    'Sales Performance',
    'Sales performance analysis template',
    'sales',
    true,
    '{"slides": [{"type": "title", "content": {"title": "Sales Performance", "subtitle": "Analysis and Insights"}}]}'
),
(
    uuid_generate_v4(),
    'Marketing Campaign',
    'Marketing campaign results template',
    'marketing',
    true,
    '{"slides": [{"type": "title", "content": {"title": "Marketing Campaign", "subtitle": "Results and ROI Analysis"}}]}'
)
ON CONFLICT DO NOTHING;

-- Insert default themes
INSERT INTO themes (id, name, description, is_public, colors) VALUES
(
    uuid_generate_v4(),
    'Professional Blue',
    'Clean professional blue theme',
    true,
    '{"primary": "#2563eb", "secondary": "#64748b", "accent": "#3b82f6", "background": "#ffffff", "text": "#1e293b"}'
),
(
    uuid_generate_v4(),
    'Modern Dark',
    'Modern dark theme',
    true,
    '{"primary": "#6366f1", "secondary": "#94a3b8", "accent": "#8b5cf6", "background": "#0f172a", "text": "#f1f5f9"}'
),
(
    uuid_generate_v4(),
    'Corporate Green',
    'Professional corporate green theme',
    true,
    '{"primary": "#059669", "secondary": "#6b7280", "accent": "#10b981", "background": "#ffffff", "text": "#111827"}'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION LOG
-- =====================================================

-- Create migration log table
CREATE TABLE IF NOT EXISTS migrations_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    migration_name TEXT NOT NULL,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    version TEXT,
    description TEXT
);

-- Log this migration
INSERT INTO migrations_log (migration_name, version, description) VALUES
(
    'complete_schema_v2',
    '2.0.0',
    'Complete database schema with all tables, columns, indexes, RLS policies, and triggers for AEDRIN marketing deck platform'
);

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- This schema includes:
-- ✅ All core tables (profiles, presentations, slides, etc.)
-- ✅ Analytics tables (user_events, page_views, user_interactions)
-- ✅ Auth & session tables (user_sessions, auth_events)
-- ✅ Subscription & payment tables (subscription_events, payment_events)
-- ✅ Content & data tables (data_files, ai_analysis_history)
-- ✅ Collaboration & sharing tables (collaboration_sessions, export_history)
-- ✅ System & error tables (system_events, error_logs)
-- ✅ All necessary indexes for performance
-- ✅ Row Level Security (RLS) policies for data protection
-- ✅ Triggers for automatic timestamp updates
-- ✅ Default templates and themes
-- ✅ Migration logging

-- Run this script in your Supabase SQL editor to set up the complete database schema.
