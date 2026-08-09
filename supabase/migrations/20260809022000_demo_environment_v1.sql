create or replace function public.load_demo_environment()
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  a_project uuid; a_pv101 uuid; a_hx201 uuid; a_tk301 uuid; a_p101 uuid;
  a_vlv401 uuid; a_pipe501 uuid; a_skid601 uuid; a_mcc701 uuid; a_pkg801 uuid;
  act_pv uuid; act_hx uuid; act_tk uuid; act_skid uuid; act_pkg uuid;
begin
  if uid is null then raise exception 'Authentication required'; end if;

  delete from public.assets where owner_id = uid and metadata->>'demo' = 'gulf-coast-expansion';

  insert into public.assets(owner_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,criticality,metadata)
  values(uid,'GCRE-2027','Gulf Coast Refinery Expansion','Project','Gulf Coast Energy','Bayport Refinery','Expansion Program',null,'critical',jsonb_build_object('demo','gulf-coast-expansion','progress',68,'budget_musd',420,'target_startup','2027-03-15')) returning id into a_project;

  insert into public.assets(owner_id,parent_asset_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,serial_number,design_code,criticality,metadata) values
  (uid,a_project,'PV-101','Hydrotreater Separator','Pressure Vessel','Gulf Coast Energy','Bayport Refinery','Hydrotreater','Lone Star Process Equipment','LSP-26041','ASME VIII Div 1','critical',jsonb_build_object('demo','gulf-coast-expansion','supplier','Lone Star Process Equipment','progress',61,'status','attention')) returning id into a_pv101;
  insert into public.assets(owner_id,parent_asset_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,serial_number,design_code,criticality,metadata) values
  (uid,a_project,'HX-201','Feed/Effluent Exchanger','Heat Exchanger','Gulf Coast Energy','Bayport Refinery','Hydrotreater','Gulf Thermal Systems','GTS-8841','TEMA R / ASME VIII','high',jsonb_build_object('demo','gulf-coast-expansion','supplier','Gulf Thermal Systems','progress',79,'status','on_track')) returning id into a_hx201;
  insert into public.assets(owner_id,parent_asset_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,serial_number,design_code,criticality,metadata) values
  (uid,a_project,'TK-301','Diesel Product Tank','Storage Tank','Gulf Coast Energy','Bayport Refinery','Tank Farm','Delta Tank & Steel','DTS-7732','API 650','high',jsonb_build_object('demo','gulf-coast-expansion','supplier','Delta Tank & Steel','progress',72,'status','recovering')) returning id into a_tk301;
  insert into public.assets(owner_id,parent_asset_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,serial_number,design_code,criticality,metadata) values
  (uid,a_project,'P-101A/B','Charge Pump Package','Rotating Equipment','Gulf Coast Energy','Bayport Refinery','Hydrotreater','Magnolia Rotating Equipment','MRE-2298','API 610','critical',jsonb_build_object('demo','gulf-coast-expansion','supplier','Magnolia Rotating Equipment','progress',84,'status','on_track')) returning id into a_p101;
  insert into public.assets(owner_id,parent_asset_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,criticality,metadata) values
  (uid,a_project,'VLV-401','Critical Isolation Valve Lot','Valve Package','Gulf Coast Energy','Bayport Refinery','Hydrotreater','Red River Valve Works','high',jsonb_build_object('demo','gulf-coast-expansion','supplier','Red River Valve Works','progress',57,'status','attention')) returning id into a_vlv401;
  insert into public.assets(owner_id,parent_asset_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,criticality,metadata) values
  (uid,a_project,'PIPE-501','Alloy Piping Spools','Piping','Gulf Coast Energy','Bayport Refinery','Hydrotreater','Lone Star Process Equipment','critical',jsonb_build_object('demo','gulf-coast-expansion','supplier','Lone Star Process Equipment','progress',49,'status','late')) returning id into a_pipe501;
  insert into public.assets(owner_id,parent_asset_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,criticality,metadata) values
  (uid,a_project,'SKID-601','Hydrogen Compressor Auxiliary Skid','Packaged Equipment','Gulf Coast Energy','Bayport Refinery','Hydrotreater','Magnolia Rotating Equipment','high',jsonb_build_object('demo','gulf-coast-expansion','supplier','Magnolia Rotating Equipment','progress',76,'status','on_track')) returning id into a_skid601;
  insert into public.assets(owner_id,parent_asset_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,criticality,metadata) values
  (uid,a_project,'MCC-701','Motor Control Center','Electrical','Gulf Coast Energy','Bayport Refinery','Substation 4','Bayou Electrical Systems','high',jsonb_build_object('demo','gulf-coast-expansion','supplier','Bayou Electrical Systems','progress',88,'status','on_track')) returning id into a_mcc701;
  insert into public.assets(owner_id,parent_asset_id,asset_code,name,asset_type,client_name,facility,area_unit,manufacturer,criticality,metadata) values
  (uid,a_project,'PKG-801','Chemical Injection Package','Packaged Equipment','Gulf Coast Energy','Bayport Refinery','Hydrotreater','Delta Process Systems','medium',jsonb_build_object('demo','gulf-coast-expansion','supplier','Delta Process Systems','progress',91,'status','on_track')) returning id into a_pkg801;

  insert into public.inspection_activities(owner_id,asset_id,title,purpose,requirement,priority,critical_path,planned_date,status,execution_resource_type,source_reason)
  values(uid,a_pv101,'Witness vessel hydrotest','Confirm pressure integrity before release','ASME VIII hydrostatic test and ITP HP-17','critical',true,current_date+7,'ready','qualified inspection resource','Critical-path hold point') returning id into act_pv;
  insert into public.inspection_activities(owner_id,asset_id,title,purpose,requirement,priority,critical_path,planned_date,status,execution_resource_type,source_reason)
  values(uid,a_hx201,'Final dimensional and document review','Confirm exchanger readiness for shipment','TEMA dimensional checks; MDR completion','high',true,current_date+12,'planned','qualified inspection resource','Shipment milestone') returning id into act_hx;
  insert into public.inspection_activities(owner_id,asset_id,title,purpose,requirement,priority,critical_path,planned_date,status,execution_resource_type,source_reason)
  values(uid,a_tk301,'Weld repair follow-up','Verify repair quality after NCR closure','API 650 weld repair and NDE acceptance','high',false,current_date+5,'ready','qualified inspection resource','Prior welding NCR') returning id into act_tk;
  insert into public.inspection_activities(owner_id,asset_id,title,purpose,requirement,priority,critical_path,planned_date,status,execution_resource_type,source_reason)
  values(uid,a_skid601,'Package FAT surveillance','Confirm auxiliary skid functional performance','Approved FAT procedure','normal',false,current_date+18,'planned','qualified inspection resource','Routine FAT coverage') returning id into act_skid;
  insert into public.inspection_activities(owner_id,asset_id,title,purpose,requirement,priority,critical_path,planned_date,status,execution_resource_type,source_reason)
  values(uid,a_pipe501,'Increase alloy piping surveillance','Verify traceability, welding and NDE on delayed spools','PMI, weld traceability and NDE per project spec','critical',true,current_date+2,'ready','qualified inspection resource','Repeated supplier quality escapes and schedule delay') returning id into act_pkg;

  insert into public.inspection_evidence(owner_id,activity_id,asset_id,evidence_type,source_type,observed_at,value_numeric,value_text,unit,reference_point,human_verified,metadata) values
  (uid,act_pv,a_pv101,'measurement','human+instrument',now()-interval '45 days',null,'Shell course dimensional inspection acceptable',null,'Shell course 2',true,jsonb_build_object('demo','gulf-coast-expansion')),
  (uid,act_pv,a_pv101,'measurement','human+instrument',now()-interval '30 days',7.8,'UT spot check baseline','mm','Nozzle N3 reinforcement pad',true,jsonb_build_object('demo','gulf-coast-expansion')),
  (uid,act_hx,a_hx201,'document','human',now()-interval '18 days',null,'Tube material certificates verified complete',null,'MDR section 4',true,jsonb_build_object('demo','gulf-coast-expansion')),
  (uid,act_tk,a_tk301,'observation','human',now()-interval '16 days',null,'Undercut observed at shell course weld; repair requested',null,'Vertical seam V-12',true,jsonb_build_object('demo','gulf-coast-expansion')),
  (uid,act_skid,a_skid601,'observation','human',now()-interval '9 days',null,'Instrumentation installation 76% complete; no material concerns',null,'Skid west side',true,jsonb_build_object('demo','gulf-coast-expansion')),
  (uid,act_pkg,a_pipe501,'observation','human',now()-interval '8 days',null,'Two spool heat numbers did not reconcile to MTR package',null,'Spools HTR-501-118/119',true,jsonb_build_object('demo','gulf-coast-expansion')),
  (uid,act_pkg,a_pipe501,'measurement','instrument',now()-interval '6 days',null,'PMI confirmed incorrect alloy on one fitting; segregated',null,'Spool HTR-501-126',true,jsonb_build_object('demo','gulf-coast-expansion'));

  insert into public.inspection_risk_signals(owner_id,asset_id,activity_id,signal_type,severity,title,description,supplier_name,schedule_impact,status,detected_at) values
  (uid,a_pipe501,act_pkg,'supplier_performance','critical','Repeated traceability and alloy-control failures','Three quality escapes in six weeks indicate systemic material-control weakness. Increase surveillance until three consecutive lots pass without major finding.','Lone Star Process Equipment','Piping release is on the hydrotreater mechanical-completion critical path.','open',now()-interval '2 days'),
  (uid,a_pv101,act_pv,'schedule','high','Hydrotest milestone at risk','Vendor hydrotest preparation is four days behind baseline due to incomplete punch-list closure.','Lone Star Process Equipment','Potential four-to-seven-day impact to vessel shipment.','monitoring',now()-interval '1 day'),
  (uid,a_tk301,act_tk,'quality','high','Tank weld repair requires enhanced follow-up','Prior undercut NCR was repaired; independent verification and NDE review required before closure.','Delta Tank & Steel','Low direct schedule impact if closed this week.','monitoring',now()-interval '3 days'),
  (uid,a_hx201,act_hx,'positive_performance','low','Exchanger supplier trending ahead of quality plan','Last four surveillance visits closed without NCR and document completion remains ahead of fabrication progress.','Gulf Thermal Systems','Opportunity to reduce routine surveillance and reallocate hours.','open',now()-interval '5 days');

  insert into public.coordinator_actions(owner_id,asset_id,action_type,recommendation,rationale,priority,status,created_by) values
  (uid,a_pipe501,'increase_inspection','Increase Lone Star alloy-piping coverage from weekly surveillance to three visits per week','Repeated traceability and PMI failures combined with critical-path delay justify temporary intensified coverage.','critical','proposed','inspection_intelligence'),
  (uid,a_pv101,'expedite_critical_path','Add daily hydrotest readiness check until hold point is released','Vessel shipment is on the critical path and preparation is four days behind baseline.','high','proposed','inspection_intelligence'),
  (uid,a_tk301,'targeted_follow_up','Assign focused weld-repair verification rather than full-day general surveillance','Known defect location allows inspection effort to concentrate on closure evidence.','high','proposed','inspection_intelligence'),
  (uid,a_hx201,'reduce_inspection','Reduce Gulf Thermal routine surveillance after final dimensional review','Strong quality history supports reallocating inspection capacity to higher-risk suppliers.','normal','proposed','inspection_intelligence');
end;
$$;

grant execute on function public.load_demo_environment() to authenticated;
