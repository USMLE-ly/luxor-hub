-- ============================================================
-- LUXOR® FULL SUPABASE SCHEMA + RLS POLICIES
-- Run this ONE file in Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Tables ─────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  avatar_url text,
  style_formula text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

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

create table if not exists public.wear_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  clothing_item_id uuid references public.clothing_items(id) on delete set null,
  outfit_id uuid references public.outfits(id) on delete set null,
  worn_date date default current_date,
  occasion text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_tier text default 'free',
  status text default 'active',
  paypal_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.outfit_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text,
  analysis_result jsonb default '{}',
  style_score integer,
  source text default 'cipher_vision',
  created_at timestamptz default now()
);

create table if not exists public.follows (
  id uuid default gen_random_uuid() primary key,
  follower_id uuid references auth.users(id) on delete cascade not null,
  following_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

create table if not exists public.user_looks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text,
  description text,
  items jsonb default '[]',
  mannequin_image_url text,
  is_public boolean default false,
  badge_key text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_user_looks_user on public.user_looks(user_id);

create table if not exists public.look_comments (
  id uuid default gen_random_uuid() primary key,
  look_id uuid references public.user_looks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text,
  created_at timestamptz default now()
);

create table if not exists public.look_likes (
  id uuid default gen_random_uuid() primary key,
  look_id uuid references public.user_looks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(look_id, user_id)
);

create table if not exists public.mannequin_state (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  gender text default 'female',
  dna jsonb default '{}',
  pose text default 'neutral',
  selected jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.weekly_challenges (
  id uuid default gen_random_uuid() primary key,
  title text,
  description text,
  theme text,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists public.challenge_entries (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references public.weekly_challenges(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  outfit_items jsonb default '[]',
  votes integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_key text,
  earned_at timestamptz default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
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

create table if not exists public.spend_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  action text,
  credits integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.spend_summary (
  user_id uuid references auth.users(id) on delete cascade primary key,
  total_credits integer default 0,
  last_action text,
  updated_at timestamptz default now()
);

create table if not exists public.ab_experiments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  experiment_name text,
  variant text,
  created_at timestamptz default now()
);

-- ── Enable RLS on ALL tables ───────────────────────────────

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

-- ── RLS Policies ───────────────────────────────────────────

-- Profiles
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Follows
drop policy if exists "Users can view own follows" on public.follows;
create policy "Users can view own follows" on public.follows
  for select using (auth.uid() = follower_id);
drop policy if exists "Users can insert own follows" on public.follows;
create policy "Users can insert own follows" on public.follows
  for insert with check (auth.uid() = follower_id);
drop policy if exists "Users can delete own follows" on public.follows;
create policy "Users can delete own follows" on public.follows
  for delete using (auth.uid() = follower_id);

-- Newsletter
drop policy if exists "Anyone can subscribe" on public.newsletter_subscribers;
create policy "Anyone can subscribe" on public.newsletter_subscribers
  for insert with check (true);

-- Weekly challenges
drop policy if exists "Authenticated users can view challenges" on public.weekly_challenges;
create policy "Authenticated users can view challenges" on public.weekly_challenges
  for select using (auth.role() = 'authenticated');

-- User Looks (public read for authenticated users)
drop policy if exists "Authenticated users can view public looks" on public.user_looks;
create policy "Authenticated users can view public looks" on public.user_looks
  for select using (auth.role() = 'authenticated' AND is_public = true);
drop policy if exists "Authenticated users can view public look comments" on public.look_comments;
create policy "Authenticated users can view public look comments" on public.look_comments
  for select using (auth.role() = 'authenticated');
drop policy if exists "Authenticated users can view public look likes" on public.look_likes;
create policy "Authenticated users can view public look likes" on public.look_likes
  for select using (auth.role() = 'authenticated');

-- ── Generic CRUD policies for ALL tables with uuid user_id ──
-- This creates SELECT + INSERT + UPDATE + DELETE for every table
-- that has a uuid user_id column.

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
      'spend_logs', 'user_looks', 'look_comments', 'look_likes'
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
        -- SELECT
        execute format('
          drop policy if exists "Users can view own %I" on public.%I;
          create policy "Users can view own %I" on public.%I
            for select using (auth.uid() = user_id);
        ', tbl, tbl, tbl, tbl);
        -- INSERT
        execute format('
          drop policy if exists "Users can insert own %I" on public.%I;
          create policy "Users can insert own %I" on public.%I
            for insert with check (auth.uid() = user_id);
        ', tbl, tbl, tbl, tbl);
        -- UPDATE
        execute format('
          drop policy if exists "Users can update own %I" on public.%I;
          create policy "Users can update own %I" on public.%I
            for update using (auth.uid() = user_id);
        ', tbl, tbl, tbl, tbl);
        -- DELETE
        execute format('
          drop policy if exists "Users can delete own %I" on public.%I;
          create policy "Users can delete own %I" on public.%I
            for delete using (auth.uid() = user_id);
        ', tbl, tbl, tbl, tbl);
      end if;
    end if;
  end loop;
end $$;

-- ── Storage bucket for closet images ───────────────────────

insert into storage.buckets (id, name, public)
values ('closet-images', 'closet-images', true)
on conflict (id) do nothing;

-- Allow authenticated users to upload to closet-images
drop policy if exists "Authenticated users can upload closet images" on storage.objects;
create policy "Authenticated users can upload closet images"
  on storage.objects for insert
  with check (bucket_id = 'closet-images' and auth.role() = 'authenticated');

-- Allow anyone to view closet images (public bucket)
drop policy if exists "Anyone can view closet images" on storage.objects;
create policy "Anyone can view closet images"
  on storage.objects for select
  using (bucket_id = 'closet-images');

-- Allow users to delete their own closet images
drop policy if exists "Users can delete own closet images" on storage.objects;
create policy "Users can delete own closet images"
  on storage.objects for delete
  using (bucket_id = 'closet-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- ── Functions ──────────────────────────────────────────────

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

-- ── Done ───────────────────────────────────────────────────
