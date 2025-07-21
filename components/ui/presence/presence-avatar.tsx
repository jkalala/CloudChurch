"use client"

import { useState } from "react"
import { PresenceUser } from "../../../lib/types/presence"
import { PresenceStatus } from "../../../lib/database-types"

interface PresenceAvatarProps {
  user: PresenceUser
  size?: "sm" | "md" | "lg"
  showStatus?: boolean
  editable?: boolean
  onStatusChange?: (status: PresenceStatus) => void
  className?: string
}

/**
 * Component to display a user's presence avatar with status
 */
export function PresenceAvatar({
  user,
  size = "md",
  showStatus = true,
  editable = false,
  onStatusChange,
  className = "",
}: PresenceAvatarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }
  
  // Status color classes
  const statusColors: Record<PresenceStatus, string> = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    offline: "bg-gray-400",
  }
  
  // Status options for dropdown
  const statusOptions: { value: PresenceStatus; label: string }[] = [
    { value: "online", label: "Online" },
    { value: "away", label: "Away" },
    { value: "busy", label: "Busy" },
    { value: "offline", label: "Appear Offline" },
  ]
  
  const handleStatusChange = (status: PresenceStatus) => {
    if (onStatusChange) {
      onStatusChange(status)
    }
    setMenuOpen(false)
  }
  
  return (
    <div className={`relative ${className}`}>
      {/* Avatar */}
      <div 
        className={`${sizeClasses[size]} rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center bg-gray-200 dark:bg-gray-700 overflow-hidden ${editable ? "cursor-pointer" : ""}`}
        onClick={() => editable && setMenuOpen(!menuOpen)}
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
          className={`absolute bottom-0 right-0 rounded-full ${statusColors[user.status]} h-3 w-3 border-2 border-white dark:border-gray-800 ${editable ? "cursor-pointer" : ""}`}
          onClick={() => editable && setMenuOpen(!menuOpen)}
        />
      )}
      
      {/* Status dropdown menu */}
      {editable && menuOpen && (
        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 min-w-[120px] py-1 border border-gray-200 dark:border-gray-700">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              onClick={() => handleStatusChange(option.value)}
            >
              <span className={`inline-block h-2 w-2 rounded-full ${statusColors[option.value]}`}></span>
              {option.label}
              {user.status === option.value && (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-auto" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}