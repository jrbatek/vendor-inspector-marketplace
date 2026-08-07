import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { coordinateProject } from "@/lib/projectCoordinator";
import type { ReferenceItem, SearchInspector } from "@/lib/clientSearch";

export const dynamic = "force-dynamic";

type IntakePayload = {
  from?: string;
  subject?: string;
  body?: string;
  messageId?: string;
};

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.EMAIL_INTAKE_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: "Email intake is not configured." }, { status: 503 });
  }

  const suppliedSecret = request.headers.get("x-inspectsource-secret");
  if (suppliedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let payload: IntakePayload;
  try {
    payload = (await request.json()) as IntakePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const body = payload.body?.trim();
  if (!body) return NextResponse.json({ error: "Email body is required." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const queries = await Promise.all([
    supabase.from("inspector_profiles").select("inspector_id,primary_discipline,biography,base_city,base_state,base_country,years_experience,day_rate,currency,availability_status,available_from,domestic_travel,international_travel,remote_review_available,is_verified"),
    supabase.from("inspector_equipment").select("profile_id,equipment_types(id,name,code,category)"),
    supabase.from("inspector_activities").select("profile_id,inspection_activities(id,name,code,category)"),
    supabase.from("inspector_ndt_methods").select("profile_id,ndt_methods(id,name,code,category)"),
    supabase.from("inspector_certifications").select("profile_id,certifications(id,name,code,category)"),
    supabase.from("inspector_codes_standards").select("profile_id,codes_standards(id,name,code,category)"),
    supabase.from("inspector_industries").select("profile_id,industries(id,name,code,category)"),
    supabase.from("inspector_languages").select("profile_id,languages(id,name,code,region)"),
    supabase.from("inspector_travel_credentials").select("profile_id,travel_credentials(id,name,code,category)"),
  ]);

  const queryError = queries.find((query) => query.error)?.error;
  if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });

  const [profiles, equipment, activities, ndt, certifications, codes, industries, languages, travel] = queries;

  const group = (rows: any[] | null, relationship: string): Record<string, ReferenceItem[]> => {
    const grouped: Record<string, ReferenceItem[]> = {};
    for (const row of rows || []) {
      const related = row[relationship];
      if (!related || !row.profile_id) continue;
      if (!grouped[row.profile_id]) grouped[row.profile_id] = [];
      grouped[row.profile_id].push(related);
    }
    return grouped;
  };

  const equipmentByProfile = group(equipment.data, "equipment_types");
  const activitiesByProfile = group(activities.data, "inspection_activities");
  const ndtByProfile = group(ndt.data, "ndt_methods");
  const certificationsByProfile = group(certifications.data, "certifications");
  const codesByProfile = group(codes.data, "codes_standards");
  const industriesByProfile = group(industries.data, "industries");
  const languagesByProfile = group(languages.data, "languages");
  const travelByProfile = group(travel.data, "travel_credentials");

  const inspectors: SearchInspector[] = (profiles.data || []).map((profile: any) => ({
    ...profile,
    equipment: equipmentByProfile[profile.inspector_id] || [],
    activities: activitiesByProfile[profile.inspector_id] || [],
    ndtMethods: ndtByProfile[profile.inspector_id] || [],
    certifications: certificationsByProfile[profile.inspector_id] || [],
    codes: codesByProfile[profile.inspector_id] || [],
    industries: industriesByProfile[profile.inspector_id] || [],
    languages: languagesByProfile[profile.inspector_id] || [],
    travelCredentials: travelByProfile[profile.inspector_id] || [],
  }));

  const recommendation = coordinateProject(`${payload.subject || ""}\n${body}`, inspectors);
  const origin = request.nextUrl.origin;

  return NextResponse.json({
    ok: true,
    source: "email",
    sender: payload.from || null,
    messageId: payload.messageId || null,
    brief: recommendation.brief,
    summary: recommendation.summary,
    nextActions: recommendation.nextActions,
    candidates: recommendation.shortlist.map((candidate) => ({
      inspectorId: candidate.inspector_id,
      anonymousId: candidate.inspector_id.replace(/-/g, "").slice(-6).toUpperCase(),
      discipline: candidate.primary_discipline,
      score: candidate.score,
      location: [candidate.base_city, candidate.base_state, candidate.base_country].filter(Boolean).join(", "),
      availability: candidate.availability_status,
      dayRate: candidate.day_rate,
      currency: candidate.currency,
      reasons: candidate.reasons.slice(0, 5),
      questions: candidate.questions.slice(0, 4),
      qualificationUrl: `${origin}/inspectors/${candidate.inspector_id}`,
      cvUrl: `${origin}/inspectors/${candidate.inspector_id}/cv`,
    })),
  });
}
