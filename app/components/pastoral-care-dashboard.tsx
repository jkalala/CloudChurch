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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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
  const [showCareModal, setShowCareModal] = useState(false);
  const [editingCare, setEditingCare] = useState<CareRecord | null>(null);
  const [careForm, setCareForm] = useState<Partial<CareRecord>>({});
  const [careFormLoading, setCareFormLoading] = useState(false);
  const [careFormError, setCareFormError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCare, setDeletingCare] = useState<CareRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<PrayerRequest | null>(null);
  const [prayerForm, setPrayerForm] = useState<Partial<PrayerRequest>>({});
  const [prayerFormLoading, setPrayerFormLoading] = useState(false);
  const [prayerFormError, setPrayerFormError] = useState<string | null>(null);
  const [showPrayerDeleteDialog, setShowPrayerDeleteDialog] = useState(false);
  const [deletingPrayer, setDeletingPrayer] = useState<PrayerRequest | null>(null);
  const [prayerDeleteLoading, setPrayerDeleteLoading] = useState(false);
  const [prayerDeleteError, setPrayerDeleteError] = useState<string | null>(null);
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [editingCrisis, setEditingCrisis] = useState<CrisisAlert | null>(null);
  const [crisisForm, setCrisisForm] = useState<Partial<CrisisAlert>>({});
  const [crisisFormLoading, setCrisisFormLoading] = useState(false);
  const [crisisFormError, setCrisisFormError] = useState<string | null>(null);
  const [showCrisisDeleteDialog, setShowCrisisDeleteDialog] = useState(false);
  const [deletingCrisis, setDeletingCrisis] = useState<CrisisAlert | null>(null);
  const [crisisDeleteLoading, setCrisisDeleteLoading] = useState(false);
  const [crisisDeleteError, setCrisisDeleteError] = useState<string | null>(null);

  // Handlers for modal
  const openNewCareModal = () => { setEditingCare(null); setCareForm({}); setShowCareModal(true); setCareFormError(null); };
  const openEditCareModal = (record: CareRecord) => { setEditingCare(record); setCareForm(record); setShowCareModal(true); setCareFormError(null); };
  const closeCareModal = () => { setShowCareModal(false); setEditingCare(null); setCareForm({}); setCareFormError(null); };
  const handleCareFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCareForm(prev => ({ ...prev, [name]: value }));
  };
  const handleCareFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCareFormLoading(true);
    setCareFormError(null);
    try {
      if (editingCare) {
        await PastoralCareService.updateCareRecord(editingCare.id, careForm);
      } else {
        await PastoralCareService.createCareRecord(careForm);
      }
      await loadDashboardData();
      closeCareModal();
    } catch (err: any) {
      setCareFormError(err.message || 'Erro ao salvar registro de cuidado');
    } finally {
      setCareFormLoading(false);
    }
  };
  // Delete handlers
  const openDeleteDialog = (record: CareRecord) => { setDeletingCare(record); setShowDeleteDialog(true); setDeleteError(null); };
  const closeDeleteDialog = () => { setShowDeleteDialog(false); setDeletingCare(null); setDeleteError(null); };
  const handleDeleteCare = async () => {
    if (!deletingCare) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await PastoralCareService.deleteCareRecord(deletingCare.id);
      await loadDashboardData();
      closeDeleteDialog();
    } catch (err: any) {
      setDeleteError(err.message || 'Erro ao excluir registro');
    } finally {
      setDeleteLoading(false);
    }
  };
  const openNewPrayerModal = () => { setEditingPrayer(null); setPrayerForm({}); setShowPrayerModal(true); setPrayerFormError(null); };
  const openEditPrayerModal = (request: PrayerRequest) => { setEditingPrayer(request); setPrayerForm(request); setShowPrayerModal(true); setPrayerFormError(null); };
  const closePrayerModal = () => { setShowPrayerModal(false); setEditingPrayer(null); setPrayerForm({}); setPrayerFormError(null); };
  const handlePrayerFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Only use checked for checkboxes
    const checked = (type === 'checkbox' && 'checked' in e.target) ? (e.target as HTMLInputElement).checked : undefined;
    setPrayerForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handlePrayerFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrayerFormLoading(true);
    setPrayerFormError(null);
    try {
      if (editingPrayer) {
        await PastoralCareService.updatePrayerRequest(editingPrayer.id, prayerForm);
      } else {
        await PastoralCareService.createPrayerRequest(prayerForm);
      }
      await loadDashboardData();
      closePrayerModal();
    } catch (err: any) {
      setPrayerFormError(err.message || 'Erro ao salvar pedido de oração');
    } finally {
      setPrayerFormLoading(false);
    }
  };
  // Delete handlers
  const openPrayerDeleteDialog = (request: PrayerRequest) => { setDeletingPrayer(request); setShowPrayerDeleteDialog(true); setPrayerDeleteError(null); };
  const closePrayerDeleteDialog = () => { setShowPrayerDeleteDialog(false); setDeletingPrayer(null); setPrayerDeleteError(null); };
  const handleDeletePrayer = async () => {
    if (!deletingPrayer) return;
    setPrayerDeleteLoading(true);
    setPrayerDeleteError(null);
    try {
      await PastoralCareService.deletePrayerRequest(deletingPrayer.id);
      await loadDashboardData();
      closePrayerDeleteDialog();
    } catch (err: any) {
      setPrayerDeleteError(err.message || 'Erro ao excluir pedido');
    } finally {
      setPrayerDeleteLoading(false);
    }
  };
  const openNewCrisisModal = () => { setEditingCrisis(null); setCrisisForm({}); setShowCrisisModal(true); setCrisisFormError(null); };
  const openEditCrisisModal = (alert: CrisisAlert) => { setEditingCrisis(alert); setCrisisForm(alert); setShowCrisisModal(true); setCrisisFormError(null); };
  const closeCrisisModal = () => { setShowCrisisModal(false); setEditingCrisis(null); setCrisisForm({}); setCrisisFormError(null); };
  const handleCrisisFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (type === 'checkbox' && 'checked' in e.target) ? (e.target as HTMLInputElement).checked : undefined;
    setCrisisForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleCrisisFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrisisFormLoading(true);
    setCrisisFormError(null);
    try {
      if (editingCrisis) {
        await PastoralCareService.updateCrisisAlert(editingCrisis.id, crisisForm);
      } else {
        await PastoralCareService.createCrisisAlert(crisisForm);
      }
      await loadDashboardData();
      closeCrisisModal();
    } catch (err: any) {
      setCrisisFormError(err.message || 'Erro ao salvar alerta de crise');
    } finally {
      setCrisisFormLoading(false);
    }
  };
  // Delete handlers
  const openCrisisDeleteDialog = (alert: CrisisAlert) => { setDeletingCrisis(alert); setShowCrisisDeleteDialog(true); setCrisisDeleteError(null); };
  const closeCrisisDeleteDialog = () => { setShowCrisisDeleteDialog(false); setDeletingCrisis(null); setCrisisDeleteError(null); };
  const handleDeleteCrisis = async () => {
    if (!deletingCrisis) return;
    setCrisisDeleteLoading(true);
    setCrisisDeleteError(null);
    try {
      await PastoralCareService.deleteCrisisAlert(deletingCrisis.id);
      await loadDashboardData();
      closeCrisisDeleteDialog();
    } catch (err: any) {
      setCrisisDeleteError(err.message || 'Erro ao excluir alerta');
    } finally {
      setCrisisDeleteLoading(false);
    }
  };

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
              <Button size="sm" onClick={openNewCareModal}>
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
                      <Button variant="outline" size="sm" onClick={() => openEditCareModal(record)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(record)}>
                        Delete
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
            <Button size="sm" onClick={openNewPrayerModal}>
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
                      <Button variant="outline" size="sm" onClick={() => openEditPrayerModal(request)}>
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Pray
                      </Button>
                      <Button variant="outline" size="sm">
                        Follow Up
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openPrayerDeleteDialog(request)}>
                        Delete
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
            <Button size="sm" onClick={openNewCrisisModal}>
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
                      <Button variant="outline" size="sm" onClick={() => openEditCrisisModal(alert)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openCrisisDeleteDialog(alert)}>
                        Delete
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
      {/* Care Record Modal */}
      <Dialog open={showCareModal} onOpenChange={setShowCareModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCare ? 'Edit Care Record' : 'New Care Record'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCareFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="title">Title</label>
              <input name="title" value={careForm.title || ''} onChange={handleCareFormChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <textarea name="description" value={careForm.description || ''} onChange={handleCareFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="priority">Priority</label>
              <select name="priority" value={careForm.priority || ''} onChange={handleCareFormChange} required className="w-full border rounded px-2 py-1">
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="status">Status</label>
              <select name="status" value={careForm.status || ''} onChange={handleCareFormChange} required className="w-full border rounded px-2 py-1">
                <option value="">Select</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="follow_up_needed">Follow Up Needed</option>
              </select>
            </div>
            <div>
              <label htmlFor="scheduled_date">Scheduled Date</label>
              <input type="date" name="scheduled_date" value={careForm.scheduled_date || ''} onChange={handleCareFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            {careFormError && <div className="text-red-600 text-sm">{careFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCareModal} disabled={careFormLoading}>Cancel</Button>
              <Button type="submit" disabled={careFormLoading}>{careFormLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Care Record</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this care record?</div>
          {deleteError && <div className="text-red-600 text-sm">{deleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteDialog} disabled={deleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteCare} disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Prayer Request Modal */}
      <Dialog open={showPrayerModal} onOpenChange={setShowPrayerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPrayer ? 'Edit Prayer Request' : 'New Prayer Request'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePrayerFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="title">Title</label>
              <input name="title" value={prayerForm.title || ''} onChange={handlePrayerFormChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <textarea name="description" value={prayerForm.description || ''} onChange={handlePrayerFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="priority">Priority</label>
              <select name="priority" value={prayerForm.priority || ''} onChange={handlePrayerFormChange} required className="w-full border rounded px-2 py-1">
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label htmlFor="status">Status</label>
              <select name="status" value={prayerForm.status || ''} onChange={handlePrayerFormChange} required className="w-full border rounded px-2 py-1">
                <option value="">Select</option>
                <option value="active">Active</option>
                <option value="answered">Answered</option>
                <option value="ongoing">Ongoing</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label htmlFor="is_anonymous">
                <input type="checkbox" name="is_anonymous" checked={!!prayerForm.is_anonymous} onChange={handlePrayerFormChange} /> Anonymous
              </label>
            </div>
            <div>
              <label htmlFor="is_public">
                <input type="checkbox" name="is_public" checked={!!prayerForm.is_public} onChange={handlePrayerFormChange} /> Public
              </label>
            </div>
            {prayerFormError && <div className="text-red-600 text-sm">{prayerFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closePrayerModal} disabled={prayerFormLoading}>Cancel</Button>
              <Button type="submit" disabled={prayerFormLoading}>{prayerFormLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Prayer Delete Confirmation Dialog */}
      <Dialog open={showPrayerDeleteDialog} onOpenChange={setShowPrayerDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prayer Request</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this prayer request?</div>
          {prayerDeleteError && <div className="text-red-600 text-sm">{prayerDeleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closePrayerDeleteDialog} disabled={prayerDeleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeletePrayer} disabled={prayerDeleteLoading}>{prayerDeleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Crisis Alert Modal */}
      <Dialog open={showCrisisModal} onOpenChange={setShowCrisisModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCrisis ? 'Edit Crisis Alert' : 'New Crisis Alert'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCrisisFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="title">Title</label>
              <input name="title" value={crisisForm.title || ''} onChange={handleCrisisFormChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <textarea name="description" value={crisisForm.description || ''} onChange={handleCrisisFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="severity">Severity</label>
              <select name="severity" value={crisisForm.severity || ''} onChange={handleCrisisFormChange} required className="w-full border rounded px-2 py-1">
                <option value="">Select</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label htmlFor="status">Status</label>
              <select name="status" value={crisisForm.status || ''} onChange={handleCrisisFormChange} required className="w-full border rounded px-2 py-1">
                <option value="">Select</option>
                <option value="active">Active</option>
                <option value="responding">Responding</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>
            <div>
              <label htmlFor="alert_type">Alert Type</label>
              <select name="alert_type" value={crisisForm.alert_type || ''} onChange={handleCrisisFormChange} required className="w-full border rounded px-2 py-1">
                <option value="">Select</option>
                <option value="medical">Medical</option>
                <option value="mental_health">Mental Health</option>
                <option value="family_crisis">Family Crisis</option>
                <option value="financial">Financial</option>
                <option value="spiritual">Spiritual</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            {crisisFormError && <div className="text-red-600 text-sm">{crisisFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCrisisModal} disabled={crisisFormLoading}>Cancel</Button>
              <Button type="submit" disabled={crisisFormLoading}>{crisisFormLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Crisis Delete Confirmation Dialog */}
      <Dialog open={showCrisisDeleteDialog} onOpenChange={setShowCrisisDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Crisis Alert</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this crisis alert?</div>
          {crisisDeleteError && <div className="text-red-600 text-sm">{crisisDeleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeCrisisDeleteDialog} disabled={crisisDeleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteCrisis} disabled={crisisDeleteLoading}>{crisisDeleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
