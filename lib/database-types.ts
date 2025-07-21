export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline'

export type ChatChannelType = 'group' | 'direct' | 'resource'

export type ChatContentType = 'text' | 'image' | 'file' | 'system'

export type ChatMemberRole = 'owner' | 'admin' | 'member'

export type VersionAccessLevel = 'read' | 'write' | 'admin'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          church_name: string | null
          role: string | null
          profile_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          church_name?: string | null
          role?: string | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          church_name?: string | null
          role?: string | null
          profile_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      presence: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          resource_type: string
          status: PresenceStatus
          last_active: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          resource_type: string
          status?: PresenceStatus
          last_active?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          resource_type?: string
          status?: PresenceStatus
          last_active?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      collaborative_documents: {
        Row: {
          id: string
          title: string
          content: string
          version: number
          created_by: string
          updated_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string
          version?: number
          created_by: string
          updated_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          version?: number
          created_by?: string
          updated_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      document_versions: {
        Row: {
          id: string
          document_id: string
          content: string
          version: number
          comment: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          document_id: string
          content: string
          version: number
          comment?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          document_id?: string
          content?: string
          version?: number
          comment?: string | null
          created_by?: string
          created_at?: string
        }
      }
      members: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          created_at?: string
        }
      }
      chat_channels: {
        Row: {
          id: string
          name: string
          description: string | null
          type: ChatChannelType
          resource_id: string | null
          resource_type: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          type?: ChatChannelType
          resource_id?: string | null
          resource_type?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          type?: ChatChannelType
          resource_id?: string | null
          resource_type?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          channel_id: string
          parent_id: string | null
          user_id: string
          content: string
          content_type: ChatContentType
          metadata: Json | null
          is_edited: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          parent_id?: string | null
          user_id: string
          content: string
          content_type?: ChatContentType
          metadata?: Json | null
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          parent_id?: string | null
          user_id?: string
          content?: string
          content_type?: ChatContentType
          metadata?: Json | null
          is_edited?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      chat_reactions: {
        Row: {
          id: string
          message_id: string
          user_id: string
          reaction: string
          created_at: string
        }
        Insert: {
          id?: string
          message_id: string
          user_id: string
          reaction: string
          created_at?: string
        }
        Update: {
          id?: string
          message_id?: string
          user_id?: string
          reaction?: string
          created_at?: string
        }
      }
      chat_read_receipts: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          last_read_message_id: string | null
          last_read_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          user_id: string
          last_read_message_id?: string | null
          last_read_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          user_id?: string
          last_read_message_id?: string | null
          last_read_at?: string
        }
      }
      chat_channel_members: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          role: ChatMemberRole
          joined_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          user_id: string
          role?: ChatMemberRole
          joined_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          user_id?: string
          role?: ChatMemberRole
          joined_at?: string
        }
      }
      chat_typing_indicators: {
        Row: {
          id: string
          channel_id: string
          user_id: string
          is_typing: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          channel_id: string
          user_id: string
          is_typing?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          channel_id?: string
          user_id?: string
          is_typing?: boolean
          updated_at?: string
        }
      }
      resource_versions: {
        Row: {
          id: string
          resource_id: string
          resource_type: string
          version_number: number
          content: Json
          comment: string | null
          created_by: string
          created_at: string
          tags: string[]
        }
        Insert: {
          id?: string
          resource_id: string
          resource_type: string
          version_number: number
          content: Json
          comment?: string | null
          created_by: string
          created_at?: string
          tags?: string[]
        }
        Update: {
          id?: string
          resource_id?: string
          resource_type?: string
          version_number?: number
          content?: Json
          comment?: string | null
          created_by?: string
          created_at?: string
          tags?: string[]
        }
      }
      resource_version_access: {
        Row: {
          id: string
          resource_id: string
          resource_type: string
          user_id: string
          access_level: VersionAccessLevel
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          resource_id: string
          resource_type: string
          user_id: string
          access_level?: VersionAccessLevel
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          resource_id?: string
          resource_type?: string
          user_id?: string
          access_level?: VersionAccessLevel
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
