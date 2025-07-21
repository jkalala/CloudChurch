"use client"

import { useState, useEffect } from "react"
import { useVersionControl } from "../../../hooks/use-version-control"
import { Version, VersionDiff } from "../../../lib/types/version-control"

interface VersionHistoryViewerProps<T = any> {
  resourceId: string
  resourceType: string
  onVersionSelect?: (version: Version<T>) => void
  onVersionRestore?: (version: Version<T>) => void
  renderContent?: (content: T) => React.ReactNode
  className?: string
}

/**
 * Component for viewing and managing version history
 */
export function VersionHistoryViewer<T = any>({
  resourceId,
  resourceType,
  onVersionSelect,
  onVersionRestore,
  renderContent,
  className = "",
}: VersionHistoryViewerProps<T>) {
  const {
    state,
    loadVersions,
    selectVersion,
    compareVersions,
    restoreVersion,
    tagVersion,
    untagVersion,
    clearComparison,
  } = useVersionControl<T>({
    resourceId,
    resourceType,
  })
  
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")
  const [showTagInput, setShowTagInput] = useState<string | null>(null)
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }
  
  // Handle version selection
  const handleSelectVersion = async (versionId: string) => {
    try {
      const version = await selectVersion(versionId)
      if (onVersionSelect) {
        onVersionSelect(version)
      }
    } catch (error) {
      console.error("Error selecting version:", error)
    }
  }
  
  // Handle version comparison
  const handleCompareVersions = async () => {
    if (!state.selectedVersion || !compareVersionId) return
    
    try {
      await compareVersions(state.selectedVersion.id, compareVersionId)
    } catch (error) {
      console.error("Error comparing versions:", error)
    }
  }
  
  // Handle version restoration
  const handleRestoreVersion = async (versionId: string) => {
    try {
      const restoredVersion = await restoreVersion(versionId)
      if (onVersionRestore) {
        onVersionRestore(restoredVersion)
      }
    } catch (error) {
      console.error("Error restoring version:", error)
    }
  }
  
  // Handle adding a tag
  const handleAddTag = async (versionId: string) => {
    if (!newTag.trim()) return
    
    try {
      await tagVersion(versionId, newTag.trim())
      setNewTag("")
      setShowTagInput(null)
    } catch (error) {
      console.error("Error adding tag:", error)
    }
  }
  
  // Handle removing a tag
  const handleRemoveTag = async (versionId: string, tag: string) => {
    try {
      await untagVersion(versionId, tag)
    } catch (error) {
      console.error("Error removing tag:", error)
    }
  }
  
  // Render version content
  const renderVersionContent = (content: T) => {
    if (renderContent) {
      return renderContent(content)
    }
    
    // Default rendering based on content type
    if (typeof content === "string") {
      return <pre className="whitespace-pre-wrap text-sm">{content}</pre>
    } else if (typeof content === "object" && content !== null) {
      return (
        <pre className="whitespace-pre-wrap text-sm">
          {JSON.stringify(content, null, 2)}
        </pre>
      )
    } else {
      return <div>{String(content)}</div>
    }
  }
  
  // Render diff content
  const renderDiffContent = (diff: VersionDiff<T>) => {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Comparing Versions</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              Version {diff.previousVersion.versionNumber}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ({formatDate(diff.previousVersion.createdAt)})
            </span>
            <span className="mx-2">→</span>
            <span className="font-medium">
              Version {diff.currentVersion.versionNumber}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              ({formatDate(diff.currentVersion.createdAt)})
            </span>
          </div>
        </div>
        
        {/* Additions */}
        {diff.additions.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 text-sm font-medium">
              Additions
            </div>
            <div className="p-3 bg-white dark:bg-gray-900">
              {diff.additions.map((addition, i) => (
                <div
                  key={i}
                  className="py-1 pl-2 border-l-2 border-green-500"
                >
                  {typeof addition === "string" ? (
                    addition || <span className="text-gray-400">(empty line)</span>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(addition, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Deletions */}
        {diff.deletions.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-red-50 dark:bg-red-900/20 px-3 py-1 text-sm font-medium">
              Deletions
            </div>
            <div className="p-3 bg-white dark:bg-gray-900">
              {diff.deletions.map((deletion, i) => (
                <div
                  key={i}
                  className="py-1 pl-2 border-l-2 border-red-500"
                >
                  {typeof deletion === "string" ? (
                    deletion || <span className="text-gray-400">(empty line)</span>
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm">
                      {JSON.stringify(deletion, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Modifications */}
        {diff.modifications.length > 0 && (
          <div className="border rounded-md overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-sm font-medium">
              Modifications
            </div>
            <div className="p-3 bg-white dark:bg-gray-900">
              {diff.modifications.map((mod, i) => (
                <div
                  key={i}
                  className="py-1 pl-2 border-l-2 border-blue-500"
                >
                  <div className="font-medium">{mod.key}</div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-1">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Previous:
                      </div>
                      <pre className="whitespace-pre-wrap text-sm bg-red-50 dark:bg-red-900/10 p-2 rounded">
                        {JSON.stringify(mod.previous, null, 2)}
                      </pre>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Current:
                      </div>
                      <pre className="whitespace-pre-wrap text-sm bg-green-50 dark:bg-green-900/10 p-2 rounded">
                        {JSON.stringify(mod.current, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {diff.additions.length === 0 &&
          diff.deletions.length === 0 &&
          diff.modifications.length === 0 && (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 border rounded-md">
              No differences found between these versions.
            </div>
          )}
      </div>
    )
  }
  
  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Version list */}
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex justify-between items-center">
            <h3 className="font-medium">Version History</h3>
            <button
              onClick={() => loadVersions()}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              title="Refresh"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {state.isLoading ? (
              <div className="p-4 flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : state.versions.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No versions available
              </div>
            ) : (
              <ul className="divide-y">
                {state.versions.map((version) => (
                  <li
                    key={version.id}
                    className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      state.selectedVersion?.id === version.id
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <button
                        className="text-left flex-1"
                        onClick={() => handleSelectVersion(version.id)}
                      >
                        <div className="font-medium">
                          Version {version.versionNumber}
                          {version.id === state.currentVersion?.id && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(version.createdAt)}
                        </div>
                        {version.comment && (
                          <div className="text-sm mt-1 line-clamp-2">
                            {version.comment}
                          </div>
                        )}
                        
                        {/* Tags */}
                        {version.tags && version.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {version.tags.map((tag) => (
                              <div
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                              >
                                <span>{tag}</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveTag(version.id, tag)
                                  }}
                                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </button>
                      
                      <div className="flex space-x-1">
                        {/* Compare button */}
                        <button
                          className={`p-1 rounded ${
                            compareVersionId === version.id
                              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (compareVersionId === version.id) {
                              setCompareVersionId(null)
                            } else {
                              setCompareVersionId(version.id)
                            }
                          }}
                          title="Compare with selected version"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                          </svg>
                        </button>
                        
                        {/* Tag button */}
                        <button
                          className={`p-1 rounded ${
                            showTagInput === version.id
                              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowTagInput(
                              showTagInput === version.id ? null : version.id
                            )
                          }}
                          title="Add tag"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                            />
                          </svg>
                        </button>
                        
                        {/* Restore button */}
                        {version.id !== state.currentVersion?.id && (
                          <button
                            className="p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRestoreVersion(version.id)
                            }}
                            title="Restore this version"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Tag input */}
                    {showTagInput === version.id && (
                      <div className="mt-2 flex">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Enter tag name"
                          className="flex-1 px-2 py-1 text-sm border rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddTag(version.id)
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddTag(version.id)}
                          className="px-2 py-1 bg-blue-600 text-white text-sm rounded-r-md hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Version details */}
        <div className="md:col-span-2 border rounded-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex justify-between items-center">
            <h3 className="font-medium">
              {state.comparison
                ? "Version Comparison"
                : state.selectedVersion
                ? `Version ${state.selectedVersion.versionNumber} Details`
                : "Select a version"}
            </h3>
            <div className="flex space-x-2">
              {compareVersionId && state.selectedVersion && (
                <button
                  onClick={handleCompareVersions}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Compare
                </button>
              )}
              {state.comparison && (
                <button
                  onClick={clearComparison}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Clear Comparison
                </button>
              )}
            </div>
          </div>
          
          <div className="p-4">
            {state.isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </div>
            ) : state.comparison ? (
              renderDiffContent(state.comparison)
            ) : state.selectedVersion ? (
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created on {formatDate(state.selectedVersion.createdAt)}
                  </div>
                  {state.selectedVersion.comment && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      <div className="text-sm font-medium mb-1">Comment:</div>
                      <div>{state.selectedVersion.comment}</div>
                    </div>
                  )}
                </div>
                
                <div className="border rounded-md p-4 max-h-[500px] overflow-y-auto">
                  {renderVersionContent(state.selectedVersion.content)}
                </div>
                
                {state.selectedVersion.id !== state.currentVersion?.id && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleRestoreVersion(state.selectedVersion!.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Restore This Version
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                Select a version to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}