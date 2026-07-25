"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import type { InspectorProfile } from "@/lib/types";

type WizardStep = 1 | 2;

type FormState = {
  full_name: string;
  headline: string;
  company: string;
  inspector_type: "Independent" | "Agency" | "Company Employee";
  phone: string;
  office_home_address: string;
  base_city: string;
  base_state: string;
  base_country: string;
  latitude: string;
  longitude: string;
  years_experience: string;
  primary_discipline: string;
  biography: string;
  linkedin_url: string;
  website_url: string;
};

const blankForm: FormState = {
  full_name: "",
  headline: "",
  company: "",
  inspector_type: "Independent",
  phone: "",
  office_home_address: "",
  base_city: "",
  base_state: "",
  base_country: "United States",
  latitude: "",
  longitude: "",
  years_experience: "",
  primary_discipline: "",
  biography: "",
  linkedin_url: "",
  website_url: "",
};

const disciplines = [
  "Vendor Inspection",
  "Welding Inspection",
  "Pressure Equipment",
  "Piping Inspection",
  "Storage Tank Inspection",
  "Rotating Equipment",
  "Electrical Inspection",
  "Instrumentation Inspection",
  "NDT",
  "Coating Inspection",
  "Civil / Structural Inspection",
  "Quality Auditing",
  "Expediting",
];

