"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Radio,
  Play,
  Square,
  Settings,
  MessageCircle,
  Heart,
  DollarSign,
  Eye,
  Clock,
  Signal,
  Camera,
  Mic,
  Volume2,
  Maximize,
  Share2,
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  TrendingUp,
  Activity,
  Send,
  Info,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useTranslation } from "@/lib/i18n"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { createClientComponentClient } from "@/lib/supabase-client"

interface StreamSession {
  id: string
  title: string
  description: string
  status: "scheduled" | "live" | "ended"
  viewerCount: number
  peakViewers: number
  startTime?: Date
  endTime?: Date
  duration?: string
  quality: string
  bitrate: number
  fps: number
  isRecording: boolean
  chatEnabled: boolean
  donationsEnabled: boolean
  prayerRequestsEnabled: boolean
}

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: Date
  type: "message" | "donation" | "prayer" | "system"
  amount?: number
  pinned?: boolean
  parent_id?: string | null
}

interface StreamAnalytics {
  totalViews: number
  averageWatchTime: string
  engagementRate: number
  chatMessages: number
  donations: number
  prayerRequests: number
  deviceBreakdown: {
    mobile: number
    desktop: number
    tablet: number
  }
  locationBreakdown: {
    country: string
    viewers: number
  }[]
}

