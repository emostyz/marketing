-- Admin System Migration for AEDRIN Platform
-- This script adds admin roles and template management capabilities

-- Add admin role column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_role VARCHAR(50) DEFAULT 'user';

-- Create index for user roles
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);

-- Create admin_templates table for managing presentation templates
CREATE TABLE IF NOT EXISTS admin_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  template_type VARCHAR(50) NOT NULL DEFAULT 'presentation',
  slide_structure JSONB NOT NULL DEFAULT '[]',
  design_settings JSONB NOT NULL DEFAULT '{}',
  variables JSONB NOT NULL DEFAULT '[]',
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create template_categories table
CREATE TABLE IF NOT EXISTS template_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_settings table for platform configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  setting_type VARCHAR(50) NOT NULL DEFAULT 'general',
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_activity_log table for admin actions
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  action_details JSONB NOT NULL,
  target_type VARCHAR(50), -- user, template, setting, etc.
  target_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default template categories
INSERT INTO template_categories (name, description, icon, sort_order) VALUES
('Executive', 'Executive presentations and board reports', 'crown', 1),
('Marketing', 'Marketing campaigns and analysis', 'trending-up', 2),
('Sales', 'Sales presentations and proposals', 'target', 3),
('Financial', 'Financial reports and analysis', 'dollar-sign', 4),
('Quarterly', 'Quarterly business reviews', 'calendar', 5),
('Customer', 'Customer insights and analysis', 'users', 6)
ON CONFLICT (name) DO NOTHING;

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description) VALUES
('platform_name', '"AEDRIN"', 'general', 'Platform name displayed to users'),
('max_file_size', '52428800', 'limits', 'Maximum file upload size in bytes (50MB)'),
('max_presentations_free', '5', 'limits', 'Maximum presentations for free tier users'),
('max_presentations_pro', '50', 'limits', 'Maximum presentations for pro tier users'),
('ai_model_default', '"gpt-4"', 'ai', 'Default AI model for analysis'),
('email_notifications', 'true', 'notifications', 'Enable email notifications'),
('maintenance_mode', 'false', 'system', 'Enable maintenance mode'),
('registration_enabled', 'true', 'system', 'Allow new user registrations')
ON CONFLICT (setting_key) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_templates_category ON admin_templates(category);
CREATE INDEX IF NOT EXISTS idx_admin_templates_active ON admin_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_templates_featured ON admin_templates(is_featured);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_admin_user ON admin_activity_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_action_type ON admin_activity_log(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activity_log_created_at ON admin_activity_log(created_at);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_admin_templates_updated_at
  BEFORE UPDATE ON admin_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
  BEFORE UPDATE ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for admin tables

-- Admin templates policies
ALTER TABLE admin_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin templates viewable by authenticated users" ON admin_templates
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin templates manageable by admins only" ON admin_templates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

-- Template categories policies
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Template categories viewable by all" ON template_categories
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Template categories manageable by admins only" ON template_categories
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

-- Admin settings policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin settings manageable by admins only" ON admin_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

-- Admin activity log policies
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin activity log viewable by admins only" ON admin_activity_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

CREATE POLICY "Admin activity log insertable by admins only" ON admin_activity_log
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_role = 'admin'
    )
  );

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = user_id 
    AND profiles.user_role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_activity(
  admin_id UUID,
  action_type VARCHAR,
  action_details JSONB,
  target_type VARCHAR DEFAULT NULL,
  target_id VARCHAR DEFAULT NULL,
  ip_addr INET DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO admin_activity_log (
    admin_user_id,
    action_type,
    action_details,
    target_type,
    target_id,
    ip_address,
    user_agent
  ) VALUES (
    admin_id,
    action_type,
    action_details,
    target_type,
    target_id,
    ip_addr,
    user_agent
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON template_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_settings TO authenticated;
GRANT SELECT, INSERT ON admin_activity_log TO authenticated;

-- Add migration log entry
INSERT INTO migrations_log (migration_name, description) 
VALUES ('admin_system_setup', 'Added admin roles, template management, and admin portal tables')
ON CONFLICT (migration_name) DO NOTHING;