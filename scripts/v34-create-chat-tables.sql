-- Create chat channels table
CREATE TABLE IF NOT EXISTS public.chat_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'group', -- 'group', 'direct', 'resource'
  resource_id TEXT, -- Optional reference to a resource (document, event, etc.)
  resource_type TEXT, -- Type of resource
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL, -- For thread replies
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'image', 'file', 'system'
  metadata JSONB DEFAULT '{}'::jsonb, -- For file URLs, image dimensions, etc.
  is_edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat message reactions table
CREATE TABLE IF NOT EXISTS public.chat_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  reaction TEXT NOT NULL, -- Emoji or reaction code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

-- Create chat read receipts table
CREATE TABLE IF NOT EXISTS public.chat_read_receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  last_read_message_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Create chat channel members table
CREATE TABLE IF NOT EXISTS public.chat_channel_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Create chat typing indicators table (for real-time updates)
CREATE TABLE IF NOT EXISTS public.chat_typing_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel_id UUID NOT NULL REFERENCES public.chat_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  is_typing BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON public.chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent_id ON public.chat_messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_reactions_message_id ON public.chat_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_chat_read_receipts_channel_id ON public.chat_read_receipts(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_channel_id ON public.chat_channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_channel_members_user_id ON public.chat_channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_typing_indicators_channel_id ON public.chat_typing_indicators(channel_id);

-- Add RLS policies
ALTER TABLE public.chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_typing_indicators ENABLE ROW LEVEL SECURITY;

-- Allow users to view channels they are members of
CREATE POLICY "Allow users to view channels they are members of"
  ON public.chat_channels
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE chat_channel_members.channel_id = chat_channels.id
      AND chat_channel_members.user_id = auth.uid()
    )
  );

-- Allow users to create channels
CREATE POLICY "Allow users to create channels"
  ON public.chat_channels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Allow channel owners and admins to update channels
CREATE POLICY "Allow channel owners and admins to update channels"
  ON public.chat_channels
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE chat_channel_members.channel_id = chat_channels.id
      AND chat_channel_members.user_id = auth.uid()
      AND chat_channel_members.role IN ('owner', 'admin')
    )
  );

-- Allow channel owners to delete channels
CREATE POLICY "Allow channel owners to delete channels"
  ON public.chat_channels
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE chat_channel_members.channel_id = chat_channels.id
      AND chat_channel_members.user_id = auth.uid()
      AND chat_channel_members.role = 'owner'
    )
  );

-- Allow users to view messages in channels they are members of
CREATE POLICY "Allow users to view messages in channels they are members of"
  ON public.chat_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE chat_channel_members.channel_id = chat_messages.channel_id
      AND chat_channel_members.user_id = auth.uid()
    )
  );

-- Allow users to send messages in channels they are members of
CREATE POLICY "Allow users to send messages in channels they are members of"
  ON public.chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE chat_channel_members.channel_id = chat_messages.channel_id
      AND chat_channel_members.user_id = auth.uid()
    )
  );

-- Allow users to edit their own messages
CREATE POLICY "Allow users to edit their own messages"
  ON public.chat_messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own messages
CREATE POLICY "Allow users to delete their own messages"
  ON public.chat_messages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow channel admins to delete any message
CREATE POLICY "Allow channel admins to delete any message"
  ON public.chat_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE chat_channel_members.channel_id = chat_messages.channel_id
      AND chat_channel_members.user_id = auth.uid()
      AND chat_channel_members.role IN ('owner', 'admin')
    )
  );

-- Allow users to view reactions in channels they are members of
CREATE POLICY "Allow users to view reactions in channels they are members of"
  ON public.chat_reactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages
      JOIN public.chat_channel_members ON chat_messages.channel_id = chat_channel_members.channel_id
      WHERE chat_messages.id = chat_reactions.message_id
      AND chat_channel_members.user_id = auth.uid()
    )
  );

