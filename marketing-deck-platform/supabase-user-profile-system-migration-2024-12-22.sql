-- AEDRIN User Profile System Migration (Overhauled)
-- Created: 2024-12-22
-- Updated: 2024-06-22 (Full audit, analytics, and compliance overhaul)

-- ENUMS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
        CREATE TYPE subscription_plan AS ENUM ('starter', 'professional', 'enterprise');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'auth_event_type') THEN
        CREATE TYPE auth_event_type AS ENUM ('register', 'login', 'logout', 'password_reset', 'email_change', 'profile_update', 'delete_account');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_action_type') THEN
        CREATE TYPE user_action_type AS ENUM ('form_submit', 'lead_capture', 'feedback', 'data_upload', 'export', 'slide_edit', 'settings_change', 'tier_change', 'profile_edit', 'login', 'logout', 'register', 'payment', 'other');
    END IF;
END $$;

-- PROFILES TABLE (User Master Record)
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
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_ip TEXT,
ADD COLUMN IF NOT EXISTS last_user_agent TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- AUTH EVENTS (Every login, logout, register, etc.)
CREATE TABLE IF NOT EXISTS auth_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    event_type auth_event_type NOT NULL,
    event_metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PROFILE CHANGE HISTORY (Full audit trail)
CREATE TABLE IF NOT EXISTS profile_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    changed_fields JSONB NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    change_reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TIER/PLAN CHANGE HISTORY (with transaction IDs, days left, etc.)
CREATE TABLE IF NOT EXISTS tier_change_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    old_plan subscription_plan,
    new_plan subscription_plan NOT NULL,
    change_reason TEXT,
    stripe_subscription_id TEXT,
    stripe_transaction_id TEXT,
    effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    days_left INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER SETTINGS (Current)
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

-- USER SETTINGS CHANGE HISTORY
CREATE TABLE IF NOT EXISTS user_settings_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    changed_fields JSONB NOT NULL,
    old_values JSONB,
    new_values JSONB,
    changed_by UUID,
    change_reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USAGE TRACKING (Monthly, for analytics)
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

-- SLIDE/DOCUMENT EDIT HISTORY (Every change to slides/docs)
CREATE TABLE IF NOT EXISTS slide_edit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    slide_id UUID,
    presentation_id UUID,
    edit_type TEXT,
    old_content JSONB,
    new_content JSONB,
    changed_fields JSONB,
    changed_by UUID,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER ACTIONS (Every possible user action, for analytics)
CREATE TABLE IF NOT EXISTS user_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action_type user_action_type NOT NULL,
    action_metadata JSONB,
    page_url TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENT/TRANSACTION EVENTS
CREATE TABLE IF NOT EXISTS payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_transaction_id TEXT,
    stripe_subscription_id TEXT,
    amount_cents INTEGER,
    currency TEXT,
    event_type TEXT,
    event_metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DEVICE/SESSION METADATA
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_info JSONB,
    browser_info JSONB,
    os_info JSONB,
    location_info JSONB,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE
);

-- TRIGGERS & INDEXES (for audit and analytics)
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_plan ON profiles(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_profiles_monthly_reset ON profiles(monthly_reset_date);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_tier_change_history_user ON tier_change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_change_history_user ON profile_change_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_history_user ON user_settings_history(user_id);
CREATE INDEX IF NOT EXISTS idx_slide_edit_history_user ON slide_edit_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_actions_user ON user_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_user ON payment_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- RLS POLICIES (for all new tables)
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE tier_change_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE slide_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own auth events" ON auth_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own profile change history" ON profile_change_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own tier change history" ON tier_change_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own settings history" ON user_settings_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own slide edit history" ON slide_edit_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own actions" ON user_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payment events" ON payment_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);

-- TRIGGERS FOR AUDIT LOGS
-- (Example: On profile update, insert into profile_change_history)
-- You may need to implement these as Supabase Functions or in your backend code for full flexibility.

-- END OF OVERHAUL