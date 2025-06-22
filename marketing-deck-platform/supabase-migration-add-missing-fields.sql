-- =====================================================
-- AEDRIN PLATFORM - MIGRATION TO ADD MISSING FIELDS
-- Run this to update existing database with new fields
-- =====================================================

-- Add missing fields to presentations table
ALTER TABLE public.presentations 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS template_id TEXT,
ADD COLUMN IF NOT EXISTS data_sources JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS narrative_config JSONB DEFAULT '{}';

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    company_name TEXT,
    logo_url TEXT,
    brand_colors JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table if it doesn't exist
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

-- Create presentation_events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.presentation_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
    event_type TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_presentations_status ON public.presentations(status);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON public.templates(created_by);
CREATE INDEX IF NOT EXISTS idx_presentation_events_user_id ON public.presentation_events(user_id);
CREATE INDEX IF NOT EXISTS idx_presentation_events_presentation_id ON public.presentation_events(presentation_id);

-- Enable RLS on new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentation_events ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for new tables
DROP POLICY IF EXISTS "Profiles can view own profile" ON public.profiles;
CREATE POLICY "Profiles can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Profiles can update own profile" ON public.profiles;
CREATE POLICY "Profiles can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Profiles can create own profile" ON public.profiles;
CREATE POLICY "Profiles can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Users can view public templates" ON public.templates;
CREATE POLICY "Users can view public templates" ON public.templates
    FOR SELECT USING (is_public = true OR auth.uid()::text = created_by::text);

DROP POLICY IF EXISTS "Users can create templates" ON public.templates;
CREATE POLICY "Users can create templates" ON public.templates
    FOR INSERT WITH CHECK (auth.uid()::text = created_by::text);

DROP POLICY IF EXISTS "Users can view own events" ON public.presentation_events;
CREATE POLICY "Users can view own events" ON public.presentation_events
    FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can create events" ON public.presentation_events;
CREATE POLICY "Users can create events" ON public.presentation_events
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Update existing presentation policies to use text comparison
DROP POLICY IF EXISTS "Users can view own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can create presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can update own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can delete own presentations" ON public.presentations;

CREATE POLICY "Users can view own presentations" ON public.presentations
    FOR SELECT USING (auth.uid()::text = user_id::text OR is_public = true);

CREATE POLICY "Users can create presentations" ON public.presentations
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own presentations" ON public.presentations
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own presentations" ON public.presentations
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Add triggers for updated_at on new tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_templates_updated_at ON public.templates;
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions on new tables
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.templates TO authenticated;
GRANT ALL ON public.presentation_events TO authenticated;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'MIGRATION COMPLETE!';
    RAISE NOTICE 'Added missing fields to presentations table:';
    RAISE NOTICE '- status (TEXT)';
    RAISE NOTICE '- template_id (TEXT)';
    RAISE NOTICE '- data_sources (JSONB)';
    RAISE NOTICE '- narrative_config (JSONB)';
    RAISE NOTICE 'Created new tables: profiles, templates, presentation_events';
    RAISE NOTICE 'Updated RLS policies for UUID compatibility';
    RAISE NOTICE '=====================================================';
END $$; 