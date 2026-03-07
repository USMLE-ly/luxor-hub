
-- Fashion designs gallery table
CREATE TABLE public.fashion_designs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  prompt text NOT NULL,
  description text,
  garment_type text NOT NULL DEFAULT 'Dress',
  is_favorite boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.fashion_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own designs" ON public.fashion_designs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public designs" ON public.fashion_designs FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own designs" ON public.fashion_designs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own designs" ON public.fashion_designs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own designs" ON public.fashion_designs FOR DELETE USING (auth.uid() = user_id);
