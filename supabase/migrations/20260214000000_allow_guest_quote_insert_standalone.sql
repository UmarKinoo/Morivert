-- Run this in Supabase Dashboard > SQL Editor if guests get:
-- "new row violates row-level security policy for table quotes"
-- (Allows anonymous users to submit quotes with user_id = null.)

drop policy if exists "Guests can submit quotes" on public.quotes;
create policy "Guests can submit quotes"
  on public.quotes
  for insert
  to anon
  with check (user_id is null);
