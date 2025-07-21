import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PresenceStatus } from "./database-types"
import { PresenceUser } from "./types/presence"

/**
 * Service for managing user presence in the application
 */
export class PresenceService {
  private supabase = createClientComponentClient()
  
  /**
   * Join a resource and start tracking presence
   */
  async joinResource(
    resourceId: string,
    resourceType: string,
    status: PresenceStatus = "online",
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const { data: user } = await this.supabase.auth.getUser()
    if (!user.user) {
      throw new Error("User not authenticated")
    }
    
    // Check if user already has a presence record for this resource
    const { data: existingPresence } = await this.supabase
      .from("presence")
      .select("id")
      .eq("user_id", user.user.id)
      .eq("resource_id", resourceId)
      .eq("resource_type", resourceType)
      .single()
    
    if (existingPresence) {
      // Update existing presence
      await this.supabase
        .from("presence")
        .update({
          status,
          metadata,
          last_active: new Date().toISOString(),
        })
        .eq("id", existingPresence.id)
      
      return existingPresence.id
    } else {
      // Create new presence record
      const { data, error } = await this.supabase
        .from("presence")
        .insert({
          user_id: user.user.id,
          resource_id: resourceId,
          resource_type: resourceType,
          status,
          metadata,
        })
        .select("id")
        .single()
      
      if (error) {
        throw error
      }
      
      return data.id
    }
  }
  
  /**
   * Update user's presence status
   */
  async updateStatus(
    presenceId: string,
    status: PresenceStatus
  ): Promise<void> {
    const { error } = await this.supabase
      .from("presence")
      .update({
        status,
        last_active: new Date().toISOString(),
      })
      .eq("id", presenceId)
    
    if (error) {
      throw error
    }
  }
  
  /**
   * Update user's presence metadata
   */
  async updateMetadata(
    presenceId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    const { error } = await this.supabase
      .from("presence")
      .update({
        metadata,
        last_active: new Date().toISOString(),
      })
      .eq("id", presenceId)
    
    if (error) {
      throw error
    }
  }
  
  /**
   * Leave a resource (remove presence)
   */
  async leaveResource(presenceId: string): Promise<void> {
    const { error } = await this.supabase
      .from("presence")
      .delete()
      .eq("id", presenceId)
    
    if (error) {
      throw error
    }
  }
  
  /**
   * Get all users present on a resource
   */
  async getResourceUsers(
    resourceId: string,
    resourceType: string
  ): Promise<PresenceUser[]> {
    // Join presence with user_profiles to get user details
    const { data, error } = await this.supabase
      .from("presence")
      .select(`
        id,
        user_id,
        status,
        last_active,
        metadata,
        user_profiles!inner(
          first_name,
          last_name,
          profile_image
        )
      `)
      .eq("resource_id", resourceId)
      .eq("resource_type", resourceType)
    
    if (error) {
      throw error
    }
    
    return data.map(item => ({
      id: item.user_id,
      name: `${item.user_profiles.first_name || ''} ${item.user_profiles.last_name || ''}`.trim() || 'Anonymous User',
      avatar: item.user_profiles.profile_image || undefined,
      status: item.status as PresenceStatus,
      lastActive: new Date(item.last_active),
      metadata: item.metadata as Record<string, any>,
    }))
  }
  
  /**
   * Subscribe to presence changes for a resource
   */
  subscribeToResource(
    resourceId: string,
    resourceType: string,
    callback: (users: PresenceUser[]) => void
  ) {
    // Set up realtime subscription
    const channel = this.supabase
      .channel(`presence:${resourceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'presence',
          filter: `resource_id=eq.${resourceId}`,
        },
        async () => {
          // When presence changes, fetch the latest data
          try {
            const users = await this.getResourceUsers(resourceId, resourceType)
            callback(users)
          } catch (error) {
            console.error('Error fetching updated presence data:', error)
          }
        }
      )
      .subscribe()
    
    // Return unsubscribe function
    return () => {
      this.supabase.removeChannel(channel)
    }
  }
  
  /**
   * Heartbeat to update last_active timestamp
   */
  async heartbeat(presenceId: string): Promise<void> {
    const { error } = await this.supabase
      .from("presence")
      .update({
        last_active: new Date().toISOString(),
      })
      .eq("id", presenceId)
    
    if (error) {
      console.error('Error updating presence heartbeat:', error)
    }
  }
}