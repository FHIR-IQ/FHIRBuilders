/**
 * OpenClaw Generate API
 *
 * POST /api/openclaw/generate
 * Creates a new app generation from a natural language prompt.
 * Supports BYOK: user-provided Anthropic or OpenAI key, or server ANTHROPIC_API_KEY.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { applyRateLimit } from '@/lib/rate-limit'
import { createAIClient, type AIProvider } from '@/lib/openclaw/ai-client'
import { startGeneration, processGeneration } from '@/lib/openclaw/orchestrator'
import { ensureDemoUser } from '@/lib/demo-user'

// LLM app generation can run well past the 60s Hobby cap. Pro allows up to 300s.
export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(request: NextRequest) {
  const session = await auth()
  const isAuthenticated = !!session?.user?.id

  const rateLimitResult = applyRateLimit(
    request,
    isAuthenticated ? "generate" : "demoGenerate"
  )
  if (rateLimitResult) return rateLimitResult

  try {
    const body = await request.json()
    const { prompt, templateId, userApiKey, userProvider } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    // Resolve AI key: BYOK takes precedence over server env var
    let aiKey: string | undefined
    let aiProvider: AIProvider = "anthropic"

    if (userApiKey && typeof userApiKey === "string" && userApiKey.trim()) {
      aiKey = userApiKey.trim()
      aiProvider = userProvider === "openai" ? "openai" : "anthropic"
    } else if (process.env.ANTHROPIC_API_KEY) {
      aiKey = process.env.ANTHROPIC_API_KEY
      aiProvider = "anthropic"
    }

    if (!aiKey) {
      return NextResponse.json(
        {
          error: 'Connect your Anthropic or OpenAI API key to generate apps.',
          requiresApiKey: true,
        },
        { status: 503 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const aiClient = createAIClient(aiProvider, aiKey) as any

    // Resolve user identity
    let effectiveUserId: string
    let isDemo = false

    if (isAuthenticated && session?.user?.id) {
      effectiveUserId = session.user.id
    } else {
      effectiveUserId = await ensureDemoUser()
      isDemo = true
    }

    const result = await startGeneration({
      prompt,
      userId: effectiveUserId,
      isDemo,
      deps: { prisma, anthropic: aiClient },
    })

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || 'Failed to start generation' },
        { status: 400 }
      )
    }

    processGeneration(
      {
        id: result.data.id,
        prompt,
        fhirResources: result.data.fhirResources,
        userId: effectiveUserId,
        templateId: templateId || undefined,
      },
      { prisma, anthropic: aiClient }
    ).catch((err) => {
      console.error('Background generation failed:', err)
    })

    return NextResponse.json({
      id: result.data.id,
      status: result.data.status,
      fhirResources: result.data.fhirResources,
      isDemo,
      message: isDemo
        ? 'Demo generation started. Sign in to save your apps.'
        : 'Generation started.',
    })
  } catch (error) {
    console.error('OpenClaw generate error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
