-- Add folder column to data_imports table
ALTER TABLE data_imports ADD COLUMN IF NOT EXISTS folder TEXT;
-- Add index for better performance when querying by folder
CREATE INDEX IF NOT EXISTS idx_data_imports_folder ON data_imports(folder);
-- Update existing records to have a default folder
UPDATE data_imports SET folder = 'Uncategorized' WHERE folder IS NULL;
