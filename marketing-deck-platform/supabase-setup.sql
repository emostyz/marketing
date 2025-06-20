-- AEDRIN Platform - Supabase Database Setup Script
-- Run this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  subscription TEXT DEFAULT 'free' CHECK (subscription IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presentations table
CREATE TABLE public.presentations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  slides JSONB NOT NULL DEFAULT '[]',
  theme TEXT DEFAULT 'dark',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  qa_responses JSONB,
  original_data JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Datasets table (for storing uploaded data)
CREATE TABLE public.datasets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  qa_responses JSONB,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table (for tracking usage)
CREATE TABLE public.analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  presentation_id UUID REFERENCES public.presentations(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'view', 'edit', 'export', 'share'
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Presentations policies
CREATE POLICY "Users can view own presentations" ON public.presentations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public presentations" ON public.presentations
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create presentations" ON public.presentations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations" ON public.presentations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations" ON public.presentations
  FOR DELETE USING (auth.uid() = user_id);

-- Datasets policies
CREATE POLICY "Users can view own datasets" ON public.datasets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create datasets" ON public.datasets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own datasets" ON public.datasets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own datasets" ON public.datasets
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON public.analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create analytics" ON public.analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at timestamps
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_presentations_updated_at
  BEFORE UPDATE ON public.presentations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_datasets_updated_at
  BEFORE UPDATE ON public.datasets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_presentations_user_id ON public.presentations(user_id);
CREATE INDEX idx_presentations_created_at ON public.presentations(created_at DESC);
CREATE INDEX idx_presentations_is_public ON public.presentations(is_public);
CREATE INDEX idx_datasets_user_id ON public.datasets(user_id);
CREATE INDEX idx_datasets_created_at ON public.datasets(created_at DESC);
CREATE INDEX idx_analytics_user_id ON public.analytics(user_id);
CREATE INDEX idx_analytics_created_at ON public.analytics(created_at DESC);

-- Sample data (optional - remove in production)
-- This creates a demo user and sample presentations
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'demo@aedrin.com',
  '$2a$10$Xe8OB9h.ZyVfhgFEF3JQa.j8lGYV5wE8OlWJCfX7YXVBOvHMFYV0u', -- password: demo123
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.presentations TO anon, authenticated;
GRANT ALL ON public.datasets TO anon, authenticated;
GRANT ALL ON public.analytics TO anon, authenticated;