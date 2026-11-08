/** Fictional agency capacity only; no live inspector records. */
export const AGENCY_CAPACITY = [
 {region:"Gulf Coast",available:14,assigned:9,tentative:6,blocked:3},
 {region:"Middle East",available:11,assigned:10,tentative:4,blocked:2},
 {region:"Europe",available:8,assigned:8,tentative:3,blocked:2},
 {region:"West Africa",available:6,assigned:5,tentative:3,blocked:1},
] as const;
export function capacityByRegion(region:string){return region==="All regions"?AGENCY_CAPACITY:AGENCY_CAPACITY.filter(r=>r.region===region)}
export function capacityTotals(rows:readonly {available:number;assigned:number;tentative:number;blocked:number}[]){
 return rows.reduce<{available:number;assigned:number;tentative:number;blocked:number;total:number}>((t,r)=>({available:t.available+r.available,assigned:t.assigned+r.assigned,tentative:t.tentative+r.tentative,blocked:t.blocked+r.blocked,total:t.total+r.available+r.assigned+r.tentative+r.blocked}),{available:0,assigned:0,tentative:0,blocked:0,total:0})
}
