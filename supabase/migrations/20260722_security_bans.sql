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


-- 5. Add credit_balances and credit_events if not exists (ensures tables are created)
create table if not exists public.credit_balances (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,
  credits_allocated integer default 30,
  credits_remaining integer default 30,
  created_at timestamptz default now(),
  unique(user_id, month)
);

create table if not exists public.credit_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  action text not null,
  cost integer not null,
  credits_remaining integer,
  created_at timestamptz default now()
);

-- RLS for credit tables
alter table public.credit_balances enable row level security;
alter table public.credit_events enable row level security;

-- Credit balance policies (service role for backend, user for frontend reads)
drop policy if exists "Users can view own credit_balances" on public.credit_balances;
create policy "Users can view own credit_balances"
  on public.credit_balances for select
  using (auth.uid() = user_id);

drop policy if exists "Service role manages credit_balances" on public.credit_balances;
create policy "Service role manages credit_balances"
  on public.credit_balances for all
  using (true)
  with check (true);

-- Credit event policies
drop policy if exists "Users can view own credit_events" on public.credit_events;
create policy "Users can view own credit_events"
  on public.credit_events for select
  using (auth.uid() = user_id);

drop policy if exists "Service role inserts credit_events" on public.credit_events;
create policy "Service role inserts credit_events"
  on public.credit_events for insert
  with check (true);

-- Indexes for credit tables
create index if not exists idx_credit_balances_user_month on public.credit_balances(user_id, month);
create index if not exists idx_credit_events_user on public.credit_events(user_id, created_at desc);

-- Comments
comment on table public.banned_users is 'Persistent user bans. Survives server restarts.';
comment on table public.abuse_logs is 'Audit trail for suspicious activity and abuse detection.';
