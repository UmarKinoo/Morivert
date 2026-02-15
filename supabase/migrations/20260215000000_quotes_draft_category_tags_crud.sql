-- Quotes: draft status, category/tags, user update/delete
-- Run in Supabase Dashboard > SQL Editor if using hosted project.

-- 1. Allow 'draft' in status
alter table public.quotes drop constraint if exists quotes_status_check;
alter table public.quotes add constraint quotes_status_check
  check (status in ('draft', 'new', 'in_progress', 'completed', 'cancelled'));

-- 2. Optional category and tags
alter table public.quotes add column if not exists category text default null;
alter table public.quotes add column if not exists tags text[] default null;
comment on column public.quotes.category is 'Optional category e.g. Corporate, Event, Retail';
comment on column public.quotes.tags is 'Optional tags for filtering';

-- 3. Users can update their own quotes (e.g. draft -> submit, or edit draft)
drop policy if exists "Users can update their own quotes" on public.quotes;
create policy "Users can update their own quotes"
  on public.quotes
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Users can delete their own quotes
drop policy if exists "Users can delete their own quotes" on public.quotes;
create policy "Users can delete their own quotes"
  on public.quotes
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 5. Admin can delete any quote
drop policy if exists "Admin can delete all quotes" on public.quotes;
create policy "Admin can delete all quotes"
  on public.quotes
  for delete
  to authenticated
  using (public.is_admin());

-- 6. Allow authenticated users to insert drafts (user_id set)
-- Existing "Users can submit their own quotes" already allows insert with auth.uid() = user_id.
-- For drafts we use the same policy (user_id = auth.uid()).

-- Index for filtering by status/category
create index if not exists idx_quotes_status_category on public.quotes (status, category);
