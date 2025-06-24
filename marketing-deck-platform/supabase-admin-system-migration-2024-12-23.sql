-- Admin System Migration for Platform Management
-- Created: 2024-12-23
-- Purpose: Create missing admin tables for full platform functionality

-- =============================================================================
-- 1. PLATFORM SETTINGS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_type TEXT NOT NULL DEFAULT 'string',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_by TEXT
);

-- Insert default platform settings
INSERT INTO platform_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
('general.site_name', '"AEDRIN"', 'string', 'general', 'Platform name displayed across the site', true),
('general.site_description', '"AI-Powered Presentation Platform"', 'string', 'general', 'Site description for SEO and marketing', true),
('general.logo_url', '"/logo.png"', 'string', 'general', 'Main logo image URL', true),
('general.favicon_url', '"/favicon.ico"', 'string', 'general', 'Favicon image URL', true),
('appearance.primary_color', '"#3B82F6"', 'string', 'appearance', 'Primary brand color', true),
('appearance.secondary_color', '"#10B981"', 'string', 'appearance', 'Secondary brand color', true),
('appearance.dark_mode_enabled', 'true', 'boolean', 'appearance', 'Enable dark mode support', true),
('features.file_upload_enabled', 'true', 'boolean', 'features', 'Allow users to upload files', false),
('features.ai_analysis_enabled', 'true', 'boolean', 'features', 'Enable AI-powered analysis', false),
('features.collaboration_enabled', 'true', 'boolean', 'features', 'Enable real-time collaboration', false),
('features.export_formats', '["pptx", "pdf", "png"]', 'array', 'features', 'Available export formats', false),
('limits.max_file_size_mb', '50', 'number', 'limits', 'Maximum file upload size in MB', false),
('limits.max_presentations_per_user', '100', 'number', 'limits', 'Maximum presentations per user', false),
('limits.max_collaborators_per_presentation', '10', 'number', 'limits', 'Maximum collaborators per presentation', false),
('api.openai_api_key', '""', 'secret', 'api', 'OpenAI API key for AI features', false),
('api.openai_model', '"gpt-4"', 'string', 'api', 'OpenAI model to use', false),
('api.stripe_publishable_key', '""', 'string', 'api', 'Stripe publishable key', false),
('api.stripe_secret_key', '""', 'secret', 'api', 'Stripe secret key', false),
('email.smtp_host', '""', 'string', 'email', 'SMTP server host', false),
('email.smtp_port', '587', 'number', 'email', 'SMTP server port', false),
('email.smtp_username', '""', 'string', 'email', 'SMTP username', false),
('email.smtp_password', '""', 'secret', 'email', 'SMTP password', false),
('email.from_email', '"noreply@aedrin.com"', 'string', 'email', 'Default from email address', false),
('email.from_name', '"AEDRIN Platform"', 'string', 'email', 'Default from name', false)
ON CONFLICT (setting_key) DO UPDATE SET
  setting_value = EXCLUDED.setting_value,
  updated_at = NOW();

-- =============================================================================
-- 2. ADMIN ACTIVITY LOG TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action ON admin_activity_log(action);

-- =============================================================================
-- 3. ADMIN TEMPLATES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'business',
  template_type TEXT NOT NULL DEFAULT 'presentation',
  slide_structure JSONB NOT NULL DEFAULT '[]',
  design_settings JSONB NOT NULL DEFAULT '{}',
  preview_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert default admin templates
INSERT INTO admin_templates (name, description, category, slide_structure, design_settings, tags) VALUES
('Executive Summary', 'Professional executive summary template with key metrics and insights', 'business', '[
  {"type": "title", "title": "Executive Summary", "subtitle": "{{company_name}} - {{period}}"},
  {"type": "overview", "title": "Key Highlights", "layout": "bullet_points"},
  {"type": "metrics", "title": "Key Performance Indicators", "layout": "metrics_grid"},
  {"type": "charts", "title": "Performance Trends", "layout": "chart_focus"},
  {"type": "insights", "title": "Strategic Insights", "layout": "text_focus"},
  {"type": "recommendations", "title": "Next Steps", "layout": "action_items"}
]', '{"primary_color": "#1f2937", "secondary_color": "#3b82f6", "font_family": "Inter", "layout_style": "professional"}', '{"executive", "summary", "business", "professional"}'),

('Sales Presentation', 'Comprehensive sales presentation template for client meetings', 'sales', '[
  {"type": "title", "title": "Sales Presentation", "subtitle": "{{client_name}} - {{date}}"},
  {"type": "agenda", "title": "Meeting Agenda", "layout": "timeline"},
  {"type": "problem", "title": "Challenge Overview", "layout": "problem_solution"},
  {"type": "solution", "title": "Our Solution", "layout": "feature_benefits"},
  {"type": "demo", "title": "Product Demo", "layout": "visual_showcase"},
  {"type": "pricing", "title": "Investment Options", "layout": "pricing_table"},
  {"type": "next_steps", "title": "Next Steps", "layout": "action_timeline"}
]', '{"primary_color": "#059669", "secondary_color": "#0d9488", "font_family": "Inter", "layout_style": "modern"}', '{"sales", "presentation", "client", "demo"}'),

