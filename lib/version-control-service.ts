import { supabase } from '@/lib/supabase-client';
import { IVersionControl, Version, VersionDiff } from "./types/version-control"
import { diffLines, diffJson, diffWords } from "diff"

/**
 * Service for managing version control functionality
 */
export class VersionControlService<T = any> implements IVersionControl<T> {
  private supabase = supabase
  private resourceType: string
  
  /**
   * Create a new VersionControlService
   * @param resourceType The type of resource being versioned (e.g., "document", "form", "template")
   */
  constructor(resourceType: string) {
    this.resourceType = resourceType
  }
  
  /**
   * Create a new version of a resource
   */
  async createVersion(
    resourceId: string,
    content: T,
    createdBy: string,
    comment?: string,
    tags?: string[]
  ): Promise<Version<T>> {
    // Get the latest version number for this resource
    const { data: latestVersions, error: versionError } = await this.supabase
      .from("resource_versions")
      .select("version_number")
      .eq("resource_id", resourceId)
      .eq("resource_type", this.resourceType)
      .order("version_number", { ascending: false })
      .limit(1)
    
    if (versionError) {
      throw versionError
    }
    
    const versionNumber = latestVersions && latestVersions.length > 0
      ? latestVersions[0].version_number + 1
      : 1
    
    // Insert the new version
    const { data, error } = await this.supabase
      .from("resource_versions")
      .insert({
        resource_id: resourceId,
        resource_type: this.resourceType,
        version_number: versionNumber,
        content: content as any,
        comment,
        created_by: createdBy,
        tags: tags || [],
      })
      .select("*")
      .single()
    
    if (error) {
      throw error
    }
    
    return this.mapVersionFromDb(data)
  }
  
  /**
   * Get a specific version by ID
   */
  async getVersion(versionId: string): Promise<Version<T>> {
    const { data, error } = await this.supabase
      .from("resource_versions")
      .select("*")
      .eq("id", versionId)
      .single()
    
    if (error) {
      throw error
    }
    
    return this.mapVersionFromDb(data)
  }
  
  /**
   * Get all versions of a resource
   */
  async getVersionHistory(resourceId: string): Promise<Version<T>[]> {
    const { data, error } = await this.supabase
      .from("resource_versions")
      .select("*")
      .eq("resource_id", resourceId)
      .eq("resource_type", this.resourceType)
      .order("version_number", { ascending: false })
    
    if (error) {
      throw error
    }
    
    return data.map(this.mapVersionFromDb)
  }
  
