import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

export const runtime = "nodejs";

const clean=(value:string|null,fallback:string)=>String(value||fallback).slice(0,120);

export async function GET(request:NextRequest){
  const q=request.nextUrl.searchParams;
  const id=clean(q.get("id"),"RPT-260001");
  const project=clean(q.get("project"),"Gulf Horizon Refinery Upgrade");
  const supplier=clean(q.get("supplier"),"Synthetic Equipment Supplier");
  const location=clean(q.get("location"),"Houston, USA");
  const date=clean(q.get("date"),"2026-09-01");
  const commodity=clean(q.get("commodity"),"Pressure equipment");
  const inspection=clean(q.get("inspection"),"Vendor surveillance");
  const inspector=clean(q.get("inspector"),"Inspector IS-1042");
  const ncr=q.get("ncr")==="1";

  const pdf=await PDFDocument.create();
  const page=pdf.addPage([612,792]);
  const regular=await pdf.embedFont(StandardFonts.Helvetica);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const navy=rgb(0.06,0.09,0.16),teal=rgb(0.06,0.46,0.43),gray=rgb(0.39,0.45,0.54),light=rgb(0.95,0.97,0.98),red=rgb(0.73,0.11,0.11);

  page.drawText("SAMPLE",{x:105,y:345,size:92,font:bold,color:rgb(0.88,0.90,0.92),rotate:degrees(32),opacity:.45});
  page.drawText("InspectSource",{x:44,y:744,size:22,font:bold,color:navy});
  page.drawText("STANDARD INSPECTION REPORT",{x:44,y:716,size:11,font:bold,color:teal});
  page.drawLine({start:{x:44,y:704},end:{x:568,y:704},thickness:1,color:teal});
  page.drawText(id,{x:44,y:676,size:18,font:bold,color:navy});
  page.drawText(`Inspection date: ${date}`,{x:390,y:680,size:9,font:regular,color:gray});

  const fields=[["Project",project],["Supplier",supplier],["Location",location],["Commodity",commodity],["Inspection activity",inspection],["Inspector",inspector]];
  let y=638;
  fields.forEach(([label,value],i)=>{const col=i%2,row=Math.floor(i/2),x=44+col*262,yy=y-row*58;page.drawRectangle({x,y:yy-34,width:246,height:46,color:light,borderColor:rgb(.86,.89,.93),borderWidth:1});page.drawText(label.toUpperCase(),{x:x+10,y:yy-6,size:7,font:bold,color:gray});page.drawText(value,{x:x+10,y:yy-23,size:10,font:bold,color:navy,maxWidth:225});});

  const section=(title:string,body:string,top:number)=>{page.drawText(title,{x:44,y:top,size:12,font:bold,color:navy});page.drawText(body,{x:44,y:top-22,size:9.5,font:regular,color:gray,maxWidth:520,lineHeight:14});};
  section("Scope performed","Scheduled inspection activities were performed against the client inspection and test plan. Documentation, identification, workmanship and planned hold/witness points were reviewed for the stage inspected.",448);
  section("Inspection result",ncr?"One non-conformance was raised for material traceability. Corrective evidence and follow-up verification are required before final release.":"No non-conformance was raised. The inspected stage was accepted for progression to the next planned manufacturing or release milestone.",378);

  page.drawText("Findings / NCR",{x:44,y:300,size:12,font:bold,color:navy});
  page.drawRectangle({x:44,y:248,width:524,height:36,color:ncr?rgb(1,.95,.95):rgb(.94,.99,.97),borderColor:ncr?red:teal,borderWidth:1});
  page.drawText(ncr?"NCR-001 - Material traceability documentation incomplete; corrective action required.":"No NCRs raised during this inspection.",{x:56,y:270,size:9.5,font:bold,color:ncr?red:teal,maxWidth:500});
  page.drawText("Photographs",{x:44,y:216,size:12,font:bold,color:navy});
  [44,220,396].forEach((x,i)=>{page.drawRectangle({x,y:116,width:160,height:82,color:light,borderColor:rgb(.70,.74,.79),borderWidth:1,borderDashArray:[4,3]});page.drawText(`Photo placeholder ${i+1}`,{x:x+34,y:153,size:9,font:regular,color:gray});});
  page.drawText("Synthetic demonstration report - SAMPLE ONLY",{x:44,y:78,size:8,font:bold,color:gray});
  page.drawText("This document contains fictional data and is not valid for release, acceptance, payment or certification.",{x:44,y:62,size:8,font:regular,color:gray,maxWidth:520});

  const bytes=await pdf.save();
  return new NextResponse(Buffer.from(bytes),{headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="${id}-SAMPLE.pdf"`,"Cache-Control":"no-store"}});
}
