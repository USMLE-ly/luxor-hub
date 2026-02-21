
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Clothing items table
CREATE TABLE public.clothing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  color TEXT,
  style TEXT,
  season TEXT,
  occasion TEXT,
  brand TEXT,
  notes TEXT,
  photo_url TEXT,
  price NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own items" ON public.clothing_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own items" ON public.clothing_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own items" ON public.clothing_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own items" ON public.clothing_items FOR DELETE USING (auth.uid() = user_id);

-- Outfits table
CREATE TABLE public.outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ai_explanation TEXT,
  confidence_score NUMERIC,
  occasion TEXT,
  mood TEXT,
  is_favorite BOOLEAN DEFAULT false,
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own outfits" ON public.outfits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own outfits" ON public.outfits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own outfits" ON public.outfits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own outfits" ON public.outfits FOR DELETE USING (auth.uid() = user_id);

-- Outfit items junction table
CREATE TABLE public.outfit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES public.clothing_items(id) ON DELETE CASCADE,
  UNIQUE(outfit_id, clothing_item_id)
);
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own outfit items" ON public.outfit_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own outfit items" ON public.outfit_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_id AND user_id = auth.uid())
);
CREATE POLICY "Users can delete own outfit items" ON public.outfit_items FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.outfits WHERE id = outfit_id AND user_id = auth.uid())
);

-- Style profiles table
CREATE TABLE public.style_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  archetype TEXT,
  style_score NUMERIC DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.style_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own style profile" ON public.style_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own style profile" ON public.style_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own style profile" ON public.style_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Wear logs table
CREATE TABLE public.wear_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clothing_item_id UUID NOT NULL REFERENCES public.clothing_items(id) ON DELETE CASCADE,
  worn_at DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wear_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wear logs" ON public.wear_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wear logs" ON public.wear_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wear logs" ON public.wear_logs FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for clothing photos
INSERT INTO storage.buckets (id, name, public) VALUES ('clothing-photos', 'clothing-photos', false);
CREATE POLICY "Users can view own clothing photos" ON storage.objects FOR SELECT USING (bucket_id = 'clothing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload own clothing photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'clothing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own clothing photos" ON storage.objects FOR DELETE USING (bucket_id = 'clothing-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_clothing_items_updated_at BEFORE UPDATE ON public.clothing_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_style_profiles_updated_at BEFORE UPDATE ON public.style_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.style_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
