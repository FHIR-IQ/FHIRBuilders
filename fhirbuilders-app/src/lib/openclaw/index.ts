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
