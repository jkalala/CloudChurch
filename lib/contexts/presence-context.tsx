"use client"

import { createContext, useContext, ReactNode } from "react"
import { usePresence } from "../../hooks/use-presence"
import { PresenceOptions, PresenceState, PresenceActions } from "../types/presence"
import { PresenceStatus } from "../database-types"

// Create context
interface PresenceContextValue {
  state: PresenceState
  actions: PresenceActions
}

const PresenceContext = createContext<PresenceContextValue | undefined>(undefined)

// Provider component
interface PresenceProviderProps {
  children: ReactNode
  options: PresenceOptions
}

export function PresenceProvider({ children, options }: PresenceProviderProps) {
  const [state, actions] = usePresence(options)
  
  return (
    <PresenceContext.Provider value={{ state, actions }}>
      {children}
    </PresenceContext.Provider>
  )
}

// Hook to use the presence context
export function usePresenceContext() {
  const context = useContext(PresenceContext)
  
  if (context === undefined) {
    throw new Error("usePresenceContext must be used within a PresenceProvider")
  }
  
  return context
}

// Convenience hook to get presence users
export function usePresenceUsers() {
  const { state } = usePresenceContext()
  return state.users
}

// Convenience hook to get current user presence
export function useCurrentPresence() {
  const { state, actions } = usePresenceContext()
  
  return {
    user: state.currentUser,
    isLoading: state.isLoading,
    error: state.error,
    updateStatus: actions.updateStatus,
    updateMetadata: actions.updateMetadata,
  }
}