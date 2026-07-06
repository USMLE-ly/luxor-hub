-- ============================================================
-- Confirm all existing users who haven't confirmed their email
-- Run this AFTER disabling "Confirm email" in Supabase Dashboard
-- (Authentication → Settings → Confirm email → OFF)
-- ============================================================

-- Confirm all unconfirmed users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now()),
    updated_at = now()
WHERE email_confirmed_at IS NULL;

-- Verify: count how many users are still unconfirmed
SELECT COUNT(*) AS still_unconfirmed
FROM auth.users
WHERE email_confirmed_at IS NULL;
