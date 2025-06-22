-- Complete Database Setup for AEDRIN Platform
-- This script creates all necessary tables and schema for the platform
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create migrations_log table first
CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

COMMENT ON TABLE migrations_log IS 'Tracks database migrations for audit and rollback purposes';

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  company_name VARCHAR(255),
  industry VARCHAR(100),
  target_audience VARCHAR(255),
  business_context TEXT,
  key_metrics JSONB DEFAULT '[]',
  brand_colors JSONB DEFAULT '[]',
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  onboarding_completed BOOLEAN DEFAULT false,
  business_goals JSONB DEFAULT '[]',
  key_questions JSONB DEFAULT '[]',
  dataset_types JSONB DEFAULT '[]',
  usage_plan TEXT,
  presentation_style TEXT,
  custom_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  company VARCHAR(255),
  source VARCHAR(100) DEFAULT 'homepage',
  status VARCHAR(50) DEFAULT 'new',
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create presentations table
CREATE TABLE IF NOT EXISTS presentations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slides JSONB DEFAULT '[]',
  theme VARCHAR(100) DEFAULT 'default',
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  qa_responses JSONB,
  original_data JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create datasets table
CREATE TABLE IF NOT EXISTS datasets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  data JSONB NOT NULL,
  file_type VARCHAR(50),
  file_size BIGINT,
  qa_responses JSONB,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  presentation_id UUID REFERENCES presentations(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user_events table
CREATE TABLE IF NOT EXISTS user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create auth_events table
CREATE TABLE IF NOT EXISTS auth_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profile_events table
CREATE TABLE IF NOT EXISTS profile_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create subscription_events table
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payment_events table
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  stripe_event_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create lead_events table
CREATE TABLE IF NOT EXISTS lead_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create system_events table
CREATE TABLE IF NOT EXISTS system_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  severity VARCHAR(20) DEFAULT 'info',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year VARCHAR(7) NOT NULL, -- YYYY-MM format
  presentations_created INTEGER DEFAULT 0,
  data_uploads INTEGER DEFAULT 0,
  exports_generated INTEGER DEFAULT 0,
  ai_analyses INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month_year)
);

-- Create slide_events table
CREATE TABLE IF NOT EXISTS slide_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  slide_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create presentation_events table
CREATE TABLE IF NOT EXISTS presentation_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create data_upload_events table
CREATE TABLE IF NOT EXISTS data_upload_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id VARCHAR(255) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  data_type VARCHAR(100) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create export_events table
CREATE TABLE IF NOT EXISTS export_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  export_type VARCHAR(100) NOT NULL,
  export_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_created_at ON presentations(created_at);
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_events_user_id ON auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_event_type ON auth_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_severity ON system_events(severity);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON presentations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at
  BEFORE UPDATE ON datasets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE slide_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_upload_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Presentations policies
CREATE POLICY "Users can view their own presentations" ON presentations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentations" ON presentations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations" ON presentations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations" ON presentations
  FOR DELETE USING (auth.uid() = user_id);

-- Datasets policies
CREATE POLICY "Users can view their own datasets" ON datasets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own datasets" ON datasets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own datasets" ON datasets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own datasets" ON datasets
  FOR DELETE USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view their own analytics" ON analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User events policies
CREATE POLICY "Users can view their own events" ON user_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON user_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auth events policies
CREATE POLICY "Users can view their own auth events" ON auth_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own auth events" ON auth_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Profile events policies
CREATE POLICY "Users can view their own profile events" ON profile_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile events" ON profile_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Subscription events policies
CREATE POLICY "Users can view their own subscription events" ON subscription_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription events" ON subscription_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view their own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Slide events policies
CREATE POLICY "Users can view their own slide events" ON slide_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own slide events" ON slide_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Presentation events policies
CREATE POLICY "Users can view their own presentation events" ON presentation_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentation events" ON presentation_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Data upload events policies
CREATE POLICY "Users can view their own upload events" ON data_upload_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own upload events" ON data_upload_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Export events policies
CREATE POLICY "Users can view their own export events" ON export_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own export events" ON export_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for leads (for admin purposes)
CREATE POLICY "Public read access for leads" ON leads
  FOR SELECT USING (true);

CREATE POLICY "Public insert access for leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Public read access for system events (for admin purposes)
CREATE POLICY "Public read access for system events" ON system_events
  FOR SELECT USING (true);

CREATE POLICY "Public insert access for system events" ON system_events
  FOR INSERT WITH CHECK (true);

-- Public read access for payment events (for admin purposes)
CREATE POLICY "Public read access for payment events" ON payment_events
  FOR SELECT USING (true);

CREATE POLICY "Public insert access for payment events" ON payment_events
  FOR INSERT WITH CHECK (true);

-- Public read access for lead events (for admin purposes)
CREATE POLICY "Public read access for lead events" ON lead_events
  FOR SELECT USING (true);

CREATE POLICY "Public insert access for lead events" ON lead_events
  FOR INSERT WITH CHECK (true);

-- Create function to get user context for AI
CREATE OR REPLACE FUNCTION get_user_context(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  context JSONB;
BEGIN
  SELECT jsonb_build_object(
    'companyName', company_name,
    'industry', industry,
    'targetAudience', target_audience,
    'businessContext', business_context,
    'businessGoals', business_goals,
    'keyQuestions', key_questions,
    'keyMetrics', key_metrics,
    'datasetTypes', dataset_types,
    'usagePlan', usage_plan,
    'presentationStyle', presentation_style,
    'brandColors', brand_colors,
    'customRequirements', custom_requirements,
    'onboardingCompleted', onboarding_completed
  ) INTO context
  FROM profiles
  WHERE id = user_id;
  
  RETURN context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_context(UUID) TO authenticated;

-- Create view for user preferences analytics
CREATE OR REPLACE VIEW user_preferences_analytics AS
SELECT 
  industry,
  usage_plan,
  presentation_style,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM profiles 
WHERE onboarding_completed = true
GROUP BY industry, usage_plan, presentation_style
ORDER BY user_count DESC;

-- Log the migration
INSERT INTO migrations_log (
  migration_name, 
  executed_at, 
  description
) VALUES (
  'complete_database_setup_2024_12_22',
  CURRENT_TIMESTAMP,
  'Created complete database schema with all tables, indexes, triggers, and RLS policies for AEDRIN platform'
) ON CONFLICT (migration_name) DO NOTHING;

-- Add comments to document the tables
COMMENT ON TABLE profiles IS 'User profiles with comprehensive onboarding data';
COMMENT ON TABLE leads IS 'Lead capture data from website forms';
COMMENT ON TABLE presentations IS 'AI-generated presentations';
COMMENT ON TABLE datasets IS 'User uploaded data files';
COMMENT ON TABLE analytics IS 'User analytics and tracking data';
COMMENT ON TABLE user_events IS 'User interaction events';
COMMENT ON TABLE auth_events IS 'Authentication events';
COMMENT ON TABLE profile_events IS 'Profile change events';
COMMENT ON TABLE subscription_events IS 'Subscription change events';
COMMENT ON TABLE payment_events IS 'Payment processing events';
COMMENT ON TABLE lead_events IS 'Lead interaction events';
COMMENT ON TABLE system_events IS 'System errors and events';
COMMENT ON TABLE usage_tracking IS 'Monthly usage tracking per user';
COMMENT ON TABLE slide_events IS 'Slide editing events';
COMMENT ON TABLE presentation_events IS 'Presentation interaction events';
COMMENT ON TABLE data_upload_events IS 'Data upload tracking';
COMMENT ON TABLE export_events IS 'Export tracking events'; 