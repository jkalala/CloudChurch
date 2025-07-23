"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  BookOpen,
  Users,
  MessageCircle,
  Star,
  Calendar,
  Clock,
  Share2,
  Bookmark,
  Heart,
  Plus,
  Filter,
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  Bell,
  PieChart,
  Flame,
  Activity,
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { EditorContent, useEditor } from '@tiptap/react'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartTooltip, ResponsiveContainer } from "recharts"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { supabase } from '@/lib/supabase-client'

interface BibleVerse {
  id: string
  book: string
  chapter: number
  verse: number
  text: string
  reference: string
}

interface StudyPlan {
  id: string
  title: string
  description: string
  duration: string
  difficulty: "beginner" | "intermediate" | "advanced"
  category: string
  lessons: StudyLesson[]
  participants: number
  rating: number
  progress: number
  isEnrolled: boolean
  createdBy: string
  createdAt: string
}

interface StudyLesson {
  id: string
  title: string
  description: string
  verses: BibleVerse[]
  questions: string[]
  insights: string[]
  isCompleted: boolean
  duration: number
}

interface StudyGroup {
  id: string
  name: string
  description: string
  members: GroupMember[]
  currentStudy: string
  meetingTime: string
  isPrivate: boolean
  createdBy: string
}

interface GroupMember {
  id: string
  name: string
  avatar: string
  role: "leader" | "member"
  joinedAt: string
}

interface Discussion {
  id: string
  studyId: string
  lessonId: string
  author: string
  authorAvatar: string
  content: string
  timestamp: string
  likes: number
  replies: Discussion[]
  isLiked: boolean
}

interface StudyProgress {
  totalStudies: number
  completedStudies: number
  currentStreak: number
  totalHours: number
  favoriteCategory: string
  achievements: Achievement[]
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
  rarity: "common" | "rare" | "epic" | "legendary"
}

