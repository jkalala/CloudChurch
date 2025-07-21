-- Migration: Add tags column to resources table for resource tagging
ALTER TABLE resources ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];
-- Optionally, create a GIN index for fast tag search
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING GIN (tags); 