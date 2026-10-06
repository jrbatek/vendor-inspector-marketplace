export type QualificationCategory = "Pressure equipment"|"Piping"|"NDT"|"Welding"|"Coatings"|"Electrical"|"Mechanical"|"Rotating equipment"|"Offshore"|"Lifting"|"Quality audits";

export type QualificationCatalogItem={
 id:string;
 name:string;
 issuer:string;
 category:QualificationCategory;
 requirementsUrl:string;
 evidenceHints:string[];
};

/**
 * Public qualification discovery catalogue. Profile state (held/recommended) is
 * deliberately NOT stored here: live state must come from authenticated profile
 * evidence, while demos may join deterministic synthetic evidence separately.
 */
export const INSPECTOR_QUALIFICATION_CATALOG:QualificationCatalogItem[]=[
 {id:"api-510",name:"API 510 Pressure Vessel Inspector",issuer:"API",category:"Pressure equipment",requirementsUrl:"https://www.api.org/products-and-services/individual-certification-programs/certifications/api510",evidenceHints:["pressure-vessel inspection experience","documented API eligibility experience"]},
 {id:"api-570",name:"API 570 Piping Inspector",issuer:"API",category:"Piping",requirementsUrl:"https://www.api.org/products-and-services/individual-certification-programs/certifications/api570",evidenceHints:["in-service piping inspection experience","documented API eligibility experience"]},
 {id:"api-653",name:"API 653 Aboveground Storage Tank Inspector",issuer:"API",category:"Pressure equipment",requirementsUrl:"https://www.api.org/products-and-services/individual-certification-programs/certifications/api653",evidenceHints:["aboveground storage tank inspection experience","documented API eligibility experience"]},
 {id:"asnt-nas410",name:"ASNT NDT Level II / III pathways",issuer:"ASNT",category:"NDT",requirementsUrl:"https://www.asnt.org/certification",evidenceHints:["documented NDT training","method-specific experience hours","vision examination where required"]},
 {id:"iso9712",name:"ISO 9712 NDT Personnel Certification",issuer:"ISO / accredited certification bodies",category:"NDT",requirementsUrl:"https://www.iso.org/standard/83461.html",evidenceHints:["method-specific NDT training","documented industrial experience"]},
 {id:"aws-cwi",name:"AWS Certified Welding Inspector (CWI)",issuer:"AWS",category:"Welding",requirementsUrl:"https://www.aws.org/certification/page/certified-welding-inspector-program",evidenceHints:["welding inspection experience","education/experience combination","vision requirements"]},
 {id:"cswip-31",name:"CSWIP Welding Inspector 3.1",issuer:"TWI Certification",category:"Welding",requirementsUrl:"https://www.cswip.com/certification/welding-inspection",evidenceHints:["welding inspection experience","approved training or qualifying route"]},
 {id:"ampp-cip",name:"AMPP Coating Inspector Program",issuer:"AMPP",category:"Coatings",requirementsUrl:"https://www.ampp.org/education/certification/coating-inspector",evidenceHints:["coating inspection training","field experience appropriate to certification level"]},
 {id:"nfpa70",name:"Electrical inspection / NFPA 70 competency",issuer:"NFPA / employer or jurisdiction",category:"Electrical",requirementsUrl:"https://www.nfpa.org/codes-and-standards/nfpa-70-standard-development/70",evidenceHints:["electrical inspection experience","applicable code training","jurisdiction-specific credentials where required"]},
 {id:"asme-bpvc",name:"ASME BPVC inspection knowledge",issuer:"ASME / authorized inspection programs",category:"Pressure equipment",requirementsUrl:"https://www.asme.org/codes-standards/bpvc-standards",evidenceHints:["pressure equipment inspection experience","applicable code training"]},
 {id:"asme-b31",name:"ASME B31 piping inspection knowledge",issuer:"ASME",category:"Piping",requirementsUrl:"https://www.asme.org/codes-standards/find-codes-standards/b31-code-pressure-piping",evidenceHints:["piping fabrication or in-service inspection experience","applicable B31 code training"]},
 {id:"api-936",name:"API 936 Refractory Personnel",issuer:"API",category:"Mechanical",requirementsUrl:"https://www.api.org/products-and-services/individual-certification-programs",evidenceHints:["refractory installation/inspection experience","documented API eligibility experience"]},
 {id:"api-577",name:"API 577 Welding Inspection and Metallurgy",issuer:"API",category:"Welding",requirementsUrl:"https://www.api.org/products-and-services/standards/important-standards-announcements/577",evidenceHints:["welding inspection experience","metallurgy and welding-process knowledge"]},
 {id:"api-686",name:"API 686 Machinery Installation knowledge",issuer:"API",category:"Rotating equipment",requirementsUrl:"https://www.api.org/products-and-services/standards",evidenceHints:["rotating-equipment installation or inspection experience","machinery alignment/installation knowledge"]},
 {id:"compex",name:"CompEx hazardous-area competency",issuer:"CompEx",category:"Electrical",requirementsUrl:"https://compexcertification.com/qualifications/",evidenceHints:["hazardous-area electrical experience","role-appropriate CompEx training"]},
 {id:"bosieth",name:"BOSIET / FOET offshore safety training",issuer:"OPITO",category:"Offshore",requirementsUrl:"https://opito.com/standards-and-qualifications",evidenceHints:["offshore assignment need","valid role/location-appropriate safety training"]},
 {id:"loler",name:"Lifting equipment inspection competency",issuer:"Applicable national/accredited scheme",category:"Lifting",requirementsUrl:"https://www.hse.gov.uk/work-equipment-machinery/loler.htm",evidenceHints:["lifting-equipment inspection experience","competent-person evidence appropriate to jurisdiction"]},
 {id:"iso9001-auditor",name:"ISO 9001 Quality Management Systems Auditor",issuer:"Accredited training/certification providers",category:"Quality audits",requirementsUrl:"https://www.iso.org/iso-9001-quality-management.html",evidenceHints:["quality-system audit experience","recognized auditor/lead-auditor training where applicable"]}
];

export function searchQualificationCatalog(query:string){
 const q=query.trim().toLowerCase();
 if(!q)return INSPECTOR_QUALIFICATION_CATALOG;
 return INSPECTOR_QUALIFICATION_CATALOG.filter(item=>[item.name,item.issuer,item.category,...item.evidenceHints].some(value=>value.toLowerCase().includes(q)));
}

export function recommendationDisclaimer(){return "Reasonably Obtainable means profile evidence appears relevant to published requirements; it is not a guarantee of eligibility, acceptance, certification, or exam success. Confirm current requirements with the issuing body.";}
