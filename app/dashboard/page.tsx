"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";
import type {
  AvailabilityStatus,
  CertificationReference,
  CodeStandardReference,
  CountryReference,
  DistanceUnit,
  EquipmentReference,
  InspectionActivityReference,
  InspectorProfile,
  LanguageReference,
  NdtMethodReference,
  ReferenceItem,
  SoftwareReference,
  TrainingReference,
  TravelCredentialReference,
} from "@/lib/types";

type WizardStep =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

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
  hourly_rate: string;
  day_rate: string;
  currency: string;
  driving_radius: string;
  distance_unit: DistanceUnit;
  mileage_rate: string;
  availability_status: AvailabilityStatus;
  available_from: string;
  willing_to_travel: boolean;
  remote_review_available: boolean;
  domestic_travel: boolean;
  international_travel: boolean;
  maximum_flight_hours: string;
};

type NdtDetail = {
  level: string;
  certificate_number: string;
  issued_on: string;
  expires_on: string;
};

type CertificationDetail = {
  certificate_number: string;
  issued_on: string;
  expires_on: string;
};

type CodeDetail = {
  proficiency: string;
  years_experience: string;
};

type LanguageDetail = {
  proficiency: string;
};

type TravelDetail = {
  credential_number: string;
  issued_on: string;
  expires_on: string;
};

type SoftwareDetail = {
  proficiency: string;
  years_experience: string;
};

