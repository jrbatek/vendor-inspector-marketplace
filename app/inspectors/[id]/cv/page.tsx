"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

type Item = { name:string; code?:string|null; category?:string|null; region?:string|null; level?:string|null; proficiency?:string|null; certificate_number?:string|null; credential_number?:string|null; issued_on?:string|null; expires_on?:string|null; years_experience?:number|null; provider?:string|null; completed_on?:string|null };
type CvData = {
 inspector_id:string; primary_discipline:string|null; biography:string|null; base_city:string|null; base_state:string|null; base_country:string|null; years_experience:number|null;
 availability_status:string|null; is_verified:boolean|null; inspector_type:string|null; day_rate:number|null; currency:string|null; driving_radius:number|null; distance_unit:string|null;
 domestic_travel:boolean|null; international_travel:boolean|null; remote_review_available:boolean|null; maximum_flight_hours:number|null;
 equipment:Item[]; activities:Item[]; ndt:Item[]; certifications:Item[]; codes:Item[]; industries:Item[]; languages:Item[]; travelCredentials:Item[]; workCountries:Item[]; software:Item[]; training:Item[];
};

export default function AnonymousCvPage(){
 const params=useParams<{id:string}>(); const inspectorId=params?.id; const supabase=useMemo(()=>supabaseBrowser(),[]);
 const [data,setData]=useState<CvData|null>(null); const [message,setMessage]=useState("Loading anonymous CV...");
 useEffect(()=>{if(inspectorId) void load(inspectorId)},[inspectorId]);

 async function load(id:string){
  const [profile,equipment,activities,ndt,certs,codes,industries,languages,travel,countries,software,training]=await Promise.all([
   supabase.from("inspector_profiles").select("inspector_id,primary_discipline,biography,base_city,base_state,base_country,years_experience,availability_status,is_verified,inspector_type,day_rate,currency,driving_radius,distance_unit,domestic_travel,international_travel,remote_review_available,maximum_flight_hours").eq("inspector_id",id).maybeSingle(),
   supabase.from("inspector_equipment").select("equipment_types(name,code,category)").eq("profile_id",id),
   supabase.from("inspector_activities").select("inspection_activities(name,code,category)").eq("profile_id",id),
   supabase.from("inspector_ndt_methods").select("level,certificate_number,issued_on,expires_on,ndt_methods(name,code,category)").eq("profile_id",id),
   supabase.from("inspector_certifications").select("certificate_number,issued_on,expires_on,certifications(name,code,category)").eq("profile_id",id),
   supabase.from("inspector_codes_standards").select("proficiency,years_experience,codes_standards(name,code,category)").eq("profile_id",id),
   supabase.from("inspector_industries").select("industries(name,code,category)").eq("profile_id",id),
   supabase.from("inspector_languages").select("proficiency,languages(name,code,region)").eq("profile_id",id),
   supabase.from("inspector_travel_credentials").select("credential_number,issued_on,expires_on,travel_credentials(name,code,category)").eq("profile_id",id),
   supabase.from("inspector_work_countries").select("countries(name,region,iso_code)").eq("profile_id",id),
   supabase.from("inspector_software").select("proficiency,years_experience,software_tools(name,code,category)").eq("profile_id",id),
   supabase.from("inspector_training").select("provider,completed_on,expires_on,training_types(name,code,category)").eq("profile_id",id),
  ]);
  if(profile.error||!profile.data){setMessage("Anonymous CV not found.");return;}
  const unwrap=(rows:any[]|null,key:string):Item[]=>(rows||[]).map(row=>({...((row[key]||{}) as object),...Object.fromEntries(Object.entries(row).filter(([name])=>name!==key))} as Item)).filter(item=>item.name);
  setData({...(profile.data as any),equipment:unwrap(equipment.data,"equipment_types"),activities:unwrap(activities.data,"inspection_activities"),ndt:unwrap(ndt.data,"ndt_methods"),certifications:unwrap(certs.data,"certifications"),codes:unwrap(codes.data,"codes_standards"),industries:unwrap(industries.data,"industries"),languages:unwrap(languages.data,"languages"),travelCredentials:unwrap(travel.data,"travel_credentials"),workCountries:unwrap(countries.data,"countries"),software:unwrap(software.data,"software_tools"),training:unwrap(training.data,"training_types")}); setMessage("");
 }
 if(!data)return <main className="cvPage"><p>{message}</p></main>;
 const anonymousId=data.inspector_id.replace(/-/g,"").slice(-6).toUpperCase(); const location=[data.base_city,data.base_state,data.base_country].filter(Boolean).join(", ");
 const professionalTitle=data.primary_discipline?`${data.primary_discipline} Inspection Professional`:"Vendor Inspection Professional";
 return <main className="cvPage">
  <div className="toolbar noPrint"><Link href={`/inspectors/${data.inspector_id}`}>Review Qualifications</Link><button onClick={()=>window.print()}>Print / Save as PDF</button></div>
  <article className="sheet">
   <div className="privacy"><strong>Identity protected by InspectSource</strong><span>Direct contact details are released only after both parties accept an engagement.</span></div>
   <header><div><p className="brand">InspectSource</p><h1>{professionalTitle}</h1><p>Inspector #{anonymousId}</p></div><div className="status"><strong>{data.is_verified?"Verified by InspectSource":"Pre-Qualified Inspector"}</strong><span>{data.availability_status||"Availability to confirm"}</span></div></header>
   <div className="meta">{location&&<span>{location}</span>}{data.years_experience!=null&&<span>{data.years_experience}+ years experience</span>}{data.inspector_type&&<span>{data.inspector_type}</span>}</div>
   <div className="stats"><Stat label="Availability" value={data.availability_status||"Contact for availability"}/><Stat label="Day Rate" value={money(data.day_rate,data.currency)}/><Stat label="Travel Coverage" value={data.driving_radius!=null?`${data.driving_radius} ${data.distance_unit||""}`:"Not listed"}/><Stat label="Travel Capability" value={travelSummary(data)}/></div>
   <Section title="Professional Summary"><p>{data.biography||"A professional summary has not yet been provided."}</p></Section>
   <div className="grid"><div><TagSection title="Equipment Experience" items={data.equipment}/><TagSection title="Inspection Activities" items={data.activities}/><DetailSection title="NDT Methods" items={data.ndt}/><DetailSection title="Certifications" items={data.certifications}/><DetailSection title="Codes & Standards" items={data.codes}/><TagSection title="Industry Experience" items={data.industries}/></div><div><Section title="Assignment Fit"><ul className="fit"><li>Primary Discipline: {data.primary_discipline||"Not listed"}</li><li>Inspector Type: {data.inspector_type||"Not listed"}</li><li>Remote Review: {data.remote_review_available?"Available":"Not listed"}</li><li>Domestic Travel: {data.domestic_travel?"Available":"Not listed"}</li><li>International Travel: {data.international_travel?"Available":"Not listed"}</li>{data.maximum_flight_hours!=null&&<li>Maximum Flight Time: {data.maximum_flight_hours} hours</li>}</ul></Section><DetailSection title="Languages" items={data.languages}/><TagSection title="Work Countries" items={data.workCountries}/><DetailSection title="Travel Credentials" items={data.travelCredentials}/><DetailSection title="Software" items={data.software}/><DetailSection title="Training" items={data.training}/></div></div>
   <footer>This qualification CV intentionally excludes the inspector's name, direct email, phone number, employer, and exact address. Identity release is coordinated through InspectSource.</footer>
  </article>
  <style jsx>{`.cvPage{max-width:1050px;margin:0 auto;padding:24px}.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.toolbar button{background:#111827;color:white;border:0;border-radius:9px;padding:10px 14px}.sheet{background:#fff;border:1px solid #d1d5db;border-radius:16px;padding:28px;box-shadow:0 8px 30px rgba(15,23,42,.08)}.privacy{display:flex;justify-content:space-between;gap:15px;background:#111827;color:#fff;border-radius:10px;padding:11px 14px;margin-bottom:18px;font-size:.82rem}.privacy span{opacity:.78}header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #111827;padding-bottom:16px}.brand{font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin:0}h1{margin:5px 0}.status{display:flex;flex-direction:column;text-align:right;gap:6px}.meta{display:flex;gap:8px;flex-wrap:wrap;padding:14px 0}.meta span{background:#f1f5f9;border-radius:999px;padding:6px 9px;font-size:.84rem}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:16px}.stat{border:1px solid #e2e8f0;border-radius:10px;padding:12px}.stat b{display:block;font-size:.72rem;text-transform:uppercase;color:#64748b;margin-bottom:4px}.section{border-top:1px solid #e5e7eb;padding:15px 0}.section h3{margin:0 0 9px}.grid{display:grid;grid-template-columns:1.6fr 1fr;gap:24px}.items{display:flex;gap:7px;flex-wrap:wrap}.items span{border:1px solid #cbd5e1;border-radius:999px;padding:6px 9px;font-size:.82rem}.cards{display:grid;gap:7px}.card{border:1px solid #e2e8f0;border-radius:9px;padding:9px}.card strong{display:block}.card small{color:#64748b}.fit{margin:0;padding-left:18px;line-height:1.7}footer{border-top:1px solid #e5e7eb;margin-top:10px;padding-top:13px;color:#64748b;font-size:.75rem}@media print{.noPrint{display:none}.cvPage{padding:0}.sheet{border:0;box-shadow:none;padding:0}}@media(max-width:760px){header,.privacy{flex-direction:column}.status{text-align:left}.stats,.grid{grid-template-columns:1fr 1fr}}@media(max-width:520px){.stats,.grid{grid-template-columns:1fr}}`}</style>
 </main>;
}
function Stat({label,value}:{label:string;value:string}){return <div className="stat"><b>{label}</b><span>{value}</span></div>}
function Section({title,children}:{title:string;children:React.ReactNode}){return <section className="section"><h3>{title}</h3>{children}</section>}
function TagSection({title,items}:{title:string;items:Item[]}){if(!items.length)return null;return <Section title={title}><div className="items">{items.map((item,i)=><span key={`${item.name}-${i}`}>{item.name}</span>)}</div></Section>}
function DetailSection({title,items}:{title:string;items:Item[]}){if(!items.length)return null;return <Section title={title}><div className="cards">{items.map((item,i)=>{const d=[item.level,item.proficiency,item.years_experience?`${item.years_experience} years`:null,item.certificate_number?`Credential ${item.certificate_number}`:null,item.credential_number?`Credential ${item.credential_number}`:null,item.provider,item.expires_on?`Expires ${item.expires_on}`:null].filter(Boolean);return <div className="card" key={`${item.name}-${i}`}><strong>{item.name}</strong>{d.length>0&&<small>{d.join(" · ")}</small>}</div>})}</div></Section>}
function money(rate:number|null,currency:string|null){if(rate==null)return "Not listed";return `${currency||""} ${rate.toLocaleString()}/day`.trim()}
function travelSummary(d:CvData){const parts=[];if(d.domestic_travel)parts.push("Domestic");if(d.international_travel)parts.push("International");if(d.remote_review_available)parts.push("Remote");return parts.length?parts.join(" · "):"Not listed"}
