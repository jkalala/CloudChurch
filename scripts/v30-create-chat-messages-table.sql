-- Migration: Create chat_messages table for persistent chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id TEXT,
  user_id TEXT,
  user_name TEXT,
  message TEXT,
  type TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_stream_id ON chat_messages (stream_id); 