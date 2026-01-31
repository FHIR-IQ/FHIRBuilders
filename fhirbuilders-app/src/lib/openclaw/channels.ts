/**
 * Messaging Channels
 *
 * Multi-channel messaging integration for OpenClaw.
 * Supports Slack, Discord, WhatsApp, Teams, Email, Web Chat, SMS, and Telegram.
 */

import { randomBytes } from 'crypto'

// ============================================
// Enums (matching Prisma schema)
// ============================================

export const ChannelType = {
  SLACK: 'SLACK',
  DISCORD: 'DISCORD',
  WHATSAPP: 'WHATSAPP',
  TEAMS: 'TEAMS',
  EMAIL: 'EMAIL',
  WEB_CHAT: 'WEB_CHAT',
  SMS: 'SMS',
  TELEGRAM: 'TELEGRAM'
} as const

export type ChannelType = typeof ChannelType[keyof typeof ChannelType]

export const ChannelStatus = {
  PENDING: 'PENDING',
  CONFIGURING: 'CONFIGURING',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  FAILED: 'FAILED',
  DISCONNECTED: 'DISCONNECTED'
} as const

export type ChannelStatus = typeof ChannelStatus[keyof typeof ChannelStatus]

export const MessageDirection = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND'
} as const

export type MessageDirection = typeof MessageDirection[keyof typeof MessageDirection]

// ============================================
// Channel Configuration Types
// ============================================

export interface SlackConfig {
  botToken: string
  signingSecret: string
  channelId?: string
  workspaceId?: string
}

export interface DiscordConfig {
  botToken: string
  guildId: string
  channelId?: string
}

export interface WhatsAppConfig {
  phoneNumberId: string
  accessToken: string
  verifyToken: string
  businessAccountId?: string
}

export interface TeamsConfig {
  tenantId: string
  clientId: string
  clientSecret: string
  botId: string
}

export interface EmailConfig {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  fromAddress: string
  imapHost?: string
  imapPort?: number
}

export interface WebChatConfig {
  allowedOrigins: string[]
  theme?: {
    primaryColor?: string
    fontFamily?: string
    borderRadius?: number
  }
  welcomeMessage?: string
}

export interface SmsConfig {
  accountSid: string
  authToken: string
  fromNumber: string
}

export interface TelegramConfig {
  botToken: string
  webhookSecret?: string
}

export type ChannelConfig =
  | SlackConfig
  | DiscordConfig
  | WhatsAppConfig
  | TeamsConfig
  | EmailConfig
  | WebChatConfig
  | SmsConfig
  | TelegramConfig

// ============================================
// Unified Message Types
// ============================================

export interface UnifiedMessage {
  content: string
  senderId?: string
  channelRef?: string
  externalId?: string
  timestamp?: Date
  metadata?: Record<string, unknown>
}

