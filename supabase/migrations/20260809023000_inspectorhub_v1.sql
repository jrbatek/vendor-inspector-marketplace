create table if not exists public.inspector_work_activities (
  id uuid primary key default gen_random_uuid(),
  inspector_id uuid not null references auth.users(id) on delete cascade,
  source text not null default 'manual',
  company_name text,
  client_name text,
  project_name text,
  role_title text,
  activity_type text,
  location text,
  start_date date,
  end_date date,
  hours numeric,
  gross_earnings numeric,
  currency text not null default 'USD',
  mileage numeric,
  mileage_unit text not null default 'mi',
  reimbursable_expense numeric,
  notes text,
  tax_category text,
  external_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspector_documents (
  id uuid primary key default gen_random_uuid(),
  inspector_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null,
  document_name text not null,
  issuer text,
  tax_year integer,
  expiration_date date,
  file_path text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.inspector_work_activities enable row level security;
alter table public.inspector_documents enable row level security;

create policy "inspectors manage own work activities" on public.inspector_work_activities for all using (auth.uid()=inspector_id) with check (auth.uid()=inspector_id);
create policy "inspectors manage own documents" on public.inspector_documents for all using (auth.uid()=inspector_id) with check (auth.uid()=inspector_id);

create index if not exists inspector_work_dates_idx on public.inspector_work_activities(inspector_id,start_date,end_date);
create index if not exists inspector_work_company_idx on public.inspector_work_activities(inspector_id,company_name);
create index if not exists inspector_documents_type_idx on public.inspector_documents(inspector_id,document_type,tax_year);
