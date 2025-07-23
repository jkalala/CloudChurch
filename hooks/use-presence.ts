import { useEffect, useState, useRef, useCallback } from "react"
import { supabase } from '@/lib/supabase-client';
import { PresenceService } from "../lib/presence-service"
import { PresenceOptions, PresenceState, PresenceActions, UsePresenceResult, PresenceUser } from "../lib/types/presence"
import { PresenceStatus } from "../lib/database-types"

/**
 * Hook for tracking user presence on a resource
 * 
 * @example
 * ```tsx
 * const [presenceState, presenceActions] = usePresence({
 *   resourceId: 'document-123',
 *   resourceType: 'document',
 * });
 * 
 * // Display users
 * return (
 *   <div>
 *     <h2>Users viewing this document:</h2>
 *     {presenceState.users.map(user => (
 *       <div key={user.id}>
 *         {user.name} - {user.status}
 *       </div>
 *     ))}
 *     
 *     <button onClick={() => presenceActions.updateStatus('away')}>
 *       Set status to away
 *     </button>
 *   </div>
 * );
 * ```
 */
export function usePresence(options: PresenceOptions): UsePresenceResult {
  const {
    resourceId,
    resourceType,
    initialStatus = "online",
    metadata = {},
    updateInterval = 30000, // 30 seconds
  } = options
  
  const presenceService = useRef(new PresenceService())
  const presenceIdRef = useRef<string | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const [state, setState] = useState<PresenceState>({
    users: [],
    isLoading: true,
  })
  
  // Initialize presence and set up subscriptions
  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | null = null
    
    const initPresence = async () => {
      try {
        // Check if user is authenticated
        const { data: authData } = await supabase.auth.getUser()
        if (!authData.user) {
          setState(prev => ({ ...prev, isLoading: false, error: new Error("User not authenticated") }))
          return
        }
        
        // Join the resource
        const presenceId = await presenceService.current.joinResource(
          resourceId,
          resourceType,
          initialStatus,
          metadata
        )
        
        if (isMounted) {
          presenceIdRef.current = presenceId
          
          // Get initial users
          const users = await presenceService.current.getResourceUsers(resourceId, resourceType)
          
          // Find current user in the list
          const currentUser = users.find(user => user.id === authData.user.id)
          
          setState({
            users,
            currentUser,
            isLoading: false,
          })
          
          // Subscribe to presence changes
          unsubscribe = presenceService.current.subscribeToResource(
            resourceId,
            resourceType,
            (updatedUsers) => {
              if (isMounted) {
                const updatedCurrentUser = updatedUsers.find(user => user.id === authData.user.id)
                setState({
                  users: updatedUsers,
                  currentUser: updatedCurrentUser,
                  isLoading: false,
                })
              }
            }
          )
          
          // Set up heartbeat interval
          heartbeatIntervalRef.current = setInterval(() => {
            if (presenceIdRef.current) {
              presenceService.current.heartbeat(presenceIdRef.current)
            }
          }, updateInterval)
        }
      } catch (error) {
        if (isMounted) {
          setState(prev => ({ ...prev, isLoading: false, error: error as Error }))
        }
      }
    }
    
    initPresence()
    
    // Cleanup function
    return () => {
      isMounted = false
      
      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
      
      // Unsubscribe from presence changes
      if (unsubscribe) {
        unsubscribe()
      }
      
      // Leave the resource
      if (presenceIdRef.current) {
        presenceService.current.leaveResource(presenceIdRef.current)
          .catch(error => console.error("Error leaving resource:", error))
      }
    }
  }, [resourceId, resourceType, initialStatus, metadata, updateInterval, supabase])
  
  // Update status action
  const updateStatus = useCallback(async (status: PresenceStatus) => {
    if (!presenceIdRef.current) return
    
    try {
      await presenceService.current.updateStatus(presenceIdRef.current, status)
      
      // Update local state
      setState(prev => {
        if (!prev.currentUser) return prev
        
        const updatedCurrentUser = {
          ...prev.currentUser,
          status,
        }
        
        const updatedUsers = prev.users.map(user => 
          user.id === updatedCurrentUser.id ? updatedCurrentUser : user
        )
        
        return {
          ...prev,
          users: updatedUsers,
          currentUser: updatedCurrentUser,
        }
      })
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }, [])
  
  // Update metadata action
  const updateMetadata = useCallback(async (newMetadata: Record<string, any>) => {
    if (!presenceIdRef.current) return
    
    try {
      await presenceService.current.updateMetadata(presenceIdRef.current, newMetadata)
      
      // Update local state
      setState(prev => {
        if (!prev.currentUser) return prev
        
        const updatedCurrentUser = {
          ...prev.currentUser,
          metadata: newMetadata,
        }
        
        const updatedUsers = prev.users.map(user => 
          user.id === updatedCurrentUser.id ? updatedCurrentUser : user
        )
        
        return {
          ...prev,
          users: updatedUsers,
          currentUser: updatedCurrentUser,
        }
      })
    } catch (error) {
      console.error("Error updating metadata:", error)
    }
  }, [])
  
  // Leave action
  const leave = useCallback(async () => {
    if (!presenceIdRef.current) return
    
    try {
      await presenceService.current.leaveResource(presenceIdRef.current)
      presenceIdRef.current = null
      
      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
        heartbeatIntervalRef.current = null
      }
      
      // Update local state
      setState(prev => {
        if (!prev.currentUser) return prev
        
        return {
          ...prev,
          users: prev.users.filter(user => user.id !== prev.currentUser?.id),
          currentUser: undefined,
        }
      })
    } catch (error) {
      console.error("Error leaving resource:", error)
    }
  }, [])
  
  const actions: PresenceActions = {
    updateStatus,
    updateMetadata,
    leave,
  }
  
  return [state, actions]
}