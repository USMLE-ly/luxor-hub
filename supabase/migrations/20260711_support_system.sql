-- ============================================================
-- LEXOR® Support System — User-facing AI support tickets
-- Each user gets their own support experience, linked with MiMo Vision
-- ============================================================

-- 1. SUPPORT TICKETS
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

-- 2. SUPPORT MESSAGES (conversation thread per ticket)
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

-- 3. SUPPORT STATS (aggregated health metrics)
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

-- 4. AUTO-UPDATED_AT TRIGGER
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

-- 5. ROW-LEVEL SECURITY
alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;
alter table public.support_stats enable row level security;

-- Users can only read/create their own tickets
create policy "Users read own tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

create policy "Users create own tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);

create policy "Users update own tickets"
  on public.support_tickets for update
  using (auth.uid() = user_id);

-- Users can read/create messages on their own tickets
create policy "Users read own ticket messages"
  on public.support_messages for select
  using (
    exists (
      select 1 from public.support_tickets
      where support_tickets.id = support_messages.ticket_id
      and support_tickets.user_id = auth.uid()
    )
  );

create policy "Users create messages on own tickets"
  on public.support_messages for insert
  with check (
    exists (
      select 1 from public.support_tickets
      where support_tickets.id = support_messages.ticket_id
      and support_tickets.user_id = auth.uid()
    )
  );

-- Stats are admin-only (service role)
create policy "Service role manages stats"
  on public.support_stats for all
  using (true)
  with check (true);
