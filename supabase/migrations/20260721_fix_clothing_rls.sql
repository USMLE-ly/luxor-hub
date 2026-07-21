-- ============================================================
-- FIX: Restore INSERT/UPDATE/DELETE policies for clothing_items
-- The 20260721_rls_policies.sql migration accidentally dropped
-- these policies and only recreated SELECT policies.
-- ============================================================

-- Clothing Items — INSERT
DROP POLICY IF EXISTS "Users can insert own clothing_items" ON public.clothing_items;
CREATE POLICY "Users can insert own clothing_items"
  ON public.clothing_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Clothing Items — UPDATE
DROP POLICY IF EXISTS "Users can update own clothing_items" ON public.clothing_items;
CREATE POLICY "Users can update own clothing_items"
  ON public.clothing_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Clothing Items — DELETE
DROP POLICY IF EXISTS "Users can delete own clothing_items" ON public.clothing_items;
CREATE POLICY "Users can delete own clothing_items"
  ON public.clothing_items FOR DELETE
  USING (auth.uid() = user_id);
