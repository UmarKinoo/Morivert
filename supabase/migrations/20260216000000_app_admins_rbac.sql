-- Enterprise RBAC: app_admins table + is_admin() as single source of truth
-- Admins are determined by public.app_admins; fallback to legacy email for migration.

-- 1. Table of admin user ids (only these users can access /admin and admin RLS)
create table if not exists public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now() not null
);

comment on table public.app_admins is 'Users with admin role; used by is_admin() and RLS.';

-- 2. RLS: only admins can read app_admins (for is_admin() we use security definer)
alter table public.app_admins enable row level security;

-- Allow no direct client access; is_admin() is security definer and reads inside the function
create policy "No direct client access to app_admins"
  on public.app_admins
  for all
  to authenticated
  using (false)
  with check (false);

-- 3. is_admin(): true if user_id is in app_admins OR legacy email (for backward compatibility)
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  u_email text;
begin
  -- In app_admins table
  if exists (select 1 from public.app_admins where user_id = auth.uid()) then
    return true;
  end if;
  -- Legacy: allow specific email until admins are migrated to app_admins
  select email into u_email from auth.users where id = auth.uid();
  return u_email in (
    'zecharia.studio@gmail.com',
    'admin@morivert.io'
  );
end;
$$;

comment on function public.is_admin() is 'RBAC: true if current user is in app_admins or legacy admin email list.';

-- Allow authenticated users to call is_admin (returns their own role only)
grant execute on function public.is_admin() to authenticated;
