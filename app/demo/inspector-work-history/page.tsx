"use client";

import { useMemo, useState } from "react";
import {
  EMPTY_WORK_HISTORY_FILTERS,
  INSPECTOR_DEMO_WORK_HISTORY,
  filterInspectorWorkHistory,
  inspectorWorkReportHref,
  type WorkHistoryFilters,
} from "@/lib/inspectorWorkHistoryDemo";

type View = "assignments" | "reports";

export default function InspectorWorkHistoryDemo() {
  const [view, setView] = useState<View>("assignments");
  const [filters, setFilters] = useState<WorkHistoryFilters>(EMPTY_WORK_HISTORY_FILTERS);
  const [open, setOpen] = useState<string | null>(null);
  const rows = INSPECTOR_DEMO_WORK_HISTORY;
  const shown = useMemo(() => filterInspectorWorkHistory(rows, filters), [rows, filters]);
  const choose = (key: keyof WorkHistoryFilters, value: string) => setFilters(current => ({ ...current, [key]: value }));
  const options = (key: "client" | "industry" | "commodity" | "status") =>
    Array.from(new Set(rows.map(row => row[key]))).sort();
  const reset = () => { setFilters(EMPTY_WORK_HISTORY_FILTERS); setOpen(null); };
  const reviewed = rows.filter(row => row.status === "Client reviewed").length;
  const ncrs = rows.filter(row => row.ncr).length;
  const invalidDates = Boolean(filters.from && filters.to && filters.from > filters.to);

  return <main className="historyPage">
    <header className="hero">
      <div><p className="eyebrow">InspectorHub · Demo Mode</p><h1>Work History</h1><p>Assignments Performed and Reports Submitted in one place. Every client, inspector, project, supplier, document and finding is a <strong>synthetic demonstration</strong>; no live account or production data is accessed.</p></div>
      <a className="back" href="/demo/inspector">Back to Inspector Demo</a>
    </header>
    <div className="summary" aria-label="Synthetic work history summary">
      <div><strong>{rows.length}</strong><span>Assignments performed</span></div>
      <div><strong>{rows.length}</strong><span>Reports submitted</span></div>
      <div><strong>{reviewed}</strong><span>Client reviewed</span></div>
      <div><strong>{ncrs}</strong><span>Reports with NCR examples</span></div>
    </div>
    <section className="filterCard" aria-label="Work History filters">
      <div className="filterHead"><h2>Find completed work</h2><button type="button" className="reset" onClick={reset}>Reset filters</button></div>
      <div className="filters">
        {(["client","industry","commodity","status"] as const).map(key => <label key={key}>{key === "client" ? "Client" : key === "industry" ? "Industry" : key === "commodity" ? "Commodity" : "Closeout status"}
          <select value={filters[key]} onChange={event => choose(key,event.target.value)}>
            <option value="">All {key === "status" ? "statuses" : key === "industry" ? "industries" : key === "commodity" ? "commodities" : "clients"}</option>
            {options(key).map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>)}
        <label>NCR findings<select aria-label="NCR findings" value={filters.ncr} onChange={event => choose("ncr",event.target.value)}><option value="">All reports</option><option value="with">NCR raised</option><option value="without">No NCR raised</option></select></label>
        <label>Completed from<input type="date" value={filters.from} aria-invalid={invalidDates} aria-describedby="work-history-date-help" onChange={event => choose("from",event.target.value)} /></label>
        <label>Completed through<input type="date" value={filters.to} aria-invalid={invalidDates} aria-describedby="work-history-date-help" onChange={event => choose("to",event.target.value)} /></label>
      </div>
      <p id="work-history-date-help">Dates include completed work on both endpoints of the selected range.</p>
      {invalidDates && <p role="alert">The start date must not be after the end date.</p>}
    </section>
    <div className="tabs" role="group" aria-label="Work History views">
      <button type="button" aria-pressed={view === "assignments"} className={view === "assignments" ? "selected" : ""} onClick={() => setView("assignments")}>Assignments Performed</button>
      <button type="button" aria-pressed={view === "reports"} className={view === "reports" ? "selected" : ""} onClick={() => setView("reports")}>Reports Submitted</button>
    </div>
    <p className="resultCount" role="status">Showing {shown.length} of {rows.length} synthetic {view === "assignments" ? "completed assignments" : "submitted reports"}</p>
    {shown.length === 0 && <section className="empty"><h2>No matching work history</h2><p>Try another client, industry, commodity, status, NCR finding or completed-date range.</p><button type="button" onClick={reset}>Clear filters</button></section>}
    <section className="records" aria-label={view === "assignments" ? "Assignments Performed" : "Reports Submitted"}>
      {shown.map(row => <article className="record" key={row.id}>
        <div className="recordTop"><div><p className="eyebrow">{view === "assignments" ? row.id : row.reportId} · {row.status}</p><h2>{view === "assignments" ? row.project : row.assignmentType}</h2><p>{row.client} · {row.industry} · {row.commodity}</p><p>{row.location} · Completed {row.completed}</p></div><span className="status">Synthetic record</span></div>
        {view === "assignments" ? <>
          <p><strong>Performed:</strong> {row.assignmentType} · {row.start} to {row.completed}</p>
          <button type="button" aria-expanded={open === row.id} aria-controls={"detail-" + row.id} onClick={() => setOpen(open === row.id ? null : row.id)}>{open === row.id ? "Close assignment" : "Open assignment"}</button>
          {open === row.id && <div id={"detail-" + row.id} className="detail">
            <h3>Completed assignment details</h3><p><strong>Project:</strong> {row.project}</p><p><strong>Supplier / site:</strong> {row.vendor} · {row.location}</p>
            <p><strong>Scope:</strong> {row.assignmentType}</p><p><strong>Closeout:</strong> {row.finding}</p>
            <p><strong>Inspection report:</strong> {row.reportId} · Submitted {row.submitted} · {row.ncr ? "NCR example included" : "No NCR raised"}</p>
            <a className="pdfLink" href={inspectorWorkReportHref(row)} target="_blank" rel="noopener noreferrer">View sample PDF</a>
            <a className="pdfLink secondary" href={inspectorWorkReportHref(row,true)}>Download sample PDF</a>
          </div>}
        </> : <div className="reportDetails">
          <p><strong>Submitted:</strong> {row.submitted} · <strong>Vendor:</strong> {row.vendor}</p>
          <p>{row.finding}</p><span>{row.ncr ? "NCR example in report" : "No NCR raised"}</span>
          <div className="actions"><a className="pdfLink" href={inspectorWorkReportHref(row)} target="_blank" rel="noopener noreferrer">Open sample PDF</a><a className="pdfLink secondary" href={inspectorWorkReportHref(row,true)}>Download sample PDF</a></div>
        </div>}
      </article>)}
    </section>
    <p className="footnote">Sample PDFs are generated from fictional inspection facts, visibly watermarked SAMPLE, and are not valid for inspection release, certification or payment.</p>
    <style jsx>{`.historyPage{max-width:1140px;margin:0 auto;padding:24px 18px 70px;color:#0f172a}.hero,.filterCard,.record,.summary>div,.empty{background:#fff;border:1px solid #dbe4e8;border-radius:16px}.hero{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;padding:22px;background:#f0fdfa}.hero h1{margin:4px 0}.hero p{max-width:770px;color:#334155}.eyebrow{font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#115e59;font-weight:900;margin:0}.back{white-space:nowrap;font-weight:800;color:#115e59}.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}.summary>div{padding:17px;display:grid;gap:4px}.summary strong{font-size:1.8rem;color:#115e59}.summary span{color:#475569}.filterCard{padding:18px}.filterHead{display:flex;justify-content:space-between;align-items:center;gap:12px}.filterHead h2{margin:0 0 12px}.filters{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.filters label{font-weight:800;font-size:.85rem;display:grid;gap:6px}.filters select,.filters input{border:1px solid #64748b;color:#0f172a;background:#fff;padding:10px;border-radius:8px;min-width:0;width:100%;font:inherit}.tabs{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}.tabs button{border:1px solid #115e59;background:#fff;color:#115e59}.tabs button.selected{background:#115e59;color:#fff}.resultCount{font-weight:800;margin:15px 0}.records{display:grid;gap:12px}.record{padding:18px}.record h2{margin:5px 0}.record p{margin:7px 0;color:#475569}.recordTop{display:flex;justify-content:space-between;gap:12px}.status{height:max-content;font-size:.76rem;font-weight:900;border-radius:99px;padding:7px 10px;background:#ccfbf1;color:#115e59}.detail{margin-top:14px;padding:16px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:10px}.detail h3{margin-top:0}.reportDetails{border-top:1px solid #e2e8f0;margin-top:10px;padding-top:12px}.reportDetails span{display:inline-block;font-weight:800;color:#115e59}.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}button,.pdfLink{cursor:pointer;border:1px solid #115e59;background:#115e59;color:#fff;padding:10px 12px;font-weight:800;border-radius:8px;text-decoration:none;display:inline-block}.pdfLink.secondary,.reset{background:#fff;color:#115e59}.pdfLink:hover,button:hover{background:#064e3b;color:#fff}.pdfLink.secondary:hover,.reset:hover{background:#f0fdfa;color:#064e3b}.pdfLink:focus-visible,button:focus-visible,.back:focus-visible,select:focus-visible,input:focus-visible{outline:3px solid #0d9488;outline-offset:2px}.empty{padding:24px}.footnote{color:#475569;font-size:.88rem;margin-top:16px}@media(max-width:850px){.summary{grid-template-columns:repeat(2,1fr)}.filters{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:550px){.hero,.recordTop{display:block}.filters,.summary{grid-template-columns:1fr}.back{display:inline-block;margin-top:10px}}`}</style>
  </main>;
}
