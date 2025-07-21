/**
 * Represents a version of a resource
 */
export interface Version<T = any> {
  /**
   * Unique identifier for the version
   */
  id: string;
  
  /**
   * Identifier of the resource this version belongs to
   */
  resourceId: string;
  
  /**
   * Version number (incremental)
   */
  versionNumber: number;
  
  /**
   * Content of the version
   */
  content: T;
  
  /**
   * Optional comment describing the changes in this version
   */
  comment?: string;
  
  /**
   * User who created this version
   */
  createdBy: string;
  
  /**
   * When this version was created
   */
  createdAt: Date;
  
  /**
   * Tags associated with this version (e.g., "published", "draft")
   */
  tags?: string[];
}

/**
 * Represents a change between two versions
 */
export interface VersionDiff<T = any> {
  /**
   * The previous version
   */
  previousVersion: Version<T>;
  
  /**
   * The current version
   */
  currentVersion: Version<T>;
  
  /**
   * Added elements (depends on content type)
   */
  additions: any[];
  
  /**
   * Removed elements (depends on content type)
   */
  deletions: any[];
  
  /**
   * Modified elements (depends on content type)
   */
  modifications: any[];
}

/**
 * Interface for version control operations
 */
export interface IVersionControl<T = any> {
  /**
   * Create a new version of a resource
   */
  createVersion(
    resourceId: string,
    content: T,
    createdBy: string,
    comment?: string,
    tags?: string[]
  ): Promise<Version<T>>;
  
  /**
   * Get a specific version by ID
   */
  getVersion(versionId: string): Promise<Version<T>>;
  
  /**
   * Get all versions of a resource
   */
  getVersionHistory(resourceId: string): Promise<Version<T>[]>;
  
  /**
   * Get the latest version of a resource
   */
  getLatestVersion(resourceId: string): Promise<Version<T>>;
  
  /**
   * Compare two versions of a resource
   */
  compareVersions(versionId1: string, versionId2: string): Promise<VersionDiff<T>>;
  
  /**
   * Restore a resource to a specific version
   */
  restoreVersion(versionId: string, userId: string): Promise<Version<T>>;
  
  /**
   * Tag a version with a label
   */
  tagVersion(versionId: string, tag: string): Promise<Version<T>>;
  
  /**
   * Remove a tag from a version
   */
  untagVersion(versionId: string, tag: string): Promise<Version<T>>;
  
  /**
   * Get versions with a specific tag
   */
  getVersionsByTag(resourceId: string, tag: string): Promise<Version<T>[]>;
}