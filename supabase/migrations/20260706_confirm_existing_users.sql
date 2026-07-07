-- ============================================================
-- CONFIRM EXISTING USERS + BACKFILL STYLE PROFILES
-- Run AFTER the main schema migration and after disabling
-- "Confirm email" in Supabase Dashboard
-- ============================================================

-- Step 1: Confirm all unconfirmed users (disable email confirmation retroactively)
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now()),
    updated_at = now()
WHERE email_confirmed_at IS NULL;

-- Step 2: Create style_profiles rows for existing users who don't have one
INSERT INTO public.style_profiles (user_id, onboarding_completed, style_score, preferences)
SELECT au.id, true, 50, '{}'::jsonb
FROM auth.users au
LEFT JOIN public.style_profiles sp ON sp.user_id = au.id
WHERE sp.id IS NULL;

-- Step 3: Mark ALL existing users as onboarding_completed
-- (they already went through onboarding on the old database)
UPDATE public.style_profiles
SET onboarding_completed = true,
    updated_at = now()
WHERE onboarding_completed IS NULL OR onboarding_completed = false;

-- Step 4: Verify
SELECT COUNT(*) AS users_confirmed
FROM auth.users
WHERE email_confirmed_at IS NOT NULL;

SELECT COUNT(*) AS users_onboarded
FROM public.style_profiles
WHERE onboarding_completed = true;