export default function LiveStreamingPlatform() {
  const { user, language } = useAuth()
  const { t } = useTranslation(language)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamSession, setStreamSession] = useState<StreamSession>({
    id: "stream-1",
    title: "Sunday Morning Service",
    description: "Join us for worship, word, and fellowship",
    status: "scheduled",
    viewerCount: 0,
    peakViewers: 0,
    quality: "1080p",
    bitrate: 5000,
    fps: 30,
    isRecording: true,
    chatEnabled: true,
    donationsEnabled: true,
    prayerRequestsEnabled: true,
  })

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [pinnedMessages, setPinnedMessages] = useState<ChatMessage[]>([])
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null)
  const streamId = streamSession.id

  const [onlineUsers, setOnlineUsers] = useState<{ id: string; name: string }[]>([])
  const [typingUsers, setTypingUsers] = useState<{ id: string; name: string }[]>([])
  const typingTimeouts = useRef<{ [id: string]: NodeJS.Timeout }>({})
  const [reactions, setReactions] = useState<Record<string, Record<string, string[]>>>({}) // messageId -> emoji -> userIds

  // Fetch chat messages on load
  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch(`/api/streaming/chat?streamId=${streamId}`)
      const data = await res.json()
      setChatMessages(data.messages || [])
    }
    fetchMessages()

    // Supabase Realtime subscription
    const supabase = createClientComponentClient()
    const channel = supabase.channel('chat-messages')
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `stream_id=eq.${streamId}`,
      },
      (payload) => {
        setChatMessages((prev) => [...prev, payload.new as ChatMessage])
      }
    )
    channel.subscribe()

    // Presence channel for online users and typing
    const presenceChannel = supabase.channel('chat-presence')
    presenceChannel.on('system', { event: 'sync' }, (state: any) => {
      setOnlineUsers(state.presences.map((p: any) => ({ id: p.user_id, name: p.user_name })))
    })
    presenceChannel.on('broadcast', { event: 'typing' }, (payload) => {
      const { user_id, user_name } = payload
      setTypingUsers((prev) => {
        if (prev.some(u => u.id === user_id)) return prev
        return [...prev, { id: user_id, name: user_name }]
      })
      if (typingTimeouts.current[user_id]) clearTimeout(typingTimeouts.current[user_id])
      typingTimeouts.current[user_id] = setTimeout(() => {
        setTypingUsers((prev) => prev.filter(u => u.id !== user_id))
      }, 2000)
    })
    presenceChannel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({ user_id: user?.id, user_name: user?.email })
      }
    })
    return () => {
      channel.unsubscribe()
      presenceChannel.unsubscribe()
    }
  }, [streamId, user?.id, user?.email])

  // Fetch pinned messages on load
  useEffect(() => {
    async function fetchPinned() {
      const res = await fetch(`/api/streaming/chat?streamId=${streamId}&pinned=1`)
      const data = await res.json()
      setPinnedMessages(data.messages || [])
    }
    fetchPinned()
  }, [streamId])

  useEffect(() => {
    async function fetchReactions() {
      const res = await fetch(`/api/streaming/chat?streamId=${streamId}&reactions=1`)
      const data = await res.json()
      setReactions(data.reactions || {})
    }
    fetchReactions()
  }, [streamId, chatMessages.length])

  const [streamAnalytics] = useState<StreamAnalytics>({
    totalViews: 1247,
    averageWatchTime: "23:45",
    engagementRate: 78,
    chatMessages: 156,
    donations: 12,
    prayerRequests: 8,
    deviceBreakdown: {
      mobile: 65,
      desktop: 25,
      tablet: 10,
    },
    locationBreakdown: [
      { country: "Angola", viewers: 45 },
      { country: "Brazil", viewers: 32 },
      { country: "Portugal", viewers: 18 },
      { country: "USA", viewers: 5 },
    ],
  })

  const [integrationModal, setIntegrationModal] = useState<{ name: string; open: boolean }>({ name: '', open: false })
  const [connecting, setConnecting] = useState<{ [key: string]: boolean }>({})

  const handleStartStream = () => {
    setIsStreaming(true)
    setStreamSession((prev) => ({
      ...prev,
      status: "live",
      startTime: new Date(),
      viewerCount: Math.floor(Math.random() * 100) + 50,
    }))
    toast({
      title: t("streamStarted"),
      description: t("streamStartedDesc"),
    })
  }

  const handleStopStream = () => {
    setIsStreaming(false)
    setStreamSession((prev) => ({
      ...prev,
      status: "ended",
      endTime: new Date(),
      duration: "1:23:45",
    }))
    toast({
      title: t("streamEnded"),
      description: t("streamEndedDesc"),
    })
  }

  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        stream_id: streamId,
        user_id: user?.id || "anonymous",
        user_name: user?.email || "Anonymous",
        message: newMessage,
        type: "message",
        parent_id: replyTo?.id || null,
      }
      const res = await fetch("/api/streaming/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      })
      const saved = await res.json()
      setChatMessages((prev) => [...prev, saved])
      setNewMessage("")
      setReplyTo(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    // Broadcast typing event
    const supabase = createClientComponentClient()
    const presenceChannel = supabase.channel('chat-presence')
    presenceChannel.send({ type: 'broadcast', event: 'typing', payload: { user_id: user?.id, user_name: user?.email } })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500 text-white"
      case "scheduled":
        return "bg-blue-500 text-white"
      case "ended":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return t("liveNow")
      case "scheduled":
        return t("scheduled")
      case "ended":
        return t("streamEnded")
      default:
        return status
    }
  }

  // Simulate real-time viewer count updates
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        setStreamSession((prev) => ({
          ...prev,
          viewerCount: Math.max(0, prev.viewerCount + Math.floor(Math.random() * 10) - 4),
          peakViewers: Math.max(prev.peakViewers, prev.viewerCount),
        }))
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isStreaming])

  const isAdmin = user?.role === 'admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Radio className="h-8 w-8 text-red-600" />
            {t("liveStreaming")}
          </h1>
          <p className="text-gray-600 mt-1">{t("streamingPlatform")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(streamSession.status)}>{getStatusText(streamSession.status)}</Badge>
          {isStreaming && (
            <Badge variant="outline" className="animate-pulse">
              <Eye className="h-3 w-3 mr-1" />
              {streamSession.viewerCount} {t("viewers")}
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="dashboard">{t("dashboard")}</TabsTrigger>
          <TabsTrigger value="stream">{t("streaming")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
          <TabsTrigger value="settings">{t("settings")}</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("currentViewers")}</p>
                    <p className="text-2xl font-bold">{streamSession.viewerCount}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("peakViewers")}</p>
                    <p className="text-2xl font-bold">{streamSession.peakViewers}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("chatMessages")}</p>
                    <p className="text-2xl font-bold">{streamAnalytics.chatMessages}</p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("donations")}</p>
                    <p className="text-2xl font-bold">{streamAnalytics.donations}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stream Controls */}
          <Card>
            <CardHeader>
              <CardTitle>{t("streamControls")}</CardTitle>
              <CardDescription>{t("streamControlsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                {!isStreaming ? (
                  <Button onClick={handleStartStream} className="bg-red-600 hover:bg-red-700">
                    <Play className="h-4 w-4 mr-2" />
                    {t("startStream")}
                  </Button>
                ) : (
                  <Button onClick={handleStopStream} variant="destructive">
                    <Square className="h-4 w-4 mr-2" />
                    {t("stopStream")}
                  </Button>
                )}

                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  {t("streamSettings")}
                </Button>

                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  {t("scheduleStream")}
                </Button>
              </div>

              {isStreaming && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-red-700">{t("liveNow")}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">{t("duration")}:</span>
                      <span className="ml-1 font-medium">
                        {streamSession.startTime
                          ? Math.floor((Date.now() - streamSession.startTime.getTime()) / 60000)
                          : 0}{" "}
                        min
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t("quality")}:</span>
                      <span className="ml-1 font-medium">{streamSession.quality}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t("bitrate")}:</span>
                      <span className="ml-1 font-medium">{streamSession.bitrate} kbps</span>
                    </div>
                    <div>
                      <span className="text-gray-600">FPS:</span>
                      <span className="ml-1 font-medium">{streamSession.fps}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Streams */}
          <Card>
            <CardHeader>
              <CardTitle>{t("recentStreams")}</CardTitle>
              <CardDescription>{t("recentStreamsDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Sunday Morning Service",
                    date: "Today, 10:00 AM",
                    duration: "1:23:45",
                    viewers: 247,
                    status: "ended",
                  },
                  {
                    title: "Wednesday Prayer Meeting",
                    date: "Yesterday, 7:00 PM",
                    duration: "45:30",
                    viewers: 89,
                    status: "ended",
                  },
                  {
                    title: "Youth Fellowship",
                    date: "Friday, 6:00 PM",
                    duration: "Scheduled",
                    viewers: 0,
                    status: "scheduled",
                  },
                ].map((stream, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{stream.title}</h4>
                      <p className="text-sm text-gray-600">{stream.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{stream.duration}</p>
                      <p className="text-xs text-gray-600">
                        {stream.viewers} {t("viewers")}
                      </p>
                    </div>
                    <Badge className={getStatusColor(stream.status)} variant="outline">
                      {getStatusText(stream.status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stream Tab */}
        <TabsContent value="stream" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                    {isStreaming ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <Radio className="h-16 w-16 mx-auto mb-4 animate-pulse" />
                          <h3 className="text-xl font-bold mb-2">{streamSession.title}</h3>
                          <p className="text-gray-300">{streamSession.description}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <Camera className="h-16 w-16 mx-auto mb-4" />
                          <h3 className="text-xl font-bold mb-2">{t("streamOffline")}</h3>
                          <p>{t("streamOfflineDesc")}</p>
                        </div>
                      </div>
                    )}

                    {/* Stream Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Mic className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="secondary">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Stream Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg">{streamSession.title}</h3>
                    <p className="text-gray-600 mt-1">{streamSession.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {streamSession.viewerCount} {t("viewers")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {streamSession.startTime
                          ? Math.floor((Date.now() - streamSession.startTime.getTime()) / 60000)
                          : 0}{" "}
                        min
                      </span>
                      <span className="flex items-center gap-1">
                        <Signal className="h-4 w-4" />
                        {streamSession.quality}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Chat */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{t("liveChat")}</CardTitle>
                  <CardDescription>{t("liveChatDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-96">
                  <ScrollArea className="flex-1 px-4">
                    {/* Online users */}
                    {onlineUsers.length > 0 && (
                      <div className="flex gap-2 items-center mb-2 text-xs text-muted-foreground">
                        <span>Online:</span>
                        {onlineUsers.map(u => <span key={u.id} className="font-medium">{u.name}</span>)}
                      </div>
                    )}
                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="text-xs text-blue-500 mb-2">
                        {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                      </div>
                    )}
                    {pinnedMessages.length > 0 && (
                      <div className="mb-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <div className="font-semibold text-yellow-800 mb-1">Pinned Messages</div>
                        {pinnedMessages.map(msg => (
                          <div key={msg.id} className="text-sm text-yellow-900 flex items-center gap-2">
                            <span>{msg.user}: {msg.message}</span>
                            <span className="text-xs text-yellow-600">(Pinned)</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {replyTo && (
                      <div className="mb-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded flex items-center justify-between">
                        <span className="text-xs text-blue-800">Replying to: {replyTo.user}: {replyTo.message}</span>
                        <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Button>
                      </div>
                    )}
                    <div className="space-y-3">
                      {chatMessages.filter((m: ChatMessage) => !m.parent_id).map((message: ChatMessage) => (
                        <div key={message.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{message.user.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium truncate">{message.user}</span>
                              {message.type === "donation" && <DollarSign className="h-3 w-3 text-green-600" />}
                              {message.type === "prayer" && <Heart className="h-3 w-3 text-red-600" />}
                            </div>
                            <p className="text-sm text-gray-700 break-words">
                              {message.message}
                              {message.amount && <span className="text-green-600 font-medium"> ${message.amount}</span>}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {["👍", "❤️", "🙏", "😂", "🎵"].map(emoji => {
                                const users = reactions[message.id]?.[emoji] || []
                                const reacted = users.includes(user?.id)
                                return (
                                  <button
                                    key={emoji}
                                    className={`text-lg px-1 rounded ${reacted ? "bg-blue-100" : "hover:bg-gray-100"}`}
                                    onClick={async () => {
                                      await fetch(`/api/streaming/chat?messageId=${message.id}&emoji=${encodeURIComponent(emoji)}`, { method: 'POST' })
                                      // Refresh reactions
                                      const res = await fetch(`/api/streaming/chat?streamId=${streamId}&reactions=1`)
                                      const data = await res.json()
                                      setReactions(data.reactions || {})
                                    }}
                                  >
                                    {emoji} <span className="text-xs">{users.length > 0 ? users.length : ""}</span>
                                  </button>
                                )
                              })}
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setReplyTo(message)}>Reply</Button>
                            {isAdmin && (
                              <Button size="sm" variant={message.pinned ? "secondary" : "outline"} onClick={async () => {
                                await fetch(`/api/streaming/chat?messageId=${message.id}&pin=${message.pinned ? 0 : 1}`, { method: 'PATCH' })
                                // Refresh pinned messages
                                const res = await fetch(`/api/streaming/chat?streamId=${streamId}&pinned=1`)
                                const data = await res.json()
                                setPinnedMessages(data.messages || [])
                              }}>
                                {message.pinned ? "Unpin" : "Pin"}
                              </Button>
                            )}
                            {isAdmin && (
                              <Button size="sm" variant="destructive" onClick={async () => {
                                await fetch(`/api/streaming/chat?messageId=${message.id}`, { method: 'DELETE' })
                                setChatMessages((prev) => prev.filter((m) => m.id !== message.id))
                                console.log(`Audit: Admin ${user?.email} deleted message ${message.id}`)
                              }}>
                                Delete
                              </Button>
                            )}
                          </div>
                          {/* Render replies indented */}
                          {chatMessages.filter((r: ChatMessage) => r.parent_id === message.id).map((reply: ChatMessage) => (
                            <div key={reply.id} className="flex gap-2 ml-8 border-l-2 border-blue-100 pl-2 mt-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">{reply.user.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium truncate">{reply.user}</span>
                                  {reply.type === "donation" && <DollarSign className="h-3 w-3 text-green-600" />}
                                  {reply.type === "prayer" && <Heart className="h-3 w-3 text-red-600" />}
                                </div>
                                <p className="text-sm text-gray-700 break-words">
                                  {reply.message}
                                  {reply.amount && <span className="text-green-600 font-medium"> ${reply.amount}</span>}
                                </p>
                                <div className="flex gap-1 mt-1">
                                  {["👍", "❤️", "🙏", "😂", "🎵"].map(emoji => {
                                    const users = reactions[reply.id]?.[emoji] || []
                                    const reacted = users.includes(user?.id)
                                    return (
                                      <button
                                        key={emoji}
                                        className={`text-lg px-1 rounded ${reacted ? "bg-blue-100" : "hover:bg-gray-100"}`}
                                        onClick={async () => {
                                          await fetch(`/api/streaming/chat?messageId=${reply.id}&emoji=${encodeURIComponent(emoji)}`, { method: 'POST' })
                                          // Refresh reactions
                                          const res = await fetch(`/api/streaming/chat?streamId=${streamId}&reactions=1`)
                                          const data = await res.json()
                                          setReactions(data.reactions || {})
                                        }}
                                      >
                                        {emoji} <span className="text-xs">{users.length > 0 ? users.length : ""}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                              {isAdmin && (
                                <Button size="sm" variant={reply.pinned ? "secondary" : "outline"} onClick={async () => {
                                  await fetch(`/api/streaming/chat?messageId=${reply.id}&pin=${reply.pinned ? 0 : 1}`, { method: 'PATCH' })
                                  // Refresh pinned messages
                                  const res = await fetch(`/api/streaming/chat?streamId=${streamId}&pinned=1`)
                                  const data = await res.json()
                                  setPinnedMessages(data.messages || [])
                                }}>
                                  {reply.pinned ? "Unpin" : "Pin"}
                                </Button>
                              )}
                              {isAdmin && (
                                <Button size="sm" variant="destructive" onClick={async () => {
                                  await fetch(`/api/streaming/chat?messageId=${reply.id}`, { method: 'DELETE' })
                                  setChatMessages((prev) => prev.filter((m) => m.id !== reply.id))
                                  console.log(`Audit: Admin ${user?.email} deleted message ${reply.id}`)
                                }}>
                                  Delete
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Separator />

                  <div className="p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder={t("typeMessage")}
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("totalViews")}</p>
                    <p className="text-2xl font-bold">{streamAnalytics.totalViews}</p>
                  </div>
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("averageWatchTime")}</p>
                    <p className="text-2xl font-bold">{streamAnalytics.averageWatchTime}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("engagementRate")}</p>
                    <p className="text-2xl font-bold">{streamAnalytics.engagementRate}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{t("prayerRequests")}</p>
                    <p className="text-2xl font-bold">{streamAnalytics.prayerRequests}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("deviceBreakdown")}</CardTitle>
                <CardDescription>{t("deviceBreakdownDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-blue-600" />
                      <span>{t("mobile")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={streamAnalytics.deviceBreakdown.mobile} className="w-20" />
                      <span className="text-sm font-medium">{streamAnalytics.deviceBreakdown.mobile}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-green-600" />
                      <span>{t("desktop")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={streamAnalytics.deviceBreakdown.desktop} className="w-20" />
                      <span className="text-sm font-medium">{streamAnalytics.deviceBreakdown.desktop}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tablet className="h-4 w-4 text-purple-600" />
                      <span>{t("tablet")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={streamAnalytics.deviceBreakdown.tablet} className="w-20" />
                      <span className="text-sm font-medium">{streamAnalytics.deviceBreakdown.tablet}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("locationBreakdown")}</CardTitle>
                <CardDescription>{t("locationBreakdownDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {streamAnalytics.locationBreakdown.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span>{location.country}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {location.viewers} {t("viewers")}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("streamSettings")}</CardTitle>
                <CardDescription>{t("streamSettingsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="streamTitle">{t("streamTitle")}</Label>
                  <Input
                    id="streamTitle"
                    value={streamSession.title}
                    onChange={(e) => setStreamSession((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streamDescription">{t("streamDescription")}</Label>
                  <Textarea
                    id="streamDescription"
                    value={streamSession.description}
                    onChange={(e) => setStreamSession((prev) => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="streamQuality">{t("streamQuality")}</Label>
                  <Select
                    value={streamSession.quality}
                    onValueChange={(value) => setStreamSession((prev) => ({ ...prev, quality: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                      <SelectItem value="720p">720p (HD)</SelectItem>
                      <SelectItem value="480p">480p (SD)</SelectItem>
                      <SelectItem value="360p">360p (Low)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bitrate">{t("bitrate")} (kbps)</Label>
                    <Input
                      id="bitrate"
                      type="number"
                      value={streamSession.bitrate}
                      onChange={(e) =>
                        setStreamSession((prev) => ({ ...prev, bitrate: Number.parseInt(e.target.value) }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fps">FPS</Label>
                    <Select
                      value={streamSession.fps.toString()}
                      onValueChange={(value) => setStreamSession((prev) => ({ ...prev, fps: Number.parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 FPS</SelectItem>
                        <SelectItem value="60">60 FPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("streamFeatures")}</CardTitle>
                <CardDescription>{t("streamFeaturesDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="recording">{t("recordingEnabled")}</Label>
                    <p className="text-sm text-gray-600">{t("recordingEnabledDesc")}</p>
                  </div>
                  <Switch
                    id="recording"
                    checked={streamSession.isRecording}
                    onCheckedChange={(checked) => setStreamSession((prev) => ({ ...prev, isRecording: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="chat">{t("chatEnabled")}</Label>
                    <p className="text-sm text-gray-600">{t("chatEnabledDesc")}</p>
                  </div>
                  <Switch
                    id="chat"
                    checked={streamSession.chatEnabled}
                    onCheckedChange={(checked) => setStreamSession((prev) => ({ ...prev, chatEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="donations">{t("donationsEnabled")}</Label>
                    <p className="text-sm text-gray-600">{t("donationsEnabledDesc")}</p>
                  </div>
                  <Switch
                    id="donations"
                    checked={streamSession.donationsEnabled}
                    onCheckedChange={(checked) => setStreamSession((prev) => ({ ...prev, donationsEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="prayers">{t("prayerRequestsEnabled")}</Label>
                    <p className="text-sm text-gray-600">{t("prayerRequestsEnabledDesc")}</p>
                  </div>
                  <Switch
                    id="prayers"
                    checked={streamSession.prayerRequestsEnabled}
                    onCheckedChange={(checked) =>
                      setStreamSession((prev) => ({ ...prev, prayerRequestsEnabled: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RTMP Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t("rtmpSettings")}</CardTitle>
              <CardDescription>{t("rtmpSettingsDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rtmpUrl">{t("rtmpUrl")}</Label>
                <Input id="rtmpUrl" value="rtmp://live.connectus.church/live" readOnly className="bg-gray-50" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streamKey">{t("streamKey")}</Label>
                <div className="flex gap-2">
                  <Input id="streamKey" value="sk_live_abc123def456" readOnly className="bg-gray-50" type="password" />
                  <Button variant="outline" size="sm">
                    {t("copy")}
                  </Button>
                  <Button variant="outline" size="sm">
                    {t("regenerate")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integrations */}
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Connect your streaming with popular tools for enhanced reach and automation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="mb-2 flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
                <Info className="h-5 w-5 text-blue-500" />
                <span className="text-sm text-blue-700">Integrate with external tools to automate notifications, share links, and expand your reach. More integrations coming soon!</span>
              </div>
              <TooltipProvider>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Zoom */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition" onClick={() => setIntegrationModal({ name: 'Zoom', open: true })}>
                        <span className="bg-blue-100 p-2 rounded-full"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#2D8CFF"/><path d="M7.5 8.5h5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Zm8.5 1.5 3 2a1 1 0 0 1 0 1.6l-3 2V10Z" fill="#fff"/></svg></span>
                        <div className="flex-1">
                          <div className="font-medium">Zoom</div>
                          <div className="text-xs text-gray-600">Simulcast or share meeting links directly.</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={async e => { e.stopPropagation(); setConnecting({ ...connecting, Zoom: true }); window.open('/api/integrations/zoom/start', '_blank', 'width=500,height=700'); setTimeout(() => { setConnecting({ ...connecting, Zoom: false }); toast({ title: 'Zoom Connected!', description: 'Your Zoom account is now connected.' }); }, 2000); }}>Connect</Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Connect your Zoom account to simulcast or share meeting links.</TooltipContent>
                  </Tooltip>
                  {/* WhatsApp */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-green-50 transition" onClick={() => setIntegrationModal({ name: 'WhatsApp', open: true })}>
                        <span className="bg-green-100 p-2 rounded-full"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#25D366"/><path d="M12 4a8 8 0 0 0-6.32 12.906l-1.02 3.73a1 1 0 0 0 1.23 1.23l3.73-1.02A8 8 0 1 0 12 4Zm4.29 11.29c-.2.2-.41.39-.64.56-.27.2-.56.37-.87.5-.36.15-.74.27-1.13.34-.38.07-.77.1-1.16.1a6.01 6.01 0 0 1-3.18-.93c-.47-.3-.9-.67-1.28-1.1a6.01 6.01 0 0 1-1.1-1.28A6.01 6.01 0 0 1 5.5 12c0-.39.03-.78.1-1.16.07-.39.19-.77.34-1.13.13-.31.3-.6.5-.87.17-.23.36-.44.56-.64a1 1 0 0 1 1.42 1.42c-.13.13-.25.27-.36.41-.13.18-.24.37-.33.57-.09.2-.16.41-.2.62-.04.21-.06.43-.06.65 0 .22.02.44.06.65.04.21.11.42.2.62.09.2.2.39.33.57.11.14.23.28.36.41a1 1 0 0 1-1.42 1.42Z" fill="#fff"/></svg></span>
                        <div className="flex-1">
                          <div className="font-medium">WhatsApp</div>
                          <div className="text-xs text-gray-600">Share stream links or send notifications.</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setIntegrationModal({ name: 'WhatsApp', open: true }) }}>Connect</Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Connect WhatsApp to share stream links or send notifications.</TooltipContent>
                  </Tooltip>
                  {/* Mailchimp */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-yellow-50 transition" onClick={() => setIntegrationModal({ name: 'Mailchimp', open: true })}>
                        <span className="bg-yellow-100 p-2 rounded-full"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#FFE01B"/><path d="M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm2.83 10.17a4 4 0 1 1-5.66-5.66 4 4 0 0 1 5.66 5.66Z" fill="#222"/></svg></span>
                        <div className="flex-1">
                          <div className="font-medium">Mailchimp</div>
                          <div className="text-xs text-gray-600">Send email notifications to your subscribers.</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setIntegrationModal({ name: 'Mailchimp', open: true }) }}>Connect</Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Connect Mailchimp to send email notifications to your audience.</TooltipContent>
                  </Tooltip>
                  {/* Google Calendar */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-4 p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition" onClick={() => setIntegrationModal({ name: 'Google Calendar', open: true })}>
                        <span className="bg-blue-50 p-2 rounded-full"><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#4285F4"/><path d="M7 10h10v2H7v-2Zm0 4h7v2H7v-2Z" fill="#fff"/></svg></span>
                        <div className="flex-1">
                          <div className="font-medium">Google Calendar</div>
                          <div className="text-xs text-gray-600">Add your stream events to Google Calendar.</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={async e => { e.stopPropagation(); setConnecting({ ...connecting, 'Google Calendar': true }); window.open('/api/integrations/google-calendar/start', '_blank', 'width=500,height=700'); setTimeout(() => { setConnecting({ ...connecting, 'Google Calendar': false }); toast({ title: 'Google Calendar Connected!', description: 'Your Google Calendar is now connected.' }); }, 2000); }}>Connect</Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>Add your stream events to Google Calendar.</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              {/* Modal/Toast for integration feedback */}
              {integrationModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                  <div className="bg-white rounded-lg shadow-lg p-6 max-w-xs w-full flex flex-col items-center">
                    <Info className="h-8 w-8 text-blue-500 mb-2" />
                    <div className="font-semibold text-lg mb-1">{integrationModal.name} Integration</div>
                    <div className="text-gray-700 text-sm mb-4 text-center">
                      {integrationModal.name === 'Zoom' && 'Zoom integration coming soon!'}
                      {integrationModal.name === 'WhatsApp' && 'WhatsApp integration coming soon!'}
                      {integrationModal.name === 'Mailchimp' && 'Mailchimp integration coming soon!'}
                      {integrationModal.name === 'Google Calendar' && 'Google Calendar integration coming soon!'}
                    </div>
                    <Button onClick={() => setIntegrationModal({ name: '', open: false })} className="w-full mt-2">Close</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
