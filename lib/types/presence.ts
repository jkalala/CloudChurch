import { PresenceStatus } from "../database-types"

export interface PresenceUser {
  id: string
  name: string
  avatar?: string
  status: PresenceStatus
  lastActive: Date
  metadata?: Record<string, any>
}

export interface PresenceState {
  users: PresenceUser[]
  currentUser?: PresenceUser
  isLoading: boolean
  error?: Error
}

export interface PresenceOptions {
  /**
   * The resource ID to track presence for
   */
  resourceId: string
  
  /**
   * The type of resource (e.g., 'document', 'page', 'event')
   */
  resourceType: string
  
  /**
   * Initial status for the current user
   * @default 'online'
   */
  initialStatus?: PresenceStatus
  
  /**
   * Additional metadata to store with the presence record
   */
  metadata?: Record<string, any>
  
  /**
   * Interval in milliseconds to update presence
   * @default 30000 (30 seconds)
   */
  updateInterval?: number
}

export interface PresenceActions {
  /**
   * Update the current user's status
   */
  updateStatus: (status: PresenceStatus) => Promise<void>
  
  /**
   * Update the current user's metadata
   */
  updateMetadata: (metadata: Record<string, any>) => Promise<void>
  
  /**
   * Leave the current resource (cleanup presence)
   */
  leave: () => Promise<void>
}

export type UsePresenceResult = [PresenceState, PresenceActions]