import * as Y from 'yjs'

export interface CollaborationUser {
  id: string
  name: string
  color: string
  avatar?: string
}

export interface CollaborationDocument {
  id: string
  title: string
  content: string
  version: number
  lastModified: Date
  createdBy: string
  updatedBy: string
}

export interface CollaborationVersion {
  id: string
  documentId: string
  version: number
  content: string
  createdAt: Date
  createdBy: string
  comment?: string
}

export interface CollaborationState {
  document: CollaborationDocument | null
  isLoading: boolean
  isSaving: boolean
  isConnected: boolean
  error?: Error
  users: CollaborationUser[]
}

export interface CollaborationOptions {
  /**
   * The document ID to collaborate on
   */
  documentId: string
  
  /**
   * The current user information
   */
  user: CollaborationUser
  
  /**
   * Whether to enable offline support
   * @default true
   */
  enableOffline?: boolean
  
  /**
   * Whether to enable version history
   * @default true
   */
  enableVersioning?: boolean
  
  /**
   * Callback when document is saved
   */
  onSave?: (document: CollaborationDocument) => void
  
  /**
   * Callback when an error occurs
   */
  onError?: (error: Error) => void
}

export interface CollaborationActions {
  /**
   * Save the current document state
   */
  save: (comment?: string) => Promise<void>
  
  /**
   * Get the document version history
   */
  getVersionHistory: () => Promise<CollaborationVersion[]>
  
  /**
   * Restore a specific version of the document
   */
  restoreVersion: (versionId: string) => Promise<void>
  
  /**
   * Compare two versions of the document
   */
  compareVersions: (versionId1: string, versionId2: string) => Promise<{
    additions: string[]
    deletions: string[]
  }>
  
  /**
   * Disconnect from the collaboration session
   */
  disconnect: () => void
}

export interface YDocProvider {
  awareness: any
  connect: () => void
  disconnect: () => void
  on: (event: string, callback: Function) => void
  off: (event: string, callback: Function) => void
}

export interface CollaborationProviderOptions {
  /**
   * The document ID to collaborate on
   */
  documentId: string
  
  /**
   * The Y.js document instance
   */
  ydoc: Y.Doc
  
  /**
   * The current user information
   */
  user: CollaborationUser
  
  /**
   * Whether to enable offline support
   */
  enableOffline: boolean
  
  /**
   * The WebSocket URL for the collaboration server
   */
  websocketUrl?: string
}