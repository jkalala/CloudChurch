"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { AuthService, type UserProfile } from "@/lib/auth-service"
import { supabase } from "@/lib/supabase-client"
import type { Language } from "@/lib/i18n"

interface AuthContextType {
  user: any | null
  userProfile: UserProfile | null
  loading: boolean
  language: Language
  setLanguage: (lang: Language) => void
  signOut: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  refreshProfile: () => Promise<void>
  hasPermission: (permission: string) => boolean
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [language, setLanguage] = useState<Language>("pt")

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      setLoading(true)
      // Use supabase.auth.getUser() to get the user from localStorage/session
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      let profile = null;
      if (currentUser) {
        // Optionally, fetch the user profile from your API or DB here
        const { data, error } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", currentUser.id)
          .single();
        if (!error) profile = data;
      }
      setUser(currentUser);
      setUserProfile(profile);
    } catch (error) {
      console.error("Error loading user:", error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await AuthService.signIn(email, password)

      if (result.success && result.user && result.profile) {
        setUser(result.user)
        setUserProfile(result.profile)
        return { success: true }
      } else {
        return { success: false, error: result.error || "Authentication failed" }
      }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: "Authentication failed" }
    }
  }

  const refreshProfile = async () => {
    if (user) {
      const { profile } = await AuthService.getCurrentUser()
      setUserProfile(profile)
    }
  }

  const signOut = async () => {
    try {
      await AuthService.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!userProfile?.permissions) return false
    return AuthService.hasPermission(userProfile.permissions, permission as any)
  }

  const isAdmin = (): boolean => {
    return AuthService.isAdmin(userProfile)
  }

  const value = {
    user,
    userProfile,
    loading,
    language,
    setLanguage,
    signOut,
    signIn,
    refreshProfile,
    hasPermission,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
