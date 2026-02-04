import { MedplumClient } from "@medplum/core";

export function createMedplumClient() {
  const isServer = typeof window === "undefined";
  // Safely access process if defined
  const safeEnv = (key: string) => (typeof process !== "undefined" && process.env) ? process.env[key] : undefined;

  return new MedplumClient({
    baseUrl: (isServer ? safeEnv("MEDPLUM_BASE_URL") : undefined) || "https://api.medplum.com/",
    clientId: isServer ? safeEnv("MEDPLUM_CLIENT_ID") : undefined,
    clientSecret: isServer ? safeEnv("MEDPLUM_CLIENT_SECRET") : undefined,
  });
}

// Client-side Medplum client configuration
export const medplumConfig = {
  baseUrl: (typeof process !== "undefined" ? process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL : undefined) || "https://api.medplum.com/",
  clientId: typeof process !== "undefined" ? process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID : undefined,
};

// FHIR Resource Types commonly used
export const FHIR_RESOURCES = [
  "Patient",
  "Practitioner",
  "Organization",
  "Encounter",
  "Observation",
  "Condition",
  "Procedure",
  "MedicationRequest",
  "MedicationAdministration",
  "DiagnosticReport",
  "AllergyIntolerance",
  "Immunization",
  "CarePlan",
  "Goal",
  "ServiceRequest",
  "DocumentReference",
  "Consent",
  "Coverage",
  "Claim",
  "ExplanationOfBenefit",
  "MedicationStatement",
] as const;

export type FHIRResource = (typeof FHIR_RESOURCES)[number];

// Synthea data modules available
export const SYNTHEA_MODULES = [
  { id: "allergies", name: "Allergies", description: "Common allergic conditions" },
  { id: "asthma", name: "Asthma", description: "Asthma and respiratory conditions" },
  { id: "breast_cancer", name: "Breast Cancer", description: "Breast cancer progression" },
  { id: "colorectal_cancer", name: "Colorectal Cancer", description: "Colorectal cancer care" },
  { id: "copd", name: "COPD", description: "Chronic obstructive pulmonary disease" },
  { id: "covid19", name: "COVID-19", description: "COVID-19 infection and treatment" },
  { id: "diabetes", name: "Diabetes", description: "Type 1 and Type 2 diabetes" },
  { id: "heart_disease", name: "Heart Disease", description: "Cardiovascular conditions" },
  { id: "hypertension", name: "Hypertension", description: "High blood pressure management" },
  { id: "lung_cancer", name: "Lung Cancer", description: "Lung cancer treatment" },
  { id: "metabolic_syndrome", name: "Metabolic Syndrome", description: "Metabolic disorders" },
  { id: "opioid_addiction", name: "Opioid Addiction", description: "Opioid use disorder" },
  { id: "pregnancy", name: "Pregnancy", description: "Prenatal and postnatal care" },
  { id: "rheumatoid_arthritis", name: "Rheumatoid Arthritis", description: "Autoimmune joint disease" },
] as const;

export type SyntheaModule = (typeof SYNTHEA_MODULES)[number]["id"];

// Helper to create a sandbox FHIR server
export interface SandboxConfig {
  name: string;
  patientCount: number;
  modules: SyntheaModule[];
}

/**
 * Authoritative FHIR R4 coding system URIs
 * @see https://www.hl7.org/fhir/R4/terminologies-systems.html
 */
export const FHIR_CODING_SYSTEMS = {
  LOINC: 'http://loinc.org',
  SNOMED_CT: 'http://snomed.info/sct',
  RXNORM: 'http://www.nlm.nih.gov/research/umls/rxnorm',
  ICD10: 'http://hl7.org/fhir/sid/icd-10',
  UCUM: 'http://unitsofmeasure.org',
  CONDITION_CLINICAL: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
  CONDITION_VERIFICATION: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
  OBSERVATION_CATEGORY: 'http://terminology.hl7.org/CodeSystem/observation-category',
  V3_ACT_CODE: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
} as const;

/**
 * FHIR R4 MedicationRequest.status value set
 * @see http://hl7.org/fhir/R4/valueset-medicationrequest-status.html
 */
export type MedicationRequestStatus =
  | 'active'
  | 'on-hold'
  | 'cancelled'
  | 'completed'
  | 'entered-in-error'
  | 'stopped'
  | 'draft'
  | 'unknown';

/**
 * FHIR R4 DetectedIssue.severity value set
 * @see http://hl7.org/fhir/R4/valueset-detectedissue-severity.html
 */
export type DetectedIssueSeverity = 'high' | 'moderate' | 'low';

export interface MedConflict {
  id: string;
  type: "interaction" | "duplicate" | "allergy";
  severity: DetectedIssueSeverity;
  description: string;
  /** FHIR reference format: e.g., "MedicationRequest/med-101" */
  resources: string[];
  evidence?: string;
}

export interface MedicationResource {
  id: string;
  name: string;
  dosage: string;
  status: MedicationRequestStatus;
  prescribers?: string;
  rxNormCode?: string;
  [key: string]: unknown;
}

export async function createSandboxProject(
  client: MedplumClient,
  config: SandboxConfig
): Promise<{ projectId: string; baseUrl: string }> {
  // This would integrate with Medplum's project creation API
  const isServer = typeof window === "undefined";
  const baseUrl = (isServer ? process.env.MEDPLUM_BASE_URL : undefined) || "https://api.medplum.com";

  console.log("Creating sandbox with config:", config);

  return {
    projectId: `sandbox-${Date.now()}`,
    baseUrl: `${baseUrl}/fhir/R4`,
  };
}
