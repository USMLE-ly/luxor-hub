
-- Create table for saved outfit analyses
CREATE TABLE public.outfit_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  overall_style TEXT NOT NULL,
  style_score NUMERIC NOT NULL,
  summary TEXT NOT NULL,
  occasion_ratings JSONB NOT NULL DEFAULT '[]'::jsonb,
  detected_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  color_palette JSONB NOT NULL DEFAULT '{}'::jsonb,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  improvements JSONB NOT NULL DEFAULT '[]'::jsonb,
  seasonal_fit TEXT,
  body_type_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.outfit_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses"
  ON public.outfit_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON public.outfit_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON public.outfit_analyses FOR DELETE
  USING (auth.uid() = user_id);
