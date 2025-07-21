-- Create resource versions table for version history tracking
CREATE TABLE IF NOT EXISTS public.resource_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL,
  comment TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}'::TEXT[]
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_resource_versions_resource_id ON public.resource_versions(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_versions_resource_type ON public.resource_versions(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_versions_version_number ON public.resource_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_resource_versions_created_by ON public.resource_versions(created_by);
CREATE INDEX IF NOT EXISTS idx_resource_versions_created_at ON public.resource_versions(created_at);
CREATE INDEX IF NOT EXISTS idx_resource_versions_tags ON public.resource_versions USING GIN(tags);

-- Add unique constraint for resource_id, resource_type, and version_number
ALTER TABLE public.resource_versions 
ADD CONSTRAINT unique_resource_version 
UNIQUE (resource_id, resource_type, version_number);

-- Add RLS policies
ALTER TABLE public.resource_versions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view resource versions
CREATE POLICY "Allow users to view resource versions"
  ON public.resource_versions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create resource versions
CREATE POLICY "Allow users to create resource versions"
  ON public.resource_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own resource versions (for tagging)
CREATE POLICY "Allow users to update their own resource versions"
  ON public.resource_versions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create resource_version_access table to control access to versions
CREATE TABLE IF NOT EXISTS public.resource_version_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  access_level TEXT NOT NULL DEFAULT 'read', -- 'read', 'write', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(resource_id, resource_type, user_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_resource_version_access_resource_id ON public.resource_version_access(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_version_access_resource_type ON public.resource_version_access(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_version_access_user_id ON public.resource_version_access(user_id);

-- Add RLS policies
ALTER TABLE public.resource_version_access ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view resource version access
CREATE POLICY "Allow users to view resource version access"
  ON public.resource_version_access
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow authenticated users to insert resource version access
CREATE POLICY "Allow users to insert resource version access"
  ON public.resource_version_access
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own resource version access
CREATE POLICY "Allow users to update their own resource version access"
  ON public.resource_version_access
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_resource_version_access_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update timestamp on resource version access update
DROP TRIGGER IF EXISTS update_resource_version_access_timestamp_trigger ON public.resource_version_access;
CREATE TRIGGER update_resource_version_access_timestamp_trigger
BEFORE UPDATE ON public.resource_version_access
FOR EACH ROW
EXECUTE FUNCTION update_resource_version_access_timestamp();