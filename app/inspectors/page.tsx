"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import type { InspectorProfile } from "@/lib/types";
import InspectorCard, {
  type DirectoryInspector,
  type QualificationItem,
} from "@/components/InspectorCard";

export default function InspectorsPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [inspectors, setInspectors] = useState<DirectoryInspector[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [certification, setCertification] = useState("");
  const [method, setMethod] = useState("");

  useEffect(() => {
    void loadInspectors();

    const intervalId = window.setInterval(() => {
      void loadInspectors();
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  async function loadInspectors() {
    setLoading(true);
    setMessage("");

    const [
      profilesResult,
      certificationsResult,
      ndtResult,
      industriesResult,
      travelResult,
    ] = await Promise.all([
      supabase
        .from("inspector_profiles")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("inspector_certifications")
        .select(
          "profile_id, certifications(id,name,code,category)",
        ),

      supabase
        .from("inspector_ndt_methods")
        .select(
          "profile_id, level, ndt_methods(id,name,code,category)",
        ),

      supabase
        .from("inspector_industries")
        .select(
          "profile_id, industries(id,name,code,category)",
        ),

      supabase
        .from("inspector_travel_credentials")
        .select(
          "profile_id, travel_credentials(id,name,code,category)",
        ),
    ]);

    const firstError = [
      profilesResult,
      certificationsResult,
      ndtResult,
      industriesResult,
      travelResult,
    ].find((result) => result.error)?.error;

    if (firstError) {
      setMessage(firstError.message);
      setInspectors([]);
      setLoading(false);
      return;
    }

    const groupRelated = (
      rows: any[] | null,
      relationshipName: string,
    ): Record<string, QualificationItem[]> => {
      const grouped: Record<string, QualificationItem[]> = {};

      for (const row of rows || []) {
        const related = row[relationshipName];

        if (!related || !row.profile_id) continue;
        if (!grouped[row.profile_id]) grouped[row.profile_id] = [];

        grouped[row.profile_id].push({
          ...related,
          level: row.level || null,
        });
      }

      return grouped;
    };

    const certificationsByInspector = groupRelated(
      certificationsResult.data,
      "certifications",
    );
    const ndtByInspector = groupRelated(
      ndtResult.data,
      "ndt_methods",
    );
    const industriesByInspector = groupRelated(
      industriesResult.data,
      "industries",
    );
    const travelByInspector = groupRelated(
      travelResult.data,
      "travel_credentials",
    );

    const directoryInspectors = (
      (profilesResult.data || []) as InspectorProfile[]
    ).map((profile) => ({
      profile,
      certifications:
        certificationsByInspector[profile.inspector_id] || [],
      ndtMethods:
        ndtByInspector[profile.inspector_id] || [],
      industries:
        industriesByInspector[profile.inspector_id] || [],
      travelCredentials:
        travelByInspector[profile.inspector_id] || [],
    }));

    setInspectors(directoryInspectors);
    setLoading(false);
  }

  const filtered = useMemo(() => {
    const queryText = q.trim().toLowerCase();
    const locationText = location.trim().toLowerCase();
    const certificationText = certification.trim().toLowerCase();
    const methodText = method.trim().toLowerCase();

    return inspectors.filter((inspector) => {
      const profile = inspector.profile;

      const generalSearch = [
        profile.headline,
        profile.primary_discipline,
        profile.biography,
        profile.base_city,
        profile.base_state,
        profile.base_country,
        ...inspector.certifications.flatMap((item) => [
          item.name,
          item.code,
        ]),
        ...inspector.ndtMethods.flatMap((item) => [
          item.name,
          item.code,
          item.level,
        ]),
        ...inspector.industries.flatMap((item) => [
          item.name,
          item.code,
        ]),
        ...inspector.travelCredentials.flatMap((item) => [
          item.name,
          item.code,
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const inspectorLocation = [
        profile.base_city,
        profile.base_state,
        profile.base_country,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const inspectorCertifications = inspector.certifications
        .flatMap((item) => [item.name, item.code])
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const inspectorMethods = inspector.ndtMethods
        .flatMap((item) => [item.name, item.code, item.level])
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!queryText || generalSearch.includes(queryText)) &&
        (!locationText ||
          inspectorLocation.includes(locationText)) &&
        (!certificationText ||
          inspectorCertifications.includes(certificationText)) &&
        (!methodText ||
          inspectorMethods.includes(methodText))
      );
    });
  }, [
    inspectors,
    q,
    location,
    certification,
    method,
  ]);

  return (
    <>
      <section className="hero anonymousHero">
        <p className="sectionEyebrow">InspectSource Marketplace</p>
        <h1>Evaluate qualified vendor inspectors</h1>
        <p className="muted heroCopy">
          Compare qualifications, availability, travel capability, and rates.
          Inspector identities remain protected until an engagement is
          accepted through InspectSource.
        </p>
      </section>

      <section className="panel marketplaceSearch">
        <div className="searchBar">
          <input
            placeholder="Discipline, industry, credential, or experience"
            value={q}
            onChange={(event) => setQ(event.target.value)}
          />
          <input
            placeholder="Location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <input
            placeholder="Certification, e.g. API 510"
            value={certification}
            onChange={(event) =>
              setCertification(event.target.value)
            }
          />
          <input
            placeholder="NDT method, e.g. UT"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
          />
        </div>

        {message && <p className="notice">{message}</p>}

        <div className="resultsSummary">
          <strong>
            {loading
              ? "Loading qualified inspectors..."
              : `${filtered.length} qualified inspector${
                  filtered.length === 1 ? "" : "s"
                } found`}
          </strong>
          <span>
            Personal contact details are never shown publicly.
          </span>
        </div>
      </section>

      <div style={{ height: 16 }} />

      <section className="grid anonymousGrid">
        {filtered.map((inspector) => (
          <InspectorCard
            key={inspector.profile.inspector_id}
            inspector={inspector}
          />
        ))}
      </section>

      {!loading && filtered.length === 0 && (
        <section className="panel emptyResults">
          <h2>No qualified profiles matched this search</h2>
          <p className="muted">
            Try a broader location or remove one qualification.
          </p>
        </section>
      )}

      <style jsx>{`
        .anonymousHero {
          padding: 34px;
        }

        .sectionEyebrow {
          margin: 0 0 6px;
          font-size: 0.76rem;
          font-weight: 800;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .heroCopy {
          max-width: 780px;
          margin-bottom: 0;
          font-size: 1.03rem;
          line-height: 1.65;
        }

        .marketplaceSearch {
          padding: 20px;
        }

        .resultsSummary {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-top: 14px;
          color: var(--muted);
        }

        .resultsSummary strong {
          color: var(--text);
        }

        .anonymousGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          align-items: stretch;
        }

        .emptyResults {
          margin-top: 16px;
          text-align: center;
          padding: 34px;
        }

        .emptyResults h2 {
          margin-top: 0;
        }

        @media (max-width: 1050px) {
          .anonymousGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .anonymousGrid {
            grid-template-columns: 1fr;
          }

          .resultsSummary {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