-- Allow users to add reactions in channels they are members of
CREATE POLICY "Allow users to add reactions in channels they are members of"
  ON public.chat_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chat_messages
      JOIN public.chat_channel_members ON chat_messages.channel_id = chat_channel_members.channel_id
      WHERE chat_messages.id = chat_reactions.message_id
      AND chat_channel_members.user_id = auth.uid()
    )
  );

-- Allow users to delete their own reactions
CREATE POLICY "Allow users to delete their own reactions"
  ON public.chat_reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to view read receipts in channels they are members of
CREATE POLICY "Allow users to view read receipts in channels they are members of"
  ON public.chat_read_receipts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE chat_channel_members.channel_id = chat_read_receipts.channel_id
      AND chat_channel_members.user_id = auth.uid()
    )
  );

-- Allow users to update their own read receipts
CREATE POLICY "Allow users to update their own read receipts"
  ON public.chat_read_receipts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own read receipts
CREATE POLICY "Allow users to update their own read receipts"
  ON public.chat_read_receipts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to view channel members in channels they are members of
CREATE POLICY "Allow users to view channel members in channels they are members of"
  ON public.chat_channel_members
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members AS members
      WHERE members.channel_id = chat_channel_members.channel_id
      AND members.user_id = auth.uid()
    )
  );

-- Allow users to join public channels
CREATE POLICY "Allow users to join public channels"
  ON public.chat_channel_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chat_channels
      WHERE chat_channels.id = chat_channel_members.channel_id
      AND chat_channels.type = 'group'
    )
  );

-- Allow channel owners and admins to update channel members
CREATE POLICY "Allow channel owners and admins to update channel members"
  ON public.chat_channel_members
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members AS members
      WHERE members.channel_id = chat_channel_members.channel_id
      AND members.user_id = auth.uid()
      AND members.role IN ('owner', 'admin')
    )
  );

-- Allow users to leave channels (delete their own membership)
CREATE POLICY "Allow users to leave channels"
  ON public.chat_channel_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow channel owners and admins to remove members
CREATE POLICY "Allow channel owners and admins to remove members"
  ON public.chat_channel_members
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members AS members
      WHERE members.channel_id = chat_channel_members.channel_id
      AND members.user_id = auth.uid()
      AND members.role IN ('owner', 'admin')
    )
  );

-- Allow users to view typing indicators in channels they are members of
CREATE POLICY "Allow users to view typing indicators in channels they are members of"
  ON public.chat_typing_indicators
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_channel_members
      WHERE chat_channel_members.channel_id = chat_typing_indicators.channel_id
      AND chat_channel_members.user_id = auth.uid()
    )
  );

-- Allow users to update their own typing indicators
CREATE POLICY "Allow users to update their own typing indicators"
  ON public.chat_typing_indicators
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own typing indicators
CREATE POLICY "Allow users to update their own typing indicators"
  ON public.chat_typing_indicators
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_channel_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update timestamp on channel update
DROP TRIGGER IF EXISTS update_chat_channel_timestamp_trigger ON public.chat_channels;
CREATE TRIGGER update_chat_channel_timestamp_trigger
BEFORE UPDATE ON public.chat_channels
FOR EACH ROW
EXECUTE FUNCTION update_chat_channel_timestamp();

-- Add function to update updated_at timestamp for messages
CREATE OR REPLACE FUNCTION update_chat_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.is_edited = TRUE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update timestamp on message update
DROP TRIGGER IF EXISTS update_chat_message_timestamp_trigger ON public.chat_messages;
CREATE TRIGGER update_chat_message_timestamp_trigger
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_message_timestamp();

-- Add function to update typing indicator timestamp
CREATE OR REPLACE FUNCTION update_typing_indicator_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update timestamp on typing indicator update
DROP TRIGGER IF EXISTS update_typing_indicator_timestamp_trigger ON public.chat_typing_indicators;
CREATE TRIGGER update_typing_indicator_timestamp_trigger
BEFORE UPDATE ON public.chat_typing_indicators
FOR EACH ROW
EXECUTE FUNCTION update_typing_indicator_timestamp();

-- Add function to clean up stale typing indicators
CREATE OR REPLACE FUNCTION cleanup_stale_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM public.chat_typing_indicators
  WHERE updated_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql;