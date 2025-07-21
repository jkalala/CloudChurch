"use client"

import { ChatChannel } from "../../../hooks/use-real-time-chat"

interface ChatHeaderProps {
  channel: ChatChannel | null
  onShowChannels: () => void
  onShowMembers: () => void
  showChannelButton?: boolean
  showMemberButton?: boolean
}

/**
 * Header component for the chat interface
 */
export function ChatHeader({
  channel,
  onShowChannels,
  onShowMembers,
  showChannelButton = true,
  showMemberButton = true,
}: ChatHeaderProps) {
  if (!channel) {
    return (
      <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <div className="animate-pulse h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    )
  }
  
  return (
    <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
      <div className="flex items-center">
        {/* Mobile channel button */}
        {showChannelButton && (
          <button
            onClick={onShowChannels}
            className="md:hidden mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </button>
        )}
        
        {/* Channel info */}
        <div>
          <h2 className="font-semibold text-lg flex items-center">
            {channel.type === "direct" ? (
              <span className="mr-2 text-blue-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            ) : channel.type === "resource" ? (
              <span className="mr-2 text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            ) : (
              <span className="mr-2 text-purple-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
            {channel.name}
          </h2>
          {channel.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
              {channel.description}
            </p>
          )}
        </div>
      </div>
      
      {/* Mobile member button */}
      {showMemberButton && (
        <button
          onClick={onShowMembers}
          className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </button>
      )}
    </div>
  )
}