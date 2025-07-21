-- Create user_preferences table for storing dashboard widget layouts and other user preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dashboard_layout JSONB DEFAULT '[]'::jsonb,
    theme VARCHAR(20) DEFAULT 'system',
    notification_settings JSONB DEFAULT '{}'::jsonb,
    accessibility_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);

-- Add RLS policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own preferences
CREATE POLICY user_preferences_select_policy ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy for users to update their own preferences
CREATE POLICY user_preferences_update_policy ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy for users to insert their own preferences
CREATE POLICY user_preferences_insert_policy ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;

-- Create function to initialize user preferences on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize user preferences on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Add comment
COMMENT ON TABLE public.user_preferences IS 'Stores user preferences including dashboard widget layouts';