export default function DashboardPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [form, setForm] = useState<FormState>(blankForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "notice">("notice");

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setMessage("");

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      setUserId(null);
      setLoading(false);
      return;
    }

    const user = authData.user;
    setUserId(user.id);

    const { data, error } = await supabase
      .from("inspector_profiles")
      .select("*")
      .eq("inspector_id", user.id)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
      setMessageType("notice");
      setLoading(false);
      return;
    }

    if (data) {
      const profile = data as InspectorProfile;
      setProfileExists(true);
      setForm({
        full_name: profile.full_name || user.user_metadata?.name || "",
        headline: profile.headline || "",
        company: profile.company || "",
        inspector_type: profile.inspector_type || "Independent",
        phone: profile.phone || "",
        office_home_address: profile.office_home_address || "",
        base_city: profile.base_city || profile.base_location || "",
        base_state: profile.base_state || "",
        base_country: profile.base_country || "United States",
        latitude:
          profile.latitude === null || profile.latitude === undefined
            ? ""
            : String(profile.latitude),
        longitude:
          profile.longitude === null || profile.longitude === undefined
            ? ""
            : String(profile.longitude),
        years_experience:
          profile.years_experience === null ||
          profile.years_experience === undefined
            ? ""
            : String(profile.years_experience),
        primary_discipline: profile.primary_discipline || "",
        biography: profile.biography || "",
        linkedin_url: profile.linkedin_url || "",
        website_url: profile.website_url || "",
      });
    } else {
      setProfileExists(false);
      setForm({
        ...blankForm,
        full_name: user.user_metadata?.name || "",
      });
    }

    setLoading(false);
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function validateStep(currentStep: WizardStep): string | null {
    if (currentStep === 1) {
      if (!form.full_name.trim()) return "Enter your full name.";
      if (!form.headline.trim()) return "Enter a professional headline.";
      if (!form.base_city.trim()) return "Enter your base city.";
      if (!form.base_country.trim()) return "Enter your base country.";
    }

    if (currentStep === 2) {
      const years = Number(form.years_experience);
      if (!form.years_experience.trim()) return "Enter your years of experience.";
      if (!Number.isFinite(years) || years < 0 || years > 80) {
        return "Years of experience must be between 0 and 80.";
      }
      if (!form.primary_discipline) return "Select a primary discipline.";
      if (form.biography.trim().length < 50) {
        return "Your professional biography should be at least 50 characters.";
      }
    }

    return null;
  }

  async function validateAddress() {
    if (!form.office_home_address.trim()) {
      setMessage("Enter an office or home address first.");
      setMessageType("notice");
      return;
    }

    setMessage("Checking address...");
    setMessageType("notice");

    try {
      const url =
        "https://nominatim.openstreetmap.org/search" +
        `?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(
          form.office_home_address,
        )}`;

      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error("Address lookup failed.");
      }

      const results = await response.json();

      if (!Array.isArray(results) || !results[0]) {
        setMessage(
          "Address not found. You can still enter the city, state and country manually.",
        );
        return;
      }

      const result = results[0];
      const address = result.address || {};

      setForm((current) => ({
        ...current,
        office_home_address:
          result.display_name || current.office_home_address,
        base_city:
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          current.base_city,
        base_state: address.state || address.region || current.base_state,
        base_country: address.country || current.base_country,
        latitude: result.lat || "",
        longitude: result.lon || "",
      }));

      setMessage("Address validated.");
      setMessageType("success");
    } catch {
      setMessage(
        "Address lookup failed. You can still enter the city, state and country manually.",
      );
      setMessageType("notice");
    }
  }

  async function saveProfile(targetStep?: WizardStep) {
    if (!userId) return false;

    const errorMessage = validateStep(step);
    if (errorMessage) {
      setMessage(errorMessage);
      setMessageType("notice");
      return false;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      inspector_id: userId,
      full_name: form.full_name.trim(),
      headline: form.headline.trim(),
      company: form.company.trim() || null,
      inspector_type: form.inspector_type,
      phone: form.phone.trim() || null,
      office_home_address: form.office_home_address.trim() || null,
      base_location: form.base_city.trim(),
      base_city: form.base_city.trim(),
      base_state: form.base_state.trim() || null,
      base_country: form.base_country.trim(),
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      years_experience: form.years_experience
        ? Number(form.years_experience)
        : null,
      primary_discipline: form.primary_discipline || null,
      biography: form.biography.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      website_url: form.website_url.trim() || null,
    };

    const { error } = await supabase
      .from("inspector_profiles")
      .upsert(payload, { onConflict: "inspector_id" });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      setMessageType("notice");
      return false;
    }

    setProfileExists(true);
    setMessage("Profile saved.");
    setMessageType("success");

    if (targetStep) setStep(targetStep);
    return true;
  }

  async function goNext() {
    if (step === 1) {
      await saveProfile(2);
    }
  }

  async function finish() {
    const saved = await saveProfile();
    if (saved) {
      setMessage(
        "Steps 1 and 2 are complete. The next profile sections will add equipment, inspection activities, certifications and other qualifications.",
      );
      setMessageType("success");
    }
  }

  if (loading) {
    return (
      <section className="panel">
        <p>Loading dashboard...</p>
      </section>
    );
  }

  if (!userId) {
    return (
      <section className="panel">
        <h1>Inspector Dashboard</h1>
        <p>You need to log in before creating an inspector profile.</p>
        <Link className="button" href="/login">
          Log in
        </Link>
      </section>
    );
  }

  return (
    <section className="panel wizardShell">
      <div className="wizardHeader">
        <div>
          <p className="eyebrow">Inspector Profile</p>
          <h1>Build Your Professional Profile</h1>
          <p className="muted">
            Complete the first two sections. Your progress is saved when you
            continue.
          </p>
        </div>

        <div className="headerActions">
          {profileExists && (
            <Link
              href={`/inspectors/${userId}`}
              className="button secondary"
            >
              View Public Profile
            </Link>
          )}
          <Link href="/logout" className="button secondary">
            Log out
          </Link>
        </div>
      </div>

      <div className="progressWrap" aria-label="Profile progress">
        <div className="progressTop">
          <strong>Step {step} of 2</strong>
          <span>{step === 1 ? "Personal Information" : "Professional Experience"}</span>
        </div>
        <div className="progressTrack">
          <div
            className="progressBar"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      <div className="stepTabs">
        <button
          type="button"
          className={step === 1 ? "stepTab active" : "stepTab complete"}
          onClick={() => setStep(1)}
        >
          <span>1</span>
          Personal Information
        </button>
        <button
          type="button"
          className={step === 2 ? "stepTab active" : "stepTab"}
          onClick={() => {
            const errorMessage = validateStep(1);
            if (errorMessage) {
              setMessage(errorMessage);
              setMessageType("notice");
              return;
            }
            setStep(2);
          }}
        >
          <span>2</span>
          Professional Experience
        </button>
      </div>

      {message && (
        <p className={messageType === "success" ? "success" : "notice"}>
          {message}
        </p>
      )}

      {step === 1 && (
        <div className="wizardCard">
          <div className="sectionHeading">
            <div>
              <h2>Personal Information</h2>
              <p className="muted">
                This information identifies you and helps clients understand
                where you are based.
              </p>
            </div>
          </div>

          <div className="formGrid">
            <label>
              Full Name
              <input
                value={form.full_name}
                onChange={(event) =>
                  setField("full_name", event.target.value)
                }
                autoComplete="name"
                required
              />
            </label>

            <label>
              Inspector Type
              <select
                value={form.inspector_type}
                onChange={(event) =>
                  setField(
                    "inspector_type",
                    event.target.value as FormState["inspector_type"],
                  )
                }
              >
                <option value="Independent">Independent</option>
                <option value="Agency">Agency</option>
                <option value="Company Employee">Company Employee</option>
              </select>
            </label>

            <label className="full">
              Professional Headline
              <input
                value={form.headline}
                onChange={(event) =>
                  setField("headline", event.target.value)
                }
                placeholder="Example: API 510 / 570 Inspector and AWS CWI"
                required
              />
              <small>
                Use a clear one-line summary that clients can understand
                immediately.
              </small>
            </label>

            <label>
              Company
              <input
                value={form.company}
                onChange={(event) => setField("company", event.target.value)}
                autoComplete="organization"
              />
            </label>

            <label>
              Phone
              <input
                value={form.phone}
                onChange={(event) => setField("phone", event.target.value)}
                autoComplete="tel"
              />
            </label>

            <label className="full">
              Office / Home Address
              <input
                value={form.office_home_address}
                onChange={(event) =>
                  setField("office_home_address", event.target.value)
                }
                placeholder="Enter a full address for validation"
                autoComplete="street-address"
              />
            </label>

            <div className="full addressActions">
              <button
                type="button"
                className="button secondary"
                onClick={validateAddress}
              >
                Validate Address
              </button>
              {form.latitude && form.longitude && (
                <span className="muted">
                  Coordinates saved for future distance searches.
                </span>
              )}
            </div>

            <label>
              Base City
              <input
                value={form.base_city}
                onChange={(event) =>
                  setField("base_city", event.target.value)
                }
                required
              />
            </label>

            <label>
              State / Province
              <input
                value={form.base_state}
                onChange={(event) =>
                  setField("base_state", event.target.value)
                }
              />
            </label>

            <label>
              Country
              <input
                value={form.base_country}
                onChange={(event) =>
                  setField("base_country", event.target.value)
                }
                required
              />
            </label>

            <label>
              LinkedIn URL
              <input
                type="url"
                value={form.linkedin_url}
                onChange={(event) =>
                  setField("linkedin_url", event.target.value)
                }
                placeholder="https://www.linkedin.com/in/..."
              />
            </label>

            <label className="full">
              Website URL
              <input
                type="url"
                value={form.website_url}
                onChange={(event) =>
                  setField("website_url", event.target.value)
                }
                placeholder="https://..."
              />
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizardCard">
          <div className="sectionHeading">
            <div>
              <h2>Professional Experience</h2>
              <p className="muted">
                Summarize your core discipline and the experience that makes
                you qualified for inspection assignments.
              </p>
            </div>
          </div>

          <div className="formGrid">
            <label>
              Years of Experience
              <input
                type="number"
                min="0"
                max="80"
                value={form.years_experience}
                onChange={(event) =>
                  setField("years_experience", event.target.value)
                }
                required
              />
            </label>

            <label>
              Primary Discipline
              <select
                value={form.primary_discipline}
                onChange={(event) =>
                  setField("primary_discipline", event.target.value)
                }
                required
              >
                <option value="">Select...</option>
                {disciplines.map((discipline) => (
                  <option key={discipline} value={discipline}>
                    {discipline}
                  </option>
                ))}
              </select>
            </label>

            <label className="full">
              Professional Biography
              <textarea
                value={form.biography}
                onChange={(event) =>
                  setField("biography", event.target.value)
                }
                placeholder="Describe your inspection background, equipment experience, industries, project types and geographic experience."
                rows={8}
                required
              />
              <small>
                Minimum 50 characters. Avoid listing every certification here;
                structured certification fields are coming next.
              </small>
            </label>
          </div>

          <div className="comingNext">
            <strong>Coming in the next dashboard upgrade</strong>
            <p>
              Equipment, inspection activities, NDT methods, certifications,
              codes and standards, industries, languages, travel credentials,
              software, rates and availability.
            </p>
          </div>
        </div>
      )}

      <div className="wizardFooter">
        <div>
          {step === 2 && (
            <button
              type="button"
              className="button secondary"
              onClick={() => setStep(1)}
              disabled={saving}
            >
              Back
            </button>
          )}
        </div>

        <div className="footerRight">
          <button
            type="button"
            className="button secondary"
            onClick={() => void saveProfile()}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>

          {step === 1 ? (
            <button
              type="button"
              onClick={() => void goNext()}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void finish()}
              disabled={saving}
            >
              {saving ? "Saving..." : "Finish Steps 1–2"}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .wizardShell {
          max-width: 980px;
          margin: 0 auto;
        }

        .wizardHeader,
        .progressTop,
        .wizardFooter,
        .headerActions,
        .footerRight,
        .addressActions,
        .sectionHeading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .wizardHeader,
        .wizardFooter,
        .progressTop,
        .sectionHeading {
          justify-content: space-between;
        }

        .wizardHeader {
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .headerActions {
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .eyebrow {
          margin: 0 0 4px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        h1,
        h2 {
          margin-top: 0;
        }

        .progressWrap {
          margin: 18px 0 20px;
        }

        .progressTop {
          margin-bottom: 8px;
          font-size: 0.92rem;
        }

        .progressTrack {
          height: 10px;
          overflow: hidden;
          border-radius: 999px;
          background: rgba(127, 127, 127, 0.2);
        }

        .progressBar {
          height: 100%;
          border-radius: inherit;
          background: currentColor;
          transition: width 180ms ease;
        }

        .stepTabs {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .stepTab {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          padding: 14px 16px;
          border: 1px solid rgba(127, 127, 127, 0.35);
          border-radius: 12px;
          background: transparent;
          color: inherit;
          text-align: left;
        }

        .stepTab span {
          display: grid;
          width: 30px;
          height: 30px;
          place-items: center;
          border-radius: 50%;
          border: 1px solid currentColor;
          font-weight: 800;
        }

        .stepTab.active {
          border-width: 2px;
          font-weight: 800;
        }

        .stepTab.complete span {
          font-weight: 800;
        }

        .wizardCard {
          padding: 24px;
          border: 1px solid rgba(127, 127, 127, 0.28);
          border-radius: 16px;
          background: rgba(127, 127, 127, 0.04);
        }

        .sectionHeading {
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          font-weight: 700;
        }

        label.full,
        .full {
          grid-column: 1 / -1;
        }

        input,
        select,
        textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px;
          border: 1px solid rgba(127, 127, 127, 0.42);
          border-radius: 9px;
          background: transparent;
          color: inherit;
          font: inherit;
        }

        textarea {
          resize: vertical;
        }

        small {
          font-weight: 400;
          opacity: 0.72;
        }

        .addressActions {
          flex-wrap: wrap;
        }

        .comingNext {
          margin-top: 22px;
          padding: 16px;
          border: 1px dashed rgba(127, 127, 127, 0.5);
          border-radius: 12px;
        }

        .comingNext p {
          margin-bottom: 0;
        }

        .wizardFooter {
          margin-top: 20px;
        }

        .footerRight {
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        @media (max-width: 720px) {
          .wizardHeader,
          .wizardFooter {
            align-items: stretch;
            flex-direction: column;
          }

          .headerActions,
          .footerRight {
            justify-content: flex-start;
          }

          .stepTabs,
          .formGrid {
            grid-template-columns: 1fr;
          }

          label.full,
          .full {
            grid-column: auto;
          }

          .wizardCard {
            padding: 18px;
          }
        }
      `}</style>
    </section>
  );
}
