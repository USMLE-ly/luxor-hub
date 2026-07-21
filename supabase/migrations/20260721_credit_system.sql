-- ============================================================
-- LUXOR CREDIT SYSTEM -- Tables for usage-based billing
-- Safe to run anytime (CREATE IF NOT EXISTS)
-- ============================================================

-- 1. Credit Balances -- tracks monthly allocation and remaining credits per user
CREATE TABLE IF NOT EXISTS public.credit_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  month TEXT NOT NULL,
  credits_allocated INTEGER NOT NULL DEFAULT 30,
  credits_remaining INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month)
);

-- 2. Credit Events -- logs every billable action for billing + analytics
CREATE TABLE IF NOT EXISTS public.credit_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  cost INTEGER NOT NULL,
  credits_remaining INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_credit_balances_user_month ON public.credit_balances(user_id, month);
CREATE INDEX IF NOT EXISTS idx_credit_events_user_date ON public.credit_events(user_id, created_at);

-- 4. Enable RLS
ALTER TABLE public.credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_events ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies -- users can only see their own credit data
DROP POLICY IF EXISTS "Users can view own credit_balances" ON public.credit_balances;
CREATE POLICY "Users can view own credit_balances" ON public.credit_balances
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own credit_balances" ON public.credit_balances;
CREATE POLICY "Users can insert own credit_balances" ON public.credit_balances
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can update own credit_balances" ON public.credit_balances;
CREATE POLICY "Users can update own credit_balances" ON public.credit_balances
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can view own credit_events" ON public.credit_events;
CREATE POLICY "Users can view own credit_events" ON public.credit_events
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Users can insert own credit_events" ON public.credit_events;
CREATE POLICY "Users can insert own credit_events" ON public.credit_events
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- 6. Auto-create free credit balance on signup (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.credit_balances (user_id, month, credits_allocated, credits_remaining)
  VALUES (NEW.id::text, to_char(now(), 'YYYY-MM'), 30, 30)
  ON CONFLICT (user_id, month) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_credits();

-- 7. Monthly reset function (run via cron or on first access each month)
CREATE OR REPLACE FUNCTION public.reset_monthly_credits(target_user_id TEXT, new_tier TEXT)
RETURNS VOID AS $$
DECLARE
  new_allocated INTEGER;
  new_month TEXT;
BEGIN
  new_month := to_char(now(), 'YYYY-MM');
  new_allocated := CASE new_tier
    WHEN 'free' THEN 30
    WHEN 'starter' THEN 200
    WHEN 'pro' THEN 1000
    WHEN 'elite' THEN 5000
    ELSE 30
  END;
  INSERT INTO public.credit_balances (user_id, month, credits_allocated, credits_remaining)
  VALUES (target_user_id, new_month, new_allocated, new_allocated)
  ON CONFLICT (user_id, month) DO UPDATE
  SET credits_allocated = new_allocated,
      credits_remaining = new_allocated,
      updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- CRITICAL #3: Atomic credit consumption function (prevents race conditions)
-- ============================================================
-- This function atomically deducts credits, preventing double-spend
-- from simultaneous AI requests. Returns success/error in one transaction.
CREATE OR REPLACE FUNCTION public.consume_credits(
  p_user_id TEXT,
  p_action TEXT,
  p_cost INTEGER
)
RETURNS TABLE(success BOOLEAN, credits_remaining INTEGER, error_message TEXT)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_month TEXT;
  v_current_remaining INTEGER;
BEGIN
  v_month := to_char(now(), 'YYYY-MM');

  -- Atomic: deduct credits only if sufficient balance exists
  UPDATE public.credit_balances
  SET credits_remaining = credits_remaining - p_cost,
      updated_at = now()
  WHERE user_id = p_user_id
    AND month = v_month
    AND credits_remaining >= p_cost
  RETURNING credit_balances.credits_remaining INTO v_current_remaining;

  IF v_current_remaining IS NULL THEN
    -- Insufficient credits or no balance record
    RETURN QUERY SELECT FALSE, 0, 'Insufficient credits'::TEXT;
    RETURN;
  END IF;

  -- Log the event
  INSERT INTO public.credit_events (user_id, action, cost, credits_remaining, created_at)
  VALUES (p_user_id, p_action, p_cost, v_current_remaining, now());

  RETURN QUERY SELECT TRUE, v_current_remaining, NULL::TEXT;
END;
$$;

-- ============================================================
-- HIGH #6: Credit rollover for paid tiers (20% of unused credits carry over)
-- ============================================================
CREATE OR REPLACE FUNCTION public.rollover_credits(p_user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_prev_month TEXT;
  v_curr_month TEXT;
  v_prev_balance RECORD;
  v_new_allocated INTEGER;
  v_rollover INTEGER;
  v_prev_tier TEXT;
BEGIN
  v_prev_month := to_char(now() - interval '1 month', 'YYYY-MM');
  v_curr_month := to_char(now(), 'YYYY-MM');

  -- Get previous month's balance
  SELECT * INTO v_prev_balance
  FROM public.credit_balances
  WHERE user_id = p_user_id AND month = v_prev_month;

  IF NOT FOUND OR v_prev_balance.credits_remaining <= 0 THEN
    RETURN;
  END IF;

  -- Determine tier from subscription
  SELECT plan_tier INTO v_prev_tier
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active' LIMIT 1;

  v_new_allocated := CASE COALESCE(v_prev_tier, 'free')
    WHEN 'starter' THEN 200
    WHEN 'pro' THEN 1000
    WHEN 'elite' THEN 5000
    ELSE 30
  END;

  -- 20% rollover for paid tiers, 0% for free
  IF v_prev_tier IN ('starter', 'pro', 'elite') THEN
    v_rollover := GREATEST(0, LEAST(
      FLOOR(v_prev_balance.credits_remaining * 0.2)::INTEGER,
      FLOOR(v_new_allocated * 0.2)::INTEGER  -- Cap rollover at 20% of new allocation
    ));
  ELSE
    v_rollover := 0;
  END IF;

  -- Set new month's balance with rollover
  INSERT INTO public.credit_balances (user_id, month, credits_allocated, credits_remaining)
  VALUES (p_user_id, v_curr_month, v_new_allocated, v_new_allocated + v_rollover)
  ON CONFLICT (user_id, month) DO UPDATE
  SET credits_allocated = v_new_allocated,
      credits_remaining = GREATEST(credit_balances.credits_remaining, v_new_allocated + v_rollover),
      updated_at = now();

  IF v_rollover > 0 THEN
    RAISE NOTICE 'Rollover: user=% prev=% rollover=% new=%', p_user_id, v_prev_balance.credits_remaining, v_rollover, v_new_allocated + v_rollover;
  END IF;
END;
$$;
