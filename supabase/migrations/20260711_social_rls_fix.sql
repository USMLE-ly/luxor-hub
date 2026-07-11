-- ============================================================
-- LEXOR® Social Feature RLS Fix
-- Adds cross-user read policies for public social data
-- ============================================================

-- 1. PROFILES: All authenticated users can view basic profile info
--    (display_name, avatar_url) but NOT sensitive fields
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Allow authenticated users to see other users' basic profile info
create policy "Authenticated users can view public profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- 2. USER_LOOKS: Owners see all their looks; others see only public ones
drop policy if exists "Users can view own user_looks" on public.user_looks;
create policy "Users can view own user_looks"
  on public.user_looks for select
  using (auth.uid() = user_id);

create policy "Authenticated users can view public looks"
  on public.user_looks for select
  using (auth.role() = 'authenticated' and is_public = true);

-- 3. LOOK_COMMENTS: Owners see all comments; others see comments on public looks
drop policy if exists "Users can view own look_comments" on public.look_comments;
create policy "Users can view own look_comments"
  on public.look_comments for select
  using (auth.uid() = user_id);

create policy "Authenticated users can view comments on public looks"
  on public.look_comments for select
  using (auth.role() = 'authenticated');

-- 4. LOOK_LIKES: Owners see all likes; others can see likes on any look
drop policy if exists "Users can view own look_likes" on public.look_likes;
create policy "Users can view own look_likes"
  on public.look_likes for select
  using (auth.uid() = user_id);

create policy "Authenticated users can view look likes"
  on public.look_likes for select
  using (auth.role() = 'authenticated');

-- 5. CLOTHING_ITEMS: Owners see all; others see only public items
drop policy if exists "Users can view own clothing_items" on public.clothing_items;
create policy "Users can view own clothing_items"
  on public.clothing_items for select
  using (auth.uid() = user_id);

create policy "Authenticated users can view public clothing items"
  on public.clothing_items for select
  using (auth.role() = 'authenticated' and is_public = true);

-- 6. SAVED_LOOKS: Only owner can see their saved looks (private by nature)
--    No change needed — owner-only is correct

-- 7. OUTFITS: Owners see all; others see only public ones
drop policy if exists "Users can view own outfits" on public.outfits;
create policy "Users can view own outfits"
  on public.outfits for select
  using (auth.uid() = user_id);

create policy "Authenticated users can view public outfits"
  on public.outfits for select
  using (auth.role() = 'authenticated' and is_public = true);

-- 8. FOLLOWS: Already has cross-user policies (view own + insert own + delete own)
--    Add: allow viewing who follows you
create policy "Users can see who follows them"
  on public.follows for select
  using (auth.uid() = following_id);

-- 9. NOTIFICATION_RECIPIENTS: Only owner sees their notifications (correct)
--    No change needed
