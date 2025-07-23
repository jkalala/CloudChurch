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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function AIAssistantHub() {
  const [activeTab, setActiveTab] = useState("chat")
  const { language } = useAuth()
  const { t } = useTranslation(language)

  // Add state for feature modal
  const [selectedFeature, setSelectedFeature] = useState<null | { title: string, description: string, extended?: string, icon: JSX.Element, example?: string, benefits?: string[], tryLink?: string }>(null)

  const features = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      title: t("aiAssistant.features.naturalLanguageQueries"),
      description: t("aiAssistant.features.naturalLanguageQueriesDesc"),
      extended: t("aiAssistant.features.naturalLanguageQueriesExtended") || "Ask questions in plain English and get instant answers about your church data, events, and more.",
      example: t("aiAssistant.features.naturalLanguageQueriesExample") || "Example: 'How many members joined last month?'",
      benefits: [
        t("aiAssistant.features.naturalLanguageQueriesBenefit1") || "No technical skills required.",
        t("aiAssistant.features.naturalLanguageQueriesBenefit2") || "Instant answers from your real data.",
        t("aiAssistant.features.naturalLanguageQueriesBenefit3") || "Works across all church modules.",
      ],
      tryLink: "#chat"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: t("aiAssistant.features.predictiveAnalytics"),
      description: t("aiAssistant.features.predictiveAnalyticsDesc"),
      extended: t("aiAssistant.features.predictiveAnalyticsExtended") || "See trends and forecasts for attendance, giving, and growth based on your real data.",
      example: t("aiAssistant.features.predictiveAnalyticsExample") || "Example: 'Show me attendance trends for the past year.'",
      benefits: [
        t("aiAssistant.features.predictiveAnalyticsBenefit1") || "Visualize growth and giving.",
        t("aiAssistant.features.predictiveAnalyticsBenefit2") || "Spot patterns and plan ahead.",
        t("aiAssistant.features.predictiveAnalyticsBenefit3") || "Data-driven decision making.",
      ],
      tryLink: "#insights"
    },
    {
      icon: <Lightbulb className="h-5 w-5" />,
      title: t("aiAssistant.features.smartRecommendations"),
      description: t("aiAssistant.features.smartRecommendationsDesc"),
      extended: t("aiAssistant.features.smartRecommendationsExtended") || "Get actionable suggestions for events, outreach, and member engagement.",
      example: t("aiAssistant.features.smartRecommendationsExample") || "Example: 'Suggest an outreach event for next weekend.'",
      benefits: [
        t("aiAssistant.features.smartRecommendationsBenefit1") || "Data-driven insights.",
        t("aiAssistant.features.smartRecommendationsBenefit2") || "Actionable suggestions.",
        t("aiAssistant.features.smartRecommendationsBenefit3") || "Optimized for your church's needs.",
      ],
      tryLink: "#chat"
    },
    {
      icon: <Mic className="h-5 w-5" />,
      title: t("aiAssistant.features.voiceCommands"),
      description: t("aiAssistant.features.voiceCommandsDesc"),
      extended: t("aiAssistant.features.voiceCommandsExtended") || "Control the assistant with your voice for hands-free operation.",
      example: t("aiAssistant.features.voiceCommandsExample") || "Example: 'Hey, assistant, show me the attendance report.'",
      benefits: [
        t("aiAssistant.features.voiceCommandsBenefit1") || "Hands-free operation.",
        t("aiAssistant.features.voiceCommandsBenefit2") || "Increased accessibility.",
        t("aiAssistant.features.voiceCommandsBenefit3") || "More efficient data access.",
      ],
      tryLink: "#chat"
    },
    {
      icon: <Mail className="h-5 w-5" />,
      title: t("aiAssistant.features.aiEmailGeneration"),
      description: t("aiAssistant.features.aiEmailGenerationDesc"),
      extended: t("aiAssistant.features.aiEmailGenerationExtended") || "Draft personalized emails for follow-ups, invitations, and more in seconds.",
      example: t("aiAssistant.features.aiEmailGenerationExample") || "Example: 'Draft an email for the new member welcome.'",
      benefits: [
        t("aiAssistant.features.aiEmailGenerationBenefit1") || "Time-saving.",
        t("aiAssistant.features.aiEmailGenerationBenefit2") || "Personalized content.",
        t("aiAssistant.features.aiEmailGenerationBenefit3") || "Improved engagement.",
      ],
      tryLink: "#email"
    },
    {
      icon: <Music className="h-5 w-5" />,
      title: t("aiAssistant.features.worshipPlanning"),
      description: t("aiAssistant.features.worshipPlanningDesc"),
      extended: t("aiAssistant.features.worshipPlanningExtended") || "Plan worship sets with AI-powered song suggestions and setlist optimization.",
      example: t("aiAssistant.features.worshipPlanningExample") || "Example: 'Suggest a setlist for Sunday morning.'",
      benefits: [
        t("aiAssistant.features.worshipPlanningBenefit1") || "Faster setlist creation.",
        t("aiAssistant.features.worshipPlanningBenefit2") || "Song suggestions tailored to your theme.",
        t("aiAssistant.features.worshipPlanningBenefit3") || "Optimized key and flow.",
      ],
      tryLink: "#worship"
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: t("aiAssistant.features.sermonAssistant"),
      description: t("aiAssistant.features.sermonAssistantDesc"),
      extended: t("aiAssistant.features.sermonAssistantExtended") || "Get help with sermon outlines, illustrations, and scripture references.",
      example: t("aiAssistant.features.sermonAssistantExample") || "Example: 'Help me with a sermon outline on forgiveness.'",
      benefits: [
        t("aiAssistant.features.sermonAssistantBenefit1") || "Quick sermon preparation.",
        t("aiAssistant.features.sermonAssistantBenefit2") || "Better scriptural accuracy.",
        t("aiAssistant.features.sermonAssistantBenefit3") || "More engaging content.",
      ],
      tryLink: "#sermon"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: t("aiAssistant.features.memberInsights"),
      description: t("aiAssistant.features.memberInsightsDesc"),
      extended: t("aiAssistant.features.memberInsightsExtended") || "See engagement, attendance, and care needs for your members.",
      example: t("aiAssistant.features.memberInsightsExample") || "Example: 'Analyze member engagement trends.'",
      benefits: [
        t("aiAssistant.features.memberInsightsBenefit1") || "Better member care.",
        t("aiAssistant.features.memberInsightsBenefit2") || "More targeted outreach.",
        t("aiAssistant.features.memberInsightsBenefit3") || "Improved retention.",
      ],
      tryLink: "#insights"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: t("aiAssistant.features.growthAnalysis"),
      description: t("aiAssistant.features.growthAnalysisDesc"),
      extended: t("aiAssistant.features.growthAnalysisExtended") || "Analyze growth patterns and discover opportunities for outreach.",
      example: t("aiAssistant.features.growthAnalysisExample") || "Example: 'Analyze our church's growth patterns.'",
      benefits: [
        t("aiAssistant.features.growthAnalysisBenefit1") || "Identify growth opportunities.",
        t("aiAssistant.features.growthAnalysisBenefit2") || "Better strategic planning.",
        t("aiAssistant.features.growthAnalysisBenefit3") || "Data-driven decision making.",
      ],
      tryLink: "#insights"
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
              className="border-0 bg-gradient-to-br from-gray-50 to-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={e => { console.log('Card clicked:', feature.title); setSelectedFeature(feature); }}
              tabIndex={0}
              role="button"
              aria-label={`Learn more about ${feature.title}`}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedFeature(feature) }}
            >
              <CardContent className="p-4 text-center" style={{ pointerEvents: 'auto' }}>
                <div className="p-3 rounded-lg bg-white inline-flex mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
                <span className="text-xs text-green-700 font-bold block mt-2">[DEBUG: Clickable]</span>
              </CardContent>
            </Card>
          ))}
        </div>

      {/* Feature Detail Modal */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedFeature?.icon}
              {selectedFeature?.title}
            </DialogTitle>
            <DialogDescription>{selectedFeature?.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-700 whitespace-pre-line">{selectedFeature?.extended}</p>
            {selectedFeature?.example && (
              <div className="bg-gray-50 border-l-4 border-blue-400 p-3 rounded">
                <span className="block text-xs font-semibold text-blue-700 mb-1">Example Use Case:</span>
                <span className="text-sm text-gray-800">{selectedFeature.example}</span>
              </div>
            )}
            {selectedFeature?.benefits && (
              <div>
                <span className="block text-xs font-semibold text-green-700 mb-1">Key Benefits:</span>
                <ul className="list-disc list-inside text-sm text-gray-800 space-y-1">
                  {selectedFeature.benefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            {selectedFeature?.tryLink && (
              <a href={selectedFeature.tryLink} className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" tabIndex={0} role="button">Try this feature</a>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
