export type InspectorType =
  | "Independent"
  | "Agency"
  | "Company Employee";

export type AvailabilityStatus =
  | "Available Immediately"
  | "Available in 2 Weeks"
  | "Available after Current Assignment"
  | "Unavailable";

export type DistanceUnit = "miles" | "kilometers";

export type InspectorProfile = {
  inspector_id: string;
  id?: string;
  user_id?: string;
  name?: string | null;
  email?: string | null;
  office_address?: string | null;
  office_lat?: number | null;
  office_lng?: number | null;
  travel_distance?: number | null;
  kilometer_rate?: number | null;
  certifications?: string[];
  methods?: string[];
  industries?: string[];
  bio?: string | null;
  available?: boolean;

  headline: string | null;
  base_location: string | null;
  day_rate: number | null;
  is_verified: boolean;
  created_at: string;

  full_name: string | null;
  company: string | null;
  inspector_type: InspectorType | null;
  biography: string | null;
  years_experience: number | null;
  primary_discipline: string | null;
  office_home_address: string | null;
  base_city: string | null;
  base_state: string | null;
  base_country: string | null;
  latitude: number | null;
  longitude: number | null;
  driving_radius: number | null;
  distance_unit: DistanceUnit | null;
  mileage_rate: number | null;
  hourly_rate: number | null;
  currency: string | null;
  availability_status: AvailabilityStatus | null;
  available_from: string | null;
  willing_to_travel: boolean;
  remote_review_available: boolean;
  domestic_travel: boolean;
  international_travel: boolean;
  maximum_flight_hours: number | null;
  phone: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  updated_at: string;
};

export type ReferenceItem = {
  id: string;
  category: string;
  name: string;
  code: string;
  notes: string | null;
  active: boolean;
};

export type EquipmentReference = ReferenceItem;
export type InspectionActivityReference = ReferenceItem;
export type NdtMethodReference = ReferenceItem;
export type TravelCredentialReference = ReferenceItem;
export type SoftwareReference = ReferenceItem;
export type TrainingReference = ReferenceItem;

export type CertificationReference = ReferenceItem & {
  issuing_body: string | null;
};

export type CodeStandardReference = ReferenceItem & {
  publisher: string | null;
};

export type CountryReference = {
  id: string;
  region: string;
  name: string;
  iso_code: string;
  currency_code: string | null;
  active: boolean;
};

export type LanguageReference = {
  id: string;
  region: string;
  name: string;
  code: string;
  native_name: string | null;
  active: boolean;
};
