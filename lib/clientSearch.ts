export type ParsedRequest = {
  rawText: string;
  location: string | null;
  startDate: string | null;
  durationDays: number | null;
  maximumDayRate: number | null;
  maximumDayRateCurrency: string | null;
  minimumYearsExperience: number | null;
  availabilityRequired: boolean;
  internationalTravelRequired: boolean;
  remoteAllowed: boolean;
  requiredTerms: string[];
  requiredCertifications: string[];
};

export type ReferenceItem = { id:string; name:string; code?:string|null; category?:string|null };

export type SearchInspector = {
  inspector_id:string; primary_discipline:string|null; biography:string|null;
  base_city:string|null; base_state:string|null; base_country:string|null;
  years_experience:number|null; day_rate:number|null; currency:string|null;
  availability_status:string|null; available_from:string|null;
  domestic_travel:boolean|null; international_travel:boolean|null;
  remote_review_available:boolean|null; is_verified:boolean|null;
  equipment:ReferenceItem[]; activities:ReferenceItem[]; ndtMethods:ReferenceItem[];
  certifications:ReferenceItem[]; codes:ReferenceItem[]; industries:ReferenceItem[];
  languages:ReferenceItem[]; travelCredentials:ReferenceItem[];
};

export type MatchResult = SearchInspector & {
  score:number; reasons:string[]; questions:string[]; matchedTerms:string[];
};

const STOP_WORDS = new Set([
  "a","an","and","are","around","at","available","be","beginning","budget","by","can","day","days","for","from","have","in","inspector","inspectors","inspection","is","looking","maximum","must","near","need","needed","of","on","or","per","please","required","someone","starting","that","the","to","up","we","week","weeks","who","with","shift","shifts","hours","hour","minimum","experience","local","preferred","acceptable"
]);

const MONTHS:Record<string,number>={jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12};

const US_LOCATION_TERMS = new Set([
  "houston","baytown","tomball","cypress","corpus christi","beaumont","dallas","fort worth","austin","san antonio","texas","tx",
  "new orleans","baton rouge","lake charles","louisiana","la","chicago","illinois","il","new york","ny","los angeles","california","ca"
]);

const CERT_PATTERNS: Array<[RegExp,string]> = [
  [/\bapi\s*510\b/i,"API 510"],[/\bapi\s*570\b/i,"API 570"],[/\bapi\s*653\b/i,"API 653"],
  [/\baws\s*cwi\b|\bcwi\b/i,"AWS CWI"],[/\bcswip\b/i,"CSWIP"],[/\bampp\b/i,"AMPP"],[/\bnace\b/i,"NACE"],
  [/\basnt\b/i,"ASNT"],[/\bpcn\b/i,"PCN"],[/\btwic\b/i,"TWIC"]
];

function parseDate(text:string):string|null{
  const iso=text.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/); if(iso)return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const named=text.toLowerCase().match(/\b(?:starting|beginning|from|on)\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+(\d{1,2})(?:,\s*(20\d{2}))?/);
  if(!named)return null; const month=MONTHS[named[1]]; const year=named[3]?Number(named[3]):new Date().getFullYear();
  return `${year}-${String(month).padStart(2,"0")}-${String(Number(named[2])).padStart(2,"0")}`;
}

function parseRequiredCertifications(text:string):string[]{
  return Array.from(new Set(CERT_PATTERNS.filter(([pattern])=>pattern.test(text)).map(([,label])=>label)));
}

function parseMaximumDayRate(text:string):RegExpMatchArray|null{
  return text.match(/(?:\b([A-Z]{3})\s*)?(\$)?\s*([\d,]+(?:\.\d+)?)\s*(?:\/|per\s*)day\b/i)
    || text.match(/\bmaximum\s+day\s+rate\s+(?:([A-Z]{3})\s*)?(\$)?\s*([\d,]+(?:\.\d+)?)/i);
}

