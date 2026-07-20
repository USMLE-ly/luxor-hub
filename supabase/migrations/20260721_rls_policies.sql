-- ============================================================
-- LUXOR® Row-Level Security Policies
-- Run this in Supabase SQL Editor
-- Created: 2026-07-21
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view public profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── User Looks ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own user_looks" ON public.user_looks;
DROP POLICY IF EXISTS "Authenticated users can view public looks" ON public.user_looks;

CREATE POLICY "Users can view own user_looks"
  ON public.user_looks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view public looks"
  ON public.user_looks FOR SELECT
  USING (auth.role() = 'authenticated' AND is_public = true);

-- ── Look Comments ───────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own look_comments" ON public.look_comments;
DROP POLICY IF EXISTS "Authenticated users can view comments on public looks" ON public.look_comments;

CREATE POLICY "Users can view own look_comments"
  ON public.look_comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view comments on public looks"
  ON public.look_comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Look Likes ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own look_likes" ON public.look_likes;
DROP POLICY IF EXISTS "Authenticated users can view look likes" ON public.look_likes;

CREATE POLICY "Users can view own look_likes"
  ON public.look_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view look likes"
  ON public.look_likes FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Clothing Items ──────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own clothing_items" ON public.clothing_items;
DROP POLICY IF EXISTS "Authenticated users can view public clothing items" ON public.clothing_items;

CREATE POLICY "Users can view own clothing_items"
  ON public.clothing_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view public clothing items"
  ON public.clothing_items FOR SELECT
  USING (auth.role() = 'authenticated' AND is_public = true);

-- ── Outfits ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own outfits" ON public.outfits;
DROP POLICY IF EXISTS "Authenticated users can view public outfits" ON public.outfits;

CREATE POLICY "Users can view own outfits"
  ON public.outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view public outfits"
  ON public.outfits FOR SELECT
  USING (auth.role() = 'authenticated' AND is_public = true);

-- ── Follows ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can see who follows them" ON public.follows;

CREATE POLICY "Users can see who follows them"
  ON public.follows FOR SELECT
  USING (auth.uid() = following_id);
