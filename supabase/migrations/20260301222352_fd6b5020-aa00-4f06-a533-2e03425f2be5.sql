ALTER TABLE public.calendar_events 
ADD COLUMN IF NOT EXISTS outfit_items JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS mannequin_image_url TEXT;