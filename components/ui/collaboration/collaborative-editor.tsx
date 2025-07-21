"use client"

import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { CollaborationUser } from '../../../lib/types/collaboration'

interface CollaborativeEditorProps {
  documentId: string
  user: CollaborationUser
  enableOffline?: boolean
  readOnly?: boolean
  placeholder?: string
  className?: string
  onChange?: (content: string) => void
}

/**
 * A collaborative rich text editor using TipTap and Y.js
 */
export function CollaborativeEditor({
  documentId,
  user,
  enableOffline = true,
  readOnly = false,
  placeholder = 'Start typing...',
  className = '',
  onChange,
}: CollaborativeEditorProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([])
  
  // Create Y.js document and providers
  const ydoc = new Y.Doc()
  const websocketProvider = new WebsocketProvider(
    'wss://demos.yjs.dev',
    `document-${documentId}`,
    ydoc
  )
  
  // Set up IndexedDB persistence if offline support is enabled
  let indexeddbProvider: IndexeddbPersistence | null = null
  if (enableOffline) {
    indexeddbProvider = new IndexeddbPersistence(`document-${documentId}`, ydoc)
  }
  
  // Set user awareness
  websocketProvider.awareness.setLocalStateField('user', {
    name: user.name,
    color: user.color,
    avatar: user.avatar,
  })
  
  // Initialize TipTap editor with Y.js collaboration
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // Disable history as it's handled by Y.js
      }),
      Collaboration.configure({
        document: ydoc,
        field: 'content',
      }),
      CollaborationCursor.configure({
        provider: websocketProvider,
        user: {
          name: user.name,
          color: user.color,
          avatar: user.avatar,
        },
      }),
    ],
    editable: !readOnly,
    content: '',
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
  })
  
  // Handle connection status changes
  useEffect(() => {
    const handleStatusChange = (event: { status: string }) => {
      setIsConnected(event.status === 'connected')
    }
    
    websocketProvider.on('status', handleStatusChange)
    
    return () => {
      websocketProvider.off('status', handleStatusChange)
    }
  }, [websocketProvider])
  
  // Handle awareness changes (users joining/leaving)
  useEffect(() => {
    const handleAwarenessChange = () => {
      const states = Array.from(websocketProvider.awareness.getStates().values())
      const users: CollaborationUser[] = states
        .filter(state => state.user)
        .map(state => ({
          id: state.user.id || state.clientID,
          name: state.user.name,
          color: state.user.color,
          avatar: state.user.avatar,
        }))
      
      setActiveUsers(users)
    }
    
    websocketProvider.awareness.on('change', handleAwarenessChange)
    
    return () => {
      websocketProvider.awareness.off('change', handleAwarenessChange)
    }
  }, [websocketProvider])
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      websocketProvider.disconnect()
      if (indexeddbProvider) {
        indexeddbProvider.destroy()
      }
    }
  }, [websocketProvider, indexeddbProvider])
  
  if (!editor) {
    return <div>Loading editor...</div>
  }
  
  return (
    <div className={`collaborative-editor ${className}`}>
      {/* Connection status */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span 
            className={`inline-block h-3 w-3 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {/* Active users */}
        <div className="flex items-center">
          <span className="text-sm mr-2">
            {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
          </span>
          <div className="flex -space-x-2">
            {activeUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="relative group"
                title={user.name}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800"
                  />
                ) : (
                  <div
                    className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center"
                    style={{ backgroundColor: user.color }}
                  >
                    <span className="text-white text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {user.name}
                </div>
              </div>
            ))}
            
            {activeUsers.length > 3 && (
              <div
                className="h-8 w-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gray-300 dark:bg-gray-600"
                title={`${activeUsers.length - 3} more users`}
              >
                <span className="text-xs font-medium">
                  +{activeUsers.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Editor */}
      <div className="border rounded-md overflow-hidden">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm sm:prose max-w-none p-4 min-h-[200px] focus:outline-none"
        />
      </div>
    </div>
  )
}