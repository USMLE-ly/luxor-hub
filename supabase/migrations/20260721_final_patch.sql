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
