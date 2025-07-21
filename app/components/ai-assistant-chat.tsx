"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Sparkles,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Heart,
  Lightbulb,
  Info,
} from "lucide-react"
import { AIAssistant } from "@/lib/ai-assistant"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import SpeechRecognition from "@/lib/speech-recognition"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: string
  suggestions?: string[]
  data?: any
}

export default function AIAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const { language } = useAuth()
  const { t } = useTranslation(language)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognition = useRef<any>(null)
  const [showHelpBanner, setShowHelpBanner] = useState(true)
  const quickSuggestions = [
    t("aiAssistant.suggestions.memberStats"),
    t("aiAssistant.suggestions.attendanceRate"),
    t("aiAssistant.suggestions.upcomingEvents"),
    t("aiAssistant.suggestions.memberCare"),
    t("aiAssistant.suggestions.financialSummary"),
    t("aiAssistant.suggestions.sermonTopic"),
    t("aiAssistant.suggestions.birthdays"),
    t("aiAssistant.suggestions.recentDonations"),
  ];

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      type: "assistant",
      content: t("aiAssistant.chat.welcome"),
      timestamp: new Date().toISOString(),
      suggestions: quickSuggestions.slice(0, 5),
    }
    setMessages([welcomeMessage])
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition()
      if (recognition.current) {
        recognition.current.continuous = false
        recognition.current.interimResults = false
        recognition.current.lang = language === "pt" ? "pt-PT" : language === "fr" ? "fr-FR" : "en-US"

        recognition.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognition.current.onerror = () => {
          setIsListening(false)
          toast({
            title: "Voice Recognition Error",
            description: "Could not process voice input. Please try again.",
            variant: "destructive",
          })
        }

        recognition.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [language])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const aiResponse = await AIAssistant.processQuery(input)

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: "assistant",
        content: aiResponse.response,
        timestamp: aiResponse.timestamp,
        suggestions: aiResponse.suggestions,
        data: aiResponse.data,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = () => {
    if (!recognition.current) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      recognition.current.stop()
      setIsListening(false)
    } else {
      recognition.current.start()
      setIsListening(true)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "member_care":
        return <Heart className="h-4 w-4 text-pink-500" />
      case "attendance":
        return <Users className="h-4 w-4 text-blue-500" />
      case "financial":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "events":
        return <Calendar className="h-4 w-4 text-purple-500" />
      case "growth":
        return <TrendingUp className="h-4 w-4 text-orange-500" />
      default:
        return <Lightbulb className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Onboarding/Help Banner */}
      {showHelpBanner && (
        <Card className="bg-blue-50 border-blue-200 mb-2">
          <CardContent className="flex items-center gap-4 py-3">
            <Info className="h-6 w-6 text-blue-500" />
            <div className="flex-1">
              <div className="font-semibold text-blue-700">{t("aiAssistant.chat.bannerTitle")}</div>
              <div className="text-sm text-blue-700">
                {t("aiAssistant.chat.bannerDesc")}
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowHelpBanner(false)}>
              {t("common.cancel")}
            </Button>
          </CardContent>
        </Card>
      )}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          {t("aiAssistant.title")}
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            {t("aiAssistant.chat.smart")}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.type === "assistant" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] ${message.type === "user" ? "order-1" : ""}`}>
                  <div
                    className={`p-3 rounded-lg ${
                      message.type === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}

                  {message.data && (
                    <div className="mt-2 p-2 bg-blue-50 rounded-lg border">
                      <div className="flex items-center gap-1 mb-1">
                        {getMessageIcon("data")}
                        <span className="text-xs font-medium text-gray-600">Data Insight</span>
                      </div>
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(message.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</p>
                </div>

                {message.type === "user" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-gray-600">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
        {/* Quick Suggestions Row */}
        <div className="px-4 pt-2 pb-1">
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
        {/* Input Area with Tooltips */}
        <TooltipProvider>
          <div className="p-4 border-t flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your church..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                  className="flex-1"
                />
              </TooltipTrigger>
              <TooltipContent>Type your question or request here.</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  className={isListening ? "bg-red-50 border-red-200" : ""}
                >
                  {isListening ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isListening ? "Stop voice input" : "Start voice input (microphone)"}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send your message</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
