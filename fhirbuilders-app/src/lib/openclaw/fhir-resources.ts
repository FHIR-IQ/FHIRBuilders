/**
 * FHIR Resource Detection for OpenClaw
 *
 * Analyzes natural language prompts to detect relevant FHIR R4 resources
 * for healthcare application generation.
 */

export interface FhirUseCase {
  keywords: readonly string[]
  resources: readonly string[]
  description: string
}

/**
 * Mapping of healthcare use cases to FHIR resources
 */
export const FHIR_USE_CASES: Record<string, FhirUseCase> = {
  medication: {
    keywords: [
      'medication',
      'prescription',
      'drug',
      'dose',
      'pill',
      'medicine',
      'pharmacy',
      'rx',
      'refill'
    ],
    resources: ['MedicationRequest', 'MedicationStatement', 'Medication'],
    description: 'Track prescriptions and medication adherence (coded with RxNorm: http://www.nlm.nih.gov/research/umls/rxnorm). Required fields: status, intent, medication[x], subject'
  },
  appointments: {
    keywords: [
      'appointment',
      'schedule',
      'scheduling',
      'booking',
      'visit',
      'calendar',
      'slot'
    ],
    resources: ['Appointment', 'Schedule', 'Slot'],
    description: 'Manage patient appointments and scheduling'
  },
  'lab-results': {
    keywords: [
      'lab',
      'test',
      'result',
      'blood',
      'diagnostic',
      'observation',
      'specimen',
      'glucose',
      'a1c',
      'cholesterol'
    ],
    resources: ['Observation', 'DiagnosticReport', 'Specimen'],
    description: 'View and track laboratory results (coded with LOINC: http://loinc.org). Common codes: HbA1c (4548-4), LDL (2089-1), Glucose (2345-7), eGFR (33914-3)'
  },
  conditions: {
    keywords: [
      'condition',
      'diagnosis',
      'diagnoses',
      'disease',
      'problem',
      'health issue',
      'chronic',
      'illness'
    ],
    resources: ['Condition'],
    description: 'Track patient health conditions and diagnoses (coded with SNOMED CT: http://snomed.info/sct, ICD-10: http://hl7.org/fhir/sid/icd-10). Required fields: subject'
  },
  'care-team': {
    keywords: [
      'care team',
      'careteam',
      'provider',
      'doctor',
      'nurse',
      'caregiver',
      'practitioner',
      'physician',
      'specialist'
    ],
    resources: ['CareTeam', 'Practitioner', 'PractitionerRole', 'Organization'],
    description: 'Manage care team members and providers'
  },
  immunization: {
    keywords: [
      'vaccine',
      'vaccination',
      'immunization',
      'shot',
      'immunize',
      'booster'
    ],
    resources: ['Immunization', 'ImmunizationRecommendation'],
    description: 'Track immunization records and schedules'
  },
  vitals: {
    keywords: [
      'vital',
      'vitals',
      'blood pressure',
      'heart rate',
      'pulse',
      'temperature',
      'weight',
      'height',
      'bmi',
      'oxygen',
      'respiratory'
    ],
    resources: ['Observation'],
    description: 'Record and view vital signs (coded with LOINC: http://loinc.org). Common codes: Heart Rate (8867-4), Blood Pressure (55284-4), Body Temp (8310-5), SpO2 (2708-6)'
  },
  allergies: {
    keywords: [
      'allergy',
      'allergies',
      'allergic',
      'reaction',
      'intolerance',
      'sensitivity'
    ],
    resources: ['AllergyIntolerance'],
    description: 'Track patient allergies and intolerances'
  }
} as const

/**
 * Valid FHIR R4 resource types
 * Reference: https://hl7.org/fhir/R4/resourcelist.html
 */
