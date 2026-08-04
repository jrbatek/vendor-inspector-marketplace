import Link from "next/link";
import type { InspectorProfile } from "@/lib/types";

export type QualificationItem = {
  id?: string;
  name: string;
  code?: string | null;
  category?: string | null;
  level?: string | null;
};

export type DirectoryInspector = {
  profile: InspectorProfile;
  certifications: QualificationItem[];
  ndtMethods: QualificationItem[];
  industries: QualificationItem[];
  travelCredentials: QualificationItem[];
};

export default function InspectorCard({
  inspector,
}: {
  inspector: DirectoryInspector;
}) {
  const profile = inspector.profile;

  const anonymousId = profile.inspector_id
    .replace(/-/g, "")
    .slice(-6)
    .toUpperCase();

  const professionalTitle =
    profile.headline?.trim() ||
    (profile.primary_discipline
      ? `${profile.primary_discipline} Inspection Professional`
      : "Vendor Inspection Professional");

  const location = [
    profile.base_city || profile.base_location,
    profile.base_state,
    profile.base_country,
  ]
    .filter(Boolean)
    .join(", ");

  const availability =
    profile.availability_status ||
    (profile.available ? "Available" : "Contact for availability");

  const isAvailable =
    availability !== "Unavailable";

  const drivingRadius =
    profile.driving_radius !== null &&
    profile.driving_radius !== undefined
      ? `${profile.driving_radius} ${
          profile.distance_unit || "miles"
        }`
      : "Contact for travel radius";

  const topQualifications = [
    ...inspector.certifications.map((item) =>
      item.code || item.name
    ),
    ...inspector.ndtMethods.map((item) =>
      item.level
        ? `${item.code || item.name} ${item.level}`
        : item.code || item.name
    ),
    ...inspector.travelCredentials.map((item) =>
      item.code || item.name
    ),
  ]
    .filter(Boolean)
    .slice(0, 6);

  const topIndustries = inspector.industries
    .map((item) => item.name)
    .filter(Boolean)
    .slice(0, 4);

  return (
    <article className="candidateCard">
      <div className="candidateHeader">
        <div>
          <p className="candidateNumber">
            Inspector #{anonymousId}
          </p>
          <h2>{professionalTitle}</h2>
        </div>

        <span
          className={
            profile.is_verified
              ? "verificationBadge verified"
              : "verificationBadge"
          }
        >
          {profile.is_verified
            ? "Verified Inspector"
            : "Inspector Profile"}
        </span>
      </div>

      <div className="decisionFacts">
        <span>{location || "Location available upon request"}</span>

        {profile.years_experience !== null &&
          profile.years_experience !== undefined && (
            <span>
              {profile.years_experience}+ years experience
            </span>
          )}

        <span
          className={
            isAvailable
              ? "availability available"
              : "availability unavailable"
          }
        >
          {availability}
        </span>
      </div>

      <div className="primaryDiscipline">
        <span>Primary discipline</span>
        <strong>
          {profile.primary_discipline || "Vendor Inspection"}
        </strong>
      </div>

      <div className="qualificationBlock">
        <h3>Top qualifications</h3>

        {topQualifications.length > 0 ? (
          <div className="qualificationTags">
            {topQualifications.map((qualification) => (
              <span key={qualification}>{qualification}</span>
            ))}
          </div>
        ) : (
          <p className="muted">
            Detailed qualifications available in the profile.
          </p>
        )}
      </div>

      {topIndustries.length > 0 && (
        <div className="qualificationBlock">
          <h3>Industry experience</h3>
          <div className="industryList">
            {topIndustries.map((industry) => (
              <span key={industry}>{industry}</span>
            ))}
          </div>
        </div>
      )}

      <div className="commercialFacts">
        <div>
          <span>Day rate</span>
          <strong>
            {formatMoney(profile.day_rate, profile.currency)}
          </strong>
        </div>

        <div>
          <span>Travel radius</span>
          <strong>{drivingRadius}</strong>
        </div>

        <div>
          <span>Travel</span>
          <strong>{travelSummary(profile)}</strong>
        </div>
      </div>

      <div className="candidateActions">
        <Link
          className="button secondary"
          href={`/inspectors/${profile.inspector_id}`}
        >
          View Qualifications
        </Link>

        <Link
          className="button"
          href="/find-inspectors"
        >
          Request Availability
        </Link>
      </div>

      <p className="privacyNote">
        Identity and direct contact details are released only through
        an accepted InspectSource engagement.
      </p>

      <style jsx>{`
        .candidateCard {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          padding: 22px;
          border: 1px solid var(--border);
          border-radius: 18px;
          background: var(--card);
          box-shadow: 0 10px 28px rgba(17, 24, 39, 0.055);
        }

        .candidateHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
        }

        .candidateNumber {
          margin: 0 0 5px;
          color: var(--muted);
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .candidateHeader h2 {
          margin: 0;
          font-size: 1.25rem;
          line-height: 1.3;
        }

        .verificationBadge {
          flex: 0 0 auto;
          padding: 6px 9px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: #f8fafc;
          color: #475569;
          font-size: 0.72rem;
          font-weight: 800;
          white-space: nowrap;
        }

        .verificationBadge.verified {
          border-color: #bbf7d0;
          background: #ecfdf5;
          color: #166534;
        }

        .decisionFacts {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin: 16px 0;
        }

        .decisionFacts span {
          padding: 6px 9px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #4b5563;
          font-size: 0.79rem;
        }

        .decisionFacts .availability.available {
          background: #dcfce7;
          color: #166534;
          font-weight: 700;
        }

        .decisionFacts .availability.unavailable {
          background: #f3f4f6;
          color: #6b7280;
        }

        .primaryDiscipline {
          display: grid;
          gap: 3px;
          padding: 13px 14px;
          border-radius: 12px;
          background: #111827;
          color: white;
        }

        .primaryDiscipline span,
        .commercialFacts span {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.72;
        }

        .qualificationBlock {
          margin-top: 18px;
        }

        .qualificationBlock h3 {
          margin: 0 0 9px;
          font-size: 0.9rem;
        }

        .qualificationTags,
        .industryList {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .qualificationTags span {
          padding: 6px 9px;
          border: 1px solid #dbe3ee;
          border-radius: 8px;
          background: #f8fafc;
          font-size: 0.78rem;
          font-weight: 650;
        }

        .industryList span {
          font-size: 0.82rem;
          color: #475569;
        }

        .industryList span:not(:last-child)::after {
          content: " •";
        }

        .commercialFacts {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
          margin-top: auto;
          padding-top: 20px;
        }

        .commercialFacts div {
          display: grid;
          gap: 4px;
          padding: 11px;
          border: 1px solid var(--border);
          border-radius: 11px;
          background: #fafafa;
        }

        .commercialFacts strong {
          font-size: 0.84rem;
          line-height: 1.35;
        }

        .candidateActions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 9px;
          margin-top: 15px;
        }

        .candidateActions :global(.button) {
          width: 100%;
          text-align: center;
        }

        .privacyNote {
          margin: 12px 0 0;
          color: var(--muted);
          font-size: 0.72rem;
          line-height: 1.45;
          text-align: center;
        }

        @media (max-width: 520px) {
          .candidateHeader {
            flex-direction: column;
          }

          .commercialFacts,
          .candidateActions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </article>
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

function travelSummary(profile: InspectorProfile) {
  if (profile.international_travel) {
    return "Domestic & international";
  }

  if (profile.domestic_travel || profile.willing_to_travel) {
    return "Domestic travel";
  }

  return "Local assignments";
}
