"use client"

import { useState, useEffect } from 'react'
import { CollaborationVersion } from '../../../lib/types/collaboration'

interface VersionHistoryProps {
  documentId: string
  getVersionHistory: () => Promise<CollaborationVersion[]>
  restoreVersion: (versionId: string) => Promise<void>
  compareVersions: (versionId1: string, versionId2: string) => Promise<{
    additions: string[]
    deletions: string[]
  }>
  onClose?: () => void
}

/**
 * Component for displaying and managing document version history
 */
export function VersionHistory({
  documentId,
  getVersionHistory,
  restoreVersion,
  compareVersions,
  onClose,
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<CollaborationVersion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [comparison, setComparison] = useState<{
    additions: string[]
    deletions: string[]
  } | null>(null)
  const [isRestoring, setIsRestoring] = useState(false)
  
  // Load version history
  useEffect(() => {
    const loadVersions = async () => {
      try {
        setIsLoading(true)
        const versionHistory = await getVersionHistory()
        setVersions(versionHistory)
        
        // Select the latest version by default
        if (versionHistory.length > 0) {
          setSelectedVersionId(versionHistory[0].id)
        }
      } catch (error) {
        setError(error as Error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadVersions()
  }, [documentId, getVersionHistory])
  
  // Handle version selection
  const handleSelectVersion = (versionId: string) => {
    setSelectedVersionId(versionId)
    setComparison(null)
  }
  
  // Handle compare selection
  const handleSelectCompare = (versionId: string) => {
    setCompareVersionId(versionId)
  }
  
  // Handle compare action
  const handleCompare = async () => {
    if (!selectedVersionId || !compareVersionId) return
    
    try {
      setIsComparing(true)
      const result = await compareVersions(selectedVersionId, compareVersionId)
      setComparison(result)
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsComparing(false)
    }
  }
  
  // Handle restore action
  const handleRestore = async () => {
    if (!selectedVersionId) return
    
    try {
      setIsRestoring(true)
      await restoreVersion(selectedVersionId)
      
      // Refresh version history
      const versionHistory = await getVersionHistory()
      setVersions(versionHistory)
    } catch (error) {
      setError(error as Error)
    } finally {
      setIsRestoring(false)
    }
  }
  
  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date)
  }
  
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          <p>Error loading version history: {error.message}</p>
        </div>
      </div>
    )
  }
  
  if (versions.length === 0) {
    return (
      <div className="p-4">
        <p className="text-gray-500 dark:text-gray-400">No version history available.</p>
      </div>
    )
  }
  
  const selectedVersion = versions.find(v => v.id === selectedVersionId)
  const compareVersion = versions.find(v => v.id === compareVersionId)
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Version History</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Version list */}
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b">
            <h3 className="font-medium">Versions</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            <ul className="divide-y">
              {versions.map((version) => (
                <li
                  key={version.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    selectedVersionId === version.id
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : ''
                  }`}
                  onClick={() => handleSelectVersion(version.id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Version {version.version}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(version.createdAt)}
                      </div>
                      {version.comment && (
                        <div className="text-sm mt-1">{version.comment}</div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className={`p-1 rounded ${
                          compareVersionId === version.id
                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectCompare(version.id)
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
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Version details */}
        <div className="border rounded-md overflow-hidden md:col-span-2">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b flex justify-between items-center">
            <h3 className="font-medium">
              {selectedVersion
                ? `Version ${selectedVersion.version} Details`
                : 'Select a version'}
            </h3>
            <div className="flex space-x-2">
              {selectedVersion && (
                <>
                  <button
                    onClick={handleRestore}
                    disabled={isRestoring}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {isRestoring ? 'Restoring...' : 'Restore'}
                  </button>
                  {compareVersionId && compareVersionId !== selectedVersionId && (
                    <button
                      onClick={handleCompare}
                      disabled={isComparing}
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isComparing ? 'Comparing...' : 'Compare'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          <div className="p-4">
            {selectedVersion ? (
              <div>
                <div className="mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Created on {formatDate(selectedVersion.createdAt)}
                  </div>
                  {selectedVersion.comment && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border">
                      <div className="text-sm font-medium mb-1">Comment:</div>
                      <div>{selectedVersion.comment}</div>
                    </div>
                  )}
                </div>
                
                {comparison ? (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">
                      Comparing Version {selectedVersion.version} with Version{' '}
                      {compareVersion?.version}
                    </h4>
                    
                    <div className="border rounded-md overflow-hidden">
                      {/* Additions */}
                      {comparison.additions.length > 0 && (
                        <div className="border-b">
                          <div className="bg-green-50 dark:bg-green-900/20 px-3 py-1 text-sm font-medium">
                            Additions
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-900">
                            {comparison.additions.map((line, i) => (
                              <div
                                key={i}
                                className="py-1 pl-2 border-l-2 border-green-500"
                              >
                                {line || <span className="text-gray-400">(empty line)</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Deletions */}
                      {comparison.deletions.length > 0 && (
                        <div>
                          <div className="bg-red-50 dark:bg-red-900/20 px-3 py-1 text-sm font-medium">
                            Deletions
                          </div>
                          <div className="p-3 bg-white dark:bg-gray-900">
                            {comparison.deletions.map((line, i) => (
                              <div
                                key={i}
                                className="py-1 pl-2 border-l-2 border-red-500"
                              >
                                {line || <span className="text-gray-400">(empty line)</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {comparison.additions.length === 0 &&
                        comparison.deletions.length === 0 && (
                          <div className="p-4 text-center text-gray-500">
                            No differences found between these versions.
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">
                      {selectedVersion.content}
                    </pre>
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