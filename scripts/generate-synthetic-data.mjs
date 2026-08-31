import fs from 'node:fs';
import path from 'node:path';

const outDir = process.env.SYNTHETIC_OUT || '.synthetic';
const scale = Number(process.env.SYNTHETIC_SCALE || 1);
const counts = {
  inspectors: Math.max(100, Math.round(5000 * scale)),
  clients: Math.max(25, Math.round(500 * scale)),
  assignments: Math.max(100, Math.round(2000 * scale)),
  schedules: Math.max(200, Math.round(10000 * scale)),
  reports: Math.max(100, Math.round(5000 * scale)),
  invoices: Math.max(100, Math.round(3000 * scale)),
};

let seed = Number(process.env.SYNTHETIC_SEED || 20260831) >>> 0;
function rnd() { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 2 ** 32; }
function pick(a) { return a[Math.floor(rnd() * a.length)]; }
function int(min, max) { return Math.floor(rnd() * (max - min + 1)) + min; }
function chance(p) { return rnd() < p; }
function id(prefix, i) { return `${prefix}_${String(i + 1).padStart(6, '0')}`; }
function isoDay(offset) { const d = new Date(Date.UTC(2026, 7, 31 + offset)); return d.toISOString().slice(0, 10); }
function money(min, max, step = 25) { return Math.round((min + rnd() * (max - min)) / step) * step; }

const cities = [
  ['Houston','Texas','United States','USD'],['Tomball','Texas','United States','USD'],['Corpus Christi','Texas','United States','USD'],
  ['Edmonton','Alberta','Canada','CAD'],['Calgary','Alberta','Canada','CAD'],['Singapore','','Singapore','SGD'],['Kuala Lumpur','','Malaysia','MYR'],
  ['Abu Dhabi','','United Arab Emirates','AED'],['Doha','','Qatar','QAR'],['Riyadh','','Saudi Arabia','SAR'],['Rotterdam','','Netherlands','EUR'],
  ['Hamburg','','Germany','EUR'],['Milan','','Italy','EUR'],['Oslo','','Norway','NOK'],['Sao Paulo','','Brazil','BRL'],['Mumbai','','India','INR'],
  ['Yokohama','','Japan','JPY'],['Ulsan','','South Korea','KRW'],['Shanghai','','China','CNY'],['Perth','Western Australia','Australia','AUD']
];
const disciplines = ['Pressure Equipment','Piping Inspection','Welding Inspection','NDT','Coating Inspection','Electrical Inspection','Rotating Equipment','Static Equipment','Quality/Audit'];
const certs = ['API 510','API 570','API 653','AWS CWI','CSWIP 3.1','AMPP CIP Level 2','ASNT Level II UT','ASNT Level II MT','ASNT Level II PT','ISO 9001 Lead Auditor','CompEx','TWIC'];
const equipment = ['Pressure Vessel','Process Piping','Heat Exchanger','Storage Tank','Valve','Pump','Compressor','Boiler','Structural Steel','Electrical Switchgear','Transformer','Skid Package'];
const industries = ['Refinery / Petrochemical','LNG','Upstream Oil & Gas','Power Generation','Chemical','Data Center','Renewables','Mining','Marine / Offshore'];
const activities = ['Visual Inspection','Vendor Surveillance','Document Review','Hydrotest Witness','FAT Witness','Welding Inspection','Dimensional Inspection','UT','MT','PT','Coating Inspection','Expediting'];
const supplierNames = ['Gulf Fabrication','Atlas Pressure Systems','Northstar Valves','Pacific Modules','EuroHeat Exchangers','Redwood Piping','Delta Rotating','Summit Steelworks','Orion Electrical','Bluewater Packages'];
const projectNames = ['Gulf Coast Refinery Expansion','North Basin LNG Train 4','Atlas Chemicals Debottleneck','Orion Data Center Campus','Harbor Power Upgrade','Desert Compression Program','Pacific Module Program','Baltic Terminal Expansion'];
const statuses = ['planned','matched','confirmed','in_progress','client_action_needed','delayed','completed','cancelled'];

