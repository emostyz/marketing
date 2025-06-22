-- =====================================================
-- COMPREHENSIVE SUPABASE MIGRATION - COMPLETE DATA PERSISTENCE SETUP
-- This migration ensures ALL user data is captured and stored in Supabase
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE/UPDATE CORE TABLES
-- ============================================

-- Profiles table (comprehensive user data for world-class presentations)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    company_name TEXT,
    job_title TEXT,
    phone TEXT,
    avatar_url TEXT,
    
    -- CRITICAL BUSINESS CONTEXT (Required for AI Analysis)
    industry TEXT NOT NULL,
    target_audience TEXT NOT NULL,
    business_context TEXT,
    business_goals TEXT,
    key_metrics TEXT[],
    data_description TEXT,
    
    -- PRESENTATION INTELLIGENCE
    dataset_types TEXT[],
    usage_plan TEXT,
    language_preference TEXT DEFAULT 'en',
    chart_style_preference TEXT DEFAULT 'modern',
    narrative_style TEXT DEFAULT 'executive',
    brand_colors JSONB DEFAULT '{}',
    
    -- ADVANCED PREFERENCES
    preferred_templates TEXT[],
    color_schemes JSONB DEFAULT '[]',
    font_preferences JSONB DEFAULT '{}',
    slide_layout_preferences JSONB DEFAULT '{}',
    
    -- USER ANALYTICS & BEHAVIOR
    presentation_count INTEGER DEFAULT 0,
    total_slides_created INTEGER DEFAULT 0,
    favorite_chart_types TEXT[],
    most_used_data_sources TEXT[],
    avg_presentation_length INTEGER DEFAULT 10,
    typical_audience_size TEXT DEFAULT 'small',
    
    -- SYSTEM & TRACKING
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    subscription_plan TEXT DEFAULT 'free',
    onboarding_completed BOOLEAN DEFAULT false,
    profile_completeness_score INTEGER DEFAULT 0,
    
    -- FEATURE USAGE & OPTIMIZATION
    features_used JSONB DEFAULT '{}',
    last_presentation_date TIMESTAMP WITH TIME ZONE,
    total_exports INTEGER DEFAULT 0,
    feedback_scores JSONB DEFAULT '{}',
    ai_suggestions_accepted INTEGER DEFAULT 0,
    
    -- COLLABORATIVE FEATURES
    team_id UUID,
    sharing_preferences JSONB DEFAULT '{}',
    collaboration_history JSONB DEFAULT '[]'
);

-- User sessions table (for proper auth)
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Presentations table (enhanced)
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
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data imports table (for file uploads)
CREATE TABLE IF NOT EXISTS public.data_imports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    file_url TEXT,
    file_content JSONB,
    upload_status TEXT DEFAULT 'uploaded',
    processing_status TEXT DEFAULT 'pending',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deck builder sessions table (to save work in progress)
CREATE TABLE IF NOT EXISTS public.deck_builder_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL DEFAULT '{}',
    current_step INTEGER DEFAULT 1,
    is_completed BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User context data table (business info from deck builder)
CREATE TABLE IF NOT EXISTS public.user_contexts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    industry TEXT,
    business_context TEXT,
    target_audience TEXT,
    data_quality TEXT,
    data_source TEXT,
    collection_method TEXT,
    confidence_level INTEGER,
    factors TEXT[],
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

-- Presentation events table (user activity tracking)
CREATE TABLE IF NOT EXISTS public.presentation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table (settings and preferences)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    theme TEXT DEFAULT 'system',
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    auto_save_enabled BOOLEAN DEFAULT true,
    default_chart_style TEXT DEFAULT 'modern',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================

