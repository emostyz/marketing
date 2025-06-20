-- =====================================================
-- AEDRIN MARKETING DECK PLATFORM - COMPLETE DATABASE SETUP
-- Enhanced Deck Builder with OAuth & Full Infrastructure
-- Date: June 20, 2025
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USER MANAGEMENT & AUTHENTICATION
-- =====================================================

-- Enhanced users table with OAuth support
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    company VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- user, admin, premium
    subscription_status VARCHAR(50) DEFAULT 'free', -- free, pro, enterprise
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    oauth_provider VARCHAR(50), -- google, github, microsoft
    oauth_provider_id VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    api_usage_count INTEGER DEFAULT 0,
    api_usage_reset_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for tracking active sessions
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRESENTATION MANAGEMENT
-- =====================================================

-- Enhanced presentations table
CREATE TABLE IF NOT EXISTS public.presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    slides JSONB NOT NULL DEFAULT '[]',
    theme VARCHAR(50) DEFAULT 'dark',
    template_id UUID,
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES public.presentations(id), -- for versions/forks
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    last_viewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presentation analytics and tracking
CREATE TABLE IF NOT EXISTS public.presentation_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL, -- view, like, share, download, edit
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ENHANCED DECK BUILDER DATA STORAGE
-- =====================================================

-- Dataset storage for uploaded data
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    file_type VARCHAR(50), -- csv, json, xlsx
    data JSONB NOT NULL,
    column_metadata JSONB DEFAULT '{}', -- column types, descriptions
    row_count INTEGER,
    upload_source VARCHAR(50) DEFAULT 'manual', -- manual, api, sample
    is_sample BOOLEAN DEFAULT false,
    processing_status VARCHAR(50) DEFAULT 'completed', -- uploading, processing, completed, error
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QA responses for deck building context
CREATE TABLE IF NOT EXISTS public.qa_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
    presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
    dataset_description TEXT NOT NULL,
    business_goals TEXT NOT NULL,
    data_type VARCHAR(50) NOT NULL, -- financial, sales, marketing, strategy, client, other
    key_problems TEXT,
    analysis_type VARCHAR(50) NOT NULL, -- performance, trends, comparison, insights, routine_check
    target_audience VARCHAR(100),
    presentation_style VARCHAR(50) NOT NULL, -- executive, detailed, casual, technical
    additional_context TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analysis results and insights
CREATE TABLE IF NOT EXISTS public.ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
    qa_response_id UUID REFERENCES public.qa_responses(id) ON DELETE CASCADE,
    presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- openai, fallback, hybrid
    insights JSONB NOT NULL DEFAULT '{}',
    slide_recommendations JSONB NOT NULL DEFAULT '[]',
    executive_summary TEXT,
    key_findings TEXT[] DEFAULT '{}',
    confidence_score INTEGER DEFAULT 0, -- 0-100
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    model_version VARCHAR(50),
    iteration_count INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- COLLABORATION & SHARING
-- =====================================================

-- Team/workspace support
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subscription_status VARCHAR(50) DEFAULT 'free',
    max_members INTEGER DEFAULT 5,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team memberships
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- owner, admin, member, viewer
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES public.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending', -- pending, active, inactive
    UNIQUE(team_id, user_id)
);

-- Presentation sharing and collaboration
CREATE TABLE IF NOT EXISTS public.presentation_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    shared_with_email VARCHAR(255),
    shared_with_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    share_token VARCHAR(255) UNIQUE,
    permissions JSONB DEFAULT '{"view": true, "edit": false, "download": false}',
    expires_at TIMESTAMP WITH TIME ZONE,
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEMPLATES & MARKETPLACE
-- =====================================================

-- Template categories
CREATE TABLE IF NOT EXISTS public.template_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template marketplace
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.template_categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    preview_images TEXT[] DEFAULT '{}',
    slides JSONB NOT NULL DEFAULT '[]',
    theme VARCHAR(50) DEFAULT 'dark',
    tags TEXT[] DEFAULT '{}',
    is_premium BOOLEAN DEFAULT false,
    price DECIMAL(10,2) DEFAULT 0.00,
    download_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft', -- draft, pending, approved, rejected
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BILLING & SUBSCRIPTIONS
-- =====================================================

