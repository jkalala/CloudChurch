"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Zap,
  Brain,
  TrendingUp,
  Users,
  Mic,
  Mail,
  Music,
  BookOpen,
} from "lucide-react"
import AIAssistantChat from "./ai-assistant-chat"
import AIInsightsDashboard from "./ai-insights-dashboard"
import AIEmailGenerator from "./ai-email-generator"
import AIWorshipPlannerComponent from "./ai-worship-planner"
import AISermonAssistantComponent from "./ai-sermon-assistant"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/auth-provider"

export default function AIAssistantHub() {
  const [activeTab, setActiveTab] = useState("chat")
  const { language } = useAuth()
  const { t } = useTranslation(language)

  const features = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: t("aiAssistant.features.naturalLanguageQueries"),
      description: t("aiAssistant.features.naturalLanguageQueriesDesc"),
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: t("aiAssistant.features.predictiveAnalytics"),
      description: t("aiAssistant.features.predictiveAnalyticsDesc"),
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: t("aiAssistant.features.smartRecommendations"),
      description: t("aiAssistant.features.smartRecommendationsDesc"),
    },
    {
      icon: <Mic className="h-5 w-5" />,
      title: t("aiAssistant.features.voiceCommands"),
      description: t("aiAssistant.features.voiceCommandsDesc"),
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: t("aiAssistant.features.aiEmailGeneration"),
      description: t("aiAssistant.features.aiEmailGenerationDesc"),
    },
    {
      icon: <Music className="h-5 w-5" />,
      title: t("aiAssistant.features.worshipPlanning"),
      description: t("aiAssistant.features.worshipPlanningDesc"),
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t("aiAssistant.features.sermonAssistant"),
      description: t("aiAssistant.features.sermonAssistantDesc"),
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: t("aiAssistant.features.memberInsights"),
      description: t("aiAssistant.features.memberInsightsDesc"),
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: t("aiAssistant.features.growthAnalysis"),
      description: t("aiAssistant.features.growthAnalysisDesc"),
    },
  ]

  const quickActions = [
    { label: "Member Analysis", query: "Show me member statistics and trends" },
    { label: "Attendance Report", query: "What's our current attendance rate?" },
    { label: "Financial Summary", query: "Give me this month's financial summary" },
    { label: "Event Planning", query: "Show upcoming events and suggest improvements" },
    { label: "Growth Insights", query: "How is our church growing?" },
    { label: "Pastoral Care", query: "Which members need attention?" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("aiAssistant.title")}
            </h1>
            <p className="text-gray-600">{t("aiAssistant.subtitle")}</p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4 text-center">
                <div className="p-3 rounded-lg bg-white inline-flex mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email AI
          </TabsTrigger>
          <TabsTrigger value="worship" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Worship
          </TabsTrigger>
          <TabsTrigger value="sermon" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Sermon
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Quick Actions Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-3"
                      onClick={() => {
                        // This would trigger the chat with the predefined query
                        const chatInput = document.querySelector(
                          'input[placeholder*="Ask me anything"]',
                        ) as HTMLInputElement
                        if (chatInput) {
                          chatInput.value = action.query
                          chatInput.focus()
                        }
                      }}
                    >
                      <div>
                        <p className="font-medium text-sm">{action.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{action.query}</p>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-3">
              <AIAssistantChat />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <AIInsightsDashboard />
        </TabsContent>

        <TabsContent value="email">
          <AIEmailGenerator />
        </TabsContent>

        <TabsContent value="worship">
          <AIWorshipPlannerComponent />
        </TabsContent>

        <TabsContent value="sermon">
          <AISermonAssistantComponent />
        </TabsContent>
      </Tabs>

      {/* Stats Footer */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">∞</div>
              <div className="text-sm text-gray-600">Queries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">AI</div>
              <div className="text-sm text-gray-600">Powered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-pink-600">5</div>
              <div className="text-sm text-gray-600">AI Tools</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
