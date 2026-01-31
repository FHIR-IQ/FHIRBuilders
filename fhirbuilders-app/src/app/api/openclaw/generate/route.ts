/**
 * OpenClaw Generate API
 *
 * POST /api/openclaw/generate
 * Creates a new app generation from a natural language prompt.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createGeneration } from '@/lib/openclaw/generation-service'

export async function POST(request: NextRequest) {
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
    const { prompt } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Create generation using service
    const result = await createGeneration(
      {
        prompt,
        userId: session.user.id
      },
      { prisma }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Return success response
    return NextResponse.json({
      id: result.data?.id,
      status: result.data?.status,
      fhirResources: result.data?.fhirResources,
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
