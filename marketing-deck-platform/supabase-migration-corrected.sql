-- AEDRIN Complete System Migration - CORRECTED VERSION
-- Created: 2024-12-22
-- Description: Complete database schema for persistent storage, user context, and analytics
-- FIXED: Removed last_edited_at column and corrected all column naming

-- PRESENTATIONS/DECKS TABLE
CREATE TABLE IF NOT EXISTS presentations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    slides JSONB NOT NULL DEFAULT '[]', -- Array of slide objects
    status TEXT DEFAULT 'draft', -- draft, in_progress, completed, archived
    template_id TEXT,
    data_sources JSONB DEFAULT '[]', -- Array of data source references
    narrative_config JSONB DEFAULT '{}', -- tone, audience, keyMessages, callToAction
    ai_feedback JSONB DEFAULT '{}', -- suggestions, improvements, confidence
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- CSV/DATA FILES TABLE
CREATE TABLE IF NOT EXISTS data_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    description TEXT NOT NULL, -- Required 2+ sentence description
    column_info JSONB, -- Column names and types
    row_count INTEGER,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- USER CONTEXT/PREFERENCES TABLE (from comprehensive signup)
CREATE TABLE IF NOT EXISTS user_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    context_type TEXT NOT NULL, -- 'presentation_style', 'industry', 'primary_goal', etc.
    context_key TEXT NOT NULL,
    context_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, context_type, context_key)
);

-- AUTO-SAVE TRACKING (every 10 seconds)
CREATE TABLE IF NOT EXISTS presentation_autosaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
    content JSONB NOT NULL, -- Full presentation content snapshot
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- USAGE TRACKING TABLE (for dashboard statistics)
CREATE TABLE IF NOT EXISTS usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- Format: "2024-12"
    presentations_created INTEGER DEFAULT 0,
    data_uploads INTEGER DEFAULT 0,
    exports_generated INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

-- USER FEEDBACK TABLE (for full feedback loop)
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL, -- 'bug', 'feature_request', 'general', 'rating', 'dashboard_experience'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    subject TEXT,
    message TEXT NOT NULL,
    page_url TEXT,
    browser_info JSONB,
    status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- DATA ANALYSIS CACHE (for AI insights performance)
CREATE TABLE IF NOT EXISTS data_analysis_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_file_id UUID NOT NULL REFERENCES data_files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL, -- 'summary', 'insights', 'charts', etc.
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- STORAGE BUCKET FOR CSV FILES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('csv-files', 'csv-files', false)
ON CONFLICT (id) DO NOTHING;

