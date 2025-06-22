-- =====================================================
-- AEDRIN MARKETING DECK PLATFORM - CLEAN SETUP
-- Updated version with all required fields for complete data flow
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Enhanced users table with OAuth support
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    company VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    subscription_status VARCHAR(50) DEFAULT 'free',
    oauth_provider VARCHAR(50),
    oauth_provider_id VARCHAR(255),
    preferences JSONB DEFAULT '{}',
    api_usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles table (for Supabase auth integration)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    company_name TEXT,
    logo_url TEXT,
    brand_colors JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced presentations table with ALL required fields
CREATE TABLE IF NOT EXISTS public.presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft',
    template_id TEXT,
    slides JSONB DEFAULT '[]',
    data_sources JSONB DEFAULT '[]',
    narrative_config JSONB DEFAULT '{}',
    theme VARCHAR(50) DEFAULT 'dark',
    is_public BOOLEAN DEFAULT false,
    is_template BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    preview_image_url TEXT,
    structure JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presentation Events table for tracking user interactions
CREATE TABLE IF NOT EXISTS public.presentation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
    event_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dataset storage for uploaded data
CREATE TABLE IF NOT EXISTS public.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    data JSONB NOT NULL,
    row_count INTEGER,
    is_sample BOOLEAN DEFAULT false,
    processing_status VARCHAR(50) DEFAULT 'completed',
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
    data_type VARCHAR(50) NOT NULL,
    analysis_type VARCHAR(50) NOT NULL,
    target_audience VARCHAR(100),
    presentation_style VARCHAR(50) NOT NULL,
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
    analysis_type VARCHAR(50) NOT NULL,
    insights JSONB NOT NULL DEFAULT '{}',
    slide_recommendations JSONB NOT NULL DEFAULT '[]',
    executive_summary TEXT,
    key_findings TEXT[] DEFAULT '{}',
    confidence_score INTEGER DEFAULT 0,
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    model_version VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON public.presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_is_public ON public.presentations(is_public);
CREATE INDEX IF NOT EXISTS idx_presentations_status ON public.presentations(status);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.templates(created_by);
CREATE INDEX IF NOT EXISTS idx_presentation_events_user_id ON public.presentation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_events_presentation_id ON public.presentation_events(presentation_id);
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON public.datasets(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Profile policies
CREATE POLICY "Profiles can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Profiles can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Profiles can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Presentation policies
CREATE POLICY "Users can view own presentations" ON public.presentations
    FOR SELECT USING (auth.uid()::text = user_id::text OR is_public = true);

CREATE POLICY "Users can create presentations" ON public.presentations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own presentations" ON public.presentations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own presentations" ON public.presentations
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Template policies
CREATE POLICY "Users can view public templates" ON public.templates
    FOR SELECT USING (is_public = true OR auth.uid()::text = created_by::text);

CREATE POLICY "Users can create templates" ON public.templates
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

-- Presentation Events policies
CREATE POLICY "Users can view own events" ON public.presentation_events
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create events" ON public.presentation_events
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

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

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON public.presentations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON public.datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'AEDRIN PLATFORM DATABASE SETUP COMPLETE!';
    RAISE NOTICE 'All tables created with complete field coverage';
    RAISE NOTICE 'Ready for full deck building with real-time data!';
    RAISE NOTICE '=====================================================';
END $$;