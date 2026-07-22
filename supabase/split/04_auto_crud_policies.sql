-- ============================================================
-- PART 4: Auto-generate SELECT + INSERT + UPDATE + DELETE
-- for every table that has a uuid user_id column.
-- Run this FOURTH (after Part 3)
-- ============================================================

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
        execute format('drop policy if exists "Users can view own %I" on public.%I;', tbl, tbl);
        execute format('create policy "Users can view own %I" on public.%I for select using (auth.uid() = user_id);', tbl, tbl);
        execute format('drop policy if exists "Users can insert own %I" on public.%I;', tbl, tbl);
        execute format('create policy "Users can insert own %I" on public.%I for insert with check (auth.uid() = user_id);', tbl, tbl);
        execute format('drop policy if exists "Users can update own %I" on public.%I;', tbl, tbl);
        execute format('create policy "Users can update own %I" on public.%I for update using (auth.uid() = user_id);', tbl, tbl);
        execute format('drop policy if exists "Users can delete own %I" on public.%I;', tbl, tbl);
        execute format('create policy "Users can delete own %I" on public.%I for delete using (auth.uid() = user_id);', tbl, tbl);
        raise notice 'Created 4 policies for: %', tbl;
      end if;
    end if;
  end loop;
end $$;
