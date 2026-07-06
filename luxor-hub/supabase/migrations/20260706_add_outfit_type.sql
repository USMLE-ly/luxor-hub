-- Add outfit_type column to calendar_events table for DressingRoom outfit tracking
ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS outfit_type text;

-- Add an index on user_id + event_date for faster calendar queries (if not exists)
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date 
ON public.calendar_events (user_id, event_date);
