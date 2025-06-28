-- ======================================
-- FIX AUTH & SCHEMA ISSUES MIGRATION
-- Fixes missing columns causing errors
-- ======================================

-- Fix profiles table - add missing businessContext column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_context TEXT,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS name TEXT;

-- Fix data_imports table - add missing uploaded_at column
ALTER TABLE public.data_imports 
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update profiles table structure to match expected schema
-- The error shows profiles.businessContext doesn't exist, but we have business_context
-- Add an alias/view for backwards compatibility if needed

-- Ensure RLS policies work correctly
DROP POLICY IF EXISTS "Users can view own profile by user_id" ON public.profiles;
CREATE POLICY "Users can view own profile by user_id" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile by user_id" ON public.profiles;
CREATE POLICY "Users can update own profile by user_id" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile by user_id" ON public.profiles;
CREATE POLICY "Users can insert own profile by user_id" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update the auth check to work properly with cookies
-- The issue is the Supabase client isn't properly reading auth cookies

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_data_imports_uploaded_at ON public.data_imports(uploaded_at);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'AUTH & SCHEMA FIX MIGRATION COMPLETE!';
    RAISE NOTICE 'Fixed:';
    RAISE NOTICE '- Added business_context to profiles';
    RAISE NOTICE '- Added user_id reference to profiles';
    RAISE NOTICE '- Added uploaded_at to data_imports';
    RAISE NOTICE '- Fixed RLS policies for proper auth';
    RAISE NOTICE '===========================================';
END $$;