('Marketing Report', 'Detailed marketing performance and campaign analysis template', 'marketing', '[
  {"type": "title", "title": "Marketing Report", "subtitle": "{{campaign_name}} - {{period}}"},
  {"type": "summary", "title": "Campaign Overview", "layout": "summary_cards"},
  {"type": "metrics", "title": "Performance Metrics", "layout": "kpi_dashboard"},
  {"type": "analysis", "title": "Channel Analysis", "layout": "comparison_charts"},
  {"type": "audience", "title": "Audience Insights", "layout": "demographic_breakdown"},
  {"type": "roi", "title": "ROI Analysis", "layout": "financial_impact"},
  {"type": "recommendations", "title": "Optimization Opportunities", "layout": "recommendation_grid"}
]', '{"primary_color": "#7c3aed", "secondary_color": "#a855f7", "font_family": "Inter", "layout_style": "creative"}', '{"marketing", "campaign", "analysis", "performance"}'),

('Financial Analysis', 'Financial performance and analysis presentation template', 'finance', '[
  {"type": "title", "title": "Financial Analysis", "subtitle": "{{company_name}} - {{fiscal_period}}"},
  {"type": "summary", "title": "Financial Summary", "layout": "financial_overview"},
  {"type": "revenue", "title": "Revenue Analysis", "layout": "revenue_breakdown"},
  {"type": "expenses", "title": "Cost Analysis", "layout": "expense_categories"},
  {"type": "profitability", "title": "Profitability Metrics", "layout": "profit_analysis"},
  {"type": "trends", "title": "Financial Trends", "layout": "trend_analysis"},
  {"type": "forecast", "title": "Financial Forecast", "layout": "projection_charts"}
]', '{"primary_color": "#dc2626", "secondary_color": "#ea580c", "font_family": "Inter", "layout_style": "corporate"}', '{"finance", "financial", "analysis", "revenue"}'),

('Product Roadmap', 'Product strategy and roadmap presentation template', 'product', '[
  {"type": "title", "title": "Product Roadmap", "subtitle": "{{product_name}} - {{year}}"},
  {"type": "vision", "title": "Product Vision", "layout": "vision_statement"},
  {"type": "current_state", "title": "Current State", "layout": "status_overview"},
  {"type": "roadmap", "title": "Development Roadmap", "layout": "timeline_roadmap"},
  {"type": "features", "title": "Key Features", "layout": "feature_showcase"},
  {"type": "milestones", "title": "Major Milestones", "layout": "milestone_timeline"},
  {"type": "resources", "title": "Resource Requirements", "layout": "resource_allocation"}
]', '{"primary_color": "#0891b2", "secondary_color": "#0284c7", "font_family": "Inter", "layout_style": "modern"}', '{"product", "roadmap", "strategy", "development"}')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  slide_structure = EXCLUDED.slide_structure,
  design_settings = EXCLUDED.design_settings,
  updated_at = NOW();

-- =============================================================================
-- 4. USER INVITATIONS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  invited_by TEXT NOT NULL,
  invitation_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);

-- =============================================================================
-- 5. USER EVENTS TABLE (for analytics)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_events_user_id ON user_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_user_events_created_at ON user_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON user_events(session_id);

-- =============================================================================
-- 6. DATASETS TABLE (for data uploads analytics)
-- =============================================================================
CREATE TABLE IF NOT EXISTS datasets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  upload_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_datasets_user_id ON datasets(user_id);
CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status);
CREATE INDEX IF NOT EXISTS idx_datasets_created_at ON datasets(created_at);

-- =============================================================================
-- 7. UPDATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at columns
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_templates_updated_at BEFORE UPDATE ON admin_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on admin tables
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (using service role)
-- Platform settings - admin only
CREATE POLICY "Platform settings admin access" ON platform_settings
  FOR ALL USING (true);

-- Admin activity log - admin only
CREATE POLICY "Admin activity log admin access" ON admin_activity_log
  FOR ALL USING (true);

-- Admin templates - admin management, public read for active templates
CREATE POLICY "Admin templates admin access" ON admin_templates
  FOR ALL USING (true);

CREATE POLICY "Admin templates public read" ON admin_templates
  FOR SELECT USING (is_active = true AND is_public = true);

-- User invitations - admin only
CREATE POLICY "User invitations admin access" ON user_invitations
  FOR ALL USING (true);

-- User events - read/write for authenticated users
CREATE POLICY "User events user access" ON user_events
  FOR ALL USING (true);

-- Datasets - users can access their own data
CREATE POLICY "Datasets user access" ON datasets
  FOR ALL USING (true);

-- =============================================================================
-- 9. VIEWS FOR COMMON QUERIES
-- =============================================================================

-- Platform statistics view
CREATE OR REPLACE VIEW platform_statistics AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM presentations) as total_presentations,
  (SELECT COUNT(*) FROM datasets) as total_uploads,
  (SELECT COUNT(*) FROM presentations WHERE status = 'completed') as completed_presentations,
  (SELECT COUNT(DISTINCT user_id) FROM user_events WHERE created_at >= NOW() - INTERVAL '30 days') as active_users_30d,
  (SELECT COUNT(DISTINCT user_id) FROM user_events WHERE created_at >= NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(*) FROM admin_templates WHERE is_active = true) as active_templates;

-- Recent activity view
CREATE OR REPLACE VIEW recent_platform_activity AS
SELECT 
  'user_event' as activity_type,
  user_id,
  event_type as action,
  event_data as details,
  created_at
FROM user_events
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
  'admin_action' as activity_type,
  admin_id as user_id,
  action,
  details,
  created_at
FROM admin_activity_log
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Insert initial admin activity log entry
INSERT INTO admin_activity_log (admin_id, action, resource_type, details) VALUES
('system', 'admin_system_migration_completed', 'database', '{"migration_date": "2024-12-23", "tables_created": ["platform_settings", "admin_activity_log", "admin_templates", "user_invitations", "user_events", "datasets"], "version": "1.0"}');

COMMIT;