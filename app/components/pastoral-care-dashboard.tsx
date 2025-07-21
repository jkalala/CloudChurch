"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  Heart,
  Users,
  Calendar,
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  TrendingUp,
  Plus,
  Filter,
  Search,
  Bell,
  MessageSquare,
  UserCheck,
  Activity,
  Target,
  Lightbulb,
} from "lucide-react"
import {
  PastoralCareService,
  type CareRecord,
  type PrayerRequest,
  type CrisisAlert,
  type CareMetrics,
} from "@/lib/pastoral-care-service"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/components/auth-provider";

export default function PastoralCareDashboard() {
  const { language } = useAuth();
  const { t } = useTranslation(language);
  const [careRecords, setCareRecords] = useState<CareRecord[]>([])
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([])
  const [crisisAlerts, setCrisisAlerts] = useState<CrisisAlert[]>([])
  const [metrics, setMetrics] = useState<CareMetrics | null>(null)
  const [insights, setInsights] = useState<{ recommendations: string[]; trends: string[]; alerts: string[] } | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [records, prayers, crises, metricsData, insightsData] = await Promise.all([
        PastoralCareService.getCareRecords(),
        PastoralCareService.getPrayerRequests(),
        PastoralCareService.getCrisisAlerts(),
        PastoralCareService.getCareMetrics(),
        PastoralCareService.generateCareInsights(),
      ])

      setCareRecords(records)
      setPrayerRequests(prayers)
      setCrisisAlerts(crises)
      setMetrics(metricsData)
      setInsights(insightsData)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load pastoral care data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-purple-100 text-purple-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "resolved":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t("pastoralCare.title")}</h1>
            <p className="text-gray-600">{t("pastoralCare.description")}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            {t("common.filters")}
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("pastoralCare.newCareRecord")}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("pastoralCare.activeCases")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_active_cases}</div>
              <p className="text-xs text-muted-foreground">{metrics.urgent_cases} {t("pastoralCare.urgentCases")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("pastoralCare.prayerRequests")}</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.prayer_requests_active}</div>
              <p className="text-xs text-muted-foreground">{t("pastoralCare.activeRequests")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("pastoralCare.crisisAlerts")}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.crisis_alerts_active}</div>
              <p className="text-xs text-muted-foreground">{t("pastoralCare.requireAttention")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.care_team_utilization}%</div>
              <Progress value={metrics.care_team_utilization} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights */}
      {insights && (insights.alerts.length > 0 || insights.recommendations.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insights.alerts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Bell className="h-5 w-5" />
                  Urgent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                      <p className="text-sm text-red-700">{alert}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insights.recommendations.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                      <p className="text-sm text-blue-700">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="care-records">Care Records</TabsTrigger>
          <TabsTrigger value="prayer-requests">Prayer Requests</TabsTrigger>
          <TabsTrigger value="crisis-alerts">Crisis Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Care Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Care Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {careRecords.slice(0, 5).map((record) => (
                      <div key={record.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="p-2 rounded-full bg-blue-100">
                          <Heart className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm">{record.title}</h4>
                          <p className="text-xs text-gray-600 truncate">{record.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getPriorityColor(record.priority)} variant="outline">
                              {record.priority}
                            </Badge>
                            <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Active Prayer Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Active Prayer Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {prayerRequests
                      .filter((p) => p.status === "active")
                      .slice(0, 5)
                      .map((request) => (
                        <div key={request.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="p-2 rounded-full bg-purple-100">
                            <MessageSquare className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm">{request.title}</h4>
                            <p className="text-xs text-gray-600 truncate">{request.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getPriorityColor(request.priority)} variant="outline">
                                {request.priority}
                              </Badge>
                              <span className="text-xs text-gray-500">{request.prayer_count} prayers</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="care-records" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Care Records</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Record
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {careRecords.map((record) => (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{record.title}</h4>
                        <Badge className={getPriorityColor(record.priority)} variant="outline">
                          {record.priority}
                        </Badge>
                        <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{record.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {record.scheduled_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(record.scheduled_date).toLocaleDateString()}
                          </div>
                        )}
                        {record.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {record.location}
                          </div>
                        )}
                        {record.duration_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {record.duration_minutes} min
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prayer-requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Prayer Requests</h3>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
          </div>

          <div className="grid gap-4">
            {prayerRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{request.title}</h4>
                        <Badge className={getPriorityColor(request.priority)} variant="outline">
                          {request.priority}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        {request.is_anonymous && <Badge variant="secondary">Anonymous</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {request.prayer_count} prayers
                        </div>
                        <div className="flex items-center gap-1">
                          <UserCheck className="h-3 w-3" />
                          {request.requester_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Pray
                      </Button>
                      <Button variant="outline" size="sm">
                        Follow Up
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crisis-alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Crisis Alerts</h3>
            <Button size="sm" variant="destructive">
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          </div>

          <div className="grid gap-4">
            {crisisAlerts.map((alert) => (
              <Card key={alert.id} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h4 className="font-semibold text-red-800">{alert.title}</h4>
                        <Badge className="bg-red-100 text-red-800 border-red-200">{alert.severity}</Badge>
                        <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        {alert.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.location}
                          </div>
                        )}
                        {alert.contact_info && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {alert.contact_info}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(alert.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm">
                        Respond
                      </Button>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Care Team Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Care Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Response Time</span>
                    <span className="font-semibold">{metrics?.average_response_time}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Member Satisfaction</span>
                    <span className="font-semibold">{metrics?.member_satisfaction_score}/5.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cases Completed This Month</span>
                    <span className="font-semibold">{metrics?.completed_this_month}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Care Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights?.trends.map((trend, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                      <p className="text-sm">{trend}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
