-- ============================================================
-- PART 7: Create closet-images storage bucket
-- The frontend uploads images here, but the bucket was never created.
-- ============================================================

-- Create the storage bucket (public for reading images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'closet-images',
  'closet-images',
  true,
  10485760,  -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload to own closet folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'closet-images'
    AND (storage.foldername(name))[1] = 'closet'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- RLS policy: Anyone can read closet images (public bucket)
CREATE POLICY "Public read access for closet images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'closet-images');

-- RLS policy: Users can delete their own closet images
CREATE POLICY "Users can delete own closet images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'closet-images'
    AND (storage.foldername(name))[1] = 'closet'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

