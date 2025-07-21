"use client"

import { useState } from "react"
import { PresenceProvider, usePresenceContext, useCurrentPresence } from "../../../lib/contexts/presence-context"
import { PresenceIndicator } from "./presence-indicator"
import { PresenceAvatar } from "./presence-avatar"
import { PresenceStatus } from "../../../lib/database-types"

/**
 * Demo component for the presence system
 */
export function PresenceDemo() {
  const [resourceId, setResourceId] = useState("demo-resource")
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Presence System Demo</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Resource ID (change to simulate different resources)
        </label>
        <div className="flex gap-4">
          <input
            type="text"
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            className="px-3 py-2 border rounded-md flex-1"
            placeholder="Enter resource ID"
          />
          <button
            onClick={() => setResourceId(`demo-resource-${Date.now()}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Generate New ID
          </button>
        </div>
      </div>
      
      <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
        <PresenceProvider
          options={{
            resourceId,
            resourceType: "demo",
            initialStatus: "online",
            metadata: { page: "Demo Page" },
          }}
        >
          <PresenceDemoContent />
        </PresenceProvider>
      </div>
    </div>
  )
}

function PresenceDemoContent() {
  const { state, actions } = usePresenceContext()
  const { user, updateStatus } = useCurrentPresence()
  
  const handleStatusChange = (status: PresenceStatus) => {
    updateStatus(status)
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Users viewing this resource
        </h2>
        
        <PresenceIndicator 
          users={state.users} 
          maxDisplayed={5}
          size="md"
        />
      </div>
      
      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
        <h3 className="font-medium mb-2">Current User</h3>
        
        {state.isLoading ? (
          <div className="animate-pulse h-10 w-40 bg-gray-200 dark:bg-gray-600 rounded"></div>
        ) : user ? (
          <div className="flex items-center gap-4">
            <PresenceAvatar
              user={user}
              editable={true}
              onStatusChange={handleStatusChange}
              size="lg"
            />
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                Status: {user.status}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            Not authenticated
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h3 className="font-medium mb-2">All Users ({state.users.length})</h3>
        
        {state.isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse h-12 bg-gray-200 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        ) : state.users.length > 0 ? (
          <ul className="space-y-2">
            {state.users.map((user) => (
              <li 
                key={user.id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
              >
                <PresenceAvatar user={user} size="sm" />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Last active: {formatTime(user.lastActive)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
            No users currently viewing this resource
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => actions.updateStatus("online")}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Set Online
        </button>
        <button
          onClick={() => actions.updateStatus("away")}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Set Away
        </button>
        <button
          onClick={() => actions.updateStatus("busy")}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Set Busy
        </button>
        <button
          onClick={() => actions.leave()}
          className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Leave
        </button>
      </div>
    </div>
  )
}

// Helper function to format time
function formatTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  
  if (diffSec < 60) {
    return `${diffSec} seconds ago`
  } else if (diffSec < 3600) {
    return `${Math.floor(diffSec / 60)} minutes ago`
  } else if (diffSec < 86400) {
    return `${Math.floor(diffSec / 3600)} hours ago`
  } else {
    return date.toLocaleDateString()
  }
}