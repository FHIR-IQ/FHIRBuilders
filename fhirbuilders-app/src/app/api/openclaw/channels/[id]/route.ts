/**
 * OpenClaw Channel API
 *
 * GET /api/openclaw/channels/:id - Get channel details
 * PATCH /api/openclaw/channels/:id - Update channel
 * DELETE /api/openclaw/channels/:id - Delete channel
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  ChannelStatus,
  validateChannelConfig
} from '@/lib/openclaw/channels'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET - Get channel details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const channel = await prisma.messagingChannel.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        name: true,
        status: true,
        webhookUrl: true,
        config: true,
        lastError: true,
        lastErrorAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        appChannels: {
          include: {
            generatedApp: {
              select: {
                id: true,
                prompt: true,
                status: true
              }
            }
          }
        },
        _count: {
          select: { messages: true }
        }
      }
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (channel.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Remove userId from response
    const { userId: _, ...channelData } = channel

    return NextResponse.json({ channel: channelData })

  } catch (error) {
    console.error('Get channel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH - Update channel
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { name, config, status } = body

    // Get existing channel
    const channel = await prisma.messagingChannel.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        userId: true,
        status: true
      }
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (channel.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Build update data
    const updateData: Record<string, unknown> = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Channel name must be at least 2 characters' },
          { status: 400 }
        )
      }
      updateData.name = name.trim()
    }

    if (config !== undefined) {
      const validation = validateChannelConfig(channel.type, config)
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid configuration', details: validation.errors },
          { status: 400 }
        )
      }
      updateData.credentials = config
      // If configuring, set status to CONFIGURING
      if (channel.status === ChannelStatus.PENDING) {
        updateData.status = ChannelStatus.CONFIGURING
      }
    }

    if (status !== undefined) {
      // Only allow certain status transitions
      const allowedStatuses = [ChannelStatus.ACTIVE, ChannelStatus.PAUSED]
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        )
      }
      updateData.status = status
    }

    // Update channel
    const updated = await prisma.messagingChannel.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        type: true,
        name: true,
        status: true,
        webhookUrl: true,
        updatedAt: true
      }
    })

    return NextResponse.json({ channel: updated })

  } catch (error) {
    console.error('Update channel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete channel
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Get channel
    const channel = await prisma.messagingChannel.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true
      }
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (channel.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Delete channel (cascades to messages and app links)
    await prisma.messagingChannel.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Channel deleted' })

  } catch (error) {
    console.error('Delete channel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
