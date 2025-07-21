import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ChatChannelType, ChatContentType, ChatMemberRole } from "./database-types"

/**
 * Service for managing chat functionality
 */
export class ChatService {
  private supabase = createClientComponentClient()
  
  /**
   * Create a new chat channel
   */
  async createChannel(
    name: string,
    type: ChatChannelType = "group",
    description?: string,
    resourceId?: string,
    resourceType?: string
  ) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    // Create the channel
    const { data: channel, error: channelError } = await this.supabase
      .from("chat_channels")
      .insert({
        name,
        description,
        type,
        resource_id: resourceId,
        resource_type: resourceType,
        created_by: userData.user.id,
      })
      .select("*")
      .single()
    
    if (channelError) {
      throw channelError
    }
    
    // Add the creator as a member with owner role
    const { error: memberError } = await this.supabase
      .from("chat_channel_members")
      .insert({
        channel_id: channel.id,
        user_id: userData.user.id,
        role: "owner",
      })
    
    if (memberError) {
      throw memberError
    }
    
    return channel
  }
  
  /**
   * Get channels the current user is a member of
   */
  async getChannels() {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    const { data, error } = await this.supabase
      .from("chat_channels")
      .select(`
        *,
        chat_channel_members!inner(*)
      `)
      .eq("chat_channel_members.user_id", userData.user.id)
      .order("updated_at", { ascending: false })
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Get a specific channel by ID
   */
  async getChannel(channelId: string) {
    const { data, error } = await this.supabase
      .from("chat_channels")
      .select("*")
      .eq("id", channelId)
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Get members of a channel
   */
  async getChannelMembers(channelId: string) {
    const { data, error } = await this.supabase
      .from("chat_channel_members")
      .select(`
        *,
        user_profiles:user_id(
          id,
          first_name,
          last_name,
          profile_image
        )
      `)
      .eq("channel_id", channelId)
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Add a user to a channel
   */
  async addChannelMember(channelId: string, userId: string, role: ChatMemberRole = "member") {
    const { data, error } = await this.supabase
      .from("chat_channel_members")
      .insert({
        channel_id: channelId,
        user_id: userId,
        role,
      })
      .select("*")
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Remove a user from a channel
   */
  async removeChannelMember(channelId: string, userId: string) {
    const { error } = await this.supabase
      .from("chat_channel_members")
      .delete()
      .eq("channel_id", channelId)
      .eq("user_id", userId)
    
    if (error) {
      throw error
    }
    
    return true
  }
  
  /**
   * Send a message to a channel
   */
  async sendMessage(
    channelId: string,
    content: string,
    contentType: ChatContentType = "text",
    parentId?: string,
    metadata?: Record<string, any>
  ) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    const { data, error } = await this.supabase
      .from("chat_messages")
      .insert({
        channel_id: channelId,
        parent_id: parentId || null,
        user_id: userData.user.id,
        content,
        content_type: contentType,
        metadata,
      })
      .select("*")
      .single()
    
    if (error) {
      throw error
    }
    
    // Update the channel's updated_at timestamp
    await this.supabase
      .from("chat_channels")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", channelId)
    
    return data
  }
  
  /**
   * Get messages from a channel
   */
  async getMessages(channelId: string, limit = 50, before?: string) {
    let query = this.supabase
      .from("chat_messages")
      .select(`
        *,
        user_profiles:user_id(
          id,
          first_name,
          last_name,
          profile_image
        ),
        chat_reactions(*)
      `)
      .eq("channel_id", channelId)
      .is("parent_id", null) // Only get top-level messages, not replies
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (before) {
      query = query.lt("created_at", before)
    }
    
    const { data, error } = await query
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Get replies to a message
   */
  async getReplies(messageId: string) {
    const { data, error } = await this.supabase
      .from("chat_messages")
      .select(`
        *,
        user_profiles:user_id(
          id,
          first_name,
          last_name,
          profile_image
        ),
        chat_reactions(*)
      `)
      .eq("parent_id", messageId)
      .order("created_at", { ascending: true })
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Edit a message
   */
  async editMessage(messageId: string, content: string) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    const { data, error } = await this.supabase
      .from("chat_messages")
      .update({
        content,
        is_edited: true,
      })
      .eq("id", messageId)
      .eq("user_id", userData.user.id) // Ensure the user owns the message
      .select("*")
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Delete a message
   */
  async deleteMessage(messageId: string) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    // Check if the user is the message owner or a channel admin
    const { data: message, error: messageError } = await this.supabase
      .from("chat_messages")
      .select("channel_id, user_id")
      .eq("id", messageId)
      .single()
    
    if (messageError) {
      throw messageError
    }
    
    let canDelete = message.user_id === userData.user.id
    
    if (!canDelete) {
      // Check if user is a channel admin
      const { data: membership, error: membershipError } = await this.supabase
        .from("chat_channel_members")
        .select("role")
        .eq("channel_id", message.channel_id)
        .eq("user_id", userData.user.id)
        .single()
      
      if (!membershipError && membership && ["owner", "admin"].includes(membership.role)) {
        canDelete = true
      }
    }
    
    if (!canDelete) {
      throw new Error("You don't have permission to delete this message")
    }
    
    const { error } = await this.supabase
      .from("chat_messages")
      .delete()
      .eq("id", messageId)
    
    if (error) {
      throw error
    }
    
    return true
  }
  
  /**
   * Add a reaction to a message
   */
  async addReaction(messageId: string, reaction: string) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    const { data, error } = await this.supabase
      .from("chat_reactions")
      .insert({
        message_id: messageId,
        user_id: userData.user.id,
        reaction,
      })
      .select("*")
      .single()
    
    if (error) {
      // If the reaction already exists, remove it (toggle behavior)
      if (error.code === "23505") { // Unique violation
        return this.removeReaction(messageId, reaction)
      }
      throw error
    }
    
    return data
  }
  
  /**
   * Remove a reaction from a message
   */
  async removeReaction(messageId: string, reaction: string) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    const { error } = await this.supabase
      .from("chat_reactions")
      .delete()
      .eq("message_id", messageId)
      .eq("user_id", userData.user.id)
      .eq("reaction", reaction)
    
    if (error) {
      throw error
    }
    
    return true
  }
  
  /**
   * Mark messages in a channel as read
   */
  async markAsRead(channelId: string, messageId: string) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    const { data, error } = await this.supabase
      .from("chat_read_receipts")
      .upsert({
        channel_id: channelId,
        user_id: userData.user.id,
        last_read_message_id: messageId,
        last_read_at: new Date().toISOString(),
      })
      .select("*")
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Get unread message count for a channel
   */
  async getUnreadCount(channelId: string) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    // Get the last read receipt
    const { data: receipt, error: receiptError } = await this.supabase
      .from("chat_read_receipts")
      .select("last_read_at")
      .eq("channel_id", channelId)
      .eq("user_id", userData.user.id)
      .single()
    
    if (receiptError && receiptError.code !== "PGRST116") { // PGRST116 is "no rows returned"
      throw receiptError
    }
    
    const lastReadAt = receipt?.last_read_at || new Date(0).toISOString()
    
    // Count messages after the last read timestamp
    const { count, error: countError } = await this.supabase
      .from("chat_messages")
      .select("*", { count: "exact", head: true })
      .eq("channel_id", channelId)
      .gt("created_at", lastReadAt)
      .neq("user_id", userData.user.id) // Don't count the user's own messages
    
    if (countError) {
      throw countError
    }
    
    return count || 0
  }
  
  /**
   * Set typing indicator
   */
  async setTypingIndicator(channelId: string, isTyping: boolean) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    const { data, error } = await this.supabase
      .from("chat_typing_indicators")
      .upsert({
        channel_id: channelId,
        user_id: userData.user.id,
        is_typing: isTyping,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Get typing indicators for a channel
   */
  async getTypingIndicators(channelId: string) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    const { data, error } = await this.supabase
      .from("chat_typing_indicators")
      .select(`
        *,
        user_profiles:user_id(
          id,
          first_name,
          last_name
        )
      `)
      .eq("channel_id", channelId)
      .eq("is_typing", true)
      .neq("user_id", userData.user.id) // Don't include the current user
    
    if (error) {
      throw error
    }
    
    return data
  }
  
  /**
   * Subscribe to channel updates
   */
  subscribeToChannel(channelId: string, callback: (payload: any) => void) {
    const channel = this.supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `channel_id=eq.${channelId}`,
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_reactions',
          filter: `message_id=eq.*`, // This is a simplification; in a real app, you'd need to filter by message IDs in the channel
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_typing_indicators',
          filter: `channel_id=eq.${channelId}`,
        },
        callback
      )
      .subscribe()
    
    return () => {
      this.supabase.removeChannel(channel)
    }
  }
  
  /**
   * Upload a file for chat
   */
  async uploadFile(file: File, channelId: string) {
    const { data: userData } = await this.supabase.auth.getUser()
    if (!userData.user) {
      throw new Error("User not authenticated")
    }
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${userData.user.id}-${Date.now()}.${fileExt}`
    const filePath = `chat/${channelId}/${fileName}`
    
    const { data, error } = await this.supabase.storage
      .from('chat-files')
      .upload(filePath, file)
    
    if (error) {
      throw error
    }
    
    // Get the public URL
    const { data: publicUrlData } = this.supabase.storage
      .from('chat-files')
      .getPublicUrl(filePath)
    
    return {
      url: publicUrlData.publicUrl,
      name: file.name,
      size: file.size,
      type: file.type,
    }
  }
}