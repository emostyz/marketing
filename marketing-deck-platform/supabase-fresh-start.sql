-- =====================================================
-- AEDRIN PLATFORM - FRESH START SETUP
-- This will clean up any existing issues and start fresh
-- =====================================================

-- First, drop any existing policies that might reference missing columns
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own presentations" ON public.presentations;
    DROP POLICY IF EXISTS "Users can create presentations" ON public.presentations;
    DROP POLICY IF EXISTS "Users can update own presentations" ON public.presentations;
    DROP POLICY IF EXISTS "Users can delete own presentations" ON public.presentations;
    DROP POLICY IF EXISTS "Users can view own datasets" ON public.datasets;
    DROP POLICY IF EXISTS "Users can create datasets" ON public.datasets;
    DROP POLICY IF EXISTS "Users can update own datasets" ON public.datasets;
    DROP POLICY IF EXISTS "Users can delete own datasets" ON public.datasets;
    DROP POLICY IF EXISTS "Users can view own qa responses" ON public.qa_responses;
    DROP POLICY IF EXISTS "Users can create qa responses" ON public.qa_responses;
    DROP POLICY IF EXISTS "Users can view own ai results" ON public.ai_analysis_results;
    DROP POLICY IF EXISTS "Users can create ai results" ON public.ai_analysis_results;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Ignore errors if policies don't exist
END $$;

-- Drop existing tables if they exist (in correct order)
DROP TABLE IF EXISTS public.ai_analysis_results CASCADE;
DROP TABLE IF EXISTS public.qa_responses CASCADE;
DROP TABLE IF EXISTS public.datasets CASCADE;
DROP TABLE IF EXISTS public.presentations CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CREATE FRESH TABLES
-- =====================================================

-- Users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    company VARCHAR(255),
    subscription_status VARCHAR(50) DEFAULT 'free',
    oauth_provider VARCHAR(50),
    oauth_provider_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presentations table (with is_public column properly defined)
CREATE TABLE public.presentations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    slides JSONB NOT NULL DEFAULT '[]',
    theme VARCHAR(50) DEFAULT 'dark',
    is_public BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datasets table
CREATE TABLE public.datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    data JSONB NOT NULL,
    row_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QA responses table
CREATE TABLE public.qa_responses (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analysis results table
CREATE TABLE public.ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    dataset_id UUID REFERENCES public.datasets(id) ON DELETE CASCADE,
    qa_response_id UUID REFERENCES public.qa_responses(id) ON DELETE CASCADE,
    presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL,
    insights JSONB NOT NULL DEFAULT '{}',
    executive_summary TEXT,
    confidence_score INTEGER DEFAULT 0,
    tokens_used INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_presentations_user_id ON public.presentations(user_id);
CREATE INDEX idx_presentations_is_public ON public.presentations(is_public);
CREATE INDEX idx_datasets_user_id ON public.datasets(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qa_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Presentation policies (now is_public column exists)
CREATE POLICY "Users can view presentations" ON public.presentations
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

-- =====================================================
-- UPDATED_AT TRIGGERS
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

CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON public.presentations
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
-- SUCCESS
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🎉 AEDRIN DATABASE SETUP COMPLETE!';
    RAISE NOTICE '✅ All tables created successfully';
    RAISE NOTICE '✅ RLS policies configured';
    RAISE NOTICE '✅ Ready for OAuth and AI brain!';
END $$;