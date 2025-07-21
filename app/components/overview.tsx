"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, DollarSign, TrendingUp, UserPlus, CalendarDays, PiggyBank, Activity } from "lucide-react"
import { useTranslation } from "@/lib/i18n";
import { useAuth } from "@/components/auth-provider";

export default function Overview() {
  const { language } = useAuth();
  const { t } = useTranslation(language);
  const stats = {
    totalMembers: 247,
    newMembersThisMonth: 12,
    activeMembers: 231,
    upcomingEvents: 5,
    thisMonthDonations: 45000,
    attendanceRate: 78,
  }

  const recentActivities = [
    {
      id: 1,
      type: "member_joined",
      description: "Maria Silva se juntou à igreja",
      time: "2 horas atrás",
      icon: UserPlus,
    },
    {
      id: 2,
      type: "event_created",
      description: "Culto de Jovens foi agendado",
      time: "5 horas atrás",
      icon: CalendarDays,
    },
    {
      id: 3,
      type: "donation_received",
      description: "Doação de AOA 5.000 recebida",
      time: "1 dia atrás",
      icon: PiggyBank,
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "Culto Dominical",
      date: "2024-01-28",
      time: "10:00",
      attendees: 150,
    },
    {
      id: 2,
      title: "Reunião de Oração",
      date: "2024-01-30",
      time: "19:00",
      attendees: 45,
    },
    {
      id: 3,
      title: "Estudo Bíblico",
      date: "2024-02-01",
      time: "18:30",
      attendees: 32,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.totalMembers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">+{stats.newMembersThisMonth} {t("overview.thisMonth")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.activeMembers")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMembers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.activeMembers / stats.totalMembers) * 100)}% {t("overview.ofTotal")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.upcomingEvents")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">{t("overview.next7Days")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("pt-AO", {
                style: "currency",
                currency: "AOA",
              }).format(stats.thisMonthDonations)}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas atividades na igreja</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon
                return (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <IconComponent className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>Eventos agendados para os próximos dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("pt-BR")} às {event.time}
                    </p>
                  </div>
                  <Badge variant="secondary">{event.attendees} pessoas</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Presença</CardTitle>
          <CardDescription>Presença média nos últimos cultos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Presença Média</span>
              <span>{stats.attendanceRate}%</span>
            </div>
            <Progress value={stats.attendanceRate} className="h-2" />
            <p className="text-xs text-muted-foreground">Baseado nos últimos 4 cultos dominicais</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