export function parseRequest(text:string):ParsedRequest{
  const clean=text.trim(); const lower=clean.toLowerCase();
  const location=clean.match(/\b(?:in|near|around|within\s+\d+\s+(?:miles|kilometers|km)\s+of)\s+([A-Z][A-Za-z .'-]+(?:,\s*[A-Z]{2})?)(?=\s+(?:for|starting|beginning|with|who|and|must|budget|available|requiring)|[,.]|$)/);
  const rate=parseMaximumDayRate(clean);
  const years=lower.match(/(?:at least|minimum|min\.?)\s*(\d{1,2})\s*\+?\s*years?/);
  const duration=lower.match(/(\d+)\s*(day|days|week|weeks|month|months)\b/);
  let durationDays:number|null=null; if(duration){const amount=Number(duration[1]);durationDays=duration[2].startsWith("week")?amount*7:duration[2].startsWith("month")?amount*30:amount;}
  const requiredTerms=Array.from(new Set(lower.replace(/[^a-z0-9+./ -]/g," ").split(/\s+/).map(t=>t.trim()).filter(t=>t.length>=2&&!STOP_WORDS.has(t)&&!/^\d+$/.test(t))));
  return {
    rawText:clean, location:location?.[1]?.trim()||null, startDate:parseDate(clean), durationDays,
    maximumDayRate:rate?Number(rate[3].replace(/,/g,"")):null,
    maximumDayRateCurrency:rate?.[1]?.toUpperCase() || (rate?.[2]?"USD":null),
    minimumYearsExperience:years?Number(years[1]):null,
    availabilityRequired:/\bavailable\b|\bstarting\b|\bbeginning\b|\bimmediately\b/.test(lower),
    internationalTravelRequired:/\boffshore\b|\binternational\b|\boverseas\b|\bpassport\b|international flight acceptable/.test(lower),
    remoteAllowed:/\bremote\b|\bdesk review\b|\bdesktop review\b/.test(lower),
    requiredTerms,
    requiredCertifications:parseRequiredCertifications(clean)
  };
}

function allQualificationText(inspector:SearchInspector):string{
  return [inspector.primary_discipline,inspector.biography,...inspector.equipment.flatMap(i=>[i.name,i.code,i.category]),...inspector.activities.flatMap(i=>[i.name,i.code,i.category]),...inspector.ndtMethods.flatMap(i=>[i.name,i.code,i.category]),...inspector.certifications.flatMap(i=>[i.name,i.code,i.category]),...inspector.codes.flatMap(i=>[i.name,i.code,i.category]),...inspector.industries.flatMap(i=>[i.name,i.code,i.category]),...inspector.languages.flatMap(i=>[i.name,i.code,i.category]),...inspector.travelCredentials.flatMap(i=>[i.name,i.code,i.category])].filter(Boolean).join(" ").toLowerCase();
}

function publicInspectorNumber(id:string):string{return id.replace(/-/g,"").slice(-6).toUpperCase();}
export function inspectorLabel(inspector:SearchInspector):string{return `${inspector.primary_discipline||"Vendor Inspection"} Professional · Inspector #${publicInspectorNumber(inspector.inspector_id)}`;}

function normalizeCountry(country:string|null):string{
  const c=(country||"").toLowerCase().trim();
  if(["usa","us","u.s.","u.s.a.","united states","united states of america"].includes(c))return "united states";
  return c;
}

function inferRequestedCountry(location:string|null):string|null{
  if(!location)return null; const l=location.toLowerCase().replace(/,/g," ").replace(/\s+/g," ").trim();
  for(const term of Array.from(US_LOCATION_TERMS)) if(l.includes(term)) return "united states";
  if(l.includes("singapore"))return "singapore";
  if(l.includes("canada"))return "canada";
  if(l.includes("uk")||l.includes("united kingdom")||l.includes("england"))return "united kingdom";
  return null;
}

function certificationMatches(inspector:SearchInspector,required:string):boolean{
  const wanted=required.toLowerCase().replace(/[^a-z0-9]/g,"");
  const refs=[...inspector.certifications,...inspector.travelCredentials];
  return refs.some(item=>[item.name,item.code].filter(Boolean).some(v=>String(v).toLowerCase().replace(/[^a-z0-9]/g,"").includes(wanted)));
}

function availabilityPasses(request:ParsedRequest,inspector:SearchInspector):boolean{
  const status=String(inspector.availability_status||"").toLowerCase();
  if(status.includes("unavailable")||status.includes("not available")||status.includes("inactive"))return false;
  if(request.startDate&&inspector.available_from&&String(inspector.available_from).slice(0,10)>request.startDate)return false;
  return true;
}

function passesHardGates(request:ParsedRequest,inspector:SearchInspector):boolean{
  if(!availabilityPasses(request,inspector))return false;
  if(request.requiredCertifications.some(cert=>!certificationMatches(inspector,cert)))return false;
  if(request.minimumYearsExperience!==null&&(inspector.years_experience||0)<request.minimumYearsExperience)return false;
  if(request.maximumDayRate!==null&&inspector.day_rate!==null){
    const wantedCurrency=request.maximumDayRateCurrency;
    const inspectorCurrency=(inspector.currency||"").toUpperCase();
    if(wantedCurrency&&inspectorCurrency&&inspectorCurrency!==wantedCurrency)return false;
    if(inspector.day_rate>request.maximumDayRate)return false;
  }
  if(request.location&&!request.remoteAllowed){
    const requestedCountry=inferRequestedCountry(request.location);
    const inspectorCountry=normalizeCountry(inspector.base_country);
    if(requestedCountry&&inspectorCountry&&requestedCountry!==inspectorCountry){
      if(!request.internationalTravelRequired||!inspector.international_travel)return false;
    }
  }
  return true;
}

function relevantTermMatches(request:ParsedRequest,inspector:SearchInspector):string[]{
  const text=allQualificationText(inspector);
  return request.requiredTerms.filter(term=>text.includes(term));
}

function scoreFit(request:ParsedRequest,inspector:SearchInspector){
  const reasons:string[]=[]; const questions:string[]=[]; const matchedTerms=relevantTermMatches(request,inspector);
  let score=70; // Passing all hard gates means the inspector is genuinely qualified enough to be shown.

  if(request.requiredCertifications.length){score+=8;reasons.push(`Required credentials confirmed: ${request.requiredCertifications.join(", ")}`);}

  const meaningfulTerms=request.requiredTerms.filter(term=>!request.requiredCertifications.some(c=>c.toLowerCase().includes(term)));
  const termRatio=meaningfulTerms.length?matchedTerms.filter(t=>meaningfulTerms.includes(t)).length/meaningfulTerms.length:0;
  const qualificationBonus=Math.min(10,Math.round(termRatio*10));
  score+=qualificationBonus;
  if(matchedTerms.length)reasons.push(`Relevant qualification matches: ${matchedTerms.slice(0,7).join(", ")}`);

  if(request.location){
    const inspectorLocation=[inspector.base_city,inspector.base_state,inspector.base_country].filter(Boolean).join(" ").toLowerCase();
    const wanted=request.location.toLowerCase(); const requestedCountry=inferRequestedCountry(request.location); const inspectorCountry=normalizeCountry(inspector.base_country);
    if(inspectorLocation.includes(wanted)||wanted.includes(inspectorLocation)){score+=5;reasons.push(`Based in ${[inspector.base_city,inspector.base_state].filter(Boolean).join(", ")}`);}
    else if(requestedCountry&&requestedCountry===inspectorCountry&&inspector.domestic_travel){score+=3;reasons.push("Based in the requested country and available for domestic travel");}
    else if(request.internationalTravelRequired&&inspector.international_travel){score+=2;reasons.push("International travel capability supports the assignment location");}
    else questions.push("Confirm assignment travel logistics");
  }

  if(request.minimumYearsExperience!==null){
    const years=inspector.years_experience||0; const extra=Math.max(0,years-request.minimumYearsExperience);
    score+=Math.min(3,Math.floor(extra/5)); reasons.push(`${years}+ years of experience`);
  }

  if(request.startDate||request.availabilityRequired){score+=4;reasons.push(inspector.availability_status||"Available for the requested assignment dates");}

  if(request.maximumDayRate!==null){
    if(inspector.day_rate!==null){const headroom=Math.max(0,request.maximumDayRate-inspector.day_rate);score+=headroom>0?3:2;reasons.push("Day rate is within the stated budget");}
    else questions.push("Confirm day rate");
  }

  if(inspector.is_verified){score+=4;reasons.push("Verified by InspectSource");}else questions.push("Credential verification is pending");
  if(request.remoteAllowed&&inspector.remote_review_available){score+=2;reasons.push("Remote review is available");}
  if(request.internationalTravelRequired&&inspector.international_travel){score+=1;}

  return {score:Math.max(70,Math.min(100,score)),reasons,questions,matchedTerms};
}

export function rankInspectors(request:ParsedRequest,inspectors:SearchInspector[]):MatchResult[]{
  return inspectors.filter(inspector=>passesHardGates(request,inspector)).map(inspector=>{
    const fit=scoreFit(request,inspector);
    return {...inspector,...fit};
  }).sort((a,b)=>b.score-a.score);
}
