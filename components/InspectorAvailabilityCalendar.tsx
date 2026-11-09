"use client";

import { useState } from "react";
import { overlapsPrivateDemoEvent } from "@/lib/demoCalendarConflict";

type View = "Month" | "Week" | "List";
type AvailabilityState = "Available" | "Tentative / Hold" | "Assigned" | "Unavailable" | "Busy";
type CalendarEvent = { date: string; state: AvailabilityState; label: string; external?: boolean; project?: string };

const DEMO_TODAY = "2026-11-09";
const DEMO_EVENTS: CalendarEvent[] = [
  { date: "2026-11-26", state: "Assigned", label: "Orion Deepwater Platform · FAT", project: "Orion Deepwater Platform" },
  { date: "2026-11-27", state: "Assigned", label: "Orion Deepwater Platform · FAT", project: "Orion Deepwater Platform" },
  { date: "2026-10-09", state: "Busy", label: "Doctor Appointment · 10:00–11:00", external: true },
  { date: "2026-10-18", state: "Busy", label: "Our Anniversary · All day", external: true },
  { date: "2026-10-12", state: "Tentative / Hold", label: "Client hold" },
  { date: "2026-10-20", state: "Available", label: "Available" },
  { date: "2026-10-21", state: "Available", label: "Available" },
  { date: "2026-10-26", state: "Unavailable", label: "Blocked by inspector" },
  { date: "2026-11-09", state: "Assigned", label: "Gulf Horizon Refinery Upgrade · Piping surveillance", project: "Gulf Horizon Refinery Upgrade" },
  { date: "2026-11-10", state: "Assigned", label: "Gulf Horizon Refinery Upgrade · Piping surveillance", project: "Gulf Horizon Refinery Upgrade" },
  { date: "2026-11-12", state: "Assigned", label: "LNG Compressor Package · Factory acceptance test", project: "LNG Compressor Package" },
  { date: "2026-11-13", state: "Assigned", label: "LNG Compressor Package · Factory acceptance test", project: "LNG Compressor Package" },
  { date: "2026-11-16", state: "Tentative / Hold", label: "Client request · Hold" },
  { date: "2026-11-18", state: "Busy", label: "Our Anniversary · All day", external: true },
  { date: "2026-11-20", state: "Busy", label: "Doctor Appointment · 10:00–11:00", external: true },
  { date: "2026-11-23", state: "Available", label: "Available" },
  { date: "2026-11-24", state: "Unavailable", label: "Blocked by inspector" },
];

// Use UTC date arithmetic to avoid locale/DST shifts in the static demo.
const monthDays = (month: string) => {
  const [year,number]=month.split("-").map(Number);
  return Array.from({length:new Date(Date.UTC(year,number,0)).getUTCDate()},(_,index)=>index+1);
};
const shiftIsoDate = (date: string, offset: number) => {
  const next=new Date(date+"T00:00:00Z");
  next.setUTCDate(next.getUTCDate()+offset);
  return next.toISOString().slice(0,10);
};
const weekDates = (anchor: string) => {
  const date = new Date(anchor+"T00:00:00Z");
  return Array.from({length:7},(_,index)=>shiftIsoDate(anchor,index-date.getUTCDay()));
};
const dateRange = (start: string,end: string) => {
  const a=Date.parse(start+"T00:00:00Z"),b=Date.parse(end+"T00:00:00Z");
  const length=Math.round((b-a)/86400000)+1;
  if(!Number.isFinite(a)||!Number.isFinite(b)||length<1||length>62) return [];
  return Array.from({length},(_,index)=>shiftIsoDate(start,index));
};
const stateClass = (state: AvailabilityState) => state.toLowerCase().replaceAll(" / ", "-").replaceAll(" ", "-");
// Unscheduled is not equivalent to an inspector declaring the day Available.


