/**
 * OpenClaw Generate API
 *
 * POST /api/openclaw/generate
 * Creates a new app generation from a natural language prompt.
 * Starts async code generation with Claude AI.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyRateLimit } from '@/lib/rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { startGeneration, processGeneration } from '@/lib/openclaw/orchestrator'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  // Apply rate limiting (10 requests per minute)
  const rateLimitResult = applyRateLimit(request, "generate");
  if (rateLimitResult) return rateLimitResult;

  try {
    // Check authentication
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to generate apps.' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { prompt, templateId } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Create generation record
    const result = await startGeneration({
      prompt,
      userId: session.user.id,
      deps: { prisma, anthropic }
    })

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Failed to start generation' },
        { status: 400 }
      )
    }

    // Start async code generation (fire and forget)
    // Template resolution happens in the orchestrator
    processGeneration(
      {
        id: result.data.id,
        prompt,
        fhirResources: result.data.fhirResources,
        userId: session.user.id,
        templateId: templateId || undefined,
      },
      { prisma, anthropic }
    ).catch((err) => {
      console.error('Background generation failed:', err)
    })

    // Return immediate response with generation ID
    return NextResponse.json({
      id: result.data.id,
      status: result.data.status,
      fhirResources: result.data.fhirResources,
      message: 'Generation started. Poll /api/openclaw/status/:id for updates.'
    })

  } catch (error) {
    console.error('OpenClaw generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
