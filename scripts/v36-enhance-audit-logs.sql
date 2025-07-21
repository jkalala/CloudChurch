-- Migration: Enhance audit_logs table for advanced filtering and analytics
ALTER TABLE resource_audit_log 
  ADD COLUMN IF NOT EXISTS action_type TEXT NOT NULL DEFAULT 'view',
  ADD COLUMN IF NOT EXISTS action_category TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON resource_audit_log (timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_action_type ON resource_audit_log (action_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON resource_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action_category ON resource_audit_log (action_category);

-- Create view for common audit queries
CREATE OR REPLACE VIEW v_audit_summary AS
SELECT 
  date_trunc('day', timestamp) as day,
  action_type,
  action_category,
  COUNT(*) as action_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT resource_id) as resources_affected
FROM resource_audit_log
GROUP BY 1, 2, 3
ORDER BY 1 DESC, 4 DESC;

-- Function to export audit logs with filters
CREATE OR REPLACE FUNCTION export_audit_logs(
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  action_types TEXT[] DEFAULT NULL,
  user_ids TEXT[] DEFAULT NULL,
  categories TEXT[] DEFAULT NULL
) RETURNS TABLE (
  log_timestamp TIMESTAMPTZ,
  log_user_id TEXT,
  log_user_email TEXT,
  log_action_type TEXT,
  log_action_category TEXT,
  log_resource_id UUID,
  log_details TEXT,
  log_metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.timestamp as log_timestamp,
    al.user_id as log_user_id,
    al.user_email as log_user_email,
    al.action_type as log_action_type,
    al.action_category as log_action_category,
    al.resource_id as log_resource_id,
    al.details as log_details,
    al.metadata as log_metadata
  FROM resource_audit_log al
  WHERE (start_date IS NULL OR al.timestamp >= start_date)
    AND (end_date IS NULL OR al.timestamp <= end_date)
    AND (action_types IS NULL OR al.action_type = ANY(action_types))
    AND (user_ids IS NULL OR al.user_id = ANY(user_ids))
    AND (categories IS NULL OR al.action_category = ANY(categories))
  ORDER BY al.timestamp DESC;
END;
$$ LANGUAGE plpgsql; 