type TrainingDetail = {
  provider: string;
  completed_on: string;
  expires_on: string;
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
  hourly_rate: "",
  day_rate: "",
  currency: "USD",
  driving_radius: "",
  distance_unit: "miles",
  mileage_rate: "",
  availability_status: "Available Immediately",
  available_from: "",
  willing_to_travel: true,
  remote_review_available: false,
  domestic_travel: true,
  international_travel: false,
  maximum_flight_hours: "",
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

const STEP_LABELS: Array<{ step: WizardStep; label: string; short: string }> = [
  { step: 1, label: "Personal Information", short: "Personal" },
  { step: 2, label: "Professional Experience", short: "Experience" },
  { step: 3, label: "Equipment", short: "Equipment" },
  { step: 4, label: "Inspection Activities", short: "Activities" },
  { step: 5, label: "NDT Methods", short: "NDT" },
  { step: 6, label: "Certifications", short: "Certifications" },
  { step: 7, label: "Codes & Standards", short: "Codes" },
  { step: 8, label: "Industries", short: "Industries" },
  { step: 9, label: "Languages", short: "Languages" },
  { step: 10, label: "Travel Credentials", short: "Travel" },
  { step: 11, label: "Software & Training", short: "Software" },
  { step: 12, label: "Rates & Availability", short: "Rates" },
];

export default function DashboardPage() {
  const supabase = useMemo(() => supabaseBrowser(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const [step, setStep] = useState<WizardStep>(1);
  const [form, setForm] = useState<FormState>(blankForm);

  const [equipment, setEquipment] = useState<EquipmentReference[]>([]);
  const [activities, setActivities] = useState<InspectionActivityReference[]>([]);
  const [ndtMethods, setNdtMethods] = useState<NdtMethodReference[]>([]);
  const [certifications, setCertifications] = useState<CertificationReference[]>([]);
  const [codes, setCodes] = useState<CodeStandardReference[]>([]);
  const [industries, setIndustries] = useState<ReferenceItem[]>([]);
  const [languages, setLanguages] = useState<LanguageReference[]>([]);
  const [travelCredentials, setTravelCredentials] = useState<TravelCredentialReference[]>([]);
  const [software, setSoftware] = useState<SoftwareReference[]>([]);
  const [training, setTraining] = useState<TrainingReference[]>([]);
  const [countries, setCountries] = useState<CountryReference[]>([]);

  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<string[]>([]);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);
  const [selectedNdtIds, setSelectedNdtIds] = useState<string[]>([]);
  const [selectedCertificationIds, setSelectedCertificationIds] = useState<string[]>([]);
  const [selectedCodeIds, setSelectedCodeIds] = useState<string[]>([]);
  const [selectedIndustryIds, setSelectedIndustryIds] = useState<string[]>([]);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([]);
  const [selectedTravelIds, setSelectedTravelIds] = useState<string[]>([]);
  const [selectedSoftwareIds, setSelectedSoftwareIds] = useState<string[]>([]);
  const [selectedTrainingIds, setSelectedTrainingIds] = useState<string[]>([]);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);

  const [ndtDetails, setNdtDetails] = useState<Record<string, NdtDetail>>({});
  const [certificationDetails, setCertificationDetails] = useState<Record<string, CertificationDetail>>({});
  const [codeDetails, setCodeDetails] = useState<Record<string, CodeDetail>>({});
  const [languageDetails, setLanguageDetails] = useState<Record<string, LanguageDetail>>({});
  const [travelDetails, setTravelDetails] = useState<Record<string, TravelDetail>>({});
  const [softwareDetails, setSoftwareDetails] = useState<Record<string, SoftwareDetail>>({});
  const [trainingDetails, setTrainingDetails] = useState<Record<string, TrainingDetail>>({});

  const [search, setSearch] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "notice">("notice");

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

    const results = await Promise.all([
      supabase.from("inspector_profiles").select("*").eq("inspector_id", user.id).maybeSingle(),
      supabase.from("equipment_types").select("*").eq("active", true).order("category").order("name"),
      supabase.from("inspection_activities").select("*").eq("active", true).order("category").order("name"),
      supabase.from("ndt_methods").select("*").eq("active", true).order("category").order("name"),
      supabase.from("certifications").select("*").eq("active", true).order("category").order("name"),
      supabase.from("codes_standards").select("*").eq("active", true).order("category").order("name"),
      supabase.from("industries").select("*").eq("active", true).order("category").order("name"),
      supabase.from("languages").select("*").eq("active", true).order("region").order("name"),
      supabase.from("travel_credentials").select("*").eq("active", true).order("category").order("name"),
      supabase.from("software_tools").select("*").eq("active", true).order("category").order("name"),
      supabase.from("training_types").select("*").eq("active", true).order("category").order("name"),
      supabase.from("countries").select("*").eq("active", true).order("region").order("name"),
      supabase.from("inspector_equipment").select("*").eq("profile_id", user.id),
      supabase.from("inspector_activities").select("*").eq("profile_id", user.id),
      supabase.from("inspector_ndt_methods").select("*").eq("profile_id", user.id),
      supabase.from("inspector_certifications").select("*").eq("profile_id", user.id),
      supabase.from("inspector_codes_standards").select("*").eq("profile_id", user.id),
      supabase.from("inspector_industries").select("*").eq("profile_id", user.id),
      supabase.from("inspector_languages").select("*").eq("profile_id", user.id),
      supabase.from("inspector_travel_credentials").select("*").eq("profile_id", user.id),
      supabase.from("inspector_software").select("*").eq("profile_id", user.id),
      supabase.from("inspector_training").select("*").eq("profile_id", user.id),
      supabase.from("inspector_work_countries").select("*").eq("profile_id", user.id),
    ]);

    const firstError = results.find((result) => result.error)?.error;
    if (firstError) {
      setMessage(firstError.message);
      setMessageType("notice");
      setLoading(false);
      return;
    }

    const [
      profileResult,
      equipmentResult,
      activitiesResult,
      ndtResult,
      certificationsResult,
      codesResult,
      industriesResult,
      languagesResult,
      travelResult,
      softwareResult,
      trainingResult,
      countriesResult,
      selectedEquipmentResult,
      selectedActivitiesResult,
      selectedNdtResult,
      selectedCertificationsResult,
      selectedCodesResult,
      selectedIndustriesResult,
      selectedLanguagesResult,
      selectedTravelResult,
      selectedSoftwareResult,
      selectedTrainingResult,
      selectedCountriesResult,
    ] = results;

    setEquipment((equipmentResult.data || []) as EquipmentReference[]);
    setActivities((activitiesResult.data || []) as InspectionActivityReference[]);
    setNdtMethods((ndtResult.data || []) as NdtMethodReference[]);
    setCertifications((certificationsResult.data || []) as CertificationReference[]);
    setCodes((codesResult.data || []) as CodeStandardReference[]);
    setIndustries((industriesResult.data || []) as ReferenceItem[]);
    setLanguages((languagesResult.data || []) as LanguageReference[]);
    setTravelCredentials((travelResult.data || []) as TravelCredentialReference[]);
    setSoftware((softwareResult.data || []) as SoftwareReference[]);
    setTraining((trainingResult.data || []) as TrainingReference[]);
    setCountries((countriesResult.data || []) as CountryReference[]);

    setSelectedEquipmentIds((selectedEquipmentResult.data || []).map((row: any) => row.equipment_id));
    setSelectedActivityIds((selectedActivitiesResult.data || []).map((row: any) => row.activity_id));
    setSelectedNdtIds((selectedNdtResult.data || []).map((row: any) => row.ndt_method_id));
    setSelectedCertificationIds((selectedCertificationsResult.data || []).map((row: any) => row.certification_id));
    setSelectedCodeIds((selectedCodesResult.data || []).map((row: any) => row.code_standard_id));
    setSelectedIndustryIds((selectedIndustriesResult.data || []).map((row: any) => row.industry_id));
    setSelectedLanguageIds((selectedLanguagesResult.data || []).map((row: any) => row.language_id));
    setSelectedTravelIds((selectedTravelResult.data || []).map((row: any) => row.travel_credential_id));
    setSelectedSoftwareIds((selectedSoftwareResult.data || []).map((row: any) => row.software_id));
    setSelectedTrainingIds((selectedTrainingResult.data || []).map((row: any) => row.training_type_id));
    setSelectedCountryIds((selectedCountriesResult.data || []).map((row: any) => row.country_id));

    setNdtDetails(Object.fromEntries((selectedNdtResult.data || []).map((row: any) => [row.ndt_method_id, {
      level: row.level || "Experienced",
      certificate_number: row.certificate_number || "",
      issued_on: row.issued_on || "",
      expires_on: row.expires_on || "",
    }])));
    setCertificationDetails(Object.fromEntries((selectedCertificationsResult.data || []).map((row: any) => [row.certification_id, {
      certificate_number: row.certificate_number || "",
      issued_on: row.issued_on || "",
      expires_on: row.expires_on || "",
    }])));
    setCodeDetails(Object.fromEntries((selectedCodesResult.data || []).map((row: any) => [row.code_standard_id, {
      proficiency: row.proficiency || "Working Knowledge",
      years_experience: row.years_experience == null ? "" : String(row.years_experience),
    }])));
    setLanguageDetails(Object.fromEntries((selectedLanguagesResult.data || []).map((row: any) => [row.language_id, {
      proficiency: row.proficiency || "Professional",
    }])));
    setTravelDetails(Object.fromEntries((selectedTravelResult.data || []).map((row: any) => [row.travel_credential_id, {
      credential_number: row.credential_number || "",
      issued_on: row.issued_on || "",
      expires_on: row.expires_on || "",
    }])));
    setSoftwareDetails(Object.fromEntries((selectedSoftwareResult.data || []).map((row: any) => [row.software_id, {
      proficiency: row.proficiency || "Intermediate",
      years_experience: row.years_experience == null ? "" : String(row.years_experience),
    }])));
    setTrainingDetails(Object.fromEntries((selectedTrainingResult.data || []).map((row: any) => [row.training_type_id, {
      provider: row.provider || "",
      completed_on: row.completed_on || "",
      expires_on: row.expires_on || "",
    }])));

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
        latitude: profile.latitude == null ? "" : String(profile.latitude),
        longitude: profile.longitude == null ? "" : String(profile.longitude),
        years_experience: profile.years_experience == null ? "" : String(profile.years_experience),
        primary_discipline: profile.primary_discipline || "",
        biography: profile.biography || "",
        linkedin_url: profile.linkedin_url || "",
        website_url: profile.website_url || "",
        hourly_rate: profile.hourly_rate == null ? "" : String(profile.hourly_rate),
        day_rate: profile.day_rate == null ? "" : String(profile.day_rate),
        currency: profile.currency || "USD",
        driving_radius: profile.driving_radius == null ? "" : String(profile.driving_radius),
        distance_unit: profile.distance_unit || "miles",
        mileage_rate: profile.mileage_rate == null ? "" : String(profile.mileage_rate),
        availability_status: profile.availability_status || "Available Immediately",
        available_from: profile.available_from || "",
        willing_to_travel: profile.willing_to_travel ?? true,
        remote_review_available: profile.remote_review_available ?? false,
        domestic_travel: profile.domestic_travel ?? true,
        international_travel: profile.international_travel ?? false,
        maximum_flight_hours: profile.maximum_flight_hours == null ? "" : String(profile.maximum_flight_hours),
      });
    } else {
      setProfileExists(false);
      setForm({ ...blankForm, full_name: user.user_metadata?.name || "" });
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
      if (!Number.isFinite(years) || years < 0 || years > 80) return "Years of experience must be between 0 and 80.";
      if (!form.primary_discipline) return "Select a primary discipline.";
      if (form.biography.trim().length < 50) return "Your professional biography should be at least 50 characters.";
    }
    const requiredSelections: Partial<Record<WizardStep, [string[], string]>> = {
      3: [selectedEquipmentIds, "Select at least one equipment type."],
      4: [selectedActivityIds, "Select at least one inspection activity."],
      5: [selectedNdtIds, "Select at least one NDT method."],
      6: [selectedCertificationIds, "Select at least one certification."],
      7: [selectedCodeIds, "Select at least one code or standard."],
      8: [selectedIndustryIds, "Select at least one industry."],
      9: [selectedLanguageIds, "Select at least one language."],
    };
    const entry = requiredSelections[currentStep];
    if (entry && entry[0].length === 0) return entry[1];

    if (currentStep === 12) {
      const hourly = form.hourly_rate ? Number(form.hourly_rate) : null;
      const daily = form.day_rate ? Number(form.day_rate) : null;
      if (hourly !== null && (!Number.isFinite(hourly) || hourly < 0)) return "Enter a valid hourly rate.";
      if (daily !== null && (!Number.isFinite(daily) || daily < 0)) return "Enter a valid day rate.";
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
      const url = "https://nominatim.openstreetmap.org/search" +
        `?format=json&limit=1&addressdetails=1&q=${encodeURIComponent(form.office_home_address)}`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Address lookup failed.");
      const results = await response.json();
      if (!Array.isArray(results) || !results[0]) {
        setMessage("Address not found. You can still enter the city, state and country manually.");
        return;
      }
      const result = results[0];
      const address = result.address || {};
      setForm((current) => ({
        ...current,
        office_home_address: result.display_name || current.office_home_address,
        base_city: address.city || address.town || address.village || address.municipality || current.base_city,
        base_state: address.state || address.region || current.base_state,
        base_country: address.country || current.base_country,
        latitude: result.lat || "",
        longitude: result.lon || "",
        distance_unit: (address.country_code || "").toUpperCase() === "US" ? "miles" : "kilometers",
      }));
      setMessage("Address validated.");
      setMessageType("success");
    } catch {
      setMessage("Address lookup failed. You can still enter the city, state and country manually.");
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
      years_experience: form.years_experience ? Number(form.years_experience) : null,
      primary_discipline: form.primary_discipline || null,
      biography: form.biography.trim() || null,
      linkedin_url: form.linkedin_url.trim() || null,
      website_url: form.website_url.trim() || null,
      hourly_rate: form.hourly_rate ? Number(form.hourly_rate) : null,
      day_rate: form.day_rate ? Number(form.day_rate) : null,
      currency: form.currency || "USD",
      driving_radius: form.driving_radius ? Number(form.driving_radius) : null,
      distance_unit: form.distance_unit,
      mileage_rate: form.mileage_rate ? Number(form.mileage_rate) : null,
      availability_status: form.availability_status,
      available_from: form.available_from || null,
      willing_to_travel: form.willing_to_travel,
      remote_review_available: form.remote_review_available,
      domestic_travel: form.domestic_travel,
      international_travel: form.international_travel,
      maximum_flight_hours: form.maximum_flight_hours ? Number(form.maximum_flight_hours) : null,
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

  async function replaceRows(tableName: string, rows: Record<string, any>[]) {
    if (!userId) return false;

    const { error: deleteError } = await supabase.from(tableName).delete().eq("profile_id", userId);
    if (deleteError) {
      setMessage(deleteError.message);
      setMessageType("notice");
      return false;
    }

    if (rows.length === 0) return true;

    const { error: insertError } = await supabase.from(tableName).insert(rows);
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
    const base = { profile_id: userId };

    if (step === 1 || step === 2 || step === 12) {
      saved = await saveCoreProfile();
    } else if (step === 3) {
      saved = await replaceRows("inspector_equipment", selectedEquipmentIds.map((id) => ({ ...base, equipment_id: id })));
    } else if (step === 4) {
      saved = await replaceRows("inspector_activities", selectedActivityIds.map((id) => ({ ...base, activity_id: id })));
    } else if (step === 5) {
      saved = await replaceRows("inspector_ndt_methods", selectedNdtIds.map((id) => ({
        ...base,
        ndt_method_id: id,
        level: ndtDetails[id]?.level || "Experienced",
        certificate_number: ndtDetails[id]?.certificate_number || null,
        issued_on: ndtDetails[id]?.issued_on || null,
        expires_on: ndtDetails[id]?.expires_on || null,
      })));
    } else if (step === 6) {
      saved = await replaceRows("inspector_certifications", selectedCertificationIds.map((id) => ({
        ...base,
        certification_id: id,
        certificate_number: certificationDetails[id]?.certificate_number || null,
        issued_on: certificationDetails[id]?.issued_on || null,
        expires_on: certificationDetails[id]?.expires_on || null,
      })));
    } else if (step === 7) {
      saved = await replaceRows("inspector_codes_standards", selectedCodeIds.map((id) => ({
        ...base,
        code_standard_id: id,
        proficiency: codeDetails[id]?.proficiency || "Working Knowledge",
        years_experience: codeDetails[id]?.years_experience ? Number(codeDetails[id].years_experience) : null,
      })));
    } else if (step === 8) {
      saved = await replaceRows("inspector_industries", selectedIndustryIds.map((id) => ({ ...base, industry_id: id })));
    } else if (step === 9) {
      saved = await replaceRows("inspector_languages", selectedLanguageIds.map((id) => ({
        ...base,
        language_id: id,
        proficiency: languageDetails[id]?.proficiency || "Professional",
      })));
    } else if (step === 10) {
      const [travelSaved, countriesSaved] = await Promise.all([
        replaceRows("inspector_travel_credentials", selectedTravelIds.map((id) => ({
          ...base,
          travel_credential_id: id,
          credential_number: travelDetails[id]?.credential_number || null,
          issued_on: travelDetails[id]?.issued_on || null,
          expires_on: travelDetails[id]?.expires_on || null,
        }))),
        replaceRows("inspector_work_countries", selectedCountryIds.map((id) => ({
          ...base,
          country_id: id,
          authorization_status: "Available to travel",
        }))),
      ]);
      saved = travelSaved && countriesSaved;
    } else if (step === 11) {
      const [softwareSaved, trainingSaved] = await Promise.all([
        replaceRows("inspector_software", selectedSoftwareIds.map((id) => ({
          ...base,
          software_id: id,
          proficiency: softwareDetails[id]?.proficiency || "Intermediate",
          years_experience: softwareDetails[id]?.years_experience ? Number(softwareDetails[id].years_experience) : null,
        }))),
        replaceRows("inspector_training", selectedTrainingIds.map((id) => ({
          ...base,
          training_type_id: id,
          provider: trainingDetails[id]?.provider || null,
          completed_on: trainingDetails[id]?.completed_on || null,
          expires_on: trainingDetails[id]?.expires_on || null,
        }))),
      ]);
      saved = softwareSaved && trainingSaved;
    }

    setSaving(false);
    if (!saved) return false;

    setMessage(step === 12 ? "Profile complete and saved." : "Progress saved.");
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

  function toggleId(id: string, selected: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    setMessage("");
  }

  function filtered<T extends { name: string; category?: string; region?: string; code?: string; notes?: string | null }>(
    items: T[],
    stepNumber: number,
  ) {
    const query = (search[stepNumber] || "").trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item.name, item.category || "", item.region || "", item.code || "", item.notes || ""]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  function grouped<T extends { category?: string; region?: string }>(items: T[]) {
    return items.reduce<Record<string, T[]>>((groups, item) => {
      const key = item.category || item.region || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {});
  }

  function selectionStep<T extends { id: string; name: string; category?: string; region?: string; notes?: string | null }>(
    title: string,
    description: string,
    stepNumber: number,
    items: T[],
    selectedIds: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    renderDetails?: (item: T) => React.ReactNode,
  ) {
    const filteredItems = filtered(items, stepNumber);
    const groupedItems = grouped(filteredItems);

    return (
      <SelectionStep
        title={title}
        description={description}
        searchValue={search[stepNumber] || ""}
        onSearchChange={(value) => setSearch((current) => ({ ...current, [stepNumber]: value }))}
        groupedItems={groupedItems}
        selectedIds={selectedIds}
        onToggle={(id) => toggleId(id, selectedIds, setter)}
        onToggleCategory={(groupName) => {
          const ids = groupedItems[groupName].map((item) => item.id);
          const allSelected = ids.every((id) => selectedIds.includes(id));
          setter(allSelected
            ? selectedIds.filter((id) => !ids.includes(id))
            : Array.from(new Set([...selectedIds, ...ids])));
        }}
        renderDetails={renderDetails}
      />
    );
  }

  if (loading) return <section className="panel"><p>Loading dashboard...</p></section>;

  if (!userId) {
    return (
      <section className="panel">
        <h1>Inspector Dashboard</h1>
        <p>You need to log in before creating an inspector profile.</p>
        <Link className="button" href="/login">Log in</Link>
      </section>
    );
  }

  const stepTitle = STEP_LABELS.find((item) => item.step === step)?.label || "";

  return (
    <section className="panel wizardShell">
      <div className="wizardHeader">
        <div>
          <p className="eyebrow">Inspector Profile</p>
          <h1>Build Your Professional Profile</h1>
          <p className="muted">Complete each section to make your profile searchable by clients.</p>
        </div>

        <div className="headerActions">
          {profileExists && (
            <Link href={`/inspectors/${userId}`} className="button secondary">View Public Profile</Link>
          )}
          <Link href="/logout" className="button secondary">Log out</Link>
        </div>
      </div>

      <div className="progressWrap">
        <div className="progressTop">
          <strong>Step {step} of 12</strong>
          <span>{stepTitle}</span>
        </div>
        <div className="progressTrack">
          <div className="progressBar" style={{ width: `${(step / 12) * 100}%` }} />
        </div>
      </div>

      <div className="stepTabs">
        {STEP_LABELS.map(({ step: stepNumber, short }) => (
          <button
            type="button"
            key={stepNumber}
            className={step === stepNumber ? "stepTab active" : step > stepNumber ? "stepTab complete" : "stepTab"}
            onClick={() => void goToStep(stepNumber)}
          >
            <span>{stepNumber}</span>
            {short}
          </button>
        ))}
      </div>

      {message && <p className={messageType === "success" ? "success" : "notice"}>{message}</p>}

      {step === 1 && (
        <div className="wizardCard">
          <h2>Personal Information</h2>
          <div className="formGrid">
            <label>Full Name<input value={form.full_name} onChange={(e) => setField("full_name", e.target.value)} /></label>
            <label>Inspector Type
              <select value={form.inspector_type} onChange={(e) => setField("inspector_type", e.target.value as FormState["inspector_type"])}>
                <option>Independent</option><option>Agency</option><option>Company Employee</option>
              </select>
            </label>
            <label className="full">Professional Headline<input value={form.headline} onChange={(e) => setField("headline", e.target.value)} /></label>
            <label>Company<input value={form.company} onChange={(e) => setField("company", e.target.value)} /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setField("phone", e.target.value)} /></label>
            <label className="full">Office / Home Address<input value={form.office_home_address} onChange={(e) => setField("office_home_address", e.target.value)} /></label>
            <div className="full inlineActions">
              <button type="button" className="button secondary" onClick={validateAddress}>Validate Address</button>
              {form.latitude && form.longitude && <span className="muted">Coordinates saved.</span>}
            </div>
            <label>Base City<input value={form.base_city} onChange={(e) => setField("base_city", e.target.value)} /></label>
            <label>State / Province<input value={form.base_state} onChange={(e) => setField("base_state", e.target.value)} /></label>
            <label>Country<input value={form.base_country} onChange={(e) => setField("base_country", e.target.value)} /></label>
            <label>LinkedIn URL<input type="url" value={form.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} /></label>
            <label className="full">Website URL<input type="url" value={form.website_url} onChange={(e) => setField("website_url", e.target.value)} /></label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="wizardCard">
          <h2>Professional Experience</h2>
          <div className="formGrid">
            <label>Years of Experience<input type="number" min="0" max="80" value={form.years_experience} onChange={(e) => setField("years_experience", e.target.value)} /></label>
            <label>Primary Discipline
              <select value={form.primary_discipline} onChange={(e) => setField("primary_discipline", e.target.value)}>
                <option value="">Select...</option>
                {disciplines.map((discipline) => <option key={discipline}>{discipline}</option>)}
              </select>
            </label>
            <label className="full">Professional Biography
              <textarea rows={8} value={form.biography} onChange={(e) => setField("biography", e.target.value)} />
              <small>Minimum 50 characters.</small>
            </label>
          </div>
        </div>
      )}

      {step === 3 && selectionStep("Equipment Experience", "Select the equipment you are qualified and experienced to inspect.", 3, equipment, selectedEquipmentIds, setSelectedEquipmentIds)}
      {step === 4 && selectionStep("Inspection Activities", "Select the inspection and quality activities you can confidently perform.", 4, activities, selectedActivityIds, setSelectedActivityIds)}

      {step === 5 && selectionStep("NDT Methods", "Select each NDT method and add your qualification details.", 5, ndtMethods, selectedNdtIds, setSelectedNdtIds, (item) => {
        const detail = ndtDetails[item.id] || { level: "Experienced", certificate_number: "", issued_on: "", expires_on: "" };
        return (
          <div className="detailGrid">
            <label>Level<select value={detail.level} onChange={(e) => setNdtDetails((d) => ({ ...d, [item.id]: { ...detail, level: e.target.value } }))}>
              {["Trainee","Level I","Level II","Level III","Qualified","Experienced"].map((x) => <option key={x}>{x}</option>)}
            </select></label>
            <label>Certificate #<input value={detail.certificate_number} onChange={(e) => setNdtDetails((d) => ({ ...d, [item.id]: { ...detail, certificate_number: e.target.value } }))} /></label>
            <label>Issued<input type="date" value={detail.issued_on} onChange={(e) => setNdtDetails((d) => ({ ...d, [item.id]: { ...detail, issued_on: e.target.value } }))} /></label>
            <label>Expires<input type="date" value={detail.expires_on} onChange={(e) => setNdtDetails((d) => ({ ...d, [item.id]: { ...detail, expires_on: e.target.value } }))} /></label>
          </div>
        );
      })}

      {step === 6 && selectionStep("Certifications", "Select your certifications and record credential details.", 6, certifications, selectedCertificationIds, setSelectedCertificationIds, (item) => {
        const detail = certificationDetails[item.id] || { certificate_number: "", issued_on: "", expires_on: "" };
        return (
          <div className="detailGrid three">
            <label>Certificate #<input value={detail.certificate_number} onChange={(e) => setCertificationDetails((d) => ({ ...d, [item.id]: { ...detail, certificate_number: e.target.value } }))} /></label>
            <label>Issued<input type="date" value={detail.issued_on} onChange={(e) => setCertificationDetails((d) => ({ ...d, [item.id]: { ...detail, issued_on: e.target.value } }))} /></label>
            <label>Expires<input type="date" value={detail.expires_on} onChange={(e) => setCertificationDetails((d) => ({ ...d, [item.id]: { ...detail, expires_on: e.target.value } }))} /></label>
          </div>
        );
      })}

      {step === 7 && selectionStep("Codes & Standards", "Select the codes and standards you know and indicate proficiency.", 7, codes, selectedCodeIds, setSelectedCodeIds, (item) => {
        const detail = codeDetails[item.id] || { proficiency: "Working Knowledge", years_experience: "" };
        return (
          <div className="detailGrid two">
            <label>Proficiency<select value={detail.proficiency} onChange={(e) => setCodeDetails((d) => ({ ...d, [item.id]: { ...detail, proficiency: e.target.value } }))}>
              {["Familiar","Working Knowledge","Proficient","Expert"].map((x) => <option key={x}>{x}</option>)}
            </select></label>
            <label>Years<input type="number" min="0" value={detail.years_experience} onChange={(e) => setCodeDetails((d) => ({ ...d, [item.id]: { ...detail, years_experience: e.target.value } }))} /></label>
          </div>
        );
      })}

      {step === 8 && selectionStep("Industries", "Select the industries where you have relevant inspection experience.", 8, industries, selectedIndustryIds, setSelectedIndustryIds)}

      {step === 9 && selectionStep("Languages", "Select your working languages and proficiency.", 9, languages, selectedLanguageIds, setSelectedLanguageIds, (item) => {
        const detail = languageDetails[item.id] || { proficiency: "Professional" };
        return (
          <div className="detailGrid one">
            <label>Proficiency<select value={detail.proficiency} onChange={(e) => setLanguageDetails((d) => ({ ...d, [item.id]: { proficiency: e.target.value } }))}>
              {["Basic","Conversational","Professional","Fluent","Native"].map((x) => <option key={x}>{x}</option>)}
            </select></label>
          </div>
        );
      })}

      {step === 10 && (
        <div className="wizardCard">
          <h2>Travel Credentials & Countries</h2>
          {selectionStep("Travel Credentials", "Select current travel, safety and site-access credentials.", 10, travelCredentials, selectedTravelIds, setSelectedTravelIds, (item) => {
            const detail = travelDetails[item.id] || { credential_number: "", issued_on: "", expires_on: "" };
            return (
              <div className="detailGrid three">
                <label>Credential #<input value={detail.credential_number} onChange={(e) => setTravelDetails((d) => ({ ...d, [item.id]: { ...detail, credential_number: e.target.value } }))} /></label>
                <label>Issued<input type="date" value={detail.issued_on} onChange={(e) => setTravelDetails((d) => ({ ...d, [item.id]: { ...detail, issued_on: e.target.value } }))} /></label>
                <label>Expires<input type="date" value={detail.expires_on} onChange={(e) => setTravelDetails((d) => ({ ...d, [item.id]: { ...detail, expires_on: e.target.value } }))} /></label>
              </div>
            );
          })}
          <div className="spacer" />
          {selectionStep("Work Countries", "Select countries where you can work or are willing to travel.", 10, countries, selectedCountryIds, setSelectedCountryIds)}
        </div>
      )}

      {step === 11 && (
        <div className="wizardCard">
          <h2>Software & Training</h2>
          {selectionStep("Software", "Select software you can use professionally.", 11, software, selectedSoftwareIds, setSelectedSoftwareIds, (item) => {
            const detail = softwareDetails[item.id] || { proficiency: "Intermediate", years_experience: "" };
            return (
              <div className="detailGrid two">
                <label>Proficiency<select value={detail.proficiency} onChange={(e) => setSoftwareDetails((d) => ({ ...d, [item.id]: { ...detail, proficiency: e.target.value } }))}>
                  {["Basic","Intermediate","Advanced","Expert"].map((x) => <option key={x}>{x}</option>)}
                </select></label>
                <label>Years<input type="number" min="0" value={detail.years_experience} onChange={(e) => setSoftwareDetails((d) => ({ ...d, [item.id]: { ...detail, years_experience: e.target.value } }))} /></label>
              </div>
            );
          })}
          <div className="spacer" />
          {selectionStep("Training", "Select supplementary training and record key details.", 11, training, selectedTrainingIds, setSelectedTrainingIds, (item) => {
            const detail = trainingDetails[item.id] || { provider: "", completed_on: "", expires_on: "" };
            return (
              <div className="detailGrid three">
                <label>Provider<input value={detail.provider} onChange={(e) => setTrainingDetails((d) => ({ ...d, [item.id]: { ...detail, provider: e.target.value } }))} /></label>
                <label>Completed<input type="date" value={detail.completed_on} onChange={(e) => setTrainingDetails((d) => ({ ...d, [item.id]: { ...detail, completed_on: e.target.value } }))} /></label>
                <label>Expires<input type="date" value={detail.expires_on} onChange={(e) => setTrainingDetails((d) => ({ ...d, [item.id]: { ...detail, expires_on: e.target.value } }))} /></label>
              </div>
            );
          })}
        </div>
      )}

      {step === 12 && (
        <div className="wizardCard">
          <h2>Rates & Availability</h2>
          <div className="formGrid">
            <label>Currency<input value={form.currency} onChange={(e) => setField("currency", e.target.value.toUpperCase())} /></label>
            <label>Hourly Rate<input type="number" min="0" step="0.01" value={form.hourly_rate} onChange={(e) => setField("hourly_rate", e.target.value)} /></label>
            <label>Day Rate<input type="number" min="0" step="0.01" value={form.day_rate} onChange={(e) => setField("day_rate", e.target.value)} /></label>
            <label>Driving Radius<input type="number" min="0" value={form.driving_radius} onChange={(e) => setField("driving_radius", e.target.value)} /></label>
            <label>Distance Unit<select value={form.distance_unit} onChange={(e) => setField("distance_unit", e.target.value as DistanceUnit)}><option value="miles">Miles</option><option value="kilometers">Kilometers</option></select></label>
            <label>Mileage / Kilometer Rate<input type="number" min="0" step="0.01" value={form.mileage_rate} onChange={(e) => setField("mileage_rate", e.target.value)} /></label>
            <label>Availability<select value={form.availability_status} onChange={(e) => setField("availability_status", e.target.value as AvailabilityStatus)}>
              <option>Available Immediately</option><option>Available in 2 Weeks</option><option>Available after Current Assignment</option><option>Unavailable</option>
            </select></label>
            <label>Available From<input type="date" value={form.available_from} onChange={(e) => setField("available_from", e.target.value)} /></label>
            <label>Maximum Flight Hours<input type="number" min="0" step="0.5" value={form.maximum_flight_hours} onChange={(e) => setField("maximum_flight_hours", e.target.value)} /></label>
            <div className="full checkboxGrid">
              {[
                ["willing_to_travel", "Willing to travel"],
                ["remote_review_available", "Remote review available"],
                ["domestic_travel", "Domestic travel"],
                ["international_travel", "International travel"],
              ].map(([key, label]) => (
                <label className="checkboxLabel" key={key}>
                  <input type="checkbox" checked={form[key as keyof FormState] as boolean} onChange={(e) => setField(key as keyof FormState, e.target.checked as never)} />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="wizardFooter">
        <div>{step > 1 && <button type="button" className="button secondary" onClick={() => void goToStep((step - 1) as WizardStep)} disabled={saving}>Back</button>}</div>
        <div className="footerRight">
          <button type="button" className="button secondary" onClick={() => void saveCurrentStep()} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
          {step < 12 ? (
            <button type="button" onClick={() => void goToStep((step + 1) as WizardStep)} disabled={saving}>{saving ? "Saving..." : "Save & Continue"}</button>
          ) : (
            <button type="button" onClick={() => void saveCurrentStep()} disabled={saving}>{saving ? "Saving..." : "Complete Profile"}</button>
          )}
        </div>
      </div>

      <style jsx>{`
        .wizardShell{max-width:1180px;margin:0 auto}.wizardHeader,.progressTop,.wizardFooter,.headerActions,.footerRight,.inlineActions{display:flex;align-items:center;gap:12px}.wizardHeader,.progressTop,.wizardFooter{justify-content:space-between}.wizardHeader{align-items:flex-start;margin-bottom:24px}.headerActions,.footerRight{flex-wrap:wrap;justify-content:flex-end}.eyebrow{margin:0 0 4px;font-size:.78rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase}.progressWrap{margin:18px 0 20px}.progressTop{margin-bottom:8px;font-size:.92rem}.progressTrack{height:10px;overflow:hidden;border-radius:999px;background:rgba(127,127,127,.2)}.progressBar{height:100%;border-radius:inherit;background:currentColor}.stepTabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:20px}.stepTab{display:flex;align-items:center;gap:9px;padding:11px 12px;border:1px solid rgba(127,127,127,.35);border-radius:10px;background:transparent;color:inherit;text-align:left}.stepTab span{display:grid;width:26px;height:26px;place-items:center;border:1px solid currentColor;border-radius:50%;font-weight:800}.stepTab.active{border-width:2px;font-weight:800}.wizardCard{padding:24px;border:1px solid rgba(127,127,127,.28);border-radius:16px;background:rgba(127,127,127,.04)}.formGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}label{display:flex;flex-direction:column;gap:7px;font-weight:700}.full{grid-column:1/-1}input,select,textarea{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid rgba(127,127,127,.42);border-radius:9px;background:transparent;color:inherit;font:inherit}small{font-weight:400;opacity:.72}.wizardFooter{margin-top:20px}.checkboxGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.checkboxLabel{display:flex;flex-direction:row;align-items:center}.checkboxLabel input{width:auto}.spacer{height:26px}.detailGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}.detailGrid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.detailGrid.two{grid-template-columns:repeat(2,minmax(0,1fr))}.detailGrid.one{grid-template-columns:1fr}.detailGrid label{font-size:.88rem}@media(max-width:900px){.stepTabs{grid-template-columns:repeat(2,minmax(0,1fr))}.detailGrid,.detailGrid.three{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:760px){.wizardHeader,.wizardFooter{align-items:stretch;flex-direction:column}.headerActions,.footerRight{justify-content:flex-start}.stepTabs,.formGrid,.checkboxGrid,.detailGrid,.detailGrid.three,.detailGrid.two{grid-template-columns:1fr}.full{grid-column:auto}.wizardCard{padding:18px}}
      `}</style>
    </section>
  );
}

type SelectableItem = {
  id: string;
  name: string;
  category?: string;
  region?: string;
  notes?: string | null;
};

type SelectionStepProps<T extends SelectableItem> = {
  title: string;
  description: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  groupedItems: Record<string, T[]>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleCategory: (category: string) => void;
  renderDetails?: (item: T) => React.ReactNode;
};

function SelectionStep<T extends SelectableItem>({
  title,
  description,
  searchValue,
  onSearchChange,
  groupedItems,
  selectedIds,
  onToggle,
  onToggleCategory,
  renderDetails,
}: SelectionStepProps<T>) {
  return (
    <div className="selectionCard">
      <div className="selectionHeading">
        <div><h2>{title}</h2><p className="muted">{description}</p></div>
        <strong>{selectedIds.length} selected</strong>
      </div>

      <label className="selectionSearch">Search
        <input type="search" value={searchValue} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search..." />
      </label>

      <div className="selectionGroups">
        {Object.entries(groupedItems).map(([groupName, items]) => {
          const ids = items.map((item) => item.id);
          const allSelected = ids.every((id) => selectedIds.includes(id));
          return (
            <section className="selectionGroup" key={groupName}>
              <div className="selectionGroupHeader">
                <h3>{groupName}</h3>
                <button type="button" className="textButton" onClick={() => onToggleCategory(groupName)}>
                  {allSelected ? "Clear category" : "Select category"}
                </button>
              </div>
              <div className="selectionGrid">
                {items.map((item) => {
                  const checked = selectedIds.includes(item.id);
                  return (
                    <div className={checked ? "selectionOption selected" : "selectionOption"} key={item.id}>
                      <label className="selectionMain">
                        <input type="checkbox" checked={checked} onChange={() => onToggle(item.id)} />
                        <span><strong>{item.name}</strong>{item.notes && <small>{item.notes}</small>}</span>
                      </label>
                      {checked && renderDetails && renderDetails(item)}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <style jsx>{`
        .selectionCard{padding:24px;border:1px solid rgba(127,127,127,.28);border-radius:16px;background:rgba(127,127,127,.04)}.selectionHeading,.selectionGroupHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.selectionHeading{margin-bottom:20px}.selectionSearch{display:flex;flex-direction:column;gap:7px;margin-bottom:22px;font-weight:700}.selectionSearch input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid rgba(127,127,127,.42);border-radius:9px;background:transparent;color:inherit;font:inherit}.selectionGroups{display:grid;gap:20px}.selectionGroup{padding:18px;border:1px solid rgba(127,127,127,.28);border-radius:14px}.selectionGroupHeader{align-items:center;margin-bottom:14px}.selectionGroupHeader h3{margin:0}.textButton{padding:0;border:0;background:transparent;color:inherit;text-decoration:underline;cursor:pointer}.selectionGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.selectionOption{padding:13px;border:1px solid rgba(127,127,127,.32);border-radius:10px}.selectionOption.selected{border-width:2px;background:rgba(127,127,127,.08)}.selectionMain{display:grid;grid-template-columns:auto 1fr;align-items:start;gap:10px;cursor:pointer}.selectionMain input{width:auto;margin-top:3px}.selectionMain small{display:block;margin-top:3px;font-weight:400;opacity:.72}@media(max-width:760px){.selectionGrid{grid-template-columns:1fr}.selectionCard{padding:18px}}
      `}</style>
    </div>
  );
}
