create table if not exists public.inspector_availability_preferences (
  inspector_id uuid primary key references auth.users(id) on delete cascade,
  default_available boolean not null default true,
  travel_buffer_hours numeric not null default 4 check (travel_buffer_hours >= 0 and travel_buffer_hours <= 72),
  weekend_premium_percent numeric not null default 25 check (weekend_premium_percent >= 0 and weekend_premium_percent <= 300),
  saturday_premium_enabled boolean not null default true,
  sunday_premium_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.inspector_weekly_availability (
  id uuid primary key default gen_random_uuid(),
  inspector_id uuid not null references auth.users(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  available boolean not null default true,
  start_time time,
  end_time time,
  effective_from date,
  effective_to date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(inspector_id, weekday)
);

alter table public.inspector_schedule_events add column if not exists travel_buffer_before_hours numeric not null default 0;
alter table public.inspector_schedule_events add column if not exists travel_buffer_after_hours numeric not null default 0;
alter table public.inspector_schedule_events add column if not exists billable boolean not null default false;
alter table public.inspector_schedule_events add column if not exists base_day_rate numeric;
alter table public.inspector_schedule_events add column if not exists weekend_premium_percent numeric;

alter table public.inspector_availability_preferences enable row level security;
alter table public.inspector_weekly_availability enable row level security;

create policy "inspectors manage availability preferences" on public.inspector_availability_preferences for all using (auth.uid()=inspector_id) with check (auth.uid()=inspector_id);
create policy "inspectors manage weekly availability" on public.inspector_weekly_availability for all using (auth.uid()=inspector_id) with check (auth.uid()=inspector_id);

create or replace function public.inspector_availability_summary(
  p_inspector_id uuid,
  p_start timestamptz,
  p_end timestamptz
) returns table(
  is_available boolean,
  conflict_count integer,
  weekend_days integer,
  weekend_premium_percent numeric,
  travel_buffer_hours numeric
)
language sql
security definer
set search_path = public
as $$
  with pref as (
    select coalesce(p.weekend_premium_percent,25) as premium,
           coalesce(p.travel_buffer_hours,4) as buffer
    from (select 1) x
    left join public.inspector_availability_preferences p on p.inspector_id=p_inspector_id
  ), conflicts as (
    select count(*)::int as n
    from public.inspector_schedule_events e, pref p
    where e.inspector_id=p_inspector_id
      and e.event_type in ('work','travel','personal','unavailable')
      and (e.starts_at - make_interval(hours => p.buffer::int)) < p_end
      and (e.ends_at + make_interval(hours => p.buffer::int)) > p_start
  ), days as (
    select count(*)::int as n
    from generate_series(date_trunc('day',p_start), date_trunc('day',p_end - interval '1 second'), interval '1 day') d
    where extract(dow from d) in (0,6)
  )
  select c.n=0, c.n, d.n, p.premium, p.buffer
  from conflicts c cross join days d cross join pref p;
$$;

grant execute on function public.inspector_availability_summary(uuid,timestamptz,timestamptz) to authenticated;

create index if not exists inspector_schedule_window_idx on public.inspector_schedule_events(inspector_id, starts_at, ends_at);
create index if not exists inspector_weekly_availability_idx on public.inspector_weekly_availability(inspector_id, weekday);
