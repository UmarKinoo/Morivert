-- Allow users to delete their own account (GDPR / user trust).
-- Deletes from auth.users which cascades to quotes (user_id FK ON DELETE SET NULL)
-- and app_admins (ON DELETE CASCADE).

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

comment on function public.delete_my_account() is 'Allows the current user to permanently delete their own account.';

grant execute on function public.delete_my_account() to authenticated;