export default function InspectorAvailabilityCalendar({ onOpenAssignment }: { onOpenAssignment?: (project: string) => void }) {
  const [view, setView] = useState<View>("Month");
  const [month,setMonth] = useState("2026-11");
  const [weekAnchor,setWeekAnchor]=useState("2026-11-09");
  const days=monthDays(month);
  const [year,monthNumber]=month.split("-").map(Number);
  const monthLabel=new Date(Date.UTC(year,monthNumber-1,1)).toLocaleDateString("en-US",{timeZone:"UTC",month:"long",year:"numeric"});
  const monthOffset=new Date(Date.UTC(year,monthNumber-1,1)).getUTCDay();
  const dateForDay=(day:number)=>month+"-"+String(day).padStart(2,"0");
  const stepMonth=(delta:number)=>{
    const next=new Date(Date.UTC(year,monthNumber-1+delta,1)).toISOString().slice(0,10);
    setMonth(next.slice(0,7));
    setWeekAnchor(next);
    setStart(next);
    setEnd(shiftIsoDate(next,1));
  };
  const selectWeek=(anchor:string)=>{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(anchor))return;
    setWeekAnchor(anchor);
    setMonth(anchor.slice(0,7));
  };
  const stepWeek=(delta:number)=>selectWeek(shiftIsoDate(weekAnchor,delta*7));
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [start, setStart] = useState("2026-11-22");
  const [end, setEnd] = useState("2026-11-23");
  const [blockState, setBlockState] = useState<AvailabilityState>("Unavailable");
  const [notice, setNotice] = useState("");
  const jumpToDemoToday = () => {
    setMonth(DEMO_TODAY.slice(0, 7));
    setWeekAnchor(DEMO_TODAY);
    setStart(DEMO_TODAY);
    setEnd(DEMO_TODAY);
    setNotice("");
  };
  const eventFor = (day: number) => events.filter((event) => event.date === dateForDay(day));
  const connect = (provider: string) => setNotice(`${provider} connection preview — synthetic demo only. OAuth/sync is not enabled.`);

  return <section className="calendarShell" aria-label="Inspector availability calendar">
    <div className="calendarHeader">
      <div><p className="eyebrow">Availability & Calendar</p><h2>{monthLabel}</h2><p>Calendar View is the default. Private titles below are visible only in this inspector demo. Client availability shows Busy, never private event details. Unmarked dates are not confirmed available.</p><div className="monthControls"><button type="button" aria-label="Previous month" onClick={()=>stepMonth(-1)}>Previous month</button><button type="button" aria-label="Next month" onClick={()=>stepMonth(1)}>Next month</button><button type="button" aria-label="Return to demo today, November 9 2026" onClick={jumpToDemoToday}>Today · Nov 9 (demo)</button></div></div>
      <div className="connectors"><button onClick={() => connect("Google Calendar")}>Google Calendar · Connected (demo)</button><button onClick={() => connect("Outlook Calendar")}>Connect Outlook Calendar</button><button onClick={() => connect("Other Calendar")}>Link Other Calendar</button></div>
    </div>
    {notice && <p role="status" className="notice">{notice}</p>}
    <div className="viewTabs" role="group" aria-label="Calendar view">
      {(["Month", "Week", "List"] as View[]).map((item) => <button key={item} aria-pressed={view === item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{item}</button>)}
    </div>
    <div className="legend" aria-label="Availability states">{["Available", "Tentative / Hold", "Assigned", "Unavailable", "Busy"].map((state) => <span key={state} className={stateClass(state as AvailabilityState)}>{state}</span>)}<span className="not-set">Not set</span></div>
    {view === "Month" && <div className="month" aria-label={monthLabel+" month view"}>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <strong className="weekday" key={d}>{d}</strong>)}
      {Array.from({ length: monthOffset }, (_, i) => <span key={`blank-${i}`} aria-hidden="true" />)}
      {days.map((day) => { const dayEvents = eventFor(day); return <article key={day} className="day"><button type="button" className="dayPicker" aria-label={`Choose ${dateForDay(day)} for availability`} aria-current={dateForDay(day)===DEMO_TODAY?"date":undefined} aria-pressed={start===dateForDay(day) && end===dateForDay(day)} onClick={()=>{setStart(dateForDay(day));setEnd(dateForDay(day));setNotice("");}}>{day}</button>{dayEvents.map((event, i) => <span key={i} className={stateClass(event.state)} title={event.external ? "Inspector only; client view: Busy · private details hidden" : event.label}>{event.label}{event.state === "Assigned" && event.project && <button onClick={() => onOpenAssignment?.(event.project!)}>Open assignment</button>}</span>)}{dayEvents.length === 0 && <span className="not-set" title="No inspector availability confirmed for this date">Not set</span>}</article>; })}
    </div>}
    {view === "Week" && <><div className="weekControls"><button type="button" onClick={()=>stepWeek(-1)}>Previous week</button><label>Week containing<input type="date" value={weekAnchor} onChange={e=>selectWeek(e.target.value)}/></label><button type="button" onClick={()=>stepWeek(1)}>Next week</button></div><div className="week" aria-label="Week view">{weekDates(weekAnchor).map(date=>{
      const dayEvents=events.filter(event=>event.date===date);
      return <article key={date}><button type="button" className="weekPicker" aria-label={`Choose ${date} for availability`} aria-current={date===DEMO_TODAY?"date":undefined} aria-pressed={start===date && end===date} onClick={()=>{setStart(date);setEnd(date);setNotice("");}}>{date}</button>{dayEvents.length?dayEvents.map((event,i)=><span key={date+"-"+i} className={stateClass(event.state)}>{event.label}{event.state==="Assigned"&&event.project&&<button type="button" onClick={()=>onOpenAssignment?.(event.project!)}>Open assignment</button>}</span>):<span className="not-set" title="No inspector availability confirmed for this date">Not set</span>}</article>;
    })}</div></>}
    {view === "List" && <div className="list" aria-label="List view">{events.filter(event=>event.date.startsWith(month)).sort((a,b)=>a.date.localeCompare(b.date)).map((event, i) => <article key={`${event.date}-${i}`}><button type="button" className="listPicker" aria-label={`Choose ${event.date} from list for availability`} aria-current={event.date===DEMO_TODAY?"date":undefined} aria-pressed={start===event.date && end===event.date} onClick={()=>{setStart(event.date);setEnd(event.date);setNotice("");}}>{event.date}</button><span className={stateClass(event.state)}>{`${event.state} · ${event.label}`}{event.external && <small>Inspector only · client view: Busy</small>}{event.state === "Assigned" && event.project && <button onClick={() => onOpenAssignment?.(event.project!)}>Open assignment</button>}</span></article>)}</div>}
    <form onSubmit={e => {
      e.preventDefault();
      if (start > end) { setNotice("Choose an ordered date range."); return; }
      const dates=dateRange(start,end);
      if(dates.length===0){setNotice("Choose a valid date range of no more than 62 days.");return;}
      if (events.some(event => dates.includes(event.date) && event.state === "Assigned")) { setNotice("This range includes an assignment. Open the assignment to resolve the conflict first."); return; }
      if (overlapsPrivateDemoEvent(events, dates)) { setNotice("This range overlaps a linked personal Busy event. Choose other dates; private calendar events cannot be overridden in this demo."); return; }
      setEvents(previous => [...previous.filter(event => !dates.includes(event.date) || event.external), ...dates.map(date => ({ date, state: blockState, label: blockState === "Busy" ? "Personal Busy · Inspector only" : blockState }))]);
      setNotice(`${dates.length} dates updated in this synthetic session only.`);
    }}><div className="availabilityActions"><label>Start date<input type="date" required value={start} onChange={e => setStart(e.target.value)}/></label><label>End date<input type="date" required value={end} onChange={e => setEnd(e.target.value)}/></label><label>Availability<select value={blockState} onChange={e => setBlockState(e.target.value as AvailabilityState)}>{["Available", "Tentative / Hold", "Busy", "Unavailable"].map(state => <option key={state}>{state}</option>)}</select></label><button>Block dates / Update availability</button></div></form>
    <p className="safety"><strong>Synthetic demo:</strong> Google connection and imported Busy blocks are simulated. Real Google/Outlook OAuth, calendar permissions and synchronization require reviewed production integration work.</p>
    <style jsx>{`.calendarShell{display:grid;gap:14px}.calendarHeader{display:flex;justify-content:space-between;gap:18px}.calendarHeader h2{margin:3px 0}.calendarHeader p{color:#64748b}.eyebrow{margin:0!important;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#0f766e!important}.connectors,.availabilityActions,.viewTabs,.legend,.monthControls,.weekControls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.monthControls{margin-top:10px}.weekControls label{display:grid;gap:5px;color:#0f172a;font-weight:800}.weekControls input,.availabilityActions input,.availabilityActions select{background:#fff;color:#0f172a;border:1px solid #64748b;border-radius:8px;padding:9px 11px;font:inherit}.weekControls input:hover,.availabilityActions input:hover,.availabilityActions select:hover{border-color:#0f766e}.weekControls input:focus-visible,.availabilityActions input:focus-visible,.availabilityActions select:focus-visible{outline:3px solid #0d9488;outline-offset:2px}.weekControls input:disabled,.availabilityActions input:disabled,.availabilityActions select:disabled{background:#f1f5f9;color:#334155;border-color:#94a3b8;opacity:1;cursor:not-allowed}.calendarShell button{border:1px solid #0f766e;background:#0f766e;color:#fff;border-radius:9px;padding:9px 11px;font-weight:800;cursor:pointer}.calendarShell button:hover{background:#115e59;color:#fff}.calendarShell button:focus-visible{outline:3px solid #5eead4;outline-offset:2px}.viewTabs button{background:#fff;color:#0f766e}.viewTabs button.selected{background:#0f766e;color:#fff}.availabilityActions .secondary{background:#fff;color:#0f766e}.notice,.safety{padding:10px 12px;border-radius:10px;background:#f0fdfa;color:#115e59}.legend span,.day span,.week span,.list span{padding:5px 7px;border-radius:7px;font-size:.76rem;font-weight:800}.available{background:#dcfce7;color:#166534}.tentative-hold{background:#fef3c7;color:#92400e}.assigned{background:#dbeafe;color:#1e40af}.unavailable{background:#fee2e2;color:#991b1b}.busy{background:#e2e8f0;color:#334155}.not-set{background:#f1f5f9;color:#475569}.month{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));border:1px solid #cbd5e1;border-radius:12px;overflow:auto}.weekday{padding:8px;text-align:center;background:#f8fafc}.day{min-height:92px;padding:8px;border-top:1px solid #e2e8f0;border-right:1px solid #e2e8f0;display:grid;align-content:start;gap:7px}.calendarShell .dayPicker{width:44px;min-height:44px;padding:6px;border:1px solid #0f766e;border-radius:8px;background:#fff;color:#115e59;font-weight:900}.calendarShell .dayPicker:hover{background:#ccfbf1;color:#115e59}.calendarShell .dayPicker[aria-pressed=true]{background:#0f766e;color:#fff}.calendarShell .dayPicker:focus-visible{outline:3px solid #0d9488;outline-offset:3px}.calendarShell .dayPicker[aria-current=date],.calendarShell .weekPicker[aria-current=date],.calendarShell .listPicker[aria-current=date]{box-shadow:0 0 0 3px #d97706}.calendarShell .weekPicker{width:100%;min-height:44px;padding:8px;border:1px solid #0f766e;border-radius:8px;background:#fff;color:#115e59;font-weight:900;cursor:pointer}.calendarShell .weekPicker:hover{background:#ccfbf1;color:#115e59}.calendarShell .weekPicker[aria-pressed=true]{background:#0f766e;color:#fff}.calendarShell .weekPicker:focus-visible{outline:3px solid #0d9488;outline-offset:3px}.calendarShell .listPicker{width:max-content;min-width:152px;min-height:44px;padding:8px;border:1px solid #0f766e;border-radius:8px;background:#fff;color:#115e59;font-weight:900;cursor:pointer}.calendarShell .listPicker:hover{background:#ccfbf1;color:#115e59}.calendarShell .listPicker[aria-pressed=true]{background:#0f766e;color:#fff}.calendarShell .listPicker:focus-visible{outline:3px solid #0d9488;outline-offset:3px}.week,.list{display:grid;gap:8px}.week{grid-template-columns:repeat(7,minmax(0,1fr))}.week article,.list article{border:1px solid #e2e8f0;border-radius:10px;padding:10px;display:grid;gap:8px}@media(max-width:760px){.calendarHeader{display:grid}.month{grid-template-columns:repeat(7,minmax(110px,1fr));overflow:auto}.day{min-height:74px}.day span{font-size:.65rem}.week{grid-template-columns:1fr}}`}</style>
  </section>;
}
