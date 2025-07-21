"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ChatService } from "../lib/chat-service"
import { ChatChannelType, ChatContentType } from "../lib/database-types"

export interface ChatMessage {
  id: string
  channelId: string
  parentId: string | null
  userId: string
  content: string
  contentType: ChatContentType
  metadata: Record<string, any> | null
  isEdited: boolean
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    profileImage: string | null
  }
  reactions: ChatReaction[]
}

export interface ChatReaction {
  id: string
  messageId: string
  userId: string
  reaction: string
  createdAt: Date
}

export interface ChatChannel {
  id: string
  name: string
  description: string | null
  type: ChatChannelType
  resourceId: string | null
  resourceType: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  unreadCount: number
}

export interface ChatMember {
  id: string
  channelId: string
  userId: string
  role: string
  joinedAt: Date
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    profileImage: string | null
  }
}

export interface ChatTypingIndicator {
  userId: string
  userName: string
}

export interface ChatState {
  channels: ChatChannel[]
  currentChannel: ChatChannel | null
  messages: ChatMessage[]
  members: ChatMember[]
  typingUsers: ChatTypingIndicator[]
  isLoading: boolean
  error: Error | null
  hasMoreMessages: boolean
}

export interface ChatActions {
  sendMessage: (content: string, contentType?: ChatContentType, parentId?: string, metadata?: Record<string, any>) => Promise<ChatMessage>
  editMessage: (messageId: string, content: string) => Promise<ChatMessage>
  deleteMessage: (messageId: string) => Promise<boolean>
  addReaction: (messageId: string, reaction: string) => Promise<void>
  removeReaction: (messageId: string, reaction: string) => Promise<void>
  loadMoreMessages: () => Promise<void>
  setTyping: (isTyping: boolean) => Promise<void>
  markAsRead: () => Promise<void>
  createChannel: (name: string, type?: ChatChannelType, description?: string) => Promise<ChatChannel>
  switchChannel: (channelId: string) => Promise<void>
  addMember: (userId: string, role?: string) => Promise<void>
  removeMember: (userId: string) => Promise<void>
  uploadFile: (file: File) => Promise<{ url: string; name: string; size: number; type: string }>
}

