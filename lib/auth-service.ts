import { supabase } from "@/lib/supabase-client"

export interface UserPermissions {
  manage_users: boolean
  manage_finances: boolean
  manage_events: boolean
  manage_members: boolean
  manage_settings: boolean
  view_analytics: boolean
  manage_departments: boolean
  manage_streaming: boolean
  manage_pastoral_care: boolean
  super_admin: boolean
}

export interface UserProfile {
  id: string
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  role: "admin" | "pastor" | "leader" | "member"
  church_name?: string
  phone?: string
  profile_image?: string
  permissions?: UserPermissions
  created_at: string
  updated_at: string
}

export class AuthService {
  private static supabase = supabase
  private static currentSession: { user: any; profile: UserProfile } | null = null

  static async signIn(
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: any; profile?: UserProfile; error?: string }> {
    try {
      // Use the new API route to sign in and set the cookie
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        return { success: false, error: result.error || "Authentication failed" };
      }
      // Set the session in the Supabase client for localStorage sync
      if (result.session && result.session.access_token && result.session.refresh_token) {
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
      }
      // After successful login, reload the page to sync session
      if (typeof window !== "undefined") {
        window.location.reload();
      }
      return { success: true };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { success: false, error: error.message || "Authentication failed" };
    }
  }

  static async signOut(): Promise<void> {
    try {
      // Clear session
      this.currentSession = null

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_session")
      }
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  static async getCurrentUser(): Promise<{ user: any; profile: UserProfile | null }> {
    try {
      // Check if we have a current session
      if (this.currentSession) {
        return this.currentSession
      }

      // Try to restore from localStorage
      if (typeof window !== "undefined") {
        const storedSession = localStorage.getItem("auth_session")
        if (storedSession) {
          this.currentSession = JSON.parse(storedSession)
          return this.currentSession!
        }
      }

      return { user: null, profile: null }
    } catch (error) {
      console.error("Error getting current user:", error)
      return { user: null, profile: null }
    }
  }

  static async createUserProfile(user: any): Promise<UserProfile | null> {
    try {
      // Check if this is the admin user
      const isAdmin = user.email === "joaquim.kalala@gmail.com"

      const profileData = {
        user_id: user.id,
        email: user.email,
        first_name: isAdmin ? "Joaquim" : user.user_metadata?.first_name || null,
        last_name: isAdmin ? "Kalala" : user.user_metadata?.last_name || null,
        role: isAdmin ? "admin" : "member",
        church_name: isAdmin ? "Igreja Semente Bendita" : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // In a real app, this would save to database
      console.log("Creating profile:", profileData)

      // If admin, grant all permissions
      if (isAdmin) {
        await this.grantAdminPermissions(user.id)
      }

      return profileData as UserProfile
    } catch (error) {
      console.error("Error creating user profile:", error)
      return null
    }
  }

  static async getUserPermissions(userId: string): Promise<UserPermissions> {
    try {
      // Fetch permissions from admin_permissions table
      const { data: permissionsRows } = await this.supabase
        .from("admin_permissions")
        .select("permission_type")
        .eq("user_id", userId);
      const permissions = permissionsRows
        ? permissionsRows.reduce((acc: any, row: any) => {
            acc[row.permission_type] = true;
            return acc;
          }, {})
        : {};
      return permissions as UserPermissions;
    } catch (error) {
      console.error("Error getting user permissions:", error);
      return {} as UserPermissions;
    }
  }

  static async grantAdminPermissions(userId: string): Promise<void> {
    try {
      console.log("Granting admin permissions to:", userId)
      // In a real app, this would update the database
    } catch (error) {
      console.error("Error granting admin permissions:", error)
    }
  }

  static getDefaultPermissions(): UserPermissions {
    return {
      manage_users: false,
      manage_finances: false,
      manage_events: false,
      manage_members: false,
      manage_settings: false,
      view_analytics: false,
      manage_departments: false,
      manage_streaming: false,
      manage_pastoral_care: false,
      super_admin: false,
    }
  }

  static hasPermission(permissions: UserPermissions, permission: keyof UserPermissions): boolean {
    return permissions[permission] || permissions.super_admin
  }

  static isAdmin(profile: UserProfile | null): boolean {
    return profile?.role === "admin" || profile?.permissions?.super_admin === true
  }
}

export default AuthService