export const VALID_FHIR_R4_RESOURCES = [
  'Account',
  'ActivityDefinition',
  'AdverseEvent',
  'AllergyIntolerance',
  'Appointment',
  'AppointmentResponse',
  'AuditEvent',
  'Basic',
  'Binary',
  'BiologicallyDerivedProduct',
  'BodyStructure',
  'Bundle',
  'CapabilityStatement',
  'CarePlan',
  'CareTeam',
  'CatalogEntry',
  'ChargeItem',
  'ChargeItemDefinition',
  'Claim',
  'ClaimResponse',
  'ClinicalImpression',
  'CodeSystem',
  'Communication',
  'CommunicationRequest',
  'CompartmentDefinition',
  'Composition',
  'ConceptMap',
  'Condition',
  'Consent',
  'Contract',
  'Coverage',
  'CoverageEligibilityRequest',
  'CoverageEligibilityResponse',
  'DetectedIssue',
  'Device',
  'DeviceDefinition',
  'DeviceMetric',
  'DeviceRequest',
  'DeviceUseStatement',
  'DiagnosticReport',
  'DocumentManifest',
  'DocumentReference',
  'EffectEvidenceSynthesis',
  'Encounter',
  'Endpoint',
  'EnrollmentRequest',
  'EnrollmentResponse',
  'EpisodeOfCare',
  'EventDefinition',
  'Evidence',
  'EvidenceVariable',
  'ExampleScenario',
  'ExplanationOfBenefit',
  'FamilyMemberHistory',
  'Flag',
  'Goal',
  'GraphDefinition',
  'Group',
  'GuidanceResponse',
  'HealthcareService',
  'ImagingStudy',
  'Immunization',
  'ImmunizationEvaluation',
  'ImmunizationRecommendation',
  'ImplementationGuide',
  'InsurancePlan',
  'Invoice',
  'Library',
  'Linkage',
  'List',
  'Location',
  'Measure',
  'MeasureReport',
  'Media',
  'Medication',
  'MedicationAdministration',
  'MedicationDispense',
  'MedicationKnowledge',
  'MedicationRequest',
  'MedicationStatement',
  'MedicinalProduct',
  'MedicinalProductAuthorization',
  'MedicinalProductContraindication',
  'MedicinalProductIndication',
  'MedicinalProductIngredient',
  'MedicinalProductInteraction',
  'MedicinalProductManufactured',
  'MedicinalProductPackaged',
  'MedicinalProductPharmaceutical',
  'MedicinalProductUndesirableEffect',
  'MessageDefinition',
  'MessageHeader',
  'MolecularSequence',
  'NamingSystem',
  'NutritionOrder',
  'Observation',
  'ObservationDefinition',
  'OperationDefinition',
  'OperationOutcome',
  'Organization',
  'OrganizationAffiliation',
  'Patient',
  'PaymentNotice',
  'PaymentReconciliation',
  'Person',
  'PlanDefinition',
  'Practitioner',
  'PractitionerRole',
  'Procedure',
  'Provenance',
  'Questionnaire',
  'QuestionnaireResponse',
  'RelatedPerson',
  'RequestGroup',
  'ResearchDefinition',
  'ResearchElementDefinition',
  'ResearchStudy',
  'ResearchSubject',
  'RiskAssessment',
  'RiskEvidenceSynthesis',
  'Schedule',
  'SearchParameter',
  'ServiceRequest',
  'Slot',
  'Specimen',
  'SpecimenDefinition',
  'StructureDefinition',
  'StructureMap',
  'Subscription',
  'Substance',
  'SubstanceNucleicAcid',
  'SubstancePolymer',
  'SubstanceProtein',
  'SubstanceReferenceInformation',
  'SubstanceSourceMaterial',
  'SubstanceSpecification',
  'SupplyDelivery',
  'SupplyRequest',
  'Task',
  'TerminologyCapabilities',
  'TestReport',
  'TestScript',
  'ValueSet',
  'VerificationResult',
  'VisionPrescription'
] as const

/**
 * Resource descriptions for education/learning mode
 */
