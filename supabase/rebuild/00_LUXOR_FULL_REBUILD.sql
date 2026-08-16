-- ============================================================================
-- LUXOR® — CONSOLIDATED SUPABASE REBUILD (idempotent, one-shot)
-- Source repo: https://github.com/USMLE-ly/luxor-hub  (analyzed via GitHub API)
-- Generated: 2026-08-16
--
-- WHAT THIS IS
--   The live Supabase project (zmqfcyweqllmupszbppd) was DELETED, which is the
--   root cause of the login failure ("Network error. Please check your
--   connection"). This script rebuilds the entire database schema from every
--   migration found in the repo, plus the objects that only existed in the
--   deleted project (reconstructed from frontend/backend usage — see PART I).
--
-- HOW TO RUN
--   1. Create a NEW Supabase project (or restore the old one).
--   2. Open Dashboard → SQL Editor → New query.
--   3. Paste this ENTIRE file and Run. Safe to re-run (idempotent).
--   4. After it succeeds, set the Vercel environment variables and redeploy:
--        VITE_SUPABASE_URL            = https://<your-new-ref>.supabase.co
--        VITE_SUPABASE_PUBLISHABLE_KEY = <new anon/publishable key>
--      (and the backend/Replit vars: SUPABASE_URL / SUPABASE_KEY / SUPABASE_SERVICE_KEY)
--
-- COMPOSITION (chronological merge of repo migrations)
--   PART A 20260711_full_migration_complete.sql  base schema: 30 tables + RLS + social + support + audit
--   PART B split/05_storage.sql                  closet-images storage bucket + policies
--   PART C 20260721_final_patch.sql              spend/feedback/points tables, generic CRUD policies, triggers
--   PART D 20260721_rls_policies.sql             final social RLS state (public reads)
--   PART D2 20260721_fix_clothing_rls.sql        restores clothing_items INSERT/UPDATE/DELETE
--   PART E 20260721_credit_system.sql            credit_balances/events, usage_patterns, referrals + functions
--   PART F 20260722_streak_system.sql            daily_streaks, bonus tiers + functions
--   PART G 20260722_security_bans.sql            banned_users, abuse_logs + functions (credit section omitted — see note)
--   PART H 20260706_confirm_existing_users.sql   backfill existing users (run before any new signups)
--   PART I LIVE-SCHEMA RECONSTRUCTION            objects lost with the deleted project (rebuilt from app usage)
--   PART J SECURITY HARDENING                    closes PUBLIC policies on admin tables (recommended)
--
-- OMITTED (superseded / conflicts, see notes in each part)
--   20260706_full_schema.sql / 20260721_full_schema.sql / 20260721_FULL_REBUILD.sql
--     → earlier divergent schema variants; 20260711_full_migration_complete.sql is the superset
--   20260721_rls_fix.sql → superseded by PART C's safer generic-policy loop (adds column-type check)
--   20260711_social_rls_fix.sql / 20260711_security_hardening.sql → already included in PART A
--   security_bans.sql credit section → conflicts with PART E (text vs uuid user_id); PART E wins
-- ============================================================================


-- ============================================================================
-- PART A — BASE SCHEMA (20260711_full_migration_complete.sql)
-- 30 tables: profiles, style_profiles, clothing_items, outfits, outfit_items,
-- calendar_events, wear_logs, chat_messages, council_conversations,
-- fashion_designs, notifications, follows, look_comments, look_likes,
-- user_looks, saved_looks, mood_boards, mood_board_items, subscriptions,
-- mannequin_state, weekly_challenges, challenge_entries, user_badges,
-- outfit_analyses, newsletter_subscribers, support_tickets, support_messages,
-- support_stats, audit_logs, security_alerts.
-- Includes: extensions, full RLS, social read policies, support system,
-- audit/security tables, signup + updated_at triggers.
-- ============================================================================

-- ============================================================
-- LEXOR® — COMPLETE Supabase Migration
-- Full schema + Social RLS + Support System + Security Hardening
-- Paste this ENTIRE script into Supabase SQL Editor → Run
-- ============================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  style_formula text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 2. STYLE PROFILES
-- ============================================================
create table if not exists public.style_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  archetype text,
  style_score integer default 0,
  style_formula text,
  onboarding_completed boolean default false,
  preferences jsonb default '{}',
  body_shape_data jsonb default '{}',
  face_shape_data jsonb default '{}',
  ai_analysis jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 3. CLOTHING ITEMS
-- ============================================================
create table if not exists public.clothing_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  category text,
  color text,
  brand text,
  style text,
  season text default 'all-season',
  occasion text,
  price numeric(10,2),
  photo_url text,
  notes text,
  wear_count integer default 0,
  last_worn_at timestamptz,
  is_public boolean default false,
  look_type text default 'item',
  badge_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_clothing_items_user on public.clothing_items(user_id);
create index if not exists idx_clothing_items_category on public.clothing_items(category);

-- ============================================================
-- 4. OUTFITS
-- ============================================================
create table if not exists public.outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  description text,
  occasion text,
  mood text,
  mannequin_items jsonb default '[]',
  ai_explanation text,
  ai_generated boolean default false,
  confidence_score numeric(5,2),
  is_favorite boolean default false,
  is_public boolean default false,
  look_type text default 'outfit',
  badge_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_outfits_user on public.outfits(user_id);

-- ============================================================
-- 5. OUTFIT ITEMS
-- ============================================================
create table if not exists public.outfit_items (
  id uuid default gen_random_uuid() primary key,
  outfit_id uuid references public.outfits(id) on delete cascade not null,
  clothing_item_id uuid references public.clothing_items(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null,
  look_type text default 'item',
  is_public boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_outfit_items_outfit on public.outfit_items(outfit_id);
create index if not exists idx_outfit_items_user on public.outfit_items(user_id);

-- ============================================================
-- 6. CALENDAR EVENTS
-- ============================================================
create table if not exists public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  event_date date not null,
  event_time time,
  occasion text,
  notes text,
  outfit_items jsonb default '[]',
  outfit_type text default 'regular',
  mannequin_image_url text,
  badge_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_calendar_events_user_date on public.calendar_events(user_id, event_date);

-- ============================================================
-- 7. WEAR LOGS
-- ============================================================
create table if not exists public.wear_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  clothing_item_id uuid references public.clothing_items(id) on delete cascade,
  worn_at date default current_date,
  category text,
  created_at timestamptz default now()
);
create index if not exists idx_wear_logs_user on public.wear_logs(user_id);
create index if not exists idx_wear_logs_date on public.wear_logs(worn_at);

-- ============================================================
-- 8. CHAT MESSAGES
-- ============================================================
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'user',
  content text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
create index if not exists idx_chat_messages_user on public.chat_messages(user_id);

-- ============================================================
-- 9. COUNCIL CONVERSATIONS
-- ============================================================
create table if not exists public.council_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  messages jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_council_user on public.council_conversations(user_id);

-- ============================================================
-- 10. FASHION DESIGNS
-- ============================================================
create table if not exists public.fashion_designs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt text,
  image_url text,
  description text,
  garment_type text,
  is_favorite boolean default false,
  is_public boolean default false,
  look_type text default 'design',
  look_id uuid,
  outfit_id uuid,
  created_at timestamptz default now()
);
create index if not exists idx_fashion_designs_user on public.fashion_designs(user_id);

-- ============================================================
-- 11. NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  actor_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('like','follow','design_like','design_comment')),
  reference_id uuid,
  read boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, read);

