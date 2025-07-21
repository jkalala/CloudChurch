"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Plus, Filter } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function EventsManager() {
  const { t } = useTranslation()
  const [view, setView] = useState("grid")

  const events = [
    {
      id: "1",
      title: t("events.sample.sundayServiceTitle"),
      description: t("events.sample.sundayServiceDesc"),
      date: "2024-01-07",
      time: "09:00",
      location: t("events.sample.mainSanctuary"),
      type: "worship",
      attendees: 150,
      maxAttendees: 200,
      status: "confirmed",
    },
    {
      id: "2",
      title: t("events.sample.bibleStudyTitle"),
      description: t("events.sample.bibleStudyDesc"),
      date: "2024-01-10",
      time: "19:00",
      location: t("events.sample.studyRoom"),
      type: "study",
      attendees: 25,
      maxAttendees: 30,
      status: "confirmed",
    },
    {
      id: "3",
      title: t("events.sample.outreachTitle"),
      description: t("events.sample.outreachDesc"),
      date: "2024-01-13",
      time: "15:00",
      location: t("events.sample.centralSquare"),
      type: "outreach",
      attendees: 12,
      maxAttendees: 20,
      status: "planning",
    },
  ]

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "worship":
        return "bg-blue-100 text-blue-800"
      case "study":
        return "bg-green-100 text-green-800"
      case "outreach":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("events")}</h2>
          <p className="text-gray-600">Gerencie eventos e atividades da igreja</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t("createEvent")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Participantes</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Próximos</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Locais</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="mt-1">{event.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(event.status)}>
                  {event.status === "confirmed"
                    ? "Confirmado"
                    : event.status === "planning"
                      ? "Planejando"
                      : "Cancelado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.date).toLocaleDateString("pt-BR")}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {event.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {event.attendees}/{event.maxAttendees} participantes
                </div>
                <Badge className={getEventTypeColor(event.type)}>
                  {event.type === "worship" ? "Culto" : event.type === "study" ? "Estudo" : "Evangelismo"}
                </Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
                <Button size="sm" className="flex-1">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
