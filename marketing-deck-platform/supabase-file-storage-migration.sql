-- Migration for file storage functionality
-- This adds Supabase Storage bucket and improves data_imports table

-- Create storage bucket for user files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-files', 'user-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policy for user files
CREATE POLICY "Users can upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Update data_imports table structure (if it exists)
-- Add new columns for file storage
ALTER TABLE data_imports ADD COLUMN IF NOT EXISTS file_size INTEGER;
ALTER TABLE data_imports ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE data_imports ADD COLUMN IF NOT EXISTS public_url TEXT;
ALTER TABLE data_imports ADD COLUMN IF NOT EXISTS pptx_structure JSONB;
ALTER TABLE data_imports ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE data_imports ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- If the table doesn't exist, create it
CREATE TABLE IF NOT EXISTS data_imports (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    raw_data JSONB,
    pptx_structure JSONB,
    status TEXT DEFAULT 'pending',
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- Add RLS to data_imports
ALTER TABLE data_imports ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own data imports
CREATE POLICY "Users can manage their own data imports" ON data_imports
FOR ALL TO authenticated
USING (auth.uid()::text = user_id);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_data_imports_user_id ON data_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_data_imports_status ON data_imports(status);
CREATE INDEX IF NOT EXISTS idx_data_imports_uploaded_at ON data_imports(uploaded_at);

COMMENT ON TABLE data_imports IS 'Stores metadata and references to user-uploaded files';
COMMENT ON COLUMN data_imports.storage_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN data_imports.public_url IS 'Public URL for accessing the file';
COMMENT ON COLUMN data_imports.pptx_structure IS 'Parsed structure from PPTX files';