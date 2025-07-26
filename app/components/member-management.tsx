"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Grid3X3,
  List,
  LayoutGrid,
  TableIcon,
  Contact,
  SortAsc,
  SortDesc,
  Calendar as CalendarIcon,
  Phone,
  Mail,
  MapPin,
  Cake,
  Building2,
  Camera,
  Bell,
} from "lucide-react"
import { DatabaseService, type Member as ImportedMember } from "@/lib/database"
import { AddMemberModal } from "./add-member-modal"
import { EditMemberModal } from "./edit-member-modal"
import { ViewMemberModal } from "./view-member-modal"
import { MemberBulkActions } from "./member-bulk-actions"
import { FaceRecognitionModal } from "./face-recognition-modal"
import { FamilyManagementModal } from "./family-management-modal"
import { GPSCheckInModal } from "./gps-checkin-modal"
import { useTranslation, type Language } from "@/lib/i18n"
import { useAuth } from "@/components/auth-provider"
import { bulkUpdateMemberStatus, bulkAssignDepartment, bulkDeleteMembersClient } from "@/lib/actions"
import { toast } from "@/components/ui/use-toast"
import { DepartmentSelectModal } from "./department-select-modal"
import MemberFilters from "./member-filters"
// @ts-ignore: papaparse types may not be available
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Papa from "papaparse"
// @ts-ignore: xlsx types may not be available
import * as XLSX from "xlsx"
import { createClientComponentClient } from "@/lib/supabase-client"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { MemberService } from "@/lib/member-service"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import { AIClient } from "@/lib/ai-client";

type ViewMode = "cards" | "table" | "grid" | "list" | "compact" | "contact"
type SortField = "name" | "email" | "joinDate" | "department" | "status"
type SortOrder = "asc" | "desc"

type Member = ImportedMember & { name?: string }

interface MemberManagementProps {
  language?: Language
}

