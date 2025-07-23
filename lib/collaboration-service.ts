import { supabase } from '@/lib/supabase-client';
import { CollaborationDocument, CollaborationVersion } from "./types/collaboration"

/**
 * Service for managing collaborative documents
 */
export class CollaborationService {
  private supabase = supabase
  
  /**
   * Get a document by ID
   */
  async getDocument(documentId: string): Promise<CollaborationDocument> {
    const { data, error } = await this.supabase
      .from("collaborative_documents")
      .select("*")
      .eq("id", documentId)
      .single()
    
    if (error) {
      throw error
    }
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      version: data.version,
      lastModified: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    }
  }
  
  /**
   * Create a new document
   */
  async createDocument(
    title: string,
    content: string,
    userId: string
  ): Promise<CollaborationDocument> {
    const { data, error } = await this.supabase
      .from("collaborative_documents")
      .insert({
        title,
        content,
        version: 1,
        created_by: userId,
        updated_by: userId,
      })
      .select("*")
      .single()
    
    if (error) {
      throw error
    }
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      version: data.version,
      lastModified: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    }
  }
  
  /**
   * Update a document
   */
  async updateDocument(
    documentId: string,
    content: string,
    userId: string
  ): Promise<CollaborationDocument> {
    // Get current document to increment version
    const { data: currentDoc, error: fetchError } = await this.supabase
      .from("collaborative_documents")
      .select("version")
      .eq("id", documentId)
      .single()
    
    if (fetchError) {
      throw fetchError
    }
    
    const newVersion = currentDoc.version + 1
    
    // Update document
    const { data, error } = await this.supabase
      .from("collaborative_documents")
      .update({
        content,
        version: newVersion,
        updated_by: userId,
      })
      .eq("id", documentId)
      .select("*")
      .single()
    
    if (error) {
      throw error
    }
    
    return {
      id: data.id,
      title: data.title,
      content: data.content,
      version: data.version,
      lastModified: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    }
  }
  
  /**
   * Save a document version
   */
  async saveVersion(
    documentId: string,
    content: string,
    version: number,
    userId: string,
    comment?: string
  ): Promise<CollaborationVersion> {
    const { data, error } = await this.supabase
      .from("document_versions")
      .insert({
        document_id: documentId,
        content,
        version,
        created_by: userId,
        comment,
      })
      .select("*")
      .single()
    
    if (error) {
      throw error
    }
    
    return {
      id: data.id,
      documentId: data.document_id,
      content: data.content,
      version: data.version,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by,
      comment: data.comment,
    }
  }
  
  /**
   * Get version history for a document
   */
  async getVersionHistory(documentId: string): Promise<CollaborationVersion[]> {
    const { data, error } = await this.supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", documentId)
      .order("version", { ascending: false })
    
    if (error) {
      throw error
    }
    
    return data.map(item => ({
      id: item.id,
      documentId: item.document_id,
      content: item.content,
      version: item.version,
      createdAt: new Date(item.created_at),
      createdBy: item.created_by,
      comment: item.comment,
    }))
  }
  
  /**
   * Get a specific version of a document
   */
  async getVersion(versionId: string): Promise<CollaborationVersion> {
    const { data, error } = await this.supabase
      .from("document_versions")
      .select("*")
      .eq("id", versionId)
      .single()
    
    if (error) {
      throw error
    }
    
    return {
      id: data.id,
      documentId: data.document_id,
      content: data.content,
      version: data.version,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by,
      comment: data.comment,
    }
  }
  
  /**
   * Restore a document to a specific version
   */
  async restoreVersion(
    versionId: string,
    userId: string
  ): Promise<CollaborationDocument> {
    // Get the version to restore
    const version = await this.getVersion(versionId)
    
    // Update the document with the version content
    return this.updateDocument(version.documentId, version.content, userId)
  }
}