import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Clearly fictional contracts; no source connection, credentials or production records. */
export type AgencyDemoContract = {
 id:string; client:string; agreement:string; status:"Active"|"Pending renewal";
 effective:string; expiry:string; geography:string; scope:string; dayRate:string;
 paymentTerms:string; expenses:string; overtime:string; notes:string;
};
export const AGENCY_DEMO_CONTRACTS:readonly AgencyDemoContract[]=[
 {id:"SYN-MSA-2026-001",client:"Atlas LNG Development",agreement:"Gulf Coast Inspection MSA",status:"Active",effective:"2026-01-01",expiry:"2027-12-31",geography:"US Gulf Coast",scope:"Vendor inspection and rotating equipment FAT",dayRate:"USD 1,080/day",paymentTerms:"Net 45",expenses:"Mileage capped at USD 85/day; lodging separately approved",overtime:"Weekend and overtime +25% by written authorization",notes:"Fictional framework agreement for illustrative resource planning only"},
 {id:"SYN-MSA-2026-002",client:"Orion Energy Projects",agreement:"Middle East Vendor Surveillance",status:"Active",effective:"2026-04-01",expiry:"2027-03-31",geography:"UAE, Qatar and Saudi Arabia",scope:"Vendor surveillance, expediting and pressure equipment inspection",dayRate:"USD 1,240/day",paymentTerms:"Net 30",expenses:"Per diem included; airfare at cost on fictional approval",overtime:"Overtime +20%; mobilization separately agreed",notes:"Synthetic agreement; no real client obligation or acceptance"},
 {id:"SYN-MSA-2026-003",client:"Meridian Process Systems",agreement:"European Valve Inspection Framework",status:"Pending renewal",effective:"2025-10-01",expiry:"2026-12-31",geography:"Italy, Germany and Netherlands",scope:"Valve surveillance, ITP witness points and final release review",dayRate:"EUR 980/day",paymentTerms:"Net 45",expenses:"Local travel included; lodging separately approved",overtime:"Weekend +25%; report preparation included",notes:"Fictional renewal workflow; no e-signatures or legal changes"},
];
const printable=(text:string)=>text.normalize("NFKD").replace(/[^\x20-\x7E]/g,"?").slice(0,110);
/** A working browser-generated fictional PDF with explicit nonlegal watermark language. */
export async function createAgencyDemoContractPdf(contract:AgencyDemoContract):Promise<string>{
 const pdf=await PDFDocument.create();
 pdf.setTitle("INSPECTSOURCE SYNTHETIC SAMPLE - "+contract.id);
 pdf.setAuthor("InspectSource Demo");
 pdf.setSubject("FICTIONAL / NOT SIGNED / NOT LEGALLY BINDING");
 const page=pdf.addPage([612,792]);
 const font=await pdf.embedFont(StandardFonts.Helvetica);
 const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
 const ink=rgb(.09,.16,.25);
 const purple=rgb(.32,.16,.56);
 const draw=(value:string,y:number,weight=false,size=10)=>{
  page.drawText(printable(value),{x:38,y,size,font:weight?bold:font,color:weight?purple:ink,maxWidth:535});
 };
 draw("INSPECTSOURCE - SYNTHETIC AGENCY CONTRACT",746,true,16);
 draw("FICTIONAL DOCUMENT - SAMPLE ONLY - NOT VALID FOR LEGAL USE",717,true,10);
 draw("NOT EXECUTED. NO REAL CLIENT OR AGENCY IS PARTY TO THIS SAMPLE.",696,true,9);
 const rows=[
  ["Agreement ID",contract.id],["Client (fictional)",contract.client],["Agreement",contract.agreement],
  ["Demo status",contract.status],["Effective",contract.effective],["Expiry",contract.expiry],
  ["Geographic scope",contract.geography],["Inspection scope",contract.scope],
  ["Fictional day rate",contract.dayRate],["Payment terms",contract.paymentTerms],
  ["Travel and expenses",contract.expenses],["Overtime",contract.overtime],["Notes",contract.notes]
 ];
 let y=650;
 for(const [label,value] of rows){draw(label+":",y,true);draw(value,y-17);y-=43;}
 draw("No e-signature, procurement approval, legal acceptance or payment is enabled.",60,true,9);
 draw("DEMO ONLY / NOT VERIFIED / DO NOT RELY ON THIS DOCUMENT",42,true,9);
 return pdf.saveAsBase64({dataUri:true});
}
