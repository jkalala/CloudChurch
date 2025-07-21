-- Create collaborative documents table
CREATE TABLE IF NOT EXISTS public.collaborative_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document versions table for version history
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES public.collaborative_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version INTEGER NOT NULL,
  comment TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_collaborative_documents_created_by ON public.collaborative_documents(created_by);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_version ON public.document_versions(version);

-- Add RLS policies
ALTER TABLE public.collaborative_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to select documents
CREATE POLICY "Allow users to view collaborative documents"
  ON public.collaborative_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert documents
CREATE POLICY "Allow users to create collaborative documents"
  ON public.collaborative_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow document creators to update their documents
CREATE POLICY "Allow users to update their collaborative documents"
  ON public.collaborative_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = updated_by);

-- Allow document creators to delete their documents
CREATE POLICY "Allow users to delete their collaborative documents"
  ON public.collaborative_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Allow authenticated users to view document versions
CREATE POLICY "Allow users to view document versions"
  ON public.document_versions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create document versions
CREATE POLICY "Allow users to create document versions"
  ON public.document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_collaborative_document_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update timestamp on document update
DROP TRIGGER IF EXISTS update_collaborative_document_timestamp_trigger ON public.collaborative_documents;
CREATE TRIGGER update_collaborative_document_timestamp_trigger
BEFORE UPDATE ON public.collaborative_documents
FOR EACH ROW
EXECUTE FUNCTION update_collaborative_document_timestamp();