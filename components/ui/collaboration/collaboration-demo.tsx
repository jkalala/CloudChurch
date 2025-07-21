"use client"

import { useState, useEffect } from 'react'
import { useCollaborativeEditor } from '../../../hooks/use-collaborative-editor'
import { CollaborativeEditor } from './collaborative-editor'
import { VersionHistory } from './version-history'
import { CollaborationUser } from '../../../lib/types/collaboration'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface CollaborationDemoProps {
  initialDocumentId?: string
}

/**
 * Demo component for the collaborative editing system
 */
export function CollaborationDemo({ initialDocumentId }: CollaborationDemoProps) {
  const [documentId, setDocumentId] = useState(initialDocumentId || 'demo-document')
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [currentUser, setCurrentUser] = useState<CollaborationUser>({
    id: 'anonymous',
    name: 'Anonymous User',
    color: getRandomColor(),
  })
  const [saveComment, setSaveComment] = useState('')
  
  const supabase = createClientComponentClient()
  
  // Get current user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      
      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('first_name, last_name, profile_image')
          .eq('user_id', data.user.id)
          .single()
        
        setCurrentUser({
          id: data.user.id,
          name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : data.user.email || 'User',
          color: getRandomColor(),
          avatar: profile?.profile_image,
        })
      }
    }
    
    fetchUser()
  }, [supabase])
  
  // Initialize collaborative editor
  const [state, actions] = useCollaborativeEditor({
    documentId,
    user: currentUser,
    enableOffline: true,
    enableVersioning: true,
    onSave: (document) => {
      console.log('Document saved:', document)
    },
    onError: (error) => {
      console.error('Collaboration error:', error)
    },
  })
  
  // Handle save
  const handleSave = async () => {
    await actions.save(saveComment || undefined)
    setSaveComment('')
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Collaborative Editing Demo</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Document ID (change to simulate different documents)
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            className="px-3 py-2 border rounded-md flex-1"
            placeholder="Enter document ID"
          />
          <button
            onClick={() => setDocumentId(`demo-document-${Date.now()}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Generate New ID
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
        {/* Document info */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">
                {state.document?.title || 'Untitled Document'}
              </h2>
              {state.document && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Version {state.document.version} • Last modified{' '}
                  {new Date(state.document.lastModified).toLocaleString()}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {showVersionHistory ? 'Hide History' : 'Version History'}
              </button>
              
              <button
                onClick={handleSave}
                disabled={state.isSaving}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Version history */}
        {showVersionHistory && (
          <div className="mb-6 border rounded-md">
            <VersionHistory
              documentId={documentId}
              getVersionHistory={actions.getVersionHistory}
              restoreVersion={actions.restoreVersion}
              compareVersions={actions.compareVersions}
              onClose={() => setShowVersionHistory(false)}
            />
          </div>
        )}
        
        {/* Save comment */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Save Comment (optional)
          </label>
          <input
            type="text"
            value={saveComment}
            onChange={(e) => setSaveComment(e.target.value)}
            className="px-3 py-2 border rounded-md w-full"
            placeholder="Enter a comment for this save"
          />
        </div>
        
        {/* Editor */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Collaborative Editor
          </label>
          <CollaborativeEditor
            documentId={documentId}
            user={currentUser}
            enableOffline={true}
          />
        </div>
        
        {/* Active users */}
        <div>
          <h3 className="text-sm font-medium mb-2">Active Users</h3>
          {state.users.length > 0 ? (
            <ul className="space-y-2">
              {state.users.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.id === currentUser.id ? 'You' : 'Collaborator'}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">
              No active users
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Helper function to generate a random color
function getRandomColor() {
  const colors = [
    '#f44336', // Red
    '#e91e63', // Pink
    '#9c27b0', // Purple
    '#673ab7', // Deep Purple
    '#3f51b5', // Indigo
    '#2196f3', // Blue
    '#03a9f4', // Light Blue
    '#00bcd4', // Cyan
    '#009688', // Teal
    '#4caf50', // Green
    '#8bc34a', // Light Green
    '#cddc39', // Lime
    '#ffc107', // Amber
    '#ff9800', // Orange
    '#ff5722', // Deep Orange
  ]
  
  return colors[Math.floor(Math.random() * colors.length)]
}