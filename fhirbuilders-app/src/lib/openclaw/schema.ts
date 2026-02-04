/**
 * OpenClaw Schema Types and Validation
 *
 * Type definitions and validation logic for the GeneratedApp model
 * that will be used with Prisma.
 */

import { detectFhirResources } from './fhir-resources'

/**
 * Generation status enum
 * Matches the Prisma enum definition
 */
export const GenerationStatus = {
  PENDING: 'PENDING',
  ANALYZING: 'ANALYZING',
  GENERATING: 'GENERATING',
  DEPLOYING: 'DEPLOYING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const

export type GenerationStatusType = (typeof GenerationStatus)[keyof typeof GenerationStatus]

/**
 * Input type for creating a GeneratedApp
 */
export interface GeneratedAppInput {
  prompt: string
  userId: string
}

/**
 * Extended input with detected resources
 */
export interface GeneratedAppCreateInput extends GeneratedAppInput {
  fhirResources: string[]
  status: GenerationStatusType
}

/**
 * Output type for GeneratedApp (matches Prisma model)
 */
export interface GeneratedAppOutput {
  id: string
  prompt: string
  userId: string
  isDemo: boolean
  status: GenerationStatusType
  fhirResources: string[]
  generatedCode: Record<string, unknown> | null
  githubRepoUrl: string | null
  sandboxUrl: string | null
  medplumProjectId: string | null
  appId: string | null
  errorMessage: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Minimum prompt length
 */
const MIN_PROMPT_LENGTH = 20

/**
 * Maximum prompt length
 */
const MAX_PROMPT_LENGTH = 10000

/**
 * Validate GeneratedApp input
 *
 * @param input - The input to validate
 * @returns Validation result with errors if any
 */
export function validateGeneratedAppInput(
  input: GeneratedAppInput
): ValidationResult {
  const errors: string[] = []
  const trimmedPrompt = input.prompt?.trim() || ''

  // Validate prompt
  if (!trimmedPrompt) {
    errors.push('Prompt is required')
  } else {
    if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
      errors.push(`Prompt must be at least ${MIN_PROMPT_LENGTH} characters`)
    }
    if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
      errors.push(`Prompt must be less than ${MAX_PROMPT_LENGTH} characters`)
    }
  }

  // Validate userId
  if (!input.userId?.trim()) {
    errors.push('User ID is required')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Create a GeneratedApp input with detected FHIR resources
 *
 * @param input - Basic input with prompt and userId
 * @returns Extended input ready for database insertion
 */
export function createGeneratedAppInput(
  input: GeneratedAppInput
): GeneratedAppCreateInput {
  const trimmedPrompt = input.prompt.trim()

  return {
    prompt: trimmedPrompt,
    userId: input.userId.trim(),
    fhirResources: detectFhirResources(trimmedPrompt),
    status: GenerationStatus.PENDING
  }
}

/**
 * Status transition validation
 * Ensures status changes follow valid progression
 */
export const VALID_STATUS_TRANSITIONS: Record<GenerationStatusType, GenerationStatusType[]> = {
  [GenerationStatus.PENDING]: [GenerationStatus.ANALYZING, GenerationStatus.FAILED],
  [GenerationStatus.ANALYZING]: [GenerationStatus.GENERATING, GenerationStatus.FAILED],
  [GenerationStatus.GENERATING]: [GenerationStatus.DEPLOYING, GenerationStatus.FAILED],
  [GenerationStatus.DEPLOYING]: [GenerationStatus.COMPLETED, GenerationStatus.FAILED],
  [GenerationStatus.COMPLETED]: [], // Terminal state
  [GenerationStatus.FAILED]: [] // Terminal state
}

/**
 * Check if a status transition is valid
 *
 * @param from - Current status
 * @param to - Target status
 * @returns true if transition is valid
 */
export function isValidStatusTransition(
  from: GenerationStatusType,
  to: GenerationStatusType
): boolean {
  return VALID_STATUS_TRANSITIONS[from].includes(to)
}

/**
 * API response type for generation endpoint
 */
export interface GenerateApiResponse {
  id: string
  status: GenerationStatusType
  fhirResources: string[]
  message?: string
}

/**
 * API error response type
 */
export interface GenerateApiError {
  error: string
  details?: string[]
}
