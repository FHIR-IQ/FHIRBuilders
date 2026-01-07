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

export interface MedConflict {
  id: string;
  type: "interaction" | "duplicate" | "allergy";
  severity: "high" | "moderate" | "low";
  description: string;
  resources: string[]; // FHIR Resource IDs
  evidence?: string; // Clinical citation or rule
}

/**
 * Mock AI service to detect medication conflicts.
 * In a real app, this would call an LLM or a clinical rules engine.
 */
export async function detectMedicationConflicts(
  patientId: string,
  medications: any[]
): Promise<MedConflict[]> {
  console.log(`Analyzing medications for patient ${patientId}...`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const conflicts: MedConflict[] = [];

  // Logic: Simple mock rules for demo purposes
  const medNames = medications.map(m => m.name.toLowerCase());

  // Rule 1: Duplicate Detection (e.g., two types of statins)
  if (medNames.some(n => n.includes("atorvastatin")) && medNames.some(n => n.includes("simvastatin"))) {
    conflicts.push({
      id: "c1",
      type: "duplicate",
      severity: "high",
      description: "Duplicate therapy detected: Two different HMG-CoA reductase inhibitors (statins) prescribed.",
      resources: ["med-1", "med-4"],
      evidence: "FDA Class Warning: Statin Duplication"
    });
  }

  // Rule 2: Interaction Detection (e.g., Warfarin and Aspirin)
  if (medNames.some(n => n.includes("warfarin")) && medNames.some(n => n.includes("aspirin"))) {
    conflicts.push({
      id: "c2",
      type: "interaction",
      severity: "moderate",
      description: "Potential interaction: Combined use of Warfarin and Aspirin increases bleeding risk.",
      resources: ["med-2", "med-5"],
      evidence: "Clinical Ref: Beers Criteria v4"
    });
  }

  // Rule 3: Known Allergy (Mocking an allergy to lisinopril)
  if (medNames.some(n => n.includes("lisinopril"))) {
    conflicts.push({
      id: "c3",
      type: "allergy",
      severity: "high",
      description: "Allergy Alert: Patient has a documented allergy to ACE inhibitors (Lisinopril).",
      resources: ["med-3"],
      evidence: "AllergyIntolerance Record #4451"
    });
  }

  return conflicts;
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
