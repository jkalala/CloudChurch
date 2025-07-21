-- Member Attachments
CREATE TABLE IF NOT EXISTS member_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INT,
  uploaded_by TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_member_attachments_member_id ON member_attachments (member_id);

-- Custom Fields
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  field_type TEXT NOT NULL, -- text, number, select, date, etc.
  options JSONB, -- for select fields
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member Custom Fields
CREATE TABLE IF NOT EXISTS member_custom_fields (
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  PRIMARY KEY (member_id, field_id)
);

-- Member Tags
CREATE TABLE IF NOT EXISTS member_tags (
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  tag TEXT,
  PRIMARY KEY (member_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_member_tags_tag ON member_tags (tag); 