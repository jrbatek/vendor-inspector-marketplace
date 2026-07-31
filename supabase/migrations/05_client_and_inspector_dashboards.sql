-- InspectSource v1.1 dashboards and role support
-- Run after the prior client portal migration. Safe to rerun.

begin;

-- Ensure current users have a supported role.
update public.profiles
set role = 'client'
where role is null or role not in ('client', 'inspector', 'admin');

-- Keep account role supplied during Supabase registration.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    case
      when new.raw_user_meta_data ->> 'role' in ('client', 'inspector', 'admin')
        then new.raw_user_meta_data ->> 'role'
      else 'client'
    end
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = case
      when public.profiles.role in ('client', 'inspector', 'admin')
        then public.profiles.role
      else excluded.role
    end;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Inspector and client participants may update inquiries.
drop policy if exists "client_inquiries_participant_update" on public.client_inquiries;
create policy "client_inquiries_participant_update"
on public.client_inquiries
for update
to authenticated
using (
  client_id = (select auth.uid())
  or inspector_id = (select auth.uid())
)
with check (
  client_id = (select auth.uid())
  or inspector_id = (select auth.uid())
);

commit;

select role, count(*) as users
from public.profiles
group by role
order by role;
