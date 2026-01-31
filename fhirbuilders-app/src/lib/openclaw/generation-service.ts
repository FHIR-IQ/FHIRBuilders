/**
 * Generation Service
 *
 * Core business logic for OpenClaw app generation.
 * This service handles creation, status updates, and querying of generated apps.
 */

import type { PrismaClient } from '@prisma/client'
import {
  validateGeneratedAppInput,
  createGeneratedAppInput,
  isValidStatusTransition,
  type GeneratedAppInput,
  type GenerationStatusType
} from './schema'

/**
 * Service dependencies (for dependency injection)
 */
export interface GenerationServiceDeps {
  prisma: PrismaClient
}

/**
 * Generic service result type
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Generation data returned from service
 */
export interface GenerationData {
  id: string
  status: string
  fhirResources: string[]
  sandboxUrl?: string | null
  githubRepoUrl?: string | null
  errorMessage?: string | null
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Update options for status changes
 */
export interface StatusUpdateOptions {
  errorMessage?: string
  sandboxUrl?: string
  githubRepoUrl?: string
  medplumProjectId?: string
  generatedCode?: Record<string, unknown>
}

/**
 * Create a new generation record
 *
 * @param input - User input with prompt and userId
 * @param deps - Service dependencies
 * @returns Service result with created generation or error
 */
export async function createGeneration(
  input: GeneratedAppInput,
  deps: GenerationServiceDeps
): Promise<ServiceResult<GenerationData>> {
  // Validate input
  const validation = validateGeneratedAppInput(input)
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join(', ')
    }
  }

  try {
    // Create input with detected FHIR resources
    const createInput = createGeneratedAppInput(input)

    // Create database record
    const created = await deps.prisma.generatedApp.create({
      data: {
        prompt: createInput.prompt,
        userId: createInput.userId,
        status: createInput.status,
        fhirResources: createInput.fhirResources
      }
    })

    return {
      success: true,
      data: {
        id: created.id,
        status: created.status,
        fhirResources: created.fhirResources,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt
      }
    }
  } catch (error) {
    console.error('Failed to create generation:', error)
    return {
      success: false,
      error: 'Failed to create generation. Please try again.'
    }
  }
}

/**
 * Get the status of a generation
 *
 * @param id - Generation ID
 * @param deps - Service dependencies
 * @returns Service result with generation status or error
 */
export async function getGenerationStatus(
  id: string,
  deps: GenerationServiceDeps
): Promise<ServiceResult<GenerationData>> {
  try {
    const generation = await deps.prisma.generatedApp.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        fhirResources: true,
        sandboxUrl: true,
        githubRepoUrl: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!generation) {
      return {
        success: false,
        error: 'Generation not found'
      }
    }

    return {
      success: true,
      data: {
        id: generation.id,
        status: generation.status,
        fhirResources: generation.fhirResources,
        sandboxUrl: generation.sandboxUrl,
        githubRepoUrl: generation.githubRepoUrl,
        errorMessage: generation.errorMessage,
        createdAt: generation.createdAt,
        updatedAt: generation.updatedAt
      }
    }
  } catch (error) {
    console.error('Failed to get generation status:', error)
    return {
      success: false,
      error: 'Failed to get generation status'
    }
  }
}

/**
 * Update the status of a generation
 *
 * @param id - Generation ID
 * @param newStatus - New status to set
 * @param deps - Service dependencies
 * @param options - Optional update data (URLs, error message, etc.)
 * @returns Service result with updated generation or error
 */
export async function updateGenerationStatus(
  id: string,
  newStatus: GenerationStatusType,
  deps: GenerationServiceDeps,
  options?: StatusUpdateOptions
): Promise<ServiceResult<GenerationData>> {
  try {
    // Get current status
    const current = await deps.prisma.generatedApp.findUnique({
      where: { id },
      select: { id: true, status: true }
    })

    if (!current) {
      return {
        success: false,
        error: 'Generation not found'
      }
    }

    // Validate status transition
    const currentStatus = current.status as GenerationStatusType
    if (!isValidStatusTransition(currentStatus, newStatus)) {
      return {
        success: false,
        error: `Invalid status transition from ${currentStatus} to ${newStatus}`
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status: newStatus
    }

    if (options?.errorMessage) {
      updateData.errorMessage = options.errorMessage
    }
    if (options?.sandboxUrl) {
      updateData.sandboxUrl = options.sandboxUrl
    }
    if (options?.githubRepoUrl) {
      updateData.githubRepoUrl = options.githubRepoUrl
    }
    if (options?.medplumProjectId) {
      updateData.medplumProjectId = options.medplumProjectId
    }
    if (options?.generatedCode) {
      updateData.generatedCode = options.generatedCode
    }

    // Update database
    const updated = await deps.prisma.generatedApp.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        status: true,
        fhirResources: true,
        sandboxUrl: true,
        githubRepoUrl: true,
        errorMessage: true,
        updatedAt: true
      }
    })

    return {
      success: true,
      data: {
        id: updated.id,
        status: updated.status,
        fhirResources: updated.fhirResources,
        sandboxUrl: updated.sandboxUrl,
        githubRepoUrl: updated.githubRepoUrl,
        errorMessage: updated.errorMessage,
        updatedAt: updated.updatedAt
      }
    }
  } catch (error) {
    console.error('Failed to update generation status:', error)
    return {
      success: false,
      error: 'Failed to update generation status'
    }
  }
}

/**
 * Get all generations for a user
 *
 * @param userId - User ID
 * @param deps - Service dependencies
 * @returns Service result with list of generations or error
 */
export async function getUserGenerations(
  userId: string,
  deps: GenerationServiceDeps
): Promise<ServiceResult<GenerationData[]>> {
  try {
    const generations = await deps.prisma.generatedApp.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        fhirResources: true,
        sandboxUrl: true,
        githubRepoUrl: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return {
      success: true,
      data: generations.map((g) => ({
        id: g.id,
        status: g.status,
        fhirResources: g.fhirResources,
        sandboxUrl: g.sandboxUrl,
        githubRepoUrl: g.githubRepoUrl,
        errorMessage: g.errorMessage,
        createdAt: g.createdAt,
        updatedAt: g.updatedAt
      }))
    }
  } catch (error) {
    console.error('Failed to get user generations:', error)
    return {
      success: false,
      error: 'Failed to get user generations'
    }
  }
}
