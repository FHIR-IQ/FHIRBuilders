/**
 * Code Generator
 *
 * Uses Claude AI to generate FHIR healthcare application code
 * from natural language prompts.
 */

import type Anthropic from '@anthropic-ai/sdk'

/**
 * Generated code file structure
 */
export interface GeneratedFile {
  name: string
  path: string
  code: string
}

/**
 * Complete generated code output
 */
export interface GeneratedCodeOutput {
  appName: string
  description: string
  components: GeneratedFile[]
  pages: GeneratedFile[]
  apiRoutes: GeneratedFile[]
}

/**
 * Code generator dependencies
 */
export interface CodeGeneratorDeps {
  anthropic: Anthropic
}

/**
 * Code generation input
 */
export interface CodeGenerationInput {
  prompt: string
  fhirResources: string[]
  deps: CodeGeneratorDeps
  model?: string
}

/**
 * Result type for code generation
 */
export interface CodeGenerationResult {
  success: boolean
  data?: GeneratedCodeOutput
  error?: string
}

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings?: string[]
}

/**
 * Build the system prompt for Claude
 */
export function buildSystemPrompt(fhirResources: string[]): string {
  return `You are an expert FHIR healthcare application developer.
You generate React components and API routes for Next.js apps using Medplum.

## FHIR Resources to use
${fhirResources.map(r => `- ${r}`).join('\n')}

## Technology Stack
- Next.js 14+ with App Router
- React 18+ with TypeScript
- @medplum/core and @medplum/react for FHIR operations
- @medplum/fhirtypes for TypeScript types
- Tailwind CSS for styling
- FHIR R4 specification

## Code Requirements
1. Use TypeScript with proper FHIR types from @medplum/fhirtypes
2. Use @medplum/react components where possible (ResourceTable, CodeableConceptDisplay, etc.)
3. Handle loading and error states gracefully
4. Include proper FHIR resource validation
5. Use "use client" directive for interactive components
6. Follow Next.js App Router conventions

## Output Format
Return ONLY valid JSON with this exact structure:
{
  "appName": "kebab-case-app-name",
  "description": "One sentence description of the app",
  "components": [
    {
      "name": "ComponentName",
      "path": "src/components/ComponentName.tsx",
      "code": "// Full TypeScript/React code here"
    }
  ],
  "pages": [
    {
      "name": "page",
      "path": "src/app/page.tsx",
      "code": "// Full page component code"
    }
  ],
  "apiRoutes": [
    {
      "name": "route",
      "path": "src/app/api/resource/route.ts",
      "code": "// Full API route code"
    }
  ]
}

## Important
- Generate complete, working code - no placeholders or TODOs
- Include all necessary imports
- Use proper error handling
- Follow healthcare application best practices
- Return ONLY the JSON, no explanatory text`
}

/**
 * Generate application code using Claude
 */
export async function generateAppCode(
  input: CodeGenerationInput
): Promise<CodeGenerationResult> {
  const { prompt, fhirResources, deps, model = 'claude-sonnet-4-20250514' } = input

  try {
    const systemPrompt = buildSystemPrompt(fhirResources)

    const response = await deps.anthropic.messages.create({
      model,
      max_tokens: 8000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Generate a FHIR healthcare application based on this description:\n\n${prompt}\n\nReturn only valid JSON.`
        }
      ]
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      return {
        success: false,
        error: 'Unexpected response type from Claude'
      }
    }

    const parseResult = parseGeneratedCode(content.text)
    if (!parseResult.success) {
      return parseResult
    }

    return {
      success: true,
      data: parseResult.data
    }
  } catch (error) {
    console.error('Code generation failed:', error)
    return {
      success: false,
      error: `Code generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Parse generated code from Claude response
 */
export function parseGeneratedCode(response: string): CodeGenerationResult {
  try {
    // Try to extract JSON from markdown code blocks
    let jsonStr = response

    // Check for ```json ... ``` blocks
    const jsonBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim()
    }

    // Try to find JSON object in response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonStr = jsonMatch[0]
    }

    const parsed = JSON.parse(jsonStr) as GeneratedCodeOutput

    // Validate structure
    if (!parsed.appName || !parsed.components || !parsed.pages) {
      return {
        success: false,
        error: 'Invalid structure: missing required fields (appName, components, pages)'
      }
    }

    return {
      success: true,
      data: parsed
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse generated code: ${error instanceof Error ? error.message : 'Invalid JSON'}`
    }
  }
}

/**
 * Validate generated code structure and quality
 */
export function validateGeneratedCode(code: GeneratedCodeOutput): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate appName
  if (!code.appName) {
    errors.push('appName is required')
  } else if (!/^[a-z0-9-]+$/.test(code.appName)) {
    errors.push('appName must be kebab-case (lowercase letters, numbers, and hyphens)')
  }

  // Validate description
  if (!code.description) {
    errors.push('description is required')
  }

  // Validate components and pages exist
  const hasComponents = code.components && code.components.length > 0
  const hasPages = code.pages && code.pages.length > 0

  if (!hasComponents && !hasPages) {
    errors.push('Must have at least one component or page')
  }

  // Validate each component
  if (code.components) {
    code.components.forEach((comp, index) => {
      if (!comp.name) {
        errors.push(`Component ${index}: name is required`)
      }
      if (!comp.path) {
        errors.push(`Component ${index}: path is required`)
      } else {
        // Validate path format
        if (comp.path.includes(' ')) {
          errors.push(`Component ${index}: path cannot contain spaces`)
        }
        // Check for TypeScript extension
        if (!comp.path.endsWith('.tsx') && !comp.path.endsWith('.ts')) {
          if (comp.path.endsWith('.js') || comp.path.endsWith('.jsx')) {
            warnings.push(`Component ${index}: Consider using TypeScript (.tsx) instead of JavaScript`)
          }
        }
      }
      if (!comp.code) {
        errors.push(`Component ${index}: code is required`)
      }
    })
  }

  // Validate each page
  if (code.pages) {
    code.pages.forEach((page, index) => {
      if (!page.name) {
        errors.push(`Page ${index}: name is required`)
      }
      if (!page.path) {
        errors.push(`Page ${index}: path is required`)
      } else if (page.path.includes(' ')) {
        errors.push(`Page ${index}: path cannot contain spaces`)
      }
      if (!page.code) {
        errors.push(`Page ${index}: code is required`)
      }
    })
  }

  // Validate API routes
  if (code.apiRoutes) {
    code.apiRoutes.forEach((route, index) => {
      if (!route.name) {
        errors.push(`API Route ${index}: name is required`)
      }
      if (!route.path) {
        errors.push(`API Route ${index}: path is required`)
      } else if (route.path.includes(' ')) {
        errors.push(`API Route ${index}: path cannot contain spaces`)
      }
      if (!route.code) {
        errors.push(`API Route ${index}: code is required`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}