  /**
   * Get the latest version of a resource
   */
  async getLatestVersion(resourceId: string): Promise<Version<T>> {
    const { data, error } = await this.supabase
      .from("resource_versions")
      .select("*")
      .eq("resource_id", resourceId)
      .eq("resource_type", this.resourceType)
      .order("version_number", { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      throw error
    }
    
    return this.mapVersionFromDb(data)
  }
  
  /**
   * Compare two versions of a resource
   */
  async compareVersions(versionId1: string, versionId2: string): Promise<VersionDiff<T>> {
    const version1 = await this.getVersion(versionId1)
    const version2 = await this.getVersion(versionId2)
    
    // Ensure version1 is the older version
    const [previousVersion, currentVersion] = version1.versionNumber < version2.versionNumber
      ? [version1, version2]
      : [version2, version1]
    
    // Determine the content type and use appropriate diff algorithm
    const contentType = this.getContentType(previousVersion.content)
    
    let additions: any[] = []
    let deletions: any[] = []
    let modifications: any[] = []
    
    switch (contentType) {
      case "string":
        // Use line-based diff for strings
        const lineDiff = diffLines(
          String(previousVersion.content),
          String(currentVersion.content)
        )
        
        additions = lineDiff.filter(part => part.added).map(part => part.value)
        deletions = lineDiff.filter(part => part.removed).map(part => part.value)
        break
        
      case "object":
        // Use JSON diff for objects
        const jsonDiff = diffJson(
          previousVersion.content as any,
          currentVersion.content as any
        )
        
        additions = jsonDiff.filter(part => part.added).map(part => part.value)
        deletions = jsonDiff.filter(part => part.removed).map(part => part.value)
        
        // For objects, also track modified fields
        if (typeof previousVersion.content === "object" && typeof currentVersion.content === "object") {
          const prevObj = previousVersion.content as Record<string, any>
          const currObj = currentVersion.content as Record<string, any>
          
          // Find modified fields (present in both but with different values)
          for (const key in prevObj) {
            if (key in currObj && prevObj[key] !== currObj[key]) {
              modifications.push({
                key,
                previous: prevObj[key],
                current: currObj[key],
              })
            }
          }
        }
        break
        
      case "array":
        // For arrays, compare items
        const prevArray = previousVersion.content as any[]
        const currArray = currentVersion.content as any[]
        
        // Find added items (in current but not in previous)
        additions = currArray.filter(item => 
          !prevArray.some(prevItem => JSON.stringify(prevItem) === JSON.stringify(item))
        )
        
        // Find deleted items (in previous but not in current)
        deletions = prevArray.filter(item => 
          !currArray.some(currItem => JSON.stringify(currItem) === JSON.stringify(item))
        )
        break
        
      default:
        // For other types, just note if they're different
        if (previousVersion.content !== currentVersion.content) {
          additions = [currentVersion.content]
          deletions = [previousVersion.content]
        }
    }
    
    return {
      previousVersion,
      currentVersion,
      additions,
      deletions,
      modifications,
    }
  }
  
  /**
   * Restore a resource to a specific version
   */
  async restoreVersion(versionId: string, userId: string): Promise<Version<T>> {
    // Get the version to restore
    const versionToRestore = await this.getVersion(versionId)
    
    // Create a new version with the content from the version to restore
    return this.createVersion(
      versionToRestore.resourceId,
      versionToRestore.content,
      userId,
      `Restored from version ${versionToRestore.versionNumber}`,
      versionToRestore.tags
    )
  }
  
  /**
   * Tag a version with a label
   */
  async tagVersion(versionId: string, tag: string): Promise<Version<T>> {
    // Get the current version
    const { data: currentVersion, error: versionError } = await this.supabase
      .from("resource_versions")
      .select("*")
      .eq("id", versionId)
      .single()
    
    if (versionError) {
      throw versionError
    }
    
    // Add the tag if it doesn't already exist
    const currentTags = currentVersion.tags || []
    if (!currentTags.includes(tag)) {
      const updatedTags = [...currentTags, tag]
      
      const { data, error } = await this.supabase
        .from("resource_versions")
        .update({ tags: updatedTags })
        .eq("id", versionId)
        .select("*")
        .single()
      
      if (error) {
        throw error
      }
      
      return this.mapVersionFromDb(data)
    }
    
    return this.mapVersionFromDb(currentVersion)
  }
  
  /**
   * Remove a tag from a version
   */
  async untagVersion(versionId: string, tag: string): Promise<Version<T>> {
    // Get the current version
    const { data: currentVersion, error: versionError } = await this.supabase
      .from("resource_versions")
      .select("*")
      .eq("id", versionId)
      .single()
    
    if (versionError) {
      throw versionError
    }
    
    // Remove the tag if it exists
    const currentTags = currentVersion.tags || []
    if (currentTags.includes(tag)) {
      const updatedTags = currentTags.filter((t: any) => t !== tag)
      
      const { data, error } = await this.supabase
        .from("resource_versions")
        .update({ tags: updatedTags })
        .eq("id", versionId)
        .select("*")
        .single()
      
      if (error) {
        throw error
      }
      
      return this.mapVersionFromDb(data)
    }
    
    return this.mapVersionFromDb(currentVersion)
  }
  
  /**
   * Get versions with a specific tag
   */
  async getVersionsByTag(resourceId: string, tag: string): Promise<Version<T>[]> {
    const { data, error } = await this.supabase
      .from("resource_versions")
      .select("*")
      .eq("resource_id", resourceId)
      .eq("resource_type", this.resourceType)
      .contains("tags", [tag])
      .order("version_number", { ascending: false })
    
    if (error) {
      throw error
    }
    
    return data.map(this.mapVersionFromDb)
  }
  
  /**
   * Map a database version record to a Version object
   */
  private mapVersionFromDb = (dbVersion: any): Version<T> => {
    return {
      id: dbVersion.id,
      resourceId: dbVersion.resource_id,
      versionNumber: dbVersion.version_number,
      content: dbVersion.content as T,
      comment: dbVersion.comment,
      createdBy: dbVersion.created_by,
      createdAt: new Date(dbVersion.created_at),
      tags: dbVersion.tags || [],
    }
  }
  
  /**
   * Determine the content type for diffing
   */
  private getContentType(content: any): string {
    if (typeof content === "string") {
      return "string"
    } else if (Array.isArray(content)) {
      return "array"
    } else if (typeof content === "object" && content !== null) {
      return "object"
    } else {
      return typeof content
    }
  }
}