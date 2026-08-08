"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";

const ACTIVITIES = ["Document review","Material identification / traceability","Visual inspection","Dimensional inspection","Welding inspection","NDE/NDT witnessing","Pressure / hydrostatic testing","Functional testing","Coating / painting inspection","Electrical inspection / testing","Packing / preservation","Final inspection","Release inspection","Expediting / progress review","Other"];
const PHOTO_CATEGORIES = ["General","Acceptable","Finding","NCR","Progress","Nameplate","Packing"];

type Report = { id:string; report_number:string|null; project_name:string|null; vendor_name:string|null; inspection_date:string|null; overall_status:string|null; status:string; updated_at:string };
type PendingFile = { id:string; file:File; preview:string|null; category:string; caption:string };

export default function InspectionReportsPage(){
 const supabase=useMemo(()=>supabaseBrowser(),[]);
 const formRef=useRef<HTMLFormElement>(null);
 const fileRef=useRef<HTMLInputElement>(null);
 const [reports,setReports]=useState<Report[]>([]);
 const [msg,setMsg]=useState("");
 const [saving,setSaving]=useState(false);
 const [activities,setActivities]=useState<string[]>([]);
 const [files,setFiles]=useState<PendingFile[]>([]);
 useEffect(()=>{void load()},[]);

 async function load(){
   const {data:a}=await supabase.auth.getUser();
   if(!a.user){setMsg("Log in as an inspector to create and submit inspection reports.");return;}
   const {data,error}=await supabase.from("inspection_reports").select("id,report_number,project_name,vendor_name,inspection_date,overall_status,status,updated_at").eq("inspector_id",a.user.id).order("updated_at",{ascending:false});
   if(error)setMsg(error.message); else setReports((data||[]) as Report[]);
 }
 function toggle(v:string){setActivities(x=>x.includes(v)?x.filter(y=>y!==v):[...x,v]);}
 function addFiles(e:ChangeEvent<HTMLInputElement>){
   const chosen=Array.from(e.target.files||[]);
   const next=chosen.map(file=>({id:crypto.randomUUID(),file,preview:file.type.startsWith("image/")?URL.createObjectURL(file):null,category:"General",caption:""}));
   setFiles(current=>[...current,...next]);
   e.target.value="";
 }
 function updateFile(id:string,patch:Partial<PendingFile>){setFiles(current=>current.map(item=>item.id===id?{...item,...patch}:item));}
 function removeFile(id:string){setFiles(current=>{const item=current.find(x=>x.id===id);if(item?.preview)URL.revokeObjectURL(item.preview);return current.filter(x=>x.id!==id);});}

 async function uploadFiles(userId:string,reportId:string){
   for(let index=0;index<files.length;index+=1){
     const item=files[index];
     if(item.file.size>15*1024*1024) throw new Error(`${item.file.name} exceeds the 15 MB file limit.`);
     const safe=item.file.name.replace(/[^a-zA-Z0-9._-]/g,"_");
     const path=`${userId}/${reportId}/${crypto.randomUUID()}-${safe}`;
     const uploaded=await supabase.storage.from("inspection-report-files").upload(path,item.file,{contentType:item.file.type||undefined,upsert:false});
     if(uploaded.error) throw uploaded.error;
     const meta=await supabase.from("inspection_report_files").insert({report_id:reportId,inspector_id:userId,storage_path:path,file_name:item.file.name,mime_type:item.file.type||null,category:item.category,caption:item.caption.trim()||null,sort_order:index});
     if(meta.error) throw meta.error;
   }
 }

 async function save(form:HTMLFormElement,submit=false){
   setSaving(true);setMsg("");
   const {data:a}=await supabase.auth.getUser();
   if(!a.user){setMsg("Please log in first.");setSaving(false);return;}
   const f=new FormData(form); const val=(n:string)=>String(f.get(n)||"").trim()||null;
   const payload:any={inspector_id:a.user.id,report_number:val("report_number"),client_name:val("client_name"),client_reference:val("client_reference"),project_name:val("project_name"),vendor_name:val("vendor_name"),vendor_facility:val("vendor_facility"),inspection_location:val("inspection_location"),inspection_date:val("inspection_date"),start_time:val("start_time"),end_time:val("end_time"),inspection_type:val("inspection_type"),equipment_material:val("equipment_material"),scope:val("scope"),quantity_presented:val("quantity_presented"),quantity_inspected:val("quantity_inspected"),itp_step:val("itp_step"),intervention_point:val("intervention_point"),codes_standards:val("codes_standards"),reference_documents:val("reference_documents"),previous_outstanding_items:val("previous_outstanding_items"),activities,results_summary:val("results_summary"),progress_percent:val("progress_percent"),planned_progress_percent:val("planned_progress_percent"),schedule_status:val("schedule_status"),estimated_completion_date:val("estimated_completion_date"),critical_outstanding_activities:val("critical_outstanding_activities"),vendor_comments:val("vendor_comments"),inspector_summary:val("inspector_summary"),overall_status:val("overall_status"),release_recommended:val("release_recommended"),reinspection_required:f.get("reinspection_required")==="on",follow_up_required:f.get("follow_up_required")==="on",next_inspection_date:val("next_inspection_date"),outstanding_actions:val("outstanding_actions"),declaration_accepted:f.get("declaration_accepted")==="on",status:submit?"submitted":"draft",submitted_at:submit?new Date().toISOString():null,updated_at:new Date().toISOString()};
   if(submit&&!payload.declaration_accepted){setMsg("Please accept the inspector declaration before submitting.");setSaving(false);return;}
   try{
     const inserted=await supabase.from("inspection_reports").insert(payload).select("id").single();
     if(inserted.error)throw inserted.error;
     if(files.length)await uploadFiles(a.user.id,inserted.data.id);
     files.forEach(item=>{if(item.preview)URL.revokeObjectURL(item.preview)});
     setFiles([]);setActivities([]);form.reset();
     setMsg(submit?`Inspection report submitted with ${files.length} attachment${files.length===1?"":"s"}.`:`Draft saved with ${files.length} attachment${files.length===1?"":"s"}.`);
     await load();
   }catch(error){setMsg(error instanceof Error?error.message:"Unable to save inspection report.");}
   setSaving(false);
 }

 return <main className="page"><section className="hero"><p className="eyebrow">Inspector workspace</p><h1>Standard Inspection Report</h1><p>Mobile-ready structured reporting with photos and attachments. On iPhone, tap + Add Photos to take a photo, choose from the photo library, or select a file.</p></section>{msg&&<p className="notice">{msg}</p>}
 <form ref={formRef} className="form" onSubmit={(e:FormEvent<HTMLFormElement>)=>{e.preventDefault();void save(e.currentTarget,false)}}>
 <Section title="1. Assignment Information"><Grid><Input n="report_number" l="Report number"/><Input n="client_name" l="Client"/><Input n="client_reference" l="Client PO / reference"/><Input n="project_name" l="Project name"/><Input n="vendor_name" l="Vendor / manufacturer"/><Input n="vendor_facility" l="Vendor facility"/><Input n="inspection_location" l="Inspection location"/><Input n="inspection_date" l="Inspection date" t="date"/><Input n="start_time" l="Start time" t="time"/><Input n="end_time" l="End time" t="time"/><Input n="inspection_type" l="Inspection type"/><Input n="equipment_material" l="Equipment / material"/></Grid></Section>
 <Section title="2. Inspection Scope"><Area n="scope" l="Scope of inspection"/><Grid><Input n="quantity_presented" l="Quantity presented"/><Input n="quantity_inspected" l="Quantity inspected"/><Input n="itp_step" l="Applicable ITP step"/><Input n="intervention_point" l="Hold / witness / review point"/></Grid><Area n="codes_standards" l="Applicable codes and standards"/><Area n="reference_documents" l="Drawings, specifications, procedures and revisions"/><Area n="previous_outstanding_items" l="Previous outstanding items"/></Section>
 <Section title="3. Inspection Activities Performed"><div className="checks">{ACTIVITIES.map(a=><label key={a}><input type="checkbox" checked={activities.includes(a)} onChange={()=>toggle(a)}/>{a}</label>)}</div></Section>
 <Section title="4. Inspection Results"><Area n="results_summary" l="Requirements, observations, measurements, acceptance criteria and results"/></Section>
 <Section title="5. Photos & Attachments"><input ref={fileRef} className="fileInput" type="file" accept="image/*,application/pdf" multiple onChange={addFiles}/><button type="button" className="addPhoto" onClick={()=>fileRef.current?.click()}><span className="plus">+</span><span><strong>Add Photos</strong><small>Take photo · Photo Library · Files</small></span></button><p className="hint">Images and PDFs up to 15 MB each. Add a caption and category so the client report can organize evidence automatically.</p>{files.length>0&&<div className="photoGrid">{files.map((item,index)=><article className="photoCard" key={item.id}>{item.preview?<img src={item.preview} alt={`Selected attachment ${index+1}`}/>:<div className="pdfBox">PDF</div>}<div className="photoFields"><strong>Attachment {index+1}</strong><select value={item.category} onChange={e=>updateFile(item.id,{category:e.target.value})}>{PHOTO_CATEGORIES.map(x=><option key={x}>{x}</option>)}</select><input value={item.caption} onChange={e=>updateFile(item.id,{caption:e.target.value})} placeholder="Caption / what this photo shows"/><small>{item.file.name}</small><button type="button" className="remove" onClick={()=>removeFile(item.id)}>Remove</button></div></article>)}</div>}</Section>
 <Section title="6. Progress / Expediting"><Grid><Input n="progress_percent" l="Actual completion %" t="number"/><Input n="planned_progress_percent" l="Planned completion %" t="number"/><Input n="schedule_status" l="Schedule status"/><Input n="estimated_completion_date" l="Estimated completion date" t="date"/></Grid><Area n="critical_outstanding_activities" l="Critical outstanding activities / schedule concerns"/><Area n="vendor_comments" l="Vendor response / recovery plan"/></Section>
 <Section title="7. Inspector Summary"><Area n="inspector_summary" l="Concise inspection summary"/></Section>
 <Section title="8. Overall Inspection Status"><Grid><Select n="overall_status" l="Overall status" opts={["ACCEPTABLE","ACCEPTABLE WITH COMMENTS","NOT ACCEPTABLE","PENDING / INCOMPLETE","NOT READY FOR INSPECTION"]}/><Select n="release_recommended" l="Release recommended?" opts={["Yes","No","N/A"]}/><Input n="next_inspection_date" l="Next inspection date" t="date"/></Grid><div className="inline"><label><input name="reinspection_required" type="checkbox"/> Reinspection required</label><label><input name="follow_up_required" type="checkbox"/> Follow-up required</label></div><Area n="outstanding_actions" l="Outstanding actions"/></Section>
 <Section title="9. Inspector Declaration & Submission"><label className="declare"><input name="declaration_accepted" type="checkbox"/> I certify that this report accurately represents the inspection activities performed and observations made during this assignment.</label><div className="buttons"><button type="submit" disabled={saving}>{saving?"Saving...":"Save Draft"}</button><button type="button" disabled={saving} onClick={()=>{if(formRef.current)void save(formRef.current,true)}}>Submit Report</button></div></Section></form>
 <section className="history"><h2>My reports</h2>{reports.map(r=><article key={r.id}><strong>{r.report_number||r.project_name||"Inspection report"}</strong><span>{r.vendor_name||"Vendor not entered"}</span><span>{r.inspection_date||"No inspection date"}</span><b>{r.status.replaceAll("_"," ")}</b></article>)}{!msg&&reports.length===0&&<p>No reports yet.</p>}</section>
 <style jsx>{`.page{max-width:1100px;margin:auto;padding:30px 18px 70px}.hero,.form,.history{background:#fff;border:1px solid #e2e8f0;border-radius:18px}.hero{padding:28px;margin-bottom:16px}.eyebrow{font-size:.76rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.hero h1{margin:4px 0}.hero p,.hint{color:#64748b}.notice{padding:14px;border-radius:10px;background:#f1f5f9}.form{padding:24px}.section{padding:10px 0 24px;border-bottom:1px solid #e2e8f0}.section:last-child{border:0}.section h2{font-size:1.12rem}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.field{display:grid;gap:6px;margin:10px 0}.field span{font-size:.82rem;font-weight:700}.field input,.field textarea,.field select,.photoFields input,.photoFields select{padding:11px;border:1px solid #cbd5e1;border-radius:9px;font:inherit}.field textarea{min-height:95px}.checks{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.checks label,.inline label,.declare{padding:10px;background:#f8fafc;border-radius:9px}.inline{display:flex;gap:10px;margin:10px 0}.fileInput{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.addPhoto{display:flex;align-items:center;gap:14px;width:100%;max-width:440px;padding:16px;border:2px dashed #94a3b8;border-radius:14px;background:#f8fafc;color:#0f172a;text-align:left;cursor:pointer}.addPhoto .plus{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#0f172a;color:#fff;font-size:2rem;line-height:1}.addPhoto strong,.addPhoto small{display:block}.addPhoto small{margin-top:3px;color:#64748b}.photoGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:16px}.photoCard{border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;background:#fff}.photoCard img,.pdfBox{width:100%;height:220px;object-fit:cover;background:#f1f5f9}.pdfBox{display:grid;place-items:center;font-size:2rem;font-weight:900;color:#64748b}.photoFields{display:grid;gap:8px;padding:12px}.photoFields small{overflow-wrap:anywhere;color:#64748b}.remove{justify-self:start;border:0;background:none;color:#b91c1c;padding:4px 0}.buttons{display:flex;gap:10px;margin-top:16px}.buttons button{padding:12px 18px;border:0;border-radius:9px;background:#0f172a;color:#fff;font-weight:800}.history{margin-top:18px;padding:22px}.history article{display:grid;grid-template-columns:2fr 2fr 1fr 1fr;gap:12px;padding:12px 0;border-top:1px solid #e2e8f0}.history b{text-transform:capitalize}@media(max-width:760px){.page{padding:16px 10px 55px}.hero,.form,.history{border-radius:13px}.hero,.form{padding:17px}.grid,.checks,.photoGrid{grid-template-columns:1fr}.history article{grid-template-columns:1fr}.inline,.buttons{flex-direction:column}.buttons button,.addPhoto{width:100%;max-width:none;min-height:52px}.photoCard img,.pdfBox{height:260px}.field input,.field textarea,.field select,.photoFields input,.photoFields select{font-size:16px}}`}</style></main>
}
function Section(p:{title:string;children:any}){return <section className="section"><h2>{p.title}</h2>{p.children}</section>}
function Grid(p:{children:any}){return <div className="grid">{p.children}</div>}
function Input({n,l,t="text"}:{n:string;l:string;t?:string}){return <label className="field"><span>{l}</span><input name={n} type={t}/></label>}
function Area({n,l}:{n:string;l:string}){return <label className="field"><span>{l}</span><textarea name={n}/></label>}
function Select({n,l,opts}:{n:string;l:string;opts:string[]}){return <label className="field"><span>{l}</span><select name={n} defaultValue=""><option value="">Select...</option>{opts.map(x=><option key={x}>{x}</option>)}</select></label>}
