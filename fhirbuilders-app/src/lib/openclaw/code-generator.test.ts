/**
 * Code Generator Tests
 *
 * TDD: Tests for Claude-powered FHIR app code generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  generateAppCode,
  buildSystemPrompt,
  parseGeneratedCode,
  validateGeneratedCode,
  type GeneratedCodeOutput,
  type CodeGeneratorDeps
} from './code-generator'

// =====================================================
// Mock Dependencies
// =====================================================

const createMockDeps = (): CodeGeneratorDeps => ({
  anthropic: {
    messages: {
      create: vi.fn()
    }
  } as unknown as CodeGeneratorDeps['anthropic']
})

describe('Code Generator', () => {
  let mockDeps: CodeGeneratorDeps

  beforeEach(() => {
    mockDeps = createMockDeps()
    vi.clearAllMocks()
  })

  // =====================================================
  // System Prompt Building Tests
  // =====================================================

  describe('buildSystemPrompt', () => {
    it('should include FHIR resources in prompt', () => {
      const prompt = buildSystemPrompt(['Patient', 'MedicationRequest'])

      expect(prompt).toContain('Patient')
      expect(prompt).toContain('MedicationRequest')
    })

    it('should include Medplum SDK guidance', () => {
      const prompt = buildSystemPrompt(['Patient'])

      expect(prompt).toContain('@medplum/core')
      expect(prompt).toContain('@medplum/react')
    })

    it('should include TypeScript and React requirements', () => {
      const prompt = buildSystemPrompt(['Patient'])

      expect(prompt).toContain('TypeScript')
      expect(prompt).toContain('React')
    })

    it('should include output format specification', () => {
      const prompt = buildSystemPrompt(['Patient'])

      expect(prompt).toContain('JSON')
      expect(prompt).toContain('components')
      expect(prompt).toContain('pages')
    })

    it('should include FHIR best practices', () => {
      const prompt = buildSystemPrompt(['Patient', 'Observation'])

      expect(prompt).toContain('FHIR R4')
      expect(prompt).toContain('validation')
    })
  })

  // =====================================================
  // Code Generation Tests
  // =====================================================

  describe('generateAppCode', () => {
    it('should call Claude API with correct parameters', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify({
            appName: 'medication-tracker',
            description: 'A medication tracking app',
            components: [],
            pages: [],
            apiRoutes: []
          })
        }]
      }

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      await generateAppCode({
        prompt: 'Build a medication reminder app',
        fhirResources: ['Patient', 'MedicationRequest'],
        deps: mockDeps
      })

      expect(mockDeps.anthropic.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          model: expect.stringContaining('claude'),
          max_tokens: expect.any(Number),
          system: expect.any(String),
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'user',
              content: expect.stringContaining('medication reminder')
            })
          ])
        })
      )
    })

    it('should return generated code on success', async () => {
      const mockCode: GeneratedCodeOutput = {
        appName: 'medication-tracker',
        description: 'A medication tracking app',
        components: [
          {
            name: 'MedicationList',
            path: 'src/components/MedicationList.tsx',
            code: 'export function MedicationList() { return <div>Meds</div>; }'
          }
        ],
        pages: [
          {
            name: 'page',
            path: 'src/app/page.tsx',
            code: 'export default function Home() { return <MedicationList />; }'
          }
        ],
        apiRoutes: []
      }

      const mockResponse = {
        content: [{
          type: 'text',
          text: JSON.stringify(mockCode)
        }]
      }

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const result = await generateAppCode({
        prompt: 'Build a medication reminder app',
        fhirResources: ['Patient', 'MedicationRequest'],
        deps: mockDeps
      })

      expect(result.success).toBe(true)
      expect(result.data?.appName).toBe('medication-tracker')
      expect(result.data?.components).toHaveLength(1)
      expect(result.data?.pages).toHaveLength(1)
    })

    it('should handle API errors gracefully', async () => {
      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('API rate limit exceeded')
      )

      const result = await generateAppCode({
        prompt: 'Build a medication reminder app',
        fhirResources: ['Patient'],
        deps: mockDeps
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('generation failed')
    })

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        content: [{
          type: 'text',
          text: 'This is not valid JSON'
        }]
      }

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const result = await generateAppCode({
        prompt: 'Build a medication reminder app',
        fhirResources: ['Patient'],
        deps: mockDeps
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('parse')
    })

    it('should handle unexpected response type', async () => {
      const mockResponse = {
        content: [{
          type: 'image',
          data: 'base64...'
        }]
      }

      ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

      const result = await generateAppCode({
        prompt: 'Build a medication reminder app',
        fhirResources: ['Patient'],
        deps: mockDeps
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Unexpected response')
    })
  })

  // =====================================================
  // Code Parsing Tests
  // =====================================================

  describe('parseGeneratedCode', () => {
    it('should parse valid JSON response', () => {
      const json = JSON.stringify({
        appName: 'test-app',
        description: 'Test app',
        components: [],
        pages: [],
        apiRoutes: []
      })

      const result = parseGeneratedCode(json)

      expect(result.success).toBe(true)
      expect(result.data?.appName).toBe('test-app')
    })

    it('should extract JSON from markdown code block', () => {
      const response = `Here's the generated code:

\`\`\`json
{
  "appName": "test-app",
  "description": "Test app",
  "components": [],
  "pages": [],
  "apiRoutes": []
}
\`\`\`

This code includes...`

      const result = parseGeneratedCode(response)

      expect(result.success).toBe(true)
      expect(result.data?.appName).toBe('test-app')
    })

    it('should handle JSON with escaped characters', () => {
      const json = JSON.stringify({
        appName: 'test-app',
        description: 'A "quoted" app with newlines\nand tabs\t',
        components: [{
          name: 'Test',
          path: 'src/Test.tsx',
          code: 'const x = "hello\\nworld";'
        }],
        pages: [],
        apiRoutes: []
      })

      const result = parseGeneratedCode(json)

      expect(result.success).toBe(true)
      expect(result.data?.description).toContain('"quoted"')
    })

    it('should fail for invalid JSON', () => {
      const result = parseGeneratedCode('not json')

      expect(result.success).toBe(false)
      expect(result.error).toContain('Failed to parse')
    })

    it('should fail for incomplete structure', () => {
      const json = JSON.stringify({
        appName: 'test-app'
        // Missing required fields
      })

      const result = parseGeneratedCode(json)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid structure')
    })
  })

  // =====================================================
  // Code Validation Tests
  // =====================================================

  describe('validateGeneratedCode', () => {
    it('should validate complete code structure', () => {
      const code: GeneratedCodeOutput = {
        appName: 'medication-tracker',
        description: 'A medication tracking app',
        components: [
          { name: 'MedicationList', path: 'src/components/MedicationList.tsx', code: 'export...' }
        ],
        pages: [
          { name: 'page', path: 'src/app/page.tsx', code: 'export default...' }
        ],
        apiRoutes: []
      }

      const result = validateGeneratedCode(code)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing appName', () => {
      const code = {
        description: 'A medication tracking app',
        components: [],
        pages: [],
        apiRoutes: []
      } as GeneratedCodeOutput

      const result = validateGeneratedCode(code)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('appName is required')
    })

    it('should detect empty components and pages', () => {
      const code: GeneratedCodeOutput = {
        appName: 'test-app',
        description: 'Test',
        components: [],
        pages: [],
        apiRoutes: []
      }

      const result = validateGeneratedCode(code)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('at least one'))).toBe(true)
    })

    it('should validate component structure', () => {
      const code: GeneratedCodeOutput = {
        appName: 'test-app',
        description: 'Test',
        components: [
          { name: '', path: '', code: '' } // Invalid component
        ],
        pages: [
          { name: 'page', path: 'src/app/page.tsx', code: 'export...' }
        ],
        apiRoutes: []
      }

      const result = validateGeneratedCode(code)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.toLowerCase().includes('component'))).toBe(true)
    })

    it('should validate file paths', () => {
      const code: GeneratedCodeOutput = {
        appName: 'test-app',
        description: 'Test',
        components: [
          { name: 'Test', path: 'invalid path with spaces.tsx', code: 'export...' }
        ],
        pages: [
          { name: 'page', path: 'src/app/page.tsx', code: 'export...' }
        ],
        apiRoutes: []
      }

      const result = validateGeneratedCode(code)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('path'))).toBe(true)
    })

    it('should validate TypeScript/TSX file extensions', () => {
      const code: GeneratedCodeOutput = {
        appName: 'test-app',
        description: 'Test',
        components: [
          { name: 'Test', path: 'src/components/Test.js', code: 'export...' } // Should be .tsx
        ],
        pages: [
          { name: 'page', path: 'src/app/page.tsx', code: 'export...' }
        ],
        apiRoutes: []
      }

      const result = validateGeneratedCode(code)

      // Allow .js for now but prefer .tsx
      expect(result.warnings?.some(w => w.includes('TypeScript'))).toBe(true)
    })
  })
})

// =====================================================
// Integration Tests
// =====================================================

describe('Code Generator - Integration', () => {
  it('should handle full generation workflow', async () => {
    const mockDeps = createMockDeps()

    const mockCode: GeneratedCodeOutput = {
      appName: 'med-reminder',
      description: 'A medication reminder app for patients',
      components: [
        {
          name: 'MedicationCard',
          path: 'src/components/MedicationCard.tsx',
          code: `import { MedicationRequest } from '@medplum/fhirtypes';
export function MedicationCard({ med }: { med: MedicationRequest }) {
  return <div>{med.medicationCodeableConcept?.text}</div>;
}`
        }
      ],
      pages: [
        {
          name: 'page',
          path: 'src/app/page.tsx',
          code: `'use client';
import { MedicationCard } from '@/components/MedicationCard';
export default function Home() {
  return <main><h1>My Medications</h1></main>;
}`
        }
      ],
      apiRoutes: [
        {
          name: 'medications',
          path: 'src/app/api/medications/route.ts',
          code: `import { NextResponse } from 'next/server';
export async function GET() {
  return NextResponse.json({ medications: [] });
}`
        }
      ]
    }

    const mockResponse = {
      content: [{
        type: 'text',
        text: JSON.stringify(mockCode)
      }]
    }

    ;(mockDeps.anthropic.messages.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse)

    const result = await generateAppCode({
      prompt: 'Build a medication reminder app that shows patients their prescriptions',
      fhirResources: ['Patient', 'MedicationRequest', 'MedicationStatement'],
      deps: mockDeps
    })

    expect(result.success).toBe(true)
    expect(result.data?.appName).toBe('med-reminder')
    expect(result.data?.components).toHaveLength(1)
    expect(result.data?.pages).toHaveLength(1)
    expect(result.data?.apiRoutes).toHaveLength(1)

    // Validate the generated code
    const validation = validateGeneratedCode(result.data!)
    expect(validation.valid).toBe(true)
  })
})
