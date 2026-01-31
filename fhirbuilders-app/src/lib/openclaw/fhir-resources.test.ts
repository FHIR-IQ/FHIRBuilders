/**
 * FHIR Resource Detection Tests
 *
 * TDD: These tests are written BEFORE implementation.
 * Run with: npm run test
 */

import { describe, it, expect } from 'vitest'
import {
  detectFhirResources,
  FHIR_USE_CASES,
  validateFhirResources,
  getFhirResourceDescription
} from './fhir-resources'

describe('FHIR Resource Detection', () => {
  describe('detectFhirResources', () => {
    // =====================================================
    // Core Functionality Tests
    // =====================================================

    it('should always include Patient resource', () => {
      const resources = detectFhirResources('Build something')
      expect(resources).toContain('Patient')
    })

    it('should return unique resources (no duplicates)', () => {
      const resources = detectFhirResources('medication medication medication')
      const uniqueResources = [...new Set(resources)]
      expect(resources).toEqual(uniqueResources)
    })

    it('should be case-insensitive', () => {
      const lowerCase = detectFhirResources('medication reminder')
      const upperCase = detectFhirResources('MEDICATION REMINDER')
      const mixedCase = detectFhirResources('MeDiCaTiOn ReMiNdEr')

      expect(lowerCase).toEqual(upperCase)
      expect(lowerCase).toEqual(mixedCase)
    })

    // =====================================================
    // Medication Use Case Tests
    // =====================================================

    it('should detect medication resources for "medication reminder app"', () => {
      const resources = detectFhirResources(
        'Build a medication reminder app that shows patients their prescriptions'
      )

      expect(resources).toContain('MedicationRequest')
      expect(resources).toContain('MedicationStatement')
      expect(resources).toContain('Medication')
      expect(resources).toContain('Patient')
    })

    it('should detect medication resources for "prescription tracker"', () => {
      const resources = detectFhirResources('prescription tracking system')

      expect(resources).toContain('MedicationRequest')
      expect(resources).toContain('Patient')
    })

    it('should detect medication resources for "drug interactions"', () => {
      const resources = detectFhirResources('check drug interactions')

      expect(resources).toContain('Medication')
    })

    it('should detect medication resources for "pill reminder"', () => {
      const resources = detectFhirResources('daily pill reminder with doses')

      expect(resources).toContain('MedicationStatement')
    })

    // =====================================================
    // Appointment Use Case Tests
    // =====================================================

    it('should detect appointment resources for "scheduling app"', () => {
      const resources = detectFhirResources(
        'Create an appointment scheduling app for a small clinic'
      )

      expect(resources).toContain('Appointment')
      expect(resources).toContain('Schedule')
      expect(resources).toContain('Slot')
      expect(resources).toContain('Patient')
    })

    it('should detect appointment resources for "booking system"', () => {
      const resources = detectFhirResources('patient booking system')

      expect(resources).toContain('Appointment')
    })

    it('should detect appointment resources for "visit calendar"', () => {
      const resources = detectFhirResources('show upcoming visits in a calendar')

      expect(resources).toContain('Appointment')
    })

    // =====================================================
    // Lab Results Use Case Tests
    // =====================================================

    it('should detect lab resources for "lab results viewer"', () => {
      const resources = detectFhirResources(
        'Build a lab results viewer that shows trends over time'
      )

      expect(resources).toContain('Observation')
      expect(resources).toContain('DiagnosticReport')
      expect(resources).toContain('Patient')
    })

    it('should detect lab resources for "blood test tracker"', () => {
      const resources = detectFhirResources('track blood test results')

      expect(resources).toContain('Observation')
    })

    it('should detect lab resources for "diagnostic dashboard"', () => {
      const resources = detectFhirResources('diagnostic results dashboard')

      expect(resources).toContain('DiagnosticReport')
    })

    // =====================================================
    // Conditions Use Case Tests
    // =====================================================

    it('should detect condition resources for "health conditions tracker"', () => {
      const resources = detectFhirResources('track patient health conditions')

      expect(resources).toContain('Condition')
      expect(resources).toContain('Patient')
    })

    it('should detect condition resources for "diagnosis manager"', () => {
      const resources = detectFhirResources('manage patient diagnoses')

      expect(resources).toContain('Condition')
    })

    it('should detect condition resources for "disease monitoring"', () => {
      const resources = detectFhirResources('monitor chronic disease progression')

      expect(resources).toContain('Condition')
    })

    // =====================================================
    // Care Team Use Case Tests
    // =====================================================

    it('should detect care team resources for "care team management"', () => {
      const resources = detectFhirResources('manage patient care team members')

      expect(resources).toContain('CareTeam')
      expect(resources).toContain('Practitioner')
      expect(resources).toContain('PractitionerRole')
      expect(resources).toContain('Organization')
    })

    it('should detect care team resources for "provider directory"', () => {
      const resources = detectFhirResources('healthcare provider directory')

      expect(resources).toContain('Practitioner')
    })

    it('should detect care team resources for "doctor lookup"', () => {
      const resources = detectFhirResources('find doctors in my area')

      expect(resources).toContain('Practitioner')
    })

    // =====================================================
    // Immunization Use Case Tests
    // =====================================================

    it('should detect immunization resources for "vaccine tracker"', () => {
      const resources = detectFhirResources('vaccine record tracker')

      expect(resources).toContain('Immunization')
      expect(resources).toContain('Patient')
    })

    it('should detect immunization resources for "immunization records"', () => {
      const resources = detectFhirResources('view immunization history')

      expect(resources).toContain('Immunization')
      expect(resources).toContain('ImmunizationRecommendation')
    })

    it('should detect immunization resources for "vaccination schedule"', () => {
      const resources = detectFhirResources('upcoming vaccination schedule')

      expect(resources).toContain('Immunization')
    })

    // =====================================================
    // Vitals Use Case Tests
    // =====================================================

    it('should detect vital resources for "vital signs tracker"', () => {
      const resources = detectFhirResources('track vital signs over time')

      expect(resources).toContain('Observation')
      expect(resources).toContain('Patient')
    })

    it('should detect vital resources for "blood pressure monitoring"', () => {
      const resources = detectFhirResources('blood pressure monitoring app')

      expect(resources).toContain('Observation')
    })

    it('should detect vital resources for "heart rate tracker"', () => {
      const resources = detectFhirResources('heart rate and temperature tracker')

      expect(resources).toContain('Observation')
    })

    it('should detect vital resources for "weight tracking"', () => {
      const resources = detectFhirResources('weight and height tracking')

      expect(resources).toContain('Observation')
    })

    // =====================================================
    // Allergies Use Case Tests
    // =====================================================

    it('should detect allergy resources for "allergy tracker"', () => {
      const resources = detectFhirResources('track patient allergies')

      expect(resources).toContain('AllergyIntolerance')
      expect(resources).toContain('Patient')
    })

    it('should detect allergy resources for "allergic reactions"', () => {
      const resources = detectFhirResources('record allergic reactions')

      expect(resources).toContain('AllergyIntolerance')
    })

    it('should detect allergy resources for "food intolerance"', () => {
      const resources = detectFhirResources('food intolerance list')

      expect(resources).toContain('AllergyIntolerance')
    })

    // =====================================================
    // Multiple Use Cases (Combined)
    // =====================================================

    it('should detect multiple resource types in complex prompts', () => {
      const resources = detectFhirResources(
        'Build a comprehensive patient dashboard showing medications, lab results, and upcoming appointments'
      )

      // Should have medication resources
      expect(resources).toContain('MedicationRequest')

      // Should have lab resources
      expect(resources).toContain('Observation')
      expect(resources).toContain('DiagnosticReport')

      // Should have appointment resources
      expect(resources).toContain('Appointment')

      // Should have Patient
      expect(resources).toContain('Patient')
    })

    it('should detect resources for care coordination app', () => {
      const resources = detectFhirResources(
        'Care coordination app with care team, patient conditions, and medication list'
      )

      expect(resources).toContain('CareTeam')
      expect(resources).toContain('Condition')
      expect(resources).toContain('MedicationRequest')
    })

    // =====================================================
    // Edge Cases
    // =====================================================

    it('should handle empty prompt', () => {
      const resources = detectFhirResources('')

      expect(resources).toContain('Patient')
      expect(resources.length).toBeGreaterThanOrEqual(1)
    })

    it('should handle prompt with no matching keywords', () => {
      const resources = detectFhirResources('build a weather app')

      expect(resources).toContain('Patient')
      // Should only have Patient for non-healthcare prompts
    })

    it('should handle very long prompts', () => {
      const longPrompt = 'medication '.repeat(1000)
      const resources = detectFhirResources(longPrompt)

      expect(resources).toContain('MedicationRequest')
      // Should not throw or timeout
    })

    it('should handle prompts with special characters', () => {
      const resources = detectFhirResources(
        'Build a medication-reminder app! (with prescriptions & doses)'
      )

      expect(resources).toContain('MedicationRequest')
    })
  })

  // =====================================================
  // FHIR Use Cases Configuration Tests
  // =====================================================

  describe('FHIR_USE_CASES configuration', () => {
    it('should have all required use cases defined', () => {
      const requiredUseCases = [
        'medication',
        'appointments',
        'lab-results',
        'conditions',
        'care-team',
        'immunization',
        'vitals',
        'allergies'
      ]

      for (const useCase of requiredUseCases) {
        expect(FHIR_USE_CASES).toHaveProperty(useCase)
      }
    })

    it('should have keywords array for each use case', () => {
      for (const [, config] of Object.entries(FHIR_USE_CASES)) {
        expect(config.keywords).toBeDefined()
        expect(Array.isArray(config.keywords)).toBe(true)
        expect(config.keywords.length).toBeGreaterThan(0)
      }
    })

    it('should have resources array for each use case', () => {
      for (const [, config] of Object.entries(FHIR_USE_CASES)) {
        expect(config.resources).toBeDefined()
        expect(Array.isArray(config.resources)).toBe(true)
        expect(config.resources.length).toBeGreaterThan(0)
      }
    })

    it('should have description for each use case', () => {
      for (const [, config] of Object.entries(FHIR_USE_CASES)) {
        expect(config.description).toBeDefined()
        expect(typeof config.description).toBe('string')
        expect(config.description.length).toBeGreaterThan(0)
      }
    })
  })

  // =====================================================
  // Validation Tests
  // =====================================================

  describe('validateFhirResources', () => {
    it('should return true for valid FHIR R4 resources', () => {
      const validResources = ['Patient', 'Observation', 'MedicationRequest']

      expect(validateFhirResources(validResources)).toBe(true)
    })

    it('should return false for invalid resources', () => {
      const invalidResources = ['Patient', 'InvalidResource', 'FakeResource']

      expect(validateFhirResources(invalidResources)).toBe(false)
    })

    it('should return true for empty array', () => {
      expect(validateFhirResources([])).toBe(true)
    })

    it('should handle case sensitivity for resource names', () => {
      // FHIR resources are case-sensitive (PascalCase)
      expect(validateFhirResources(['Patient'])).toBe(true)
      expect(validateFhirResources(['patient'])).toBe(false)
    })
  })

  // =====================================================
  // Resource Description Tests
  // =====================================================

  describe('getFhirResourceDescription', () => {
    it('should return description for known resources', () => {
      const description = getFhirResourceDescription('Patient')

      expect(description).toBeDefined()
      expect(typeof description).toBe('string')
      expect(description.length).toBeGreaterThan(0)
    })

    it('should return empty string for unknown resources', () => {
      const description = getFhirResourceDescription('UnknownResource')

      expect(description).toBe('')
    })

    it('should have descriptions for all detected resources', () => {
      const resources = detectFhirResources('medication appointment lab condition')

      for (const resource of resources) {
        const description = getFhirResourceDescription(resource)
        expect(description.length).toBeGreaterThan(0)
      }
    })
  })
})

// =====================================================
// Integration Tests
// =====================================================

describe('FHIR Resource Detection - Integration', () => {
  it('should work end-to-end for a realistic prompt', () => {
    const prompt = `
      Build a medication adherence app for diabetic patients.
      The app should:
      - Show current prescriptions
      - Allow patients to mark doses as taken
      - Display blood glucose lab results
      - Show upcoming doctor appointments
      - List the patient's care team
    `

    const resources = detectFhirResources(prompt)

    // Medication related
    expect(resources).toContain('MedicationRequest')
    expect(resources).toContain('MedicationStatement')

    // Lab related (blood glucose)
    expect(resources).toContain('Observation')

    // Appointment related
    expect(resources).toContain('Appointment')

    // Care team related
    expect(resources).toContain('CareTeam')

    // Always present
    expect(resources).toContain('Patient')
  })

  it('should return consistent results for same input', () => {
    const prompt = 'Build a medication reminder app'

    const result1 = detectFhirResources(prompt)
    const result2 = detectFhirResources(prompt)
    const result3 = detectFhirResources(prompt)

    expect(result1).toEqual(result2)
    expect(result2).toEqual(result3)
  })
})