-- ============================================================
-- 12. FOLLOWS
-- ============================================================
create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);
create index if not exists idx_follows_follower on public.follows(follower_id);
create index if not exists idx_follows_following on public.follows(following_id);

-- ============================================================
-- 13. LOOK COMMENTS
-- ============================================================
create table if not exists public.look_comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  look_id uuid,
  look_type text,
  content text,
  is_public boolean default false,
  garment_type text,
  created_at timestamptz default now()
);

-- ============================================================
-- 14. LOOK LIKES
-- ============================================================
create table if not exists public.look_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  look_id uuid,
  look_type text,
  is_public boolean default false,
  garment_type text,
  outfit_id uuid,
  follower_id uuid,
  following_id uuid,
  created_at timestamptz default now()
);

-- ============================================================
-- 15. USER LOOKS
-- ============================================================
create table if not exists public.user_looks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  description text,
  photo_url text,
  occasion text,
  mood text,
  items jsonb default '[]',
  is_public boolean default false,
  look_type text default 'look',
  look_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 16. SAVED LOOKS
-- ============================================================
create table if not exists public.saved_looks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  look_id uuid,
  look_type text,
  is_public boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 17. MOOD BOARDS
-- ============================================================
create table if not exists public.mood_boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.mood_board_items (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references public.mood_boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  position_x numeric default 0,
  position_y numeric default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- 18. SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  plan_tier text not null default 'free',
  status text not null default 'active',
  paypal_subscription_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- 19. MANNEQUIN STATE
-- ============================================================
create table if not exists public.mannequin_state (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  gender text not null default 'male',
  dna jsonb not null default '{"height":0.5,"shoulder":0.5,"waist":0.5,"hips":0.5,"legLength":0.5}',
  pose text not null default 'neutral',
  tracing_url text,
  tracing_opacity real not null default 0.3,
  show_measurements boolean not null default false,
  clothing jsonb not null default '[]',
  updated_at timestamptz default now()
);

-- ============================================================
-- 20. WEEKLY CHALLENGES
-- ============================================================
create table if not exists public.weekly_challenges (
  id uuid default gen_random_uuid() primary key,
  title text,
  description text,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists public.challenge_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  challenge_id uuid references public.weekly_challenges(id) on delete cascade,
  analysis_id uuid,
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- 21. USER BADGES
-- ============================================================
create table if not exists public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_key text not null,
  badge_name text,
  badge_description text,
  badge_icon text,
  read boolean default false,
  awarded_at timestamptz default now()
);

-- ============================================================
-- 22. OUTFIT ANALYSES
-- ============================================================
create table if not exists public.outfit_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text,
  category text,
  color text,
  style text,
  detected_items jsonb default '[]',
  overall_style text,
  style_score integer default 0,
  color_palette jsonb default '[]',
  strengths jsonb default '[]',
  summary text,
  challenge_id uuid,
  created_at timestamptz default now()
);

-- ============================================================
-- 23. NEWSLETTER SUBSCRIBERS
-- ============================================================
create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now()
);

-- ============================================================
-- 24. SUPPORT TICKETS
-- ============================================================
create table if not exists public.support_tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text not null default '',
  category text not null default 'other',
  severity text not null default 'medium',
  status text not null default 'open',
  page_url text,
  browser_info text,
  ai_diagnosis jsonb default null,
  ai_fix_suggestion text default null,
  ai_confidence numeric(3,2) default null,
  resolved_at timestamptz default null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_support_tickets_user on public.support_tickets(user_id);
create index if not exists idx_support_tickets_status on public.support_tickets(status);
create index if not exists idx_support_tickets_created on public.support_tickets(created_at desc);

-- ============================================================
-- 25. SUPPORT MESSAGES
-- ============================================================
create table if not exists public.support_messages (
  id uuid default gen_random_uuid() primary key,
  ticket_id uuid references public.support_tickets(id) on delete cascade not null,
  sender text not null default 'user',
  message text not null,
  metadata jsonb default null,
  created_at timestamptz default now()
);
create index if not exists idx_support_messages_ticket on public.support_messages(ticket_id);
create index if not exists idx_support_messages_created on public.support_messages(created_at);

