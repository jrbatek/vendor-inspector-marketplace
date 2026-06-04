create extension if not exists pgcrypto;

create table if not exists public.inspector_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null default '',
  headline text not null default '',
  company text not null default '',
  email text not null default '',
  phone text not null default '',
  base_city text not null default '',
  base_state text not null default '',
  base_country text not null default 'USA',
  travel_radius text not null default '',
  certifications text[] not null default '{}',
  methods text[] not null default '{}',
  industries text[] not null default '{}',
  hourly_rate integer,
  day_rate integer,
  bio text not null default '',
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_inspector_profiles_updated_at on public.inspector_profiles;

create trigger set_inspector_profiles_updated_at
before update on public.inspector_profiles
for each row execute function public.set_updated_at();

alter table public.inspector_profiles enable row level security;

drop policy if exists "Public can view inspector profiles" on public.inspector_profiles;
create policy "Public can view inspector profiles"
on public.inspector_profiles for select using (true);

drop policy if exists "Users can insert their own inspector profile" on public.inspector_profiles;
create policy "Users can insert their own inspector profile"
on public.inspector_profiles for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update their own inspector profile" on public.inspector_profiles;
create policy "Users can update their own inspector profile"
on public.inspector_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own inspector profile" on public.inspector_profiles;
create policy "Users can delete their own inspector profile"
on public.inspector_profiles for delete using (auth.uid() = user_id);

create index if not exists inspector_profiles_available_idx on public.inspector_profiles(available);
create index if not exists inspector_profiles_city_idx on public.inspector_profiles(base_city);
create index if not exists inspector_profiles_state_idx on public.inspector_profiles(base_state);
create index if not exists inspector_profiles_country_idx on public.inspector_profiles(base_country);
