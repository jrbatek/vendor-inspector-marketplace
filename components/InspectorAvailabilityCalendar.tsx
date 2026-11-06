"use client";

import { useState } from "react";

type View = "Month" | "Week" | "List";
type AvailabilityState = "Available" | "Tentative / Hold" | "Assigned" | "Unavailable" | "Busy";
type CalendarEvent = { date: string; state: AvailabilityState; label: string; external?: boolean };

const DEMO_EVENTS: CalendarEvent[] = [
  { date: "2026-10-05", state: "Assigned", label: "Orion Deepwater Platform · FAT" },
  { date: "2026-10-06", state: "Assigned", label: "Orion Deepwater Platform · FAT" },
  { date: "2026-10-09", state: "Busy", label: "Doctor Appointment · 10:00–11:00", external: true },
  { date: "2026-10-18", state: "Busy", label: "Our Anniversary · All day", external: true },
  { date: "2026-10-12", state: "Tentative / Hold", label: "Client hold" },
  { date: "2026-10-20", state: "Available", label: "Available" },
  { date: "2026-10-21", state: "Available", label: "Available" },
  { date: "2026-10-26", state: "Unavailable", label: "Blocked by inspector" },
];

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const stateClass = (state: AvailabilityState) => state.toLowerCase().replaceAll(" / ", "-").replaceAll(" ", "-");