-- ============================================================
-- 26. SUPPORT STATS
-- ============================================================
create table if not exists public.support_stats (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date,
  total_tickets integer default 0,
  resolved integer default 0,
  escalated integer default 0,
  avg_confidence numeric(3,2) default 0,
  by_category jsonb default '{}',
  by_severity jsonb default '{}',
  created_at timestamptz default now()
);
create unique index if not exists idx_support_stats_date on public.support_stats(date);

-- ============================================================
-- 27. AUDIT LOGS (immutable)
-- ============================================================
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id text,
  metadata jsonb default '{}',
  page_url text,
  user_agent text,
  ip_address inet,
  created_at timestamptz default now()
);
create index if not exists idx_audit_logs_user on public.audit_logs(user_id);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_security on public.audit_logs(action, created_at desc) where action = 'security_incident';

-- ============================================================
-- 28. SECURITY ALERTS
-- ============================================================
create table if not exists public.security_alerts (
  id uuid default gen_random_uuid() primary key,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  event_type text not null,
  user_id uuid references auth.users(id) on delete set null,
  details text not null,
  metadata jsonb default '{}',
  resolved boolean default false,
  resolved_by uuid references auth.users(id),
  resolved_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_security_alerts_severity on public.security_alerts(severity, created_at desc);
create index if not exists idx_security_alerts_unresolved on public.security_alerts(resolved, created_at desc) where not resolved;

-- ============================================================
-- ROW LEVEL SECURITY — Enable on all tables
-- ============================================================
alter table public.profiles enable row level security;
alter table public.style_profiles enable row level security;
alter table public.clothing_items enable row level security;
alter table public.outfits enable row level security;
alter table public.outfit_items enable row level security;
alter table public.calendar_events enable row level security;
alter table public.wear_logs enable row level security;
alter table public.chat_messages enable row level security;
alter table public.council_conversations enable row level security;
alter table public.fashion_designs enable row level security;
alter table public.notifications enable row level security;
alter table public.follows enable row level security;
alter table public.look_comments enable row level security;
alter table public.look_likes enable row level security;
alter table public.user_looks enable row level security;
alter table public.saved_looks enable row level security;
alter table public.mood_boards enable row level security;
alter table public.mood_board_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.mannequin_state enable row level security;
alter table public.weekly_challenges enable row level security;
alter table public.challenge_entries enable row level security;
alter table public.user_badges enable row level security;
alter table public.outfit_analyses enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_stats enable row level security;
alter table public.audit_logs enable row level security;
alter table public.security_alerts enable row level security;

-- ============================================================
-- RLS POLICIES — Social + Owner Access
-- ============================================================

-- PROFILES: owner + all authenticated users can read
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Authenticated users can view public profiles" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Authenticated users can view public profiles" on public.profiles
  for select using (auth.role() = 'authenticated');

-- FOLLOWS: owner + see who follows you
drop policy if exists "Users can view own follows" on public.follows;
drop policy if exists "Users can insert own follows" on public.follows;
drop policy if exists "Users can delete own follows" on public.follows;
drop policy if exists "Users can see who follows them" on public.follows;
create policy "Users can view own follows" on public.follows
  for select using (auth.uid() = follower_id);
create policy "Users can insert own follows" on public.follows
  for insert with check (auth.uid() = follower_id);
create policy "Users can delete own follows" on public.follows
  for delete using (auth.uid() = follower_id);
create policy "Users can see who follows them" on public.follows
  for select using (auth.uid() = following_id);

-- USER_LOOKS: owner sees all, others see public
drop policy if exists "Users can view own user_looks" on public.user_looks;
drop policy if exists "Users can insert own user_looks" on public.user_looks;
drop policy if exists "Users can update own user_looks" on public.user_looks;
drop policy if exists "Users can delete own user_looks" on public.user_looks;
drop policy if exists "Authenticated users can view public looks" on public.user_looks;
create policy "Users can view own user_looks" on public.user_looks
  for select using (auth.uid() = user_id);
create policy "Users can insert own user_looks" on public.user_looks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own user_looks" on public.user_looks
  for update using (auth.uid() = user_id);
create policy "Users can delete own user_looks" on public.user_looks
  for delete using (auth.uid() = user_id);
create policy "Authenticated users can view public looks" on public.user_looks
  for select using (auth.role() = 'authenticated' and is_public = true);

-- LOOK_COMMENTS: owner + all authenticated
drop policy if exists "Users can view own look_comments" on public.look_comments;
drop policy if exists "Users can insert own look_comments" on public.look_comments;
drop policy if exists "Users can update own look_comments" on public.look_comments;
drop policy if exists "Users can delete own look_comments" on public.look_comments;
drop policy if exists "Authenticated users can view comments on public looks" on public.look_comments;
create policy "Users can view own look_comments" on public.look_comments
  for select using (auth.uid() = user_id);
create policy "Users can insert own look_comments" on public.look_comments
  for insert with check (auth.uid() = user_id);
create policy "Users can update own look_comments" on public.look_comments
  for update using (auth.uid() = user_id);
create policy "Users can delete own look_comments" on public.look_comments
  for delete using (auth.uid() = user_id);
create policy "Authenticated users can view comments on public looks" on public.look_comments
  for select using (auth.role() = 'authenticated');

-- LOOK_LIKES: owner + all authenticated
drop policy if exists "Users can view own look_likes" on public.look_likes;
drop policy if exists "Users can insert own look_likes" on public.look_likes;
drop policy if exists "Users can delete own look_likes" on public.look_likes;
drop policy if exists "Authenticated users can view look likes" on public.look_likes;
create policy "Users can view own look_likes" on public.look_likes
  for select using (auth.uid() = user_id);
create policy "Users can insert own look_likes" on public.look_likes
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own look_likes" on public.look_likes
  for delete using (auth.uid() = user_id);
create policy "Authenticated users can view look likes" on public.look_likes
  for select using (auth.role() = 'authenticated');

-- CLOTHING_ITEMS: owner sees all, others see public
drop policy if exists "Users can view own clothing_items" on public.clothing_items;
drop policy if exists "Users can insert own clothing_items" on public.clothing_items;
drop policy if exists "Users can update own clothing_items" on public.clothing_items;
drop policy if exists "Users can delete own clothing_items" on public.clothing_items;
drop policy if exists "Authenticated users can view public clothing items" on public.clothing_items;
create policy "Users can view own clothing_items" on public.clothing_items
  for select using (auth.uid() = user_id);
create policy "Users can insert own clothing_items" on public.clothing_items
  for insert with check (auth.uid() = user_id);
create policy "Users can update own clothing_items" on public.clothing_items
  for update using (auth.uid() = user_id);
create policy "Users can delete own clothing_items" on public.clothing_items
  for delete using (auth.uid() = user_id);
create policy "Authenticated users can view public clothing items" on public.clothing_items
  for select using (auth.role() = 'authenticated' and is_public = true);

-- OUTFITS: owner sees all, others see public
drop policy if exists "Users can view own outfits" on public.outfits;
drop policy if exists "Users can insert own outfits" on public.outfits;
drop policy if exists "Users can update own outfits" on public.outfits;
drop policy if exists "Users can delete own outfits" on public.outfits;
drop policy if exists "Authenticated users can view public outfits" on public.outfits;
create policy "Users can view own outfits" on public.outfits
  for select using (auth.uid() = user_id);
create policy "Users can insert own outfits" on public.outfits
  for insert with check (auth.uid() = user_id);
create policy "Users can update own outfits" on public.outfits
  for update using (auth.uid() = user_id);
create policy "Users can delete own outfits" on public.outfits
  for delete using (auth.uid() = user_id);
create policy "Authenticated users can view public outfits" on public.outfits
  for select using (auth.role() = 'authenticated' and is_public = true);

-- OWNER-ONLY TABLES (private data — no cross-user read)
do $$
declare
  tbl text;
begin
  for tbl in select unnest(ARRAY[
    'style_profiles', 'outfit_items', 'calendar_events', 'wear_logs',
    'chat_messages', 'council_conversations', 'fashion_designs',
    'notifications', 'saved_looks', 'mood_boards', 'mood_board_items',
    'subscriptions', 'mannequin_state', 'challenge_entries',
    'user_badges', 'outfit_analyses', 'support_tickets'
  ]::text[])
  loop
    execute format('
      drop policy if exists "Users can view own %I" on public.%I;
      create policy "Users can view own %I" on public.%I
        for select using (auth.uid() = user_id);
    ', tbl, tbl, tbl, tbl);
    execute format('
      drop policy if exists "Users can insert own %I" on public.%I;
      create policy "Users can insert own %I" on public.%I
        for insert with check (auth.uid() = user_id);
    ', tbl, tbl, tbl, tbl);
    execute format('
      drop policy if exists "Users can update own %I" on public.%I;
      create policy "Users can update own %I" on public.%I
        for update using (auth.uid() = user_id);
    ', tbl, tbl, tbl, tbl);
    execute format('
      drop policy if exists "Users can delete own %I" on public.%I;
      create policy "Users can delete own %I" on public.%I
        for delete using (auth.uid() = user_id);
    ', tbl, tbl, tbl, tbl);
  end loop;
end $$;

-- SUPPORT MESSAGES: owner via ticket ownership
drop policy if exists "Users read own ticket messages" on public.support_messages;
drop policy if exists "Users create messages on own tickets" on public.support_messages;
create policy "Users read own ticket messages" on public.support_messages
  for select using (
    exists (select 1 from public.support_tickets
      where support_tickets.id = support_messages.ticket_id
      and support_tickets.user_id = auth.uid())
  );
create policy "Users create messages on own tickets" on public.support_messages
  for insert with check (
    exists (select 1 from public.support_tickets
      where support_tickets.id = support_messages.ticket_id
      and support_tickets.user_id = auth.uid())
  );

-- SUPPORT STATS: admin only
drop policy if exists "Service role manages stats" on public.support_stats;
create policy "Service role manages stats" on public.support_stats
  for all using (true) with check (true);

-- AUDIT LOGS: owner can read own, service role inserts
drop policy if exists "Users read own audit logs" on public.audit_logs;
drop policy if exists "Service role inserts audit logs" on public.audit_logs;
create policy "Users read own audit logs" on public.audit_logs
  for select using (auth.uid() = user_id);
create policy "Service role inserts audit logs" on public.audit_logs
  for insert with check (true);

-- SECURITY ALERTS: admin only
drop policy if exists "Service role manages security alerts" on public.security_alerts;
create policy "Service role manages security alerts" on public.security_alerts
  for all using (true) with check (true);

-- NEWSLETTER: anyone can subscribe
drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);

-- WEEKLY CHALLENGES: authenticated can read
drop policy if exists "Authenticated users can view challenges" on public.weekly_challenges;
create policy "Authenticated users can view challenges" on public.weekly_challenges
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  insert into public.subscriptions (user_id, plan_tier, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function public.update_support_ticket_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists support_tickets_updated_at on public.support_tickets;
create trigger support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.update_support_ticket_timestamp();

-- ============================================================================
-- PART B — STORAGE (split/05_storage.sql)
-- closet-images public bucket + upload/read/delete policies.
-- The frontend (pages/Closet.tsx) uploads item photos here.
-- ============================================================================

-- ============================================================
-- PART 5: Storage Bucket + Policies
-- ============================================================

insert into storage.buckets (id, name, public)
values ('closet-images', 'closet-images', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users can upload closet images" on storage.objects;
create policy "Authenticated users can upload closet images"
  on storage.objects for insert
  with check (bucket_id = 'closet-images' and auth.role() = 'authenticated');

drop policy if exists "Anyone can view closet images" on storage.objects;
create policy "Anyone can view closet images"
  on storage.objects for select
  using (bucket_id = 'closet-images');

drop policy if exists "Users can delete own closet images" on storage.objects;
create policy "Users can delete own closet images"
  on storage.objects for delete
  using (bucket_id = 'closet-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- PART C — FINAL PATCH (20260721_final_patch.sql)
-- Adds spend_logs, spend_summary, ab_experiments, outfit_feedback, style_points.
-- Re-asserts core RLS policies, creates generic per-table CRUD policies
-- (only for uuid user_id columns — safer than the earlier rls_fix), and
-- installs updated_at triggers on every table that has an updated_at column.
-- ============================================================================

-- ============================================================
-- LUXOR® FINAL PATCH — Safe to run anytime
-- Covers: RLS policies, triggers, any missing tables
-- ============================================================

-- 1. Ensure all tables exist (CREATE IF NOT EXISTS — safe to re-run)
-- Tables from Batch 1 and 2 are already created.
-- This adds any that might be missing:

create table if not exists public.spend_logs (
  id serial primary key,
  user_id text not null,
  daily_count integer default 0,
  daily_tokens integer default 0,
  month_count integer default 0,
  month_tokens integer default 0,
  tier text default 'free',
  flushed_at timestamptz default now()
);

create table if not exists public.spend_summary (
  date text primary key,
  total_requests integer,
  total_tokens integer,
  total_users integer,
  estimated_cost_usd numeric,
  tier_breakdown jsonb,
  top_users jsonb,
  aggregated_at timestamptz
);

create table if not exists public.ab_experiments (
  id serial primary key,
  user_id text not null,
  experiment text not null,
  original_tier text,
  effective_tier text,
  observed_at timestamptz,
  metadata jsonb default '{}'
);

create table if not exists public.outfit_feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  outfit_id uuid,
  rating integer,
  feedback text,
  created_at timestamptz default now()
);

create table if not exists public.style_points (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  points integer default 0,
  reason text,
  created_at timestamptz default now()
);

-- 2. Enable RLS on all tables
do $$
declare
  tbl text;
begin
  for tbl in select tablename from pg_tables 
    where schemaname = 'public'
  loop
    execute format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
  end loop;
end $$;

-- 3. RLS Policies — PROFILES
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- 4. RLS Policies — FOLLOWS
drop policy if exists "Users can view own follows" on public.follows;
create policy "Users can view own follows" on public.follows
  for select using (auth.uid() = follower_id);
drop policy if exists "Users can insert own follows" on public.follows;
create policy "Users can insert own follows" on public.follows
  for insert with check (auth.uid() = follower_id);
drop policy if exists "Users can delete own follows" on public.follows;
create policy "Users can delete own follows" on public.follows
  for delete using (auth.uid() = follower_id);

-- 5. RLS Policies — NEWSLETTER
drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);

-- 6. RLS Policies — WEEKLY CHALLENGES
drop policy if exists "Authenticated users can view challenges" on public.weekly_challenges;
create policy "Authenticated users can view challenges" on public.weekly_challenges
  for select using (auth.role() = 'authenticated');

-- 7. Generic user_id policies (SAFE version — checks column exists AND is uuid)
do $$
declare
  tbl text;
  has_user_id boolean;
  col_type text;
begin
  for tbl in select tablename from pg_tables 
    where schemaname = 'public' 
    and tablename not in (
      'weekly_challenges', 'newsletter_subscribers', 
      'profiles', 'follows', 'spend_summary', 'ab_experiments',
      'spend_logs', 'pg_stat_statements'
    )
  loop
    select exists(
      select 1 from information_schema.columns 
      where table_schema = 'public' and table_name = tbl and column_name = 'user_id'
    ) into has_user_id;
    
    if has_user_id then
      select data_type into col_type
      from information_schema.columns 
      where table_schema = 'public' and table_name = tbl and column_name = 'user_id';
      
      if col_type = 'uuid' then
        execute format('
          drop policy if exists "Users can view own %I" on public.%I;
          create policy "Users can view own %I" on public.%I
            for select using (auth.uid() = user_id);
        ', tbl, tbl, tbl, tbl);
        execute format('
          drop policy if exists "Users can insert own %I" on public.%I;
          create policy "Users can insert own %I" on public.%I
            for insert with check (auth.uid() = user_id);
        ', tbl, tbl, tbl, tbl);
        execute format('
          drop policy if exists "Users can update own %I" on public.%I;
          create policy "Users can update own %I" on public.%I
            for update using (auth.uid() = user_id);
        ', tbl, tbl, tbl, tbl);
        execute format('
          drop policy if exists "Users can delete own %I" on public.%I;
          create policy "Users can delete own %I" on public.%I
            for delete using (auth.uid() = user_id);
        ', tbl, tbl, tbl, tbl);
      end if;
    end if;
  end loop;
end $$;

-- 8. TRIGGER: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  insert into public.subscriptions (user_id, plan_tier, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 9. TRIGGER: auto-update updated_at timestamps
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  tbl text;
begin
  for tbl in select tablename from pg_tables 
    where schemaname = 'public' 
    and exists (select 1 from information_schema.columns 
                where table_schema = 'public' and table_name = tablename and column_name = 'updated_at')
  loop
    execute format('
      drop trigger if exists set_updated_at on public.%I;
      create trigger set_updated_at before update on public.%I
        for each row execute function public.update_updated_at();
    ', tbl, tbl);
  end loop;
end $$;

-- ============================================================================
-- PART D — FINAL SOCIAL RLS STATE (20260721_rls_policies.sql)
-- Recreates the cross-user READ policies for profiles/user_looks/look_comments/
-- look_likes/clothing_items/outfits/follows. (SELECT-only; CRUD preserved.)
-- ============================================================================

-- ============================================================
-- LUXOR® Row-Level Security Policies
-- Run this in Supabase SQL Editor
-- Created: 2026-07-21
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view public profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── User Looks ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own user_looks" ON public.user_looks;
DROP POLICY IF EXISTS "Authenticated users can view public looks" ON public.user_looks;

CREATE POLICY "Users can view own user_looks"
  ON public.user_looks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view public looks"
  ON public.user_looks FOR SELECT
  USING (auth.role() = 'authenticated' AND is_public = true);

-- ── Look Comments ───────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own look_comments" ON public.look_comments;
DROP POLICY IF EXISTS "Authenticated users can view comments on public looks" ON public.look_comments;

CREATE POLICY "Users can view own look_comments"
  ON public.look_comments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view comments on public looks"
  ON public.look_comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Look Likes ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own look_likes" ON public.look_likes;
DROP POLICY IF EXISTS "Authenticated users can view look likes" ON public.look_likes;

CREATE POLICY "Users can view own look_likes"
  ON public.look_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view look likes"
  ON public.look_likes FOR SELECT
  USING (auth.role() = 'authenticated');

-- ── Clothing Items ──────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own clothing_items" ON public.clothing_items;
DROP POLICY IF EXISTS "Authenticated users can view public clothing items" ON public.clothing_items;

CREATE POLICY "Users can view own clothing_items"
  ON public.clothing_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view public clothing items"
  ON public.clothing_items FOR SELECT
  USING (auth.role() = 'authenticated' AND is_public = true);

-- ── Outfits ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view own outfits" ON public.outfits;
DROP POLICY IF EXISTS "Authenticated users can view public outfits" ON public.outfits;

CREATE POLICY "Users can view own outfits"
  ON public.outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view public outfits"
  ON public.outfits FOR SELECT
  USING (auth.role() = 'authenticated' AND is_public = true);

-- ── Follows ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can see who follows them" ON public.follows;

CREATE POLICY "Users can see who follows them"
  ON public.follows FOR SELECT
  USING (auth.uid() = following_id);

-- ============================================================================
-- PART D2 — CLOTHING RLS RESTORE (20260721_fix_clothing_rls.sql)
-- Restores INSERT/UPDATE/DELETE on clothing_items after PART D.
-- ============================================================================

-- ============================================================
-- FIX: Restore INSERT/UPDATE/DELETE policies for clothing_items
-- The 20260721_rls_policies.sql migration accidentally dropped
-- these policies and only recreated SELECT policies.
-- ============================================================

-- Clothing Items — INSERT
DROP POLICY IF EXISTS "Users can insert own clothing_items" ON public.clothing_items;
CREATE POLICY "Users can insert own clothing_items"
  ON public.clothing_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Clothing Items — UPDATE
DROP POLICY IF EXISTS "Users can update own clothing_items" ON public.clothing_items;
CREATE POLICY "Users can update own clothing_items"
  ON public.clothing_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Clothing Items — DELETE
DROP POLICY IF EXISTS "Users can delete own clothing_items" ON public.clothing_items;
CREATE POLICY "Users can delete own clothing_items"
  ON public.clothing_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PART E — CREDIT SYSTEM (20260721_credit_system.sql)
-- credit_balances (TEXT user_id — matches backend/credits.py + streak claims),
-- credit_events, usage_patterns, referrals + functions:
-- handle_new_user_credits (signup trigger), reset_monthly_credits,
-- consume_credits (atomic), rollover_credits, award_referral_bonus.
-- ============================================================================

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

-- ============================================================
-- #18: Usage pattern analysis table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.usage_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  tier TEXT,
  credits_remaining INTEGER,
  response_time_ms INTEGER,
  success BOOLEAN DEFAULT TRUE,
  error_type TEXT,
  session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_usage_patterns_action_date ON public.usage_patterns(action, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_tier ON public.usage_patterns(tier, action);

ALTER TABLE public.usage_patterns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage_patterns" ON public.usage_patterns;
CREATE POLICY "Users can view own usage_patterns" ON public.usage_patterns
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Service can insert usage_patterns" ON public.usage_patterns;
CREATE POLICY "Service can insert usage_patterns" ON public.usage_patterns
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- #12: Referral bonus system
-- ============================================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id TEXT NOT NULL,
  referred_id TEXT NOT NULL,
  bonus_credits INTEGER DEFAULT 20,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
CREATE POLICY "Users can view own referrals" ON public.referrals
  FOR SELECT USING (auth.uid()::text = referrer_id);

DROP POLICY IF EXISTS "Users can insert referrals" ON public.referrals;
CREATE POLICY "Users can insert referrals" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid()::text = referrer_id);

-- Award referral bonus function
CREATE OR REPLACE FUNCTION public.award_referral_bonus(p_referrer_id TEXT, p_referred_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_bonus INTEGER := 20;
  v_current_month TEXT;
  v_existing RECORD;
BEGIN
  v_current_month := to_char(now(), 'YYYY-MM');

  -- Check if already referred
  IF EXISTS (SELECT 1 FROM public.referrals WHERE referred_id = p_referred_id) THEN
    RETURN FALSE;
  END IF;

  -- Record referral
  INSERT INTO public.referrals (referrer_id, referred_id, bonus_credits, status)
  VALUES (p_referrer_id, p_referred_id, v_bonus, 'completed');

  -- Add credits to referrer
  SELECT * INTO v_existing
  FROM public.credit_balances
  WHERE user_id = p_referrer_id AND month = v_current_month;

  IF FOUND THEN
    UPDATE public.credit_balances
    SET credits_remaining = credits_remaining + v_bonus
    WHERE id = v_existing.id;
  ELSE
    INSERT INTO public.credit_balances (user_id, month, credits_allocated, credits_remaining)
    VALUES (p_referrer_id, v_current_month, 30, 30 + v_bonus);
  END IF;

  -- Log event
  INSERT INTO public.credit_events (user_id, action, cost, credits_remaining, created_at)
  VALUES (p_referrer_id, 'reward_referral', -v_bonus, (SELECT credits_remaining FROM public.credit_balances WHERE user_id = p_referrer_id AND month = v_current_month), now());

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- PART F — STREAK SYSTEM (20260722_streak_system.sql)
-- daily_streaks, streak_bonus_tiers (seeded), streak_bonus_claims +
-- record_daily_login, claim_streak_bonus, get_streak_info.
-- Used only by backend/streak.py (service role).
-- ============================================================================

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

-- ============================================================================
-- PART G — SECURITY / BANS (20260722_security_bans.sql, credit section omitted)
-- banned_users + abuse_logs + is_user_banned() + expire_old_bans().
-- NOTE: the original file also re-created credit_balances/credit_events with a
-- UUID user_id, which would CONFLICT with PART E (text user_id) and break the
-- policy creation (uuid = text comparison error). PART E is authoritative.
-- ============================================================================

-- ============================================================
-- Luxor Hub — Persistent User Ban System
-- Survives server restarts (in-memory bans reset on restart)
-- ============================================================

-- 1. BANNED USERS TABLE
create table if not exists public.banned_users (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  reason text not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  banned_by uuid references auth.users(id),  -- admin who banned (null = auto-ban)
  expires_at timestamptz,  -- null = permanent ban
  created_at timestamptz default now(),
  unique(user_id)  -- one active ban per user
);

create index if not exists idx_banned_users_user on public.banned_users(user_id);
create index if not exists idx_banned_users_expires on public.banned_users(expires_at) where expires_at is not null;

alter table public.banned_users enable row level security;

-- Only service role can manage bans (prevents self-unbanning)
-- Drop the generic per-user CRUD policies that PART C's loop created on ADMIN tables.
-- These tables must NOT be user-manageable:
--   banned_users    -> a banned user could delete their own ban row (self-unban)
--   abuse_logs      -> a user could erase their own abuse evidence
--   audit_logs      -> breaks the "immutable" audit trail (no update/delete allowed)
--   security_alerts -> a user could hide their own alerts
--   support_stats   -> admin-only aggregate stats
do $$
declare
  tbl text;
  pol text;
begin
  foreach tbl in array ARRAY['banned_users','abuse_logs','audit_logs','security_alerts','support_stats']
  loop
    foreach pol in array ARRAY['Users can view own ','Users can insert own ','Users can update own ','Users can delete own ']
    loop
      execute format('drop policy if exists "%s%s" on public.%I', pol, tbl, tbl);
    end loop;
  end loop;
end $$;

drop policy if exists "Service role manages bans" on public.banned_users;
create policy "Service role manages bans"
  on public.banned_users for all
  using (true)
  with check (true);


-- 2. ABUSE LOG TABLE (persistent audit trail for suspicious activity)
create table if not exists public.abuse_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  ip_address inet,
  activity_type text not null,
  details text,
  abuse_score numeric(5,1) default 0,
  action_taken text,  -- 'logged', 'warned', 'banned'
  created_at timestamptz default now()
);

create index if not exists idx_abuse_logs_user on public.abuse_logs(user_id);
create index if not exists idx_abuse_logs_type on public.abuse_logs(activity_type);
create index if not exists idx_abuse_logs_ip on public.abuse_logs(ip_address);
create index if not exists idx_abuse_logs_created on public.abuse_logs(created_at desc);

alter table public.abuse_logs enable row level security;

-- Only service role can insert/query abuse logs
drop policy if exists "Service role manages abuse logs" on public.abuse_logs;
create policy "Service role manages abuse logs"
  on public.abuse_logs for all
  using (true)
  with check (true);


-- 3. HELPER FUNCTION: Check if user is banned
create or replace function public.is_user_banned(p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.banned_users
    where user_id = p_user_id
    and (expires_at is null or expires_at > now())
  );
$$;


-- 4. HELPER FUNCTION: Auto-expire old bans
create or replace function public.expire_old_bans()
returns void
language sql
security definer
as $$
  delete from public.banned_users
  where expires_at is not null and expires_at < now();
$$;


-- Comments
comment on table public.banned_users is 'Persistent user bans. Survives server restarts.';

-- ============================================================================
-- PART H — CONFIRM EXISTING USERS + BACKFILL (20260706_confirm_existing_users.sql)
-- Retro-confirms email signups and creates style_profiles rows. Run after the
-- schema above, before or right after new signups start.
-- ============================================================================

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

-- ============================================================================
-- PART I — LIVE-SCHEMA RECONSTRUCTION
-- The following objects were present in the LIVE project (zmqfcyweqllmupszbppd)
-- but were NEVER part of any repo migration — they were created directly in the
-- Supabase dashboard. The deleted project was their only copy. These were
-- reconstructed from how the frontend/backend actually use them.
-- ============================================================================

-- I.1 profiles.user_id
-- The frontend reads/updates profiles by "user_id" everywhere
-- (Settings.tsx, Dashboard.tsx, SocialFeed.tsx, WeeklyChallenge.tsx, ...)
-- but the migrated table only has "id". The live DB had both (user_id = id).
alter table public.profiles add column if not exists user_id uuid;
update public.profiles set user_id = id where user_id is null;
create index if not exists idx_profiles_user_id on public.profiles(user_id);

-- Keep user_id populated for future signups (override the PART A trigger):
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, user_id, display_name)
  values (new.id, new.id, new.raw_user_meta_data->>'display_name');
  insert into public.subscriptions (user_id, plan_tier, status)
  values (new.id, 'free', 'active');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- I.2 weekly_challenges.week_start
-- pages/WeeklyChallenge.tsx orders by week_start and filters analyses with
-- gte(created_at, week_start). The live DB had this column.
alter table public.weekly_challenges add column if not exists week_start timestamptz;
update public.weekly_challenges
set week_start = date_trunc('week', created_at)
where week_start is null;

-- I.3 challenge_entries.score
-- pages/WeeklyChallenge.tsx orders entries by score and renders Number(e.score).
alter table public.challenge_entries add column if not exists score numeric(5,2);

-- I.4 user_looks.author_name
-- SocialFeed.tsx uses l.author_name (falls back to a profiles map if null).
-- Matches the generated types (integrations/supabase/types.ts).
alter table public.user_looks add column if not exists author_name text;

-- I.5 get_or_create_current_challenge()
-- pages/WeeklyChallenge.tsx calls supabase.rpc('get_or_create_current_challenge')
-- with NO arguments and expects a challenge id string back. The original
-- function body lived only in the deleted project; reconstructed here:
-- returns the current week's challenge, creating one if none exists yet.
create or replace function public.get_or_create_current_challenge()
returns text
language plpgsql security definer
as $$
declare
  v_challenge_id uuid;
begin
  select id into v_challenge_id
  from public.weekly_challenges
  where week_start is not null
    and week_start <= now()
    and (week_start + interval '7 days') > now()
  order by week_start desc
  limit 1;

  if v_challenge_id is null then
    insert into public.weekly_challenges (title, description, week_start, start_date, end_date)
    values ('Weekly Challenge', 'Complete this week''s style challenge', date_trunc('week', now()), current_date, current_date + 6)
    returning id into v_challenge_id;
  end if;

  return v_challenge_id::text;
end;
$$;

-- ============================================================================
-- PART J — SECURITY HARDENING (recommended)
-- The original migrations created several "admin-only" policies WITHOUT a role,
-- e.g. FOR ALL USING (true) WITH CHECK (true). In Postgres, a policy with no
-- TO <role> clause applies to PUBLIC — i.e. ANY anonymous or logged-in visitor
-- could read/write banned_users, abuse_logs, security_alerts, support_stats,
-- audit_logs, or insert fake daily_streaks/usage_patterns rows.
-- The backend uses the service_role key, which bypasses RLS entirely, so these
-- policies were never needed for it. This section closes the public hole while
-- keeping the backend fully functional. (Deviation from repo SQL — intentional.)
-- ============================================================================

drop policy if exists "Service role manages bans" on public.banned_users;
create policy "Service role manages bans" on public.banned_users
  for all to service_role using (true) with check (true);

drop policy if exists "Service role manages abuse logs" on public.abuse_logs;
create policy "Service role manages abuse logs" on public.abuse_logs
  for all to service_role using (true) with check (true);

drop policy if exists "Service role manages stats" on public.support_stats;
create policy "Service role manages stats" on public.support_stats
  for all to service_role using (true) with check (true);

drop policy if exists "Service role manages security alerts" on public.security_alerts;
create policy "Service role manages security alerts" on public.security_alerts
  for all to service_role using (true) with check (true);

drop policy if exists "Service role inserts audit logs" on public.audit_logs;
create policy "Service role inserts audit logs" on public.audit_logs
  for insert to service_role with check (true);

drop policy if exists "Service can insert daily_streaks" on public.daily_streaks;
create policy "Service can insert daily_streaks" on public.daily_streaks
  for insert to service_role with check (true);

drop policy if exists "Service can insert usage_patterns" on public.usage_patterns;
create policy "Service can insert usage_patterns" on public.usage_patterns
  for insert to service_role with check (true);

-- Restrict the credit/streak RPCs to service_role. They take an arbitrary
-- p_user_id, so leaving them PUBLIC-executable would let any user award
-- themselves credits. The frontend never calls them; backend/gateway.py,
-- backend/streak.py, backend/credits.py do (with the service role key).
revoke execute on function public.record_daily_login(text) from public;
revoke execute on function public.get_streak_info(text) from public;
revoke execute on function public.claim_streak_bonus(text, integer) from public;
revoke execute on function public.consume_credits(text, text, integer) from public;
revoke execute on function public.reset_monthly_credits(text, text) from public;
revoke execute on function public.rollover_credits(text) from public;
revoke execute on function public.award_referral_bonus(text, text) from public;
grant execute on function public.record_daily_login(text) to service_role;
grant execute on function public.get_streak_info(text) to service_role;
grant execute on function public.claim_streak_bonus(text, integer) to service_role;
grant execute on function public.consume_credits(text, text, integer) to service_role;
grant execute on function public.reset_monthly_credits(text, text) to service_role;
grant execute on function public.rollover_credits(text) to service_role;
grant execute on function public.award_referral_bonus(text, text) to service_role;

-- ============================================================================
-- END OF REBUILD SCRIPT
-- After running: verify with:
--   select count(*) from pg_tables where schemaname = 'public';
-- Then set Vercel env VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY and redeploy.
-- ============================================================================
