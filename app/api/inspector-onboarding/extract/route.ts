import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const schema = {
  name: "inspector_profile_extraction",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      professional: { type:"object", additionalProperties:false, properties:{ full_name:{type:"string"}, headline:{type:"string"}, company:{type:"string"}, phone:{type:"string"}, base_city:{type:"string"}, base_state:{type:"string"}, base_country:{type:"string"}, years_experience:{type:"number"}, primary_discipline:{type:"string"}, biography:{type:"string"} }, required:["full_name","headline","company","phone","base_city","base_state","base_country","years_experience","primary_discipline","biography"] },
      certifications: { type:"array", items:{ type:"object", additionalProperties:false, properties:{ name:{type:"string"}, certificate_number:{type:"string"}, issued_on:{type:"string"}, expires_on:{type:"string"}, confidence:{type:"number"}, evidence:{type:"string"} }, required:["name","certificate_number","issued_on","expires_on","confidence","evidence"] } },
      equipment: { type:"array", items:{ type:"object", additionalProperties:false, properties:{ name:{type:"string"}, years_experience:{type:"number"}, confidence:{type:"number"}, evidence:{type:"string"} }, required:["name","years_experience","confidence","evidence"] } },
      industries: { type:"array", items:{ type:"object", additionalProperties:false, properties:{ name:{type:"string"}, years_experience:{type:"number"}, confidence:{type:"number"}, evidence:{type:"string"} }, required:["name","years_experience","confidence","evidence"] } },
      codes_standards: { type:"array", items:{ type:"object", additionalProperties:false, properties:{ name:{type:"string"}, confidence:{type:"number"}, evidence:{type:"string"} }, required:["name","confidence","evidence"] } },
      languages: { type:"array", items:{ type:"object", additionalProperties:false, properties:{ name:{type:"string"}, proficiency:{type:"string"}, confidence:{type:"number"}, evidence:{type:"string"} }, required:["name","proficiency","confidence","evidence"] } },
      improvements: { type:"array", items:{ type:"object", additionalProperties:false, properties:{ title:{type:"string"}, reason:{type:"string"}, suggested_text:{type:"string"} }, required:["title","reason","suggested_text"] } },
      review_notes: { type:"array", items:{type:"string"} }
    },
    required:["professional","certifications","equipment","industries","codes_standards","languages","improvements","review_notes"]
  }
};

export async function POST(req: NextRequest) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return NextResponse.json({ error: "Document extraction is not configured yet. Add OPENAI_API_KEY in Vercel." }, { status: 503 });
    const form = await req.formData();
    const files = form.getAll("files").filter((v): v is File => v instanceof File);
    if (!files.length) return NextResponse.json({ error:"Please upload at least one document." }, { status:400 });
    if (files.length > 12) return NextResponse.json({ error:"Please upload no more than 12 documents at once." }, { status:400 });

    const content:any[] = [{ type:"input_text", text:"Extract only facts supported by these inspector documents. Do not invent credentials, dates, experience, employers, equipment, or industries. Use empty strings/zero when unknown. Confidence is 0-1. Evidence must be a short source-grounded phrase. Improvements may clarify presentation but must never add unsupported experience. The inspector will approve every field before publishing." }];
    for (const file of files) {
      if (file.size > 10_000_000) return NextResponse.json({ error:`${file.name} is larger than 10 MB.` }, { status:400 });
      const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
      if (file.type === "application/pdf") content.push({ type:"input_file", filename:file.name, file_data:`data:application/pdf;base64,${b64}` });
      else if (file.type.startsWith("image/")) content.push({ type:"input_image", image_url:`data:${file.type};base64,${b64}`, detail:"high" });
      else return NextResponse.json({ error:`${file.name}: for AI extraction, please use PDF, JPG, or PNG. Word documents can be saved as PDF first.` }, { status:400 });
    }

    const response = await fetch("https://api.openai.com/v1/responses", { method:"POST", headers:{ Authorization:`Bearer ${key}`, "Content-Type":"application/json" }, body:JSON.stringify({ model:process.env.OPENAI_DOCUMENT_MODEL || "gpt-5-mini", input:[{role:"user",content}], text:{format:{type:"json_schema",name:schema.name,schema:schema.schema,strict:true}} }) });
    const raw = await response.json();
    if (!response.ok) return NextResponse.json({ error:raw?.error?.message || "AI extraction failed." }, { status:502 });
    const text = raw.output_text || raw.output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.type==="output_text")?.text;
    if (!text) return NextResponse.json({ error:"AI extraction returned no structured profile." }, { status:502 });
    return NextResponse.json({ extraction:JSON.parse(text), files:files.map(f=>({name:f.name,size:f.size,type:f.type})) });
  } catch (error:any) { return NextResponse.json({ error:error?.message || "Could not extract documents." }, { status:500 }); }
}
