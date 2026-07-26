"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";
import type { InspectorProfile } from "@/lib/types";

type NamedItem = {
  id?: string;
  name: string;
  category?: string | null;
  code?: string | null;
  region?: string | null;
};

type DetailedItem = NamedItem & {
  level?: string | null;
  proficiency?: string | null;
  certificate_number?: string | null;
  issued_on?: string | null;
  expires_on?: string | null;
  years_experience?: number | null;
  provider?: string | null;
  completed_on?: string | null;
};

type PublicProfileData = {
  profile: InspectorProfile;
  equipment: NamedItem[];
  activities: NamedItem[];
  ndtMethods: DetailedItem[];
  certifications: DetailedItem[];
  codes: DetailedItem[];
  industries: NamedItem[];
  languages: DetailedItem[];
  travelCredentials: DetailedItem[];
  workCountries: NamedItem[];
  software: DetailedItem[];
  training: DetailedItem[];
};

const emptyData: PublicProfileData = {
  profile: {} as InspectorProfile,
  equipment: [],
  activities: [],
  ndtMethods: [],
  certifications: [],
  codes: [],
  industries: [],
  languages: [],
  travelCredentials: [],
  workCountries: [],
  software: [],
  training: [],
};

export default function PublicInspectorProfilePage() {
  const params = useParams<{ id: string }>();
  const inspectorId = params?.id;
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [data, setData] = useState<PublicProfileData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (inspectorId) void loadProfile(inspectorId);
  }, [inspectorId]);

  async function loadProfile(id: string) {
    setLoading(true);
    setNotFound(false);

    const profileResult = await supabase
      .from("inspector_profiles")
      .select("*")
      .eq("inspector_id", id)
      .maybeSingle();

    if (profileResult.error || !profileResult.data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const [
      equipmentResult,
      activitiesResult,
      ndtResult,
      certificationsResult,
      codesResult,
      industriesResult,
      languagesResult,
      travelResult,
      countriesResult,
      softwareResult,
      trainingResult,
    ] = await Promise.all([
      supabase.from("inspector_equipment").select("equipment_types(id,name,category,code)").eq("profile_id", id),
      supabase.from("inspector_activities").select("inspection_activities(id,name,category,code)").eq("profile_id", id),
      supabase.from("inspector_ndt_methods").select("level,certificate_number,issued_on,expires_on,ndt_methods(id,name,category,code)").eq("profile_id", id),
      supabase.from("inspector_certifications").select("certificate_number,issued_on,expires_on,certifications(id,name,category,code)").eq("profile_id", id),
      supabase.from("inspector_codes_standards").select("proficiency,years_experience,codes_standards(id,name,category,code)").eq("profile_id", id),
      supabase.from("inspector_industries").select("industries(id,name,category,code)").eq("profile_id", id),
      supabase.from("inspector_languages").select("proficiency,languages(id,name,region,code)").eq("profile_id", id),
      supabase.from("inspector_travel_credentials").select("credential_number,issued_on,expires_on,travel_credentials(id,name,category,code)").eq("profile_id", id),
      supabase.from("inspector_work_countries").select("countries(id,name,region,iso_code)").eq("profile_id", id),
      supabase.from("inspector_software").select("proficiency,years_experience,software_tools(id,name,category,code)").eq("profile_id", id),
      supabase.from("inspector_training").select("provider,completed_on,expires_on,training_types(id,name,category,code)").eq("profile_id", id),
    ]);

    const unwrap = (rows: any[] | null, relationKey: string) =>
      (rows || [])
        .map((row) => {
          const related = row[relationKey];
          if (!related) return null;
          return {
            ...related,
            ...Object.fromEntries(Object.entries(row).filter(([key]) => key !== relationKey)),
          };
        })
        .filter(Boolean);

    setData({
      profile: profileResult.data as InspectorProfile,
      equipment: unwrap(equipmentResult.data, "equipment_types"),
      activities: unwrap(activitiesResult.data, "inspection_activities"),
      ndtMethods: unwrap(ndtResult.data, "ndt_methods"),
      certifications: unwrap(certificationsResult.data, "certifications"),
      codes: unwrap(codesResult.data, "codes_standards"),
      industries: unwrap(industriesResult.data, "industries"),
      languages: unwrap(languagesResult.data, "languages"),
      travelCredentials: unwrap(travelResult.data, "travel_credentials"),
      workCountries: unwrap(countriesResult.data, "countries"),
      software: unwrap(softwareResult.data, "software_tools"),
      training: unwrap(trainingResult.data, "training_types"),
    });

    setLoading(false);
  }

  async function copyProfileLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  if (loading) {
    return <main className="profilePage"><section className="loadingCard">Loading inspector profile...</section></main>;
  }

  if (notFound) {
    return (
      <main className="profilePage">
        <section className="emptyCard">
          <h1>Inspector profile not found</h1>
          <p>This profile may not exist or may not yet be available.</p>
          <Link href="/inspectors" className="primaryButton">Browse inspectors</Link>
        </section>
      </main>
    );
  }

  const p = data.profile;
  const displayName = p.full_name || p.name || "Inspector";
  const location = [p.base_city || p.base_location, p.base_state, p.base_country].filter(Boolean).join(", ");
  const initials = displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className="profilePage">
      <section className="heroCard">
        <div className="identityBlock">
          <div className="avatar">{initials}</div>
          <div>
            <div className="nameLine">
              <h1>{displayName}</h1>
              {p.is_verified && <span className="verifiedBadge">Verified</span>}
            </div>
            <p className="headline">{p.headline || p.primary_discipline || "Vendor Inspection Professional"}</p>
            <div className="metaRow">
              {location && <span>{location}</span>}
              {p.years_experience != null && <span>{p.years_experience}+ years experience</span>}
              {p.inspector_type && <span>{p.inspector_type}</span>}
            </div>
          </div>
        </div>

        <div className="heroActions">
          <button type="button" className="secondaryButton" onClick={copyProfileLink}>
            {copied ? "Link copied" : "Share profile"}
          </button>
          {p.linkedin_url && <a className="secondaryButton" href={p.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
          <a className="primaryButton" href={`mailto:?subject=${encodeURIComponent(`InspectSource inquiry for ${displayName}`)}`}>
            Contact / Hire
          </a>
        </div>
      </section>

      <section className="quickStats">
        <Stat label="Availability" value={p.availability_status || "Contact for availability"} />
        <Stat label="Hourly Rate" value={formatMoney(p.hourly_rate, p.currency)} />
        <Stat label="Day Rate" value={formatMoney(p.day_rate, p.currency)} />
        <Stat label="Travel" value={travelSummary(p)} />
      </section>

      <div className="profileGrid">
        <div className="mainColumn">
          <ProfileSection title="Professional Summary">
            <p className="bioText">{p.biography || "This inspector has not added a professional summary yet."}</p>
          </ProfileSection>

          <TagSection title="Equipment Experience" items={data.equipment} />
          <TagSection title="Inspection Activities" items={data.activities} />

          <ProfileSection title="NDT Methods">
            <DetailCards items={data.ndtMethods} details={(item) => [
              item.level,
              item.certificate_number ? `Certificate ${item.certificate_number}` : null,
              dateRange(item.issued_on, item.expires_on),
            ]} />
          </ProfileSection>

          <ProfileSection title="Certifications">
            <DetailCards items={data.certifications} details={(item) => [
              item.certificate_number ? `Certificate ${item.certificate_number}` : null,
              dateRange(item.issued_on, item.expires_on),
            ]} />
          </ProfileSection>

          <ProfileSection title="Codes & Standards">
            <DetailCards items={data.codes} details={(item) => [
              item.proficiency,
              item.years_experience != null ? `${item.years_experience} years` : null,
            ]} />
          </ProfileSection>

          <TagSection title="Industry Experience" items={data.industries} />
        </div>

        <aside className="sideColumn">
          <ProfileSection title="Professional Details">
            <InfoList rows={[
              ["Primary Discipline", p.primary_discipline],
              ["Company", p.company],
              ["Inspector Type", p.inspector_type],
              ["Remote Review", p.remote_review_available ? "Available" : "Not listed"],
              ["Driving Radius", p.driving_radius != null ? `${p.driving_radius} ${p.distance_unit || "miles"}` : null],
              ["Maximum Flight Time", p.maximum_flight_hours != null ? `${p.maximum_flight_hours} hours` : null],
            ]} />
          </ProfileSection>

          <ProfileSection title="Languages">
            <DetailCards items={data.languages} details={(item) => [item.proficiency]} compact />
          </ProfileSection>

          <TagSection title="Work Countries" items={data.workCountries} />

          <ProfileSection title="Travel Credentials">
            <DetailCards items={data.travelCredentials} details={(item) => [
              item.certificate_number,
              dateRange(item.issued_on, item.expires_on),
            ]} compact />
          </ProfileSection>

          <ProfileSection title="Software">
            <DetailCards items={data.software} details={(item) => [
              item.proficiency,
              item.years_experience != null ? `${item.years_experience} years` : null,
            ]} compact />
          </ProfileSection>

          <ProfileSection title="Training">
            <DetailCards items={data.training} details={(item) => [
              item.provider,
              dateRange(item.completed_on, item.expires_on),
            ]} compact />
          </ProfileSection>

          {(p.website_url || p.linkedin_url) && (
            <ProfileSection title="Links">
              <div className="linkList">
                {p.website_url && <a href={p.website_url} target="_blank" rel="noreferrer">Website</a>}
                {p.linkedin_url && <a href={p.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
              </div>
            </ProfileSection>
          )}
        </aside>
      </div>

      <style jsx>{`
        .profilePage{max-width:1180px;margin:0 auto;padding:28px 18px 60px}.heroCard,.loadingCard,.emptyCard,.sectionCard,.statCard{border:1px solid rgba(127,127,127,.25);background:rgba(127,127,127,.04);border-radius:18px}.heroCard{display:flex;justify-content:space-between;gap:24px;padding:28px}.identityBlock{display:flex;align-items:center;gap:20px}.avatar{display:grid;place-items:center;width:96px;height:96px;border-radius:50%;background:rgba(127,127,127,.16);font-size:2rem;font-weight:800}.nameLine{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.nameLine h1{margin:0;font-size:2rem}.verifiedBadge{padding:5px 9px;border:1px solid currentColor;border-radius:999px;font-size:.78rem;font-weight:800}.headline{margin:8px 0 10px;font-size:1.12rem}.metaRow{display:flex;gap:9px;flex-wrap:wrap}.metaRow span{padding:6px 9px;border-radius:999px;background:rgba(127,127,127,.1);font-size:.88rem}.heroActions{display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;justify-content:flex-end}.primaryButton,.secondaryButton{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 15px;border-radius:10px;text-decoration:none;font:inherit;font-weight:800;cursor:pointer}.primaryButton{border:1px solid currentColor;background:currentColor;color:Canvas}.secondaryButton{border:1px solid rgba(127,127,127,.4);background:transparent;color:inherit}.quickStats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:18px 0}.statCard{padding:17px}.statLabel{display:block;margin-bottom:5px;font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;opacity:.7}.statValue{font-size:1.02rem}.profileGrid{display:grid;grid-template-columns:minmax(0,2fr) minmax(290px,1fr);gap:18px}.mainColumn,.sideColumn{display:grid;gap:18px;align-content:start}.sectionCard{padding:22px}.sectionCard h2{margin:0 0 16px;font-size:1.25rem}.bioText{margin:0;line-height:1.7;white-space:pre-line}.tagGrid{display:flex;flex-wrap:wrap;gap:9px}.tag{padding:8px 11px;border:1px solid rgba(127,127,127,.28);border-radius:999px;background:rgba(127,127,127,.07)}.detailList{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.detailList.compact{grid-template-columns:1fr}.detailItem{padding:13px;border:1px solid rgba(127,127,127,.25);border-radius:12px}.detailItem strong{display:block}.detailMeta{display:flex;gap:7px;flex-wrap:wrap;margin-top:7px}.detailMeta span{font-size:.82rem;opacity:.76}.infoList{display:grid;gap:11px}.infoRow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:10px;padding-bottom:10px;border-bottom:1px solid rgba(127,127,127,.18)}.infoRow:last-child{border-bottom:0;padding-bottom:0}.infoRow dt{opacity:.72}.infoRow dd{margin:0;text-align:right;font-weight:700}.linkList{display:flex;flex-direction:column;gap:8px}.loadingCard,.emptyCard{padding:32px}.emptyCard h1{margin-top:0}.muted{opacity:.72}@media(max-width:900px){.quickStats{grid-template-columns:repeat(2,minmax(0,1fr))}.profileGrid{grid-template-columns:1fr}.heroCard{flex-direction:column}.heroActions{justify-content:flex-start}}@media(max-width:620px){.identityBlock{align-items:flex-start}.avatar{width:70px;height:70px;font-size:1.45rem}.nameLine h1{font-size:1.55rem}.quickStats{grid-template-columns:1fr}.detailList{grid-template-columns:1fr}.heroCard,.sectionCard{padding:18px}}
      `}</style>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="statCard"><span className="statLabel">{label}</span><strong className="statValue">{value}</strong></div>;
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="sectionCard"><h2>{title}</h2>{children}</section>;
}

function TagSection({ title, items }: { title: string; items: NamedItem[] }) {
  return (
    <ProfileSection title={title}>
      {items.length
        ? <div className="tagGrid">{items.map((item, index) => <span className="tag" key={`${item.id || item.name}-${index}`}>{item.name}</span>)}</div>
        : <p className="muted">Not listed.</p>}
    </ProfileSection>
  );
}

function DetailCards({
  items,
  details,
  compact = false,
}: {
  items: DetailedItem[];
  details: (item: DetailedItem) => Array<string | null | undefined>;
  compact?: boolean;
}) {
  if (!items.length) return <p className="muted">Not listed.</p>;
  return (
    <div className={compact ? "detailList compact" : "detailList"}>
      {items.map((item, index) => {
        const values = details(item).filter(Boolean) as string[];
        return (
          <div className="detailItem" key={`${item.id || item.name}-${index}`}>
            <strong>{item.name}</strong>
            {values.length > 0 && <div className="detailMeta">{values.map((value) => <span key={value}>{value}</span>)}</div>}
          </div>
        );
      })}
    </div>
  );
}

function InfoList({ rows }: { rows: Array<[string, string | number | null | undefined]> }) {
  const populated = rows.filter(([, value]) => value !== null && value !== undefined && value !== "");
  if (!populated.length) return <p className="muted">Not listed.</p>;
  return (
    <dl className="infoList">
      {populated.map(([label, value]) => <div className="infoRow" key={label}><dt>{label}</dt><dd>{String(value)}</dd></div>)}
    </dl>
  );
}

function formatMoney(value: number | null | undefined, currency: string | null | undefined) {
  if (value == null) return "Contact for rate";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${currency || "USD"} ${value}`;
  }
}

function dateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  if (start && end) return `${formatDate(start)} – ${formatDate(end)}`;
  if (end) return `Expires ${formatDate(end)}`;
  return `Issued ${formatDate(start!)}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(new Date(`${date}T00:00:00`));
}

function travelSummary(profile: InspectorProfile) {
  if (profile.international_travel) return "Domestic & international";
  if (profile.domestic_travel || profile.willing_to_travel) return "Domestic travel";
  return "Contact for travel";
}
