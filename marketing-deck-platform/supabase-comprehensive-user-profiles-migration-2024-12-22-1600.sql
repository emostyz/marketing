-- Comprehensive User Profiles Migration
-- Created: 2024-12-22 16:00:00
-- Description: Adds comprehensive user intake form fields to profiles table

-- Add new columns to profiles table for comprehensive user data
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_goals JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS key_questions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS dataset_types JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS usage_plan TEXT,
ADD COLUMN IF NOT EXISTS presentation_style TEXT,
ADD COLUMN IF NOT EXISTS custom_requirements TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update existing profiles to have default values for new fields
UPDATE profiles SET 
  business_goals = '[]'::jsonb,
  key_questions = '[]'::jsonb,
  dataset_types = '[]'::jsonb,
  onboarding_completed = false
WHERE business_goals IS NULL 
   OR key_questions IS NULL 
   OR dataset_types IS NULL 
   OR onboarding_completed IS NULL;

-- Create index for onboarding status for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed);

-- Create index for usage plan for analytics
CREATE INDEX IF NOT EXISTS idx_profiles_usage_plan 
ON profiles(usage_plan);

-- Create index for presentation style for analytics
CREATE INDEX IF NOT EXISTS idx_profiles_presentation_style 
ON profiles(presentation_style);

-- Update the profiles table to ensure consistent data structure
-- Add constraints to ensure data integrity
ALTER TABLE profiles 
ADD CONSTRAINT chk_business_goals_is_array 
CHECK (jsonb_typeof(business_goals) = 'array' OR business_goals IS NULL);

ALTER TABLE profiles 
ADD CONSTRAINT chk_key_questions_is_array 
CHECK (jsonb_typeof(key_questions) = 'array' OR key_questions IS NULL);

ALTER TABLE profiles 
ADD CONSTRAINT chk_dataset_types_is_array 
CHECK (jsonb_typeof(dataset_types) = 'array' OR dataset_types IS NULL);

-- Create RLS policies for the new fields (if RLS is enabled)
-- These policies ensure users can only access their own profile data

-- Enable RLS on profiles table if not already enabled
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own profile
-- CREATE POLICY "Users can view their own profile" ON profiles
--   FOR SELECT USING (auth.uid() = id);

-- Create policy for authenticated users to update their own profile
-- CREATE POLICY "Users can update their own profile" ON profiles
--   FOR UPDATE USING (auth.uid() = id);

-- Add comments to document the new fields
COMMENT ON COLUMN profiles.business_goals IS 'Array of business goals selected during onboarding';
COMMENT ON COLUMN profiles.key_questions IS 'Array of key business questions selected during onboarding';
COMMENT ON COLUMN profiles.dataset_types IS 'Array of data types the user typically works with';
COMMENT ON COLUMN profiles.usage_plan IS 'How the user plans to use presentations (e.g., weekly reports, board meetings)';
COMMENT ON COLUMN profiles.presentation_style IS 'Preferred presentation style (e.g., executive, creative, technical)';
COMMENT ON COLUMN profiles.custom_requirements IS 'Additional custom requirements or preferences';
COMMENT ON COLUMN profiles.onboarding_completed IS 'Whether the user has completed the comprehensive onboarding flow';

-- Create a view for analytics that aggregates user preferences
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

-- Create a function to get comprehensive user context for AI
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

-- Create an updated_at trigger for the profiles table if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to ensure it's current
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration completion log
INSERT INTO migrations_log (
  migration_name, 
  executed_at, 
  description
) VALUES (
  'comprehensive_user_profiles_2024_12_22_1600',
  CURRENT_TIMESTAMP,
  'Added comprehensive user intake form fields to profiles table with analytics views and helper functions'
) ON CONFLICT (migration_name) DO NOTHING;

-- Create migrations_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

COMMENT ON TABLE migrations_log IS 'Tracks database migrations for audit and rollback purposes';