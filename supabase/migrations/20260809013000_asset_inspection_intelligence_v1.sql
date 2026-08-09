create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  parent_asset_id uuid references public.assets(id) on delete set null,
  asset_code text not null,
  name text not null,
  asset_type text,
  client_name text,
  facility text,
  area_unit text,
  manufacturer text,
  serial_number text,
  design_code text,
  criticality text not null default 'medium' check (criticality in ('low','medium','high','critical')),
  lifecycle_status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, asset_code)
);

create table if not exists public.inspection_activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete cascade,
  title text not null,
  purpose text,
  requirement text,
  priority text not null default 'normal' check (priority in ('low','normal','high','critical')),
  critical_path boolean not null default false,
  planned_date date,
  status text not null default 'planned' check (status in ('planned','ready','in_progress','completed','cancelled')),
  execution_resource_type text,
  source_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspection_evidence (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid references public.inspection_activities(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete cascade,
  evidence_type text not null,
  source_type text,
  observed_at timestamptz not null default now(),
  value_numeric numeric,
  value_text text,
  unit text,
  file_path text,
  reference_point text,
  confidence numeric,
  human_verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.inspection_risk_signals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.assets(id) on delete cascade,
  activity_id uuid references public.inspection_activities(id) on delete set null,
  signal_type text not null,
  severity text not null default 'medium' check (severity in ('low','medium','high','critical')),
  title text not null,
  description text,
  supplier_name text,
  schedule_impact text,
  status text not null default 'open' check (status in ('open','monitoring','mitigated','closed')),
  detected_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.coordinator_actions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  risk_signal_id uuid references public.inspection_risk_signals(id) on delete set null,
  asset_id uuid references public.assets(id) on delete cascade,
  action_type text not null,
  recommendation text not null,
  rationale text,
  priority text not null default 'normal',
  status text not null default 'proposed' check (status in ('proposed','accepted','rejected','completed')),
  created_by text not null default 'system',
  created_at timestamptz not null default now()
);

alter table public.inspection_reports add column if not exists asset_id uuid references public.assets(id) on delete set null;
alter table public.inspection_reports add column if not exists activity_id uuid references public.inspection_activities(id) on delete set null;

alter table public.assets enable row level security;
alter table public.inspection_activities enable row level security;
alter table public.inspection_evidence enable row level security;
alter table public.inspection_risk_signals enable row level security;
alter table public.coordinator_actions enable row level security;

create policy "owners manage assets" on public.assets for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage inspection activities" on public.inspection_activities for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage inspection evidence" on public.inspection_evidence for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage risk signals" on public.inspection_risk_signals for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage coordinator actions" on public.coordinator_actions for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);

create index if not exists assets_parent_idx on public.assets(parent_asset_id);
create index if not exists activities_asset_idx on public.inspection_activities(asset_id,status,planned_date);
create index if not exists evidence_asset_idx on public.inspection_evidence(asset_id,observed_at desc);
create index if not exists risks_asset_idx on public.inspection_risk_signals(asset_id,status,severity);
create index if not exists coordinator_actions_status_idx on public.coordinator_actions(owner_id,status,priority);
