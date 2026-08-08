create table if not exists public.inspection_reports (
  id uuid primary key default gen_random_uuid(),
  inspector_id uuid not null references auth.users(id) on delete cascade,
  assignment_id uuid null,
  report_number text,
  client_name text,
  client_reference text,
  project_name text,
  vendor_name text,
  vendor_facility text,
  inspection_location text,
  inspection_date date,
  start_time time,
  end_time time,
  inspection_type text,
  equipment_material text,
  scope text,
  quantity_presented text,
  quantity_inspected text,
  itp_step text,
  intervention_point text,
  codes_standards text,
  reference_documents text,
  previous_outstanding_items text,
  activities text[] not null default '{}',
  results_summary text,
  progress_percent numeric,
  planned_progress_percent numeric,
  schedule_status text,
  estimated_completion_date date,
  critical_outstanding_activities text,
  vendor_comments text,
  inspector_summary text,
  overall_status text,
  release_recommended text,
  reinspection_required boolean not null default false,
  follow_up_required boolean not null default false,
  next_inspection_date date,
  outstanding_actions text,
  declaration_accepted boolean not null default false,
  status text not null default 'draft' check (status in ('draft','in_progress','submitted','client_review','final')),
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspection_findings (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.inspection_reports(id) on delete cascade,
  finding_number text,
  classification text,
  description text not null,
  requirement text,
  reference_document text,
  vendor_response text,
  corrective_action text,
  responsible_party text,
  target_completion_date date,
  status text not null default 'open',
  inspector_comments text,
  created_at timestamptz not null default now()
);

alter table public.inspection_reports enable row level security;
alter table public.inspection_findings enable row level security;

drop policy if exists "inspectors manage own reports" on public.inspection_reports;
create policy "inspectors manage own reports" on public.inspection_reports for all using (auth.uid() = inspector_id) with check (auth.uid() = inspector_id);

drop policy if exists "inspectors manage findings for own reports" on public.inspection_findings;
create policy "inspectors manage findings for own reports" on public.inspection_findings for all using (exists (select 1 from public.inspection_reports r where r.id = report_id and r.inspector_id = auth.uid())) with check (exists (select 1 from public.inspection_reports r where r.id = report_id and r.inspector_id = auth.uid()));

create index if not exists inspection_reports_inspector_idx on public.inspection_reports(inspector_id, created_at desc);
create index if not exists inspection_findings_report_idx on public.inspection_findings(report_id);
