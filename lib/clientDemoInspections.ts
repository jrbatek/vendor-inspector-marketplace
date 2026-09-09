export type DemoInspection={
  id:string;
  project:string;
  projectType:string;
  supplier:string;
  country:string;
  city:string;
  commodity:string;
  inspectionType:string;
  inspector:string;
  date:string;
  status:"Completed"|"In Progress"|"Pending";
  timing:"On time"|"Late"|"Upcoming";
  spendUsd:number;
  ncr:boolean;
  ncrType:string;
  reportId:string;
  reportSummary:string;
};

const projects=[
  {name:"Orion Deepwater Platform",type:"Upstream offshore platform",commodities:["Subsea trees","Pressure vessels","Piping spools","Valves","Rotating equipment","Electrical systems"]},
  {name:"Gulf Horizon Refinery Upgrade",type:"Downstream refinery",commodities:["Heat exchangers","Pressure vessels","Pumps","Valves","Piping","Instrumentation"]},
  {name:"North Sea Aurora Wind",type:"Offshore wind farm",commodities:["Monopiles","Transition pieces","Turbine nacelles","Transformers","Cables","Structural steel"]},
] as const;

const locations=[
  ["Houston","USA"],["Calgary","Canada"],["Monterrey","Mexico"],["Rio de Janeiro","Brazil"],["Aberdeen","United Kingdom"],["Stavanger","Norway"],["Rotterdam","Netherlands"],["Hamburg","Germany"],["Milan","Italy"],["Bilbao","Spain"],["Gdansk","Poland"],["Istanbul","Turkey"],["Dammam","Saudi Arabia"],["Doha","Qatar"],["Abu Dhabi","UAE"],["Muscat","Oman"],["Mumbai","India"],["Chennai","India"],["Singapore","Singapore"],["Johor Bahru","Malaysia"],["Batam","Indonesia"],["Busan","South Korea"],["Ulsan","South Korea"],["Shanghai","China"],["Suzhou","China"],["Yokohama","Japan"],["Perth","Australia"],["Cape Town","South Africa"],["Lagos","Nigeria"],["Maputo","Mozambique"]
] as const;

const suppliers=[
  "Atlas Process Systems","Bluewater Subsea Fabrication","Northstar Valve Works","Meridian Rotating Equipment","Gulf Alloy Piping","Pacific Heat Transfer","Nordic Steel Structures","Harbor Electrical Systems","Crescent Pressure Equipment","Oceanic Cable Systems","Vector Turbine Components","Summit Instrumentation","Global Forging Works","Seaboard Fabrication","Prime Pump Systems"
];

const inspectionTypes=["Vendor surveillance","Hold-point witness","FAT witness","Material verification","Welding inspection","Final release inspection","Expediting visit"];
const inspectors=["Inspector IS-1042","Inspector IS-1187","Inspector IS-1239","Inspector IS-1314","Inspector IS-1426","Inspector IS-1508","Inspector IS-1671","Inspector IS-1733"];
const ncrTypes=["Material traceability","Welding","Documentation","Dimensional","Coating"];

export const DEMO_INSPECTIONS:DemoInspection[]=Array.from({length:60},(_,i)=>{
  const p=projects[i%projects.length];
  const loc=locations[(i*7)%locations.length];
  const ncr=i%13===7;
  const month=3+Math.floor(i/10);
  const day=2+((i*3)%24);
  const date=`2026-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const id=`IS-${String(5001+i)}`;
  const status:DemoInspection["status"]=i<55?"Completed":i<58?"In Progress":"Pending";
  const timing:DemoInspection["timing"]=status!=="Completed"?"Upcoming":i%9===4?"Late":"On time";
  const spendUsd=status==="Pending"?0:1650+((i*487)%6200);
  const ncrType=ncr?ncrTypes[i%ncrTypes.length]:"None";
  return {
    id,
    project:p.name,
    projectType:p.type,
    supplier:suppliers[(i*5)%suppliers.length],
    city:loc[0],
    country:loc[1],
    commodity:p.commodities[i%p.commodities.length],
    inspectionType:inspectionTypes[i%inspectionTypes.length],
    inspector:inspectors[i%inspectors.length],
    date,
    status,
    timing,
    spendUsd,
    ncr,
    ncrType,
    reportId:`RPT-${String(260001+i)}`,
    reportSummary:ncr?`Inspection completed with one ${ncrType.toLowerCase()} non-conformance. Corrective action requested and follow-up verification required.`:"Inspection completed with no non-conformances. Required documents and release evidence were reviewed and accepted for this inspection stage."
  };
});

export const DEMO_COMPLETED=DEMO_INSPECTIONS.filter(x=>x.status==="Completed");
export const DEMO_NCR_RATE=DEMO_COMPLETED.length?DEMO_COMPLETED.filter(x=>x.ncr).length/DEMO_COMPLETED.length*100:0;
