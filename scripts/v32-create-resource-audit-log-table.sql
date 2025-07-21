-- Migration: Create resource_audit_log table for document actions
CREATE TABLE IF NOT EXISTS resource_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID,
  action TEXT,
  user_id TEXT,
  user_email TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details TEXT
);

CREATE INDEX IF NOT EXISTS idx_resource_audit_log_resource_id ON resource_audit_log (resource_id); 