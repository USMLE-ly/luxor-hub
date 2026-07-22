-- ============================================================
-- LUXOR STREAK SYSTEM -- Daily login tracking + bonus credits
-- Safe to run anytime (CREATE IF NOT EXISTS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.daily_streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  current_streak INTEGER NOT NULL DEFAULT 1,
  longest_streak INTEGER NOT NULL DEFAULT 1,
  last_login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_login_days INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.streak_bonus_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  streak_days INTEGER NOT NULL UNIQUE,
  bonus_credits INTEGER NOT NULL,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.streak_bonus_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  streak_tier_id UUID NOT NULL REFERENCES public.streak_bonus_tiers(id),
  claimed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, streak_tier_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_streaks_user ON public.daily_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_bonus_claims_user ON public.streak_bonus_claims(user_id);

ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_bonus_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_bonus_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily_streaks" ON public.daily_streaks;
CREATE POLICY "Users can view own daily_streaks" ON public.daily_streaks
  FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Service can insert daily_streaks" ON public.daily_streaks;
CREATE POLICY "Service can insert daily_streaks" ON public.daily_streaks
  FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users can update own daily_streaks" ON public.daily_streaks;
CREATE POLICY "Users can update own daily_streaks" ON public.daily_streaks
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Anyone can view streak_bonus_tiers" ON public.streak_bonus_tiers;
CREATE POLICY "Anyone can view streak_bonus_tiers" ON public.streak_bonus_tiers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view own streak_bonus_claims" ON public.streak_bonus_claims;
CREATE POLICY "Users can view own streak_bonus_claims" ON public.streak_bonus_claims
  FOR SELECT USING (auth.uid()::text = user_id);
DROP POLICY IF EXISTS "Users can insert own streak_bonus_claims" ON public.streak_bonus_claims;
CREATE POLICY "Users can insert own streak_bonus_claims" ON public.streak_bonus_claims
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Seed bonus tiers
INSERT INTO public.streak_bonus_tiers (streak_days, bonus_credits, label, description)
VALUES
  (1, 2, 'First Day', 'Welcome back! +2 bonus credits'),
  (3, 5, '3-Day Streak', 'You''re on fire! +5 bonus credits'),
  (7, 10, 'Week Warrior', '7 days strong! +10 bonus credits'),
  (14, 20, 'Fortnight Fighter', '2 weeks! +20 bonus credits'),
  (30, 50, 'Monthly Master', '30 days! +50 bonus credits'),
  (60, 100, 'Streak Legend', '60 days! +100 bonus credits'),
  (100, 250, 'Century Club', '100 days! +250 bonus credits')
ON CONFLICT (streak_days) DO NOTHING;

-- Record daily login (atomic, handles streak logic)
CREATE OR REPLACE FUNCTION public.record_daily_login(p_user_id TEXT)
RETURNS TABLE(
  current_streak INTEGER,
  longest_streak INTEGER,
  total_login_days INTEGER,
  streak_milestone_reached BOOLEAN,
  milestone_days INTEGER,
  bonus_credits INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_existing RECORD;
  v_new_streak INTEGER;
  v_new_longest INTEGER;
  v_new_total INTEGER;
  v_milestone_reached BOOLEAN := FALSE;
  v_milestone_days INTEGER := 0;
  v_bonus_credits INTEGER := 0;
BEGIN
  SELECT * INTO v_existing FROM public.daily_streaks WHERE user_id = p_user_id;

  IF FOUND THEN
    IF v_existing.last_login_date = v_today THEN
      RETURN QUERY SELECT v_existing.current_streak, v_existing.longest_streak,
        v_existing.total_login_days, FALSE, 0, 0;
      RETURN;
    END IF;
    IF v_existing.last_login_date = v_yesterday THEN
      v_new_streak := v_existing.current_streak + 1;
    ELSE
      v_new_streak := 1;
    END IF;
    v_new_longest := GREATEST(v_new_streak, v_existing.longest_streak);
    v_new_total := v_existing.total_login_days + 1;
    UPDATE public.daily_streaks
    SET current_streak = v_new_streak, longest_streak = v_new_longest,
        last_login_date = v_today, total_login_days = v_new_total, updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    v_new_streak := 1; v_new_longest := 1; v_new_total := 1;
    INSERT INTO public.daily_streaks (user_id, current_streak, longest_streak, last_login_date, total_login_days)
    VALUES (p_user_id, 1, 1, v_today, 1);
  END IF;

  IF EXISTS (SELECT 1 FROM public.streak_bonus_tiers WHERE streak_days = v_new_streak)
    AND NOT EXISTS (
      SELECT 1 FROM public.streak_bonus_claims sc
      JOIN public.streak_bonus_tiers st ON sc.streak_tier_id = st.id
      WHERE sc.user_id = p_user_id AND st.streak_days = v_new_streak
    ) THEN
    v_milestone_reached := TRUE;
    v_milestone_days := v_new_streak;
    SELECT bonus_credits INTO v_bonus_credits FROM public.streak_bonus_tiers WHERE streak_days = v_new_streak;
  END IF;

  RETURN QUERY SELECT v_new_streak, v_new_longest, v_new_total, v_milestone_reached, v_milestone_days, v_bonus_credits;
END;
$$;

-- Claim streak bonus
CREATE OR REPLACE FUNCTION public.claim_streak_bonus(p_user_id TEXT, p_streak_days INTEGER)
RETURNS TABLE(success BOOLEAN, bonus_credits INTEGER, new_balance INTEGER)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_tier RECORD;
  v_current_month TEXT;
  v_new_balance INTEGER;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');
  SELECT * INTO v_tier FROM public.streak_bonus_tiers WHERE streak_days = p_streak_days;
  IF NOT FOUND THEN RETURN QUERY SELECT FALSE, 0, 0; RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.streak_bonus_claims WHERE user_id = p_user_id AND streak_tier_id = v_tier.id) THEN
    RETURN QUERY SELECT FALSE, 0, 0; RETURN;
  END IF;
  INSERT INTO public.streak_bonus_claims (user_id, streak_tier_id) VALUES (p_user_id, v_tier.id);

  UPDATE public.credit_balances
  SET credits_remaining = credits_remaining + v_tier.bonus_credits, updated_at = now()
  WHERE user_id = p_user_id AND month = v_current_month;
  SELECT credits_remaining INTO v_new_balance FROM public.credit_balances WHERE user_id = p_user_id AND month = v_current_month;

  INSERT INTO public.credit_events (user_id, action, cost, credits_remaining, created_at)
  VALUES (p_user_id, 'reward_streak_' || p_streak_days, -v_tier.bonus_credits, v_new_balance, now());

  RETURN QUERY SELECT TRUE, v_tier.bonus_credits, v_new_balance;
END;
$$;

-- Get streak info
CREATE OR REPLACE FUNCTION public.get_streak_info(p_user_id TEXT)
RETURNS TABLE(
  current_streak INTEGER, longest_streak INTEGER, total_login_days INTEGER,
  last_login_date DATE, next_milestone_days INTEGER,
  next_milestone_credits INTEGER, next_milestone_label TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_streak RECORD;
  v_next RECORD;
BEGIN
  SELECT * INTO v_streak FROM public.daily_streaks WHERE user_id = p_user_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0, 0, NULL::DATE, 1, 2, 'First Day';
    RETURN;
  END IF;
  SELECT st.streak_days, st.bonus_credits, st.label INTO v_next
  FROM public.streak_bonus_tiers st
  WHERE st.streak_days > v_streak.current_streak
    AND NOT EXISTS (SELECT 1 FROM public.streak_bonus_claims sc WHERE sc.user_id = p_user_id AND sc.streak_tier_id = st.id)
  ORDER BY st.streak_days ASC LIMIT 1;
  RETURN QUERY SELECT v_streak.current_streak, v_streak.longest_streak, v_streak.total_login_days,
    v_streak.last_login_date, COALESCE(v_next.streak_days, 100),
    COALESCE(v_next.bonus_credits, 250), COALESCE(v_next.label, 'Century Club');
END;
$$;
