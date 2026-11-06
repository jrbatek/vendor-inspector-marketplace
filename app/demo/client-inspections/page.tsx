"use client";

import { useState } from "react";
import ClientWorkspaceSidebar from "@/components/ClientWorkspaceSidebar";
import { ACTIVE_DEMO_INSPECTIONS, EMPTY_INSPECTION_FILTERS, filterActiveInspections, activeInspectionReportHref, type InspectionFilters } from "@/lib/clientActiveInspections";

export default function ClientInspectionsDemo() {
  const [filters, setFilters] = useState<InspectionFilters>(EMPTY_INSPECTION_FILTERS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const rows = filterActiveInspections(ACTIVE_DEMO_INSPECTIONS, filters);
  const update = (key: keyof InspectionFilters, value: string) => { setFilters(current => ({ ...current, [key]: value })); setExpanded(null); };
  const reset = () => { setFilters(EMPTY_INSPECTION_FILTERS); setExpanded(null); };
  const invalidDates = !!(filters.from && filters.to && filters.from > filters.to);

  return <div className="inspectionShell"><ClientWorkspaceSidebar demo /><section className="inspectionWorkspace">
    <header><p className="eyebrow">Client Demo · Synthetic data</p><h1>Inspections in Progress</h1><p>Seven fictional inspections across active delivery stages. No login required. Changes stay in this demo and never affect live work.</p></header>
    <section className="filters" aria-label="Filter inspections">
      <label>Status / stage<select aria-label="Status / stage" value={filters.stage} onChange={e => update("stage", e.target.value)}><option value="">All stages</option>{Array.from(new Set(ACTIVE_DEMO_INSPECTIONS.map(row => row.stage))).map(stage => <option key={stage}>{stage}</option>)}</select></label>
      <label>Project<select aria-label="Project" value={filters.project} onChange={e => update("project", e.target.value)}><option value="">All projects</option>{Array.from(new Set(ACTIVE_DEMO_INSPECTIONS.map(row => row.project))).map(project => <option key={project}>{project}</option>)}</select></label>
      <label>Inspector<select aria-label="Inspector" value={filters.inspector} onChange={e => update("inspector", e.target.value)}><option value="">All inspectors</option>{Array.from(new Set(ACTIVE_DEMO_INSPECTIONS.map(row => row.inspector))).map(inspector => <option key={inspector}>{inspector}</option>)}</select></label>
      <label>Scheduled from<input type="date" value={filters.from} onChange={e => update("from", e.target.value)} aria-invalid={invalidDates} aria-describedby="date-help" /></label>
      <label>Scheduled through<input type="date" value={filters.to} onChange={e => update("to", e.target.value)} aria-invalid={invalidDates} aria-describedby="date-help" /></label>
      <button className="reset" type="button" onClick={reset}>Reset filters</button>
      <p id="date-help">Dates include any inspection overlapping the selected range.</p>
    </section>
    {invalidDates && <p role="alert">The start of the date range must be on or before its end.</p>}
    <p role="status" className="resultCount">{rows.length} of {ACTIVE_DEMO_INSPECTIONS.length} synthetic in-progress inspections</p>
    {rows.length === 0 && <section className="empty"><h2>No inspections match these filters</h2><p>Change the filters or reset to see all seven inspections.</p><button type="button" onClick={reset}>Show all inspections</button></section>}
    <div className="inspectionList">{rows.map(row => {
      const open = expanded === row.id;
      return <article className="inspection" key={row.id}>
        <div className="inspectionSummary"><div><p className="eyebrow">Synthetic · {row.id}</p><h2>{row.project}</h2><p>{row.vendor} · {row.site}</p><p>{row.inspector} · {row.start} to {row.end}</p><strong className="stage">{row.stage}</strong></div><button type="button" aria-expanded={open} aria-controls={`details-${row.id}`} onClick={() => setExpanded(open ? null : row.id)}>{open ? "Close Inspection" : "Open Inspection"}<span className="srOnly"> {row.id}</span></button></div>
        {open && <section id={`details-${row.id}`} className="details" aria-label={`Inspection details ${row.id}`}>
          <h3>Client, project and site</h3><dl><dt>Client</dt><dd>{row.client}</dd><dt>Project</dt><dd>{row.project}</dd><dt>Vendor</dt><dd>{row.vendor}</dd><dt>Site</dt><dd>{row.site}</dd><dt>Contact</dt><dd>{row.contact}</dd><dt>Scope</dt><dd>{row.scope}</dd><dt>Purchase order</dt><dd>{row.po}</dd><dt>Equipment</dt><dd>{row.equipment}</dd><dt>Inspector</dt><dd>{row.inspector}</dd><dt>Schedule</dt><dd>{row.start} to {row.end}</dd></dl>
          <h3>Milestones</h3><ol>{row.milestones.map((milestone, index) => <li key={index}><strong>{milestone.name}</strong> · {milestone.date} · {milestone.status}</li>)}</ol>
          <h3>Reports · SAMPLE ONLY</h3><ul>{row.reports.map(report => <li key={report.id}><a className="reportLink" href={activeInspectionReportHref(row, report)} download>{report.title} · Download synthetic PDF</a></li>)}</ul>
          <h3>NCRs</h3>{row.ncrs.length ? <ul>{row.ncrs.map(ncr => <li key={ncr.id}><strong>{ncr.id}</strong> · {ncr.finding} · {ncr.status}</li>)}</ul> : <p>No NCRs raised in this synthetic scenario.</p>}
          <h3>Outstanding actions</h3><ul>{row.actions.map(action => <li key={action.task}><strong>{action.task}</strong><p>Owner: {action.owner} · Due: {action.due}</p></li>)}</ul>
        </section>}
      </article>;
    })}</div>
    <style jsx>{`
      .inspectionShell{max-width:1440px;margin:auto;padding:18px 18px 72px;display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px;color:#0f172a}.inspectionWorkspace{min-width:0}header,.filters,.inspection,.empty{padding:22px;border:1px solid #cbd5e1;border-radius:14px;background:#fff}header p{color:#475569;line-height:1.6}.eyebrow{color:#1e40af}h1{margin:8px 0}h2{font-size:1.2rem}.filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:16px}.filters p{grid-column:1/-1;margin:0;color:#475569}.filters select,.filters input{color:#0f172a;background:#fff;border-color:#64748b;min-height:44px}.inspectionWorkspace button{background:#1e40af;color:#fff;border:1px solid #1e40af;min-height:44px;font:inherit;font-weight:700}.inspectionWorkspace button:hover{background:#1e3a8a;color:#fff}.inspectionWorkspace button:focus-visible,.reportLink:focus-visible{outline:3px solid #2563eb;outline-offset:3px}.inspectionWorkspace button.reset{background:#fff;color:#1e40af;border:1px solid #1e40af}.resultCount{font-weight:800}.inspectionList{display:grid;gap:14px}.inspectionSummary{display:flex;align-items:center;justify-content:space-between;gap:20px}.inspectionSummary p{color:#475569}.stage{display:inline-block;padding:6px 10px;background:#dbeafe;color:#1e3a8a;border-radius:20px}.details{margin-top:20px;border-top:1px solid #cbd5e1;padding-top:12px;overflow-wrap:anywhere}dl{display:grid;grid-template-columns:140px minmax(0,1fr);gap:10px}dt{font-weight:700}dd{margin:0}.details li{margin-bottom:12px;line-height:1.6}.reportLink{color:#1e40af;font-weight:800;text-decoration:underline}.srOnly{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:980px){.inspectionShell{grid-template-columns:1fr}}@media(max-width:640px){.filters{grid-template-columns:1fr}.inspectionSummary{align-items:start;flex-direction:column}dl{grid-template-columns:1fr}dd{margin-bottom:8px}}
    `}</style>
  </section></div>;
}
