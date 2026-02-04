/**
 * OpenClaw Status API
 *
 * GET /api/openclaw/status/:id
 * Returns the status of a generation request including generated code when complete.
 * Demo generations are accessible without authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
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
        userId: true,
        isDemo: true,
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

    // For non-demo generations, require auth + ownership
    if (!generation.isDemo) {
      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'Unauthorized. Please sign in.' },
          { status: 401 }
        )
      }
      if (generation.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Forbidden. You can only view your own generations.' },
          { status: 403 }
        )
      }
    }
    // Demo generations: accessible by anyone with the ID (CUIDs are unguessable)

    return NextResponse.json({
      id: generation.id,
      status: generation.status,
      fhirResources: generation.fhirResources,
      generatedCode: generation.generatedCode,
      sandboxUrl: generation.sandboxUrl,
      githubRepoUrl: generation.githubRepoUrl,
      errorMessage: generation.errorMessage,
      isDemo: generation.isDemo,
      createdAt: generation.createdAt,
      updatedAt: generation.updatedAt,
    })

  } catch (error) {
    console.error('OpenClaw status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