export default function InteractiveBibleStudy() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState("discover")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null)
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([])
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([])
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [progress, setProgress] = useState<StudyProgress | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStudy, setSelectedStudy] = useState<StudyPlan | null>(null)
  const [currentLesson, setCurrentLesson] = useState<StudyLesson | null>(null)
  const [studyFilter, setStudyFilter] = useState("all")
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [showCreateStudy, setShowCreateStudy] = useState(false)
  const [showJoinGroup, setShowJoinGroup] = useState(false)
  const [notesModal, setNotesModal] = useState<{ open: boolean; lessonId: string | null }>({ open: false, lessonId: null })
  const [aiModal, setAiModal] = useState<{ open: boolean; prompt: string; response: string }>({ open: false, prompt: '', response: '' })
  const [collabUsers, setCollabUsers] = useState<{ id: string; name: string; color: string }[]>([])
  const [showOnboarding, setShowOnboarding] = useState(() => typeof window !== 'undefined' ? !localStorage.getItem('bibleStudyOnboarded') : false)
  const isMobile = useIsMobile()
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifSettings, setShowNotifSettings] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])

  // --- CRUD State for Studies ---
  const [showEditStudy, setShowEditStudy] = useState(false);
  const [editingStudy, setEditingStudy] = useState<StudyPlan | null>(null);
  const [showDeleteStudy, setShowDeleteStudy] = useState(false);
  const [deletingStudy, setDeletingStudy] = useState<StudyPlan | null>(null);
  const [studyForm, setStudyForm] = useState<Partial<StudyPlan>>({});
  const [studyFormLoading, setStudyFormLoading] = useState(false);
  const [studyFormError, setStudyFormError] = useState<string | null>(null);
  const [deleteStudyLoading, setDeleteStudyLoading] = useState(false);
  const [deleteStudyError, setDeleteStudyError] = useState<string | null>(null);

  // --- CRUD State for Lessons ---
  const [showEditLesson, setShowEditLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<StudyLesson | null>(null);
  const [showDeleteLesson, setShowDeleteLesson] = useState(false);
  const [deletingLesson, setDeletingLesson] = useState<StudyLesson | null>(null);
  const [lessonForm, setLessonForm] = useState<Partial<StudyLesson>>({});
  const [lessonFormLoading, setLessonFormLoading] = useState(false);
  const [lessonFormError, setLessonFormError] = useState<string | null>(null);
  const [deleteLessonLoading, setDeleteLessonLoading] = useState(false);
  const [deleteLessonError, setDeleteLessonError] = useState<string | null>(null);

  // --- CRUD State for Groups ---
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudyGroup | null>(null);
  const [showDeleteGroup, setShowDeleteGroup] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<StudyGroup | null>(null);
  const [groupForm, setGroupForm] = useState<Partial<StudyGroup>>({});
  const [groupFormLoading, setGroupFormLoading] = useState(false);
  const [groupFormError, setGroupFormError] = useState<string | null>(null);
  const [deleteGroupLoading, setDeleteGroupLoading] = useState(false);
  const [deleteGroupError, setDeleteGroupError] = useState<string | null>(null);

  // --- CRUD State for Discussions ---
  const [showEditDiscussion, setShowEditDiscussion] = useState(false);
  const [editingDiscussion, setEditingDiscussion] = useState<Discussion | null>(null);
  const [showDeleteDiscussion, setShowDeleteDiscussion] = useState(false);
  const [deletingDiscussion, setDeletingDiscussion] = useState<Discussion | null>(null);
  const [discussionForm, setDiscussionForm] = useState<Partial<Discussion>>({});
  const [discussionFormLoading, setDiscussionFormLoading] = useState(false);
  const [discussionFormError, setDiscussionFormError] = useState<string | null>(null);
  const [deleteDiscussionLoading, setDeleteDiscussionLoading] = useState(false);
  const [deleteDiscussionError, setDeleteDiscussionError] = useState<string | null>(null);

  // --- Pagination and Sorting State ---
  const [studiesPage, setStudiesPage] = useState(1);
  const [studiesPerPage] = useState(6);
  const [groupsPage, setGroupsPage] = useState(1);
  const [groupsPerPage] = useState(6);
  const [studySortField, setStudySortField] = useState<'title' | 'createdAt' | 'participants'>('title');
  const [studySortOrder, setStudySortOrder] = useState<'asc' | 'desc'>('asc');
  const [groupSortField, setGroupSortField] = useState<'name'>('name');
  const [groupSortOrder, setGroupSortOrder] = useState<'asc' | 'desc'>('asc');

  // --- Enhanced CRUD Handlers: Add toasts and error handling ---
  const handleStudyFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudyFormLoading(true);
    setStudyFormError(null);
    try {
      let resp;
      if (editingStudy) {
        resp = await fetch('/api/bible-study', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingStudy.id, ...studyForm }) });
      } else {
        resp = await fetch('/api/bible-study', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(studyForm) });
      }
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save study');
      toast.success('Study saved successfully!');
      await fetchStudies();
      closeEditStudyModal();
    } catch (err: any) {
      setStudyFormError(err.message || 'Failed to save study');
      toast.error(err.message || 'Failed to save study');
    } finally {
      setStudyFormLoading(false);
    }
  };
  const handleDeleteStudy = async () => {
    if (!deletingStudy) return;
    setDeleteStudyLoading(true);
    setDeleteStudyError(null);
    try {
      const resp = await fetch('/api/bible-study', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deletingStudy.id }) });
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to delete study');
      toast.success('Study deleted successfully!');
      await fetchStudies();
      closeDeleteStudyDialog();
    } catch (err: any) {
      setDeleteStudyError(err.message || 'Failed to delete study');
      toast.error(err.message || 'Failed to delete study');
    } finally {
      setDeleteStudyLoading(false);
    }
  };

  // --- CRUD Handlers for Lessons ---
  const openNewLessonModal = () => { setEditingLesson(null); setLessonForm({}); setShowEditLesson(true); setLessonFormError(null); };
  const openEditLessonModal = (lesson: StudyLesson) => { setEditingLesson(lesson); setLessonForm(lesson); setShowEditLesson(true); setLessonFormError(null); };
  const closeEditLessonModal = () => { setShowEditLesson(false); setEditingLesson(null); setLessonForm({}); setLessonFormError(null); };
  const openDeleteLessonDialog = (lesson: StudyLesson) => { setDeletingLesson(lesson); setShowDeleteLesson(true); setDeleteLessonError(null); };
  const closeDeleteLessonDialog = () => { setShowDeleteLesson(false); setDeletingLesson(null); setDeleteLessonError(null); };
  const handleLessonFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLessonForm(prev => ({ ...prev, [name]: value }));
  };
  const handleLessonFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLessonFormLoading(true);
    setLessonFormError(null);
    try {
      let resp;
      if (editingLesson) {
        resp = await fetch('/api/bible-study/lessons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingLesson.id, ...lessonForm }) });
      } else {
        resp = await fetch('/api/bible-study/lessons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lessonForm) });
      }
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save lesson');
      toast.success('Lesson saved successfully!');
      await fetchStudies();
      closeEditLessonModal();
    } catch (err: any) {
      setLessonFormError(err.message || 'Failed to save lesson');
      toast.error(err.message || 'Failed to save lesson');
    } finally {
      setLessonFormLoading(false);
    }
  };
  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    setDeleteLessonLoading(true);
    setDeleteLessonError(null);
    try {
      const resp = await fetch('/api/bible-study/lessons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deletingLesson.id }) });
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to delete lesson');
      toast.success('Lesson deleted successfully!');
      await fetchStudies();
      closeDeleteLessonDialog();
    } catch (err: any) {
      setDeleteLessonError(err.message || 'Failed to delete lesson');
      toast.error(err.message || 'Failed to delete lesson');
    } finally {
      setDeleteLessonLoading(false);
    }
  };

  // --- CRUD Handlers for Groups ---
  const openNewGroupModal = () => { setEditingGroup(null); setGroupForm({}); setShowEditGroup(true); setGroupFormError(null); };
  const openEditGroupModal = (group: StudyGroup) => { setEditingGroup(group); setGroupForm(group); setShowEditGroup(true); setGroupFormError(null); };
  const closeEditGroupModal = () => { setShowEditGroup(false); setEditingGroup(null); setGroupForm({}); setGroupFormError(null); };
  const openDeleteGroupDialog = (group: StudyGroup) => { setDeletingGroup(group); setShowDeleteGroup(true); setDeleteGroupError(null); };
  const closeDeleteGroupDialog = () => { setShowDeleteGroup(false); setDeletingGroup(null); setDeleteGroupError(null); };
  const handleGroupFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGroupForm(prev => ({ ...prev, [name]: value }));
  };
  const handleGroupFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGroupFormLoading(true);
    setGroupFormError(null);
    try {
      let resp;
      if (editingGroup) {
        resp = await fetch('/api/bible-study/groups', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingGroup.id, ...groupForm }) });
      } else {
        resp = await fetch('/api/bible-study/groups', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(groupForm) });
      }
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save group');
      toast.success('Group saved successfully!');
      await fetchGroups();
      closeEditGroupModal();
    } catch (err: any) {
      setGroupFormError(err.message || 'Failed to save group');
      toast.error(err.message || 'Failed to save group');
    } finally {
      setGroupFormLoading(false);
    }
  };
  const handleDeleteGroup = async () => {
    if (!deletingGroup) return;
    setDeleteGroupLoading(true);
    setDeleteGroupError(null);
    try {
      const resp = await fetch('/api/bible-study/groups', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deletingGroup.id }) });
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to delete group');
      toast.success('Group deleted successfully!');
      await fetchGroups();
      closeDeleteGroupDialog();
    } catch (err: any) {
      setDeleteGroupError(err.message || 'Failed to delete group');
      toast.error(err.message || 'Failed to delete group');
    } finally {
      setDeleteGroupLoading(false);
    }
  };

  // --- CRUD Handlers for Discussions ---
  const openNewDiscussionModal = () => { setEditingDiscussion(null); setDiscussionForm({}); setShowEditDiscussion(true); setDiscussionFormError(null); };
  const openEditDiscussionModal = (discussion: Discussion) => { setEditingDiscussion(discussion); setDiscussionForm(discussion); setShowEditDiscussion(true); setDiscussionFormError(null); };
  const closeEditDiscussionModal = () => { setShowEditDiscussion(false); setEditingDiscussion(null); setDiscussionForm({}); setDiscussionFormError(null); };
  const openDeleteDiscussionDialog = (discussion: Discussion) => { setDeletingDiscussion(discussion); setShowDeleteDiscussion(true); setDeleteDiscussionError(null); };
  const closeDeleteDiscussionDialog = () => { setShowDeleteDiscussion(false); setDeletingDiscussion(null); setDeleteDiscussionError(null); };
  const handleDiscussionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDiscussionForm(prev => ({ ...prev, [name]: value }));
  };
  const handleDiscussionFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscussionFormLoading(true);
    setDiscussionFormError(null);
    try {
      let resp;
      if (editingDiscussion) {
        resp = await fetch('/api/bible-study/discussions', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingDiscussion.id, ...discussionForm }) });
      } else {
        resp = await fetch('/api/bible-study/discussions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(discussionForm) });
      }
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save discussion');
      toast.success('Discussion saved successfully!');
      await fetchDiscussions();
      closeEditDiscussionModal();
    } catch (err: any) {
      setDiscussionFormError(err.message || 'Failed to save discussion');
      toast.error(err.message || 'Failed to save discussion');
    } finally {
      setDiscussionFormLoading(false);
    }
  };
  const handleDeleteDiscussion = async () => {
    if (!deletingDiscussion) return;
    setDeleteDiscussionLoading(true);
    setDeleteDiscussionError(null);
    try {
      const resp = await fetch('/api/bible-study/discussions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deletingDiscussion.id }) });
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to delete discussion');
      toast.success('Discussion deleted successfully!');
      await fetchDiscussions();
      closeDeleteDiscussionDialog();
    } catch (err: any) {
      setDeleteDiscussionError(err.message || 'Failed to delete discussion');
      toast.error(err.message || 'Failed to delete discussion');
    } finally {
      setDeleteDiscussionLoading(false);
    }
  };

  const [realtimeDiscussions, setRealtimeDiscussions] = useState<Discussion[]>([])
  const [chatMessages, setChatMessages] = useState<any[]>([])
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const editor = isClient
    ? useEditor({
        extensions: [
          Collaboration.configure({ document: ydocRef.current || new Y.Doc() }),
          CollaborationCursor.configure({ provider: providerRef.current, user: { name: 'User', color: '#007bff' } })
        ],
        content: '',
        editable: true,
        immediatelyRender: false,
      })
    : null

  // Replace demo data with API calls
  const fetchStudies = async () => {
    const res = await fetch("/api/bible-study")
    const data = await res.json()
    setStudyPlans(data.studies || [])
  }
  const fetchGroups = async () => {
    const res = await fetch("/api/bible-study/groups")
    const data = await res.json()
    setStudyGroups(data.groups || [])
  }
  const fetchDiscussions = async () => {
    const res = await fetch("/api/bible-study/discussions")
    const data = await res.json()
    setDiscussions(data.discussions || [])
  }
  const fetchProgress = async () => {
    const res = await fetch("/api/bible-study/progress")
    const data = await res.json()
    setProgress(data.progress || null)
  }
  useEffect(() => {
    setIsLoading(true)
    Promise.all([fetchStudies(), fetchGroups(), fetchDiscussions(), fetchProgress()])
      .catch(() => toast.error("Failed to load Bible study data"))
      .finally(() => setIsLoading(false))
  }, [])

  // Real-time discussions
  useEffect(() => {
    const channel = supabase.channel('bible-study-discussions')
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bible_study_discussions' }, (payload: { new: Discussion }) => {
      setRealtimeDiscussions((prev) => [payload.new as Discussion, ...prev])
    })
    channel.subscribe()
    return () => { channel.unsubscribe() }
  }, [])
  // Real-time group chat
  useEffect(() => {
    const channel = supabase.channel('bible-study-group-chat')
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bible_study_group_chat' }, (payload: { new: any }) => {
      setChatMessages((prev) => [...prev, payload.new])
    })
    channel.subscribe()
    return () => { channel.unsubscribe() }
  }, [])
  // Real-time notifications (Supabase Realtime or polling)
  useEffect(() => {
    // Example: subscribe to a notifications channel
    const channel = supabase.channel('bible-study-notifications')
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bible_study_notifications' }, (payload: { new: any }) => {
      setNotifications((prev) => [payload.new, ...prev])
      setUnreadCount((c) => c + 1)
    })
    channel.subscribe()
    return () => { channel.unsubscribe() }
  }, [])
  // Collaborative notes for each lesson
  const openCollabNotes = (lessonId: string) => {
    setNotesModal({ open: true, lessonId })
    ydocRef.current = new Y.Doc()
    providerRef.current = new WebsocketProvider('wss://demos.yjs.dev', `bible-lesson-${lessonId}`, ydocRef.current)
    if (editor) editor.commands.setContent('')
    if (providerRef.current) {
      const awareness = providerRef.current.awareness
      const userId = Math.random().toString(36).slice(2)
      const userName = 'User'
      const userColor = `hsl(${Math.floor(Math.random() * 360)},70%,60%)`
      awareness.setLocalStateField('user', { id: userId, name: userName, color: userColor })
      const onChange = () => {
        const users = Array.from(awareness.getStates().values()).map((s: any) => s.user).filter(Boolean)
        setCollabUsers(users)
      }
      awareness.on('change', onChange)
      onChange()
    }
  }
  // AI-powered study/lesson suggestions
  const askAI = async (prompt: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
      const data = await res.json()
      toast.success('AI response received!')
      return data.response
    } catch {
      toast.error('AI request failed')
    } finally {
      setIsLoading(false)
    }
  }

  const searchBibleVerses = async (query: string) => {
    if (!query.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/bible/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 10 }),
      })

      if (response.ok) {
        const data = await response.json()
        // Handle search results
        toast.success(`Found ${data.verses?.length || 0} verses`)
      }
    } catch (error) {
      console.error("Error searching Bible:", error)
      toast.error("Failed to search Bible verses")
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIStudy = async (verse: BibleVerse, studyType: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/bible/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verse: verse.text,
          reference: verse.reference,
          studyType,
          language: "English",
        }),
      })

      if (response.ok) {
        const studyData = await response.json()
        toast.success("AI study generated successfully!")
        // Handle the generated study
        return studyData
      }
    } catch (error) {
      console.error("Error generating AI study:", error)
      toast.error("Failed to generate AI study")
    } finally {
      setIsLoading(false)
    }
  }

  const enrollInStudy = async (studyId: string) => {
    try {
      const updatedPlans = studyPlans.map((plan) =>
        plan.id === studyId ? { ...plan, isEnrolled: true, participants: plan.participants + 1 } : plan,
      )
      setStudyPlans(updatedPlans)
      toast.success("Successfully enrolled in study plan!")
    } catch (error) {
      console.error("Error enrolling in study:", error)
      toast.error("Failed to enroll in study")
    }
  }

  const completeLesson = async (lessonId: string) => {
    try {
      if (selectedStudy) {
        const updatedLessons = selectedStudy.lessons.map((lesson) =>
          lesson.id === lessonId ? { ...lesson, isCompleted: true } : lesson,
        )
        const completedCount = updatedLessons.filter((l) => l.isCompleted).length
        const newProgress = (completedCount / updatedLessons.length) * 100

        setSelectedStudy({
          ...selectedStudy,
          lessons: updatedLessons,
          progress: newProgress,
        })

        toast.success("Lesson completed! 🎉")
      }
    } catch (error) {
      console.error("Error completing lesson:", error)
      toast.error("Failed to complete lesson")
    }
  }

  const joinStudyGroup = async (groupId: string) => {
    try {
      const updatedGroups = studyGroups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: [
                ...group.members,
                {
                  id: "current-user",
                  name: "You",
                  avatar: "/placeholder-user.jpg",
                  role: "member" as const,
                  joinedAt: new Date().toISOString(),
                },
              ],
            }
          : group,
      )
      setStudyGroups(updatedGroups)
      toast.success("Successfully joined study group!")
    } catch (error) {
      console.error("Error joining group:", error)
      toast.error("Failed to join study group")
    }
  }

  const addDiscussion = async (content: string, studyId: string, lessonId?: string) => {
    try {
      const newDiscussion: Discussion = {
        id: `disc-${Date.now()}`,
        studyId,
        lessonId: lessonId || "",
        author: "You",
        authorAvatar: "/placeholder-user.jpg",
        content,
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: [],
        isLiked: false,
      }

      setDiscussions([newDiscussion, ...discussions])
      toast.success("Discussion added successfully!")
    } catch (error) {
      console.error("Error adding discussion:", error)
      toast.error("Failed to add discussion")
    }
  }

  const handleAskAI = async (prompt: string) => {
    setAiModal({ open: true, prompt, response: '' })
    const response = await askAI(prompt)
    setAiModal({ open: true, prompt, response })
  }

  const filteredStudyPlans = studyPlans.filter((plan) => {
    if (studyFilter === "all") return true
    if (studyFilter === "enrolled") return plan.isEnrolled
    if (studyFilter === "completed") return plan.progress === 100
    return plan.category === studyFilter
  })

  // --- Pagination, Sorting, Filtering Logic ---
  const sortedFilteredStudies = [...filteredStudyPlans].sort((a, b) => {
    let aValue = a[studySortField] || '';
    let bValue = b[studySortField] || '';
    if (studySortField === 'participants') {
      aValue = a.participants || 0;
      bValue = b.participants || 0;
    }
    if (studySortOrder === 'asc') return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
  });
  const totalStudiesPages = Math.ceil(sortedFilteredStudies.length / studiesPerPage);
  const paginatedStudies = sortedFilteredStudies.slice((studiesPage - 1) * studiesPerPage, studiesPage * studiesPerPage);

  // --- Pagination, Sorting, Filtering for Groups ---
  const sortedGroups = [...studyGroups].sort((a, b) => {
    let aValue = a[groupSortField] || '';
    let bValue = b[groupSortField] || '';
    if (groupSortOrder === 'asc') return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
  });
  const totalGroupsPages = Math.ceil(sortedGroups.length / groupsPerPage);
  const paginatedGroups = sortedGroups.slice((groupsPage - 1) * groupsPerPage, groupsPage * groupsPerPage);

  // --- Study Modal Handlers (move above first usage and ensure correct references) ---
  const openNewStudyModal = () => { setEditingStudy(null); setStudyForm({}); setShowEditStudy(true); setStudyFormError(null); };
  const openEditStudyModal = (study: StudyPlan) => { setEditingStudy(study); setStudyForm(study); setShowEditStudy(true); setStudyFormError(null); };
  const closeEditStudyModal = () => { setShowEditStudy(false); setEditingStudy(null); setStudyForm({}); setStudyFormError(null); };
  const openDeleteStudyDialog = (study: StudyPlan) => { setDeletingStudy(study); setShowDeleteStudy(true); setDeleteStudyError(null); };
  const closeDeleteStudyDialog = () => { setShowDeleteStudy(false); setDeletingStudy(null); setDeleteStudyError(null); };
  const handleStudyFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudyForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Interactive Bible Study</h1>
          <p className="text-muted-foreground">
            Discover, learn, and grow in your faith through interactive Bible studies
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" aria-label="Notifications" onClick={() => setUnreadCount(0)}>
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xs px-1">{unreadCount}</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No notifications</div>
              ) : notifications.map((notif, i) => (
                <div key={i} className={`p-3 border-b last:border-b-0 ${notif.read ? '' : 'bg-blue-50'}`}>
                  <div className="flex flex-col">
                    <span className="font-medium">{notif.title}</span>
                    <span className="text-xs text-muted-foreground">{notif.body}</span>
                    <span className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              <Button variant="link" className="w-full mt-2 text-blue-600" onClick={() => setShowNotifSettings(true)}>Notification Settings</Button>
            </PopoverContent>
          </Popover>
          <Button onClick={openNewStudyModal} variant="outline" className="mb-2">
            <Plus className="h-4 w-4 mr-2" />
            Create Study
          </Button>
          <Button variant="outline" onClick={() => setShowJoinGroup(true)}>
            <Users className="h-4 w-4 mr-2" />
            Join Group
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Bible verses, topics, or studies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchBibleVerses(searchQuery)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => searchBibleVerses(searchQuery)} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="discover">
            <BookOpen className="h-4 w-4 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="my-studies">
            <Target className="h-4 w-4 mr-2" />
            My Studies
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="h-4 w-4 mr-2" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="discussions">
            <MessageCircle className="h-4 w-4 mr-2" />
            Discussions
          </TabsTrigger>
          <TabsTrigger value="progress">
            <TrendingUp className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <PieChart className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select value={studyFilter} onValueChange={setStudyFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter studies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Studies</SelectItem>
                <SelectItem value="enrolled">My Enrolled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="theology">Theology</SelectItem>
                <SelectItem value="devotional">Devotional</SelectItem>
                <SelectItem value="character">Character Study</SelectItem>
                <SelectItem value="prophecy">Prophecy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured Studies */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Featured Studies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedStudies.map((study) => (
                <Card key={study.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge
                        variant={
                          study.difficulty === "beginner"
                            ? "secondary"
                            : study.difficulty === "intermediate"
                              ? "default"
                              : "destructive"
                        }
                      >
                        {study.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{study.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{study.title}</CardTitle>
                    <CardDescription>{study.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {study.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {study.participants} enrolled
                      </div>
                    </div>

                    {study.isEnrolled && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(study.progress)}%</span>
                        </div>
                        <Progress value={study.progress} />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {study.isEnrolled ? (
                        <Button className="flex-1" onClick={() => setSelectedStudy(study)}>
                          Continue Study
                        </Button>
                      ) : (
                        <Button className="flex-1" onClick={() => enrollInStudy(study.id)}>
                          Enroll Now
                        </Button>
                      )}
                      <Button variant="outline" size="icon">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditStudyModal(study)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => openDeleteStudyDialog(study)}>
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* My Studies Tab */}
        <TabsContent value="my-studies" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Studies */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold">Current Studies</h2>
              {studyPlans
                .filter((s) => s.isEnrolled && s.progress < 100)
                .map((study) => (
                  <Card key={study.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{study.title}</CardTitle>
                          <CardDescription>{study.description}</CardDescription>
                        </div>
                        <Badge>{study.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(study.progress)}%</span>
                        </div>
                        <Progress value={study.progress} />
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-medium">Next Lesson:</h4>
                        {study.lessons.find((l) => !l.isCompleted) && (
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div>
                              <p className="font-medium">{study.lessons.find((l) => !l.isCompleted)?.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {study.lessons.find((l) => !l.isCompleted)?.duration} min
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedStudy(study)
                                setCurrentLesson(study.lessons.find((l) => !l.isCompleted) || null)
                              }}
                            >
                              Start
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>

            {/* Study Stats */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Study Stats</h2>
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">7</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Studies Completed</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Hours Studied</span>
                      <span className="font-medium">24.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Verses Memorized</span>
                      <span className="font-medium">45</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Week Warrior</p>
                      <p className="text-xs text-muted-foreground">7 day study streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Scholar</p>
                      <p className="text-xs text-muted-foreground">Completed 10 studies</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <CardDescription>{group.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.members.length} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {group.meetingTime}
                    </div>
                  </div>

                  <div className="flex -space-x-2">
                    {group.members.slice(0, 4).map((member) => (
                      <Avatar key={member.id} className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {group.members.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                        +{group.members.length - 4}
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => joinStudyGroup(group.id)}
                    disabled={group.members.some((m) => m.id === "current-user")}
                  >
                    {group.members.some((m) => m.id === "current-user") ? "Joined" : "Join Group"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEditGroupModal(group)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => openDeleteGroupDialog(group)}>Delete</Button>
                </CardContent>
              </Card>
            ))}
            <Button onClick={openNewGroupModal} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create New Group
            </Button>
          </div>
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Discussions</CardTitle>
              <CardDescription>Join the conversation with fellow believers</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={discussion.authorAvatar || "/placeholder.svg"} />
                          <AvatarFallback>{discussion.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{discussion.author}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(discussion.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{discussion.content}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Heart
                                className={`h-4 w-4 mr-1 ${discussion.isLiked ? "fill-red-500 text-red-500" : ""}`}
                              />
                              {discussion.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Reply
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
          <Button onClick={openNewDiscussionModal} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add New Discussion
          </Button>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {progress && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary">{progress.completedStudies}</div>
                  <div className="text-sm text-muted-foreground">Studies Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary">{progress.currentStreak}</div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary">{progress.totalHours}</div>
                  <div className="text-sm text-muted-foreground">Hours Studied</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary">{progress.achievements.length}</div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Your Bible study milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress?.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.rarity === "legendary"
                          ? "bg-yellow-100"
                          : achievement.rarity === "epic"
                            ? "bg-purple-100"
                            : achievement.rarity === "rare"
                              ? "bg-blue-100"
                              : "bg-gray-100"
                      }`}
                    >
                      <Award
                        className={`h-5 w-5 ${
                          achievement.rarity === "legendary"
                            ? "text-yellow-600"
                            : achievement.rarity === "epic"
                              ? "text-purple-600"
                              : achievement.rarity === "rare"
                                ? "text-blue-600"
                                : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="font-semibold mb-2">Weekly Active Users</div>
                  <BarChart width={300} height={180} data={[{ name: 'Week 1', value: 24 }, { name: 'Week 2', value: 32 }, { name: 'Week 3', value: 40 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartTooltip />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                </div>
                <div>
                  <div className="font-semibold mb-2">Most Popular Studies</div>
                  <BarChart width={300} height={180} data={[{ name: 'Life of Jesus', value: 18 }, { name: 'Psalms', value: 12 }]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartTooltip />
                    <Bar dataKey="value" fill="#f59e42" />
                  </BarChart>
                </div>
              </div>
              <div className="mt-6">
                <div className="font-semibold mb-2">Activity Heatmap</div>
                <div className="flex gap-2">
                  {/* Simple heatmap: colored squares for activity by day/time */}
                  {[...Array(7)].map((_, d) => (
                    <div key={d} className="flex flex-col items-center">
                      <span className="text-xs">{['S','M','T','W','T','F','S'][d]}</span>
                      {[...Array(4)].map((_, h) => (
                        <div key={h} className={`w-6 h-6 rounded mb-1 ${['bg-gray-100','bg-blue-100','bg-blue-400','bg-blue-700'][Math.floor(Math.random()*4)]}`}></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Study Viewer Modal */}
      {selectedStudy && (
        <Dialog open={!!selectedStudy} onOpenChange={() => setSelectedStudy(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedStudy.title}</DialogTitle>
              <DialogDescription>{selectedStudy.description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{Math.round(selectedStudy.progress)}%</span>
                </div>
                <Progress value={selectedStudy.progress} />
              </div>

              {/* Lessons */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lessons</h3>
                {selectedStudy.lessons.map((lesson, index) => (
                  <Card key={lesson.id} className={lesson.isCompleted ? "bg-green-50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              lesson.isCompleted ? "bg-green-500 text-white" : "bg-muted"
                            }`}
                          >
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <span className="text-sm">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium">{lesson.title}</h4>
                            <p className="text-sm text-muted-foreground">{lesson.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{lesson.duration} min</span>
                          {!lesson.isCompleted && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentLesson(lesson)
                                completeLesson(lesson.id)
                              }}
                            >
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Collaborative Notes Modal */}
      <Dialog open={notesModal.open} onOpenChange={open => setNotesModal({ open, lessonId: open ? notesModal.lessonId : null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Collaborative Notes</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {collabUsers.map(u => (
              <div key={u.id} className="flex items-center gap-1">
                <Avatar style={{ background: u.color }} className="w-6 h-6 text-xs">
                  <AvatarFallback>{u.name.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs" style={{ color: u.color }}>{u.name}</span>
              </div>
            ))}
            {collabUsers.length > 0 && <span className="ml-2 text-xs text-muted-foreground">editing now</span>}
          </div>
          <div className="border rounded-lg p-4 bg-white">
            {editor && <EditorContent editor={editor} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Modal */}
      <Dialog open={aiModal.open} onOpenChange={open => setAiModal({ ...aiModal, open })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Insights</DialogTitle>
          </DialogHeader>
          <div className="mb-2 font-semibold">Prompt:</div>
          <div className="mb-4 text-sm bg-muted p-2 rounded">{aiModal.prompt}</div>
          <div className="mb-2 font-semibold">AI Response:</div>
          <div className="text-sm whitespace-pre-line bg-gray-50 p-2 rounded min-h-[80px]">{aiModal.response || 'Loading...'}</div>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Modal */}
      <Dialog open={showNotifSettings} onOpenChange={setShowNotifSettings}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notification Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notif-in-app" checked readOnly />
              <label htmlFor="notif-in-app">In-app notifications</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notif-email" />
              <label htmlFor="notif-email">Email notifications</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="notif-push" />
              <label htmlFor="notif-push">Push notifications</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifSettings(false)}>Close</Button>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Banner */}
      {showOnboarding && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded flex items-center justify-between mb-4 animate-fade-in">
          <div>
            <h2 className="font-bold text-lg mb-1">Welcome to Interactive Bible Study!</h2>
            <p className="text-sm text-blue-800">Collaborate, learn, and grow with your community. Try collaborative notes, AI insights, and real-time chat!</p>
          </div>
          <Button onClick={() => { setShowOnboarding(false); localStorage.setItem('bibleStudyOnboarded', 'true') }}>Got it!</Button>
        </div>
      )}

      {/* Sticky action bar for mobile */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg flex gap-2 p-2 z-50 animate-slide-up">
          <Button className="flex-1" onClick={() => setShowCreateStudy(true)} aria-label="Create Study">Create Study</Button>
          <Button className="flex-1" variant="outline" onClick={() => setShowJoinGroup(true)} aria-label="Join Group">Join Group</Button>
        </div>
      )}

      {/* Tooltips for major actions */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => openCollabNotes(currentLesson?.id || "")} aria-label="Open collaborative notes for this lesson">Collaborative Notes</Button>
          </TooltipTrigger>
          <TooltipContent>Collaborate in real time with your group on lesson notes.</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm" onClick={() => handleAskAI(`Give me insights for lesson: ${currentLesson?.title}`)} aria-label="Ask AI for lesson insights">Ask AI</Button>
          </TooltipTrigger>
          <TooltipContent>Get instant AI-powered insights and suggestions for this lesson.</TooltipContent>
        </Tooltip>
        {/* ...other tooltips for enroll, join/leave, chat... */}
      </TooltipProvider>

      {/* ARIA labels and keyboard navigation on all major actions */}
      {/* Smooth transitions and micro-animations via Tailwind animate- classes */}
      {/* Visual progress analytics */}
      {progress && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="font-semibold mb-2">Studies Completed</div>
                <BarChart width={300} height={180} data={[{ name: 'Completed', value: progress.completedStudies }, { name: 'Total', value: progress.totalStudies }]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartTooltip />
                  <Bar dataKey="value" fill="#6366f1" />
                </BarChart>
              </div>
              <div>
                <div className="font-semibold mb-2">Current Streak</div>
                <div className="text-4xl font-bold text-green-600 animate-bounce">{progress.currentStreak} days</div>
                <div className="mt-2">Favorite Category: <span className="font-semibold text-blue-700">{progress.favoriteCategory}</span></div>
              </div>
            </div>
            <div className="mt-4">
              <div className="font-semibold mb-2">Achievements</div>
              <div className="flex flex-wrap gap-2">
                {progress.achievements?.map((a, i) => (
                  <Badge key={i} variant="secondary" className="animate-pop-in">{a.title}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Study Modal */}
      <Dialog open={showEditStudy} onOpenChange={setShowEditStudy}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingStudy ? 'Edit Study' : 'Create Study'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStudyFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="title">Title</label>
              <Input name="title" value={studyForm.title || ''} onChange={handleStudyFormChange} required />
            </div>
            <div>
              <label htmlFor="description">Description</label>
              <Input name="description" value={studyForm.description || ''} onChange={handleStudyFormChange} required />
            </div>
            <div>
              <label htmlFor="duration">Duration</label>
              <Input name="duration" value={studyForm.duration || ''} onChange={handleStudyFormChange} />
            </div>
            <div>
              <label htmlFor="difficulty">Difficulty</label>
              <select name="difficulty" value={studyForm.difficulty || 'beginner'} onChange={handleStudyFormChange} className="w-full border rounded px-2 py-1">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label htmlFor="category">Category</label>
              <Input name="category" value={studyForm.category || ''} onChange={handleStudyFormChange} />
            </div>
            {studyFormError && <div className="text-red-600 text-sm">{studyFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditStudyModal} disabled={studyFormLoading}>Cancel</Button>
              <Button type="submit" disabled={studyFormLoading}>{studyFormLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Study Delete Confirmation Dialog */}
      <Dialog open={showDeleteStudy} onOpenChange={setShowDeleteStudy}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Study</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this study?</div>
          {deleteStudyError && <div className="text-red-600 text-sm">{deleteStudyError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteStudyDialog} disabled={deleteStudyLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteStudy} disabled={deleteStudyLoading}>{deleteStudyLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Lesson Modal */}
      <Dialog open={showEditLesson} onOpenChange={setShowEditLesson}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLessonFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="lessonTitle">Title</label>
              <Input name="title" value={lessonForm.title || ''} onChange={handleLessonFormChange} required />
            </div>
            <div>
              <label htmlFor="lessonDescription">Description</label>
              <Input name="description" value={lessonForm.description || ''} onChange={handleLessonFormChange} />
            </div>
            <div>
              <label htmlFor="lessonDuration">Duration (minutes)</label>
              <Input name="duration" type="number" value={lessonForm.duration || ''} onChange={handleLessonFormChange} />
            </div>
            {lessonFormError && <div className="text-red-600 text-sm">{lessonFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditLessonModal} disabled={lessonFormLoading}>Cancel</Button>
              <Button type="submit" disabled={lessonFormLoading}>{lessonFormLoading ? 'Saving...' : 'Save Lesson'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Delete Confirmation Dialog */}
      <Dialog open={showDeleteLesson} onOpenChange={setShowDeleteLesson}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lesson</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this lesson?</div>
          {deleteLessonError && <div className="text-red-600 text-sm">{deleteLessonError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteLessonDialog} disabled={deleteLessonLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteLesson} disabled={deleteLessonLoading}>{deleteLessonLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Group Modal */}
      <Dialog open={showEditGroup} onOpenChange={setShowEditGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGroup ? 'Edit Group' : 'Create New Group'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGroupFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="groupName">Group Name</label>
              <Input name="name" value={groupForm.name || ''} onChange={handleGroupFormChange} required />
            </div>
            <div>
              <label htmlFor="groupDescription">Description</label>
              <Input name="description" value={groupForm.description || ''} onChange={handleGroupFormChange} />
            </div>
            <div>
              <label htmlFor="groupMeetingTime">Meeting Time</label>
              <Input name="meetingTime" value={groupForm.meetingTime || ''} onChange={handleGroupFormChange} />
            </div>
            <div>
              <label htmlFor="groupIsPrivate">Private Group</label>
              <select name="isPrivate" value={groupForm.isPrivate ? 'true' : 'false'} onChange={handleGroupFormChange} className="w-full border rounded px-2 py-1">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            {groupFormError && <div className="text-red-600 text-sm">{groupFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditGroupModal} disabled={groupFormLoading}>Cancel</Button>
              <Button type="submit" disabled={groupFormLoading}>{groupFormLoading ? 'Saving...' : 'Save Group'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Group Delete Confirmation Dialog */}
      <Dialog open={showDeleteGroup} onOpenChange={setShowDeleteGroup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this group?</div>
          {deleteGroupError && <div className="text-red-600 text-sm">{deleteGroupError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteGroupDialog} disabled={deleteGroupLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteGroup} disabled={deleteGroupLoading}>{deleteGroupLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Discussion Modal */}
      <Dialog open={showEditDiscussion} onOpenChange={setShowEditDiscussion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDiscussion ? 'Edit Discussion' : 'Create New Discussion'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDiscussionFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="discussionContent">Content</label>
              <textarea name="content" value={discussionForm.content || ''} onChange={handleDiscussionFormChange} rows={4} className="w-full border rounded p-2" />
            </div>
            {discussionFormError && <div className="text-red-600 text-sm">{discussionFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDiscussionModal} disabled={discussionFormLoading}>Cancel</Button>
              <Button type="submit" disabled={discussionFormLoading}>{discussionFormLoading ? 'Saving...' : 'Save Discussion'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Discussion Delete Confirmation Dialog */}
      <Dialog open={showDeleteDiscussion} onOpenChange={setShowDeleteDiscussion}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Discussion</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this discussion?</div>
          {deleteDiscussionError && <div className="text-red-600 text-sm">{deleteDiscussionError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteDiscussionDialog} disabled={deleteDiscussionLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteDiscussion} disabled={deleteDiscussionLoading}>{deleteDiscussionLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

// Demo data functions
function getDemoStudyPlans(): StudyPlan[] {
  return [
    {
      id: "study-1",
      title: "The Life of Jesus",
      description: "A comprehensive study through the Gospels exploring the life and teachings of Jesus Christ",
      duration: "8 weeks",
      difficulty: "beginner",
      category: "theology",
      participants: 1247,
      rating: 4.8,
      progress: 35,
      isEnrolled: true,
      createdBy: "Pastor John",
      createdAt: "2024-01-15",
      lessons: [
        {
          id: "lesson-1",
          title: "The Birth of Jesus",
          description: "Exploring the nativity accounts in Matthew and Luke",
          verses: [],
          questions: ["What is the significance of Jesus being born in Bethlehem?"],
          insights: [],
          isCompleted: true,
          duration: 45,
        },
        {
          id: "lesson-2",
          title: "The Baptism and Temptation",
          description: "Jesus begins His ministry",
          verses: [],
          questions: ["Why was Jesus baptized?"],
          insights: [],
          isCompleted: true,
          duration: 40,
        },
        {
          id: "lesson-3",
          title: "The Sermon on the Mount",
          description: "Jesus teaches about kingdom living",
          verses: [],
          questions: ["What are the Beatitudes teaching us?"],
          insights: [],
          isCompleted: false,
          duration: 50,
        },
      ],
    },
    {
      id: "study-2",
      title: "Psalms of Praise",
      description: "Discovering worship and praise through the book of Psalms",
      duration: "6 weeks",
      difficulty: "intermediate",
      category: "devotional",
      participants: 892,
      rating: 4.6,
      progress: 0,
      isEnrolled: false,
      createdBy: "Dr. Sarah",
      createdAt: "2024-02-01",
      lessons: [],
    },
    {
      id: "study-3",
      title: "Paul's Prison Letters",
      description: "Study Ephesians, Philippians, Colossians, and Philemon",
      duration: "10 weeks",
      difficulty: "advanced",
      category: "theology",
      participants: 634,
      rating: 4.9,
      progress: 0,
      isEnrolled: false,
      createdBy: "Rev. Michael",
      createdAt: "2024-01-20",
      lessons: [],
    },
  ]
}

function getDemoStudyGroups(): StudyGroup[] {
  return [
    {
      id: "group-1",
      name: "Young Adults Bible Study",
      description: "A vibrant community of young adults studying God's word together",
      members: [
        { id: "1", name: "Sarah Johnson", avatar: "/placeholder-user.jpg", role: "leader", joinedAt: "2024-01-01" },
        { id: "2", name: "Mike Chen", avatar: "/placeholder-user.jpg", role: "member", joinedAt: "2024-01-15" },
        { id: "3", name: "Emily Davis", avatar: "/placeholder-user.jpg", role: "member", joinedAt: "2024-02-01" },
      ],
      currentStudy: "The Life of Jesus",
      meetingTime: "Wednesdays 7PM",
      isPrivate: false,
      createdBy: "Sarah Johnson",
    },
    {
      id: "group-2",
      name: "Women's Morning Study",
      description: "Early morning Bible study for busy women",
      members: [
        { id: "4", name: "Lisa Brown", avatar: "/placeholder-user.jpg", role: "leader", joinedAt: "2024-01-01" },
        { id: "5", name: "Anna Wilson", avatar: "/placeholder-user.jpg", role: "member", joinedAt: "2024-01-10" },
      ],
      currentStudy: "Psalms of Praise",
      meetingTime: "Tuesdays 6AM",
      isPrivate: false,
      createdBy: "Lisa Brown",
    },
  ]
}

function getDemoDiscussions(): Discussion[] {
  return [
    {
      id: "disc-1",
      studyId: "study-1",
      lessonId: "lesson-1",
      author: "Sarah Johnson",
      authorAvatar: "/placeholder-user.jpg",
      content:
        "I found it fascinating how the genealogies in Matthew and Luke serve different purposes. Matthew emphasizes Jesus' royal lineage while Luke traces back to Adam, showing Jesus as the Savior of all humanity.",
      timestamp: "2024-01-20T10:30:00Z",
      likes: 12,
      replies: [],
      isLiked: false,
    },
    {
      id: "disc-2",
      studyId: "study-1",
      lessonId: "lesson-2",
      author: "Mike Chen",
      authorAvatar: "/placeholder-user.jpg",
      content:
        "The temptation narrative really shows Jesus' humanity. He faced real temptation but remained sinless. This gives me hope that we too can overcome temptation through God's strength.",
      timestamp: "2024-01-19T15:45:00Z",
      likes: 8,
      replies: [],
      isLiked: true,
    },
  ]
}

function getDemoProgress(): StudyProgress {
  return {
    totalStudies: 15,
    completedStudies: 12,
    currentStreak: 7,
    totalHours: 24.5,
    favoriteCategory: "theology",
    achievements: [
      {
        id: "ach-1",
        title: "First Steps",
        description: "Completed your first Bible study",
        icon: "trophy",
        unlockedAt: "2024-01-01",
        rarity: "common",
      },
      {
        id: "ach-2",
        title: "Week Warrior",
        description: "Maintained a 7-day study streak",
        icon: "flame",
        unlockedAt: "2024-01-15",
        rarity: "rare",
      },
      {
        id: "ach-3",
        title: "Scholar",
        description: "Completed 10 Bible studies",
        icon: "graduation-cap",
        unlockedAt: "2024-01-20",
        rarity: "epic",
      },
    ],
  }
}
