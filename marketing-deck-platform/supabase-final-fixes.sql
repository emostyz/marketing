-- Safe Database Migration for Marketing Deck Platform
-- This migration creates necessary tables without touching system tables

-- Drop existing application tables if they exist (clean slate approach)
DROP TABLE IF EXISTS presentations CASCADE;
DROP TABLE IF EXISTS slides CASCADE;
DROP TABLE IF EXISTS user_interactions CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create custom types/enums
DO $$ BEGIN
    CREATE TYPE presentation_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE slide_type AS ENUM ('title', 'content', 'chart', 'image', 'summary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE interaction_type AS ENUM ('click', 'scroll', 'hover', 'form_submit', 'download');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table with all necessary columns
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    company TEXT,
    role TEXT,
    industry TEXT,
    phone TEXT,
    avatar_url TEXT,
    brand_colors JSONB DEFAULT '{"primary": "#3B82F6", "secondary": "#1F2937"}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    subscription_tier TEXT DEFAULT 'free',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status presentation_status DEFAULT 'draft',
    template_id TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create slides table
CREATE TABLE IF NOT EXISTS slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
    slide_number INTEGER NOT NULL,
    slide_type slide_type DEFAULT 'content',
    title TEXT,
    content JSONB DEFAULT '{}'::jsonb,
    layout JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics tables
CREATE TABLE IF NOT EXISTS page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    page_path TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type interaction_type NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    page_path TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leads table with unique email constraint
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    company TEXT,
    role TEXT,
    source TEXT,
    status TEXT DEFAULT 'new',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_slides_presentation_id ON slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

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
CREATE POLICY "Users can view slides of own presentations" ON slides
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM presentations 
            WHERE presentations.id = slides.presentation_id 
            AND presentations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert slides to own presentations" ON slides
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM presentations 
            WHERE presentations.id = slides.presentation_id 
            AND presentations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update slides of own presentations" ON slides
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM presentations 
            WHERE presentations.id = slides.presentation_id 
            AND presentations.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete slides of own presentations" ON slides
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM presentations 
            WHERE presentations.id = slides.presentation_id 
            AND presentations.user_id = auth.uid()
        )
    );

-- Analytics policies (more permissive for tracking)
CREATE POLICY "Users can view own analytics" ON page_views
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert analytics" ON page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own interactions" ON user_interactions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert interactions" ON user_interactions
    FOR INSERT WITH CHECK (true);

-- Leads policies (admin only for now)
CREATE POLICY "Admin can manage leads" ON leads
    FOR ALL USING (auth.uid() IN (
        SELECT user_id FROM profiles WHERE subscription_tier = 'admin'
    ));

-- Create storage bucket for file uploads (without ON CONFLICT)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'uploads') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', false);
    END IF;
END $$;

-- Storage policies for file uploads
CREATE POLICY "Users can upload files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'uploads' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'uploads' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'uploads' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'uploads' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (user_id, email, first_name, last_name, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON presentations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (without ON CONFLICT)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM leads WHERE email = 'demo@example.com') THEN
        INSERT INTO leads (email, first_name, last_name, company, role, source) 
        VALUES ('demo@example.com', 'Demo', 'User', 'Demo Company', 'Manager', 'website');
    END IF;
END $$;

-- Migration completed successfully
SELECT 'Database migration completed successfully!' as status;
