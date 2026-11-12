import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/** Fictional contract fixtures, strictly for client-demo-facing Agency operations. */
export type AgencyDemoContract = {
  id: string;
  client: string;
  agency: string;
  agreement: string;
  region: string;
  effective: string;
  expires: string;
  status: "Active" | "Renewal due" | "Expired";
  scope: string;
  dayRate: string;
  paymentTerms: string;
  travel: string;
  overtime: string;
  approval: string;
};
export const AGENCY_DEMO_CONTRACTS: readonly AgencyDemoContract[] = [
  {id:"SYN-MSA-2601",client:"Atlas LNG Development",agency:"Northstar Inspection Partners",
   agreement:"Gulf Coast Vendor Surveillance Framework",region:"North America",
   effective:"2026-01-01",expires:"2027-12-31",status:"Active",
   scope:"Vendor surveillance, FAT witnessing and pressure-equipment inspection for fictional LNG projects.",
   dayRate:"USD 1,080/day",paymentTerms:"Net 45",travel:"Mileage capped at USD 85/day; lodging separate",
   overtime:"Weekend and overtime +25% when specifically authorized",
   approval:"Fictional procurement record APPROVED-001; no executed agreement exists"},
  {id:"SYN-MSA-2602",client:"Orion Energy Projects",agency:"Northstar Inspection Partners",
   agreement:"Middle East Mechanical Inspection Framework",region:"Middle East",
   effective:"2026-03-01",expires:"2027-02-28",status:"Active",
   scope:"Fictional compressor FAT, rotating-equipment inspection and expediting across UAE and Qatar.",
   dayRate:"USD 1,240/day",paymentTerms:"Net 30",travel:"Per diem included; airfare reimbursed at cost",
   overtime:"Preapproved additional hours +20%",
   approval:"Fictional procurement record APPROVED-002; no executed agreement exists"},
  {id:"SYN-MSA-2603",client:"Meridian Process Systems",agency:"Northstar Inspection Partners",
   agreement:"European Valve and Fabrication Surveillance",region:"Europe",
   effective:"2025-12-01",expires:"2026-11-30",status:"Renewal due",
   scope:"Synthetic pressure testing, valve inspection and welding surveillance.",
   dayRate:"EUR 980/day",paymentTerms:"Net 45",travel:"Local travel included; hotel separately reimbursable",
   overtime:"Weekend inspection +25% with written scope amendment",
   approval:"Fictional procurement record RENEWAL-003; no executed agreement exists"},
  {id:"SYN-MSA-2604",client:"Bluewater Gulf Projects",agency:"Northstar Inspection Partners",
   agreement:"Offshore Module Quality Assurance Support",region:"North America",
   effective:"2025-09-01",expires:"2026-08-31",status:"Expired",
   scope:"Fictional modular fabrication surveillance, dimensional checks and NCR follow-up.",
   dayRate:"USD 1,110/day",paymentTerms:"Net 30",travel:"Travel days at 50%; offshore transport supplied by client",
   overtime:"No overtime unless separate PO specifically approved",
   approval:"Fictional expired framework ARCHIVED-004; no executed agreement exists"},
] as const;

const plain = (value: string) => value.normalize("NFKD")
  .replace(/[^\x20-\x7E]/g,"?").slice(0,120);

/** Real downloadable PDF, conspicuously fictional, without an e-signature or production lookup. */
export async function createAgencySyntheticContractPdf(record: AgencyDemoContract): Promise<string> {
  if (!AGENCY_DEMO_CONTRACTS.some(contract=>contract.id===record.id))
    throw new Error("Unknown fictional contract");
  const pdf=await PDFDocument.create();
  pdf.setTitle("FICTIONAL SAMPLE - "+record.id);
  pdf.setAuthor("InspectSource synthetic prototype");
  pdf.setSubject("Demo-only, not a legally valid or executed contract");
  const page=pdf.addPage([612,792]);
  const font=await pdf.embedFont(StandardFonts.Helvetica);
  const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
  const draw=(text:string,y:number,size=10,strong=false)=>{
    page.drawText(plain(text),{x:42,y,size,font:strong?bold:font,
      color:strong?rgb(.42,.16,.12):rgb(.12,.18,.28),maxWidth:525});
  };
  draw("FICTIONAL SAMPLE / NOT A LEGAL CONTRACT",748,17,true);
  draw("INSPECTSOURCE AGENCY DEMONSTRATION - NEVER SIGN OR PAY",722,11,true);
  draw("Agreement: "+record.id,686,13,true);
  draw("Client: "+record.client,657);
  draw("Agency: "+record.agency,635);
  draw("Title: "+record.agreement,613);
  draw("Effective: "+record.effective+"   Expiry: "+record.expires,581);
  draw("Status: "+record.status+"   Region: "+record.region,560);
  draw("Fictional scope:",520,12,true);
  draw(record.scope,497);
  draw("Indicative synthetic commercial terms:",457,12,true);
  draw("Day rate: "+record.dayRate+"   Invoice: "+record.paymentTerms,434);
  draw("Travel: "+record.travel,413);
  draw("Overtime: "+record.overtime,392);
  draw("Recorded approval state: "+record.approval,355);
  draw("No client or agency signature, acceptance, e-signature, PO or",289,10,true);
  draw("legally enforceable commitment is represented by this file.",269,10,true);
  draw("All names, values, contracts and projects shown here are examples.",245);
  draw("SAMPLE ONLY - NOT FOR BUSINESS OR FINANCIAL USE",72,12,true);
  return pdf.saveAsBase64({dataUri:true});
}
