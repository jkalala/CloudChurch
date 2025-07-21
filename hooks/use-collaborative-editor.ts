"use client"

import { useEffect, useState, useRef, useCallback } from 'react'
import * as Y from 'yjs'
import { createCollaborationProvider } from '../lib/utils/collaboration-provider'
import { CollaborationService } from '../lib/collaboration-service'
import { 
  CollaborationOptions, 
  CollaborationState, 
  CollaborationActions,
  CollaborationUser,
  CollaborationVersion
} from '../lib/types/collaboration'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

/**
 * Hook for collaborative document editing with Y.js
 */
export function useCollaborativeEditor(options: CollaborationOptions) {
  const {
    documentId,
    user,
    enableOffline = true,
    enableVersioning = true,
    onSave,
    onError,
  } = options
  
  const supabase = createClientComponentClient()
  const collaborationService = useRef(new CollaborationService())
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<any | null>(null)
  
  const [state, setState] = useState<CollaborationState>({
    document: null,
    isLoading: true,
    isSaving: false,
    isConnected: false,
    users: [],
  })
  
  // Initialize Y.js document and providers
  useEffect(() => {
    let isMounted = true
    
    const initCollaboration = async () => {
      try {
        // Create Y.js document
        const ydoc = new Y.Doc()
        ydocRef.current = ydoc
        
        // Create provider
        const provider = createCollaborationProvider({
          documentId,
          ydoc,
          user,
          enableOffline,
          // In a real app, you would use your own WebSocket server
          websocketUrl: 'wss://demos.yjs.dev',
        })
        
        providerRef.current = provider
        
        // Connect to the collaboration server
        provider.connect()
        
        // Set up awareness change handler
        const handleAwarenessChange = () => {
          if (!isMounted) return
          
          const states = Array.from(provider.awareness.getStates().values())
          const users: CollaborationUser[] = states
            .filter(state => state.user)
            .map(state => ({
              id: state.user.id || state.clientID,
              name: state.user.name,
              color: state.user.color,
              avatar: state.user.avatar,
            }))
          
          setState(prev => ({
            ...prev,
            users,
          }))
        }
        
        // Set up connection status handler
        const handleStatusChange = (event: { status: string }) => {
          if (!isMounted) return
          
          setState(prev => ({
            ...prev,
            isConnected: event.status === 'connected',
          }))
        }
        
        // Register event handlers
        provider.on('awareness', handleAwarenessChange)
        provider.on('status', handleStatusChange)
        
        // Fetch document from database
        try {
          const document = await collaborationService.current.getDocument(documentId)
          
          if (isMounted) {
            setState(prev => ({
              ...prev,
              document,
              isLoading: false,
            }))
            
            // Initialize Y.js document with content from database
            // In a real app, you would use a proper Y.js encoding/decoding mechanism
            // This is a simplified example
            const ytext = ydoc.getText('content')
            ytext.delete(0, ytext.length)
            ytext.insert(0, document.content)
          }
        } catch (error) {
          if (isMounted) {
            setState(prev => ({
              ...prev,
              isLoading: false,
              error: error as Error,
            }))
            
            if (onError) {
              onError(error as Error)
            }
          }
        }
        
        return () => {
          provider.off('awareness', handleAwarenessChange)
          provider.off('status', handleStatusChange)
          provider.disconnect()
        }
      } catch (error) {
        if (isMounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error as Error,
          }))
          
          if (onError) {
            onError(error as Error)
          }
        }
      }
    }
    
    initCollaboration()
    
    return () => {
      isMounted = false
      
      // Clean up
      if (providerRef.current) {
        providerRef.current.disconnect()
      }
    }
  }, [documentId, user, enableOffline, onError])
  
  // Save document
  const save = useCallback(async (comment?: string) => {
    if (!ydocRef.current || !state.document) return
    
    try {
      setState(prev => ({ ...prev, isSaving: true }))
      
      // Get content from Y.js document
      const ytext = ydocRef.current.getText('content')
      const content = ytext.toString()
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error('User not authenticated')
      }
      
      // Update document in database
      const updatedDocument = await collaborationService.current.updateDocument(
        documentId,
        content,
        userData.user.id
      )
      
      // Save version if versioning is enabled
      if (enableVersioning) {
        await collaborationService.current.saveVersion(
          documentId,
          content,
          updatedDocument.version,
          userData.user.id,
          comment
        )
      }
      
      setState(prev => ({
        ...prev,
        document: updatedDocument,
        isSaving: false,
      }))
      
      if (onSave) {
        onSave(updatedDocument)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error as Error,
      }))
      
      if (onError) {
        onError(error as Error)
      }
    }
  }, [documentId, state.document, supabase, enableVersioning, onSave, onError])
  
  // Get version history
  const getVersionHistory = useCallback(async (): Promise<CollaborationVersion[]> => {
    try {
      return await collaborationService.current.getVersionHistory(documentId)
    } catch (error) {
      if (onError) {
        onError(error as Error)
      }
      return []
    }
  }, [documentId, onError])
  
  // Restore version
  const restoreVersion = useCallback(async (versionId: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isSaving: true }))
      
      // Get current user
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error('User not authenticated')
      }
      
      // Restore document to version
      const updatedDocument = await collaborationService.current.restoreVersion(
        versionId,
        userData.user.id
      )
      
      // Update Y.js document
      if (ydocRef.current) {
        const ytext = ydocRef.current.getText('content')
        ytext.delete(0, ytext.length)
        ytext.insert(0, updatedDocument.content)
      }
      
      setState(prev => ({
        ...prev,
        document: updatedDocument,
        isSaving: false,
      }))
      
      if (onSave) {
        onSave(updatedDocument)
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error as Error,
      }))
      
      if (onError) {
        onError(error as Error)
      }
    }
  }, [documentId, supabase, onSave, onError])
  
  // Compare versions
  const compareVersions = useCallback(async (versionId1: string, versionId2: string) => {
    try {
      // Get both versions
      const version1 = await collaborationService.current.getVersion(versionId1)
      const version2 = await collaborationService.current.getVersion(versionId2)
      
      // Simple diff implementation (in a real app, use a proper diff library)
      const lines1 = version1.content.split('\n')
      const lines2 = version2.content.split('\n')
      
      const additions = lines2.filter(line => !lines1.includes(line))
      const deletions = lines1.filter(line => !lines2.includes(line))
      
      return { additions, deletions }
    } catch (error) {
      if (onError) {
        onError(error as Error)
      }
      return { additions: [], deletions: [] }
    }
  }, [onError])
  
  // Disconnect
  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.disconnect()
    }
  }, [])
  
  const actions: CollaborationActions = {
    save,
    getVersionHistory,
    restoreVersion,
    compareVersions,
    disconnect,
  }
  
  return [state, actions] as [CollaborationState, CollaborationActions]
}