/**
 * Generation Orchestrator
 *
 * Orchestrates the async generation workflow, coordinating
 * between database operations, Claude API, and status updates.
 */

import type { PrismaClient, Prisma } from '@prisma/client'
import type Anthropic from '@anthropic-ai/sdk'
import { detectFhirResources } from './fhir-resources'
import { validateGeneratedAppInput, GenerationStatus, type GenerationStatusType } from './schema'
import { generateAppCode, type GeneratedCodeOutput } from './code-generator'
import { getTemplate, getTemplateForResources } from './templates'

/**
 * Orchestrator dependencies
 */
export interface OrchestratorDeps {
  prisma: PrismaClient
  anthropic: Anthropic
  onStatusChange?: (id: string, status: GenerationStatusType, error?: string) => void
}

/**
 * Generation job data
 */
export interface GenerationJob {
  id: string
  prompt: string
  fhirResources: string[]
  userId: string
  templateId?: string
}

/**
 * Start generation input
 */
export interface StartGenerationInput {
  prompt: string
  userId: string
  deps: OrchestratorDeps
}

/**
 * Service result type
 */
export interface OrchestratorResult<T> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Generation data returned after starting
 */
export interface GenerationStartData {
  id: string
  status: GenerationStatusType
  fhirResources: string[]
}

/**
 * Start a new generation
 *
 * Creates a database record and returns immediately.
 * Use processGeneration to run the actual generation asynchronously.
 */
export async function startGeneration(
  input: StartGenerationInput
): Promise<OrchestratorResult<GenerationStartData>> {
  const { prompt, userId, deps } = input

  // Validate input
  const validation = validateGeneratedAppInput({ prompt, userId })
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join(', ')
    }
  }

  try {
    // Detect FHIR resources from prompt
    const fhirResources = detectFhirResources(prompt.trim())

    // Create database record
    const created = await deps.prisma.generatedApp.create({
      data: {
        prompt: prompt.trim(),
        userId,
        status: GenerationStatus.PENDING,
        fhirResources
      }
    })

    return {
      success: true,
      data: {
        id: created.id,
        status: created.status as GenerationStatusType,
        fhirResources: created.fhirResources
      }
    }
  } catch (error) {
    console.error('Failed to start generation:', error)
    return {
      success: false,
      error: 'Failed to start generation. Please try again.'
    }
  }
}

/**
 * Update generation status in database
 */
async function updateStatus(
  id: string,
  status: GenerationStatusType,
  deps: OrchestratorDeps,
  options?: {
    errorMessage?: string
    generatedCode?: GeneratedCodeOutput
  }
): Promise<void> {
  const data: Record<string, unknown> = { status }

  if (options?.errorMessage) {
    data.errorMessage = options.errorMessage
  }
  if (options?.generatedCode) {
    data.generatedCode = options.generatedCode as unknown as Prisma.InputJsonValue
  }

  await deps.prisma.generatedApp.update({
    where: { id },
    data
  })

  // Notify status change
  deps.onStatusChange?.(id, status, options?.errorMessage)
}

/**
 * Process a generation job
 *
 * This function handles the full generation workflow:
 * 1. ANALYZING - Analyze prompt and detect resources
 * 2. GENERATING - Generate code via Claude API
 * 3. DEPLOYING - (future) Deploy to sandbox
 * 4. COMPLETED - Mark as complete
 *
 * On error, sets status to FAILED with error message.
 */
export async function processGeneration(
  job: GenerationJob,
  deps: OrchestratorDeps
): Promise<void> {
  const { id, prompt, fhirResources } = job

  try {
    // Verify generation exists
    const existing = await deps.prisma.generatedApp.findUnique({
      where: { id }
    })

    if (!existing) {
      console.error(`Generation ${id} not found`)
      return
    }

    // Step 1: ANALYZING
    await updateStatus(id, GenerationStatus.ANALYZING, deps)

    // Resolve template: prefer explicit templateId, fall back to auto-detect
    const template = job.templateId
      ? getTemplate(job.templateId)
      : getTemplateForResources(fhirResources)

    // Extract template files as reference code for Claude
    const templateFiles: Record<string, string> | undefined = template
      ? Object.fromEntries(template.files.map(f => [f.path, f.code]))
      : undefined

    // Step 2: GENERATING
    await updateStatus(id, GenerationStatus.GENERATING, deps)

    // Generate code via Claude with template reference
    const generationResult = await generateAppCode({
      prompt,
      fhirResources,
      deps: { anthropic: deps.anthropic },
      templateFiles,
    })

    if (!generationResult.success || !generationResult.data) {
      throw new Error(generationResult.error || 'Code generation failed')
    }

    // Step 3: DEPLOYING (placeholder for future sandbox deployment)
    await updateStatus(id, GenerationStatus.DEPLOYING, deps)

    // Store generated code
    await deps.prisma.generatedApp.update({
      where: { id },
      data: {
        generatedCode: generationResult.data as unknown as Prisma.InputJsonValue
      }
    })

    // Step 4: COMPLETED
    await updateStatus(id, GenerationStatus.COMPLETED, deps)
  } catch (error) {
    console.error(`Generation ${id} failed:`, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await updateStatus(id, GenerationStatus.FAILED, deps, { errorMessage })
  }
}

/**
 * Start and process generation in one call
 *
 * This is a convenience function that starts a generation
 * and immediately begins processing. Useful for async/await patterns.
 */
export async function runGeneration(
  input: StartGenerationInput
): Promise<OrchestratorResult<GenerationStartData>> {
  const startResult = await startGeneration(input)

  if (!startResult.success || !startResult.data) {
    return startResult
  }

  // Start processing in the background (don't await)
  const job: GenerationJob = {
    id: startResult.data.id,
    prompt: input.prompt.trim(),
    fhirResources: startResult.data.fhirResources,
    userId: input.userId
  }

  // Fire and forget - processing happens async
  processGeneration(job, input.deps).catch(error => {
    console.error('Background generation failed:', error)
  })

  return startResult
}
