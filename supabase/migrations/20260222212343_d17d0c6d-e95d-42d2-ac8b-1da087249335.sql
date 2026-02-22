
-- Add photo_url column to user_looks for outfit photos
ALTER TABLE public.user_looks ADD COLUMN IF NOT EXISTS photo_url text;

-- Create storage bucket for look photos
INSERT INTO storage.buckets (id, name, public) VALUES ('look-photos', 'look-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for look photos
CREATE POLICY "Look photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'look-photos');

CREATE POLICY "Users can upload their own look photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'look-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own look photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'look-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own look photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'look-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
