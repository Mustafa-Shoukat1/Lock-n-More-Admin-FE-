-- Update notification_type enum to include 'message'
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'message';
