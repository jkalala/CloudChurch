"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  DollarSign,
  Calendar,
  Heart,
  Mic,
  MapPin,
  BookOpen,
  Settings,
  X,
  ChevronRight,
  Smartphone,
  Shield,
  Globe,
  LogOut,
  User,
  Radio,
  Home,
  Building2,
  Calculator,
  HelpCircle,
  Bot,
  ScanFace,
  Music,
  Users2,
  HandIcon as Hands,
  Book,
  Zap,
  Church,
  Sparkles,
  Languages,
} from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { useTranslation, type Language } from "@/lib/i18n"
import { useFeatures } from "@/lib/feature-management"
import LanguageSelector from "./language-selector"

interface MobileNavigationProps {
  onClose?: () => void
  language?: string
  router?: { push: (route: string) => void }
}

export default function MobileNavigation({ onClose, router: injectedRouter }: MobileNavigationProps) {
  const router = injectedRouter || useRouter()
  const [activeSection, setActiveSection] = useState("dashboard")
  const { language, setLanguage, user, signOut } = useAuth()
  const { t } = useTranslation(language)

  // Get feature flags
  const features = useFeatures([
    "member-management",
    "event-management",
    "financial-management",
    "live-streaming",
    "ai-assistant",
    "pastoral-care",
    "outreach-crm",
    "music-ministry",
    "bible-study",
    "department-management",
    "face-recognition",
    "communication-tools",
  ])

  const navigationItems = [
    // Core Management
    {
      id: "dashboard",
      title: t("dashboard"),
      icon: Home,
      description: t("overviewAndQuickActions"),
      badge: t("home"),
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      route: "/dashboard",
      category: "core",
      enabled: true, // Always enabled
    },
    {
      id: "members",
      title: t("members"),
      icon: Users,
      description: t("memberManagementDesc"),
      badge: "247",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      route: "/dashboard?tab=members",
      category: "core",
      enabled: features["member-management"],
    },
    {
      id: "events",
      title: t("events"),
      icon: Calendar,
      description: t("eventsAndMeetingsDesc"),
      badge: "8",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      route: "/dashboard?tab=events",
      category: "core",
      enabled: features["event-management"],
    },
    {
      id: "finance",
      title: t("finance"),
      icon: DollarSign,
      description: t("financialTrackingDesc"),
      badge: "Kz 125K",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      route: "/dashboard?tab=financial",
      category: "core",
      enabled: features["financial-management"],
    },

    // Ministry & Worship
    {
      id: "choir",
      title: t("choir"),
      icon: Mic,
      description: t("musicMinistryDesc"),
      badge: "24",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      route: "/dashboard?tab=choir",
      category: "ministry",
      enabled: features["music-ministry"],
    },
    {
      id: "music-ministry",
      title: t("musicMinistry"),
      icon: Music,
      description: t("aiMusicToolsDesc"),
      badge: t("new"),
      color: "text-pink-600",
      bgColor: "bg-pink-50 dark:bg-pink-900/20",
      borderColor: "border-pink-200 dark:border-pink-800",
      route: "/music-ministry",
      category: "ministry",
      enabled: features["music-ministry"],
    },
    {
      id: "streaming",
      title: t("liveStreaming"),
      icon: Radio,
      description: t("streamingPlatform"),
      badge: t("live"),
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      route: "/dashboard?tab=streaming",
      category: "ministry",
      enabled: features["live-streaming"],
    },
    {
      id: "pastoral-care",
      title: t("pastoralCare"),
      icon: Heart,
      description: t("memberCareAndSupport"),
      badge: "15",
      color: "text-rose-600",
      bgColor: "bg-rose-50 dark:bg-rose-900/20",
      borderColor: "border-rose-200 dark:border-rose-800",
      route: "/pastoral-care",
      category: "ministry",
      enabled: features["pastoral-care"],
    },

    // Community & Outreach
    {
      id: "outreach",
      title: t("outreach"),
      icon: MapPin,
      description: t("communityOutreachDesc"),
      badge: "3",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
      borderColor: "border-cyan-200 dark:border-cyan-800",
      route: "/dashboard?tab=outreach",
      category: "community",
      enabled: features["outreach-crm"],
    },
    {
      id: "outreach-crm",
      title: t("outreachCRM"),
      icon: Users2,
      description: t("communityRelationshipManagement"),
      badge: t("new"),
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
      borderColor: "border-teal-200 dark:border-teal-800",
      route: "/outreach-crm",
      category: "community",
      enabled: features["outreach-crm"],
    },
    {
      id: "prayers",
      title: t("prayerRequests"),
      icon: Hands,
      description: t("communityPrayersDesc"),
      badge: "23",
      color: "text-violet-600",
      bgColor: "bg-violet-50 dark:bg-violet-900/20",
      borderColor: "border-violet-200 dark:border-violet-800",
      route: "/dashboard?tab=outreach",
      category: "community",
      enabled: features["pastoral-care"],
    },

    // Bible & Study Tools
    {
      id: "bible-study",
      title: t("bibleStudy"),
      icon: BookOpen,
      description: t("interactiveBibleStudy"),
      badge: t("ai"),
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
      borderColor: "border-indigo-200 dark:border-indigo-800",
      route: "/bible-study",
      category: "study",
      enabled: features["bible-study"],
    },
    {
      id: "bible-tools",
      title: t("bibleTools"),
      icon: Book,
      description: t("bibleStudyAIDesc"),
      badge: t("new"),
      color: "text-blue-700",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      borderColor: "border-blue-300 dark:border-blue-700",
      route: "/dashboard?tab=tools",
      category: "study",
      enabled: features["ai-assistant"],
    },

    // AI & Technology
    {
      id: "ai-assistant",
      title: t("aiAssistant"),
      icon: Bot,
      description: t("intelligentChurchAssistant"),
      badge: t("ai"),
      color: "text-purple-700",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      borderColor: "border-purple-300 dark:border-purple-700",
      route: "/dashboard?tab=tools",
      category: "ai",
      enabled: features["ai-assistant"],
    },
    {
      id: "face-recognition",
      title: t("faceRecognition"),
      icon: ScanFace,
      description: t("smartAttendanceTracking"),
      badge: t("beta"),
      color: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      route: "/dashboard?tab=members",
      category: "ai",
      enabled: features["face-recognition"],
    },

    // Administration
    {
      id: "departments",
      title: t("departments"),
      icon: Building2,
      description: t("organizationalStructure"),
      badge: "12",
      color: "text-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-900/20",
      borderColor: "border-slate-200 dark:border-slate-800",
      route: "/dashboard?tab=departments",
      category: "admin",
      enabled: features["department-management"],
    },
    {
      id: "budgeting",
      title: t("budgets"),
      icon: Calculator,
      description: t("advancedBudgetingTools"),
      badge: "5",
      color: "text-green-700",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      borderColor: "border-green-300 dark:border-green-700",
      route: "/dashboard?tab=budgeting",
      category: "admin",
      enabled: features["financial-management"],
    },
    {
      id: "help",
      title: t("helpAndSupport"),
      icon: HelpCircle,
      description: t("guidesAndDocumentationDesc"),
      badge: t("docs"),
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/20",
      borderColor: "border-gray-200 dark:border-gray-800",
      route: "/dashboard?tab=documentation",
      category: "admin",
      enabled: true, // Always enabled
    },
  ]

  // Filter navigation items based on enabled features
  const enabledNavigationItems = navigationItems.filter((item) => item.enabled)

  // Add category definitions
  const categories = [
    { id: "core", title: t("coreFeatures"), icon: Zap, color: "text-blue-600" },
    { id: "ministry", title: t("ministryAndWorship"), icon: Church, color: "text-purple-600" },
    { id: "community", title: t("communityOutreach"), icon: Users, color: "text-green-600" },
    { id: "study", title: t("bibleAndStudy"), icon: BookOpen, color: "text-indigo-600" },
    { id: "ai", title: t("aiAndTechnology"), icon: Sparkles, color: "text-pink-600" },
    { id: "admin", title: t("administration"), icon: Settings, color: "text-gray-600" },
  ]

  const handleNavigation = (id: string, route?: string) => {
    console.log('handleNavigation called', id, route);
    setActiveSection(id)
    if (route) {
      router.push(route)
    } else if (id === "dashboard") {
      router.push("/dashboard")
    }
    onClose?.()
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast({
        title: t("logoutSuccessful"),
        description: t("youHaveBeenLoggedOut"),
      })
      router.push("/auth")
      onClose?.()
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      toast({
        title: t("logoutError"),
        description: t("anErrorOccurredWhileLoggingOut"),
        variant: "destructive",
      })
    }
  }

  return (
    <div className="h-full min-h-screen max-h-screen flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden pb-safe">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm pt-safe">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src="/images/semente-bendita-logo.png"
                alt="Connectus"
                width={32}
                height={32}
                className="rounded-lg shadow-sm"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white block text-sm">Connectus</span>
              <span className="font-medium text-gray-600 dark:text-gray-400 block text-xs">{t("mobileChurch")}</span>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-2xl border border-blue-200/50 dark:border-blue-800/50 shadow-lg backdrop-blur-sm">
          <Avatar className="h-12 w-12 ring-3 ring-blue-200 dark:ring-blue-800 shadow-lg">
            <AvatarImage src="/placeholder.svg?height=48&width=48" alt={user?.email || t("user")} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 dark:text-white truncate text-lg">{user?.email || t("user")}</p>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t("churchAdministrator")}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleNavigation("profile")}
            className="hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Language Selector */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Languages className="h-4 w-4" />
            <span>{t("language")}</span>
          </div>
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={setLanguage}
            variant="button"
            size="sm"
          />
        </div>
      </div>

      {/* Navigation Items by Category */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 max-h-full">
        {categories.map((category) => {
          const categoryItems = enabledNavigationItems.filter((item) => item.category === category.id)
          if (categoryItems.length === 0) return null

          return (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-3 px-2 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border border-gray-200 dark:border-gray-700">
                  <category.icon className={`h-5 w-5 ${category.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                    {category.title}
                  </h3>
                  <div className="h-0.5 bg-gradient-to-r from-gray-300 to-transparent dark:from-gray-600 rounded-full mt-1"></div>
                </div>
              </div>
              <div className="space-y-2">
                {categoryItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-in slide-in-from-left duration-300 transform hover:scale-[1.01] transition-transform"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-auto p-4 transition-all duration-200 hover:scale-[1.02] ${
                        activeSection === item.id
                          ? `bg-white dark:bg-gray-800 ${item.color} border-l-4 ${item.borderColor} shadow-lg ring-2 ring-blue-100 dark:ring-blue-900`
                          : "hover:bg-white/60 dark:hover:bg-gray-800/60 hover:shadow-sm"
                      } rounded-xl border border-gray-100 dark:border-gray-800`}
                      onClick={() => handleNavigation(item.id, item.route)}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl ${
                          activeSection === item.id
                            ? "bg-white dark:bg-gray-700 shadow-md ring-2 ring-blue-200 dark:ring-blue-800"
                            : item.bgColor
                        } flex items-center justify-center mr-4 flex-shrink-0 shadow-sm border border-gray-200/50 dark:border-gray-700/50`}
                      >
                        <item.icon className={`h-6 w-6 ${item.color}`} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`font-semibold truncate ${
                              activeSection === item.id
                                ? "text-gray-900 dark:text-white"
                                : "text-gray-900 dark:text-white"
                            }`}
                          >
                            {item.title}
                          </span>
                          <Badge
                            variant={
                              item.badge === t("new") || item.badge === t("ai") || item.badge === t("beta")
                                ? "default"
                                : "secondary"
                            }
                            className={`text-xs ml-2 flex-shrink-0 ${
                              activeSection === item.id
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : ""
                            }`}
                          >
                            {item.badge}
                          </Badge>
                        </div>
                        <p
                          className={`text-xs truncate ${
                            activeSection === item.id
                              ? "text-gray-700 dark:text-gray-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {item.description}
                        </p>
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* App Features */}
      <div className="p-4">
        <div className="p-4 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            {t("appFeatures")}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Smartphone className="h-4 w-4 text-green-600" />
              <span>{t("offlineModeActive")}</span>
            </div>
            {features["face-recognition"] && (
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <Shield className="h-4 w-4 text-blue-600" />
                <span>{t("facialRecognitionEnabled")}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <Globe className="h-4 w-4 text-purple-600" />
              <span>{t("multiLanguageSupport")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm pb-safe">
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            onClick={() => handleNavigation("profile")}
          >
            <User className="h-4 w-4 mr-3 text-blue-600" />
            <span className="text-gray-700 dark:text-gray-300">{t("profileSettings")}</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            onClick={() => handleNavigation("settings")}
          >
            <Settings className="h-4 w-4 mr-3 text-gray-600" />
            <span className="text-gray-700 dark:text-gray-300">{t("appSettings")}</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>{t("signOut")}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
