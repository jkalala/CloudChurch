-- Member Audit Log
CREATE TABLE IF NOT EXISTS member_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- add, edit, delete
  user_id TEXT,
  user_email TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB -- stores changed fields/values
);

CREATE INDEX IF NOT EXISTS idx_member_audit_log_member_id ON member_audit_log (member_id);
CREATE INDEX IF NOT EXISTS idx_member_audit_log_timestamp ON member_audit_log (timestamp); 