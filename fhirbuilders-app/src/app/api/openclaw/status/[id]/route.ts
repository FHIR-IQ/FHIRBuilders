/**
 * OpenClaw Status API
 *
 * GET /api/openclaw/status/:id
 * Returns the status of a generation request.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGenerationStatus } from '@/lib/openclaw/generation-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      )
    }

    // Get status using service
    const result = await getGenerationStatus(id, { prisma })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }

    // Return status response
    return NextResponse.json({
      id: result.data?.id,
      status: result.data?.status,
      fhirResources: result.data?.fhirResources,
      sandboxUrl: result.data?.sandboxUrl,
      githubRepoUrl: result.data?.githubRepoUrl,
      errorMessage: result.data?.errorMessage,
      createdAt: result.data?.createdAt,
      updatedAt: result.data?.updatedAt
    })

  } catch (error) {
    console.error('OpenClaw status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
