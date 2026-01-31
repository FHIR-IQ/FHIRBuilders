/**
 * Generation Service Tests
 *
 * TDD: Tests for the generation service that handles
 * the core business logic for OpenClaw app generation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createGeneration,
  getGenerationStatus,
  updateGenerationStatus,
  type GenerationServiceDeps
} from './generation-service'
import { GenerationStatus } from './schema'

// =====================================================
// Mock Dependencies
// =====================================================

const createMockDeps = (): GenerationServiceDeps => ({
  prisma: {
    generatedApp: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    }
  } as unknown as GenerationServiceDeps['prisma']
})

describe('Generation Service', () => {
  let mockDeps: GenerationServiceDeps

  beforeEach(() => {
    mockDeps = createMockDeps()
    vi.clearAllMocks()
  })

  // =====================================================
  // createGeneration Tests
  // =====================================================

  describe('createGeneration', () => {
    it('should create a new generation with detected resources', async () => {
      const mockCreated = {
        id: 'gen123',
        prompt: 'Build a medication reminder app',
        userId: 'user123',
        status: 'PENDING',
        fhirResources: ['Patient', 'MedicationRequest', 'MedicationStatement', 'Medication'],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreated)

      const result = await createGeneration(
        {
          prompt: 'Build a medication reminder app',
          userId: 'user123'
        },
        mockDeps
      )

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('gen123')
      expect(result.data?.fhirResources).toContain('MedicationRequest')
      expect(mockDeps.prisma.generatedApp.create).toHaveBeenCalledTimes(1)
    })

    it('should return validation error for empty prompt', async () => {
      const result = await createGeneration(
        {
          prompt: '',
          userId: 'user123'
        },
        mockDeps
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Prompt is required')
      expect(mockDeps.prisma.generatedApp.create).not.toHaveBeenCalled()
    })

    it('should return validation error for short prompt', async () => {
      const result = await createGeneration(
        {
          prompt: 'Too short',
          userId: 'user123'
        },
        mockDeps
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('at least 20 characters')
      expect(mockDeps.prisma.generatedApp.create).not.toHaveBeenCalled()
    })

    it('should return validation error for empty userId', async () => {
      const result = await createGeneration(
        {
          prompt: 'Build a medication reminder app',
          userId: ''
        },
        mockDeps
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('User ID is required')
    })

    it('should handle database errors gracefully', async () => {
      ;(mockDeps.prisma.generatedApp.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database connection failed')
      )

      const result = await createGeneration(
        {
          prompt: 'Build a medication reminder app',
          userId: 'user123'
        },
        mockDeps
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to create generation')
    })

    it('should detect multiple FHIR resources from complex prompt', async () => {
      const mockCreated = {
        id: 'gen123',
        prompt: 'Build app with medications, appointments, and lab results',
        userId: 'user123',
        status: 'PENDING',
        fhirResources: [
          'Patient',
          'MedicationRequest',
          'MedicationStatement',
          'Medication',
          'Appointment',
          'Schedule',
          'Slot',
          'Observation',
          'DiagnosticReport',
          'Specimen'
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreated)

      const result = await createGeneration(
        {
          prompt: 'Build app with medications, appointments, and lab results',
          userId: 'user123'
        },
        mockDeps
      )

      expect(result.success).toBe(true)
      // Verify the create was called with detected resources
      const createCall = (mockDeps.prisma.generatedApp.create as ReturnType<typeof vi.fn>).mock.calls[0][0]
      expect(createCall.data.fhirResources).toContain('MedicationRequest')
      expect(createCall.data.fhirResources).toContain('Appointment')
      expect(createCall.data.fhirResources).toContain('Observation')
    })
  })

  // =====================================================
  // getGenerationStatus Tests
  // =====================================================

  describe('getGenerationStatus', () => {
    it('should return generation status for valid id', async () => {
      const mockGeneration = {
        id: 'gen123',
        status: 'GENERATING',
        fhirResources: ['Patient', 'MedicationRequest'],
        sandboxUrl: null,
        githubRepoUrl: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockGeneration)

      const result = await getGenerationStatus('gen123', mockDeps)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('GENERATING')
      expect(mockDeps.prisma.generatedApp.findUnique).toHaveBeenCalledWith({
        where: { id: 'gen123' },
        select: expect.any(Object)
      })
    })

    it('should return error for non-existent id', async () => {
      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null)

      const result = await getGenerationStatus('nonexistent', mockDeps)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
    })

    it('should include deployment URLs when completed', async () => {
      const mockGeneration = {
        id: 'gen123',
        status: 'COMPLETED',
        fhirResources: ['Patient', 'MedicationRequest'],
        sandboxUrl: 'https://sandbox.example.com',
        githubRepoUrl: 'https://github.com/user/repo',
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockGeneration)

      const result = await getGenerationStatus('gen123', mockDeps)

      expect(result.success).toBe(true)
      expect(result.data?.sandboxUrl).toBe('https://sandbox.example.com')
      expect(result.data?.githubRepoUrl).toBe('https://github.com/user/repo')
    })

    it('should include error message when failed', async () => {
      const mockGeneration = {
        id: 'gen123',
        status: 'FAILED',
        fhirResources: ['Patient'],
        sandboxUrl: null,
        githubRepoUrl: null,
        errorMessage: 'Code generation timeout',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(mockGeneration)

      const result = await getGenerationStatus('gen123', mockDeps)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('FAILED')
      expect(result.data?.errorMessage).toBe('Code generation timeout')
    })
  })

  // =====================================================
  // updateGenerationStatus Tests
  // =====================================================

  describe('updateGenerationStatus', () => {
    it('should update status from PENDING to ANALYZING', async () => {
      const mockUpdated = {
        id: 'gen123',
        status: 'ANALYZING',
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen123',
        status: 'PENDING'
      })
      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockUpdated)

      const result = await updateGenerationStatus(
        'gen123',
        GenerationStatus.ANALYZING,
        mockDeps
      )

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('ANALYZING')
    })

    it('should reject invalid status transition', async () => {
      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen123',
        status: 'COMPLETED' // Terminal state
      })

      const result = await updateGenerationStatus(
        'gen123',
        GenerationStatus.GENERATING,
        mockDeps
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid status transition')
    })

    it('should allow transition to FAILED from any active state', async () => {
      const mockUpdated = {
        id: 'gen123',
        status: 'FAILED',
        errorMessage: 'Deployment failed',
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen123',
        status: 'DEPLOYING'
      })
      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockUpdated)

      const result = await updateGenerationStatus(
        'gen123',
        GenerationStatus.FAILED,
        mockDeps,
        { errorMessage: 'Deployment failed' }
      )

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('FAILED')
    })

    it('should update with deployment URLs on COMPLETED', async () => {
      const mockUpdated = {
        id: 'gen123',
        status: 'COMPLETED',
        sandboxUrl: 'https://sandbox.example.com',
        githubRepoUrl: 'https://github.com/user/repo',
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen123',
        status: 'DEPLOYING'
      })
      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue(mockUpdated)

      const result = await updateGenerationStatus(
        'gen123',
        GenerationStatus.COMPLETED,
        mockDeps,
        {
          sandboxUrl: 'https://sandbox.example.com',
          githubRepoUrl: 'https://github.com/user/repo'
        }
      )

      expect(result.success).toBe(true)
      expect(result.data?.sandboxUrl).toBe('https://sandbox.example.com')
    })
  })
})

// =====================================================
// Edge Cases and Error Handling
// =====================================================

describe('Generation Service - Edge Cases', () => {
  let mockDeps: GenerationServiceDeps

  beforeEach(() => {
    mockDeps = createMockDeps()
  })

  it('should handle very long prompts gracefully', async () => {
    const longPrompt = 'Build a medication app. '.repeat(200) // ~5000 chars

    const mockCreated = {
      id: 'gen123',
      prompt: longPrompt,
      userId: 'user123',
      status: 'PENDING',
      fhirResources: ['Patient', 'MedicationRequest'],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    ;(mockDeps.prisma.generatedApp.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreated)

    const result = await createGeneration(
      {
        prompt: longPrompt,
        userId: 'user123'
      },
      mockDeps
    )

    expect(result.success).toBe(true)
  })

  it('should handle prompts with special characters', async () => {
    const specialPrompt = "Build a medication reminder app! (with doses & schedules) <test>"

    const mockCreated = {
      id: 'gen123',
      prompt: specialPrompt,
      userId: 'user123',
      status: 'PENDING',
      fhirResources: ['Patient', 'MedicationRequest'],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    ;(mockDeps.prisma.generatedApp.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreated)

    const result = await createGeneration(
      {
        prompt: specialPrompt,
        userId: 'user123'
      },
      mockDeps
    )

    expect(result.success).toBe(true)
  })

  it('should handle concurrent status updates', async () => {
    // Simulate race condition by having findUnique return stale data
    ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ id: 'gen123', status: 'ANALYZING' })
      .mockResolvedValueOnce({ id: 'gen123', status: 'GENERATING' }) // Already moved on

    ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: 'gen123',
      status: 'GENERATING'
    })

    const result = await updateGenerationStatus(
      'gen123',
      GenerationStatus.GENERATING,
      mockDeps
    )

    // Should succeed even with race condition
    expect(result.success).toBe(true)
  })
})