export default function InspectorAvailabilityCalendar({ onOpenAssignment }: { onOpenAssignment?: (project: string) => void }) {
  const [view, setView] = useState<View>("Month");
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [start, setStart] = useState("2026-10-22");
  const [end, setEnd] = useState("2026-10-23");
  const [blockState, setBlockState] = useState<AvailabilityState>("Unavailable");
  const [notice, setNotice] = useState("");
  const eventFor = (day: number) => events.filter((event) => Number(event.date.slice(-2)) === day);
  const connect = (provider: string) => setNotice(`${provider} connection preview — synthetic demo only. OAuth/sync is not enabled.`);

  return <section className="calendarShell" aria-label="Inspector availability calendar">
    <div className="calendarHeader">
      <div><p className="eyebrow">Availability & Calendar</p><h2>October 2026</h2><p>Calendar View is the default. Private titles below are visible only in this inspector demo. Client availability shows Busy, never private event details.</p></div>
      <div className="connectors"><button onClick={() => connect("Google Calendar")}>Google Calendar · Connected (demo)</button><button onClick={() => connect("Outlook Calendar")}>Connect Outlook Calendar</button><button onClick={() => connect("Other Calendar")}>Link Other Calendar</button></div>
    </div>
    {notice && <p role="status" className="notice">{notice}</p>}
    <div className="viewTabs" role="tablist" aria-label="Calendar view">
      {(["Month", "Week", "List"] as View[]).map((item) => <button key={item} role="tab" aria-selected={view === item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{item}</button>)}
    </div>
    <div className="legend" aria-label="Availability states">{["Available", "Tentative / Hold", "Assigned", "Unavailable", "Busy"].map((state) => <span key={state} className={stateClass(state as AvailabilityState)}>{state}</span>)}</div>
    {view === "Month" && <div className="month" aria-label="October 2026 month view">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <strong className="weekday" key={d}>{d}</strong>)}
      {Array.from({ length: 4 }, (_, i) => <span key={`blank-${i}`} aria-hidden="true" />)}
      {days.map((day) => { const dayEvents = eventFor(day); return <article key={day} className="day"><b>{day}</b>{dayEvents.map((event, i) => <span key={i} className={stateClass(event.state)} title={event.external ? "Inspector only; client view: Busy · private details hidden" : event.label}>{event.label}{event.state === "Assigned" && <button onClick={() => onOpenAssignment?.("Orion Deepwater Platform")}>Open assignment</button>}</span>)}</article>; })}
    </div>}
    {view === "Week" && <div className="week" aria-label="Week view">{days.slice(3, 10).map((day) => { const event = eventFor(day)[0]; return <article key={day}><strong>Oct {day}</strong><span className={event ? stateClass(event.state) : "available"}>{event ? event.label : "Available"}{event?.state === "Assigned" && <button onClick={() => onOpenAssignment?.("Orion Deepwater Platform")}>Open assignment</button>}</span></article>; })}</div>}
    {view === "List" && <div className="list" aria-label="List view">{events.map((event, i) => <article key={`${event.date}-${i}`}><strong>{event.date}</strong><span className={stateClass(event.state)}>{`${event.state} · ${event.label}`}{event.external && <small>Inspector only · client view: Busy</small>}{event.state === "Assigned" && <button onClick={() => onOpenAssignment?.("Orion Deepwater Platform")}>Open assignment</button>}</span></article>)}</div>}
    <form onSubmit={e => {
      e.preventDefault();
      if (start > end || !start.startsWith("2026-10-") || !end.startsWith("2026-10-")) { setNotice("Choose an ordered date range in October 2026."); return; }
      const dates = days.map(day => `2026-10-${String(day).padStart(2, "0")}`).filter(date => date >= start && date <= end);
      if (events.some(event => dates.includes(event.date) && event.state === "Assigned")) { setNotice("This range includes an assignment. Open the assignment to resolve the conflict first."); return; }
      setEvents(previous => [...previous.filter(event => !dates.includes(event.date) || event.external), ...dates.map(date => ({ date, state: blockState, label: blockState === "Busy" ? "Personal Busy · Inspector only" : blockState }))]);
      setNotice(`${dates.length} dates updated in this synthetic session only.`);
    }}><div className="availabilityActions"><label>Start date<input type="date" required min="2026-10-01" max="2026-10-31" value={start} onChange={e => setStart(e.target.value)}/></label><label>End date<input type="date" required min="2026-10-01" max="2026-10-31" value={end} onChange={e => setEnd(e.target.value)}/></label><label>Availability<select value={blockState} onChange={e => setBlockState(e.target.value as AvailabilityState)}>{["Available", "Tentative / Hold", "Busy", "Unavailable"].map(state => <option key={state}>{state}</option>)}</select></label><button>Block dates / Update availability</button></div></form>
    <p className="safety"><strong>Synthetic demo:</strong> Google connection and imported Busy blocks are simulated. Real Google/Outlook OAuth, calendar permissions and synchronization require reviewed production integration work.</p>
    <style jsx>{`.calendarShell{display:grid;gap:14px}.calendarHeader{display:flex;justify-content:space-between;gap:18px}.calendarHeader h2{margin:3px 0}.calendarHeader p{color:#64748b}.eyebrow{margin:0!important;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#0f766e!important}.connectors,.availabilityActions,.viewTabs,.legend{display:flex;gap:8px;flex-wrap:wrap}.calendarShell button{border:1px solid #0f766e;background:#0f766e;color:#fff;border-radius:9px;padding:9px 11px;font-weight:800;cursor:pointer}.calendarShell button:hover{background:#115e59;color:#fff}.calendarShell button:focus-visible{outline:3px solid #5eead4;outline-offset:2px}.viewTabs button{background:#fff;color:#0f766e}.viewTabs button.selected{background:#0f766e;color:#fff}.availabilityActions .secondary{background:#fff;color:#0f766e}.notice,.safety{padding:10px 12px;border-radius:10px;background:#f0fdfa;color:#115e59}.legend span,.day span,.week span,.list span{padding:5px 7px;border-radius:7px;font-size:.76rem;font-weight:800}.available{background:#dcfce7;color:#166534}.tentative-hold{background:#fef3c7;color:#92400e}.assigned{background:#dbeafe;color:#1e40af}.unavailable{background:#fee2e2;color:#991b1b}.busy{background:#e2e8f0;color:#334155}.month{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border:1px solid #cbd5e1;border-radius:12px;overflow:auto}.weekday{padding:8px;text-align:center;background:#f8fafc}.day{min-height:92px;padding:8px;border-top:1px solid #e2e8f0;border-right:1px solid #e2e8f0;display:grid;align-content:start;gap:7px}.week,.list{display:grid;gap:8px}.week{grid-template-columns:repeat(7,minmax(0,1fr))}.week article,.list article{border:1px solid #e2e8f0;border-radius:10px;padding:10px;display:grid;gap:8px}@media(max-width:760px){.calendarHeader{display:grid}.month{grid-template-columns:repeat(7,minmax(110px,1fr));overflow:auto}.day{min-height:74px}.day span{font-size:.65rem}.week{grid-template-columns:1fr}}`}</style>
  </section>;
}
