-- AEDRIN Persistent Data Storage Migration
-- Created: 2024-06-22
-- Description: Tables for persistent decks, CSV files, and user context

-- PRESENTATIONS/DECKS TABLE
CREATE TABLE IF NOT EXISTS presentations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content JSONB NOT NULL DEFAULT '{}',
    template_type TEXT,
    data_source_ids UUID[] DEFAULT '{}',
    status TEXT DEFAULT 'draft', -- draft, completed, archived
    last_edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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

-- USER CONTEXT/PREFERENCES TABLE (expanded)
CREATE TABLE IF NOT EXISTS user_context (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    context_type TEXT NOT NULL, -- 'presentation_style', 'data_preference', 'template_choice', etc.
    context_key TEXT NOT NULL,
    context_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, context_type, context_key)
);

-- PRESENTATION VERSIONS/HISTORY
CREATE TABLE IF NOT EXISTS presentation_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    change_summary TEXT,
    UNIQUE(presentation_id, version_number)
);

-- AUTO-SAVE TRACKING
CREATE TABLE IF NOT EXISTS presentation_autosaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    presentation_id UUID NOT NULL REFERENCES presentations(id) ON DELETE CASCADE,
    content JSONB NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- DATA ANALYSIS CACHE (for AI insights)
CREATE TABLE IF NOT EXISTS data_analysis_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_file_id UUID NOT NULL REFERENCES data_files(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    analysis_type TEXT NOT NULL, -- 'summary', 'insights', 'charts', etc.
    analysis_result JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- USER FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL, -- 'bug', 'feature_request', 'general', 'rating'
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    subject TEXT,
    message TEXT NOT NULL,
    page_url TEXT,
    browser_info JSONB,
    status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES for performance
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_status ON presentations(status);
CREATE INDEX IF NOT EXISTS idx_presentations_last_edited ON presentations(last_edited_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_files_user_id ON data_files(user_id);
CREATE INDEX IF NOT EXISTS idx_data_files_upload_date ON data_files(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_context_user_type ON user_context(user_id, context_type);
CREATE INDEX IF NOT EXISTS idx_presentation_versions_presentation ON presentation_versions(presentation_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_presentation_autosaves_presentation ON presentation_autosaves(presentation_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_analysis_cache_file ON data_analysis_cache(data_file_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON user_feedback(status);

-- RLS POLICIES
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentation_autosaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage own presentations" ON presentations
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data files" ON data_files
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own context" ON user_context
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own presentation versions" ON presentation_versions
    USING (auth.uid() IN (
        SELECT user_id FROM presentations WHERE id = presentation_id
    ));

CREATE POLICY "Users can manage own autosaves" ON presentation_autosaves
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analysis cache" ON data_analysis_cache
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own feedback" ON user_feedback
    USING (auth.uid() = user_id);

-- FUNCTIONS for auto-cleanup
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

-- Function to update presentation's last_edited timestamp
CREATE OR REPLACE FUNCTION update_presentation_last_edited()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE presentations 
    SET last_edited_at = NOW(), updated_at = NOW()
    WHERE id = NEW.presentation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last_edited when autosave happens
CREATE TRIGGER trigger_update_presentation_last_edited
    AFTER INSERT ON presentation_autosaves
    FOR EACH ROW
    EXECUTE FUNCTION update_presentation_last_edited();

-- Function to clean expired analysis cache
CREATE OR REPLACE FUNCTION cleanup_expired_analysis_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM data_analysis_cache
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE presentations IS 'User presentations/decks with auto-save support';
COMMENT ON TABLE data_files IS 'Uploaded CSV/data files with required descriptions';
COMMENT ON TABLE user_context IS 'User preferences and context for personalization';
COMMENT ON TABLE presentation_versions IS 'Version history for presentations';
COMMENT ON TABLE presentation_autosaves IS 'Auto-save data for presentations (every 10s)';
COMMENT ON TABLE data_analysis_cache IS 'Cached AI analysis results for performance';
COMMENT ON TABLE user_feedback IS 'User feedback and support requests';