"use client"

import { ChatChannel } from "../../../hooks/use-real-time-chat"

interface ChatChannelListProps {
  channels: ChatChannel[]
  currentChannel: ChatChannel | null
  onSelectChannel: (channelId: string) => void
  onCreateChannel: () => void
  allowChannelCreation?: boolean
}

/**
 * Component to display a list of chat channels
 */
export function ChatChannelList({
  channels,
  currentChannel,
  onSelectChannel,
  onCreateChannel,
  allowChannelCreation = true,
}: ChatChannelListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold">Channels</h2>
        {allowChannelCreation && (
          <button
            onClick={onCreateChannel}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Create new channel"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {channels.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No channels available
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {channels.map((channel) => (
              <li key={channel.id}>
                <button
                  onClick={() => onSelectChannel(channel.id)}
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    currentChannel?.id === channel.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="mr-3">
                    {channel.type === "direct" ? (
                      <span className="text-blue-500">
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
                      <span className="text-green-500">
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
                      <span className="text-purple-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{channel.name}</div>
                    {channel.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {channel.description}
                      </div>
                    )}
                  </div>
                  {channel.unreadCount > 0 && (
                    <div className="ml-2 bg-blue-500 text-white text-xs font-semibold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                      {channel.unreadCount}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}