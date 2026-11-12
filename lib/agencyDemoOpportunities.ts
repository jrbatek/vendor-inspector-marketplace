/** Entirely synthetic opportunities. This directory must never be used for actual matching or production applications. */
export type AgencyDemoOpportunity={
 id:string;project:string;client:string;discipline:string;region:string;location:string;
 site:string;vendor:string;status:"Featured"|"Open (demo)"|"Under review (demo)";
 scheduled:string;duration:string;dayRate:string;budget:string;type:string;scope:string;qualification:string;
};
const templates=[
 {project:"Gulf Coast LNG Compression",client:"Atlas LNG Development",discipline:"Rotating equipment",region:"North America",location:"Lake Charles, Louisiana",site:"Compressor module yard",vendor:"Bayou Process Fabrication",dayRate:"USD 1,080/day",qualification:"API 510; API 570; rotating-equipment FAT"},
 {project:"North Sea Valve Surveillance",client:"Meridian Process Systems",discipline:"Valves / piping",region:"Europe",location:"Stavanger, Norway",site:"Valve test facility",vendor:"Nordic Valve Works",dayRate:"EUR 980/day",qualification:"API 570; valve pressure testing"},
 {project:"Qatar Compression Packages",client:"Orion Energy Projects",discipline:"Mechanical QA/QC",region:"Middle East",location:"Ras Laffan, Qatar",site:"Package fabrication yard",vendor:"Falcon Compressor Systems",dayRate:"USD 1,240/day",qualification:"API 510; mechanical FAT"},
 {project:"Brazil Offshore Electrical Modules",client:"Pelagic Energy Brazil",discipline:"Electrical & instrumentation",region:"Latin America",location:"Macaé, Brazil",site:"Offshore equipment assembly",vendor:"Atlantic E&I Fabricators",dayRate:"USD 940/day",qualification:"IECEx knowledge; cable and panel FAT"},
 {project:"Singapore LNG Tank Inspection",client:"Pacific Terminal Works",discipline:"Welding / NDT",region:"Asia",location:"Jurong, Singapore",site:"Tank component workshop",vendor:"Harbour Fabrication Pte",dayRate:"USD 1,110/day",qualification:"AWS CWI; ASNT Level II"},
 {project:"Australian Battery Plant Equipment",client:"Southern Grid Renewables",discipline:"Vendor expediting",region:"Australasia",location:"Perth, Australia",site:"Skid fabrication workshop",vendor:"Westshore Industrial",dayRate:"AUD 1,320/day",qualification:"ISO 9001; vendor inspection / expediting"}
] as const;
const status:AgencyDemoOpportunity["status"][]=["Featured","Open (demo)","Open (demo)","Under review (demo)"];
export const AGENCY_DEMO_OPPORTUNITIES:readonly AgencyDemoOpportunity[]=
 Array.from({length:24},(_,i)=>{
  const p=templates[i%templates.length],wave=Math.floor(i/templates.length);
  return {
   id:"SYN-OPP-"+String(26001+i),project:p.project+(wave?" · Phase "+(wave+1):""),
   client:p.client,discipline:p.discipline,region:p.region,location:p.location,
   site:p.site,vendor:p.vendor,status:status[i%status.length],
   scheduled:"2026-"+String(11+Math.floor(i/12)).padStart(2,"0")+"-"+String(14+i%12).padStart(2,"0"),
   duration:(5+i%4*3)+" workdays",
   dayRate:p.dayRate,budget:"Fictional budget; subject to illustrative scope",
   type:i%2===0?"Agency pool":"Open sourcing (demo)",
   scope:"Witness inspection test stages; review ITP, hold points, NCRs and release documentation.",
   qualification:p.qualification,
  };
 });
export type OpportunityFilters={query:string;region:string;status:string;discipline:string};
export function filterAgencyDemoOpportunities(rows:readonly AgencyDemoOpportunity[],filters:OpportunityFilters){
 const terms=filters.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
 return rows.filter(o=>(filters.region==="All regions"||o.region===filters.region)
   &&(filters.status==="All statuses"||o.status===filters.status)
   &&(filters.discipline==="All disciplines"||o.discipline===filters.discipline)
   &&terms.every(term=>[o.id,o.project,o.client,o.discipline,o.location,o.vendor,o.qualification]
    .join(" ").toLowerCase().includes(term)));
}
