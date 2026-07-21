-- ============================================================
-- PART 2: Enable Row Level Security on ALL tables
-- Run this SECOND (after 01)
-- ============================================================

alter table public.profiles enable row level security;
alter table public.style_profiles enable row level security;
alter table public.clothing_items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.calendar_events enable row level security;
alter table public.wear_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.outfit_analyses enable row level security;
alter table public.follows enable row level security;
alter table public.user_looks enable row level security;
alter table public.look_comments enable row level security;
alter table public.look_likes enable row level security;
alter table public.mannequin_state enable row level security;
alter table public.weekly_challenges enable row level security;
alter table public.challenge_entries enable row level security;
alter table public.user_badges enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.outfit_feedback enable row level security;
alter table public.style_points enable row level security;
alter table public.spend_logs enable row level security;
alter table public.spend_summary enable row level security;
alter table public.ab_experiments enable row level security;
