
-- Make clothing-photos bucket public so images can be displayed
UPDATE storage.buckets SET public = true WHERE id = 'clothing-photos';

-- Add storage policies for authenticated users to upload photos
CREATE POLICY "Users can upload their own clothing photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'clothing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own clothing photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'clothing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own clothing photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'clothing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Clothing photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'clothing-photos');
