import fs from 'node:fs';
import path from 'node:path';

const dir=process.env.SYNTHETIC_OUT||'.synthetic';
const read=(name)=>JSON.parse(fs.readFileSync(path.join(dir,`${name}.json`),'utf8'));
const inspectors=read('inspectors'),clients=read('clients'),assignments=read('assignments'),schedules=read('schedules'),reports=read('reports'),invoices=read('invoices');
const fail=(m)=>{console.error(`Synthetic QA failed: ${m}`);process.exitCode=1};
const required={inspectors:5000,clients:500,assignments:2000,schedules:10000,reports:5000,invoices:3000};
const scale=Number(process.env.SYNTHETIC_SCALE||1);
for(const [name,min] of Object.entries(required)){const rows={inspectors,clients,assignments,schedules,reports,invoices}[name];const expected=Math.max(name==='clients'?25:name==='inspectors'?100:100,Math.round(min*scale));if(rows.length<expected)fail(`${name}: expected at least ${expected}, got ${rows.length}`)}
if(!inspectors.some(x=>x.availability_status==='Unavailable'))fail('no unavailable inspector edge case');
if(!inspectors.some(x=>x.international_travel))fail('no international travel inspectors');
if(!inspectors.some(x=>x.certifications.some(c=>c.expires_on<'2026-08-31')))fail('no expired certification edge case');
if(!assignments.some(x=>x.actual>x.budget))fail('no over-budget assignments');
if(!assignments.some(x=>x.ncr_count>0))fail('no NCR assignments');
if(!assignments.some(x=>x.reinspection_required))fail('no reinspection edge cases');
if(!invoices.some(x=>x.status==='overdue'))fail('no overdue invoices');
const inspectorIds=new Set(inspectors.map(x=>x.id)),clientIds=new Set(clients.map(x=>x.id)),assignmentIds=new Set(assignments.map(x=>x.id));
for(const a of assignments){if(!inspectorIds.has(a.inspector_id))fail(`orphan inspector ${a.inspector_id}`);if(!clientIds.has(a.client_id))fail(`orphan client ${a.client_id}`)}
for(const s of schedules)if(!inspectorIds.has(s.inspector_id))fail(`orphan schedule inspector ${s.inspector_id}`);
for(const r of reports)if(!assignmentIds.has(r.assignment_id))fail(`orphan report assignment ${r.assignment_id}`);
for(const i of invoices)if(!assignmentIds.has(i.assignment_id))fail(`orphan invoice assignment ${i.assignment_id}`);
if(process.exitCode)process.exit(process.exitCode);
console.log(`Synthetic QA passed: ${inspectors.length.toLocaleString()} inspectors, ${clients.length.toLocaleString()} clients, ${assignments.length.toLocaleString()} assignments, ${schedules.length.toLocaleString()} schedule records, ${reports.length.toLocaleString()} reports, ${invoices.length.toLocaleString()} invoices.`);
