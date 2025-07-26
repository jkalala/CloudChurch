-- Fix attendance table in existing database
-- This script modifies the existing attendance table to make event_id optional

-- First, check if the constraint exists and drop it
DO $$ 
BEGIN
    -- Drop the foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'attendance_event_id_fkey' 
        AND table_name = 'attendance'
    ) THEN
        ALTER TABLE attendance DROP CONSTRAINT attendance_event_id_fkey;
    END IF;
END $$;

-- Modify the event_id column to allow NULL values
ALTER TABLE attendance ALTER COLUMN event_id DROP NOT NULL;

-- Re-add the foreign key constraint but allow NULL values
ALTER TABLE attendance ADD CONSTRAINT attendance_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- Add a comment to document the change
COMMENT ON COLUMN attendance.event_id IS 'Optional reference to events table. NULL for general attendance without specific event.';

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'attendance' AND column_name = 'event_id'; 