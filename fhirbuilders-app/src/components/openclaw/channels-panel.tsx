"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Plus,
  MessageSquare,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Trash2,
  Link2,
  Unlink,
  RefreshCw,
} from "lucide-react"

// Channel type display info
const CHANNEL_INFO: Record<string, { name: string; icon: string; color: string; description: string }> = {
  SLACK: { name: "Slack", icon: "💬", color: "bg-purple-500", description: "Connect to Slack workspaces" },
  DISCORD: { name: "Discord", icon: "🎮", color: "bg-indigo-500", description: "Add a Discord bot" },
  WHATSAPP: { name: "WhatsApp", icon: "📱", color: "bg-green-500", description: "WhatsApp Business API" },
  TEAMS: { name: "Teams", icon: "👥", color: "bg-blue-500", description: "Microsoft Teams integration" },
  EMAIL: { name: "Email", icon: "📧", color: "bg-red-500", description: "Email-based interactions" },
  WEB_CHAT: { name: "Web Chat", icon: "💻", color: "bg-cyan-500", description: "Embeddable chat widget" },
  SMS: { name: "SMS", icon: "📲", color: "bg-emerald-500", description: "Text message integration" },
  TELEGRAM: { name: "Telegram", icon: "✈️", color: "bg-sky-500", description: "Telegram bot" },
}

interface Channel {
  id: string
  type: string
  name: string
  status: string
  webhookUrl?: string
  createdAt: string
  appChannels?: Array<{ generatedAppId: string; enabled: boolean }>
}

interface ChannelsPanelProps {
  generatedAppId?: string
}

export function ChannelsPanel({ generatedAppId }: ChannelsPanelProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newChannelType, setNewChannelType] = useState("")
  const [newChannelName, setNewChannelName] = useState("")
  const [creating, setCreating] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const [linking, setLinking] = useState<string | null>(null)

  useEffect(() => {
    fetchChannels()
  }, [])

  async function fetchChannels() {
    try {
      setLoading(true)
      const response = await fetch("/api/openclaw/channels")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch channels")
      }

      setChannels(data.channels)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load channels")
    } finally {
      setLoading(false)
    }
  }

  async function createChannel() {
    if (!newChannelType || !newChannelName.trim()) return

    try {
      setCreating(true)
      const response = await fetch("/api/openclaw/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newChannelType,
          name: newChannelName.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create channel")
      }

      setChannels([data.channel, ...channels])
      setIsAddDialogOpen(false)
      setNewChannelType("")
      setNewChannelName("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel")
    } finally {
      setCreating(false)
    }
  }

  async function deleteChannel(channelId: string) {
    if (!confirm("Are you sure you want to delete this channel?")) return

    try {
      const response = await fetch(`/api/openclaw/channels/${channelId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete channel")
      }

      setChannels(channels.filter((c) => c.id !== channelId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete channel")
    }
  }

  async function toggleChannelLink(channelId: string, isLinked: boolean) {
    if (!generatedAppId) return

    setLinking(channelId)
    try {
      if (isLinked) {
        // Unlink
        const response = await fetch(`/api/openclaw/channels/${channelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            unlinkAppId: generatedAppId,
          }),
        })
        if (!response.ok) throw new Error("Failed to unlink")
      } else {
        // Link
        const response = await fetch(`/api/openclaw/channels/${channelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            linkAppId: generatedAppId,
          }),
        })
        if (!response.ok) throw new Error("Failed to link")
      }

      // Refresh channels
      await fetchChannels()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update link")
    } finally {
      setLinking(null)
    }
  }

  function copyWebhookUrl(url: string) {
    navigator.clipboard.writeText(url)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500/10 text-green-600">Active</Badge>
      case "CONFIGURING":
        return <Badge className="bg-yellow-500/10 text-yellow-600">Configuring</Badge>
      case "PENDING":
        return <Badge className="bg-gray-500/10 text-gray-600">Pending</Badge>
      case "PAUSED":
        return <Badge className="bg-orange-500/10 text-orange-600">Paused</Badge>
      case "FAILED":
        return <Badge className="bg-red-500/10 text-red-600">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  function isChannelLinked(channel: Channel): boolean {
    if (!generatedAppId) return false
    return channel.appChannels?.some(
      (ac) => ac.generatedAppId === generatedAppId && ac.enabled
    ) ?? false
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messaging Channels
            </CardTitle>
            <CardDescription>
              Connect your app to Slack, Discord, WhatsApp, and more
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchChannels}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Channel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Messaging Channel</DialogTitle>
                  <DialogDescription>
                    Connect a new messaging platform to receive and send messages through your app.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Channel Type</Label>
                    <Select value={newChannelType} onValueChange={setNewChannelType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CHANNEL_INFO).map(([type, info]) => (
                          <SelectItem key={type} value={type}>
                            <span className="flex items-center gap-2">
                              <span>{info.icon}</span>
                              <span>{info.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {newChannelType && (
                    <p className="text-sm text-muted-foreground">
                      {CHANNEL_INFO[newChannelType]?.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <Label>Channel Name</Label>
                    <Input
                      placeholder="e.g., Main Support Channel"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      A friendly name to identify this channel
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createChannel}
                    disabled={!newChannelType || !newChannelName.trim() || creating}
                  >
                    {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Channel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setError(null)}
            >
              Dismiss
            </Button>
          </div>
        )}

        {channels.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              No messaging channels configured yet
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Your First Channel
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {channels.map((channel) => {
              const info = CHANNEL_INFO[channel.type]
              const isLinked = isChannelLinked(channel)

              return (
                <div
                  key={channel.id}
                  className={`p-4 border rounded-lg ${
                    isLinked ? "border-primary/50 bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${info?.color || "bg-gray-500"} text-white`}
                      >
                        {info?.icon || "📨"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{channel.name}</h4>
                          {getStatusBadge(channel.status)}
                          {isLinked && (
                            <Badge variant="outline" className="text-primary border-primary">
                              <Link2 className="h-3 w-3 mr-1" />
                              Linked
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {info?.name || channel.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {generatedAppId && (
                        <Button
                          variant={isLinked ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleChannelLink(channel.id, isLinked)}
                          disabled={linking === channel.id}
                        >
                          {linking === channel.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isLinked ? (
                            <>
                              <Unlink className="h-4 w-4 mr-1" />
                              Unlink
                            </>
                          ) : (
                            <>
                              <Link2 className="h-4 w-4 mr-1" />
                              Link to App
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => deleteChannel(channel.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Webhook URL */}
                  {channel.webhookUrl && (
                    <div className="mt-3 p-2 bg-muted/50 rounded flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Webhook:</span>
                      <code className="text-xs flex-1 truncate">{channel.webhookUrl}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyWebhookUrl(channel.webhookUrl!)}
                      >
                        {copiedUrl === channel.webhookUrl ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={channel.webhookUrl} target="_blank" rel="noopener noreferrer" title="Open webhook URL">
                          <ExternalLink className="h-4 w-4" />
                          <span className="sr-only">Open webhook URL</span>
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
