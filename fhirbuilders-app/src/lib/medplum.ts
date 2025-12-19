import { MedplumClient } from "@medplum/core";

// Server-side Medplum client (for API routes)
export function createMedplumClient() {
  return new MedplumClient({
    baseUrl: process.env.MEDPLUM_BASE_URL || "https://api.medplum.com/",
    clientId: process.env.MEDPLUM_CLIENT_ID,
    clientSecret: process.env.MEDPLUM_CLIENT_SECRET,
  });
}

// Client-side Medplum client configuration
export const medplumConfig = {
  baseUrl: process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL || "https://api.medplum.com/",
  clientId: process.env.NEXT_PUBLIC_MEDPLUM_CLIENT_ID,
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

export async function createSandboxProject(
  client: MedplumClient,
  config: SandboxConfig
): Promise<{ projectId: string; baseUrl: string }> {
  // This would integrate with Medplum's project creation API
  // For now, return placeholder - actual implementation depends on Medplum setup
  console.log("Creating sandbox with config:", config);

  return {
    projectId: `sandbox-${Date.now()}`,
    baseUrl: `${process.env.MEDPLUM_BASE_URL}/fhir/R4`,
  };
}
