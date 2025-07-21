"use client"

import { useState } from "react"
import { PresenceUser } from "../../../lib/types/presence"
import { PresenceStatus } from "../../../lib/database-types"

interface PresenceIndicatorProps {
  users: PresenceUser[]
  maxDisplayed?: number
  showStatus?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

/**
 * Component to display users who are currently viewing a resource
 */
export function PresenceIndicator({
  users,
  maxDisplayed = 3,
  showStatus = true,
  size = "md",
  className = "",
}: PresenceIndicatorProps) {
  const [showAllUsers, setShowAllUsers] = useState(false)
  
  // Sort users by status (online first) and then by name
  const sortedUsers = [...users].sort((a, b) => {
    // Online users first
    if (a.status === "online" && b.status !== "online") return -1
    if (a.status !== "online" && b.status === "online") return 1
    
    // Then sort by name
    return a.name.localeCompare(b.name)
  })
  
  const displayedUsers = showAllUsers 
    ? sortedUsers 
    : sortedUsers.slice(0, maxDisplayed)
  
  const remainingCount = sortedUsers.length - maxDisplayed
  
  // Size classes
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  }
  
  // Status color classes
  const statusColors: Record<PresenceStatus, string> = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    offline: "bg-gray-400",
  }
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex -space-x-2">
        {displayedUsers.map((user) => (
          <div
            key={user.id}
            className="relative group"
            title={`${user.name} (${user.status})`}
          >
            {/* Avatar */}
            <div 
              className={`${sizeClasses[size]} rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden`}
            >
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Status indicator */}
            {showStatus && (
              <span 
                className={`absolute bottom-0 right-0 rounded-full ${statusColors[user.status]} h-2 w-2 border border-white dark:border-gray-800`}
              />
            )}
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              {user.name}
              <div className="text-xs flex items-center gap-1">
                <span className={`inline-block h-2 w-2 rounded-full ${statusColors[user.status]}`}></span>
                <span className="capitalize">{user.status}</span>
              </div>
            </div>
          </div>
        ))}
        
        {/* Show more indicator */}
        {remainingCount > 0 && !showAllUsers && (
          <div
            className={`${sizeClasses[size]} rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gray-300 dark:bg-gray-600 cursor-pointer`}
            onClick={() => setShowAllUsers(true)}
            title={`${remainingCount} more users`}
          >
            <span className="font-medium text-gray-600 dark:text-gray-300">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
      
      {/* Show less button when expanded */}
      {showAllUsers && users.length > maxDisplayed && (
        <button
          className="ml-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={() => setShowAllUsers(false)}
        >
          Show less
        </button>
      )}
    </div>
  )
}