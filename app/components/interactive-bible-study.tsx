"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { toast } from "sonner"

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

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    setIsLoading(true)
    try {
      // Load demo data
      setStudyPlans(getDemoStudyPlans())
      setStudyGroups(getDemoStudyGroups())
      setDiscussions(getDemoDiscussions())
      setProgress(getDemoProgress())
    } catch (error) {
      console.error("Error loading Bible study data:", error)
      toast.error("Failed to load Bible study data")
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

  const filteredStudyPlans = studyPlans.filter((plan) => {
    if (studyFilter === "all") return true
    if (studyFilter === "enrolled") return plan.isEnrolled
    if (studyFilter === "completed") return plan.progress === 100
    return plan.category === studyFilter
  })

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
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateStudy(true)}>
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
        <TabsList className="grid w-full grid-cols-5">
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
              {filteredStudyPlans.slice(0, 6).map((study) => (
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
            {studyGroups.map((group) => (
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
                </CardContent>
              </Card>
            ))}
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