export interface ChannelDisplayInfo {
  name: string
  icon: string
  color: string
  description: string
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ============================================
// Channel Configuration Validation
// ============================================

function validateSlackConfig(config: Partial<SlackConfig>): ValidationResult {
  const errors: string[] = []

  if (!config.botToken || config.botToken.trim() === '') {
    errors.push('Bot token is required')
  }
  if (!config.signingSecret || config.signingSecret.trim() === '') {
    errors.push('Signing secret is required')
  }

  return { valid: errors.length === 0, errors }
}

function validateDiscordConfig(config: Partial<DiscordConfig>): ValidationResult {
  const errors: string[] = []

  if (!config.botToken) {
    errors.push('Bot token is required')
  }
  if (!config.guildId) {
    errors.push('Guild ID is required')
  }

  return { valid: errors.length === 0, errors }
}

function validateWhatsAppConfig(config: Partial<WhatsAppConfig>): ValidationResult {
  const errors: string[] = []

  if (!config.phoneNumberId) {
    errors.push('Phone number ID is required')
  }
  if (!config.accessToken) {
    errors.push('Access token is required')
  }
  if (!config.verifyToken) {
    errors.push('Verify token is required')
  }

  return { valid: errors.length === 0, errors }
}

function validateTeamsConfig(config: Partial<TeamsConfig>): ValidationResult {
  const errors: string[] = []

  if (!config.tenantId) errors.push('Tenant ID is required')
  if (!config.clientId) errors.push('Client ID is required')
  if (!config.clientSecret) errors.push('Client secret is required')
  if (!config.botId) errors.push('Bot ID is required')

  return { valid: errors.length === 0, errors }
}

function validateEmailConfig(config: Partial<EmailConfig>): ValidationResult {
  const errors: string[] = []

  if (!config.smtpHost) errors.push('SMTP host is required')
  if (!config.smtpPort) errors.push('SMTP port is required')
  if (!config.smtpUser) errors.push('SMTP user is required')
  if (!config.smtpPass) errors.push('SMTP password is required')
  if (!config.fromAddress) errors.push('From address is required')

  return { valid: errors.length === 0, errors }
}

function validateWebChatConfig(config: Partial<WebChatConfig>): ValidationResult {
  const errors: string[] = []

  if (!config.allowedOrigins || config.allowedOrigins.length === 0) {
    errors.push('At least one allowed origin is required')
  }

  return { valid: errors.length === 0, errors }
}

function validateSmsConfig(config: Partial<SmsConfig>): ValidationResult {
  const errors: string[] = []

  if (!config.accountSid) errors.push('Account SID is required')
  if (!config.authToken) errors.push('Auth token is required')
  if (!config.fromNumber) errors.push('From number is required')

  return { valid: errors.length === 0, errors }
}

function validateTelegramConfig(config: Partial<TelegramConfig>): ValidationResult {
  const errors: string[] = []

  if (!config.botToken) {
    errors.push('Bot token is required')
  }

  return { valid: errors.length === 0, errors }
}

export function validateChannelConfig(
  type: ChannelType,
  config: ChannelConfig | Record<string, unknown>
): ValidationResult {
  switch (type) {
    case ChannelType.SLACK:
      return validateSlackConfig(config as Partial<SlackConfig>)
    case ChannelType.DISCORD:
      return validateDiscordConfig(config as Partial<DiscordConfig>)
    case ChannelType.WHATSAPP:
      return validateWhatsAppConfig(config as Partial<WhatsAppConfig>)
    case ChannelType.TEAMS:
      return validateTeamsConfig(config as Partial<TeamsConfig>)
    case ChannelType.EMAIL:
      return validateEmailConfig(config as Partial<EmailConfig>)
    case ChannelType.WEB_CHAT:
      return validateWebChatConfig(config as Partial<WebChatConfig>)
    case ChannelType.SMS:
      return validateSmsConfig(config as Partial<SmsConfig>)
    case ChannelType.TELEGRAM:
      return validateTelegramConfig(config as Partial<TelegramConfig>)
    default:
      return { valid: false, errors: ['Unknown channel type'] }
  }
}

// ============================================
// Webhook Utilities
// ============================================

export function generateWebhookUrl(channelId: string, baseUrl: string): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '')
  return `${cleanBaseUrl}/api/openclaw/webhook/${channelId}`
}

export function generateWebhookSecret(): string {
  return randomBytes(32).toString('hex')
}

// ============================================
// Channel Display Info
// ============================================

const channelDisplayInfo: Record<ChannelType, ChannelDisplayInfo> = {
  [ChannelType.SLACK]: {
    name: 'Slack',
    icon: 'slack',
    color: '#4A154B',
    description: 'Connect to Slack workspaces for team messaging'
  },
  [ChannelType.DISCORD]: {
    name: 'Discord',
    icon: 'discord',
    color: '#5865F2',
    description: 'Add a bot to Discord servers'
  },
  [ChannelType.WHATSAPP]: {
    name: 'WhatsApp',
    icon: 'whatsapp',
    color: '#25D366',
    description: 'Integrate with WhatsApp Business API'
  },
  [ChannelType.TEAMS]: {
    name: 'Microsoft Teams',
    icon: 'teams',
    color: '#6264A7',
    description: 'Connect to Microsoft Teams channels'
  },
  [ChannelType.EMAIL]: {
    name: 'Email',
    icon: 'mail',
    color: '#EA4335',
    description: 'Send and receive emails via SMTP/IMAP'
  },
  [ChannelType.WEB_CHAT]: {
    name: 'Web Chat',
    icon: 'message-circle',
    color: '#0EA5E9',
    description: 'Embed a chat widget on your website'
  },
  [ChannelType.SMS]: {
    name: 'SMS',
    icon: 'smartphone',
    color: '#10B981',
    description: 'Send text messages via Twilio'
  },
  [ChannelType.TELEGRAM]: {
    name: 'Telegram',
    icon: 'send',
    color: '#0088CC',
    description: 'Create a Telegram bot'
  }
}