export default function MemberManagement() {
  const { language, userProfile } = useAuth();
  const { t } = useTranslation(language)
  const userRole = userProfile?.role || "member"
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [families, setFamilies] = useState<{ id: string; family_name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [viewMode, setViewMode] = useState<ViewMode>("cards")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showFaceRecognition, setShowFaceRecognition] = useState(false)
  const [showFamilyManagement, setShowFamilyManagement] = useState(false)
  const [showGPSCheckIn, setShowGPSCheckIn] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [filters, setFilters] = useState<any>({})
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const supabase = createClientComponentClient()
  const [showFilterBar, setShowFilterBar] = useState(false)
  const [joinDateRange, setJoinDateRange] = useState<{ from: Date | undefined, to: Date | undefined }>({ from: undefined, to: undefined })
  const [birthdayMonth, setBirthdayMonth] = useState<string>("")
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [editFields, setEditFields] = useState<Partial<Member>>({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const editInputRef = useRef<HTMLInputElement>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [suggestionModal, setSuggestionModal] = useState<{ open: boolean; suggestions: string[] }>({ open: false, suggestions: [] })
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState("")
  const [loadingNotes, setLoadingNotes] = useState(false)
  const fetchNotes = async (memberId: string) => {
    setLoadingNotes(true)
    const res = await fetch(`/api/member-notes?memberId=${memberId}`)
    const data = await res.json()
    setNotes(data.notes || [])
    setLoadingNotes(false)
  }
  const addNote = async (memberId: string) => {
    if (!newNote.trim()) return
    await fetch(`/api/member-notes`, { method: 'POST', body: JSON.stringify({ memberId, content: newNote }) })
    setNewNote("")
    fetchNotes(memberId)
  }
  const deleteNote = async (noteId: string, memberId: string) => {
    await fetch(`/api/member-notes?noteId=${noteId}`, { method: 'DELETE' })
    fetchNotes(memberId)
  }
  const getSmartSuggestions = async (member: any) => {
    const res = await fetch('/api/ai/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: `Suggest best department, next action, and similar members for: ${JSON.stringify(member)}` }) })
    const data = await res.json()
    setSuggestionModal({ open: true, suggestions: data.response ? data.response.split('\n') : [] })
  }

  const [allTags, setAllTags] = useState<string[]>([])
  const [tagFilter, setTagFilter] = useState<string>("")
  useEffect(() => {
    MemberService.getTags().then((r: any) => setAllTags(r.tags || []))
  }, [])

  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false)
  const [customFields, setCustomFields] = useState<any[]>([])
  const [newField, setNewField] = useState({ name: '', field_type: 'text', options: '' })
  const [loadingFields, setLoadingFields] = useState(false)
  const isAdmin = userRole === 'admin'
  useEffect(() => {
    if (showCustomFieldsModal) {
      setLoadingFields(true)
      MemberService.getCustomFields().then((r: any) => {
        setCustomFields(r.customFields || [])
        setLoadingFields(false)
      })
    }
  }, [showCustomFieldsModal])

  const [bulkTag, setBulkTag] = useState("")
  const isMobile = useIsMobile()
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false)
  const [duplicates, setDuplicates] = useState<any[]>([])
  // Helper to find duplicates
  function findDuplicates(members: Member[]) {
    const byEmail = new Map<string, Member[]>()
    const byPhone = new Map<string, Member[]>()
    const byName = new Map<string, Member[]>()
    members.forEach(m => {
      if (m.email) byEmail.set(m.email, [...(byEmail.get(m.email) || []), m])
      if (m.phone) byPhone.set(m.phone, [...(byPhone.get(m.phone) || []), m])
      const nameKey = (m.first_name + ' ' + m.last_name).toLowerCase()
      byName.set(nameKey, [...(byName.get(nameKey) || []), m])
    })
    const dups: any[] = []
    for (const group of [byEmail, byPhone, byName]) {
      for (const arr of group.values()) {
        if (arr.length > 1) dups.push(arr)
      }
    }
    return dups
  }

  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  // Simulate notification generation (in real app, use backend or websocket)
  useEffect(() => {
    // Birthday reminders
    const today = new Date()
    const upcomingBirthdays = members.filter(m => m.date_of_birth && new Date(m.date_of_birth).getMonth() === today.getMonth() && new Date(m.date_of_birth).getDate() === today.getDate())
    if (upcomingBirthdays.length > 0) {
      setNotifications(n => [
        ...n,
        ...upcomingBirthdays.map(m => ({
          type: 'birthday',
          message: `Aniversário de ${m.first_name} ${m.last_name} hoje!`,
          date: today.toISOString(),
          read: false,
        }))
      ])
      setUnreadCount(c => c + upcomingBirthdays.length)
    }
    // New member joins (simulate: last 24h)
    const newMembers = members.filter(m => {
      const joined = new Date(m.join_date)
      return (today.getTime() - joined.getTime()) < 24 * 60 * 60 * 1000
    })
    if (newMembers.length > 0) {
      setNotifications(n => [
        ...n,
        ...newMembers.map(m => ({
          type: 'new',
          message: `Novo membro: ${m.first_name} ${m.last_name}`,
          date: m.join_date,
          read: false,
        }))
      ])
      setUnreadCount(c => c + newMembers.length)
    }
    // Status changes (simulate: if status changed in last 24h)
    // (In real app, track status change events)
  }, [members])

  // Load members on component mount
  useEffect(() => {
    loadMembers()
  }, [])

  useEffect(() => {
    const channel = supabase.channel('members-realtime')
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
      loadMembers()
    })
    channel.subscribe()
    return () => { channel.unsubscribe() }
  }, [])

  // Filter and sort members when dependencies change
  useEffect(() => {
    filterAndSortMembers()
  }, [members, searchTerm, activeTab, sortField, sortOrder, filters, tagFilter])

  const loadMembers = async () => {
    try {
      setLoading(true)
      const data = await DatabaseService.getMembers()
      setMembers(data)
      
      // Also load families
      try {
        const familiesData = await DatabaseService.getFamilies()
        setFamilies(familiesData)
      } catch (error) {
        console.error("Error loading families:", error)
        setFamilies([])
      }
    } catch (error) {
      console.error("Error loading members:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortMembers = () => {
    let filtered = members

    // Apply search filter
    if (filters.search) {
      filtered = filtered.filter(
        (member) =>
          member.first_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          member.last_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          member.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
          member.phone?.includes(filters.search),
      )
    }

    // Apply status filter
    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((member) => member.member_status === filters.status)
    }

    // Apply department filter
    if (filters.department && filters.department !== "all") {
      filtered = filtered.filter((member) => member.department === filters.department)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number
      let bValue: string | number

      switch (sortField) {
        case "name":
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase()
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase()
          break
        case "email":
          aValue = a.email?.toLowerCase() || ""
          bValue = b.email?.toLowerCase() || ""
          break
        case "joinDate":
          aValue = new Date(a.join_date).getTime()
          bValue = new Date(b.join_date).getTime()
          break
        case "department":
          aValue = a.department?.toLowerCase() || ""
          bValue = b.department?.toLowerCase() || ""
          break
        case "status":
          aValue = a.member_status?.toLowerCase() || ""
          bValue = b.member_status?.toLowerCase() || ""
          break
        default:
          aValue = ""
          bValue = ""
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    if (filters.joinDateFrom || filters.joinDateTo) {
      filtered = filtered.filter((member) => {
        const joinDate = new Date(member.join_date)
        if (filters.joinDateFrom && joinDate < new Date(filters.joinDateFrom)) return false
        if (filters.joinDateTo && joinDate > new Date(filters.joinDateTo)) return false
        return true
      })
    }
    if (filters.birthdayMonth) {
      filtered = filtered.filter((member) => {
        if (!member.date_of_birth) return false
        const birthDate = new Date(member.date_of_birth)
        return String(birthDate.getMonth() + 1).padStart(2, '0') === filters.birthdayMonth
      })
    }
    if (tagFilter) {
      filtered = filtered.filter((member: any) => Array.isArray(member.tags) && member.tags.includes(tagFilter))
    }

    setFilteredMembers(filtered)
  }

  // Analytics calculations
  const stats = {
    total: members.length,
    active: members.filter(m => m.member_status === 'active').length,
    inactive: members.filter(m => m.member_status === 'inactive').length,
    newThisMonth: members.filter(m => new Date(m.join_date).getMonth() === new Date().getMonth() && new Date(m.join_date).getFullYear() === new Date().getFullYear()).length,
    birthdaysThisMonth: members.filter(m => m.date_of_birth && new Date(m.date_of_birth).getMonth() === new Date().getMonth()).length,
    tagCounts: (() => {
      const counts: Record<string, number> = {}
      members.forEach(m => (m.tags || []).forEach(tag => { counts[tag] = (counts[tag] || 0) + 1 }))
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    })(),
    newPerMonth: (() => {
      const months: Record<string, number> = {}
      members.forEach(m => {
        const ym = m.join_date ? m.join_date.slice(0, 7) : ''
        if (ym) months[ym] = (months[ym] || 0) + 1
      })
      return Object.entries(months).sort().map(([month, count]) => ({ month, count }))
    })(),
  }

  const handleAddMember = async (memberData: Partial<Member>) => {
    try {
      await DatabaseService.createMember({
        ...memberData,
      });
      await loadMembers();
      setShowAddModal(false);
      toast({ title: "Member added successfully!" });
    } catch (error) {
      toast({ title: "Failed to add member", description: String(error), variant: "destructive" });
    }
  };

  // Alias for CSV/Excel import compatibility
  const addMemberAsync = handleAddMember;

  const handleEditMember = async (memberData: Partial<Member>) => {
    if (!selectedMember) return

    try {
      const updatedMember = await DatabaseService.updateMember(selectedMember.id, memberData)
      setMembers(members.map((m) => (m.id === selectedMember.id ? updatedMember : m)))
      setShowEditModal(false)
      setSelectedMember(null)
    } catch (error) {
      console.error("Error updating member:", error)
    }
  }

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Delete handlers
  const openDeleteDialog = (member: Member) => {
    setDeletingMember(member);
    setShowDeleteDialog(true);
    setDeleteError(null);
  };
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeletingMember(null);
    setDeleteError(null);
  };
  const handleDeleteMemberConfirmed = async () => {
    if (!deletingMember) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await DatabaseService.deleteMember(deletingMember.id);
      await loadMembers();
      closeDeleteDialog();
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting member');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkAction = async (action: string, memberIds: string[]) => {
    // Bulk actions not implemented in DatabaseService; show a toast or log for now
    console.warn(`Bulk action '${action}' requested for members:`, memberIds)
    loadMembers()
    setSelectedMembers([])
    setShowBulkActions(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === "pt" ? "pt-BR" : language === "es" ? "es-ES" : "en-US")
  }

  const ViewModeSelector = () => (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Button
        variant={viewMode === "cards" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("cards")}
        className="h-8 w-8 p-0"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("table")}
        className="h-8 w-8 p-0"
      >
        <TableIcon className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("grid")}
        className="h-8 w-8 p-0"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("list")}
        className="h-8 w-8 p-0"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "contact" ? "default" : "ghost"}
        size="sm"
        onClick={() => setViewMode("contact")}
        className="h-8 w-8 p-0"
      >
        <Contact className="h-4 w-4" />
      </Button>
    </div>
  )

  const SortSelector = () => (
    <div className="flex items-center gap-2">
      <Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">{t("members.sortBy.name")}</SelectItem>
          <SelectItem value="email">{t("members.sortBy.email")}</SelectItem>
          <SelectItem value="joinDate">{t("members.sortBy.joinDate")}</SelectItem>
          <SelectItem value="department">{t("members.sortBy.department")}</SelectItem>
          <SelectItem value="status">{t("members.sortBy.status")}</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        className="h-9 w-9 p-0"
      >
        {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
      </Button>
    </div>
  )

  const renderCardsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={selectedMembers.length === members.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedMembers(members.map(m => m.id))
            } else {
              setSelectedMembers([])
            }
          }}
        />
        <span>{t("common.selectAll")}</span>
      </div>
      {filteredMembers.map((member) => (
        <Card key={member.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={member.profile_image || "/placeholder.svg"}
                  alt={`${member.first_name} ${member.last_name}`}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {member.first_name[0]}
                  {member.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {member.first_name} {member.last_name}
                </h3>
                <p className="text-sm text-gray-500 truncate">{member.email}</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{member.phone || t("common.notProvided")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-3 w-3" />
                <span>{member.department || t("common.notAssigned")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarIcon className="h-3 w-3" />
                <span>{formatDate(member.join_date)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge className={getStatusColor(member.member_status)}>
                {member.member_status === "active" ? t("members.status.active") : t("members.status.inactive")}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setSelectedMember(member)
                      setShowViewModal(true)
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t("common.view")}
                  </DropdownMenuItem>
                  {userRole === "admin" && (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member)
                          setShowEditModal(true)
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t("common.edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(member)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("common.delete")}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {member.tags && member.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const startEdit = (member: Member) => {
    setEditingMemberId(member.id)
    setEditFields({
      first_name: member.first_name,
      last_name: member.last_name,
      department: member.department,
      member_status: member.member_status,
    })
    setTimeout(() => editInputRef.current?.focus(), 100)
  }
  const cancelEdit = () => {
    setEditingMemberId(null)
    setEditFields({})
    setEditError(null)
  }
  const saveEdit = async (member: Member) => {
    setEditLoading(true)
    setEditError(null)
    try {
      await DatabaseService.updateMember(member.id, editFields)
      await loadMembers()
      setEditingMemberId(null)
      setEditFields({})
    } catch (err) {
      setEditError("Failed to save changes.")
    } finally {
      setEditLoading(false)
    }
  }

  const renderTableView = () => (
    <div className="max-h-[60vh] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("members.fields.member")}</TableHead>
            <TableHead>{t("members.fields.contact")}</TableHead>
            <TableHead>{t("members.fields.department")}</TableHead>
            <TableHead>{t("members.fields.status")}</TableHead>
            <TableHead>{t("members.fields.joinDate")}</TableHead>
            <TableHead className="text-right">{t("common.actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={selectedMembers.length === members.length}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedMembers(members.map(m => m.id))
                } else {
                  setSelectedMembers([])
                }
              }}
            />
            <span>{t("common.selectAll")}</span>
          </div>
          {filteredMembers.map((member) => (
            <TableRow key={member.id}>
              <TableCell>
                {editingMemberId === member.id ? (
                  <div className="flex gap-2 items-center">
                    <Input
                      ref={editInputRef}
                      value={editFields.first_name || ""}
                      onChange={e => setEditFields(f => ({ ...f, first_name: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(member); if (e.key === 'Escape') cancelEdit(); }}
                      className="w-24"
                    />
                    <Input
                      value={editFields.last_name || ""}
                      onChange={e => setEditFields(f => ({ ...f, last_name: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(member); if (e.key === 'Escape') cancelEdit(); }}
                      className="w-24"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{member.first_name} {member.last_name}</span>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(member)}>Edit</Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{member.email}</p>
                  <p className="text-sm text-gray-500">{member.phone}</p>
                </div>
              </TableCell>
              <TableCell>
                {editingMemberId === member.id ? (
                  <Select value={editFields.department || ""} onValueChange={v => setEditFields(f => ({ ...f, department: v }))}>
                    <SelectTrigger className="w-32"><SelectValue placeholder="Department" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {/* Dynamically render department options here */}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{member.department}</Badge>
                )}
              </TableCell>
              <TableCell>
                {editingMemberId === member.id ? (
                  <Select value={editFields.member_status || "active"} onValueChange={v => setEditFields(f => ({ ...f, member_status: v as any }))}>
                    <SelectTrigger className="w-24"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={getStatusColor(member.member_status)}>
                    {member.member_status === "active" ? t("members.status.active") : t("members.status.inactive")}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDate(member.join_date)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {member.tags && member.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                {editingMemberId === member.id ? (
                  <div className="flex gap-2 items-center">
                    <Button size="sm" onClick={() => saveEdit(member)} disabled={editLoading}>Save</Button>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                    {editError && <span className="text-red-600 text-xs ml-2">{editError}</span>}
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedMember(member)
                          setShowViewModal(true)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t("common.view")}
                      </DropdownMenuItem>
                      {userRole === "admin" && (
                        <>
                          <DropdownMenuItem onClick={() => startEdit(member)}>
                            <Edit className="h-4 w-4 mr-2" />
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(member)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={selectedMembers.length === members.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedMembers(members.map(m => m.id))
            } else {
              setSelectedMembers([])
            }
          }}
        />
        <span>{t("common.selectAll")}</span>
      </div>
      {filteredMembers.map((member) => (
        <Card
          key={member.id}
          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
          onClick={() => {
            setSelectedMember(member)
            setShowViewModal(true)
          }}
        >
          <CardContent className="p-4 text-center">
            <Avatar className="h-16 w-16 mx-auto mb-3">
              <AvatarImage
                src={member.profile_image || "/placeholder.svg"}
                alt={`${member.first_name} ${member.last_name}`}
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                {member.first_name[0]}
                {member.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-sm text-gray-900 truncate">
              {member.first_name} {member.last_name}
            </h3>
            <p className="text-xs text-gray-500 truncate">{member.department}</p>
            <Badge className={`${getStatusColor(member.member_status)} mt-2 text-xs`}>
              {member.member_status === "active" ? t("members.status.active") : t("members.status.inactive")}
            </Badge>
            <div className="flex flex-wrap gap-1 mt-2">
              {member.tags && member.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={selectedMembers.length === members.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedMembers(members.map(m => m.id))
            } else {
              setSelectedMembers([])
            }
          }}
        />
        <span>{t("common.selectAll")}</span>
      </div>
      {filteredMembers.map((member) => (
        <Card key={member.id} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={member.profile_image || "/placeholder.svg"}
                    alt={`${member.first_name} ${member.last_name}`}
                  />
                  <AvatarFallback>
                    {member.first_name[0]}
                    {member.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {member.first_name} {member.last_name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {member.phone}
                    </span>
                    <span>{member.department}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(member.member_status)}>
                  {member.member_status === "active" ? t("members.status.active") : t("members.status.inactive")}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedMember(member)
                        setShowViewModal(true)
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("common.view")}
                    </DropdownMenuItem>
                    {userRole === "admin" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedMember(member)
                            setShowEditModal(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          {t("common.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(member)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {member.tags && member.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderContactView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={selectedMembers.length === members.length}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedMembers(members.map(m => m.id))
            } else {
              setSelectedMembers([])
            }
          }}
        />
        <span>{t("common.selectAll")}</span>
      </div>
      {filteredMembers.map((member) => (
        <Card key={member.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <Avatar className="h-20 w-20 mx-auto mb-3">
                <AvatarImage
                  src={member.profile_image || "/placeholder.svg"}
                  alt={`${member.first_name} ${member.last_name}`}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                  {member.first_name[0]}
                  {member.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg text-gray-900">
                {member.first_name} {member.last_name}
              </h3>
              <p className="text-gray-500">{member.department}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{member.phone || t("common.notProvided")}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{member.address || t("common.notProvided")}</span>
              </div>
              {member.date_of_birth && (
                <div className="flex items-center gap-3 text-sm">
                  <Cake className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{formatDate(member.date_of_birth)}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <CalendarIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {t("members.joinedOn")} {formatDate(member.join_date)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <Badge className={getStatusColor(member.member_status)}>
                {member.member_status === "active" ? t("members.status.active") : t("members.status.inactive")}
              </Badge>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedMember(member)
                    setShowViewModal(true)
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {userRole === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member)
                      setShowEditModal(true)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {member.tags && member.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderCurrentView = () => {
    switch (viewMode) {
      case "table":
        return renderTableView()
      case "grid":
        return renderGridView()
      case "list":
        return renderListView()
      case "contact":
        return renderContactView()
      default:
        return renderCardsView()
    }
  }

  const handleBulkActivate = async () => {
    await bulkUpdateMemberStatus(selectedMembers, "active")
    await loadMembers()
    setSelectedMembers([])
    toast({ title: "Members activated!" })
  }

  const handleBulkDeactivate = async () => {
    await bulkUpdateMemberStatus(selectedMembers, "inactive")
    await loadMembers()
    setSelectedMembers([])
    toast({ title: "Members deactivated!" })
  }

  const handleBulkAssignDepartment = async (department?: string) => {
    let dept = department
    if (!dept) {
      setShowDeptModal(true)
      return
    }
    await bulkAssignDepartment(selectedMembers, dept)
    await loadMembers()
    setSelectedMembers([])
    toast({ title: "Department assigned." })
  }

  const handleBulkDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the selected members?")) return
    await bulkDeleteMembersClient(selectedMembers)
    await loadMembers()
    setSelectedMembers([])
    toast({ title: "Members deleted." })
  }

  // CSV Export
  const handleExport = () => {
    const csv = Papa.unparse(members)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "members.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  // Excel Export
  const handleExportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(members)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Members")
      XLSX.writeFile(wb, "members.xlsx")
      toast({ title: "Exported to Excel!" })
    } catch (err) {
      toast({ title: "Failed to export Excel", description: String(err), variant: "destructive" })
    }
  }

  // CSV Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        complete: async (results: any) => {
          try {
            const imported = results.data as Partial<Member>[]
            if (!imported.length) throw new Error("No data found in CSV.")
            for (const member of imported) {
              await addMemberAsync(member)
            }
            loadMembers()
            toast({ title: "CSV import successful!" })
          } catch (err) {
            toast({ title: "CSV import failed", description: String(err), variant: "destructive" })
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        error: (err: any) => {
          toast({ title: "CSV parse error", description: String(err), variant: "destructive" })
        },
      })
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader()
      reader.onload = async (evt) => {
        try {
          const data = evt.target?.result
          if (!data) throw new Error("File read error.")
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const ws = workbook.Sheets[sheetName]
          const imported = XLSX.utils.sheet_to_json(ws) as Partial<Member>[]
          if (!imported.length) throw new Error("No data found in Excel file.")
          for (const member of imported) {
            await addMemberAsync(member)
          }
          loadMembers()
          toast({ title: "Excel import successful!" })
        } catch (err) {
          toast({ title: "Excel import failed", description: String(err), variant: "destructive" })
        }
      }
      reader.onerror = () => {
        toast({ title: "Excel file read error", variant: "destructive" })
      }
      reader.readAsArrayBuffer(file)
    } else {
      toast({ title: "Unsupported file type", description: "Please upload a CSV or Excel file.", variant: "destructive" })
    }
  }

  const [aiSearch, setAiSearch] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAISearch = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      // Send the query and all members to OpenAI for filtering
      const prompt = `You are a church member database assistant. Given the following members: ${JSON.stringify(members)}. Filter and return only the members that match this query: "${aiQuery}". Return as a JSON array of member IDs.`;
      const response = await AIClient.generateText(prompt);
      // Try to parse the result as an array of IDs
      let ids: string[] = [];
      const match = response.match(/\[([\s\S]*?)\]/);
      if (match) {
        try {
          ids = JSON.parse(match[0]);
        } catch {}
      }
      setFilteredMembers(members.filter(m => ids.includes(m.id)));
    } catch (e: any) {
      setAiError("AI search failed. Try a simpler query.");
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  console.log("showAddModal", showAddModal);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("members.title")}</h2>
          <p className="text-gray-600">{t("members.description")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" aria-label="Notificações" onClick={() => setUnreadCount(0)}>
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xs px-1">{unreadCount}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">Sem notificações</div>
              ) : notifications.slice(-10).reverse().map((notif, i) => (
                <div key={i} className={`p-3 border-b last:border-b-0 ${notif.read ? '' : 'bg-blue-50'}`}> 
                  <div className="flex flex-col">
                    <span className="font-medium">{notif.type === 'birthday' ? 'Aniversário' : notif.type === 'new' ? 'Novo Membro' : 'Notificação'}</span>
                    <span className="text-xs text-muted-foreground">{notif.message}</span>
                    <span className="text-xs text-gray-400 mt-1">{new Date(notif.date).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </PopoverContent>
          </Popover>
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImport}
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            {t("members.actions.import")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            {t("members.actions.export") + " CSV"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="h-4 w-4 mr-2" />
            {t("members.actions.export") + " Excel"}
          </Button>
          <Button
            onClick={() => {
              toast({ title: t("members.actions.addMember") });
              setShowAddModal(true);
            }}
            className="mb-4"
          >
            {t("members.actions.addMember")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("members.stats.total")}</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("members.stats.active")}</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="text-sm font-medium text-green-600">+12</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("members.stats.inactive")}</p>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <div className="text-sm font-medium text-red-600">-3</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("members.stats.newThisMonth")}</p>
                <p className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</p>
              </div>
              <div className="text-sm font-medium text-blue-600">+{stats.newThisMonth}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{t("members.stats.birthdays")}</p>
                <p className="text-2xl font-bold text-orange-600">{stats.birthdaysThisMonth}</p>
              </div>
              <Cake className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className={`sticky top-0 z-30 bg-white border-b py-2 px-4 flex flex-wrap gap-2 items-center ${showFilterBar ? 'shadow' : ''}`}>
        <Button variant="outline" size="sm" onClick={() => setShowFilterBar(f => !f)}>
          <Filter className="h-4 w-4 mr-2" /> {t("common.filters")}
        </Button>
        <Select value={filters.department || ""} onValueChange={v => setFilters((f: any) => ({ ...f, department: v }))}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {/* Dynamically render department options here */}
          </SelectContent>
        </Select>
        <Select value={filters.status || ""} onValueChange={v => setFilters((f: any) => ({ ...f, status: v }))}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">Join Date</Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={joinDateRange}
              onSelect={range => {
                setJoinDateRange(range as any)
                setFilters((f: any) => ({ ...f, joinDateFrom: range?.from || undefined, joinDateTo: range?.to || undefined }))
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        <Select value={birthdayMonth} onValueChange={v => { setBirthdayMonth(v); setFilters((f: any) => ({ ...f, birthdayMonth: v })) }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Birthday Month" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
              <SelectItem key={m} value={String(i+1).padStart(2,'0')}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Active filter chips */}
        {Object.entries(filters).filter(([k,v]) => v && v !== "all" && v !== "").map(([k,v]) => (
          <span key={k} className="bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs flex items-center gap-1">
            {k}: {String(v)}
            <button onClick={() => setFilters((f: any) => ({ ...f, [k]: "" }))}><X className="h-3 w-3" /></button>
          </span>
        ))}
        {Object.values(filters).some(v => v && v !== "all" && v !== "") && (
          <Button variant="ghost" size="sm" onClick={() => { setFilters({}); setJoinDateRange({ from: undefined, to: undefined }); setBirthdayMonth("") }}>Clear All</Button>
        )}
      </div>

      {/* Search and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Button variant={aiSearch ? "default" : "outline"} onClick={() => setAiSearch(!aiSearch)}>
                {aiSearch ? "AI Search" : "Standard Search"}
              </Button>
              {aiSearch ? (
                <>
                  <Input
                    placeholder="Ask a question about members (e.g. 'members who joined last year')"
                    value={aiQuery}
                    onChange={e => setAiQuery(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAISearch()}
                    className="flex-1"
                    disabled={aiLoading}
                  />
                  <Button onClick={handleAISearch} disabled={aiLoading || !aiQuery}>
                    {aiLoading ? "Searching..." : "Ask AI"}
                  </Button>
                </>
              ) : (
                // ... existing standard search input ...
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && setFilteredMembers(members.filter(m => `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())))}
                  className="flex-1"
                  disabled={loading}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <ViewModeSelector />
              <SortSelector />
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                {t("common.filters")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {aiError && <div className="text-red-600 mb-2">{aiError}</div>}

      {/* Members Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("members.list.title")}
          </CardTitle>
          <CardDescription>{t("members.list.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                {t("members.tabs.all")} ({stats.total})
              </TabsTrigger>
              <TabsTrigger value="active">
                {t("members.tabs.active")} ({stats.active})
              </TabsTrigger>
              <TabsTrigger value="inactive">
                {t("members.tabs.inactive")} ({stats.inactive})
              </TabsTrigger>
              <TabsTrigger value="new">
                {t("members.tabs.new")} ({stats.newThisMonth})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {renderCurrentView()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddMemberModal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        families={families}
        onMemberAdded={async () => { await loadMembers(); setShowAddModal(false); }}
      />

      {selectedMember && (
        <>
          <EditMemberModal 
            memberId={String(selectedMember.id)} 
            isOpen={showEditModal} 
            onClose={() => setShowEditModal(false)} 
          />
          {selectedMember && showViewModal && (
            <ViewMemberModal memberId={selectedMember.id} />
          )}
        </>
      )}

      <MemberBulkActions
        open={showBulkActions}
        onOpenChange={setShowBulkActions}
        selectedMembers={selectedMembers.map(String)}
      />

      <Button variant="outline" size="sm" onClick={() => setShowFaceRecognition(true)}>
        <Camera className="h-4 w-4 mr-2" />
        Face Recognition
      </Button>

      {showFaceRecognition && (
        <FaceRecognitionModal 
          members={members.map(m => ({ ...m, department: m.department || '' }))}
          onClose={() => setShowFaceRecognition(false)}
        />
      )}

      <FamilyManagementModal 
        open={showFamilyManagement}
        onOpenChange={setShowFamilyManagement}
        members={members.map(m => ({ ...m, department: m.department || '' }))}
      />
      <Button variant="outline" size="sm" onClick={() => setShowGPSCheckIn(true)}>
        <MapPin className="h-4 w-4 mr-2" />
        GPS Check-in
      </Button>

      {showGPSCheckIn && (
        <GPSCheckInModal 
          members={members.map(m => ({ ...m, department: m.department || '' }))}
          onClose={() => setShowGPSCheckIn(false)}
        />
      )}

      <DepartmentSelectModal
        open={showDeptModal}
        onOpenChange={setShowDeptModal}
        onSelect={handleBulkAssignDepartment}
      />

      {/* Sticky Bulk Actions Bar */}
      {selectedMembers.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg flex flex-wrap gap-2 p-4 items-center justify-between animate-slide-up text-base md:text-sm">
          <span className="font-medium text-blue-700">{selectedMembers.length} selecionado(s)</span>
          <div className="flex gap-2 flex-wrap items-center">
            <select value={bulkTag} onChange={e => setBulkTag(e.target.value)} className="border rounded px-2 py-1">
              <option value="">Tag...</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <Button size="sm" onClick={async () => {
              if (!bulkTag) return
              await Promise.all(selectedMembers.map(id => MemberService.addTag(id, bulkTag)))
              setBulkTag("")
              loadMembers()
            }}>Adicionar Tag</Button>
            <Button size="sm" variant="destructive" onClick={async () => {
              if (!bulkTag) return
              await Promise.all(selectedMembers.map(id => MemberService.removeTag(id, bulkTag)))
              setBulkTag("")
              loadMembers()
            }}>Remover Tag</Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>Delete</Button>
            <Button variant="outline" size="sm" onClick={handleBulkActivate}>Set Active</Button>
            <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>Set Inactive</Button>
            <Button variant="outline" size="sm" onClick={() => setShowDeptModal(true)}>Assign Department</Button>
            <Button variant="outline" size="sm" onClick={handleExport}>Export CSV</Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel}>Export Excel</Button>
            <Button variant="ghost" size="sm" onClick={() => setSelectedMembers([])}>Clear</Button>
          </div>
        </div>
      )}

      {/* Floating Admin Button */}
      {isAdmin && (
        <button
          className="fixed bottom-8 right-8 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center gap-2"
          onClick={() => setShowCustomFieldsModal(true)}
          aria-label="Manage Custom Fields"
        >
          <span className="font-bold text-lg">+</span> Campos
        </button>
      )}
      {/* Custom Fields Admin Modal */}
      <Dialog open={showCustomFieldsModal} onOpenChange={setShowCustomFieldsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Gerenciar Campos Personalizados</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <form className="flex gap-2 items-end" onSubmit={async e => {
              e.preventDefault()
              if (!newField.name.trim()) return
              setLoadingFields(true)
              await fetch('/api/member-custom-fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'createField',
                  name: newField.name,
                  field_type: newField.field_type,
                  options: newField.options ? newField.options.split(',').map((o: string) => o.trim()) : undefined
                })
              })
              setNewField({ name: '', field_type: 'text', options: '' })
              MemberService.getCustomFields().then((r: any) => {
                setCustomFields(r.customFields || [])
                setLoadingFields(false)
              })
            }}>
              <Input value={newField.name} onChange={e => setNewField(f => ({ ...f, name: e.target.value }))} placeholder="Nome do campo" className="flex-1" />
              <select value={newField.field_type} onChange={e => setNewField(f => ({ ...f, field_type: e.target.value }))} className="border rounded px-2 py-1">
                <option value="text">Texto</option>
                <option value="number">Número</option>
                <option value="select">Seleção</option>
                <option value="date">Data</option>
              </select>
              {newField.field_type === 'select' && (
                <Input value={newField.options} onChange={e => setNewField(f => ({ ...f, options: e.target.value }))} placeholder="Opções (separadas por vírgula)" className="w-48" />
              )}
              <Button type="submit" disabled={loadingFields}>Adicionar</Button>
            </form>
            <ul className="divide-y">
              {customFields.map((field: any) => (
                <li key={field.id} className="flex items-center gap-2 py-2">
                  <span className="flex-1 font-medium">{field.name}</span>
                  <span className="text-xs text-gray-500">{field.field_type}</span>
                  {field.field_type === 'select' && field.options && (
                    <span className="text-xs text-gray-400">[{(Array.isArray(field.options) ? field.options : []).join(', ')}]</span>
                  )}
                  <Button size="sm" variant="destructive" onClick={async () => {
                    setLoadingFields(true)
                    await fetch('/api/member-custom-fields', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ action: 'deleteField', fieldId: field.id })
                    })
                    MemberService.getCustomFields().then((r: any) => {
                      setCustomFields(r.customFields || [])
                      setLoadingFields(false)
                    })
                  }}>Excluir</Button>
                </li>
              ))}
              {customFields.length === 0 && <li className="text-sm text-gray-500">Nenhum campo personalizado.</li>}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomFieldsModal(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {isAdmin && (
        <Button className="fixed bottom-24 right-8 z-50 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg p-4" onClick={() => { setDuplicates(findDuplicates(members)); setShowDuplicatesModal(true) }}>Detectar Duplicados</Button>
      )}
      {/* Duplicates Modal */}
      <Dialog open={showDuplicatesModal} onOpenChange={setShowDuplicatesModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Possíveis Duplicados</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {duplicates.length === 0 && <div className="text-gray-500">Nenhum duplicado encontrado.</div>}
            {duplicates.map((group, i) => (
              <div key={i} className="border rounded p-2">
                <div className="font-semibold mb-1">Grupo {i + 1}</div>
                <ul className="mb-2">
                  {group.map((m: Member) => (
                    <li key={m.id} className="flex gap-2 items-center">
                      <span>{m.first_name} {m.last_name}</span>
                      <span className="text-xs text-gray-500">{m.email}</span>
                      <span className="text-xs text-gray-500">{m.phone}</span>
                      <Button size="sm" variant="outline" onClick={() => setSelectedMember(m)}>Ver</Button>
                    </li>
                  ))}
                </ul>
                <Button size="sm" variant="default" onClick={async () => {
                  // Merge logic: keep the first, merge data from others, delete others
                  const [primary, ...others] = group
                  // Merge attachments, notes, custom fields, tags (could be improved)
                  // For now, just delete others
                  for (const other of others) {
                    await DatabaseService.deleteMember(other.id)
                  }
                  loadMembers()
                  setDuplicates(findDuplicates(members))
                }}>Mesclar e Remover Duplicados</Button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDuplicatesModal(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Member</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this member?</div>
          {deleteError && <div className="text-red-600 text-sm">{deleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteDialog} disabled={deleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteMemberConfirmed} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
