-- Migration: Add sharing support to resources
ALTER TABLE resources ADD COLUMN IF NOT EXISTS shared_with TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT ARRAY[]::TEXT[]; 