/**
 * Unified Message Handler
 *
 * Processes inbound messages from any messaging channel,
 * generates AI responses, and sends them back through the appropriate channel.
 */

import type Anthropic from '@anthropic-ai/sdk'
import type { PrismaClient, Prisma } from '@prisma/client'
import {
  ChannelType,
  MessageDirection,
  formatOutboundMessage,
  type UnifiedMessage
} from './channels'

// ============================================
// Types
// ============================================

export interface MessageHandlerDeps {
  prisma: PrismaClient
  anthropic: Anthropic
}

export interface ProcessMessageInput {
  channelId: string
  message: UnifiedMessage
  deps: MessageHandlerDeps
}

export interface ProcessMessageResult {
  success: boolean
  responseId?: string
  error?: string
}

export interface ChannelSender {
  type: ChannelType
  credentials: Record<string, unknown>
  send: (message: Record<string, unknown>) => Promise<void>
}

// ============================================
// Message Processing
// ============================================

/**
 * Build the AI context from the generated app
 */
function buildAppContext(
  generatedCode: Prisma.JsonValue,
  prompt: string,
  fhirResources: string[]
): string {
  const codeInfo = generatedCode as Record<string, unknown> | null

  let context = `You are an AI assistant for a FHIR healthcare application.

## Application Description
${prompt}

## Supported FHIR Resources
${fhirResources.join(', ')}

## Your Role
- Answer questions about the application and its features
- Help users understand FHIR resources and healthcare data
- Guide users through common workflows
- Provide accurate, helpful information about healthcare interoperability

## Guidelines
- Be concise but thorough
- Use simple language, avoiding unnecessary jargon
- When discussing FHIR resources, explain their purpose
- If you don't know something, say so clearly
- Never make up medical advice or diagnoses
`

  if (codeInfo?.description) {
    context += `\n## Additional Context\n${codeInfo.description}\n`
  }

  return context
}

/**
 * Generate an AI response for the message
 */
async function generateResponse(
  message: string,
  appContext: string,
  anthropic: Anthropic
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: appContext,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    })

    // Extract text content
    const textContent = response.content.find(c => c.type === 'text')
    return textContent?.text || 'I apologize, but I was unable to generate a response.'

  } catch (error) {
    console.error('AI generation error:', error)
    throw new Error('Failed to generate AI response')
  }
}

/**
 * Process an inbound message and generate a response
 */
export async function processMessage(
  input: ProcessMessageInput
): Promise<ProcessMessageResult> {
  const { channelId, message, deps } = input

  try {
    // Get channel with linked apps
    const channel = await deps.prisma.messagingChannel.findUnique({
      where: { id: channelId },
      include: {
        appChannels: {
          where: { enabled: true },
          include: {
            generatedApp: {
              select: {
                id: true,
                prompt: true,
                fhirResources: true,
                generatedCode: true
              }
            }
          }
        }
      }
    })

    if (!channel) {
      return { success: false, error: 'Channel not found' }
    }

    // Get the first linked app (for now, we use the first enabled one)
    const appChannel = channel.appChannels[0]
    if (!appChannel?.generatedApp) {
      return { success: false, error: 'No app linked to this channel' }
    }

    const app = appChannel.generatedApp

    // Build AI context
    const appContext = buildAppContext(
      app.generatedCode,
      app.prompt,
      app.fhirResources
    )

    // Generate AI response
    const responseText = await generateResponse(
      message.content,
      appContext,
      deps.anthropic
    )

    // Store the response
    const storedResponse = await deps.prisma.channelMessage.create({
      data: {
        channelId,
        direction: MessageDirection.OUTBOUND,
        content: responseText,
        metadata: {
          inReplyTo: message.externalId,
          senderId: message.senderId,
          channelRef: message.channelRef
        }
      }
    })

    // Format for the specific channel
    const formattedMessage = formatOutboundMessage(
      channel.type as ChannelType,
      {
        content: responseText,
        senderId: message.senderId,
        channelRef: message.channelRef
      }
    )

    // TODO: Actually send the message via the channel's API
    // This would require implementing channel-specific senders
    console.log('Would send message:', formattedMessage)

    // Mark the original message as processed
    if (message.externalId) {
      await deps.prisma.channelMessage.updateMany({
        where: {
          channelId,
          externalId: message.externalId
        },
        data: {
          processed: true,
          response: responseText
        }
      })
    }

    return {
      success: true,
      responseId: storedResponse.id
    }

  } catch (error) {
    console.error('Process message error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Process all pending messages for a channel
 */
export async function processPendingMessages(
  channelId: string,
  deps: MessageHandlerDeps
): Promise<{ processed: number; errors: number }> {
  let processed = 0
  let errors = 0

  // Get unprocessed messages
  const pendingMessages = await deps.prisma.channelMessage.findMany({
    where: {
      channelId,
      direction: MessageDirection.INBOUND,
      processed: false
    },
    orderBy: { createdAt: 'asc' },
    take: 10 // Process in batches
  })

  for (const msg of pendingMessages) {
    const metadata = msg.metadata as Record<string, unknown> | null

    const result = await processMessage({
      channelId,
      message: {
        content: msg.content,
        senderId: metadata?.senderId as string | undefined,
        channelRef: metadata?.channelRef as string | undefined,
        externalId: msg.externalId || undefined
      },
      deps
    })

    if (result.success) {
      processed++
    } else {
      errors++
      // Store error on the message
      await deps.prisma.channelMessage.update({
        where: { id: msg.id },
        data: { errorMessage: result.error }
      })
    }
  }

  return { processed, errors }
}

/**
 * Link a generated app to a channel
 */
export async function linkAppToChannel(
  channelId: string,
  generatedAppId: string,
  deps: Pick<MessageHandlerDeps, 'prisma'>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify both exist
    const [channel, app] = await Promise.all([
      deps.prisma.messagingChannel.findUnique({ where: { id: channelId } }),
      deps.prisma.generatedApp.findUnique({ where: { id: generatedAppId } })
    ])

    if (!channel) {
      return { success: false, error: 'Channel not found' }
    }
    if (!app) {
      return { success: false, error: 'App not found' }
    }

    // Verify same user owns both
    if (channel.userId !== app.userId) {
      return { success: false, error: 'Permission denied' }
    }

    // Create or update the link
    await deps.prisma.appChannel.upsert({
      where: {
        channelId_generatedAppId: { channelId, generatedAppId }
      },
      create: {
        channelId,
        generatedAppId,
        enabled: true
      },
      update: {
        enabled: true
      }
    })

    return { success: true }

  } catch (error) {
    console.error('Link app to channel error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Unlink an app from a channel
 */
export async function unlinkAppFromChannel(
  channelId: string,
  generatedAppId: string,
  deps: Pick<MessageHandlerDeps, 'prisma'>
): Promise<{ success: boolean; error?: string }> {
  try {
    await deps.prisma.appChannel.deleteMany({
      where: { channelId, generatedAppId }
    })

    return { success: true }

  } catch (error) {
    console.error('Unlink app from channel error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
