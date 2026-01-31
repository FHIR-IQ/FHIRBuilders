/**
 * Messaging Channel Tests
 *
 * Tests for multi-channel messaging integration types,
 * validation, and configuration utilities.
 */

import { describe, it, expect } from 'vitest'
import {
  ChannelType,
  ChannelStatus,
  MessageDirection,
  validateChannelConfig,
  generateWebhookUrl,
  generateWebhookSecret,
  getChannelDisplayInfo,
  parseInboundMessage,
  formatOutboundMessage,
  type UnifiedMessage,
} from './channels'

describe('Channel Types', () => {
  describe('ChannelType enum', () => {
    it('should have all supported channel types', () => {
      expect(ChannelType.SLACK).toBe('SLACK')
      expect(ChannelType.DISCORD).toBe('DISCORD')
      expect(ChannelType.WHATSAPP).toBe('WHATSAPP')
      expect(ChannelType.TEAMS).toBe('TEAMS')
      expect(ChannelType.EMAIL).toBe('EMAIL')
      expect(ChannelType.WEB_CHAT).toBe('WEB_CHAT')
      expect(ChannelType.SMS).toBe('SMS')
      expect(ChannelType.TELEGRAM).toBe('TELEGRAM')
    })
  })

  describe('ChannelStatus enum', () => {
    it('should have all status values', () => {
      expect(ChannelStatus.PENDING).toBe('PENDING')
      expect(ChannelStatus.CONFIGURING).toBe('CONFIGURING')
      expect(ChannelStatus.ACTIVE).toBe('ACTIVE')
      expect(ChannelStatus.PAUSED).toBe('PAUSED')
      expect(ChannelStatus.FAILED).toBe('FAILED')
      expect(ChannelStatus.DISCONNECTED).toBe('DISCONNECTED')
    })
  })

  describe('MessageDirection enum', () => {
    it('should have inbound and outbound', () => {
      expect(MessageDirection.INBOUND).toBe('INBOUND')
      expect(MessageDirection.OUTBOUND).toBe('OUTBOUND')
    })
  })
})

