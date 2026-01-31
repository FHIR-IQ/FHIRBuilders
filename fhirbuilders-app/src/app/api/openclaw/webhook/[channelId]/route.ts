/**
 * OpenClaw Webhook API
 *
 * POST /api/openclaw/webhook/:channelId
 * Receives inbound messages from messaging platforms.
 *
 * GET /api/openclaw/webhook/:channelId
 * Handles webhook verification (WhatsApp, Slack URL verification, etc.)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHmac, timingSafeEqual } from 'crypto'
import {
  ChannelType,
  parseInboundMessage,
  MessageDirection
} from '@/lib/openclaw/channels'

type RouteParams = { params: Promise<{ channelId: string }> }

/**
 * Verify webhook signature based on channel type
 */
function verifyWebhookSignature(
  channelType: string,
  secret: string,
  payload: string,
  signature: string | null
): boolean {
  if (!signature || !secret) return false

  try {
    switch (channelType) {
      case ChannelType.SLACK: {
        // Slack uses HMAC-SHA256 with v0= prefix
        const [version, hash] = signature.split('=')
        if (version !== 'v0') return false
        const computed = createHmac('sha256', secret)
          .update(payload)
          .digest('hex')
        return timingSafeEqual(Buffer.from(hash), Buffer.from(computed))
      }

      case ChannelType.WHATSAPP: {
        // WhatsApp uses HMAC-SHA256 with sha256= prefix
        const hash = signature.replace('sha256=', '')
        const computed = createHmac('sha256', secret)
          .update(payload)
          .digest('hex')
        return timingSafeEqual(Buffer.from(hash), Buffer.from(computed))
      }

      case ChannelType.TELEGRAM: {
        // Telegram uses secret token in header
        return signature === secret
      }

      default:
        // For other channels, simple string comparison
        return signature === secret
    }
  } catch {
    return false
  }
}

/**
 * GET - Webhook verification (WhatsApp challenge, Slack URL verification)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { channelId } = await params
    const { searchParams } = new URL(request.url)

    // Get channel from database
    const channel = await prisma.messagingChannel.findUnique({
      where: { id: channelId },
      select: {
        id: true,
        type: true,
        config: true,
        webhookSecret: true
      }
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    // WhatsApp verification challenge
    if (channel.type === ChannelType.WHATSAPP) {
      const mode = searchParams.get('hub.mode')
      const token = searchParams.get('hub.verify_token')
      const challenge = searchParams.get('hub.challenge')

      const config = channel.config as Record<string, unknown> | null
      const verifyToken = config?.verifyToken as string | undefined

      if (mode === 'subscribe' && token === verifyToken) {
        return new NextResponse(challenge, { status: 200 })
      }
      return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
    }

    // Telegram webhook info
    if (channel.type === ChannelType.TELEGRAM) {
      return NextResponse.json({
        ok: true,
        description: 'Webhook is active'
      })
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('Webhook GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST - Receive inbound messages
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { channelId } = await params
    const rawBody = await request.text()

    // Get channel from database
    const channel = await prisma.messagingChannel.findUnique({
      where: { id: channelId },
      select: {
        id: true,
        type: true,
        status: true,
        webhookSecret: true,
        config: true,
        userId: true,
        appChannels: {
          where: { enabled: true },
          include: {
            generatedApp: {
              select: {
                id: true,
                prompt: true,
                generatedCode: true
              }
            }
          }
        }
      }
    })

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      )
    }

    // Verify webhook signature for secure channels
    const signature = request.headers.get('x-slack-signature') ||
                     request.headers.get('x-hub-signature-256') ||
                     request.headers.get('x-telegram-bot-api-secret-token')

    if (channel.webhookSecret && signature) {
      const isValid = verifyWebhookSignature(
        channel.type,
        channel.webhookSecret,
        rawBody,
        signature
      )

      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
      }
    }

    // Handle Slack URL verification challenge
    const payload = JSON.parse(rawBody)
    if (channel.type === ChannelType.SLACK && payload.type === 'url_verification') {
      return NextResponse.json({ challenge: payload.challenge })
    }

    // Parse the inbound message
    const message = parseInboundMessage(channel.type as ChannelType, payload)

    // Skip if no content (could be typing indicators, reactions, etc.)
    if (!message.content || message.content.trim() === '') {
      return NextResponse.json({ status: 'ignored' })
    }

    // Store the message
    await prisma.channelMessage.create({
      data: {
        channelId: channel.id,
        direction: MessageDirection.INBOUND,
        externalId: message.externalId,
        content: message.content,
        metadata: {
          senderId: message.senderId,
          channelRef: message.channelRef,
          timestamp: message.timestamp?.toISOString(),
          ...message.metadata
        }
      }
    })

    // Return success - actual processing will be handled by a background worker
    return NextResponse.json({
      status: 'received',
      messageId: message.externalId
    })

  } catch (error) {
    console.error('Webhook POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
