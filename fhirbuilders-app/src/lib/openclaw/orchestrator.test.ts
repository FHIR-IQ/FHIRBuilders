/**
 * Generation Orchestrator Tests
 *
 * TDD: Tests for async generation workflow orchestration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  startGeneration,
  processGeneration,
  type OrchestratorDeps,
  type GenerationJob
} from './orchestrator'
import { GenerationStatus } from './schema'

// =====================================================
// Mock Dependencies
// =====================================================

const createMockDeps = (): OrchestratorDeps => ({
  prisma: {
    generatedApp: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    }
  } as unknown as OrchestratorDeps['prisma'],
  anthropic: {
    messages: {
      create: vi.fn()
    }
  } as unknown as OrchestratorDeps['anthropic'],
  onStatusChange: vi.fn()
})

describe('Generation Orchestrator', () => {
  let mockDeps: OrchestratorDeps

  beforeEach(() => {
    mockDeps = createMockDeps()
    vi.clearAllMocks()
  })

  // =====================================================
  // Start Generation Tests
  // =====================================================

  describe('startGeneration', () => {
    it('should create a generation record in PENDING status', async () => {
      const mockCreated = {
        id: 'gen-123',
        prompt: 'Build a medication tracker',
        status: 'PENDING',
        fhirResources: ['Patient', 'MedicationRequest'],
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreated)

      const result = await startGeneration({
        prompt: 'Build a medication tracker',
        userId: 'user-1',
        deps: mockDeps
      })

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('gen-123')
      expect(result.data?.status).toBe('PENDING')
    })

    it('should validate prompt before creating', async () => {
      const result = await startGeneration({
        prompt: 'short', // Too short
        userId: 'user-1',
        deps: mockDeps
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('characters')
    })

    it('should detect FHIR resources from prompt', async () => {
      const mockCreated = {
        id: 'gen-123',
        prompt: 'Build an app to track Patient medications with MedicationRequest',
        status: 'PENDING',
        fhirResources: ['Patient', 'MedicationRequest'],
        userId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      ;(mockDeps.prisma.generatedApp.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreated)

      const result = await startGeneration({
        prompt: 'Build an app to track Patient medications with MedicationRequest',
        userId: 'user-1',
        deps: mockDeps
      })

      expect(result.success).toBe(true)
      expect(result.data?.fhirResources).toContain('Patient')
      expect(result.data?.fhirResources).toContain('MedicationRequest')
    })

    it('should handle database errors', async () => {
      ;(mockDeps.prisma.generatedApp.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Database error')
      )

      const result = await startGeneration({
        prompt: 'Build a medication tracker app for patients',
        userId: 'user-1',
        deps: mockDeps
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  // =====================================================
  // Process Generation Tests
  // =====================================================

  describe('processGeneration', () => {
    const mockJob: GenerationJob = {
      id: 'gen-123',
      prompt: 'Build a medication tracker',
      fhirResources: ['Patient', 'MedicationRequest'],
      userId: 'user-1'
    }

    it('should progress through ANALYZING status', async () => {
      // Setup mock for finding generation
      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'PENDING'
      })

      // Setup mock for updates
      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'ANALYZING'
      })

      // Setup mock for Claude API
      const mockCodeOutput = {
        appName: 'med-tracker',
        description: 'A medication tracking app',
        components: [{ name: 'MedList', path: 'src/components/MedList.tsx', code: 'export...' }],
        pages: [{ name: 'page', path: 'src/app/page.tsx', code: 'export...' }],
        apiRoutes: []
      }

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockCodeOutput) }]
      })

      await processGeneration(mockJob, mockDeps)

      // Verify status progression (called with id, status, and optional undefined error)
      const calls = (mockDeps.onStatusChange as ReturnType<typeof vi.fn>).mock.calls
      const analyzingCall = calls.find((c: unknown[]) => c[1] === GenerationStatus.ANALYZING)
      expect(analyzingCall).toBeDefined()
      expect(analyzingCall?.[0]).toBe('gen-123')
    })

    it('should progress through GENERATING status', async () => {
      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'PENDING'
      })

      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'GENERATING'
      })

      const mockCodeOutput = {
        appName: 'med-tracker',
        description: 'A medication tracking app',
        components: [{ name: 'MedList', path: 'src/components/MedList.tsx', code: 'export...' }],
        pages: [{ name: 'page', path: 'src/app/page.tsx', code: 'export...' }],
        apiRoutes: []
      }

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockCodeOutput) }]
      })

      await processGeneration(mockJob, mockDeps)

      const calls = (mockDeps.onStatusChange as ReturnType<typeof vi.fn>).mock.calls
      const generatingCall = calls.find((c: unknown[]) => c[1] === GenerationStatus.GENERATING)
      expect(generatingCall).toBeDefined()
      expect(generatingCall?.[0]).toBe('gen-123')
    })

    it('should call Claude API for code generation', async () => {
      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'PENDING'
      })

      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'GENERATING'
      })

      const mockCodeOutput = {
        appName: 'med-tracker',
        description: 'A medication tracking app',
        components: [{ name: 'MedList', path: 'src/components/MedList.tsx', code: 'export...' }],
        pages: [{ name: 'page', path: 'src/app/page.tsx', code: 'export...' }],
        apiRoutes: []
      }

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockCodeOutput) }]
      })

      await processGeneration(mockJob, mockDeps)

      expect(mockDeps.anthropic.messages.create).toHaveBeenCalled()
    })

    it('should store generated code in database', async () => {
      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'PENDING'
      })

      const mockCodeOutput = {
        appName: 'med-tracker',
        description: 'A medication tracking app',
        components: [{ name: 'MedList', path: 'src/components/MedList.tsx', code: 'export...' }],
        pages: [{ name: 'page', path: 'src/app/page.tsx', code: 'export...' }],
        apiRoutes: []
      }

      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'COMPLETED',
        generatedCode: mockCodeOutput
      })

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockCodeOutput) }]
      })

      await processGeneration(mockJob, mockDeps)

      // Verify that update was called with generated code
      const updateCalls = (mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mock.calls
      const hasGeneratedCode = updateCalls.some(
        (call: unknown[]) => (call[0] as { data?: { generatedCode?: unknown } })?.data?.generatedCode !== undefined
      )
      expect(hasGeneratedCode).toBe(true)
    })

    it('should handle code generation errors', async () => {
      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'PENDING'
      })

      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'FAILED'
      })

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API error')
      )

      await processGeneration(mockJob, mockDeps)

      // Verify FAILED status was set
      expect(mockDeps.onStatusChange).toHaveBeenCalledWith(
        'gen-123',
        GenerationStatus.FAILED,
        expect.any(String)
      )
    })

    it('should set COMPLETED status on success', async () => {
      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'PENDING'
      })

      const mockCodeOutput = {
        appName: 'med-tracker',
        description: 'A medication tracking app',
        components: [{ name: 'MedList', path: 'src/components/MedList.tsx', code: 'export...' }],
        pages: [{ name: 'page', path: 'src/app/page.tsx', code: 'export...' }],
        apiRoutes: []
      }

      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'COMPLETED'
      })

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockCodeOutput) }]
      })

      await processGeneration(mockJob, mockDeps)

      const calls = (mockDeps.onStatusChange as ReturnType<typeof vi.fn>).mock.calls
      const completedCall = calls.find((c: unknown[]) => c[1] === GenerationStatus.COMPLETED)
      expect(completedCall).toBeDefined()
      expect(completedCall?.[0]).toBe('gen-123')
    })
  })

  // =====================================================
  // Status Update Callback Tests
  // =====================================================

  describe('Status Updates', () => {
    it('should call onStatusChange for each status transition', async () => {
      const mockJob: GenerationJob = {
        id: 'gen-123',
        prompt: 'Build a medication tracker',
        fhirResources: ['Patient', 'MedicationRequest'],
        userId: 'user-1'
      }

      ;(mockDeps.prisma.generatedApp.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'PENDING'
      })

      const mockCodeOutput = {
        appName: 'med-tracker',
        description: 'Test',
        components: [{ name: 'Test', path: 'src/components/Test.tsx', code: 'export...' }],
        pages: [{ name: 'page', path: 'src/app/page.tsx', code: 'export...' }],
        apiRoutes: []
      }

      ;(mockDeps.prisma.generatedApp.update as ReturnType<typeof vi.fn>).mockResolvedValue({
        id: 'gen-123',
        status: 'COMPLETED'
      })

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify(mockCodeOutput) }]
      })

      await processGeneration(mockJob, mockDeps)

      // Should have been called for each status transition
      expect(mockDeps.onStatusChange).toHaveBeenCalled()
      const calls = (mockDeps.onStatusChange as ReturnType<typeof vi.fn>).mock.calls
      expect(calls.length).toBeGreaterThanOrEqual(2) // At least ANALYZING and COMPLETED
    })
  })
})
