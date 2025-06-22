-- Create presentations table for storing user slide decks
CREATE TABLE IF NOT EXISTS presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slides_data JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  export_formats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_presentations_user_id ON presentations(user_id);
CREATE INDEX IF NOT EXISTS idx_presentations_updated_at ON presentations(updated_at);

-- Enable Row Level Security
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own presentations" ON presentations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentations" ON presentations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations" ON presentations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations" ON presentations
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for slide exports
INSERT INTO storage.buckets (id, name, public) 
VALUES ('slide-exports', 'slide-exports', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own slide exports" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'slide-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own slide exports" ON storage.objects
  FOR SELECT USING (bucket_id = 'slide-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view slide exports" ON storage.objects
  FOR SELECT USING (bucket_id = 'slide-exports');