function inspector(i) {
  const loc = pick(cities); const years = int(1, 35); const primary = pick(disciplines); const currency = loc[3];
  const dayRateBase = currency === 'JPY' ? money(70000,150000,5000) : currency === 'KRW' ? money(700000,1600000,50000) : currency === 'INR' ? money(25000,80000,2500) : money(450,1400,25);
  const unavailable = chance(.12); const expiringSoon = chance(.12); const expired = chance(.05);
  const certCount = int(1,5); const chosenCerts = [...new Set(Array.from({length:certCount},()=>pick(certs)))];
  return {
    id:id('insp',i), anonymous_id:`Inspector #${Math.floor(rnd()*0xffffff).toString(16).toUpperCase().padStart(6,'0')}`,
    primary_discipline:primary, years_experience:years, base_city:loc[0], base_state:loc[1], base_country:loc[2], currency,
    day_rate:dayRateBase, availability_status:unavailable?'Unavailable':'Available', available_from:unavailable?isoDay(int(30,120)):isoDay(int(-10,20)),
    domestic_travel:chance(.85), international_travel:chance(.45), is_verified:chance(.72), rating:Number((3.6+rnd()*1.4).toFixed(1)),
    certifications:chosenCerts.map((name,idx)=>({name, certificate_number:`SYN-${i+1}-${idx+1}`, expires_on:expired?isoDay(-int(1,400)):expiringSoon?isoDay(int(1,90)):isoDay(int(180,1400))})),
    equipment:[...new Set(Array.from({length:int(1,6)},()=>pick(equipment)))], industries:[...new Set(Array.from({length:int(1,4)},()=>pick(industries)))], activities:[...new Set(Array.from({length:int(1,6)},()=>pick(activities)))]
  };
}

function client(i){const loc=pick(cities);return{id:id('client',i),organization:`Synthetic Client ${String(i+1).padStart(4,'0')}`,city:loc[0],country:loc[2],default_currency:loc[3],enterprise:chance(.28),api_enabled:chance(.18)};}
function assignment(i, inspectors, clients){const client=pick(clients), inspector=pick(inspectors), start=int(-180,180), duration=int(1,45), budget=inspector.day_rate*duration, over=chance(.18), actual=Math.round(budget*(over?(1.02+rnd()*.28):(.62+rnd()*.36)));return{id:id('asg',i),client_id:client.id,inspector_id:inspector.id,project:pick(projectNames),supplier:pick(supplierNames),location:`${pick(cities)[0]}, ${pick(cities)[2]}`,start_date:isoDay(start),end_date:isoDay(start+duration),status:pick(statuses),budget,actual,percent_used:Math.round(actual/budget*100),currency:inspector.currency,ncr_count:chance(.35)?int(1,6):0,reinspection_required:chance(.09),client_rating:Number((3.5+rnd()*1.5).toFixed(1))};}

fs.rmSync(outDir,{recursive:true,force:true}); fs.mkdirSync(outDir,{recursive:true});
const inspectors = Array.from({length:counts.inspectors},(_,i)=>inspector(i));
const clients = Array.from({length:counts.clients},(_,i)=>client(i));
const assignments = Array.from({length:counts.assignments},(_,i)=>assignment(i,inspectors,clients));
const schedules = Array.from({length:counts.schedules},(_,i)=>{const ins=pick(inspectors),start=int(-90,240);return{id:id('sch',i),inspector_id:ins.id,type:pick(['assignment','travel','blocked','tentative']),start_date:isoDay(start),end_date:isoDay(start+int(0,14))};});
const reports = Array.from({length:counts.reports},(_,i)=>{const a=pick(assignments);return{id:id('rpt',i),assignment_id:a.id,type:pick(['Visit Report','Final Report','NCR','Photo Report','Release Note']),submitted_on:isoDay(int(-180,180)),ncr:chance(.18),custom_format:chance(.35)};});
const invoices = Array.from({length:counts.invoices},(_,i)=>{const a=pick(assignments);const amount=Math.max(50,Math.round(a.actual*(.1+rnd()*.9)));return{id:id('inv',i),assignment_id:a.id,amount,currency:a.currency,status:pick(['draft','issued','paid','overdue']),platform_fee_percent:pick([5,7.5,10]),purchase_order:chance(.8)?`PO-${int(10000,99999)}`:null};});

const sets={inspectors,clients,assignments,schedules,reports,invoices};
for(const [name,rows] of Object.entries(sets)) fs.writeFileSync(path.join(outDir,`${name}.json`),JSON.stringify(rows));
const summary={seed:Number(process.env.SYNTHETIC_SEED||20260831),scale,counts:Object.fromEntries(Object.entries(sets).map(([k,v])=>[k,v.length])),edgeCases:{unavailableInspectors:inspectors.filter(x=>x.availability_status==='Unavailable').length,expiredCertifications:inspectors.flatMap(x=>x.certifications).filter(x=>x.expires_on<isoDay(0)).length,overBudgetAssignments:assignments.filter(x=>x.actual>x.budget).length,ncrAssignments:assignments.filter(x=>x.ncr_count>0).length,internationalInspectors:inspectors.filter(x=>x.international_travel).length}};
fs.writeFileSync(path.join(outDir,'summary.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary,null,2));
