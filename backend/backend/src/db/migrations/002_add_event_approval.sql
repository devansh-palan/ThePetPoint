-- Add approved_status to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS approved_status BOOLEAN DEFAULT false;

-- Update existing events to handle the new column
UPDATE events SET approved_status = true WHERE created_by IN (SELECT id FROM users WHERE role = 'admin');
