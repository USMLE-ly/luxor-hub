-- ============================================================
-- PART 3: Manual RLS Policies for special tables
-- Run this THIRD (after 02)
-- ============================================================

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Follows
drop policy if exists "Users can view own follows" on public.follows;
create policy "Users can view own follows" on public.follows
  for select using (auth.uid() = follower_id);
drop policy if exists "Users can insert own follows" on public.follows;
create policy "Users can insert own follows" on public.follows
  for insert with check (auth.uid() = follower_id);
drop policy if exists "Users can delete own follows" on public.follows;
create policy "Users can delete own follows" on public.follows
  for delete using (auth.uid() = follower_id);

-- Newsletter (anyone can subscribe)
drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);

-- Weekly challenges (all auth users can view)
drop policy if exists "Authenticated users can view challenges" on public.weekly_challenges;
create policy "Authenticated users can view challenges" on public.weekly_challenges
  for select using (auth.role() = 'authenticated');

-- User Looks (public read for auth users)
drop policy if exists "Authenticated users can view public looks" on public.user_looks;
create policy "Authenticated users can view public looks" on public.user_looks
  for select using (auth.role() = 'authenticated' AND is_public = true);
drop policy if exists "Authenticated users can view public look comments" on public.look_comments;
create policy "Authenticated users can view public look comments" on public.look_comments
  for select using (auth.role() = 'authenticated');
drop policy if exists "Authenticated users can view public look likes" on public.look_likes;
create policy "Authenticated users can view public look likes" on public.look_likes
  for select using (auth.role() = 'authenticated');
