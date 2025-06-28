-- Create the missing track_user_activity function
CREATE OR REPLACE FUNCTION public.track_user_activity(
  activity_type TEXT,
  metadata JSONB DEFAULT '{}',
  user_uuid UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert activity tracking record
  INSERT INTO public.user_activity_logs (
    user_id,
    activity_type,
    metadata,
    created_at
  ) VALUES (
    COALESCE(user_uuid, auth.uid()),
    activity_type,
    metadata,
    NOW()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the request
    RAISE WARNING 'Failed to track user activity: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user_activity_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.track_user_activity TO authenticated;
GRANT INSERT ON TABLE public.user_activity_logs TO authenticated;
GRANT USAGE ON SEQUENCE public.user_activity_logs_id_seq TO authenticated;