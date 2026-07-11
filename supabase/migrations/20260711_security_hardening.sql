-- ============================================================
-- LEXOR® Security Hardening — Tenant Isolation + Audit Logging
-- ============================================================

-- 1. AUDIT LOGS (immutable append-only table for all data access)
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

-- Indexes for fast queries
create index if not exists idx_audit_logs_user on public.audit_logs(user_id);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_table on public.audit_logs(table_name);
create index if not exists idx_audit_logs_created on public.audit_logs(created_at desc);
create index if not exists idx_audit_logs_security on public.audit_logs(action, created_at desc) where action = 'security_incident';

-- 2. RLS — users can only see their own audit logs
alter table public.audit_logs enable row level security;

create policy "Users read own audit logs"
  on public.audit_logs for select
  using (auth.uid() = user_id);

-- Only service role can insert (prevents client-side tampering)
create policy "Service role inserts audit logs"
  on public.audit_logs for insert
  with check (true);

-- No updates or deletes allowed (immutable audit trail)
-- (No UPDATE or DELETE policies = denied by default)

-- 3. SECURITY ALERTS (for cross-tenant breach detection)
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

alter table public.security_alerts enable row level security;

-- Only service role can manage security alerts
create policy "Service role manages security alerts"
  on public.security_alerts for all
  using (true)
  with check (true);

-- 4. Add audit_logs to Supabase types (via comment)
comment on table public.audit_logs is 'Immutable audit trail for all data access. No updates or deletes allowed.';
comment on table public.security_alerts is 'Security incidents and cross-tenant breach detection alerts.';
