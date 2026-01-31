/**
 * OpenClaw - AI-Powered FHIR App Builder
 *
 * This module provides the core functionality for generating
 * FHIR healthcare applications from natural language prompts.
 */

// FHIR Resource Detection
export {
  detectFhirResources,
  validateFhirResources,
  getFhirResourceDescription,
  getMatchingUseCases,
  FHIR_USE_CASES,
  VALID_FHIR_R4_RESOURCES,
  FHIR_RESOURCE_DESCRIPTIONS,
  type FhirUseCase
} from './fhir-resources'

// Schema Types and Validation
export {
  GenerationStatus,
  validateGeneratedAppInput,
  createGeneratedAppInput,
  isValidStatusTransition,
  VALID_STATUS_TRANSITIONS,
  type GenerationStatusType,
  type GeneratedAppInput,
  type GeneratedAppCreateInput,
  type GeneratedAppOutput,
  type ValidationResult,
  type GenerateApiResponse,
  type GenerateApiError
} from './schema'

// Generation Service
export {
  createGeneration,
  getGenerationStatus,
  updateGenerationStatus,
  getUserGenerations,
  type GenerationServiceDeps,
  type ServiceResult,
  type GenerationData,
  type StatusUpdateOptions
} from './generation-service'

// Code Generator (Claude AI integration)
export {
  generateAppCode,
  buildSystemPrompt,
  parseGeneratedCode,
  validateGeneratedCode,
  type GeneratedFile,
  type GeneratedCodeOutput,
  type CodeGeneratorDeps,
  type CodeGenerationInput,
  type CodeGenerationResult,
  type ValidationResult as CodeValidationResult
} from './code-generator'

// Code Templates
export {
  getTemplate,
  getTemplateForResources,
  getAllTemplates,
  applyTemplate,
  type TemplateFile,
  type AppTemplate,
  type TemplateOptions,
  type AppliedTemplate
} from './templates'

// Generation Orchestrator (async workflow)
export {
  startGeneration,
  processGeneration,
  runGeneration,
  type OrchestratorDeps,
  type GenerationJob,
  type StartGenerationInput,
  type OrchestratorResult,
  type GenerationStartData
} from './orchestrator'
