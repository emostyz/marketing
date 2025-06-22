-- Drop existing tables to start fresh
DROP TABLE IF EXISTS "user_profiles" CASCADE;
DROP TABLE IF EXISTS "presentations" CASCADE;
DROP TABLE IF EXISTS "slides" CASCADE;
DROP TABLE IF EXISTS "slide_elements" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;
DROP TABLE IF EXISTS "team_members" CASCADE;

-- User Profiles Table
CREATE TABLE "user_profiles" (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id),
  "email" TEXT UNIQUE NOT-NULL,
  "full_name" TEXT,
  "avatar_url" TEXT,
  "company" TEXT,
  "position" TEXT,
  "subscription_status" TEXT DEFAULT 'free',
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Presentations Table
CREATE TABLE "presentations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES auth.users(id),
  "team_id" UUID,
  "title" TEXT NOT NULL,
  "status" TEXT DEFAULT 'draft',
  "data_context" JSONB, -- For description, industry, target audience, factors, etc.
  "presentation_requirements" JSONB, -- For slide count, style, key points, etc.
  "uploaded_files" JSONB, -- For metadata about uploaded files
  "ai_analysis_results" JSONB, -- For insights, narrative, etc.
  "theme_settings" JSONB, -- For custom theme colors, fonts, etc.
  "slide_data" JSONB, -- To store the array of generated slides
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW(),
  "last_accessed_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Slides Table (for more granular control if needed in the future)
-- This provides a more structured way to store slides than a single JSONB blob.
CREATE TABLE "slides" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "presentation_id" UUID REFERENCES presentations(id) ON DELETE CASCADE,
  "slide_number" INT NOT NULL,
  "title" TEXT,
  "content" JSONB,
  "layout" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Slide Elements Table (for even more granular control)
-- This allows for editing individual charts, text boxes, etc.
CREATE TABLE "slide_elements" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slide_id" UUID REFERENCES slides(id) ON DELETE CASCADE,
  "type" TEXT NOT NULL, -- e.g., 'chart', 'textbox', 'image'
  "content" JSONB NOT NULL, -- The actual data for the element
  "position" JSONB NOT NULL, -- { x, y, width, height }
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);


-- Teams Table
CREATE TABLE "teams" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "owner_id" UUID REFERENCES auth.users(id),
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members Junction Table
CREATE TABLE "team_members" (
  "team_id" UUID REFERENCES teams(id) ON DELETE CASCADE,
  "user_id" UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  "role" TEXT NOT NULL, -- e.g., 'admin', 'editor', 'viewer'
  PRIMARY KEY (team_id, user_id)
);

-- Add foreign key from presentations to teams
ALTER TABLE "presentations" ADD CONSTRAINT "presentations_team_id_fkey"
FOREIGN KEY ("team_id") REFERENCES "teams"("id"); 