"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from '@/lib/supabase-client';
import { VersionControlService } from "../lib/version-control-service"
import { Version, VersionDiff } from "../lib/types/version-control"

export interface VersionControlState<T = any> {
  versions: Version<T>[]
  currentVersion: Version<T> | null
  selectedVersion: Version<T> | null
  isLoading: boolean
  error: Error | null
  comparison: VersionDiff<T> | null
}

export interface VersionControlOptions {
  resourceId: string
  resourceType: string
  initialLoad?: boolean
}

/**
 * Hook for managing version control functionality
 */
export function useVersionControl<T = any>({
  resourceId,
  resourceType,
  initialLoad = true,
}: VersionControlOptions) {
  const [state, setState] = useState<VersionControlState<T>>({
    versions: [],
    currentVersion: null,
    selectedVersion: null,
    isLoading: initialLoad,
    error: null,
    comparison: null,
  })
  
  // Create version control service
  const versionControl = new VersionControlService<T>(resourceType)
  
  // Load versions
  const loadVersions = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }))
      
      // Get version history
      const versions = await versionControl.getVersionHistory(resourceId)
      
      // Get latest version
      let currentVersion: Version<T> | null = null
      if (versions.length > 0) {
        currentVersion = versions[0]
      }
      
      setState((prev) => ({
        ...prev,
        versions,
        currentVersion,
        selectedVersion: currentVersion,
        isLoading: false,
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }))
    }
  }, [resourceId, resourceType, versionControl])
  
  // Initial load
  useEffect(() => {
    if (initialLoad) {
      loadVersions()
    }
  }, [initialLoad, loadVersions])
  
  // Create a new version
  const createVersion = useCallback(
    async (content: T, comment?: string, tags?: string[]) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }))
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          throw new Error("User not authenticated")
        }
        
        // Create version
        const newVersion = await versionControl.createVersion(
          resourceId,
          content,
          userData.user.id,
          comment,
          tags
        )
        
        // Reload versions
        await loadVersions()
        
        return newVersion
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }))
        throw error
      }
    },
    [resourceId, supabase, versionControl, loadVersions]
  )
  
  // Select a version
  const selectVersion = useCallback(
    async (versionId: string) => {
      try {
        const version = await versionControl.getVersion(versionId)
        
        setState((prev) => ({
          ...prev,
          selectedVersion: version,
          comparison: null,
        }))
        
        return version
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
        }))
        throw error
      }
    },
    [versionControl]
  )
  
  // Compare versions
  const compareVersions = useCallback(
    async (versionId1: string, versionId2: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }))
        
        const comparison = await versionControl.compareVersions(
          versionId1,
          versionId2
        )
        
        setState((prev) => ({
          ...prev,
          comparison,
          isLoading: false,
        }))
        
        return comparison
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }))
        throw error
      }
    },
    [versionControl]
  )
  
  // Restore version
  const restoreVersion = useCallback(
    async (versionId: string) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }))
        
        // Get current user
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          throw new Error("User not authenticated")
        }
        
        // Restore version
        const restoredVersion = await versionControl.restoreVersion(
          versionId,
          userData.user.id
        )
        
        // Reload versions
        await loadVersions()
        
        return restoredVersion
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }))
        throw error
      }
    },
    [supabase, versionControl, loadVersions]
  )
  
  // Tag version
  const tagVersion = useCallback(
    async (versionId: string, tag: string) => {
      try {
        const taggedVersion = await versionControl.tagVersion(versionId, tag)
        
        // Update versions in state
        setState((prev) => ({
          ...prev,
          versions: prev.versions.map((v) =>
            v.id === versionId ? taggedVersion : v
          ),
          currentVersion:
            prev.currentVersion?.id === versionId
              ? taggedVersion
              : prev.currentVersion,
          selectedVersion:
            prev.selectedVersion?.id === versionId
              ? taggedVersion
              : prev.selectedVersion,
        }))
        
        return taggedVersion
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
        }))
        throw error
      }
    },
    [versionControl]
  )
  
  // Remove tag from version
  const untagVersion = useCallback(
    async (versionId: string, tag: string) => {
      try {
        const untaggedVersion = await versionControl.untagVersion(versionId, tag)
        
        // Update versions in state
        setState((prev) => ({
          ...prev,
          versions: prev.versions.map((v) =>
            v.id === versionId ? untaggedVersion : v
          ),
          currentVersion:
            prev.currentVersion?.id === versionId
              ? untaggedVersion
              : prev.currentVersion,
          selectedVersion:
            prev.selectedVersion?.id === versionId
              ? untaggedVersion
              : prev.selectedVersion,
        }))
        
        return untaggedVersion
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
        }))
        throw error
      }
    },
    [versionControl]
  )
  
  // Get versions by tag
  const getVersionsByTag = useCallback(
    async (tag: string) => {
      try {
        return await versionControl.getVersionsByTag(resourceId, tag)
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
        }))
        throw error
      }
    },
    [resourceId, versionControl]
  )
  
  // Clear comparison
  const clearComparison = useCallback(() => {
    setState((prev) => ({
      ...prev,
      comparison: null,
    }))
  }, [])
  
  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }))
  }, [])
  
  return {
    state,
    loadVersions,
    createVersion,
    selectVersion,
    compareVersions,
    restoreVersion,
    tagVersion,
    untagVersion,
    getVersionsByTag,
    clearComparison,
    clearError,
  }
}