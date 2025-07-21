-- Add animation preferences to user_preferences table
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS animation_preferences JSONB DEFAULT '{"preference": "full", "duration": 0.3}'::jsonb;

-- Update comment
COMMENT ON TABLE public.user_preferences IS 'Stores user preferences including dashboard widget layouts and animation settings';

-- Update existing rows with default animation preferences
UPDATE public.user_preferences
SET animation_preferences = '{"preference": "full", "duration": 0.3}'::jsonb
WHERE animation_preferences IS NULL;