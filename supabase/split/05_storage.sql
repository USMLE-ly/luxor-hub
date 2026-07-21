-- ============================================================
-- PART 5: Storage Bucket for Closet Images
-- Run this FIFTH (after 04)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('closet-images', 'closet-images', true)
on conflict (id) do nothing;

-- Authenticated users can upload
drop policy if exists "Authenticated users can upload closet images" on storage.objects;
create policy "Authenticated users can upload closet images"
  on storage.objects for insert
  with check (bucket_id = 'closet-images' and auth.role() = 'authenticated');

-- Anyone can view (public bucket)
drop policy if exists "Anyone can view closet images" on storage.objects;
create policy "Anyone can view closet images"
  on storage.objects for select
  using (bucket_id = 'closet-images');

-- Users can delete their own images
drop policy if exists "Users can delete own closet images" on storage.objects;
create policy "Users can delete own closet images"
  on storage.objects for delete
  using (bucket_id = 'closet-images' and auth.uid()::text = (storage.foldername(name))[1]);
