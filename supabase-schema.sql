-- ============================================
-- Morivert Quotes Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create the quotes table
create table if not exists public.quotes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,

  -- Linked user (set by the app when a logged-in user submits)
  user_id uuid references auth.users(id) on delete set null,

  -- Customer info
  contact_name text not null,
  company_name text default '',
  email text not null,
  phone text default '',
  message text default '',

  -- Order details
  market text not null check (market in ('Mauritius', 'Export')),
  line_items jsonb not null default '[]'::jsonb,
  total integer not null default 0,
  estimated_timeline integer not null default 0,

  -- Impact
  seeds integer not null default 0,
  paper_grams integer not null default 0,
  co2_saved numeric(10,2) not null default 0,

  -- Admin
  status text not null default 'new' check (status in ('new', 'in_progress', 'completed', 'cancelled')),
  admin_notes text default ''
);

-- 2. Enable Row Level Security
alter table public.quotes enable row level security;

-- 3. Policy: Authenticated users can INSERT their own quotes
create policy "Users can submit their own quotes"
  on public.quotes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 3b. Policy: Guests (not logged in) can submit quotes (user_id stays null)
create policy "Guests can submit quotes"
  on public.quotes
  for insert
  to anon
  with check (user_id is null);

-- 4. Policy: Users can SELECT their own quotes
create policy "Users can view their own quotes"
  on public.quotes
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 5. Policy: Admin can SELECT all quotes (uses service_role or a specific admin check)
--    Option A: Use the Supabase service_role key in your admin dashboard (bypasses RLS).
--    Option B: Create an is_admin() function. Below uses a simple email check.
create or replace function public.is_admin()
returns boolean as $$
begin
  return (select email from auth.users where id = auth.uid()) in (
    'zecharia.studio@gmail.com'
  );
end;
$$ language plpgsql security definer;

-- Admin can view all quotes
create policy "Admin can view all quotes"
  on public.quotes
  for select
  to authenticated
  using (public.is_admin());

-- Admin can update all quotes (status changes, notes)
create policy "Admin can update all quotes"
  on public.quotes
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 6. Enable realtime for the quotes table
alter publication supabase_realtime add table public.quotes;

-- 7. Create indexes for common queries
create index if not exists idx_quotes_status on public.quotes (status);
create index if not exists idx_quotes_created_at on public.quotes (created_at desc);
create index if not exists idx_quotes_email on public.quotes (email);
create index if not exists idx_quotes_user_id on public.quotes (user_id);

-- ============================================
-- MIGRATION: If you already ran the old schema,
-- run this block to add user_id to existing table:
-- ============================================
-- alter table public.quotes add column if not exists user_id uuid references auth.users(id) on delete set null;
-- create index if not exists idx_quotes_user_id on public.quotes (user_id);
-- drop policy if exists "Anyone can submit a quote" on public.quotes;
-- drop policy if exists "Authenticated users can view quotes" on public.quotes;
-- drop policy if exists "Authenticated users can update quotes" on public.quotes;
-- Then re-run the CREATE POLICY statements above.
