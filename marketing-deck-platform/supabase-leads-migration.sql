-- Comprehensive Leads and Pricing System Migration
-- This migration adds lead capture, pricing tiers, and subscription management

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pricing_tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    stripe_price_id VARCHAR(255) UNIQUE,
    monthly_price DECIMAL(10,2) NOT NULL,
    annual_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    features JSONB,
    limitations JSONB,
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    pricing_tier_id UUID REFERENCES pricing_tiers(id),
    status VARCHAR(50) NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription_usage table for tracking usage
CREATE TABLE IF NOT EXISTS subscription_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    usage_type VARCHAR(100) NOT NULL,
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    reset_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing tiers
INSERT INTO pricing_tiers (name, stripe_price_id, monthly_price, annual_price, description, features, limitations, is_popular) VALUES
(
    'Starter',
    'price_starter_monthly',
    29.00,
    290.00,
    'Perfect for individuals and small teams getting started',
    '["5 presentations per month", "Basic AI insights", "Standard templates", "CSV/Excel upload", "PDF export", "Email support", "Basic analytics", "1 team member"]',
    '["No advanced charts", "No custom branding", "No priority support"]',
    FALSE
),
(
    'Professional',
    'price_professional_monthly',
    99.00,
    990.00,
    'For growing teams and businesses that need more power',
    '["25 presentations per month", "Advanced AI insights", "Premium templates", "All file formats", "PowerPoint export", "Priority support", "Advanced analytics", "5 team members", "Custom branding", "Advanced charts", "Collaboration tools", "API access"]',
    '["No enterprise security", "No dedicated account manager"]',
    TRUE
),
(
    'Enterprise',
    'price_enterprise_monthly',
    299.00,
    2990.00,
    'For large organizations with advanced security needs',
    '["Unlimited presentations", "Custom AI models", "Custom templates", "All integrations", "All export formats", "24/7 phone support", "Advanced analytics", "Unlimited team members", "Custom branding", "Advanced charts", "Real-time collaboration", "API access", "SSO integration", "Dedicated account manager", "Custom training", "SLA guarantee"]',
    '[]',
    FALSE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_user_id ON subscription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_type ON subscription_usage(usage_type);

-- Create RLS policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Leads policies (admin only for viewing, anyone can create)
CREATE POLICY "Leads can be created by anyone" ON leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Leads can be viewed by admins" ON leads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE user_profiles.user_id = auth.uid() 
            AND user_profiles.role = 'admin'
        )
    );

-- Pricing tiers policies (read-only for authenticated users)
CREATE POLICY "Pricing tiers are viewable by authenticated users" ON pricing_tiers
    FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Subscriptions policies (users can only see their own)
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
    FOR UPDATE USING (user_id = auth.uid());

-- Subscription usage policies (users can only see their own)
CREATE POLICY "Users can view their own usage" ON subscription_usage
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage" ON subscription_usage
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own usage" ON subscription_usage
    FOR UPDATE USING (user_id = auth.uid());

-- Create functions for lead management
CREATE OR REPLACE FUNCTION create_lead(
    p_email VARCHAR(255),
    p_name VARCHAR(255) DEFAULT NULL,
    p_company VARCHAR(255) DEFAULT NULL,
    p_source VARCHAR(100) DEFAULT 'homepage'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    lead_id UUID;
BEGIN
    -- Check if lead already exists
    IF EXISTS (SELECT 1 FROM leads WHERE email = p_email) THEN
        RAISE EXCEPTION 'Email already registered';
    END IF;

    -- Create new lead
    INSERT INTO leads (email, name, company, source)
    VALUES (p_email, p_name, p_company, p_source)
    RETURNING id INTO lead_id;

    RETURN lead_id;
END;
$$;

-- Create function to get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(p_user_id UUID)
RETURNS TABLE (
    subscription_id UUID,
    tier_name VARCHAR(100),
    status VARCHAR(50),
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN,
    features JSONB,
    limitations JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        pt.name,
        s.status,
        s.current_period_end,
        s.cancel_at_period_end,
        pt.features,
        pt.limitations
    FROM subscriptions s
    JOIN pricing_tiers pt ON s.pricing_tier_id = pt.id
    WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$;

-- Create function to check if user can create presentation
CREATE OR REPLACE FUNCTION can_create_presentation(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_tier VARCHAR(100);
    usage_count INTEGER;
    usage_limit INTEGER;
BEGIN
    -- Get user's current tier
    SELECT pt.name INTO user_tier
    FROM subscriptions s
    JOIN pricing_tiers pt ON s.pricing_tier_id = pt.id
    WHERE s.user_id = p_user_id
    AND s.status IN ('active', 'trialing')
    ORDER BY s.created_at DESC
    LIMIT 1;

    -- If no subscription, check if they have a free tier
    IF user_tier IS NULL THEN
        -- Allow 1 free presentation per month for non-subscribers
        SELECT COUNT(*) INTO usage_count
        FROM presentations
        WHERE user_id = p_user_id
        AND created_at >= date_trunc('month', CURRENT_DATE);
        
        RETURN usage_count < 1;
    END IF;

    -- For paid tiers, check usage limits
    IF user_tier = 'Starter' THEN
        usage_limit := 5;
    ELSIF user_tier = 'Professional' THEN
        usage_limit := 25;
    ELSIF user_tier = 'Enterprise' THEN
        RETURN TRUE; -- Unlimited
    ELSE
        RETURN FALSE;
    END IF;

    -- Get current month usage
    SELECT COUNT(*) INTO usage_count
    FROM presentations
    WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', CURRENT_DATE);

    RETURN usage_count < usage_limit;
END;
$$;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_tiers_updated_at BEFORE UPDATE ON pricing_tiers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_usage_updated_at BEFORE UPDATE ON subscription_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for analytics
CREATE OR REPLACE VIEW lead_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads,
    COUNT(CASE WHEN source = 'homepage' THEN 1 END) as homepage_leads,
    COUNT(CASE WHEN source = 'pricing' THEN 1 END) as pricing_leads
FROM leads
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

CREATE OR REPLACE VIEW subscription_analytics AS
SELECT 
    pt.name as tier_name,
    COUNT(s.id) as total_subscriptions,
    COUNT(CASE WHEN s.status = 'active' THEN 1 END) as active_subscriptions,
    COUNT(CASE WHEN s.status = 'canceled' THEN 1 END) as canceled_subscriptions,
    AVG(pt.monthly_price) as avg_monthly_revenue
FROM pricing_tiers pt
LEFT JOIN subscriptions s ON pt.id = s.pricing_tier_id
GROUP BY pt.id, pt.name
ORDER BY pt.monthly_price;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON leads TO authenticated;
GRANT ALL ON pricing_tiers TO authenticated;
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON subscription_usage TO authenticated;
GRANT SELECT ON lead_analytics TO authenticated;
GRANT SELECT ON subscription_analytics TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION create_lead TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION can_create_presentation TO authenticated; 