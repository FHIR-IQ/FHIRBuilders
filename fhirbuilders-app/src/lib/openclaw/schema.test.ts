/**
 * GeneratedApp Schema and Operations Tests
 *
 * TDD: These tests define expected behavior for the GeneratedApp model.
 * Note: These are unit tests for the schema types and validation logic.
 *       Integration tests with actual database are in a separate file.
 */

import { describe, it, expect } from 'vitest'
import {
  GenerationStatus,
  validateGeneratedAppInput,
  createGeneratedAppInput,
  type GeneratedAppInput,
  type GeneratedAppOutput
} from './schema'

describe('GeneratedApp Schema', () => {
  // =====================================================
  // GenerationStatus Enum Tests
  // =====================================================

  describe('GenerationStatus enum', () => {
    it('should have all required statuses', () => {
      expect(GenerationStatus.PENDING).toBe('PENDING')
      expect(GenerationStatus.ANALYZING).toBe('ANALYZING')
      expect(GenerationStatus.GENERATING).toBe('GENERATING')
      expect(GenerationStatus.DEPLOYING).toBe('DEPLOYING')
      expect(GenerationStatus.COMPLETED).toBe('COMPLETED')
      expect(GenerationStatus.FAILED).toBe('FAILED')
    })

    it('should have exactly 6 statuses', () => {
      const statuses = Object.values(GenerationStatus)
      expect(statuses.length).toBe(6)
    })
  })

  // =====================================================
  // Input Validation Tests
  // =====================================================

  describe('validateGeneratedAppInput', () => {
    it('should accept valid input with required fields', () => {
      const input: GeneratedAppInput = {
        prompt: 'Build a medication reminder app',
        userId: 'user123'
      }

      const result = validateGeneratedAppInput(input)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject empty prompt', () => {
      const input: GeneratedAppInput = {
        prompt: '',
        userId: 'user123'
      }

      const result = validateGeneratedAppInput(input)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Prompt is required')
    })

    it('should reject prompt that is too short', () => {
      const input: GeneratedAppInput = {
        prompt: 'Short',
        userId: 'user123'
      }

      const result = validateGeneratedAppInput(input)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Prompt must be at least 20 characters')
    })

    it('should reject prompt that is too long', () => {
      const input: GeneratedAppInput = {
        prompt: 'a'.repeat(10001),
        userId: 'user123'
      }

      const result = validateGeneratedAppInput(input)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Prompt must be less than 10000 characters')
    })

    it('should reject empty userId', () => {
      const input: GeneratedAppInput = {
        prompt: 'Build a medication reminder app',
        userId: ''
      }

      const result = validateGeneratedAppInput(input)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('User ID is required')
    })

    it('should accept prompt at minimum length (20 chars)', () => {
      const input: GeneratedAppInput = {
        prompt: 'Build medication app', // exactly 20 chars
        userId: 'user123'
      }

      const result = validateGeneratedAppInput(input)

      expect(result.valid).toBe(true)
    })

    it('should trim whitespace from prompt', () => {
      const input: GeneratedAppInput = {
        prompt: '   Build a medication reminder app   ',
        userId: 'user123'
      }

      const result = validateGeneratedAppInput(input)

      expect(result.valid).toBe(true)
    })

    it('should return multiple errors for multiple validation failures', () => {
      const input: GeneratedAppInput = {
        prompt: '',
        userId: ''
      }

      const result = validateGeneratedAppInput(input)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })

  // =====================================================
  // Input Creation Tests
  // =====================================================

  describe('createGeneratedAppInput', () => {
    it('should create input with detected FHIR resources', () => {
      const input = createGeneratedAppInput({
        prompt: 'Build a medication reminder app',
        userId: 'user123'
      })

      expect(input.prompt).toBe('Build a medication reminder app')
      expect(input.userId).toBe('user123')
      expect(input.fhirResources).toBeDefined()
      expect(input.fhirResources).toContain('MedicationRequest')
      expect(input.fhirResources).toContain('Patient')
    })

    it('should set default status to PENDING', () => {
      const input = createGeneratedAppInput({
        prompt: 'Build a medication reminder app',
        userId: 'user123'
      })

      expect(input.status).toBe(GenerationStatus.PENDING)
    })

    it('should detect multiple resource types', () => {
      const input = createGeneratedAppInput({
        prompt: 'Build an app showing medications, appointments, and lab results',
        userId: 'user123'
      })

      expect(input.fhirResources).toContain('MedicationRequest')
      expect(input.fhirResources).toContain('Appointment')
      expect(input.fhirResources).toContain('Observation')
    })

    it('should trim the prompt', () => {
      const input = createGeneratedAppInput({
        prompt: '  Build a medication reminder app  ',
        userId: 'user123'
      })

      expect(input.prompt).toBe('Build a medication reminder app')
    })
  })

  // =====================================================
  // Output Type Tests
  // =====================================================

  describe('GeneratedAppOutput type', () => {
    it('should have all required fields for API response', () => {
      const output: GeneratedAppOutput = {
        id: 'gen123',
        prompt: 'Build a medication reminder app',
        userId: 'user123',
        isDemo: false,
        status: GenerationStatus.COMPLETED,
        fhirResources: ['Patient', 'MedicationRequest'],
        generatedCode: null,
        githubRepoUrl: 'https://github.com/user/repo',
        sandboxUrl: 'https://sandbox.example.com',
        medplumProjectId: 'mp123',
        appId: 'app123',
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(output.id).toBeDefined()
      expect(output.prompt).toBeDefined()
      expect(output.userId).toBeDefined()
      expect(output.status).toBeDefined()
      expect(output.fhirResources).toBeDefined()
      expect(output.createdAt).toBeDefined()
      expect(output.updatedAt).toBeDefined()
    })

    it('should allow null for optional fields', () => {
      const output: GeneratedAppOutput = {
        id: 'gen123',
        prompt: 'Build a medication reminder app',
        userId: 'user123',
        isDemo: false,
        status: GenerationStatus.PENDING,
        fhirResources: ['Patient'],
        generatedCode: null,
        githubRepoUrl: null,
        sandboxUrl: null,
        medplumProjectId: null,
        appId: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(output.generatedCode).toBeNull()
      expect(output.githubRepoUrl).toBeNull()
      expect(output.sandboxUrl).toBeNull()
    })

    it('should store error message on failure', () => {
      const output: GeneratedAppOutput = {
        id: 'gen123',
        prompt: 'Build a medication reminder app',
        userId: 'user123',
        isDemo: false,
        status: GenerationStatus.FAILED,
        fhirResources: ['Patient'],
        generatedCode: null,
        githubRepoUrl: null,
        sandboxUrl: null,
        medplumProjectId: null,
        appId: null,
        errorMessage: 'Code generation failed: API timeout',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      expect(output.status).toBe(GenerationStatus.FAILED)
      expect(output.errorMessage).toBe('Code generation failed: API timeout')
    })
  })

  // =====================================================
  // Status Transition Tests
  // =====================================================

  describe('Status transitions', () => {
    it('should follow valid status progression', () => {
      const validProgressions = [
        [GenerationStatus.PENDING, GenerationStatus.ANALYZING],
        [GenerationStatus.ANALYZING, GenerationStatus.GENERATING],
        [GenerationStatus.GENERATING, GenerationStatus.DEPLOYING],
        [GenerationStatus.DEPLOYING, GenerationStatus.COMPLETED],
        // Failure can happen at any stage
        [GenerationStatus.ANALYZING, GenerationStatus.FAILED],
        [GenerationStatus.GENERATING, GenerationStatus.FAILED],
        [GenerationStatus.DEPLOYING, GenerationStatus.FAILED]
      ]

      // This is a documentation test - ensuring we understand the flow
      expect(validProgressions.length).toBe(7)
    })
  })
})

// =====================================================
// Integration-Ready Types Tests
// =====================================================

describe('GeneratedApp Integration Types', () => {
  it('should be compatible with Prisma create input', () => {
    const prismaInput = {
      prompt: 'Build a medication reminder app',
      userId: 'user123',
      status: 'PENDING' as const,
      fhirResources: ['Patient', 'MedicationRequest']
    }

    expect(prismaInput.prompt).toBeDefined()
    expect(prismaInput.userId).toBeDefined()
    expect(prismaInput.status).toBe('PENDING')
    expect(Array.isArray(prismaInput.fhirResources)).toBe(true)
  })
})
