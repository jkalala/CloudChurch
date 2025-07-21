export interface Feature {
  id: string
  name: string
  description: string
  enabled: boolean
  category: "core" | "ministry" | "communication" | "analytics" | "advanced"
  dependencies?: string[]
  beta?: boolean
}

export interface FeatureCategory {
  id: string
  name: string
  description: string
  icon: string
  features: Feature[]
}

export const FEATURE_CATEGORIES: FeatureCategory[] = [
  { id: "core", name: "Core", description: "Essential features", icon: "Home", features: [] },
  { id: "ministry", name: "Ministry", description: "Pastoral & ministry tools", icon: "Heart", features: [] },
  {
    id: "communication",
    name: "Communication",
    description: "Messaging & outreach",
    icon: "MessageSquare",
    features: [],
  },
  { id: "analytics", name: "Analytics", description: "Reporting & analytics", icon: "BarChart3", features: [] },
  { id: "advanced", name: "Advanced", description: "AI, face-rec & other experimental", icon: "Bot", features: [] },
]

export const DEFAULT_FEATURES: Feature[] = [
  // Core Features - Always available (not toggleable)
  {
    id: "member-management",
    name: "Member Management",
    description: "Manage church members, profiles, and attendance",
    enabled: true,
    category: "core",
  },
  {
    id: "event-management",
    name: "Event Management",
    description: "Create and manage church events and activities",
    enabled: true,
    category: "core",
  },
  {
    id: "financial-management",
    name: "Financial Management",
    description: "Track donations, tithes, and church finances",
    enabled: true,
    category: "core",
  },
  {
    id: "music-ministry",
    name: "Music Ministry",
    description: "Choir management and music planning tools",
    enabled: true,
    category: "core",
  },

  // Optional Features - Can be enabled/disabled
  {
    id: "pastoral-care",
    name: "Pastoral Care",
    description: "Member care, prayer requests, and pastoral support",
    enabled: false,
    category: "ministry",
  },
  {
    id: "live-streaming",
    name: "Live Streaming",
    description: "Stream services and manage online congregation",
    enabled: false,
    category: "ministry",
  },
  {
    id: "bible-study",
    name: "Bible Study Tools",
    description: "Interactive Bible study and devotional tools",
    enabled: false,
    category: "ministry",
  },
  {
    id: "communication-tools",
    name: "Communication Tools",
    description: "SMS, email, and notification systems",
    enabled: false,
    category: "communication",
  },
  {
    id: "outreach-crm",
    name: "Outreach CRM",
    description: "Community outreach and relationship management",
    enabled: false,
    category: "communication",
  },
  {
    id: "reporting-analytics",
    name: "Reporting & Analytics",
    description: "Advanced reports and church analytics",
    enabled: false,
    category: "analytics",
  },
  {
    id: "department-management",
    name: "Department Management",
    description: "Organize and manage church departments",
    enabled: false,
    category: "analytics",
  },
  {
    id: "ai-assistant",
    name: "AI Assistant",
    description: "AI-powered church management assistance",
    enabled: false,
    category: "advanced",
    beta: true,
  },
  {
    id: "face-recognition",
    name: "Face Recognition",
    description: "Automated attendance tracking with facial recognition",
    enabled: false,
    category: "advanced",
    beta: true,
    dependencies: ["member-management"],
  },
  {
    id: "mobile_pwa",
    name: "Mobile PWA",
    description: "Enable Progressive Web App features for mobile users (install, offline, sync, etc.)",
    enabled: false,
    category: "advanced",
  },
]

// Feature management functions
export class FeatureManager {
  private static features: Map<string, Feature> = new Map()
  private static initialized = false

  static initialize() {
    if (this.initialized) return

    // Load from localStorage or use defaults
    let features = DEFAULT_FEATURES
    if (typeof window !== "undefined") {
      const savedFeatures = localStorage.getItem("church-app-features")
      if (savedFeatures) {
        try {
          const saved = JSON.parse(savedFeatures)
          features = DEFAULT_FEATURES.map((defaultFeature) => {
            const savedFeature = saved.find((f: Feature) => f.id === defaultFeature.id)
            return savedFeature ? { ...defaultFeature, enabled: savedFeature.enabled } : defaultFeature
          })
        } catch (error) {
          console.error("Error loading saved features:", error)
        }
      }
    }
    features.forEach((feature: Feature) => {
      this.features.set(feature.id, feature)
    })
    this.initialized = true
  }

  static getFeature(id: string): Feature | undefined {
    this.initialize()
    return this.features.get(id)
  }

  static isEnabled(id: string): boolean {
    this.initialize()
    const feature = this.features.get(id)
    return feature?.enabled ?? false
  }

  static enableFeature(id: string): boolean {
    this.initialize()
    const feature = this.features.get(id)
    if (!feature) return false

    // Check dependencies
    if (feature.dependencies) {
      for (const depId of feature.dependencies) {
        if (!this.isEnabled(depId)) {
          throw new Error(`Feature "${feature.name}" requires "${this.getFeature(depId)?.name}" to be enabled first`)
        }
      }
    }

    feature.enabled = true
    this.features.set(id, feature)
    this.saveFeatures()
    return true
  }

  static disableFeature(id: string): boolean {
    this.initialize()
    const feature = this.features.get(id)
    if (!feature) return false

    // Prevent disabling core features
    if (feature.category === "core") {
      throw new Error(`Cannot disable core feature "${feature.name}"`)
    }

    // Check if other features depend on this one
    const dependentFeatures = Array.from(this.features.values()).filter(
      (f) => f.dependencies?.includes(id) && f.enabled,
    )

    if (dependentFeatures.length > 0) {
      const names = dependentFeatures.map((f) => f.name).join(", ")
      throw new Error(`Cannot disable "${feature.name}" because it's required by: ${names}`)
    }

    feature.enabled = false
    this.features.set(id, feature)
    this.saveFeatures()
    return true
  }

  static getAllFeatures(): Feature[] {
    this.initialize()
    return Array.from(this.features.values())
  }

  static getFeaturesByCategory(category: Feature["category"]): Feature[] {
    this.initialize()
    return Array.from(this.features.values()).filter((f) => f.category === category)
  }

  static getOptionalFeatures(): Feature[] {
    this.initialize()
    return Array.from(this.features.values()).filter((f) => f.category !== "core")
  }

  static saveFeatures() {
    if (typeof window !== "undefined") {
      const features = Array.from(this.features.values())
      localStorage.setItem("church-app-features", JSON.stringify(features))
    }
  }

  static resetToDefaults() {
    this.features.clear()
    DEFAULT_FEATURES.forEach((feature) => {
      this.features.set(feature.id, { ...feature })
    })
    this.saveFeatures()
  }

  static getCategoriesWithFeatures(): FeatureCategory[] {
    this.initialize()
    // Map base categories
    return FEATURE_CATEGORIES.map((cat) => ({
      ...cat,
      features: Array.from(this.features.values()).filter((f) => f.category === cat.id),
    }))
  }
}

// React hook for using features
export function useFeatures(featureIds: string[]): Record<string, boolean> {
  FeatureManager.initialize()

  const features: Record<string, boolean> = {}
  featureIds.forEach((id) => {
    features[id] = FeatureManager.isEnabled(id)
  })

  return features
}

export function useFeature(featureId: string): boolean {
  FeatureManager.initialize()
  return FeatureManager.isEnabled(featureId)
}
