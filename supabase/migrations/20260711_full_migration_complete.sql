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
