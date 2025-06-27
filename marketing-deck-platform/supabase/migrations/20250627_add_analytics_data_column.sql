-- Add analytics_data column to presentations table
-- This column will store usage analytics as JSONB data

ALTER TABLE presentations 
ADD COLUMN IF NOT EXISTS analytics_data JSONB DEFAULT '{
  "timeSpentEditing": 0,
  "slidesCreated": 0,
  "chartsAdded": 0,
  "exportsGenerated": 0
}';

-- Add index for analytics queries
CREATE INDEX IF NOT EXISTS idx_presentations_analytics_data ON presentations USING GIN (analytics_data);

-- Update existing rows to have the default analytics_data structure
UPDATE presentations 
SET analytics_data = '{
  "timeSpentEditing": 0,
  "slidesCreated": 0,
  "chartsAdded": 0,
  "exportsGenerated": 0
}'
WHERE analytics_data IS NULL;