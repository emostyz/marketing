-- AEDRIN User Profile System Migration
-- Created: 2024-12-22
-- Description: Comprehensive user profile system with pricing tiers and usage tracking

-- Add subscription plan enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
        CREATE TYPE subscription_plan AS ENUM ('starter', 'professional', 'enterprise');
    END IF;
END $$;

-- Update profiles table with new user profile fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS job_title TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS brand_colors JSONB,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS business_context TEXT,
ADD COLUMN IF NOT EXISTS business_goals JSONB,
ADD COLUMN IF NOT EXISTS key_questions JSONB,
ADD COLUMN IF NOT EXISTS key_metrics JSONB,
ADD COLUMN IF NOT EXISTS dataset_types JSONB,
ADD COLUMN IF NOT EXISTS usage_plan TEXT,
ADD COLUMN IF NOT EXISTS presentation_style TEXT,
ADD COLUMN IF NOT EXISTS data_preferences JSONB,
ADD COLUMN IF NOT EXISTS custom_requirements TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS master_system_prompt TEXT DEFAULT 'You are an expert business analyst and presentation designer. Create compelling, data-driven presentations that tell a clear story and drive decision-making. Focus on key insights and actionable recommendations.',
ADD COLUMN IF NOT EXISTS subscription_plan subscription_plan DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS presentations_used_this_month INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_reset_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create user_settings table for detailed preferences
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    theme_preference TEXT DEFAULT 'system',
    email_notifications BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    auto_save_interval INTEGER DEFAULT 30,
    default_export_format TEXT DEFAULT 'pdf',
    ai_assistance_level TEXT DEFAULT 'standard',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_tracking table for monitoring tier limits
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- Format: YYYY-MM
    presentations_created INTEGER DEFAULT 0,
    data_uploads INTEGER DEFAULT 0,
    ai_analyses INTEGER DEFAULT 0,
    exports_generated INTEGER DEFAULT 0,
    storage_used_mb INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- Create subscription_history table for tracking changes
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    old_plan subscription_plan,
    new_plan subscription_plan NOT NULL,
    change_reason TEXT,
    stripe_subscription_id TEXT,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to reset monthly usage counters
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE profiles 
    SET presentations_used_this_month = 0,
        monthly_reset_date = NOW() + INTERVAL '1 month'
    WHERE monthly_reset_date <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check tier limits
CREATE OR REPLACE FUNCTION check_tier_limit(
    user_uuid UUID,
    limit_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    user_plan subscription_plan;
    current_usage INTEGER;
    tier_limit INTEGER;
BEGIN
    -- Get user's current plan
    SELECT subscription_plan INTO user_plan 
    FROM profiles WHERE id = user_uuid;
    
    -- Get current usage based on limit type
    IF limit_type = 'presentations' THEN
        SELECT presentations_used_this_month INTO current_usage
        FROM profiles WHERE id = user_uuid;
        
        -- Set tier limits for presentations
        CASE user_plan
            WHEN 'starter' THEN tier_limit := 5;
            WHEN 'professional' THEN tier_limit := 25;
            WHEN 'enterprise' THEN tier_limit := -1; -- Unlimited
        END CASE;
    ELSE
        -- Default to allowing action
        RETURN TRUE;
    END IF;
    
    -- Check if unlimited (enterprise) or under limit
    RETURN (tier_limit = -1 OR current_usage < tier_limit);
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage_counter(
    user_uuid UUID,
    counter_type TEXT
) RETURNS void AS $$
BEGIN
    IF counter_type = 'presentations' THEN
        UPDATE profiles 
        SET presentations_used_this_month = presentations_used_this_month + 1
        WHERE id = user_uuid;
    END IF;
    
    -- Update usage tracking table
    INSERT INTO usage_tracking (user_id, month_year, presentations_created)
    VALUES (user_uuid, TO_CHAR(NOW(), 'YYYY-MM'), 1)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET 
        presentations_created = usage_tracking.presentations_created + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to upgrade user subscription
CREATE OR REPLACE FUNCTION upgrade_user_subscription(
    user_uuid UUID,
    new_plan subscription_plan,
    stripe_sub_id TEXT DEFAULT NULL,
    reason TEXT DEFAULT 'Manual upgrade'
) RETURNS void AS $$
DECLARE
    old_plan subscription_plan;
BEGIN
    -- Get current plan
    SELECT subscription_plan INTO old_plan 
    FROM profiles WHERE id = user_uuid;
    
    -- Update user's plan
    UPDATE profiles 
    SET subscription_plan = new_plan,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Record the change in history
    INSERT INTO subscription_history (user_id, old_plan, new_plan, change_reason, stripe_subscription_id)
    VALUES (user_uuid, old_plan, new_plan, reason, stripe_sub_id);
END;
$$ LANGUAGE plpgsql;

-- Function to rollback usage counter (for failed operations)
CREATE OR REPLACE FUNCTION rollback_usage_counter(
    user_uuid UUID,
    counter_type TEXT,
    rollback_reason TEXT DEFAULT 'Operation failed'
) RETURNS void AS $$
BEGIN
    -- Only allow rollback for presentations counter
    IF counter_type = 'presentations' THEN
        UPDATE profiles 
        SET presentations_used_this_month = GREATEST(presentations_used_this_month - 1, 0)
        WHERE id = user_uuid;
        
        -- Also update usage tracking table
        UPDATE usage_tracking 
        SET presentations_created = GREATEST(presentations_created - 1, 0),
            updated_at = NOW()
        WHERE user_id = user_uuid 
          AND month_year = TO_CHAR(NOW(), 'YYYY-MM');
    END IF;
    
    -- Log the rollback for audit purposes
    INSERT INTO usage_tracking (user_id, month_year, presentations_created)
    VALUES (user_uuid, 'ROLLBACK-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24:MI:SS'), -1)
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_monthly_reset ON profiles(monthly_reset_date);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_subscription_history_user ON subscription_history(user_id);

-- Create RLS policies for user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage" ON usage_tracking
    FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for subscription_history
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription history" ON subscription_history
    FOR SELECT USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at
    BEFORE UPDATE ON usage_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Initialize user_settings for existing users
INSERT INTO user_settings (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM user_settings);

-- Initialize usage_tracking for current month for existing users
INSERT INTO usage_tracking (user_id, month_year)
SELECT id, TO_CHAR(NOW(), 'YYYY-MM') FROM profiles
WHERE id NOT IN (
    SELECT user_id FROM usage_tracking 
    WHERE month_year = TO_CHAR(NOW(), 'YYYY-MM')
);

-- Comments for documentation
COMMENT ON TABLE user_settings IS 'User preferences and settings for the AEDRIN platform';
COMMENT ON TABLE usage_tracking IS 'Monthly usage tracking for tier limit enforcement';
COMMENT ON TABLE subscription_history IS 'Audit trail of subscription plan changes';
COMMENT ON FUNCTION check_tier_limit IS 'Validates if user can perform action based on their tier limits';
COMMENT ON FUNCTION increment_usage_counter IS 'Increments usage counters when user performs tracked actions';
COMMENT ON FUNCTION upgrade_user_subscription IS 'Handles subscription plan upgrades with history tracking';