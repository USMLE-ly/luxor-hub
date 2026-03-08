
-- New table: outfit_feedback (evening reflection)
CREATE TABLE public.outfit_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL DEFAULT 3,
  compliments INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.outfit_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own feedback" ON public.outfit_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback" ON public.outfit_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feedback" ON public.outfit_feedback FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own feedback" ON public.outfit_feedback FOR DELETE USING (auth.uid() = user_id);

-- New table: ai_feedback (rejected suggestion memory)
CREATE TABLE public.ai_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  suggestion_hash TEXT NOT NULL,
  accepted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ai_feedback" ON public.ai_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_feedback" ON public.ai_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- New table: style_points (gamification)
CREATE TABLE public.style_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.style_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points" ON public.style_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own points" ON public.style_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view points for leaderboard" ON public.style_points FOR SELECT USING (true);

-- Alter clothing_items: add wear tracking columns
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS wear_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.clothing_items ADD COLUMN IF NOT EXISTS last_worn_at DATE;
