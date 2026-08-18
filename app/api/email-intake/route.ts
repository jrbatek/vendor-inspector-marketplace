import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { coordinateProject } from "@/lib/projectCoordinator";
import type { ReferenceItem, SearchInspector } from "@/lib/clientSearch";

export const dynamic = "force-dynamic";

type IntakePayload = { from?: string; subject?: string; body?: string; messageId?: string };

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.INSPECTSOURCE_EMAIL_SECRET || process.env.EMAIL_INTAKE_SECRET;
  if (!expectedSecret) return NextResponse.json({ error: "Email intake is not configured." }, { status: 503 });
  if (request.headers.get("x-inspectsource-secret") !== expectedSecret) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  let payload: IntakePayload;
  try { payload = (await request.json()) as IntakePayload; }
  catch { return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 }); }

  const body = payload.body?.trim();
  if (!body) return NextResponse.json({ error: "Email body is required." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const queries = await Promise.all([
    supabase.from("inspector_profiles").select("inspector_id,primary_discipline,biography,base_city,base_state,base_country,years_experience,day_rate,currency,availability_status,available_from,domestic_travel,international_travel,remote_review_available,is_verified,inspector_type,driving_radius,distance_unit,maximum_flight_hours"),
    supabase.from("inspector_equipment").select("profile_id,equipment_types(id,name,code,category)"),
    supabase.from("inspector_activities").select("profile_id,inspection_activities(id,name,code,category)"),
    supabase.from("inspector_ndt_methods").select("profile_id,level,certificate_number,issued_on,expires_on,ndt_methods(id,name,code,category)"),
    supabase.from("inspector_certifications").select("profile_id,certificate_number,issued_on,expires_on,certifications(id,name,code,category)"),
    supabase.from("inspector_codes_standards").select("profile_id,proficiency,years_experience,codes_standards(id,name,code,category)"),
    supabase.from("inspector_industries").select("profile_id,industries(id,name,code,category)"),
    supabase.from("inspector_languages").select("profile_id,proficiency,languages(id,name,code,region)"),
    supabase.from("inspector_travel_credentials").select("profile_id,credential_number,issued_on,expires_on,travel_credentials(id,name,code,category)"),
    supabase.from("inspector_work_countries").select("profile_id,countries(id,name,region,iso_code)"),
    supabase.from("inspector_software").select("profile_id,proficiency,years_experience,software_tools(id,name,code,category)"),
    supabase.from("inspector_training").select("profile_id,provider,completed_on,expires_on,training_types(id,name,code,category)"),
  ]);

  const queryError = queries.find((query) => query.error)?.error;
  if (queryError) return NextResponse.json({ error: queryError.message }, { status: 500 });

  const [profiles, equipment, activities, ndt, certifications, codes, industries, languages, travel, countries, software, training] = queries;

  const group = (rows: any[] | null, relationship: string): Record<string, any[]> => {
    const grouped: Record<string, any[]> = {};
    for (const row of rows || []) {
      const related = row[relationship];
      if (!related || !row.profile_id) continue;
      const detail = { ...related, ...Object.fromEntries(Object.entries(row).filter(([key]) => key !== relationship && key !== "profile_id")) };
      if (!grouped[row.profile_id]) grouped[row.profile_id] = [];
      grouped[row.profile_id].push(detail);
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
  const countriesByProfile = group(countries.data, "countries");
  const softwareByProfile = group(software.data, "software_tools");
  const trainingByProfile = group(training.data, "training_types");

  const inspectors: SearchInspector[] = (profiles.data || []).map((profile: any) => ({
    ...profile,
    equipment: equipmentByProfile[profile.inspector_id] || [], activities: activitiesByProfile[profile.inspector_id] || [], ndtMethods: ndtByProfile[profile.inspector_id] || [],
    certifications: certificationsByProfile[profile.inspector_id] || [], codes: codesByProfile[profile.inspector_id] || [], industries: industriesByProfile[profile.inspector_id] || [],
    languages: languagesByProfile[profile.inspector_id] || [], travelCredentials: travelByProfile[profile.inspector_id] || [],
  }));

  const recommendation = coordinateProject(`${payload.subject || ""}\n${body}`, inspectors);
  const origin = request.nextUrl.origin;

  return NextResponse.json({
    ok: true, source: "email", sender: payload.from || null, messageId: payload.messageId || null,
    brief: recommendation.brief, summary: recommendation.summary, nextActions: recommendation.nextActions,
    candidates: recommendation.shortlist.map((candidate: any) => ({
      inspectorId: candidate.inspector_id,
      anonymousId: candidate.inspector_id.replace(/-/g, "").slice(-6).toUpperCase(),
      discipline: candidate.primary_discipline,
      inspectorType: candidate.inspector_type,
      biography: candidate.biography,
      score: candidate.score,
      location: [candidate.base_city, candidate.base_state, candidate.base_country].filter(Boolean).join(", "),
      yearsExperience: candidate.years_experience,
      availability: candidate.availability_status,
      dayRate: candidate.day_rate,
      currency: candidate.currency,
      drivingRadius: candidate.driving_radius,
      distanceUnit: candidate.distance_unit,
      domesticTravel: candidate.domestic_travel,
      internationalTravel: candidate.international_travel,
      remoteReview: candidate.remote_review_available,
      maximumFlightHours: candidate.maximum_flight_hours,
      verified: candidate.is_verified,
      reasons: candidate.reasons.slice(0, 5), questions: candidate.questions.slice(0, 4),
      qualifications: {
        equipment: equipmentByProfile[candidate.inspector_id] || [], activities: activitiesByProfile[candidate.inspector_id] || [], ndtMethods: ndtByProfile[candidate.inspector_id] || [],
        certifications: certificationsByProfile[candidate.inspector_id] || [], codes: codesByProfile[candidate.inspector_id] || [], industries: industriesByProfile[candidate.inspector_id] || [],
        languages: languagesByProfile[candidate.inspector_id] || [], travelCredentials: travelByProfile[candidate.inspector_id] || [], workCountries: countriesByProfile[candidate.inspector_id] || [],
        software: softwareByProfile[candidate.inspector_id] || [], training: trainingByProfile[candidate.inspector_id] || [],
      },
      qualificationUrl: `${origin}/inspectors/${candidate.inspector_id}`,
      cvUrl: `${origin}/inspectors/${candidate.inspector_id}/cv`,
    })),
  });
}
