-- ============================================================
-- PART 6: Functions + Triggers
-- Run this LAST (after 05)
-- ============================================================

-- Auto-create profile + free subscription on signup
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

-- Auto-update updated_at on any row update
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
    execute format('drop trigger if exists set_updated_at on public.%I;', tbl);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.update_updated_at();', tbl);
  end loop;
end $$;
