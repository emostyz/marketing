-- Fix Profiles Table Schema - 2024-12-22-1600
-- This migration fixes the missing profiles table and ensures all required columns exist

-- First, let's check if the profiles table exists and drop it if it has the wrong structure
DO $$ 
BEGIN
    -- Check if profiles table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        -- Check if it has the correct user_id column
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_id') THEN
            -- Drop the table if it doesn't have the correct structure
            DROP TABLE IF EXISTS public.profiles CASCADE;
        END IF;
    END IF;
END $$;

-- Create the profiles table with the correct structure
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    job_title TEXT,
    industry TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    brand_colors JSONB,
    bio TEXT,
    phone TEXT,
    target_audience TEXT,
    business_context TEXT,
    master_system_prompt TEXT,
    key_metrics JSONB,
    logo_url TEXT,
    profile_picture_url TEXT,
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    notification_settings JSONB DEFAULT '{"email": true, "push": true, "marketing": false}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'first_name',
        NEW.raw_user_meta_data->>'last_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create view for public profile data (for sharing)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
    id,
    full_name,
    company_name,
    job_title,
    industry,
    avatar_url,
    created_at
FROM public.profiles
WHERE is_active = true;

-- Grant access to public profiles view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profiles with comprehensive information for the marketing deck platform';
COMMENT ON COLUMN public.profiles.user_id IS 'Foreign key reference to auth.users.id';
COMMENT ON COLUMN public.profiles.bio IS 'User bio/description';
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';
COMMENT ON COLUMN public.profiles.target_audience IS 'User''s target audience description';
COMMENT ON COLUMN public.profiles.business_context IS 'User''s business context and background';
COMMENT ON COLUMN public.profiles.master_system_prompt IS 'User''s custom system prompt for AI interactions';
COMMENT ON COLUMN public.profiles.key_metrics IS 'User''s key business metrics as JSON array';
COMMENT ON COLUMN public.profiles.logo_url IS 'URL to user''s company logo';
COMMENT ON COLUMN public.profiles.profile_picture_url IS 'URL to user''s profile picture';
COMMENT ON COLUMN public.profiles.preferences IS 'User preferences as JSON object';
COMMENT ON COLUMN public.profiles.notification_settings IS 'User notification preferences as JSON object';
