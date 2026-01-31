/**
 * OpenClaw Status API
 *
 * GET /api/openclaw/status/:id
 * Returns the status of a generation request including generated code when complete.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Get generation from database
    const generation = await prisma.generatedApp.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        fhirResources: true,
        generatedCode: true,
        sandboxUrl: true,
        githubRepoUrl: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    // Return status response with generated code if complete
    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      fhirResources: generation.fhirResources,
      generatedCode: generation.generatedCode,
      sandboxUrl: generation.sandboxUrl,
      githubRepoUrl: generation.githubRepoUrl,
      errorMessage: generation.errorMessage,
      createdAt: generation.createdAt,
      updatedAt: generation.updatedAt
    })

  } catch (error) {
    console.error('OpenClaw status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