-- Subscription plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}', -- presentations_per_month, ai_analyses_per_month, etc.
    stripe_price_id_monthly VARCHAR(255),
    stripe_price_id_yearly VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.subscription_plans(id),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- active, canceled, past_due, unpaid
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- API USAGE & RATE LIMITING
-- =====================================================

-- API usage tracking for rate limiting
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_count INTEGER DEFAULT 1,
    tokens_used INTEGER DEFAULT 0,
    cost_usd DECIMAL(10,4) DEFAULT 0.0000,
    date DATE DEFAULT CURRENT_DATE,
    hour INTEGER DEFAULT EXTRACT(hour FROM NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, endpoint, method, date, hour)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON public.users(oauth_provider, oauth_provider_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON public.users(subscription_status);

-- Presentation indexes
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON public.presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_created_at ON public.presentations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_presentations_is_public ON public.presentations(is_public);
CREATE INDEX IF NOT EXISTS idx_presentations_is_template ON public.presentations(is_template);
CREATE INDEX IF NOT EXISTS idx_presentations_tags ON public.presentations USING GIN(tags);

-- Dataset indexes
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON public.datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON public.datasets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_datasets_processing_status ON public.datasets(processing_status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_presentation_analytics_presentation_id ON public.presentation_analytics(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_analytics_created_at ON public.presentation_analytics(created_at DESC);

-- API usage indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_user_date ON public.api_usage(user_id, date);
CREATE INDEX IF NOT EXISTS idx_api_usage_date_hour ON public.api_usage(date, hour);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Presentation policies
CREATE POLICY "Users can view own presentations" ON public.presentations
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create presentations" ON public.presentations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations" ON public.presentations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations" ON public.presentations
    FOR DELETE USING (auth.uid() = user_id);

-- Dataset policies
CREATE POLICY "Users can view own datasets" ON public.datasets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create datasets" ON public.datasets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own datasets" ON public.datasets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets" ON public.datasets
    FOR DELETE USING (auth.uid() = user_id);

-- QA responses policies
CREATE POLICY "Users can view own qa responses" ON public.qa_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create qa responses" ON public.qa_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI analysis results policies
CREATE POLICY "Users can view own ai results" ON public.ai_analysis_results
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create ai results" ON public.ai_analysis_results
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- API usage policies
CREATE POLICY "Users can view own api usage" ON public.api_usage
    FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON public.presentations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON public.datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment presentation view count
CREATE OR REPLACE FUNCTION increment_presentation_views(presentation_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.presentations 
    SET view_count = view_count + 1, last_viewed_at = NOW()
    WHERE id = presentation_uuid;
    
    INSERT INTO public.presentation_analytics (presentation_id, event_type, created_at)
    VALUES (presentation_uuid, 'view', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track API usage
CREATE OR REPLACE FUNCTION track_api_usage(
    user_uuid UUID,
    endpoint_path VARCHAR(255),
    request_method VARCHAR(10),
    tokens_consumed INTEGER DEFAULT 0,
    cost DECIMAL(10,4) DEFAULT 0.0000
)
RETURNS void AS $$
BEGIN
    INSERT INTO public.api_usage (user_id, endpoint, method, tokens_used, cost_usd)
    VALUES (user_uuid, endpoint_path, request_method, tokens_consumed, cost)
    ON CONFLICT (user_id, endpoint, method, date, hour)
    DO UPDATE SET
        request_count = api_usage.request_count + 1,
        tokens_used = api_usage.tokens_used + tokens_consumed,
        cost_usd = api_usage.cost_usd + cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, features, limits) VALUES
('Free', 'Perfect for getting started', 0.00, 0.00, 
 '{"ai_analysis": true, "basic_templates": true, "export_pdf": true}',
 '{"presentations_per_month": 5, "ai_analyses_per_month": 10, "team_members": 1}'),
('Pro', 'For professionals and small teams', 19.99, 199.99,
 '{"unlimited_presentations": true, "premium_templates": true, "collaboration": true, "priority_support": true}',
 '{"presentations_per_month": -1, "ai_analyses_per_month": 100, "team_members": 5}'),
('Enterprise', 'For large organizations', 99.99, 999.99,
 '{"white_label": true, "sso": true, "custom_templates": true, "dedicated_support": true, "api_access": true}',
 '{"presentations_per_month": -1, "ai_analyses_per_month": -1, "team_members": -1}');

-- Insert template categories
INSERT INTO public.template_categories (name, description, icon, color) VALUES
('Business', 'Professional business presentations', 'briefcase', 'blue'),
('Marketing', 'Marketing and sales presentations', 'megaphone', 'orange'),
('Financial', 'Financial reports and analysis', 'dollar-sign', 'green'),
('Strategy', 'Strategic planning and consulting', 'target', 'purple'),
('Education', 'Educational and training materials', 'graduation-cap', 'indigo'),
('Technology', 'Tech and product presentations', 'cpu', 'cyan');

-- Insert sample datasets for demo (commented out to avoid auth.users dependency)
-- INSERT INTO public.datasets (id, user_id, name, description, data, is_sample, row_count) VALUES
-- (uuid_generate_v4(), (SELECT id FROM auth.users LIMIT 1), 'Sample Financial Data', 'Quarterly financial performance data', 
--  '[{"Quarter": "Q1", "Revenue": 145000, "Expenses": 85000, "Profit": 60000}, 
--    {"Quarter": "Q2", "Revenue": 152000, "Expenses": 89000, "Profit": 63000},
--    {"Quarter": "Q3", "Revenue": 148000, "Expenses": 87000, "Profit": 61000},
--    {"Quarter": "Q4", "Revenue": 161000, "Expenses": 92000, "Profit": 69000}]', 
--  true, 4),
-- (uuid_generate_v4(), (SELECT id FROM auth.users LIMIT 1), 'Sample Sales Data', 'Monthly sales performance metrics',
--  '[{"Month": "Jan", "Leads": 1200, "Conversions": 180, "Revenue": 145000},
--    {"Month": "Feb", "Leads": 1350, "Conversions": 202, "Revenue": 152000},
--    {"Month": "Mar", "Leads": 1180, "Conversions": 189, "Revenue": 148000},
--    {"Month": "Apr", "Leads": 1500, "Conversions": 225, "Revenue": 161000}]',
--  true, 4);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- User dashboard view
CREATE OR REPLACE VIEW user_dashboard AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.subscription_status,
    COUNT(p.id) as presentation_count,
    COUNT(d.id) as dataset_count,
    COALESCE(SUM(p.view_count), 0) as total_views,
    u.created_at as joined_at
FROM public.users u
LEFT JOIN public.presentations p ON u.id = p.user_id
LEFT JOIN public.datasets d ON u.id = d.user_id
GROUP BY u.id, u.email, u.full_name, u.subscription_status, u.created_at;

-- Popular presentations view
CREATE OR REPLACE VIEW popular_presentations AS
SELECT 
    p.*,
    u.full_name as creator_name,
    u.company as creator_company
FROM public.presentations p
JOIN public.users u ON p.user_id = u.id
WHERE p.is_public = true
ORDER BY p.view_count DESC, p.created_at DESC;

-- =====================================================
-- FINAL SETUP VERIFICATION
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Enable realtime for collaboration features
ALTER PUBLICATION supabase_realtime ADD TABLE public.presentations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.presentation_shares;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_members;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'AEDRIN MARKETING DECK PLATFORM SETUP COMPLETE!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Created tables: %, %, %, %, %, %, %, %, %, %, %, %, %', 
        'users', 'presentations', 'datasets', 'qa_responses', 
        'ai_analysis_results', 'teams', 'team_members', 
        'presentation_shares', 'templates', 'subscription_plans',
        'user_subscriptions', 'api_usage', 'presentation_analytics';
    RAISE NOTICE 'Enabled RLS and created security policies';
    RAISE NOTICE 'Added indexes for optimal performance';
    RAISE NOTICE 'Created triggers and utility functions';
    RAISE NOTICE 'Inserted seed data for immediate testing';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Your enhanced deck builder is ready for production!';
    RAISE NOTICE '=====================================================';
END $$;