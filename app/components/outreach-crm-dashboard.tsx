"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Target,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  TrendingUp,
  Heart,
  Handshake,
  Clock,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Building,
  Activity,
} from "lucide-react"
import {
  OutreachCRMService,
  type CommunityContact,
  type OutreachProgram,
  type OutreachEvent,
  type VolunteerProfile,
  type CommunityPartnership,
} from "@/lib/outreach-crm-service"
import { useTranslation } from "@/lib/i18n";

export default function OutreachCRMDashboard() {
  const [contacts, setContacts] = useState<CommunityContact[]>([])
  const [programs, setPrograms] = useState<OutreachProgram[]>([])
  const [events, setEvents] = useState<OutreachEvent[]>([])
  const [volunteers, setVolunteers] = useState<VolunteerProfile[]>([])
  const [partnerships, setPartnerships] = useState<CommunityPartnership[]>([])
  const [analytics, setAnalytics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { t } = useTranslation();

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [contactsData, programsData, eventsData, volunteersData, partnershipsData, analyticsData] =
        await Promise.all([
          OutreachCRMService.getCommunityContacts(),
          OutreachCRMService.getOutreachPrograms(),
          OutreachCRMService.getOutreachEvents(),
          OutreachCRMService.getVolunteerProfiles(),
          OutreachCRMService.getCommunityPartnerships(),
          OutreachCRMService.getOutreachAnalytics(),
        ])

      setContacts(contactsData)
      setPrograms(programsData)
      setEvents(eventsData)
      setVolunteers(volunteersData)
      setPartnerships(partnershipsData)
      setAnalytics(analyticsData)
    } catch (error) {
      console.error("Error loading outreach data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      engaged: "bg-green-100 text-green-800",
      member: "bg-purple-100 text-purple-800",
      inactive: "bg-gray-100 text-gray-800",
      active: "bg-green-100 text-green-800",
      planning: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
      confirmed: "bg-green-100 text-green-800",
      planned: "bg-blue-100 text-blue-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getPriorityIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      case "engaged":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "member":
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      default:
        return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || contact.contact_status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("outreachCRM.title")}</h2>
          <p className="text-gray-600">{t("outreachCRM.description")}</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-4 w-4 mr-2" />
            {t("outreachCRM.addContact")}
          </Button>
          <Button variant="outline" className="bg-white/80 text-gray-700">
            <UserPlus className="h-4 w-4 mr-2" />
            {t("outreachCRM.newProgram")}
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-xl font-bold">{analytics.totalContacts}</p>
                <p className="text-xs text-green-600">+{analytics.newContacts} new this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-xl font-bold">{analytics.conversionRate}%</p>
                <p className="text-xs text-gray-600">{analytics.convertedMembers} new members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Active Programs</p>
                <p className="text-xl font-bold">{analytics.activePrograms}</p>
                <p className="text-xs text-gray-600">{analytics.totalParticipants} participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Volunteer Hours</p>
                <p className="text-xl font-bold">{analytics.totalVolunteerHours}</p>
                <p className="text-xs text-gray-600">{analytics.activeVolunteers} active volunteers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="contacts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
        </TabsList>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <CardTitle>Community Contacts</CardTitle>
                  <CardDescription>Manage relationships with community members</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="contacted">Contacted</SelectItem>
                      <SelectItem value="engaged">Engaged</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {contact.first_name[0]}
                            {contact.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {contact.first_name} {contact.last_name}
                            </h3>
                            {getPriorityIcon(contact.contact_status)}
                            <Badge className={getStatusColor(contact.contact_status)}>{contact.contact_status}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            {contact.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {contact.phone}
                              </div>
                            )}
                            {contact.address && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {contact.address}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline">Family: {contact.family_size}</Badge>
                            <Badge variant="outline">{contact.age_group}</Badge>
                            <Badge variant="outline">Source: {contact.contact_source}</Badge>
                          </div>
                          {contact.interests && contact.interests.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Interests:</span> {contact.interests.join(", ")}
                            </div>
                          )}
                          {contact.needs && contact.needs.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Needs:</span> {contact.needs.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          View Details
                        </Button>
                      </div>
                    </div>
                    {contact.next_follow_up_date && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Clock className="h-4 w-4" />
                          Follow-up scheduled: {new Date(contact.next_follow_up_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Programs Tab */}
        <TabsContent value="programs" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Outreach Programs</CardTitle>
              <CardDescription>Manage and track community outreach programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {programs.map((program) => (
                  <div key={program.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Target className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{program.name}</h3>
                            <p className="text-sm text-gray-600">{program.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3 ml-13">
                          <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                          <Badge variant="outline">{program.program_type}</Badge>
                          <Badge variant="outline">
                            <Users className="h-3 w-3 mr-1" />
                            {program.impact_metrics?.people_served || 0} served
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm ml-13">
                          <div>
                            <span className="font-medium text-gray-700">Budget:</span>
                            <div className="text-gray-600">
                              ${program.budget_spent || 0} / ${program.budget_allocated || 0}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Volunteers:</span>
                            <div className="text-gray-600">{program.impact_metrics?.volunteers_involved || 0}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Start Date:</span>
                            <div className="text-gray-600">{new Date(program.start_date).toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Location:</span>
                            <div className="text-gray-600">{program.location || "TBD"}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          Edit Program
                        </Button>
                      </div>
                    </div>
                    {program.budget_allocated && (
                      <div className="ml-13">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Budget Usage</span>
                          <span>{Math.round(((program.budget_spent || 0) / program.budget_allocated) * 100)}%</span>
                        </div>
                        <Progress
                          value={((program.budget_spent || 0) / program.budget_allocated) * 100}
                          className="h-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Outreach Events</CardTitle>
              <CardDescription>Schedule and manage community outreach events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{event.title}</h3>
                            <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.date).toLocaleDateString()}
                            </div>
                            {event.start_time && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.start_time} - {event.end_time}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{event.event_type}</Badge>
                            {event.actual_participants && (
                              <Badge variant="outline">{event.actual_participants} participants</Badge>
                            )}
                            {event.volunteers_registered && (
                              <Badge variant="outline">{event.volunteers_registered} volunteers</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          Manage Event
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Volunteers Tab */}
        <TabsContent value="volunteers" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Volunteer Management</CardTitle>
              <CardDescription>Coordinate and manage outreach volunteers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {volunteers.map((volunteer) => (
                  <div key={volunteer.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {volunteer.first_name[0]}
                            {volunteer.last_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {volunteer.first_name} {volunteer.last_name}
                            </h3>
                            <Badge className={getStatusColor(volunteer.status)}>{volunteer.status}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            {volunteer.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {volunteer.email}
                              </div>
                            )}
                            {volunteer.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {volunteer.phone}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline">{volunteer.experience_level}</Badge>
                            <Badge variant="outline">{volunteer.hours_contributed} hours</Badge>
                            {volunteer.background_check_status && (
                              <Badge
                                variant="outline"
                                className={
                                  volunteer.background_check_status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {volunteer.background_check_status}
                              </Badge>
                            )}
                          </div>
                          {volunteer.skills && volunteer.skills.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Skills:</span> {volunteer.skills.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          Assign Tasks
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partnerships Tab */}
        <TabsContent value="partnerships" className="space-y-6">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Community Partnerships</CardTitle>
              <CardDescription>Manage relationships with community organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {partnerships.map((partnership) => (
                  <div key={partnership.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{partnership.organization_name}</h3>
                            <Badge className={getStatusColor(partnership.partnership_status)}>
                              {partnership.partnership_status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {partnership.contact_person}
                            </div>
                            {partnership.contact_email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {partnership.contact_email}
                              </div>
                            )}
                            {partnership.contact_phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {partnership.contact_phone}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge variant="outline">{partnership.partnership_type}</Badge>
                            {partnership.agreement_date && (
                              <Badge variant="outline">
                                Since {new Date(partnership.agreement_date).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                          {partnership.collaboration_areas && partnership.collaboration_areas.length > 0 && (
                            <div className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Collaboration:</span>{" "}
                              {partnership.collaboration_areas.join(", ")}
                            </div>
                          )}
                          {partnership.joint_programs && partnership.joint_programs.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Programs:</span> {partnership.joint_programs.join(", ")}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          <Handshake className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white text-gray-700">
                          View Details
                        </Button>
                      </div>
                    </div>
                    {partnership.renewal_date && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-orange-600">
                          <Clock className="h-4 w-4" />
                          Renewal due: {new Date(partnership.renewal_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Panel */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common outreach management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-50">
              <UserPlus className="h-6 w-6" />
              <span className="text-sm">Add New Contact</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-50">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Event</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-50">
              <Target className="h-6 w-6" />
              <span className="text-sm">Create Program</span>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-white text-gray-700 hover:bg-gray-50">
              <Building className="h-6 w-6" />
              <span className="text-sm">Add Partnership</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
