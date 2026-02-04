/**
 * OpenClaw Generate API
 *
 * POST /api/openclaw/generate
 * Creates a new app generation from a natural language prompt.
 * Starts async code generation with Claude AI.
 * Supports both authenticated and anonymous (demo) users.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyRateLimit } from '@/lib/rate-limit'
import Anthropic from '@anthropic-ai/sdk'
import { startGeneration, processGeneration } from '@/lib/openclaw/orchestrator'
import { ensureDemoUser } from '@/lib/demo-user'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  // Check authentication (optional - anonymous users get demo mode)
  const session = await auth()
  const isAuthenticated = !!session?.user?.id

  // Apply rate limiting - stricter for anonymous
  const rateLimitResult = applyRateLimit(
    request,
    isAuthenticated ? "generate" : "demoGenerate"
  )
  if (rateLimitResult) return rateLimitResult

  try {
    // Parse request body
    const body = await request.json()
    const { prompt, templateId } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Resolve user ID: real user or demo user
    let effectiveUserId: string
    let isDemo = false

    if (isAuthenticated && session?.user?.id) {
      effectiveUserId = session.user.id
    } else {
      effectiveUserId = await ensureDemoUser()
      isDemo = true
    }

    // Create generation record
    const result = await startGeneration({
      prompt,
      userId: effectiveUserId,
      isDemo,
      deps: { prisma, anthropic }
    })

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Failed to start generation' },
        { status: 400 }
      )
    }

    // Start async code generation (fire and forget)
    processGeneration(
      {
        id: result.data.id,
        prompt,
        fhirResources: result.data.fhirResources,
        userId: effectiveUserId,
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
      isDemo,
      message: isDemo
        ? 'Demo generation started. Sign in to save your apps. Poll /api/openclaw/status/:id for updates.'
        : 'Generation started. Poll /api/openclaw/status/:id for updates.'
    })

  } catch (error) {
    console.error('OpenClaw generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
