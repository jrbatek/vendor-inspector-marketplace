create table if not exists public.inspection_intelligence_scores (
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
 entity_type text not null check(entity_type in ('supplier','asset','activity','project')), entity_key text not null,
 score numeric not null default 0, risk_level text not null default 'low', trend text not null default 'stable',
 inspection_count int not null default 0, adverse_count int not null default 0, clean_streak int not null default 0,
 major_count int not null default 0, schedule_signal_count int not null default 0,
 top_signals jsonb not null default '[]'::jsonb, calculated_at timestamptz not null default now(),
 unique(owner_id,entity_type,entity_key)
);
alter table public.inspection_intelligence_scores enable row level security;
create policy "owners read intelligence scores" on public.inspection_intelligence_scores for select using(auth.uid()=owner_id);

create or replace function public.refresh_inspection_intelligence(p_owner uuid)
returns void language plpgsql security definer set search_path=public as $$
declare r record; s numeric; lvl text; tr text;
begin
 delete from inspection_intelligence_scores where owner_id=p_owner;
 for r in
   select coalesce(nullif(trim(vendor_name),''),'Unknown Supplier') entity_key,
     count(*)::int inspection_count,
     count(*) filter(where overall_status in ('NOT ACCEPTABLE','NOT READY FOR INSPECTION','PENDING / INCOMPLETE'))::int adverse_count,
     count(*) filter(where reinspection_required or follow_up_required)::int major_count,
     count(*) filter(where schedule_status ilike '%behind%' or critical_outstanding_activities is not null)::int schedule_count,
     max(inspection_date) last_date
   from inspection_reports where inspector_id=p_owner and status in ('submitted','client_review','final') group by 1
 loop
   s:=least(100, round((r.adverse_count*28 + r.major_count*18 + r.schedule_count*12)::numeric / greatest(r.inspection_count,1),1));
   if s>=70 then lvl:='critical'; elsif s>=45 then lvl:='high'; elsif s>=20 then lvl:='medium'; else lvl:='low'; end if;
   if r.adverse_count+r.major_count+r.schedule_count=0 and r.inspection_count>=3 then tr:='improving'; elsif s>=45 then tr:='deteriorating'; else tr:='stable'; end if;
   insert into inspection_intelligence_scores(owner_id,entity_type,entity_key,score,risk_level,trend,inspection_count,adverse_count,clean_streak,major_count,schedule_signal_count,top_signals)
   values(p_owner,'supplier',r.entity_key,s,lvl,tr,r.inspection_count,r.adverse_count,case when r.adverse_count+r.major_count=0 then r.inspection_count else 0 end,r.major_count,r.schedule_count,
     jsonb_build_array(jsonb_build_object('type','quality','count',r.adverse_count),jsonb_build_object('type','follow_up','count',r.major_count),jsonb_build_object('type','schedule','count',r.schedule_count)));
 end loop;

 for r in
   select a.id::text entity_key,count(ir.id)::int inspection_count,
    count(ir.id) filter(where ir.overall_status in ('NOT ACCEPTABLE','NOT READY FOR INSPECTION','PENDING / INCOMPLETE'))::int adverse_count,
    count(ir.id) filter(where ir.reinspection_required or ir.follow_up_required)::int major_count
   from assets a left join inspection_reports ir on ir.asset_id=a.id and ir.status in ('submitted','client_review','final') where a.owner_id=p_owner group by a.id
 loop
   s:=least(100,round((r.adverse_count*32+r.major_count*20)::numeric/greatest(r.inspection_count,1),1));
   lvl:=case when s>=70 then 'critical' when s>=45 then 'high' when s>=20 then 'medium' else 'low' end;
   insert into inspection_intelligence_scores(owner_id,entity_type,entity_key,score,risk_level,trend,inspection_count,adverse_count,major_count,top_signals)
   values(p_owner,'asset',r.entity_key,s,lvl,case when s>=45 then 'deteriorating' else 'stable' end,r.inspection_count,r.adverse_count,r.major_count,jsonb_build_array(jsonb_build_object('type','quality','count',r.adverse_count)));
 end loop;
end $$;

grant execute on function public.refresh_inspection_intelligence(uuid) to authenticated;

create or replace function public.my_inspection_intelligence()
returns table(entity_type text,entity_key text,score numeric,risk_level text,trend text,inspection_count int,adverse_count int,clean_streak int,major_count int,schedule_signal_count int,top_signals jsonb)
language sql security definer set search_path=public as $$
 select s.entity_type,s.entity_key,s.score,s.risk_level,s.trend,s.inspection_count,s.adverse_count,s.clean_streak,s.major_count,s.schedule_signal_count,s.top_signals
 from inspection_intelligence_scores s where s.owner_id=auth.uid() order by s.score desc,s.inspection_count desc;
$$;
grant execute on function public.my_inspection_intelligence() to authenticated;

create or replace function public.refresh_my_inspection_intelligence()
returns void language sql security definer set search_path=public as $$ select public.refresh_inspection_intelligence(auth.uid()); $$;
grant execute on function public.refresh_my_inspection_intelligence() to authenticated;
