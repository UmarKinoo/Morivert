-- Morivert Quotes Schema
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

-- 2b. If quotes table already existed (old schema), add user_id and drop old policies
alter table public.quotes add column if not exists user_id uuid references auth.users(id) on delete set null;
create index if not exists idx_quotes_user_id on public.quotes (user_id);
drop policy if exists "Anyone can submit a quote" on public.quotes;
drop policy if exists "Authenticated users can view quotes" on public.quotes;
drop policy if exists "Authenticated users can update quotes" on public.quotes;

-- 3. Policy: Authenticated users can INSERT their own quotes
drop policy if exists "Users can submit their own quotes" on public.quotes;
create policy "Users can submit their own quotes"
  on public.quotes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 4. Policy: Users can SELECT their own quotes
drop policy if exists "Users can view their own quotes" on public.quotes;
create policy "Users can view their own quotes"
  on public.quotes
  for select
  to authenticated
  using (auth.uid() = user_id);

-- 5. is_admin() for admin dashboard (zecharia.studio@gmail.com)
create or replace function public.is_admin()
returns boolean as $$
begin
  return (select email from auth.users where id = auth.uid()) in (
    'zecharia.studio@gmail.com'
  );
end;
$$ language plpgsql security definer;

-- Admin can view all quotes
drop policy if exists "Admin can view all quotes" on public.quotes;
create policy "Admin can view all quotes"
  on public.quotes
  for select
  to authenticated
  using (public.is_admin());

-- Admin can update all quotes (status changes, notes)
drop policy if exists "Admin can update all quotes" on public.quotes;
create policy "Admin can update all quotes"
  on public.quotes
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 6. Enable realtime for the quotes table (ignore if already in publication)
do $$
begin
  alter publication supabase_realtime add table public.quotes;
exception
  when duplicate_object then null;
end $$;

-- 7. Indexes for common queries
create index if not exists idx_quotes_status on public.quotes (status);
create index if not exists idx_quotes_created_at on public.quotes (created_at desc);
create index if not exists idx_quotes_email on public.quotes (email);
create index if not exists idx_quotes_user_id on public.quotes (user_id);
