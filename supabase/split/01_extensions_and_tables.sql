-- ============================================================
-- PART 1: Extensions + Tables
-- Run this FIRST
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text, avatar_url text, style_formula text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.style_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  archetype text, style_score integer default 0, style_formula text,
  onboarding_completed boolean default false, preferences jsonb default '{}',
  body_shape_data jsonb default '{}', face_shape_data jsonb default '{}',
  ai_analysis jsonb default '{}',
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.clothing_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text, category text, color text, brand text, style text,
  season text default 'all-season', occasion text, price numeric(10,2),
  photo_url text, notes text, wear_count integer default 0,
  last_worn_at timestamptz, is_public boolean default false,
  look_type text default 'item', badge_key text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists idx_clothing_items_user on public.clothing_items(user_id);
create index if not exists idx_clothing_items_category on public.clothing_items(category);

create table if not exists public.outfits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text, description text, occasion text, mood text,
  mannequin_items jsonb default '[]', ai_explanation text,
  ai_generated boolean default false, confidence_score numeric(5,2),
  is_favorite boolean default false, is_public boolean default false,
  look_type text default 'outfit', badge_key text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists idx_outfits_user on public.outfits(user_id);

create table if not exists public.outfit_items (
  id uuid default gen_random_uuid() primary key,
  outfit_id uuid references public.outfits(id) on delete cascade not null,
  clothing_item_id uuid references public.clothing_items(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade not null,
  look_type text default 'item', is_public boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_outfit_items_outfit on public.outfit_items(outfit_id);

create table if not exists public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null, event_date date not null, event_time time,
  occasion text, notes text, outfit_items jsonb default '[]',
  outfit_type text default 'regular', mannequin_image_url text, badge_key text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists idx_calendar_events_user_date on public.calendar_events(user_id, event_date);

create table if not exists public.wear_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  clothing_item_id uuid references public.clothing_items(id) on delete set null,
  outfit_id uuid references public.outfits(id) on delete set null,
  worn_date date default current_date, occasion text, notes text,
  created_at timestamptz default now()
);

create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_tier text default 'free', status text default 'active',
  paypal_subscription_id text, current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.outfit_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text, analysis_result jsonb default '{}',
  style_score integer, source text default 'cipher_vision',
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
  title text, description text, items jsonb default '[]',
  mannequin_image_url text, is_public boolean default false, badge_key text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create index if not exists idx_user_looks_user on public.user_looks(user_id);

create table if not exists public.look_comments (
  id uuid default gen_random_uuid() primary key,
  look_id uuid references public.user_looks(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text, created_at timestamptz default now()
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
  gender text default 'female', dna jsonb default '{}',
  pose text default 'neutral', selected jsonb default '{}',
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists public.weekly_challenges (
  id uuid default gen_random_uuid() primary key,
  title text, description text, theme text,
  start_date date, end_date date, created_at timestamptz default now()
);

create table if not exists public.challenge_entries (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references public.weekly_challenges(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade not null,
  outfit_items jsonb default '[]', votes integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  badge_key text, earned_at timestamptz default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null, created_at timestamptz default now()
);

create table if not exists public.outfit_feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  outfit_id uuid, rating integer, feedback text,
  created_at timestamptz default now()
);

create table if not exists public.style_points (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  points integer default 0, reason text, created_at timestamptz default now()
);

create table if not exists public.spend_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  action text, credits integer default 0, created_at timestamptz default now()
);

create table if not exists public.spend_summary (
  user_id uuid references auth.users(id) on delete cascade primary key,
  total_credits integer default 0, last_action text,
  updated_at timestamptz default now()
);

create table if not exists public.ab_experiments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  experiment_name text, variant text, created_at timestamptz default now()
);
