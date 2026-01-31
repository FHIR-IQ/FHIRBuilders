/**
 * Code Templates Tests
 *
 * TDD: Tests for FHIR app code templates
 */

import { describe, it, expect } from 'vitest'
import {
  getTemplate,
  getTemplateForResources,
  getAllTemplates,
  applyTemplate
} from './templates'

describe('Code Templates', () => {
  // =====================================================
  // Template Retrieval Tests
  // =====================================================

  describe('getTemplate', () => {
    it('should return medication-tracker template by id', () => {
      const template = getTemplate('medication-tracker')

      expect(template).toBeDefined()
      expect(template?.id).toBe('medication-tracker')
      expect(template?.name).toContain('Medication')
    })

    it('should return patient-portal template by id', () => {
      const template = getTemplate('patient-portal')

      expect(template).toBeDefined()
      expect(template?.id).toBe('patient-portal')
    })

    it('should return undefined for unknown template', () => {
      const template = getTemplate('unknown-template')

      expect(template).toBeUndefined()
    })

    it('should include required FHIR resources', () => {
      const template = getTemplate('medication-tracker')

      expect(template?.requiredResources).toContain('Patient')
      expect(template?.requiredResources).toContain('MedicationRequest')
    })

    it('should include starter code files', () => {
      const template = getTemplate('medication-tracker')

      expect(template?.files).toBeDefined()
      expect(template?.files.length).toBeGreaterThan(0)
    })
  })

  describe('getAllTemplates', () => {
    it('should return all available templates', () => {
      const templates = getAllTemplates()

      expect(templates.length).toBeGreaterThan(0)
    })

    it('should include core healthcare templates', () => {
      const templates = getAllTemplates()
      const ids = templates.map(t => t.id)

      expect(ids).toContain('medication-tracker')
      expect(ids).toContain('patient-portal')
    })

    it('should have valid structure for all templates', () => {
      const templates = getAllTemplates()

      templates.forEach(template => {
        expect(template.id).toBeDefined()
        expect(template.name).toBeDefined()
        expect(template.description).toBeDefined()
        expect(template.requiredResources).toBeDefined()
        expect(Array.isArray(template.requiredResources)).toBe(true)
      })
    })
  })

  // =====================================================
  // Template Matching Tests
  // =====================================================

  describe('getTemplateForResources', () => {
    it('should match medication-tracker for MedicationRequest resources', () => {
      const template = getTemplateForResources(['Patient', 'MedicationRequest'])

      expect(template?.id).toBe('medication-tracker')
    })

    it('should match patient-portal for Patient-only resources', () => {
      const template = getTemplateForResources(['Patient'])

      expect(template?.id).toBe('patient-portal')
    })

    it('should match observation-dashboard for Observation resources', () => {
      const template = getTemplateForResources(['Patient', 'Observation'])

      expect(template?.id).toBe('observation-dashboard')
    })

    it('should match appointment-scheduler for Appointment resources', () => {
      const template = getTemplateForResources(['Patient', 'Appointment', 'Practitioner'])

      expect(template?.id).toBe('appointment-scheduler')
    })

    it('should return best match when multiple templates could apply', () => {
      const template = getTemplateForResources([
        'Patient',
        'MedicationRequest',
        'MedicationStatement',
        'Observation'
      ])

      // Should prioritize based on resource specificity
      expect(template).toBeDefined()
    })

    it('should return null for unrecognized resource combinations', () => {
      const template = getTemplateForResources(['Binary', 'AuditEvent'])

      expect(template).toBeNull()
    })
  })

  // =====================================================
  // Template Application Tests
  // =====================================================

  describe('applyTemplate', () => {
    it('should replace app name placeholder', () => {
      const template = getTemplate('medication-tracker')!
      const result = applyTemplate(template, {
        appName: 'my-med-app',
        description: 'My medication app'
      })

      // Check that files contain the app name
      const hasAppName = result.files.some(
        f => f.code.includes('my-med-app') || f.code.includes('MyMedApp')
      )
      expect(hasAppName || result.appName === 'my-med-app').toBe(true)
    })

    it('should replace description placeholder', () => {
      const template = getTemplate('patient-portal')!
      const result = applyTemplate(template, {
        appName: 'health-portal',
        description: 'A comprehensive health portal'
      })

      expect(result.description).toContain('health portal')
    })

    it('should preserve file structure', () => {
      const template = getTemplate('medication-tracker')!
      const result = applyTemplate(template, {
        appName: 'med-tracker',
        description: 'Track medications'
      })

      expect(result.files.length).toBe(template.files.length)
      result.files.forEach(file => {
        expect(file.name).toBeDefined()
        expect(file.path).toBeDefined()
        expect(file.code).toBeDefined()
      })
    })

    it('should generate valid component paths', () => {
      const template = getTemplate('medication-tracker')!
      const result = applyTemplate(template, {
        appName: 'med-app',
        description: 'Test app'
      })

      result.files.forEach(file => {
        expect(file.path).toMatch(/^src\//)
        expect(file.path).toMatch(/\.(tsx?|ts)$/)
      })
    })

    it('should include FHIR imports in components', () => {
      const template = getTemplate('medication-tracker')!
      const result = applyTemplate(template, {
        appName: 'med-app',
        description: 'Test app'
      })

      const componentFiles = result.files.filter(f => f.path.includes('components'))
      const hasFhirImport = componentFiles.some(
        f => f.code.includes('@medplum') || f.code.includes('fhirtypes')
      )

      expect(hasFhirImport).toBe(true)
    })
  })

  // =====================================================
  // Template Content Validation
  // =====================================================

  describe('Template Content', () => {
    it('medication-tracker should have MedicationList component', () => {
      const template = getTemplate('medication-tracker')!

      const hasMedList = template.files.some(
        f => f.name.includes('Medication') && f.path.includes('components')
      )
      expect(hasMedList).toBe(true)
    })

    it('patient-portal should have PatientSummary component', () => {
      const template = getTemplate('patient-portal')!

      const hasPatientSummary = template.files.some(
        f => f.name.includes('Patient') && f.path.includes('components')
      )
      expect(hasPatientSummary).toBe(true)
    })

    it('all templates should have a main page', () => {
      const templates = getAllTemplates()

      templates.forEach(template => {
        const hasMainPage = template.files.some(
          f => f.path.includes('app/page.tsx') || f.path.includes('pages/index')
        )
        expect(hasMainPage).toBe(true)
      })
    })

    it('all templates should use TypeScript', () => {
      const templates = getAllTemplates()

      templates.forEach(template => {
        template.files.forEach(file => {
          expect(file.path).toMatch(/\.tsx?$/)
        })
      })
    })
  })
})
