
-- Weekly style challenges table
CREATE TABLE public.weekly_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start date NOT NULL,
  week_end date NOT NULL,
  theme text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(week_start)
);

ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges" ON public.weekly_challenges FOR SELECT USING (true);

-- Challenge entries (link analyses to weekly challenges)
CREATE TABLE public.challenge_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id uuid NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  analysis_id uuid NOT NULL REFERENCES public.outfit_analyses(id) ON DELETE CASCADE,
  score numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view entries" ON public.challenge_entries FOR SELECT USING (true);
CREATE POLICY "Users can submit entries" ON public.challenge_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.challenge_entries FOR DELETE USING (auth.uid() = user_id);

-- Badges/achievements table
CREATE TABLE public.user_badges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  badge_key text NOT NULL,
  badge_name text NOT NULL,
  badge_description text NOT NULL,
  badge_icon text NOT NULL DEFAULT 'award',
  unlocked_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_key)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Users can earn badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create current week challenge function
CREATE OR REPLACE FUNCTION public.get_or_create_current_challenge()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  challenge_id uuid;
  week_start_date date;
  week_end_date date;
  themes text[] := ARRAY['Street Style', 'Formal Elegance', 'Casual Cool', 'Color Pop', 'Minimalist Chic', 'Vintage Vibes', 'Athleisure', 'Bold & Bright'];
BEGIN
  week_start_date := date_trunc('week', CURRENT_DATE)::date;
  week_end_date := week_start_date + interval '6 days';
  
  SELECT id INTO challenge_id FROM weekly_challenges WHERE week_start = week_start_date;
  
  IF challenge_id IS NULL THEN
    INSERT INTO weekly_challenges (week_start, week_end, theme)
    VALUES (week_start_date, week_end_date, themes[1 + (EXTRACT(WEEK FROM CURRENT_DATE)::int % array_length(themes, 1))])
    RETURNING id INTO challenge_id;
  END IF;
  
  RETURN challenge_id;
END;
$$;
