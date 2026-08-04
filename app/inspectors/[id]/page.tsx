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
    if (inspectorId) {
      void loadProfile(inspectorId);
    }
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
      supabase
        .from("inspector_equipment")
        .select("equipment_types(id,name,category,code)")
        .eq("profile_id", id),

      supabase
        .from("inspector_activities")
        .select(
          "inspection_activities(id,name,category,code)",
        )
        .eq("profile_id", id),

      supabase
        .from("inspector_ndt_methods")
        .select(
          "level,certificate_number,issued_on,expires_on,ndt_methods(id,name,category,code)",
        )
        .eq("profile_id", id),

      supabase
        .from("inspector_certifications")
        .select(
          "certificate_number,issued_on,expires_on,certifications(id,name,category,code)",
        )
        .eq("profile_id", id),

      supabase
        .from("inspector_codes_standards")
        .select(
          "proficiency,years_experience,codes_standards(id,name,category,code)",
        )
        .eq("profile_id", id),

      supabase
        .from("inspector_industries")
        .select("industries(id,name,category,code)")
        .eq("profile_id", id),

      supabase
        .from("inspector_languages")
        .select(
          "proficiency,languages(id,name,region,code)",
        )
        .eq("profile_id", id),

      supabase
        .from("inspector_travel_credentials")
        .select(
          "credential_number,issued_on,expires_on,travel_credentials(id,name,category,code)",
        )
        .eq("profile_id", id),

      supabase
        .from("inspector_work_countries")
        .select("countries(id,name,region,iso_code)")
        .eq("profile_id", id),

      supabase
        .from("inspector_software")
        .select(
          "proficiency,years_experience,software_tools(id,name,category,code)",
        )
        .eq("profile_id", id),

      supabase
        .from("inspector_training")
        .select(
          "provider,completed_on,expires_on,training_types(id,name,category,code)",
        )
        .eq("profile_id", id),
    ]);

    const unwrap = (
      rows: any[] | null,
      relationshipName: string,
    ) =>
      (rows || [])
        .map((row) => {
          const related = row[relationshipName];

          if (!related) return null;

          return {
            ...related,
            ...Object.fromEntries(
              Object.entries(row).filter(
                ([key]) => key !== relationshipName,
              ),
            ),
          };
        })
        .filter(Boolean);

    setData({
      profile: profileResult.data as InspectorProfile,
      equipment: unwrap(
        equipmentResult.data,
        "equipment_types",
      ),
      activities: unwrap(
        activitiesResult.data,
        "inspection_activities",
      ),
      ndtMethods: unwrap(
        ndtResult.data,
        "ndt_methods",
      ),
      certifications: unwrap(
        certificationsResult.data,
        "certifications",
      ),
      codes: unwrap(
        codesResult.data,
        "codes_standards",
      ),
      industries: unwrap(
        industriesResult.data,
        "industries",
      ),
      languages: unwrap(
        languagesResult.data,
        "languages",
      ),
      travelCredentials: unwrap(
        travelResult.data,
        "travel_credentials",
      ),
      workCountries: unwrap(
        countriesResult.data,
        "countries",
      ),
      software: unwrap(
        softwareResult.data,
        "software_tools",
      ),
      training: unwrap(
        trainingResult.data,
        "training_types",
      ),
    });

    setLoading(false);
  }

  async function copyProfileLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  if (loading) {
    return (
      <main className="qualificationPage">
        <section className="loadingCard">
          Loading qualifications...
        </section>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="qualificationPage">
        <section className="emptyCard">
          <h1>Qualification profile not found</h1>
          <p>
            This inspector profile may no longer be available.
          </p>
          <Link href="/inspectors" className="primaryButton">
            Browse qualified inspectors
          </Link>
        </section>
      </main>
    );
  }

  const profile = data.profile;

  const anonymousId = profile.inspector_id
    .replace(/-/g, "")
    .slice(-6)
    .toUpperCase();

  const professionalTitle = profile.primary_discipline
    ? `${profile.primary_discipline} Inspection Professional`
    : "Vendor Inspection Professional";

  const location = [
    profile.base_city || profile.base_location,
    profile.base_state,
    profile.base_country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="qualificationPage">
      <section className="privacyBanner">
        <strong>Identity protected by InspectSource</strong>
        <span>
          Direct contact details are released only after both parties
          accept an engagement.
        </span>
      </section>

      <section className="heroCard">
        <div>
          <p className="anonymousNumber">
            Inspector #{anonymousId}
          </p>

          <div className="titleLine">
            <h1>{professionalTitle}</h1>

            <span
              className={
                profile.is_verified
                  ? "verifiedBadge verified"
                  : "verifiedBadge"
              }
            >
              {profile.is_verified
                ? "Verified by InspectSource"
                : "Pre-Qualified Inspector"}
            </span>
          </div>

          <div className="metaRow">
            {location && <span>{location}</span>}

            {profile.years_experience !== null &&
              profile.years_experience !== undefined && (
                <span>
                  {profile.years_experience}+ years experience
                </span>
              )}

            {profile.inspector_type && (
              <span>{profile.inspector_type}</span>
            )}
          </div>
        </div>

        <div className="heroActions">
          <button
            type="button"
            className="secondaryButton"
            onClick={copyProfileLink}
          >
            {copied ? "Link copied" : "Share Qualification Summary"}
          </button>

          <Link
            className="primaryButton"
            href="/find-inspectors"
          >
            Check Availability
          </Link>
        </div>
      </section>

      <section className="quickStats">
        <Stat
          label="Availability"
          value={
            profile.availability_status ||
            "Contact for availability"
          }
        />

        <Stat
          label="Day Rate"
          value={formatMoney(
            profile.day_rate,
            profile.currency,
          )}
        />

        <Stat
          label="Travel Coverage"
          value={formatTravelCoverage(
            profile.driving_radius,
            profile.distance_unit,
          )}
        />

        <Stat
          label="Travel Capability"
          value={travelSummary(profile)}
        />
      </section>

      <div className="qualificationGrid">
        <div className="mainColumn">
          <ProfileSection title="Professional Summary">
            <p className="bioText">
              {profile.biography ||
                "A professional summary has not yet been provided."}
            </p>
          </ProfileSection>

          <TagSection
            title="Equipment Experience"
            items={data.equipment}
          />

          <TagSection
            title="Inspection Activities"
            items={data.activities}
          />

          <ProfileSection title="NDT Methods">
            <DetailCards
              items={data.ndtMethods}
              details={(item) => [
                item.level,
                item.certificate_number
                  ? `Credential ${item.certificate_number}`
                  : null,
                dateRange(
                  item.issued_on,
                  item.expires_on,
                ),
              ]}
            />
          </ProfileSection>

          <ProfileSection title="Certifications">
            <DetailCards
              items={data.certifications}
              details={(item) => [
                item.certificate_number
                  ? `Credential ${item.certificate_number}`
                  : null,
                dateRange(
                  item.issued_on,
                  item.expires_on,
                ),
              ]}
            />
          </ProfileSection>

          <ProfileSection title="Codes & Standards">
            <DetailCards
              items={data.codes}
              details={(item) => [
                item.proficiency,
                item.years_experience !== null &&
                item.years_experience !== undefined
                  ? `${item.years_experience} years`
                  : null,
              ]}
            />
          </ProfileSection>

          <TagSection
            title="Industry Experience"
            items={data.industries}
          />
        </div>

        <aside className="sideColumn">
          <ProfileSection title="Assignment Fit">
            <InfoList
              rows={[
                [
                  "Primary Discipline",
                  profile.primary_discipline,
                ],
                [
                  "Inspector Type",
                  profile.inspector_type,
                ],
                [
                  "Remote Review",
                  profile.remote_review_available
                    ? "Available"
                    : "Not listed",
                ],
                [
                  "Domestic Travel",
                  profile.domestic_travel
                    ? "Available"
                    : "Not listed",
                ],
                [
                  "International Travel",
                  profile.international_travel
                    ? "Available"
                    : "Not listed",
                ],
                [
                  "Maximum Flight Time",
                  profile.maximum_flight_hours !== null &&
                  profile.maximum_flight_hours !== undefined
                    ? `${profile.maximum_flight_hours} hours`
                    : null,
                ],
              ]}
            />
          </ProfileSection>

          <ProfileSection title="Languages">
            <DetailCards
              items={data.languages}
              details={(item) => [
                item.proficiency,
              ]}
              compact
            />
          </ProfileSection>

          <TagSection
            title="Work Countries"
            items={data.workCountries}
          />

          <ProfileSection title="Travel Credentials">
            <DetailCards
              items={data.travelCredentials}
              details={(item) => [
                item.certificate_number,
                dateRange(
                  item.issued_on,
                  item.expires_on,
                ),
              ]}
              compact
            />
          </ProfileSection>

          <ProfileSection title="Software">
            <DetailCards
              items={data.software}
              details={(item) => [
                item.proficiency,
                item.years_experience !== null &&
                item.years_experience !== undefined
                  ? `${item.years_experience} years`
                  : null,
              ]}
              compact
            />
          </ProfileSection>

          <ProfileSection title="Training">
            <DetailCards
              items={data.training}
              details={(item) => [
                item.provider,
                dateRange(
                  item.completed_on,
                  item.expires_on,
                ),
              ]}
              compact
            />
          </ProfileSection>

          <section className="requestCard">
            <h2>Interested in this inspector?</h2>
            <p>
              Submit the assignment through InspectSource. We will
              confirm interest and availability without exposing
              personal contact information.
            </p>

            <Link
              href="/find-inspectors"
              className="primaryButton"
            >
              Check Availability
            </Link>
          </section>
        </aside>
      </div>

      <style jsx>{`
        .qualificationPage {
          max-width: 1180px;
          margin: 0 auto;
          padding: 28px 18px 60px;
        }

        .privacyBanner,
        .heroCard,
        .loadingCard,
        .emptyCard,
        .sectionCard,
        .statCard,
        .requestCard {
          border: 1px solid rgba(127, 127, 127, 0.25);
          background: white;
          border-radius: 18px;
        }

        .privacyBanner {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 14px;
          padding: 13px 17px;
          background: #111827;
          color: white;
          font-size: 0.86rem;
        }

        .privacyBanner span {
          opacity: 0.78;
        }

        .heroCard {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          padding: 30px;
          box-shadow: 0 12px 34px rgba(17, 24, 39, 0.06);
        }

        .anonymousNumber {
          margin: 0 0 6px;
          color: #6b7280;
          font-size: 0.77rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .titleLine {
          display: flex;
          align-items: center;
          gap: 11px;
          flex-wrap: wrap;
        }

        .titleLine h1 {
          margin: 0;
          font-size: 2rem;
          line-height: 1.25;
        }

        .verifiedBadge {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          border-radius: 999px;
          background: #f8fafc;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .verifiedBadge.verified {
          border-color: #bbf7d0;
          background: #ecfdf5;
          color: #166534;
        }

        .metaRow {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .metaRow span {
          padding: 7px 10px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #4b5563;
          font-size: 0.84rem;
        }

        .heroActions {
          display: flex;
          align-items: flex-start;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .primaryButton,
        .secondaryButton {
          display: inline-flex;
          min-height: 43px;
          align-items: center;
          justify-content: center;
          padding: 0 15px;
          border-radius: 10px;
          font: inherit;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .primaryButton {
          border: 1px solid #111827;
          background: #111827;
          color: white;
        }

        .secondaryButton {
          border: 1px solid #d1d5db;
          background: white;
          color: #111827;
        }

        .quickStats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin: 18px 0;
        }

        .statCard {
          padding: 17px;
        }

        .statLabel {
          display: block;
          margin-bottom: 5px;
          color: #6b7280;
          font-size: 0.73rem;
          font-weight: 800;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .statValue {
          font-size: 1rem;
        }

        .qualificationGrid {
          display: grid;
          grid-template-columns:
            minmax(0, 2fr)
            minmax(290px, 1fr);
          gap: 18px;
        }

        .mainColumn,
        .sideColumn {
          display: grid;
          gap: 18px;
          align-content: start;
        }

        .sectionCard,
        .requestCard {
          padding: 22px;
        }

        .sectionCard h2,
        .requestCard h2 {
          margin: 0 0 16px;
          font-size: 1.2rem;
        }

        .bioText {
          margin: 0;
          line-height: 1.7;
          white-space: pre-line;
        }

        .tagGrid {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .tag {
          padding: 8px 11px;
          border: 1px solid #dbe3ee;
          border-radius: 9px;
          background: #f8fafc;
          font-size: 0.84rem;
          font-weight: 650;
        }

        .detailList {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .detailList.compact {
          grid-template-columns: 1fr;
        }

        .detailItem {
          padding: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fafafa;
        }

        .detailItem strong {
          display: block;
        }

        .detailMeta {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
          margin-top: 7px;
        }

        .detailMeta span {
          color: #6b7280;
          font-size: 0.8rem;
        }

        .infoList {
          display: grid;
          gap: 11px;
        }

        .infoRow {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1.1fr);
          gap: 10px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e5e7eb;
        }

        .infoRow:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .infoRow dt {
          color: #6b7280;
        }

        .infoRow dd {
          margin: 0;
          text-align: right;
          font-weight: 700;
        }

        .requestCard {
          background: #111827;
          color: white;
        }

        .requestCard p {
          color: #d1d5db;
          line-height: 1.55;
        }

        .requestCard .primaryButton {
          border-color: white;
          background: white;
          color: #111827;
        }

        .loadingCard,
        .emptyCard {
          padding: 32px;
        }

        @media (max-width: 900px) {
          .quickStats {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .qualificationGrid {
            grid-template-columns: 1fr;
          }

          .heroCard,
          .privacyBanner {
            flex-direction: column;
          }

          .heroActions {
            justify-content: flex-start;
          }
        }

        @media (max-width: 620px) {
          .titleLine h1 {
            font-size: 1.55rem;
          }

          .quickStats,
          .detailList {
            grid-template-columns: 1fr;
          }

          .heroCard,
          .sectionCard,
          .requestCard {
            padding: 18px;
          }
        }
      `}</style>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="statCard">
      <span className="statLabel">{label}</span>
      <strong className="statValue">{value}</strong>
    </div>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="sectionCard">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function TagSection({
  title,
  items,
}: {
  title: string;
  items: NamedItem[];
}) {
  return (
    <ProfileSection title={title}>
      {items.length > 0 ? (
        <div className="tagGrid">
          {items.map((item, index) => (
            <span
              className="tag"
              key={`${item.id || item.name}-${index}`}
            >
              {item.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="muted">Not listed.</p>
      )}
    </ProfileSection>
  );
}

function DetailCards({
  items,
  details,
  compact = false,
}: {
  items: DetailedItem[];
  details: (
    item: DetailedItem,
  ) => Array<string | null | undefined>;
  compact?: boolean;
}) {
  if (items.length === 0) {
    return <p className="muted">Not listed.</p>;
  }

  return (
    <div
      className={
        compact ? "detailList compact" : "detailList"
      }
    >
      {items.map((item, index) => {
        const values = details(item).filter(Boolean) as string[];

        return (
          <div
            className="detailItem"
            key={`${item.id || item.name}-${index}`}
          >
            <strong>{item.name}</strong>

            {values.length > 0 && (
              <div className="detailMeta">
                {values.map((value) => (
                  <span key={value}>{value}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function InfoList({
  rows,
}: {
  rows: Array<
    [
      string,
      string | number | null | undefined,
    ]
  >;
}) {
  const populatedRows = rows.filter(
    ([, value]) =>
      value !== null &&
      value !== undefined &&
      value !== "",
  );

  if (populatedRows.length === 0) {
    return <p className="muted">Not listed.</p>;
  }

  return (
    <dl className="infoList">
      {populatedRows.map(([label, value]) => (
        <div className="infoRow" key={label}>
          <dt>{label}</dt>
          <dd>{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatMoney(
  value: number | null | undefined,
  currency: string | null | undefined,
) {
  if (value === null || value === undefined) {
    return "Contact for rate";
  }

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

function dateRange(
  start?: string | null,
  end?: string | null,
) {
  if (!start && !end) return null;

  if (start && end) {
    return `${formatDate(start)} – ${formatDate(end)}`;
  }

  if (end) {
    return `Expires ${formatDate(end)}`;
  }

  return `Issued ${formatDate(start!)}`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}


function formatTravelCoverage(
  radius: number | null | undefined,
  unit: string | null | undefined,
) {
  if (radius === null || radius === undefined) {
    return "Contact for coverage";
  }

  const miles =
    unit === "kilometers"
      ? radius * 0.621371
      : radius;

  if (miles <= 50) return "Local travel";
  if (miles <= 150) return "Regional travel";
  if (miles <= 500) return "Extended regional travel";

  return "National travel";
}

function travelSummary(profile: InspectorProfile) {
  if (profile.international_travel) {
    return "Domestic & international";
  }

  if (profile.domestic_travel || profile.willing_to_travel) {
    return "Domestic travel";
  }

  return "Local assignments";
}
