-- Migration: Create resource_versions table for document versioning
CREATE TABLE IF NOT EXISTS resource_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID,
  file_url TEXT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  version_number INT,
  change_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_resource_versions_resource_id ON resource_versions (resource_id); 