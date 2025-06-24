-- Admin Platform Settings Migration
-- This migration creates tables and configurations for dynamic platform management

-- Create platform_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'general',
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Create file_management table for tracking dynamic file updates
CREATE TABLE IF NOT EXISTS file_management (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  content TEXT,
  backup_content TEXT,
  last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modified_by UUID REFERENCES profiles(id),
  change_reason TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create api_configurations table for LLM and external service settings
CREATE TABLE IF NOT EXISTS api_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  api_key_encrypted TEXT,
  endpoint_url VARCHAR(500),
  model_name VARCHAR(100),
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Create homepage_content table for dynamic homepage management
CREATE TABLE IF NOT EXISTS homepage_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name VARCHAR(100) NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- 'text', 'html', 'json', 'image'
  content_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, setting_type, description) VALUES
  ('site_name', '"AEDRIN"', 'general', 'Platform name displayed across the site'),
  ('site_tagline', '"Transform Your Data Into Stunning Presentations"', 'general', 'Main site tagline'),
  ('contact_email', '"support@aedrin.com"', 'general', 'Contact email for support'),
  ('features_enabled', '{"ai_analysis": true, "templates": true, "exports": true, "collaboration": true}', 'features', 'Feature flags for platform capabilities'),
  ('max_file_size', '50', 'limits', 'Maximum file upload size in MB'),
  ('max_presentations_per_user', '100', 'limits', 'Maximum presentations per user'),
  ('default_theme', '"professional"', 'ui', 'Default theme for new presentations'),
  ('primary_color', '"#3B82F6"', 'ui', 'Primary brand color'),
  ('secondary_color', '"#8B5CF6"', 'ui', 'Secondary brand color')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default API configurations
INSERT INTO api_configurations (service_name, model_name, configuration, is_active) VALUES
  ('openai', 'gpt-4', '{"temperature": 0.7, "max_tokens": 4000}', true),
  ('anthropic', 'claude-3-sonnet', '{"temperature": 0.7, "max_tokens": 4000}', false),
  ('google', 'gemini-pro', '{"temperature": 0.7, "max_tokens": 4000}', false)
ON CONFLICT DO NOTHING;

-- Insert default homepage content
INSERT INTO homepage_content (section_name, content_type, content_value, display_order) VALUES
  ('hero_title', 'text', 'Transform Your Data Into Stunning Presentations', 1),
  ('hero_subtitle', 'text', 'Create professional marketing presentations in minutes with AI. Upload your data, and watch as AEDRIN generates compelling slides with charts, insights, and narratives.', 2),
  ('feature_1_title', 'text', 'AI-Powered Insights', 10),
  ('feature_1_description', 'text', 'Our AI analyzes your data and automatically generates compelling insights, trends, and recommendations for your presentations.', 11),
  ('feature_2_title', 'text', 'Lightning Fast', 12),
  ('feature_2_description', 'text', 'Create professional presentations in minutes, not hours. Upload your data and get results instantly.', 13),
  ('feature_3_title', 'text', 'Smart Charts', 14),
  ('feature_3_description', 'text', 'Automatically generate the perfect charts and visualizations for your data with intelligent chart selection.', 15),
  ('stats_presentations', 'text', '10,000+', 20),
  ('stats_customers', 'text', '500+', 21),
  ('stats_time_saved', 'text', '95%', 22),
  ('stats_rating', 'text', '4.9/5', 23)
ON CONFLICT DO NOTHING;

-- Create RLS policies for admin-only access
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_content ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admin only access for platform_settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Admin only access for file_management" ON file_management
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Admin only access for api_configurations" ON api_configurations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Admin only access for homepage_content" ON homepage_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_platform_settings_updated_at 
  BEFORE UPDATE ON platform_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_management_updated_at 
  BEFORE UPDATE ON file_management 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_configurations_updated_at 
  BEFORE UPDATE ON api_configurations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_content_updated_at 
  BEFORE UPDATE ON homepage_content 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_type ON platform_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_file_management_path ON file_management(file_path);
CREATE INDEX IF NOT EXISTS idx_api_configurations_service ON api_configurations(service_name);
CREATE INDEX IF NOT EXISTS idx_homepage_content_section ON homepage_content(section_name);

-- Add comments for documentation
COMMENT ON TABLE platform_settings IS 'Dynamic platform configuration settings that can be modified through admin interface';
COMMENT ON TABLE file_management IS 'Tracks dynamic file updates made through admin interface';
COMMENT ON TABLE api_configurations IS 'External API and LLM service configurations';
COMMENT ON TABLE homepage_content IS 'Dynamic homepage content management';