export function getChannelDisplayInfo(type: ChannelType): ChannelDisplayInfo {
  return channelDisplayInfo[type]
}

// ============================================
// Message Parsing (Inbound)
// ============================================

interface SlackEventPayload {
  event: {
    type: string
    text: string
    user: string
    channel: string
    ts: string
  }
}

interface DiscordMessagePayload {
  content: string
  author: { id: string; username: string }
  channel_id: string
  id: string
}

interface WhatsAppPayload {
  entry: Array<{
    changes: Array<{
      value: {
        messages: Array<{
          from: string
          text: { body: string }
          id: string
        }>
      }
    }>
  }>
}

interface TelegramPayload {
  message: {
    text: string
    from: { id: number; username?: string }
    chat: { id: number }
    message_id: number
  }
}

interface EmailPayload {
  from: string
  subject: string
  text: string
  messageId: string
}

interface WebChatPayload {
  sessionId: string
  message: string
  userId: string
}

export function parseInboundMessage(
  type: ChannelType,
  payload: unknown
): UnifiedMessage {
  switch (type) {
    case ChannelType.SLACK: {
      const p = payload as SlackEventPayload
      return {
        content: p.event.text,
        senderId: p.event.user,
        channelRef: p.event.channel,
        externalId: p.event.ts,
        timestamp: new Date()
      }
    }

    case ChannelType.DISCORD: {
      const p = payload as DiscordMessagePayload
      return {
        content: p.content,
        senderId: p.author.id,
        channelRef: p.channel_id,
        externalId: p.id,
        timestamp: new Date(),
        metadata: { username: p.author.username }
      }
    }

    case ChannelType.WHATSAPP: {
      const p = payload as WhatsAppPayload
      const message = p.entry[0]?.changes[0]?.value?.messages[0]
      return {
        content: message?.text?.body || '',
        senderId: message?.from || '',
        externalId: message?.id,
        timestamp: new Date()
      }
    }

    case ChannelType.TELEGRAM: {
      const p = payload as TelegramPayload
      return {
        content: p.message.text,
        senderId: String(p.message.from.id),
        channelRef: String(p.message.chat.id),
        externalId: String(p.message.message_id),
        timestamp: new Date(),
        metadata: { username: p.message.from.username }
      }
    }

    case ChannelType.EMAIL: {
      const p = payload as EmailPayload
      return {
        content: p.text,
        senderId: p.from,
        externalId: p.messageId,
        timestamp: new Date(),
        metadata: { subject: p.subject }
      }
    }

    case ChannelType.WEB_CHAT: {
      const p = payload as WebChatPayload
      return {
        content: p.message,
        senderId: p.userId,
        channelRef: p.sessionId,
        timestamp: new Date()
      }
    }

    case ChannelType.TEAMS:
    case ChannelType.SMS:
    default:
      return {
        content: '',
        timestamp: new Date()
      }
  }
}

// ============================================
// Message Formatting (Outbound)
// ============================================

export function formatOutboundMessage(
  type: ChannelType,
  message: UnifiedMessage
): Record<string, unknown> {
  const metadata = message.metadata || {}

  switch (type) {
    case ChannelType.SLACK: {
      const result: Record<string, unknown> = {
        channel: message.channelRef,
        text: message.content
      }
      if (metadata.blocks) {
        result.blocks = metadata.blocks
      }
      return result
    }

    case ChannelType.DISCORD: {
      const result: Record<string, unknown> = {
        content: message.content
      }
      if (metadata.embeds) {
        result.embeds = metadata.embeds
      }
      return result
    }

    case ChannelType.WHATSAPP:
      return {
        messaging_product: 'whatsapp',
        to: message.senderId,
        type: 'text',
        text: { body: message.content }
      }

    case ChannelType.TELEGRAM:
      return {
        chat_id: message.channelRef,
        text: message.content,
        parse_mode: 'Markdown'
      }

    case ChannelType.EMAIL:
      return {
        to: message.senderId,
        subject: message.metadata?.subject || 'OpenClaw Notification',
        text: message.content,
        html: message.metadata?.html as string | undefined
      }

    case ChannelType.WEB_CHAT:
      return {
        sessionId: message.channelRef,
        message: message.content,
        timestamp: new Date().toISOString()
      }

    case ChannelType.SMS:
      return {
        to: message.senderId,
        body: message.content
      }

    case ChannelType.TEAMS:
      return {
        type: 'message',
        text: message.content
      }

    default:
      return { content: message.content }
  }
}
