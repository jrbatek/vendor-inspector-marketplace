create table if not exists public.inspector_schedule_events (
  id uuid primary key default gen_random_uuid(),
  inspector_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  company_name text,
  project_name text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  event_type text not null default 'work' check (event_type in ('work','travel','personal','unavailable','credential','other')),
  source text not null default 'inspectsource',
  external_uid text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.inspector_availability_rules (
  id uuid primary key default gen_random_uuid(),
  inspector_id uuid not null references auth.users(id) on delete cascade,
  weekday integer not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  availability_type text not null default 'available' check (availability_type in ('available','unavailable')),
  effective_from date,
  effective_to date,
  notes text,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create table if not exists public.inspector_credentials (
  id uuid primary key default gen_random_uuid(),
  inspector_id uuid not null references auth.users(id) on delete cascade,
  credential_name text not null,
  credential_number text,
  issuer text,
  expires_on date,
  reminder_days integer not null default 30,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inspector_schedule_events enable row level security;
alter table public.inspector_availability_rules enable row level security;
alter table public.inspector_credentials enable row level security;

create policy "inspectors manage own schedule events" on public.inspector_schedule_events for all using (auth.uid()=inspector_id) with check (auth.uid()=inspector_id);
create policy "inspectors manage own availability" on public.inspector_availability_rules for all using (auth.uid()=inspector_id) with check (auth.uid()=inspector_id);
create policy "inspectors manage own credentials" on public.inspector_credentials for all using (auth.uid()=inspector_id) with check (auth.uid()=inspector_id);

create index if not exists inspector_schedule_time_idx on public.inspector_schedule_events(inspector_id, starts_at, ends_at);
create index if not exists inspector_availability_idx on public.inspector_availability_rules(inspector_id, weekday);
create index if not exists inspector_credentials_expiry_idx on public.inspector_credentials(inspector_id, expires_on);
