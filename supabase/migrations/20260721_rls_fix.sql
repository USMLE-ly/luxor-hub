-- ============================================================
-- FIX: Only create user_id policies for tables that HAVE the column
-- ============================================================

do $$
declare
  tbl text;
  has_user_id boolean;
begin
  for tbl in select tablename from pg_tables 
    where schemaname = 'public' 
    and tablename not in (
      'weekly_challenges', 'newsletter_subscribers', 
      'profiles', 'follows', 'spend_summary', 'ab_experiments'
    )
  loop
    -- Check if table has user_id column
    select exists(
      select 1 from information_schema.columns 
      where table_schema = 'public' and table_name = tbl and column_name = 'user_id'
    ) into has_user_id;
    
    if has_user_id then
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
  end loop;
end $$;