-- Add missing columns to presentations if they don't exist
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'presentations' AND column_name = 'status') THEN
        ALTER TABLE public.presentations ADD COLUMN status TEXT DEFAULT 'draft';
    END IF;
    
    -- Add template_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'presentations' AND column_name = 'template_id') THEN
        ALTER TABLE public.presentations ADD COLUMN template_id TEXT;
    END IF;
    
    -- Add data_sources column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'presentations' AND column_name = 'data_sources') THEN
        ALTER TABLE public.presentations ADD COLUMN data_sources JSONB DEFAULT '[]';
    END IF;
    
    -- Add narrative_config column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'presentations' AND column_name = 'narrative_config') THEN
        ALTER TABLE public.presentations ADD COLUMN narrative_config JSONB DEFAULT '{}';
    END IF;
    
    -- Add is_public column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'presentations' AND column_name = 'is_public') THEN
        ALTER TABLE public.presentations ADD COLUMN is_public BOOLEAN DEFAULT false;
    END IF;
END $$;

-- ============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- User sessions indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Presentations indexes
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON public.presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_status ON public.presentations(status);
CREATE INDEX IF NOT EXISTS idx_presentations_created_at ON public.presentations(created_at);
CREATE INDEX IF NOT EXISTS idx_presentations_is_public ON public.presentations(is_public);

-- Data imports indexes
CREATE INDEX IF NOT EXISTS idx_data_imports_user_id ON public.data_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_data_imports_presentation_id ON public.data_imports(presentation_id);
CREATE INDEX IF NOT EXISTS idx_data_imports_created_at ON public.data_imports(created_at);

-- Deck builder sessions indexes
CREATE INDEX IF NOT EXISTS idx_deck_builder_sessions_user_id ON public.deck_builder_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_deck_builder_sessions_expires_at ON public.deck_builder_sessions(expires_at);

-- User contexts indexes
CREATE INDEX IF NOT EXISTS idx_user_contexts_user_id ON public.user_contexts(user_id);

-- Templates indexes
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.templates(created_by);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON public.templates(is_public);

