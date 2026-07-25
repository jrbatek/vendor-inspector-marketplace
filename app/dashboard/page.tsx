"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import type {
  EquipmentReference,
  InspectionActivityReference,
  InspectorProfile,
} from "@/lib/types";

type WizardStep = 1 | 2 | 3 | 4;

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

  const [equipment, setEquipment] = useState<EquipmentReference[]>([]);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [equipmentSearch, setEquipmentSearch] = useState("");

  const [activities, setActivities] = useState<InspectionActivityReference[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [activitySearch, setActivitySearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "notice">("notice");

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function loadDashboard() {
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

    const [
      profileResult,
      equipmentResult,
      selectedEquipmentResult,
      activitiesResult,
      selectedActivitiesResult,
    ] = await Promise.all([
      supabase
        .from("inspector_profiles")
        .select("*")
        .eq("inspector_id", user.id)
        .maybeSingle(),
      supabase
        .from("equipment_types")
        .select("id, category, name, code, notes, active")
        .eq("active", true)
        .order("category")
        .order("name"),
      supabase
        .from("inspector_equipment")
        .select("equipment_id")
        .eq("profile_id", user.id),
      supabase
        .from("inspection_activities")
        .select("id, category, name, code, notes, active")
        .eq("active", true)
        .order("category")
        .order("name"),
      supabase
        .from("inspector_activities")
        .select("activity_id")
        .eq("profile_id", user.id),
    ]);

    const firstError =
      profileResult.error ||
      equipmentResult.error ||
      selectedEquipmentResult.error ||
      activitiesResult.error ||
      selectedActivitiesResult.error;

    if (firstError) {
      setMessage(firstError.message);
      setMessageType("notice");
      setLoading(false);
      return;
    }

    setEquipment((equipmentResult.data || []) as EquipmentReference[]);
    setSelectedEquipmentIds(
      (selectedEquipmentResult.data || []).map((row) => row.equipment_id),
    );

    setActivities((activitiesResult.data || []) as InspectionActivityReference[]);
    setSelectedActivityIds(
      (selectedActivitiesResult.data || []).map((row) => row.activity_id),
    );

    if (profileResult.data) {
      const profile = profileResult.data as InspectorProfile;
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

      if (!form.years_experience.trim()) {
        return "Enter your years of experience.";
      }

      if (!Number.isFinite(years) || years < 0 || years > 80) {
        return "Years of experience must be between 0 and 80.";
      }

      if (!form.primary_discipline) {
        return "Select a primary discipline.";
      }

      if (form.biography.trim().length < 50) {
        return "Your professional biography should be at least 50 characters.";
      }
    }

    if (currentStep === 3 && selectedEquipmentIds.length === 0) {
      return "Select at least one equipment type.";
    }

    if (currentStep === 4 && selectedActivityIds.length === 0) {
      return "Select at least one inspection activity.";
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

  async function saveCoreProfile() {
    if (!userId) return false;

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

    if (error) {
      setMessage(error.message);
      setMessageType("notice");
      return false;
    }

    setProfileExists(true);
    return true;
  }

  async function replaceSelections(
    tableName: "inspector_equipment" | "inspector_activities",
    foreignKey: "equipment_id" | "activity_id",
    selectedIds: string[],
  ) {
    if (!userId) return false;

    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .eq("profile_id", userId);

    if (deleteError) {
      setMessage(deleteError.message);
      setMessageType("notice");
      return false;
    }

    const rows = selectedIds.map((selectedId) => ({
      profile_id: userId,
      [foreignKey]: selectedId,
    }));

    const { error: insertError } = await supabase
      .from(tableName)
      .insert(rows);

    if (insertError) {
      setMessage(insertError.message);
      setMessageType("notice");
      return false;
    }

    return true;
  }

  async function saveCurrentStep(targetStep?: WizardStep) {
    if (!userId) return false;

    const validationError = validateStep(step);

    if (validationError) {
      setMessage(validationError);
      setMessageType("notice");
      return false;
    }

    setSaving(true);
    setMessage("");

    let saved = false;

    if (step === 1 || step === 2) {
      saved = await saveCoreProfile();
    } else if (step === 3) {
      saved = await replaceSelections(
        "inspector_equipment",
        "equipment_id",
        selectedEquipmentIds,
      );
    } else {
      saved = await replaceSelections(
        "inspector_activities",
        "activity_id",
        selectedActivityIds,
      );
    }

    setSaving(false);

    if (!saved) return false;

    setMessage("Progress saved.");
    setMessageType("success");

    if (targetStep) {
      setStep(targetStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return true;
  }

  async function goToStep(targetStep: WizardStep) {
    if (targetStep < step) {
      setStep(targetStep);
      setMessage("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    await saveCurrentStep(targetStep);
  }

  function toggleSelection(
    selectedId: string,
    currentIds: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    setter(
      currentIds.includes(selectedId)
        ? currentIds.filter((id) => id !== selectedId)
        : [...currentIds, selectedId],
    );
    setMessage("");
  }

  function toggleCategory(
    category: string,
    items: Array<{ id: string; category: string }>,
    currentIds: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) {
    const ids = items
      .filter((item) => item.category === category)
      .map((item) => item.id);

    const allSelected = ids.every((id) => currentIds.includes(id));

    setter(
      allSelected
        ? currentIds.filter((id) => !ids.includes(id))
        : Array.from(new Set([...currentIds, ...ids])),
    );
  }

  const filteredEquipment = useMemo(() => {
    const query = equipmentSearch.trim().toLowerCase();

    if (!query) return equipment;

    return equipment.filter((item) =>
      [item.name, item.category, item.code, item.notes || ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [equipment, equipmentSearch]);

  const filteredActivities = useMemo(() => {
    const query = activitySearch.trim().toLowerCase();

    if (!query) return activities;

    return activities.filter((item) =>
      [item.name, item.category, item.code, item.notes || ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [activities, activitySearch]);

  const groupedEquipment = useMemo(
    () =>
      filteredEquipment.reduce<Record<string, EquipmentReference[]>>(
        (groups, item) => {
          if (!groups[item.category]) groups[item.category] = [];
          groups[item.category].push(item);
          return groups;
        },
        {},
      ),
    [filteredEquipment],
  );

  const groupedActivities = useMemo(
    () =>
      filteredActivities.reduce<Record<string, InspectionActivityReference[]>>(
        (groups, item) => {
          if (!groups[item.category]) groups[item.category] = [];
          groups[item.category].push(item);
          return groups;
        },
        {},
      ),
    [filteredActivities],
  );

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

  const stepTitle =
    step === 1
      ? "Personal Information"
      : step === 2
        ? "Professional Experience"
        : step === 3
          ? "Equipment Experience"
          : "Inspection Activities";

  return (
    <section className="panel wizardShell">
      <div className="wizardHeader">
        <div>
          <p className="eyebrow">Inspector Profile</p>
          <h1>Build Your Professional Profile</h1>
          <p className="muted">
            Complete each section to make your profile searchable by clients.
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
          <strong>Step {step} of 4</strong>
          <span>{stepTitle}</span>
        </div>

        <div className="progressTrack">
          <div
            className="progressBar"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="stepTabs">
        {[
          [1, "Personal Information"],
          [2, "Professional Experience"],
          [3, "Equipment"],
          [4, "Inspection Activities"],
        ].map(([stepNumber, label]) => {
          const number = stepNumber as WizardStep;

          return (
            <button
              type="button"
              key={number}
              className={
                step === number
                  ? "stepTab active"
                  : step > number
                    ? "stepTab complete"
                    : "stepTab"
              }
              onClick={() => void goToStep(number)}
            >
              <span>{number}</span>
              {label}
            </button>
          );
        })}
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
                Minimum 50 characters. Equipment and certifications are
                captured separately so clients can search them.
              </small>
            </label>
          </div>
        </div>
      )}

      {step === 3 && (
        <SelectionStep
          title="Equipment Experience"
          description="Select the equipment you are qualified and experienced to inspect."
          searchLabel="Search Equipment"
          searchPlaceholder="Search pumps, vessels, switchgear, modules..."
          searchValue={equipmentSearch}
          onSearchChange={setEquipmentSearch}
          groupedItems={groupedEquipment}
          selectedIds={selectedEquipmentIds}
          onToggle={(id) =>
            toggleSelection(
              id,
              selectedEquipmentIds,
              setSelectedEquipmentIds,
            )
          }
          onToggleCategory={(category) =>
            toggleCategory(
              category,
              filteredEquipment,
              selectedEquipmentIds,
              setSelectedEquipmentIds,
            )
          }
        />
      )}

      {step === 4 && (
        <SelectionStep
          title="Inspection Activities"
          description="Select the inspection and quality activities you can confidently perform."
          searchLabel="Search Activities"
          searchPlaceholder="Search FAT, source inspection, expediting..."
          searchValue={activitySearch}
          onSearchChange={setActivitySearch}
          groupedItems={groupedActivities}
          selectedIds={selectedActivityIds}
          onToggle={(id) =>
            toggleSelection(
              id,
              selectedActivityIds,
              setSelectedActivityIds,
            )
          }
          onToggleCategory={(category) =>
            toggleCategory(
              category,
              filteredActivities,
              selectedActivityIds,
              setSelectedActivityIds,
            )
          }
        />
      )}

      <div className="wizardFooter">
        <div>
          {step > 1 && (
            <button
              type="button"
              className="button secondary"
              onClick={() =>
                void goToStep((step - 1) as WizardStep)
              }
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
            onClick={() => void saveCurrentStep()}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() =>
                void goToStep((step + 1) as WizardStep)
              }
              disabled={saving}
            >
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void saveCurrentStep()}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Activities"}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .wizardShell {
          max-width: 1100px;
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
        h2,
        h3 {
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
          grid-template-columns: repeat(4, minmax(0, 1fr));
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
          border: 1px solid currentColor;
          border-radius: 50%;
          font-weight: 800;
        }

        .stepTab.active {
          border-width: 2px;
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
          display: block;
          margin-top: 3px;
          font-weight: 400;
          opacity: 0.72;
        }

        .addressActions {
          flex-wrap: wrap;
        }

        .wizardFooter {
          margin-top: 20px;
        }

        .footerRight {
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        @media (max-width: 900px) {
          .stepTabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
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

type SelectableItem = {
  id: string;
  category: string;
  name: string;
  notes: string | null;
};

type SelectionStepProps<T extends SelectableItem> = {
  title: string;
  description: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  groupedItems: Record<string, T[]>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleCategory: (category: string) => void;
};

function SelectionStep<T extends SelectableItem>({
  title,
  description,
  searchLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  groupedItems,
  selectedIds,
  onToggle,
  onToggleCategory,
}: SelectionStepProps<T>) {
  return (
    <div className="wizardCard">
      <div className="selectionHeading">
        <div>
          <h2>{title}</h2>
          <p className="muted">{description}</p>
        </div>

        <strong>{selectedIds.length} selected</strong>
      </div>

      <label className="selectionSearch">
        {searchLabel}
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
        />
      </label>

      {Object.keys(groupedItems).length === 0 ? (
        <p className="notice">No items match your search.</p>
      ) : (
        <div className="selectionGroups">
          {Object.entries(groupedItems).map(([category, items]) => {
            const ids = items.map((item) => item.id);
            const allSelected = ids.every((id) => selectedIds.includes(id));

            return (
              <section className="selectionGroup" key={category}>
                <div className="selectionGroupHeader">
                  <h3>{category}</h3>
                  <button
                    type="button"
                    className="textButton"
                    onClick={() => onToggleCategory(category)}
                  >
                    {allSelected ? "Clear category" : "Select category"}
                  </button>
                </div>

                <div className="selectionGrid">
                  {items.map((item) => {
                    const checked = selectedIds.includes(item.id);

                    return (
                      <label
                        className={
                          checked
                            ? "selectionOption selected"
                            : "selectionOption"
                        }
                        key={item.id}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggle(item.id)}
                        />

                        <span>
                          <strong>{item.name}</strong>
                          {item.notes && <small>{item.notes}</small>}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .selectionHeading,
        .selectionGroupHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .selectionHeading {
          margin-bottom: 20px;
        }

        .selectionSearch {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 22px;
          font-weight: 700;
        }

        .selectionSearch input {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px;
          border: 1px solid rgba(127, 127, 127, 0.42);
          border-radius: 9px;
          background: transparent;
          color: inherit;
          font: inherit;
        }

        .selectionGroups {
          display: grid;
          gap: 20px;
        }

        .selectionGroup {
          padding: 18px;
          border: 1px solid rgba(127, 127, 127, 0.28);
          border-radius: 14px;
        }

        .selectionGroupHeader {
          align-items: center;
          margin-bottom: 14px;
        }

        .selectionGroupHeader h3 {
          margin: 0;
        }

        .textButton {
          padding: 0;
          border: 0;
          background: transparent;
          color: inherit;
          text-decoration: underline;
          cursor: pointer;
        }

        .selectionGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .selectionOption {
          display: grid;
          grid-template-columns: auto 1fr;
          align-items: start;
          gap: 10px;
          padding: 13px;
          border: 1px solid rgba(127, 127, 127, 0.32);
          border-radius: 10px;
          cursor: pointer;
        }

        .selectionOption.selected {
          border-width: 2px;
          background: rgba(127, 127, 127, 0.08);
        }

        .selectionOption input {
          width: auto;
          margin-top: 3px;
        }

        .selectionOption small {
          display: block;
          margin-top: 3px;
          font-weight: 400;
          opacity: 0.72;
        }

        @media (max-width: 760px) {
          .selectionGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