describe('Channel Configuration Validation', () => {
  describe('validateChannelConfig', () => {
    it('should validate Slack config', () => {
      const config = {
        botToken: 'xoxb-123456789',
        signingSecret: 'abc123',
        channelId: 'C12345678'
      }
      const result = validateChannelConfig(ChannelType.SLACK, config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid Slack config', () => {
      const config = {
        botToken: '', // Empty
        channelId: 'C12345678'
        // Missing signingSecret
      }
      const result = validateChannelConfig(ChannelType.SLACK, config)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate Discord config', () => {
      const config = {
        botToken: 'MTIzNDU2Nzg5MDEyMzQ1Njc4.abc123',
        guildId: '123456789012345678',
        channelId: '987654321098765432'
      }
      const result = validateChannelConfig(ChannelType.DISCORD, config)
      expect(result.valid).toBe(true)
    })

    it('should validate WhatsApp config', () => {
      const config = {
        phoneNumberId: '123456789',
        accessToken: 'EAABcd123...',
        verifyToken: 'my-verify-token'
      }
      const result = validateChannelConfig(ChannelType.WHATSAPP, config)
      expect(result.valid).toBe(true)
    })

    it('should validate Teams config', () => {
      const config = {
        tenantId: 'abc-123-def',
        clientId: 'def-456-ghi',
        clientSecret: 'secret123',
        botId: 'bot-789'
      }
      const result = validateChannelConfig(ChannelType.TEAMS, config)
      expect(result.valid).toBe(true)
    })

    it('should validate Email config', () => {
      const config = {
        smtpHost: 'smtp.example.com',
        smtpPort: 587,
        smtpUser: 'user@example.com',
        smtpPass: 'password123',
        fromAddress: 'noreply@example.com'
      }
      const result = validateChannelConfig(ChannelType.EMAIL, config)
      expect(result.valid).toBe(true)
    })

    it('should validate WebChat config', () => {
      const config = {
        allowedOrigins: ['https://example.com'],
        theme: { primaryColor: '#007bff' }
      }
      const result = validateChannelConfig(ChannelType.WEB_CHAT, config)
      expect(result.valid).toBe(true)
    })

    it('should validate Telegram config', () => {
      const config = {
        botToken: '123456789:ABCdefGHIjklMNOpqrsTUVwxyz'
      }
      const result = validateChannelConfig(ChannelType.TELEGRAM, config)
      expect(result.valid).toBe(true)
    })

    it('should reject empty config', () => {
      const result = validateChannelConfig(ChannelType.SLACK, {})
      expect(result.valid).toBe(false)
    })
  })
})

describe('Webhook Utilities', () => {
  describe('generateWebhookUrl', () => {
    it('should generate a valid webhook URL', () => {
      const url = generateWebhookUrl('channel-123', 'https://app.example.com')
      expect(url).toBe('https://app.example.com/api/openclaw/webhook/channel-123')
    })

    it('should handle base URL with trailing slash', () => {
      const url = generateWebhookUrl('channel-123', 'https://app.example.com/')
      expect(url).toBe('https://app.example.com/api/openclaw/webhook/channel-123')
    })
  })

  describe('generateWebhookSecret', () => {
    it('should generate a random secret', () => {
      const secret1 = generateWebhookSecret()
      const secret2 = generateWebhookSecret()
      expect(secret1).not.toBe(secret2)
      expect(secret1.length).toBeGreaterThanOrEqual(32)
    })
  })
})

describe('Channel Display Info', () => {
  describe('getChannelDisplayInfo', () => {
    it('should return display info for Slack', () => {
      const info = getChannelDisplayInfo(ChannelType.SLACK)
      expect(info.name).toBe('Slack')
      expect(info.icon).toBeDefined()
      expect(info.color).toBeDefined()
      expect(info.description).toContain('Slack')
    })

    it('should return display info for Discord', () => {
      const info = getChannelDisplayInfo(ChannelType.DISCORD)
      expect(info.name).toBe('Discord')
    })

    it('should return display info for WhatsApp', () => {
      const info = getChannelDisplayInfo(ChannelType.WHATSAPP)
      expect(info.name).toBe('WhatsApp')
    })

    it('should return display info for all channel types', () => {
      const types = Object.values(ChannelType)
      types.forEach(type => {
        const info = getChannelDisplayInfo(type)
        expect(info.name).toBeDefined()
        expect(info.icon).toBeDefined()
      })
    })
  })
})

describe('Message Parsing', () => {
  describe('parseInboundMessage', () => {
    it('should parse Slack message', () => {
      const payload = {
        event: {
          type: 'message',
          text: 'Hello from Slack',
          user: 'U12345',
          channel: 'C12345',
          ts: '1234567890.123456'
        }
      }
      const message = parseInboundMessage(ChannelType.SLACK, payload)
      expect(message.content).toBe('Hello from Slack')
      expect(message.senderId).toBe('U12345')
      expect(message.channelRef).toBe('C12345')
    })

    it('should parse Discord message', () => {
      const payload = {
        content: 'Hello from Discord',
        author: { id: '123456789', username: 'testuser' },
        channel_id: '987654321',
        id: 'msg123'
      }
      const message = parseInboundMessage(ChannelType.DISCORD, payload)
      expect(message.content).toBe('Hello from Discord')
      expect(message.senderId).toBe('123456789')
    })

    it('should parse WhatsApp message', () => {
      const payload = {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '15551234567',
                text: { body: 'Hello from WhatsApp' },
                id: 'wamid.123'
              }]
            }
          }]
        }]
      }
      const message = parseInboundMessage(ChannelType.WHATSAPP, payload)
      expect(message.content).toBe('Hello from WhatsApp')
      expect(message.senderId).toBe('15551234567')
    })

    it('should parse Telegram message', () => {
      const payload = {
        message: {
          text: 'Hello from Telegram',
          from: { id: 123456, username: 'testuser' },
          chat: { id: 789012 },
          message_id: 42
        }
      }
      const message = parseInboundMessage(ChannelType.TELEGRAM, payload)
      expect(message.content).toBe('Hello from Telegram')
      expect(message.senderId).toBe('123456')
    })

    it('should parse Email message', () => {
      const payload = {
        from: 'user@example.com',
        subject: 'Test Subject',
        text: 'Hello from Email',
        messageId: '<abc123@example.com>'
      }
      const message = parseInboundMessage(ChannelType.EMAIL, payload)
      expect(message.content).toBe('Hello from Email')
      expect(message.senderId).toBe('user@example.com')
      expect(message.metadata?.subject).toBe('Test Subject')
    })

    it('should parse WebChat message', () => {
      const payload = {
        sessionId: 'session-123',
        message: 'Hello from WebChat',
        userId: 'visitor-456'
      }
      const message = parseInboundMessage(ChannelType.WEB_CHAT, payload)
      expect(message.content).toBe('Hello from WebChat')
      expect(message.senderId).toBe('visitor-456')
    })
  })
})

describe('Message Formatting', () => {
  describe('formatOutboundMessage', () => {
    it('should format message for Slack', () => {
      const message: UnifiedMessage = {
        content: 'Hello!',
        channelRef: 'C12345'
      }
      const formatted = formatOutboundMessage(ChannelType.SLACK, message)
      expect(formatted.channel).toBe('C12345')
      expect(formatted.text).toBe('Hello!')
    })

    it('should format message for Discord', () => {
      const message: UnifiedMessage = {
        content: 'Hello!',
        channelRef: '987654321'
      }
      const formatted = formatOutboundMessage(ChannelType.DISCORD, message)
      expect(formatted.content).toBe('Hello!')
    })

    it('should format message for WhatsApp', () => {
      const message: UnifiedMessage = {
        content: 'Hello!',
        senderId: '15551234567'
      }
      const formatted = formatOutboundMessage(ChannelType.WHATSAPP, message)
      expect(formatted.to).toBe('15551234567')
      expect(formatted.type).toBe('text')
      const text = formatted.text as { body: string }
      expect(text.body).toBe('Hello!')
    })

    it('should format message for Telegram', () => {
      const message: UnifiedMessage = {
        content: 'Hello!',
        channelRef: '789012'
      }
      const formatted = formatOutboundMessage(ChannelType.TELEGRAM, message)
      expect(formatted.chat_id).toBe('789012')
      expect(formatted.text).toBe('Hello!')
    })

    it('should format message for Email', () => {
      const message: UnifiedMessage = {
        content: 'Hello!',
        senderId: 'user@example.com',
        metadata: { subject: 'Re: Test' }
      }
      const formatted = formatOutboundMessage(ChannelType.EMAIL, message)
      expect(formatted.to).toBe('user@example.com')
      expect(formatted.subject).toBe('Re: Test')
      expect(formatted.text).toBe('Hello!')
    })
  })
})
