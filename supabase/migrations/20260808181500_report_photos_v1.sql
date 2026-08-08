insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inspection-report-files',
  'inspection-report-files',
  false,
  15728640,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif','application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.inspection_report_files (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.inspection_reports(id) on delete cascade,
  inspector_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  category text not null default 'General',
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.inspection_report_files enable row level security;

create policy "inspectors view own report files"
on public.inspection_report_files for select
using (auth.uid() = inspector_id);

create policy "inspectors add own report files"
on public.inspection_report_files for insert
with check (
  auth.uid() = inspector_id
  and exists (
    select 1 from public.inspection_reports r
    where r.id = report_id and r.inspector_id = auth.uid()
  )
);

create policy "inspectors update own report files"
on public.inspection_report_files for update
using (auth.uid() = inspector_id)
with check (auth.uid() = inspector_id);

create policy "inspectors delete own report files"
on public.inspection_report_files for delete
using (auth.uid() = inspector_id);

create policy "inspectors upload own inspection report objects"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'inspection-report-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "inspectors read own inspection report objects"
on storage.objects for select to authenticated
using (
  bucket_id = 'inspection-report-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "inspectors delete own inspection report objects"
on storage.objects for delete to authenticated
using (
  bucket_id = 'inspection-report-files'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create index if not exists inspection_report_files_report_idx
on public.inspection_report_files(report_id, sort_order, created_at);
