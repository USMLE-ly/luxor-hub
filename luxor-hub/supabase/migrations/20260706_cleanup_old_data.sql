-- ============================================================
-- SAFE DATA CLEANUP QUERIES
-- Run these in Supabase SQL Editor to remove old/mock data
-- ============================================================

-- 1. Delete old calendar events (before a specific date)
-- Change the date below to the threshold you want
-- DELETE FROM public.calendar_events WHERE event_date < '2026-06-01';

-- 2. View what would be deleted first (preview)
-- SELECT * FROM public.calendar_events WHERE event_date < '2026-06-01';

-- 3. Delete old outfits (saved mannequin outfits)
-- DELETE FROM public.outfits WHERE created_at < now() - interval '30 days';

-- 4. Count items per user in clothing_items
-- SELECT user_id, COUNT(*) FROM public.clothing_items GROUP BY user_id;

-- 5. Delete specific user's old data (replace USER_UUID with actual id)
-- DELETE FROM public.calendar_events WHERE user_id = 'USER_UUID' AND event_date < '2026-06-01';
-- DELETE FROM public.wear_logs WHERE user_id = 'USER_UUID' AND worn_date < '2026-06-01';

-- 6. View all your calendar events with dates
-- SELECT id, title, event_date, occasion FROM public.calendar_events ORDER BY event_date DESC LIMIT 50;