-- Presentation events indexes
CREATE INDEX IF NOT EXISTS idx_presentation_events_user_id ON public.presentation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_events_presentation_id ON public.presentation_events(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentation_events_event_type ON public.presentation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_presentation_events_created_at ON public.presentation_events(created_at);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- ============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deck_builder_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- User sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create own sessions" ON public.user_sessions;
CREATE POLICY "Users can create own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own sessions" ON public.user_sessions;
CREATE POLICY "Users can update own sessions" ON public.user_sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;
CREATE POLICY "Users can delete own sessions" ON public.user_sessions
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Presentations policies
DROP POLICY IF EXISTS "Users can view own presentations" ON public.presentations;
CREATE POLICY "Users can view own presentations" ON public.presentations
    FOR SELECT USING (auth.uid()::text = user_id::text OR is_public = true);

DROP POLICY IF EXISTS "Users can create presentations" ON public.presentations;
CREATE POLICY "Users can create presentations" ON public.presentations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own presentations" ON public.presentations;
CREATE POLICY "Users can update own presentations" ON public.presentations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own presentations" ON public.presentations;
CREATE POLICY "Users can delete own presentations" ON public.presentations
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Data imports policies
DROP POLICY IF EXISTS "Users can view own imports" ON public.data_imports;
CREATE POLICY "Users can view own imports" ON public.data_imports
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create imports" ON public.data_imports;
CREATE POLICY "Users can create imports" ON public.data_imports
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own imports" ON public.data_imports;
CREATE POLICY "Users can update own imports" ON public.data_imports
    FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own imports" ON public.data_imports;
CREATE POLICY "Users can delete own imports" ON public.data_imports
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Deck builder sessions policies
DROP POLICY IF EXISTS "Users can view own sessions" ON public.deck_builder_sessions;
CREATE POLICY "Users can view own deck sessions" ON public.deck_builder_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create deck sessions" ON public.deck_builder_sessions;
CREATE POLICY "Users can create deck sessions" ON public.deck_builder_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own deck sessions" ON public.deck_builder_sessions;
CREATE POLICY "Users can update own deck sessions" ON public.deck_builder_sessions
    FOR UPDATE USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can delete own deck sessions" ON public.deck_builder_sessions;
CREATE POLICY "Users can delete own deck sessions" ON public.deck_builder_sessions
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- User contexts policies
DROP POLICY IF EXISTS "Users can view own contexts" ON public.user_contexts;
CREATE POLICY "Users can view own contexts" ON public.user_contexts
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create contexts" ON public.user_contexts;
CREATE POLICY "Users can create contexts" ON public.user_contexts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own contexts" ON public.user_contexts;
CREATE POLICY "Users can update own contexts" ON public.user_contexts
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Templates policies
DROP POLICY IF EXISTS "Users can view public templates" ON public.templates;
CREATE POLICY "Users can view public templates" ON public.templates
    FOR SELECT USING (is_public = true OR auth.uid()::text = created_by::text);

DROP POLICY IF EXISTS "Users can create templates" ON public.templates;
CREATE POLICY "Users can create templates" ON public.templates
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

DROP POLICY IF EXISTS "Users can update own templates" ON public.templates;
CREATE POLICY "Users can update own templates" ON public.templates
    FOR UPDATE USING (auth.uid()::text = created_by::text);

-- Presentation events policies
DROP POLICY IF EXISTS "Users can view own events" ON public.presentation_events;
CREATE POLICY "Users can view own events" ON public.presentation_events
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create events" ON public.presentation_events;
CREATE POLICY "Users can create events" ON public.presentation_events
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- User preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create preferences" ON public.user_preferences;
CREATE POLICY "Users can create preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- ============================================
-- 6. CREATE TRIGGERS FOR UPDATED_AT
-- ============================================

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_presentations_updated_at ON public.presentations;
CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON public.presentations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deck_builder_sessions_updated_at ON public.deck_builder_sessions;
CREATE TRIGGER update_deck_builder_sessions_updated_at BEFORE UPDATE ON public.deck_builder_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_contexts_updated_at ON public.user_contexts;
CREATE TRIGGER update_user_contexts_updated_at BEFORE UPDATE ON public.user_contexts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_sessions TO authenticated;
GRANT ALL ON public.presentations TO authenticated;
GRANT ALL ON public.data_imports TO authenticated;
GRANT ALL ON public.deck_builder_sessions TO authenticated;
GRANT ALL ON public.user_contexts TO authenticated;
GRANT ALL ON public.templates TO authenticated;
GRANT ALL ON public.presentation_events TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- 8. CLEANUP EXPIRED SESSIONS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM public.user_sessions WHERE expires_at < NOW();
    DELETE FROM public.deck_builder_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. CREATE STORAGE BUCKETS FOR FILE UPLOADS
-- ============================================

-- Create storage bucket for user uploads (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for avatars (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for presentation assets (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('presentation-assets', 'presentation-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user uploads
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
CREATE POLICY "Users can upload own files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Avatar policies (public read, owner write)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 10. SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'COMPREHENSIVE MIGRATION COMPLETE!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Created/Updated Tables:';
    RAISE NOTICE '• profiles - Complete user information & preferences';
    RAISE NOTICE '• user_sessions - Proper authentication sessions';
    RAISE NOTICE '• presentations - Enhanced with all required fields';
    RAISE NOTICE '• data_imports - File upload tracking';
    RAISE NOTICE '• deck_builder_sessions - Save work in progress';
    RAISE NOTICE '• user_contexts - Business context from deck builder';
    RAISE NOTICE '• templates - Presentation templates';
    RAISE NOTICE '• presentation_events - User activity tracking';
    RAISE NOTICE '• user_preferences - Settings and preferences';
    RAISE NOTICE '';
    RAISE NOTICE 'Features Added:';
    RAISE NOTICE '• Complete RLS security policies';
    RAISE NOTICE '• Performance indexes on all key fields';
    RAISE NOTICE '• Auto-updating timestamps';
    RAISE NOTICE '• Storage buckets for file uploads';
    RAISE NOTICE '• Session cleanup functions';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Update API endpoints to use these tables';
    RAISE NOTICE '2. Replace mock authentication with Supabase Auth';
    RAISE NOTICE '3. Connect all forms to save data to database';
    RAISE NOTICE '4. Implement file upload to Supabase Storage';
    RAISE NOTICE '=====================================================';
END $$;