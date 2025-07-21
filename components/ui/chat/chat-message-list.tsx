"use client"

import { useState } from "react"
import { ChatMessage } from "../../../hooks/use-real-time-chat"

interface ChatMessageListProps {
  messages: ChatMessage[]
  currentUserId: string
  onReaction: (messageId: string, reaction: string) => Promise<void>
  onEdit: (message: ChatMessage) => void
  onReply: (message: ChatMessage) => void
  onDelete: (messageId: string) => Promise<boolean>
}

/**
 * Component to display a list of chat messages
 */
export function ChatMessageList({
  messages,
  currentUserId,
  onReaction,
  onEdit,
  onReply,
  onDelete,
}: ChatMessageListProps) {
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)
  const [showMessageActions, setShowMessageActions] = useState<string | null>(null)
  
  // Common emoji reactions
  const commonReactions = ["👍", "❤️", "😂", "😮", "😢", "👏"]
  
  // Format date
  const formatMessageDate = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (diffDays === 1) {
      // Yesterday
      return "Yesterday"
    } else if (diffDays < 7) {
      // Within a week, show day name
      return date.toLocaleDateString([], { weekday: "long" })
    } else {
      // Older, show date
      return date.toLocaleDateString()
    }
  }
  
  // Group reactions by emoji
  const groupReactions = (reactions: ChatMessage["reactions"]) => {
    const grouped: Record<string, { count: number; userIds: string[] }> = {}
    
    reactions.forEach((reaction) => {
      if (!grouped[reaction.reaction]) {
        grouped[reaction.reaction] = { count: 0, userIds: [] }
      }
      
      grouped[reaction.reaction].count++
      grouped[reaction.reaction].userIds.push(reaction.userId)
    })
    
    return Object.entries(grouped).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      userIds: data.userIds,
      hasCurrentUser: data.userIds.includes(currentUserId),
    }))
  }
  
  // Handle message action menu toggle
  const toggleMessageActions = (messageId: string) => {
    if (showMessageActions === messageId) {
      setShowMessageActions(null)
    } else {
      setShowMessageActions(messageId)
      setShowReactionPicker(null)
    }
  }
  
  // Handle reaction picker toggle
  const toggleReactionPicker = (messageId: string) => {
    if (showReactionPicker === messageId) {
      setShowReactionPicker(null)
    } else {
      setShowReactionPicker(messageId)
      setShowMessageActions(null)
    }
  }
  
  // Handle adding a reaction
  const handleReaction = async (messageId: string, reaction: string) => {
    try {
      await onReaction(messageId, reaction)
      setShowReactionPicker(null)
    } catch (error) {
      console.error("Error adding reaction:", error)
    }
  }
  
  // Handle message deletion
  const handleDelete = async (messageId: string) => {
    try {
      await onDelete(messageId)
      setShowMessageActions(null)
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }
  
  // Render message content based on type
  const renderMessageContent = (message: ChatMessage) => {
    switch (message.contentType) {
      case "image":
        return (
          <div className="mt-1">
            <img
              src={message.metadata?.url}
              alt="Image"
              className="max-w-xs rounded-md"
            />
          </div>
        )
      case "file":
        return (
          <div className="mt-1 flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{message.metadata?.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(message.metadata?.size)}
              </div>
            </div>
            <a
              href={message.metadata?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              download
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </a>
          </div>
        )
      case "system":
        return (
          <div className="text-gray-500 dark:text-gray-400 italic">
            {message.content}
          </div>
        )
      default:
        return <div className="whitespace-pre-wrap">{message.content}</div>
    }
  }
  
  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size"
    
    const units = ["B", "KB", "MB", "GB"]
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }
  
  // Sort messages by date (newest first)
  const sortedMessages = [...messages].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )
  
  return (
    <div className="space-y-4">
      {sortedMessages.map((message) => {
        const isCurrentUser = message.userId === currentUserId
        const groupedReactions = groupReactions(message.reactions)
        
        return (
          <div
            key={message.id}
            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`relative max-w-[80%] ${
                isCurrentUser ? "order-1" : "order-2"
              }`}
            >
              <div
                className={`flex items-start ${
                  isCurrentUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* User avatar */}
                <div
                  className={`flex-shrink-0 ${
                    isCurrentUser ? "ml-3" : "mr-3"
                  }`}
                >
                  {message.user.profileImage ? (
                    <img
                      src={message.user.profileImage}
                      alt={`${message.user.firstName} ${message.user.lastName}`}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-600 dark:text-gray-300 font-medium">
                        {message.user.firstName?.[0] ||
                          message.user.lastName?.[0] ||
                          "?"}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Message content */}
                <div>
                  <div className="flex items-center mb-1">
                    <span className="font-medium">
                      {message.user.firstName} {message.user.lastName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      {formatMessageDate(message.createdAt)}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 italic">
                        (edited)
                      </span>
                    )}
                  </div>
                  
                  <div
                    className={`p-3 rounded-lg ${
                      isCurrentUser
                        ? "bg-blue-100 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {renderMessageContent(message)}
                  </div>
                  
                  {/* Reactions */}
                  {groupedReactions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {groupedReactions.map(({ emoji, count, hasCurrentUser }) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(message.id, emoji)}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                            hasCurrentUser
                              ? "bg-blue-100 dark:bg-blue-900/30"
                              : "bg-gray-100 dark:bg-gray-800"
                          }`}
                        >
                          <span className="mr-1">{emoji}</span>
                          <span>{count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Message actions */}
              <div
                className={`absolute top-0 ${
                  isCurrentUser ? "left-0 -translate-x-full" : "right-0 translate-x-full"
                } flex space-x-1`}
              >
                {/* Reaction button */}
                <button
                  onClick={() => toggleReactionPicker(message.id)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
                
                {/* Reply button */}
                <button
                  onClick={() => onReply(message)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </button>
                
                {/* More actions button */}
                <button
                  onClick={() => toggleMessageActions(message.id)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
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
                      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                    />
                  </svg>
                </button>
              </div>
              
              {/* Reaction picker */}
              {showReactionPicker === message.id && (
                <div
                  className={`absolute z-10 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex space-x-2 ${
                    isCurrentUser ? "right-0" : "left-0"
                  }`}
                >
                  {commonReactions.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(message.id, emoji)}
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Message actions menu */}
              {showMessageActions === message.id && (
                <div
                  className={`absolute z-10 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
                    isCurrentUser ? "right-0" : "left-0"
                  }`}
                >
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {isCurrentUser && message.contentType === "text" && (
                      <li>
                        <button
                          onClick={() => {
                            onEdit(message)
                            setShowMessageActions(null)
                          }}
                          className="px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Edit
                        </button>
                      </li>
                    )}
                    <li>
                      <button
                        onClick={() => {
                          onReply(message)
                          setShowMessageActions(null)
                        }}
                        className="px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                          />
                        </svg>
                        Reply
                      </button>
                    </li>
                    {(isCurrentUser || message.userId === currentUserId) && (
                      <li>
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="px-4 py-2 w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}