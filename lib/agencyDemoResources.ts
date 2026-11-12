/** Deterministic, fictional browser-only Agency marketplace sample. Never import into production DB. */
export const AGENCY_SYNTHETIC_RESOURCE_TOTAL = 2823;
export type AgencyResource = {
  id:string; name:string; relationship:"Employee"|"Subcontractor"|"Affiliate";
  affiliation:"Verified"|"Expiring"|"Confirmation pending"|"Disputed";
  region:string; coverage:string; capacity:string; expertise:string;
  dayRate:string; terms:string; commercialPackage:string;
};
export const AGENCY_FEATURED_RESOURCES:AgencyResource[] = [
  {id:"IS-20418",name:"Maya Chen",relationship:"Employee",affiliation:"Verified",region:"North America",coverage:"Houston / Gulf Coast",capacity:"Available Nov 12, 2026",expertise:"API 510 / Pressure Vessels",dayRate:"USD 1,080/day",terms:"Net 45",commercialPackage:"Mileage capped; lodging separate"},
  {id:"IS-11742",name:"Omar Haddad",relationship:"Subcontractor",affiliation:"Verified",region:"Middle East",coverage:"UAE / Qatar",capacity:"Available Nov 14, 2026",expertise:"Rotating equipment / FAT",dayRate:"USD 1,240/day",terms:"Net 30",commercialPackage:"Per diem included; airfare separate"},
  {id:"IS-33091",name:"Elena Rossi",relationship:"Affiliate",affiliation:"Expiring",region:"Europe",coverage:"Italy / Central Europe",capacity:"Available Nov 16, 2026",expertise:"Valves / API 570",dayRate:"EUR 980/day",terms:"Net 45",commercialPackage:"Local travel included; OT +25%"},
  {id:"IS-28106",name:"Daniel Okafor",relationship:"Subcontractor",affiliation:"Confirmation pending",region:"Africa",coverage:"West Africa",capacity:"Available Nov 19, 2026",expertise:"Welding / AWS CWI",dayRate:"USD 900/day",terms:"Net 30",commercialPackage:"Travel time separately billable"},
  {id:"IS-44127",name:"Priya Nair",relationship:"Affiliate",affiliation:"Disputed",region:"Asia",coverage:"India / Middle East",capacity:"Blocked",expertise:"Electrical / Instrumentation",dayRate:"USD 860/day",terms:"Net 60",commercialPackage:"Commercials held pending dispute"},
];
const given=["Alex","Jordan","Taylor","Morgan","Avery","Casey","Sam","Riley","Robin","Jamie","Harper","Drew","Quinn","Bailey","Cameron","Ellis","Hayden","Sasha","Emery","Arden"];
const family=["Patel","Nguyen","Santos","Kim","Garcia","Miller","Khan","Brown","Silva","Martin","Wilson","Okoro","Tanaka","Lopez","Anderson","Ibrahim","Novak","Fischer","Lee","Pereira"];
const regions=["North America","Middle East","Europe","Africa","Asia","Australasia","Latin America"];
const coverages=["Houston / Gulf Coast","UAE / Qatar","Italy / Central Europe","West Africa","India / Middle East","Australia / Pacific","Brazil / Andean Region"];
const expertise=["API 510 / Pressure Vessels","Rotating equipment / FAT","Valves / API 570","Welding / AWS CWI","Electrical / Instrumentation","NDT / ASNT Level II","Expediting / Vendor Quality"];
const relations:AgencyResource["relationship"][]=["Employee","Subcontractor","Affiliate"];
const affiliations:AgencyResource["affiliation"][]=["Verified","Verified","Verified","Expiring","Confirmation pending","Disputed"];
export function createAgencySyntheticResourcePool():AgencyResource[]{
  const result=[...AGENCY_FEATURED_RESOURCES];
  for(let index=result.length; index<AGENCY_SYNTHETIC_RESOURCE_TOTAL;index++){
    const area=index%regions.length;
    result.push({
      id:"IS-"+String(50000+index).padStart(5,"0"),
      name:given[index%given.length]+" "+family[Math.floor(index/given.length)%family.length],
      relationship:relations[index%relations.length],
      affiliation:affiliations[index%affiliations.length],
      region:regions[area],coverage:coverages[area],expertise:expertise[area],
      capacity:index%9===0?"Assigned":index%8===0?"On hold":"Available (demo)",
      dayRate:"USD "+String(780+(index%12)*65)+"/day",
      terms:index%2===0?"Net 30":"Net 45",
      commercialPackage:"Synthetic commercial terms; travel separately agreed",
    });
  }
  return result;
}
export const AGENCY_RESOURCE_POOL=createAgencySyntheticResourcePool();
export type ResourceFilters={query:string;region:string;affiliation:string;relationship:string};
export function filterAgencyResources(resources:readonly AgencyResource[],filters:ResourceFilters):AgencyResource[]{
  const terms=filters.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return resources.filter(r=>(filters.region==="All regions"||r.region===filters.region)
    &&(filters.affiliation==="All statuses"||r.affiliation===filters.affiliation)
    &&(filters.relationship==="All relationships"||r.relationship===filters.relationship)
    &&terms.every(term=>[r.id,r.name,r.coverage,r.region,r.expertise,r.relationship,r.affiliation].join(" ").toLocaleLowerCase().includes(term)));
}
