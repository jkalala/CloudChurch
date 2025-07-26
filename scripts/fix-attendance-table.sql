-- Fix attendance table to make event_id optional
-- This script modifies the attendance table to allow NULL values for event_id

-- Drop the existing foreign key constraint
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_event_id_fkey;

-- Modify the event_id column to allow NULL values
ALTER TABLE attendance ALTER COLUMN event_id DROP NOT NULL;

-- Re-add the foreign key constraint but allow NULL values
ALTER TABLE attendance ADD CONSTRAINT attendance_event_id_fkey 
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL;

-- Add a comment to document the change
COMMENT ON COLUMN attendance.event_id IS 'Optional reference to events table. NULL for general attendance without specific event.'; 