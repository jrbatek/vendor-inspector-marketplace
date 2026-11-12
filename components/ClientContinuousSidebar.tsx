"use client";
import {useEffect,useState,type MouseEvent} from "react";

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
 useEffect(()=>{
   const elements=SECTIONS.map(([id])=>document.getElementById(id)).filter((el):el is HTMLElement=>Boolean(el));
   if(!elements.length)return;
   let frame=0;
   const update=()=>{
     const threshold=Math.min(240,Math.max(100,window.innerHeight*0.25));
     let current=elements[0].id;
     for(const el of elements){if(el.getBoundingClientRect().top<=threshold)current=el.id;}
     const last=elements[elements.length-1];
     if(last.getBoundingClientRect().top<=Math.max(threshold,window.innerHeight-16)||
        window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-4)current=last.id;
     setActive(current);
   };
   const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(update);};
   const onHash=()=>{
     const id=window.location.hash.slice(1);
     if(SECTIONS.some(([key])=>key===id)){
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
   window.addEventListener("hashchange",onHash);
   window.addEventListener("popstate",onHash);
   return()=>{cancelAnimationFrame(initialFrame);cancelAnimationFrame(frame);window.removeEventListener("scroll",schedule);window.removeEventListener("resize",schedule);window.removeEventListener("hashchange",onHash);window.removeEventListener("popstate",onHash)};
 },[]);
 const onNavigate=(event:MouseEvent<HTMLAnchorElement>,id:string)=>{
   // Keep real anchors usable for copying and modified-click; ordinary clicks
   // update shareable history while respecting the system reduced-motion setting.
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const element=document.getElementById(id);
   if(!element)return;
   event.preventDefault();
   if(window.location.hash!=="#"+id)window.history.pushState(null,"","#"+id);
   setActive(id);
   element.scrollIntoView({
     behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",
     block:"start",
   });
 };
 return <aside className="clientContinuousSide" aria-label="Client Workspace navigation">
   <div className="brand"><small>Client Workspace</small><strong>InspectSource</strong></div>
   <nav aria-label="Client Workspace sections">
    {SECTIONS.map(([id,label,child])=><a key={id} href={"#"+id} className={child?"subsection":""}
     aria-current={active===id?"location":undefined}
     onClick={event=>onNavigate(event,id)}>{label}</a>)}
   </nav>
   <style jsx>{`
    .clientContinuousSide{position:sticky;top:18px;align-self:start;max-height:calc(100vh - 36px);overflow-y:auto;border-radius:16px;background:#102b50;border:1px solid #1e40af;color:#fff;padding:16px}
    .brand{padding:8px 8px 14px;border-bottom:1px solid #44638b;margin-bottom:10px;display:grid;gap:4px}
    .brand small{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#bfdbfe}
    .brand strong{font-size:1.14rem}
    nav{display:grid;gap:3px}
    nav a{border-left:3px solid transparent;border-radius:6px;padding:9px 8px;text-decoration:none;color:#e0efff;font-size:.87rem;font-weight:750}
    nav a.subsection{margin-left:12px;font-size:.8rem;font-weight:650;color:#bfdbfe}
    nav a:hover{background:#1e40af;color:#fff}
    nav a:focus-visible{outline:3px solid #93c5fd;outline-offset:2px;background:#1e40af;color:#fff}
    nav a[aria-current=location]{background:#1d4ed8;color:#fff;border-left-color:#93c5fd;font-weight:900}
    @media(max-width:980px){.clientContinuousSide{position:static;max-height:none}nav{grid-template-columns:repeat(2,minmax(0,1fr))}nav a.subsection{margin-left:0}}
    @media(max-width:600px){nav{grid-template-columns:1fr}}
   `}</style>
 </aside>;
}
