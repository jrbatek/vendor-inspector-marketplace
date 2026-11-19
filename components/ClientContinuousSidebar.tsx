"use client";
import {useEffect,useRef,useState,type MouseEvent} from "react";

const SECTIONS=[
  ["request-inspectors","Request Inspectors",false],
  ["natural-language","Natural Language – AI",true],
  ["email-requirements","Email Requirements",true],
  ["structured-selection","Structured Selection",true],
  ["inspections-in-progress","Inspections in Progress",false],
  ["analytics","Analytics",false],
  ["billing-payment","Billing & Payment",false],
  ["contracts","Contracts",false],
  ["profile","Profile",false],
] as const;

export default function ClientContinuousSidebar(){
 const [active,setActive]=useState<string>("request-inspectors");
 const [mobileOpen,setMobileOpen]=useState(false);
 const explicitNavigation=useRef<string|null>(null);
 useEffect(()=>{
   // Sections can mount after the sidebar hydrates. Resolve on each update,
   // never cache an incomplete set (Firefox can mount lower sections later).
   const resolveElements=()=>SECTIONS.map(([id])=>document.getElementById(id)).filter((el):el is HTMLElement=>Boolean(el));
   let frame=0;
   const update=()=>{
     const elements=resolveElements();
     if(!elements.length)return;
     const threshold=Math.min(240,Math.max(100,window.innerHeight*0.25));
     let current=elements[0].id;
     for(const el of elements){if(el.getBoundingClientRect().top<=threshold)current=el.id;}
     const last=elements[elements.length-1];
     // Highlight Profile at the end of the document, not when it only peeks
     // into the viewport bottom while Contracts remains the reading section.
     const atDocumentEnd=window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-4;
     // A partially visible last section should not steal the active Contracts
     // link merely because the document has reached its scroll limit.
     const profileAtReadingLine=last.getBoundingClientRect().top<=threshold;
     if(atDocumentEnd && (profileAtReadingLine || window.location.hash==="#profile"))current=last.id;
     // Smooth-scrolling to a short section can clamp before its heading reaches
     // the reading threshold (notably Firefox near the document bottom). Honor
     // a clicked/deep-linked section until the reader starts scrolling again.
     const requested=explicitNavigation.current;
     setActive(requested && elements.some(el=>el.id===requested)?requested:current);
   };
   const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
   const onHash=()=>{
     const id=window.location.hash.slice(1);
     if(SECTIONS.some(([key])=>key===id)){
       explicitNavigation.current=id;
       document.getElementById(id)?.scrollIntoView({
         behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",
         block:"start",
       });
       setActive(id);
     }
     schedule();
   };
   const initialFrame=window.requestAnimationFrame(()=>{if(location.hash)onHash();else update();});
   window.addEventListener("scroll",schedule,{passive:true});
   window.addEventListener("resize",schedule);
   const releaseNavigation=()=>{if(explicitNavigation.current){explicitNavigation.current=null;schedule();}};
   const onScrollKey=(event:KeyboardEvent)=>{if(["ArrowDown","ArrowUp","PageDown","PageUp","Home","End"," "].includes(event.key))releaseNavigation();};
   window.addEventListener("wheel",releaseNavigation,{passive:true});
   window.addEventListener("touchstart",releaseNavigation,{passive:true});
   window.addEventListener("pointerdown",releaseNavigation);
   window.addEventListener("keydown",onScrollKey);
   window.addEventListener("hashchange",onHash);
   window.addEventListener("popstate",onHash);
   return()=>{cancelAnimationFrame(initialFrame);cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);window.removeEventListener("wheel",releaseNavigation);window.removeEventListener("touchstart",releaseNavigation);window.removeEventListener("pointerdown",releaseNavigation);window.removeEventListener("keydown",onScrollKey);window.removeEventListener("hashchange",onHash);window.removeEventListener("popstate",onHash)};
 },[]);
 const onNavigate=(event:MouseEvent<HTMLAnchorElement>,id:string)=>{
   // Keep real anchors usable for copying and modified-click; ordinary clicks
   // update shareable history while respecting the system reduced-motion setting.
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const element=document.getElementById(id);
   if(!element)return;
   event.preventDefault();
   // Retain the synthetic inspection-list snapshot when moving between embedded
   // sections. A refresh or Back/Forward must not erase the reviewer's filters.
   // Copy only our demo key, not Next.js internal history fields or live data.
   if(window.location.hash!=="#"+id){
     const saved=window.history.state?.__inspectSourceClientInspectionList;
     window.history.pushState(saved ? {__inspectSourceClientInspectionList:saved} : null,"","#"+id);
   }
   explicitNavigation.current=id;
   setActive(id);
   setMobileOpen(false);
   element.scrollIntoView({
     behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",
     block:"start",
   });
 };
 return <aside className="clientContinuousSide" aria-label="Client Workspace navigation">
   <div className="brand"><small>Client Workspace</small><strong>InspectSource</strong></div>
   <button type="button" className="navToggle" aria-controls="clientContinuousSections" aria-expanded={mobileOpen} onClick={()=>setMobileOpen(open=>!open)}>{mobileOpen?"Hide sections":"Show sections"}</button>
   <nav id="clientContinuousSections" aria-label="Client Workspace sections" className={mobileOpen?"":"mobileClosed"}>
    {SECTIONS.map(([id,label,child])=><a key={id} href={"#"+id} className={child?"subsection":""}
     aria-current={active===id?"location":undefined}
     onClick={event=>onNavigate(event,id)}>{label}</a>)}
   </nav>
   <style jsx>{`
    .clientContinuousSide{position:sticky;top:18px;align-self:start;max-height:calc(100vh - 36px);overflow-y:auto;border-radius:16px;background:#102b50;border:1px solid #1e40af;color:#fff;padding:16px}
    .brand{padding:8px 8px 14px;border-bottom:1px solid #44638b;margin-bottom:10px;display:grid;gap:4px}
    .brand small{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#bfdbfe}
    .brand strong{font-size:1.14rem}
    .navToggle{display:none;align-items:center;justify-content:center;min-height:44px;width:100%;padding:10px;border:1px solid #93c5fd;border-radius:8px;background:#1e40af;color:#fff;font:inherit;font-weight:850;cursor:pointer;margin-bottom:10px}
    .navToggle:hover{background:#1d4ed8;color:#fff}
    .navToggle:focus-visible{outline:3px solid #93c5fd;outline-offset:2px}
    nav{display:grid;gap:3px}
    nav a{border-left:3px solid transparent;border-radius:6px;padding:9px 8px;text-decoration:none;color:#e0efff;font-size:.87rem;font-weight:750}
    nav a.subsection{margin-left:12px;font-size:.8rem;font-weight:650;color:#bfdbfe}
    nav a:hover{background:#1e40af;color:#fff}
    nav a:focus-visible{outline:3px solid #93c5fd;outline-offset:2px;background:#1e40af;color:#fff}
    nav a[aria-current=location]{background:#1d4ed8;color:#fff;border-left-color:#93c5fd;font-weight:900}
    @media(max-width:980px){.clientContinuousSide{position:static;max-height:none}nav{grid-template-columns:repeat(2,minmax(0,1fr))}nav a.subsection{margin-left:0}}
    @media(max-width:600px){.navToggle{display:inline-flex}nav{grid-template-columns:1fr}nav.mobileClosed{display:none}}
   `}</style>
 </aside>;
}
