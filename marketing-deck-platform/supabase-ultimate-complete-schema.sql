-- ULTIMATE COMPLETE DATABASE SCHEMA FOR AEDRIN PLATFORM
-- This captures EVERYTHING: every user action, every data point, every interaction
-- Run this in Supabase SQL editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create migrations_log table first
CREATE TABLE IF NOT EXISTS migrations_log (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

-- User profiles table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),
  job_title VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  phone VARCHAR(50),
  website VARCHAR(255),
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  currency VARCHAR(3) DEFAULT 'USD',
  brand_colors JSONB,
  brand_logo_url TEXT,
  preferences JSONB,
  settings JSONB,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  usage_quota JSONB,
  usage_current JSONB,
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_demo_user BOOLEAN DEFAULT FALSE,
  demo_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data files table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS data_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size BIGINT,
  file_url TEXT,
  file_path TEXT,
  mime_type VARCHAR(100),
  encoding VARCHAR(50),
  data_content JSONB,
  data_columns JSONB,
  data_rows JSONB,
  row_count INTEGER,
  column_count INTEGER,
  data_summary JSONB,
  data_analysis JSONB,
  data_quality_score DECIMAL(3,2),
  data_validation_results JSONB,
  processing_status VARCHAR(50) DEFAULT 'uploaded',
  processing_errors JSONB,
  is_processed BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Presentations/Decks table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID,
  template_name VARCHAR(255),
  theme_id UUID,
  theme_name VARCHAR(255),
  theme_colors JSONB,
  theme_fonts JSONB,
  slide_count INTEGER DEFAULT 0,
  presentation_data JSONB,
  slides JSONB,
  slide_order JSONB,
  slide_templates JSONB,
  slide_content JSONB,
  slide_metadata JSONB,
  slide_analytics JSONB,
  presentation_settings JSONB,
  export_settings JSONB,
  collaboration_settings JSONB,
  sharing_settings JSONB,
  access_level VARCHAR(50) DEFAULT 'private',
  is_public BOOLEAN DEFAULT FALSE,
  is_template BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_draft BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  parent_version_id UUID,
  tags TEXT[],
  categories TEXT[],
  keywords TEXT[],
  target_audience VARCHAR(255),
  presentation_duration INTEGER,
  estimated_reading_time INTEGER,
  complexity_score DECIMAL(3,2),
  quality_score DECIMAL(3,2),
  engagement_score DECIMAL(3,2),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  last_edited_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Slides table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  slide_number INTEGER,
  slide_type VARCHAR(100),
  slide_template VARCHAR(100),
  title VARCHAR(255),
  subtitle VARCHAR(255),
  content JSONB,
  text_content TEXT,
  chart_data JSONB,
  chart_config JSONB,
  chart_type VARCHAR(100),
  image_data JSONB,
  image_urls TEXT[],
  layout_data JSONB,
  styling_data JSONB,
  animation_data JSONB,
  transition_data JSONB,
  notes TEXT,
  speaker_notes TEXT,
  metadata JSONB,
  analytics JSONB,
  is_hidden BOOLEAN DEFAULT FALSE,
  is_master_slide BOOLEAN DEFAULT FALSE,
  master_slide_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Templates table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  industry VARCHAR(100),
  use_case VARCHAR(255),
  template_type VARCHAR(50),
  template_data JSONB,
  slide_templates JSONB,
  theme_data JSONB,
  color_scheme JSONB,
  font_scheme JSONB,
  layout_scheme JSONB,
  preview_image_url TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  download_count INTEGER DEFAULT 0,
  use_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  review_count INTEGER DEFAULT 0,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Themes table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  theme_type VARCHAR(50),
  color_palette JSONB,
  font_family JSONB,
  typography JSONB,
  spacing JSONB,
  layout JSONB,
  background JSONB,
  accent_colors JSONB,
  preview_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  use_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2),
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  refresh_token VARCHAR(255),
  device_info JSONB,
  browser_info JSONB,
  os_info JSONB,
  ip_address INET,
  location_data JSONB,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_demo_session BOOLEAN DEFAULT FALSE,
  login_method VARCHAR(50),
  login_provider VARCHAR(50),
  session_data JSONB,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User activity log (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  activity_type VARCHAR(100) NOT NULL,
  activity_category VARCHAR(100),
  activity_subcategory VARCHAR(100),
  action VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id UUID,
  resource_name VARCHAR(255),
  page_url TEXT,
  page_title VARCHAR(255),
  referrer_url TEXT,
  user_agent TEXT,
  ip_address INET,
  location_data JSONB,
  device_info JSONB,
  browser_info JSONB,
  os_info JSONB,
  screen_resolution VARCHAR(50),
  viewport_size VARCHAR(50),
  interaction_data JSONB,
  form_data JSONB,
  input_data JSONB,
  output_data JSONB,
  error_data JSONB,
  performance_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Page views table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  page_type VARCHAR(100),
  page_category VARCHAR(100),
  referrer_url TEXT,
  referrer_domain VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  location_data JSONB,
  device_info JSONB,
  browser_info JSONB,
  os_info JSONB,
  screen_resolution VARCHAR(50),
  viewport_size VARCHAR(50),
  time_on_page INTEGER,
  scroll_depth INTEGER,
  interaction_count INTEGER DEFAULT 0,
  bounce_rate BOOLEAN DEFAULT FALSE,
  exit_page BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User interactions table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  page_view_id UUID REFERENCES page_views(id) ON DELETE CASCADE,
  interaction_type VARCHAR(100) NOT NULL,
  interaction_category VARCHAR(100),
  element_type VARCHAR(100),
  element_id VARCHAR(255),
  element_class VARCHAR(255),
  element_text TEXT,
  element_value TEXT,
  element_attributes JSONB,
  click_coordinates JSONB,
  scroll_position JSONB,
  form_data JSONB,
  input_data JSONB,
  output_data JSONB,
  error_data JSONB,
  success_data JSONB,
  interaction_duration INTEGER,
  interaction_sequence INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Lead capture table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  lead_source VARCHAR(100),
  lead_medium VARCHAR(100),
  lead_campaign VARCHAR(100),
  lead_term VARCHAR(100),
  lead_content VARCHAR(100),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  job_title VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  website VARCHAR(255),
  linkedin_url VARCHAR(255),
  twitter_url VARCHAR(255),
  message TEXT,
  interests TEXT[],
  pain_points TEXT[],
  budget_range VARCHAR(50),
  timeline VARCHAR(50),
  lead_score INTEGER DEFAULT 0,
  lead_status VARCHAR(50) DEFAULT 'new',
  lead_stage VARCHAR(50) DEFAULT 'prospect',
  is_qualified BOOLEAN DEFAULT FALSE,
  is_converted BOOLEAN DEFAULT FALSE,
  conversion_date TIMESTAMP WITH TIME ZONE,
  conversion_value DECIMAL(10,2),
  assigned_to UUID,
  notes TEXT,
  tags TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscription and billing table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  stripe_product_id VARCHAR(255),
  subscription_tier VARCHAR(50),
  subscription_status VARCHAR(50),
  billing_cycle VARCHAR(50),
  billing_interval VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'USD',
  amount DECIMAL(10,2),
  amount_decimal INTEGER,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  payment_method_id VARCHAR(255),
  payment_method_type VARCHAR(50),
  payment_method_details JSONB,
  invoice_settings JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payment transactions table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  stripe_invoice_id VARCHAR(255),
  transaction_type VARCHAR(50),
  transaction_status VARCHAR(50),
  amount DECIMAL(10,2),
  amount_decimal INTEGER,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method_id VARCHAR(255),
  payment_method_type VARCHAR(50),
  payment_method_details JSONB,
  billing_details JSONB,
  receipt_url TEXT,
  failure_reason TEXT,
  failure_code VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Usage tracking table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  usage_type VARCHAR(100),
  usage_category VARCHAR(100),
  usage_subcategory VARCHAR(100),
  usage_metric VARCHAR(100),
  usage_value INTEGER,
  usage_limit INTEGER,
  usage_percentage DECIMAL(5,2),
  billing_period_start TIMESTAMP WITH TIME ZONE,
  billing_period_end TIMESTAMP WITH TIME ZONE,
  resource_id UUID,
  resource_type VARCHAR(100),
  resource_name VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_category VARCHAR(100),
  event_action VARCHAR(100),
  event_label VARCHAR(255),
  event_value INTEGER,
  event_properties JSONB,
  event_context JSONB,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  page_url TEXT,
  page_title VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  location_data JSONB,
  device_info JSONB,
  browser_info JSONB,
  os_info JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Error logging table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE CASCADE,
  error_type VARCHAR(100),
  error_category VARCHAR(100),
  error_code VARCHAR(100),
  error_message TEXT,
  error_stack TEXT,
  error_context JSONB,
  error_metadata JSONB,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  device_info JSONB,
  browser_info JSONB,
  os_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collaboration and sharing table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_name VARCHAR(255),
  session_type VARCHAR(50),
  session_status VARCHAR(50) DEFAULT 'active',
  access_level VARCHAR(50) DEFAULT 'view',
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(255),
  share_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  session_data JSONB,
  collaboration_data JSONB,
  chat_data JSONB,
  comments_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Collaboration participants table
CREATE TABLE IF NOT EXISTS collaboration_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant_type VARCHAR(50),
  access_level VARCHAR(50),
  permissions JSONB,
  join_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  leave_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

-- Export history table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS export_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  export_type VARCHAR(50),
  export_format VARCHAR(50),
  export_quality VARCHAR(50),
  export_settings JSONB,
  file_name VARCHAR(255),
  file_size BIGINT,
  file_url TEXT,
  download_url TEXT,
  export_status VARCHAR(50) DEFAULT 'processing',
  processing_time INTEGER,
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI analysis history table (COMPREHENSIVE)
CREATE TABLE IF NOT EXISTS ai_analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  data_file_id UUID REFERENCES data_files(id) ON DELETE CASCADE,
  presentation_id UUID REFERENCES presentations(id) ON DELETE CASCADE,
  analysis_type VARCHAR(100),
  analysis_category VARCHAR(100),
  analysis_subcategory VARCHAR(100),
  input_data JSONB,
  output_data JSONB,
  analysis_results JSONB,
  insights JSONB,
  recommendations JSONB,
  charts_generated JSONB,
  slides_generated JSONB,
  processing_time INTEGER,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  model_used VARCHAR(100),
  model_version VARCHAR(50),
  analysis_status VARCHAR(50) DEFAULT 'processing',
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_data_files_user_id ON data_files(user_id);
CREATE INDEX IF NOT EXISTS idx_data_files_processing_status ON data_files(processing_status);
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_template_id ON presentations(template_id);
CREATE INDEX IF NOT EXISTS idx_slides_presentation_id ON slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_page_views_user_id ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_interaction_type ON user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_lead_status ON leads(lead_status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_presentation_id ON collaboration_sessions(presentation_id);
CREATE INDEX IF NOT EXISTS idx_export_history_user_id ON export_history(user_id);
CREATE INDEX IF NOT EXISTS idx_export_history_presentation_id ON export_history(presentation_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_user_id ON ai_analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_history_analysis_type ON ai_analysis_history(analysis_type);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Data files policies
CREATE POLICY "Users can view own data files" ON data_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data files" ON data_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own data files" ON data_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own data files" ON data_files FOR DELETE USING (auth.uid() = user_id);

-- Presentations policies
CREATE POLICY "Users can view own presentations" ON presentations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own presentations" ON presentations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own presentations" ON presentations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own presentations" ON presentations FOR DELETE USING (auth.uid() = user_id);

-- Slides policies
CREATE POLICY "Users can view own slides" ON slides FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own slides" ON slides FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own slides" ON slides FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own slides" ON slides FOR DELETE USING (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "Users can view public templates" ON templates FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own templates" ON templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own templates" ON templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON templates FOR DELETE USING (auth.uid() = user_id);

-- Themes policies
CREATE POLICY "Users can view public themes" ON themes FOR SELECT USING (is_public = true);
CREATE POLICY "Users can view own themes" ON themes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own themes" ON themes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own themes" ON themes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own themes" ON themes FOR DELETE USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (auth.uid() = user_id);

-- Activity log policies
CREATE POLICY "Users can view own activity" ON user_activity_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON user_activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Page views policies
CREATE POLICY "Users can view own page views" ON page_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own page views" ON page_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User interactions policies
CREATE POLICY "Users can view own interactions" ON user_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interactions" ON user_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can view own leads" ON leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON leads FOR UPDATE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Payment transactions policies
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON payment_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Analytics events policies
CREATE POLICY "Users can view own analytics" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Error logs policies
CREATE POLICY "Users can view own errors" ON error_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own errors" ON error_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Collaboration sessions policies
CREATE POLICY "Users can view own collaboration sessions" ON collaboration_sessions FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can insert own collaboration sessions" ON collaboration_sessions FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own collaboration sessions" ON collaboration_sessions FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own collaboration sessions" ON collaboration_sessions FOR DELETE USING (auth.uid() = owner_id);

-- Collaboration participants policies
CREATE POLICY "Users can view collaboration participants" ON collaboration_participants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert collaboration participants" ON collaboration_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update collaboration participants" ON collaboration_participants FOR UPDATE USING (auth.uid() = user_id);

-- Export history policies
CREATE POLICY "Users can view own export history" ON export_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own export history" ON export_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI analysis history policies
CREATE POLICY "Users can view own AI analysis" ON ai_analysis_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own AI analysis" ON ai_analysis_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert migration record
INSERT INTO migrations_log (migration_name, description) 
VALUES ('ultimate_complete_schema', 'Created comprehensive database schema with all tables, indexes, and RLS policies for complete data capture and analytics');

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_data_files_updated_at BEFORE UPDATE ON data_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_presentations_updated_at BEFORE UPDATE ON presentations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_themes_updated_at BEFORE UPDATE ON themes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_collaboration_sessions_updated_at BEFORE UPDATE ON collaboration_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_export_history_updated_at BEFORE UPDATE ON export_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_analysis_history_updated_at BEFORE UPDATE ON ai_analysis_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

COMMENT ON TABLE profiles IS 'Comprehensive user profiles with all metadata and preferences';
COMMENT ON TABLE data_files IS 'All uploaded data files with processing status and analysis';
COMMENT ON TABLE presentations IS 'Complete presentation/deck data with all metadata';
COMMENT ON TABLE slides IS 'Individual slides with content, styling, and analytics';
COMMENT ON TABLE templates IS 'Presentation templates with themes and metadata';
COMMENT ON TABLE themes IS 'Design themes with color palettes and typography';
COMMENT ON TABLE user_sessions IS 'User session tracking with device and location data';
COMMENT ON TABLE user_activity_log IS 'Comprehensive user activity tracking';
COMMENT ON TABLE page_views IS 'Detailed page view analytics';
COMMENT ON TABLE user_interactions IS 'All user interactions and events';
COMMENT ON TABLE leads IS 'Lead capture and CRM data';
COMMENT ON TABLE subscriptions IS 'Subscription and billing management';
COMMENT ON TABLE payment_transactions IS 'Payment transaction history';
COMMENT ON TABLE usage_tracking IS 'Usage quotas and limits tracking';
COMMENT ON TABLE analytics_events IS 'Custom analytics events';
COMMENT ON TABLE error_logs IS 'Error tracking and debugging';
COMMENT ON TABLE collaboration_sessions IS 'Real-time collaboration sessions';
COMMENT ON TABLE collaboration_participants IS 'Collaboration session participants';
COMMENT ON TABLE export_history IS 'Export and download history';
COMMENT ON TABLE ai_analysis_history IS 'AI analysis and generation history'; 