export const FHIR_RESOURCE_DESCRIPTIONS: Record<string, string> = {
  Patient:
    'Demographics and other administrative information about an individual receiving care',
  MedicationRequest:
    'An order or request for medication to be dispensed and administered to a patient',
  MedicationStatement:
    'A record of medication being taken by a patient, as reported by the patient or another source',
  Medication:
    'Definition of a medication including its ingredients, strength, and form',
  Appointment: 'A booking of a healthcare event between patient(s), practitioner(s), and/or device(s)',
  Schedule: 'A container for slots of time that may be available for booking appointments',
  Slot: 'A slot of time on a schedule that may be available for booking appointments',
  Observation:
    'Measurements and simple assertions made about a patient, device, or other subject',
  DiagnosticReport:
    'The findings and interpretation of diagnostic tests performed on patients',
  Specimen:
    'A sample to be used for analysis, typically collected from a patient',
  Condition:
    'A clinical condition, problem, diagnosis, or other event, situation, aspect, or clinical concept',
  CareTeam:
    'The Care Team includes all people and organizations who plan to participate in the care process',
  Practitioner:
    'A person who is directly or indirectly involved in the provisioning of healthcare',
  PractitionerRole:
    'A specific set of roles/locations/specialties/services that a practitioner may perform',
  Organization:
    'A formally or informally recognized grouping of people or organizations',
  Immunization:
    'Describes the event of a patient being administered a vaccine',
  ImmunizationRecommendation:
    'A patient-specific recommendation for a vaccine or set of vaccines',
  AllergyIntolerance:
    'Risk of harmful or undesirable physiological response unique to an individual',
  Encounter:
    'An interaction between a patient and healthcare provider(s) for the purpose of providing care',
  Procedure:
    'An action that is performed on a patient, with or for them'
}

/**
 * Detect FHIR resources needed based on natural language prompt
 *
 * @param prompt - Natural language description of the app
 * @returns Array of unique FHIR resource names
 */
export function detectFhirResources(prompt: string): string[] {
  const lowercasePrompt = prompt.toLowerCase()
  const detectedResources = new Set<string>()

  // Always include Patient as base resource
  detectedResources.add('Patient')

  // Check each use case for keyword matches
  for (const [, config] of Object.entries(FHIR_USE_CASES)) {
    for (const keyword of config.keywords) {
      if (lowercasePrompt.includes(keyword.toLowerCase())) {
        // Add all resources for this use case
        for (const resource of config.resources) {
          detectedResources.add(resource)
        }
        break // Found a match for this use case, move to next
      }
    }
  }

  return Array.from(detectedResources)
}

/**
 * Validate that all resources are valid FHIR R4 resource types
 *
 * @param resources - Array of resource names to validate
 * @returns true if all resources are valid, false otherwise
 */
export function validateFhirResources(resources: string[]): boolean {
  if (resources.length === 0) return true

  const validSet = new Set(VALID_FHIR_R4_RESOURCES)

  for (const resource of resources) {
    if (!validSet.has(resource as (typeof VALID_FHIR_R4_RESOURCES)[number])) {
      return false
    }
  }

  return true
}

/**
 * Get description for a FHIR resource (for learning mode)
 *
 * @param resourceName - Name of the FHIR resource
 * @returns Description string or empty string if not found
 */
export function getFhirResourceDescription(resourceName: string): string {
  return FHIR_RESOURCE_DESCRIPTIONS[resourceName] || ''
}

/**
 * Get all use cases that match a prompt
 *
 * @param prompt - Natural language description
 * @returns Array of matching use case names
 */
export function getMatchingUseCases(prompt: string): string[] {
  const lowercasePrompt = prompt.toLowerCase()
  const matchingUseCases: string[] = []

  for (const [useCase, config] of Object.entries(FHIR_USE_CASES)) {
    for (const keyword of config.keywords) {
      if (lowercasePrompt.includes(keyword.toLowerCase())) {
        matchingUseCases.push(useCase)
        break
      }
    }
  }

  return matchingUseCases
}