export function useRealTimeChat(initialChannelId?: string) {
  const supabase = createClientComponentClient()
  const chatService = useRef(new ChatService())
  const [state, setState] = useState<ChatState>({
    channels: [],
    currentChannel: null,
    messages: [],
    members: [],
    typingUsers: [],
    isLoading: true,
    error: null,
    hasMoreMessages: true,
  })
  
  const oldestMessageTimestamp = useRef<string | null>(null)
  const unsubscribeRef = useRef<() => void | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Load channels
  const loadChannels = useCallback(async () => {
    try {
      const channels = await chatService.current.getChannels()
      
      // Get unread counts for each channel
      const channelsWithUnread = await Promise.all(
        channels.map(async (channel) => {
          const unreadCount = await chatService.current.getUnreadCount(channel.id)
          return {
            id: channel.id,
            name: channel.name,
            description: channel.description,
            type: channel.type,
            resourceId: channel.resource_id,
            resourceType: channel.resource_type,
            createdBy: channel.created_by,
            createdAt: new Date(channel.created_at),
            updatedAt: new Date(channel.updated_at),
            unreadCount,
          }
        })
      )
      
      setState((prev) => ({
        ...prev,
        channels: channelsWithUnread,
      }))
      
      return channelsWithUnread
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }))
      return []
    }
  }, [])
  
  // Load messages for a channel
  const loadMessages = useCallback(async (channelId: string, before?: string) => {
    try {
      const messages = await chatService.current.getMessages(channelId, 25, before)
      
      // Transform messages
      const transformedMessages = messages.map((message) => ({
        id: message.id,
        channelId: message.channel_id,
        parentId: message.parent_id,
        userId: message.user_id,
        content: message.content,
        contentType: message.content_type as ChatContentType,
        metadata: message.metadata,
        isEdited: message.is_edited,
        createdAt: new Date(message.created_at),
        updatedAt: new Date(message.updated_at),
        user: {
          id: message.user_profiles.id,
          firstName: message.user_profiles.first_name,
          lastName: message.user_profiles.last_name,
          profileImage: message.user_profiles.profile_image,
        },
        reactions: message.chat_reactions.map((reaction) => ({
          id: reaction.id,
          messageId: reaction.message_id,
          userId: reaction.user_id,
          reaction: reaction.reaction,
          createdAt: new Date(reaction.created_at),
        })),
      }))
      
      // Update oldest message timestamp for pagination
      if (messages.length > 0) {
        const oldestMessage = messages[messages.length - 1]
        oldestMessageTimestamp.current = oldestMessage.created_at
      }
      
      // Check if there are more messages
      const hasMore = messages.length === 25
      
      if (before) {
        // Append older messages
        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, ...transformedMessages],
          hasMoreMessages: hasMore,
        }))
      } else {
        // Replace with new messages
        setState((prev) => ({
          ...prev,
          messages: transformedMessages,
          hasMoreMessages: hasMore,
        }))
      }
      
      return transformedMessages
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }))
      return []
    }
  }, [])
  
  // Load channel members
  const loadMembers = useCallback(async (channelId: string) => {
    try {
      const members = await chatService.current.getChannelMembers(channelId)
      
      // Transform members
      const transformedMembers = members.map((member) => ({
        id: member.id,
        channelId: member.channel_id,
        userId: member.user_id,
        role: member.role,
        joinedAt: new Date(member.joined_at),
        user: {
          id: member.user_profiles.id,
          firstName: member.user_profiles.first_name,
          lastName: member.user_profiles.last_name,
          profileImage: member.user_profiles.profile_image,
        },
      }))
      
      setState((prev) => ({
        ...prev,
        members: transformedMembers,
      }))
      
      return transformedMembers
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
      }))
      return []
    }
  }, [])
  
  // Load typing indicators
  const loadTypingIndicators = useCallback(async (channelId: string) => {
    try {
      const indicators = await chatService.current.getTypingIndicators(channelId)
      
      // Transform typing indicators
      const typingUsers = indicators.map((indicator) => ({
        userId: indicator.user_id,
        userName: `${indicator.user_profiles.first_name || ''} ${indicator.user_profiles.last_name || ''}`.trim(),
      }))
      
      setState((prev) => ({
        ...prev,
        typingUsers,
      }))
      
      return typingUsers
    } catch (error) {
      console.error("Error loading typing indicators:", error)
      return []
    }
  }, [])
  
  // Switch to a different channel
  const switchChannel = useCallback(async (channelId: string) => {
    try {
      setState((prev) => ({
        ...prev,
        isLoading: true,
      }))
      
      // Unsubscribe from previous channel
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      
      // Get channel details
      const channel = await chatService.current.getChannel(channelId)
      
      const currentChannel = {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        type: channel.type as ChatChannelType,
        resourceId: channel.resource_id,
        resourceType: channel.resource_type,
        createdBy: channel.created_by,
        createdAt: new Date(channel.created_at),
        updatedAt: new Date(channel.updated_at),
        unreadCount: 0,
      }
      
      setState((prev) => ({
        ...prev,
        currentChannel,
      }))
      
      // Reset oldest message timestamp
      oldestMessageTimestamp.current = null
      
      // Load messages, members, and typing indicators
      await Promise.all([
        loadMessages(channelId),
        loadMembers(channelId),
        loadTypingIndicators(channelId),
      ])
      
      // Subscribe to channel updates
      const unsubscribe = chatService.current.subscribeToChannel(channelId, async (payload) => {
        // Handle different types of updates
        if (payload.table === "chat_messages") {
          if (payload.eventType === "INSERT") {
            // Fetch the new message with user details
            const { data: message } = await supabase
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
              .eq("id", payload.new.id)
              .single()
            
            if (message) {
              const newMessage = {
                id: message.id,
                channelId: message.channel_id,
                parentId: message.parent_id,
                userId: message.user_id,
                content: message.content,
                contentType: message.content_type as ChatContentType,
                metadata: message.metadata,
                isEdited: message.is_edited,
                createdAt: new Date(message.created_at),
                updatedAt: new Date(message.updated_at),
                user: {
                  id: message.user_profiles.id,
                  firstName: message.user_profiles.first_name,
                  lastName: message.user_profiles.last_name,
                  profileImage: message.user_profiles.profile_image,
                },
                reactions: message.chat_reactions.map((reaction) => ({
                  id: reaction.id,
                  messageId: reaction.message_id,
                  userId: reaction.user_id,
                  reaction: reaction.reaction,
                  createdAt: new Date(reaction.created_at),
                })),
              }
              
              setState((prev) => ({
                ...prev,
                messages: [newMessage, ...prev.messages],
              }))
              
              // Mark as read
              await chatService.current.markAsRead(channelId, message.id)
            }
          } else if (payload.eventType === "UPDATE") {
            // Update existing message
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === payload.new.id
                  ? {
                      ...msg,
                      content: payload.new.content,
                      isEdited: payload.new.is_edited,
                      updatedAt: new Date(payload.new.updated_at),
                    }
                  : msg
              ),
            }))
          } else if (payload.eventType === "DELETE") {
            // Remove deleted message
            setState((prev) => ({
              ...prev,
              messages: prev.messages.filter((msg) => msg.id !== payload.old.id),
            }))
          }
        } else if (payload.table === "chat_reactions") {
          // Refresh reactions for the affected message
          if (payload.eventType === "INSERT" || payload.eventType === "DELETE") {
            const messageId = payload.new?.message_id || payload.old?.message_id
            
            const { data: reactions } = await supabase
              .from("chat_reactions")
              .select("*")
              .eq("message_id", messageId)
            
            const transformedReactions = (reactions || []).map((reaction) => ({
              id: reaction.id,
              messageId: reaction.message_id,
              userId: reaction.user_id,
              reaction: reaction.reaction,
              createdAt: new Date(reaction.created_at),
            }))
            
            setState((prev) => ({
              ...prev,
              messages: prev.messages.map((msg) =>
                msg.id === messageId
                  ? {
                      ...msg,
                      reactions: transformedReactions,
                    }
                  : msg
              ),
            }))
          }
        } else if (payload.table === "chat_typing_indicators") {
          // Update typing indicators
          await loadTypingIndicators(channelId)
        }
      })
      
      unsubscribeRef.current = unsubscribe
      
      // Mark channel as read
      if (state.messages.length > 0) {
        await chatService.current.markAsRead(channelId, state.messages[0].id)
      }
      
      // Update channels list to reset unread count
      await loadChannels()
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error as Error,
      }))
    }
  }, [loadChannels, loadMembers, loadMessages, loadTypingIndicators, supabase])
  
  // Initialize
  useEffect(() => {
    let isMounted = true
    
    const initialize = async () => {
      try {
        // Load channels
        const channels = await loadChannels()
        
        // If initialChannelId is provided, switch to that channel
        // Otherwise, use the first channel
        if (channels.length > 0) {
          const channelId = initialChannelId || channels[0].id
          await switchChannel(channelId)
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
          }))
        }
      } catch (error) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: error as Error,
          }))
        }
      }
    }
    
    initialize()
    
    return () => {
      isMounted = false
      
      // Clean up subscriptions
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
      
      // Clean up typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [initialChannelId, loadChannels, switchChannel])
  
  // Actions
  const sendMessage = useCallback(
    async (
      content: string,
      contentType: ChatContentType = "text",
      parentId?: string,
      metadata?: Record<string, any>
    ) => {
      if (!state.currentChannel) {
        throw new Error("No channel selected")
      }
      
      const message = await chatService.current.sendMessage(
        state.currentChannel.id,
        content,
        contentType,
        parentId,
        metadata
      )
      
      // Clear typing indicator
      await chatService.current.setTypingIndicator(state.currentChannel.id, false)
      
      // Transform message for return
      return {
        id: message.id,
        channelId: message.channel_id,
        parentId: message.parent_id,
        userId: message.user_id,
        content: message.content,
        contentType: message.content_type as ChatContentType,
        metadata: message.metadata,
        isEdited: message.is_edited,
        createdAt: new Date(message.created_at),
        updatedAt: new Date(message.updated_at),
        user: {
          id: message.user_id,
          firstName: null,
          lastName: null,
          profileImage: null,
        },
        reactions: [],
      }
    },
    [state.currentChannel]
  )
  
  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      const message = await chatService.current.editMessage(messageId, content)
      
      // Transform message for return
      return {
        id: message.id,
        channelId: message.channel_id,
        parentId: message.parent_id,
        userId: message.user_id,
        content: message.content,
        contentType: message.content_type as ChatContentType,
        metadata: message.metadata,
        isEdited: message.is_edited,
        createdAt: new Date(message.created_at),
        updatedAt: new Date(message.updated_at),
        user: {
          id: message.user_id,
          firstName: null,
          lastName: null,
          profileImage: null,
        },
        reactions: [],
      }
    },
    []
  )
  
  const deleteMessage = useCallback(async (messageId: string) => {
    return chatService.current.deleteMessage(messageId)
  }, [])
  
  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    await chatService.current.addReaction(messageId, reaction)
  }, [])
  
  const removeReaction = useCallback(async (messageId: string, reaction: string) => {
    await chatService.current.removeReaction(messageId, reaction)
  }, [])
  
  const loadMoreMessages = useCallback(async () => {
    if (!state.currentChannel || !state.hasMoreMessages || !oldestMessageTimestamp.current) {
      return
    }
    
    await loadMessages(state.currentChannel.id, oldestMessageTimestamp.current)
  }, [loadMessages, state.currentChannel, state.hasMoreMessages])
  
  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!state.currentChannel) {
        return
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      await chatService.current.setTypingIndicator(state.currentChannel.id, isTyping)
      
      // If typing, set a timeout to clear the indicator after 5 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(async () => {
          if (state.currentChannel) {
            await chatService.current.setTypingIndicator(state.currentChannel.id, false)
          }
        }, 5000)
      }
    },
    [state.currentChannel]
  )
  
  const markAsRead = useCallback(async () => {
    if (!state.currentChannel || state.messages.length === 0) {
      return
    }
    
    await chatService.current.markAsRead(
      state.currentChannel.id,
      state.messages[0].id
    )
    
    // Update channels list to reset unread count
    await loadChannels()
  }, [loadChannels, state.currentChannel, state.messages])
  
  const createChannel = useCallback(
    async (
      name: string,
      type: ChatChannelType = "group",
      description?: string
    ) => {
      const channel = await chatService.current.createChannel(
        name,
        type,
        description
      )
      
      // Refresh channels list
      await loadChannels()
      
      // Switch to the new channel
      await switchChannel(channel.id)
      
      // Transform channel for return
      return {
        id: channel.id,
        name: channel.name,
        description: channel.description,
        type: channel.type as ChatChannelType,
        resourceId: channel.resource_id,
        resourceType: channel.resource_type,
        createdBy: channel.created_by,
        createdAt: new Date(channel.created_at),
        updatedAt: new Date(channel.updated_at),
        unreadCount: 0,
      }
    },
    [loadChannels, switchChannel]
  )
  
  const addMember = useCallback(
    async (userId: string, role: string = "member") => {
      if (!state.currentChannel) {
        throw new Error("No channel selected")
      }
      
      await chatService.current.addChannelMember(
        state.currentChannel.id,
        userId,
        role as any
      )
      
      // Refresh members list
      await loadMembers(state.currentChannel.id)
    },
    [loadMembers, state.currentChannel]
  )
  
  const removeMember = useCallback(
    async (userId: string) => {
      if (!state.currentChannel) {
        throw new Error("No channel selected")
      }
      
      await chatService.current.removeChannelMember(state.currentChannel.id, userId)
      
      // Refresh members list
      await loadMembers(state.currentChannel.id)
    },
    [loadMembers, state.currentChannel]
  )
  
  const uploadFile = useCallback(
    async (file: File) => {
      if (!state.currentChannel) {
        throw new Error("No channel selected")
      }
      
      return chatService.current.uploadFile(file, state.currentChannel.id)
    },
    [state.currentChannel]
  )
  
  const actions: ChatActions = {
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    loadMoreMessages,
    setTyping,
    markAsRead,
    createChannel,
    switchChannel,
    addMember,
    removeMember,
    uploadFile,
  }
  
  return [state, actions] as [ChatState, ChatActions]
}