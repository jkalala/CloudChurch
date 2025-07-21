-- Create presence table for real-time user presence tracking
CREATE TABLE IF NOT EXISTS public.presence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'online',
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_presence_user_id ON public.presence(user_id);
CREATE INDEX IF NOT EXISTS idx_presence_resource ON public.presence(resource_id, resource_type);

-- Add RLS policies
ALTER TABLE public.presence ENABLE ROW LEVEL SECURITY;

-- Allow users to see all presence data
CREATE POLICY "Allow users to see all presence data"
  ON public.presence
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own presence data
CREATE POLICY "Allow users to insert their own presence data"
  ON public.presence
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own presence data
CREATE POLICY "Allow users to update their own presence data"
  ON public.presence
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own presence data
CREATE POLICY "Allow users to delete their own presence data"
  ON public.presence
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add presence_status enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'presence_status') THEN
    CREATE TYPE presence_status AS ENUM ('online', 'away', 'busy', 'offline');
  END IF;
END$$;

-- Add function to update presence last_active timestamp
CREATE OR REPLACE FUNCTION update_presence_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update last_active on presence update
DROP TRIGGER IF EXISTS update_presence_last_active_trigger ON public.presence;
CREATE TRIGGER update_presence_last_active_trigger
BEFORE UPDATE ON public.presence
FOR EACH ROW
EXECUTE FUNCTION update_presence_last_active();

-- Add function to clean up stale presence records
CREATE OR REPLACE FUNCTION cleanup_stale_presence()
RETURNS void AS $$
BEGIN
  DELETE FROM public.presence
  WHERE last_active < NOW() - INTERVAL '15 minutes';
END;
$$ LANGUAGE plpgsql;