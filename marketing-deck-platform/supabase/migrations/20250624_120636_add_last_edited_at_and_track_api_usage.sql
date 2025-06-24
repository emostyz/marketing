-- Migration: Add last_edited_at column and track_api_usage function
-- Timestamp: 2025-06-24 12:06:36

-- 1. Add last_edited_at column to presentations table if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='presentations' AND column_name='last_edited_at'
    ) THEN
        ALTER TABLE presentations ADD COLUMN last_edited_at TIMESTAMP NULL;
    END IF;
END$$;

-- 2. Create or replace the track_api_usage function
CREATE OR REPLACE FUNCTION public.track_api_usage(
    user_uuid UUID,
    endpoint_path TEXT,
    request_method TEXT,
    tokens_consumed INTEGER DEFAULT 0,
    cost NUMERIC DEFAULT 0
)
RETURNS void AS $$
BEGIN
    -- You can implement actual tracking logic here, e.g., insert into an api_usage table
    -- For now, just a stub
    RETURN;
END;
$$ LANGUAGE plpgsql; 