-- STORAGE POLICIES
CREATE POLICY "Users can upload their own CSV files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'csv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own CSV files" ON storage.objects
    FOR SELECT USING (bucket_id = 'csv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own CSV files" ON storage.objects
    FOR DELETE USING (bucket_id = 'csv-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_status ON presentations(status);
CREATE INDEX IF NOT EXISTS idx_presentations_updated ON presentations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_presentations_created ON presentations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_files_user_id ON data_files(user_id);
CREATE INDEX IF NOT EXISTS idx_data_files_upload_date ON data_files(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_data_files_filename ON data_files(original_filename);

CREATE INDEX IF NOT EXISTS idx_user_context_user_type ON user_context(user_id, context_type);
CREATE INDEX IF NOT EXISTS idx_user_context_key ON user_context(context_type, context_key);

CREATE INDEX IF NOT EXISTS idx_presentation_autosaves_presentation ON presentation_autosaves(presentation_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_presentation_autosaves_user ON presentation_autosaves(user_id, saved_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month ON usage_tracking(month_year);

CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(feedback_type);

CREATE INDEX IF NOT EXISTS idx_data_analysis_cache_file ON data_analysis_cache(data_file_id);
CREATE INDEX IF NOT EXISTS idx_data_analysis_cache_expires ON data_analysis_cache(expires_at);

-- ROW LEVEL SECURITY
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_autosaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_analysis_cache ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
CREATE POLICY "Users can manage own presentations" ON presentations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data files" ON data_files
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own context" ON user_context
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own autosaves" ON presentation_autosaves
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own usage tracking" ON usage_tracking
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own feedback" ON user_feedback
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analysis cache" ON data_analysis_cache
    FOR ALL USING (auth.uid() = user_id);

-- UTILITY FUNCTIONS
CREATE OR REPLACE FUNCTION cleanup_old_autosaves()
RETURNS void AS $$
BEGIN
    -- Keep only the latest 10 autosaves per presentation
    DELETE FROM presentation_autosaves
    WHERE id NOT IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (
                PARTITION BY presentation_id 
                ORDER BY saved_at DESC
            ) as rn
            FROM presentation_autosaves
        ) ranked
        WHERE rn <= 10
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update presentation's updated timestamp
CREATE OR REPLACE FUNCTION update_presentation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE presentations 
    SET updated_at = NOW()
    WHERE id = NEW.presentation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired analysis cache
CREATE OR REPLACE FUNCTION cleanup_expired_analysis_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM data_analysis_cache
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage tracking
CREATE OR REPLACE FUNCTION increment_usage_tracking(
    p_user_id UUID,
    p_type TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS void AS $$
DECLARE
    current_month TEXT;
    field_name TEXT;
BEGIN
    current_month := TO_CHAR(NOW(), 'YYYY-MM');
    
    field_name := CASE p_type
        WHEN 'presentations' THEN 'presentations_created'
        WHEN 'data_uploads' THEN 'data_uploads'
        WHEN 'exports' THEN 'exports_generated'
        ELSE 'presentations_created'
    END;
    
    EXECUTE format('
        INSERT INTO usage_tracking (user_id, month_year, %I, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, month_year)
        DO UPDATE SET 
            %I = usage_tracking.%I + $3,
            updated_at = NOW()
    ', field_name, field_name, field_name)
    USING p_user_id, current_month, p_increment;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER trigger_update_presentation_timestamp
    AFTER INSERT ON presentation_autosaves
    FOR EACH ROW
    EXECUTE FUNCTION update_presentation_timestamp();

-- Add columns to profiles table for comprehensive signup data
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
        ALTER TABLE profiles ADD COLUMN company_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'job_title') THEN
        ALTER TABLE profiles ADD COLUMN job_title TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'industry') THEN
        ALTER TABLE profiles ADD COLUMN industry TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'primary_goal') THEN
        ALTER TABLE profiles ADD COLUMN primary_goal TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'presentation_frequency') THEN
        ALTER TABLE profiles ADD COLUMN presentation_frequency TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'target_audience') THEN
        ALTER TABLE profiles ADD COLUMN target_audience TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'business_challenges') THEN
        ALTER TABLE profiles ADD COLUMN business_challenges TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'data_types') THEN
        ALTER TABLE profiles ADD COLUMN data_types TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'presentation_style') THEN
        ALTER TABLE profiles ADD COLUMN presentation_style TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'current_tools') THEN
        ALTER TABLE profiles ADD COLUMN current_tools TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'key_metrics') THEN
        ALTER TABLE profiles ADD COLUMN key_metrics TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_login_at') THEN
        ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- COMMENTS FOR DOCUMENTATION
COMMENT ON TABLE presentations IS 'User presentations/decks with 10-second auto-save support';
COMMENT ON TABLE data_files IS 'Uploaded CSV/data files with mandatory 2+ sentence descriptions';
COMMENT ON TABLE user_context IS 'User preferences and context from comprehensive signup form';
COMMENT ON TABLE presentation_autosaves IS 'Auto-save snapshots for presentations (every 10 seconds)';
COMMENT ON TABLE usage_tracking IS 'Monthly usage statistics for dashboard analytics';
COMMENT ON TABLE user_feedback IS 'User feedback and support requests for continuous improvement';
COMMENT ON TABLE data_analysis_cache IS 'Cached AI analysis results for performance optimization';