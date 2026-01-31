/**
 * OpenClaw Channels API
 *
 * GET /api/openclaw/channels - List user's channels
 * POST /api/openclaw/channels - Create a new channel
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  ChannelType,
  ChannelStatus,
  validateChannelConfig,
  generateWebhookUrl,
  generateWebhookSecret
} from '@/lib/openclaw/channels'

/**
 * GET - List user's messaging channels
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const channels = await prisma.messagingChannel.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        type: true,
        name: true,
        status: true,
        webhookUrl: true,
        lastError: true,
        lastErrorAt: true,
        createdAt: true,
        updatedAt: true,
        appChannels: {
          select: {
            generatedAppId: true,
            enabled: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ channels })

  } catch (error) {
    console.error('List channels error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Create a new messaging channel
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, name, config } = body

    // Validate channel type
    if (!type || !Object.values(ChannelType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid channel type' },
        { status: 400 }
      )
    }

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Channel name must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Validate config if provided
    if (config) {
      const validation = validateChannelConfig(type, config)
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid configuration', details: validation.errors },
          { status: 400 }
        )
      }
    }

    // Check for existing channel with same name and type
    const existing = await prisma.messagingChannel.findFirst({
      where: {
        userId: session.user.id,
        type,
        name: name.trim()
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A channel with this name and type already exists' },
        { status: 409 }
      )
    }

    // Generate webhook URL and secret
    const webhookSecret = generateWebhookSecret()

    // Create the channel
    const channel = await prisma.messagingChannel.create({
      data: {
        type,
        name: name.trim(),
        status: config ? ChannelStatus.CONFIGURING : ChannelStatus.PENDING,
        webhookSecret,
        credentials: config || undefined,
        userId: session.user.id
      },
      select: {
        id: true,
        type: true,
        name: true,
        status: true,
        createdAt: true
      }
    })

    // Generate the webhook URL now that we have the ID
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const webhookUrl = generateWebhookUrl(channel.id, baseUrl)

    // Update with webhook URL
    await prisma.messagingChannel.update({
      where: { id: channel.id },
      data: { webhookUrl }
    })

    return NextResponse.json({
      channel: {
        ...channel,
        webhookUrl
      },
      message: 'Channel created. Configure your messaging platform to send webhooks to the provided URL.'
    }, { status: 201 })

  } catch (error) {
    console.error('Create channel error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
