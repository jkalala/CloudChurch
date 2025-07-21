"use client"

import { useState, useRef, useEffect } from "react"
import { useRealTimeChat, ChatMessage, ChatChannel, ChatMember } from "../../../hooks/use-real-time-chat"
import { ChatChannelList } from "./chat-channel-list"
import { ChatMessageList } from "./chat-message-list"
import { ChatInput } from "./chat-input"
import { ChatHeader } from "./chat-header"
import { ChatMemberList } from "./chat-member-list"
import { ChatChannelType } from "../../../lib/database-types"

interface ChatSystemProps {
  initialChannelId?: string
  showChannelList?: boolean
  showMemberList?: boolean
  allowChannelCreation?: boolean
  allowMemberManagement?: boolean
  className?: string
}

/**
 * A complete chat system with channels, messages, and members
 */
export function ChatSystem({
  initialChannelId,
  showChannelList = true,
  showMemberList = true,
  allowChannelCreation = true,
  allowMemberManagement = true,
  className = "",
}: ChatSystemProps) {
  const [state, actions] = useRealTimeChat(initialChannelId)
  const [showNewChannelModal, setShowNewChannelModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [newChannelType, setNewChannelType] = useState<ChatChannelType>("group")
  const [newChannelDescription, setNewChannelDescription] = useState("")
  const [showMobileChannelList, setShowMobileChannelList] = useState(false)
  const [showMobileMemberList, setShowMobileMemberList] = useState(false)
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [state.messages])
  
  // Handle creating a new channel
  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return
    
    try {
      await actions.createChannel(
        newChannelName,
        newChannelType,
        newChannelDescription || undefined
      )
      
      // Reset form
      setNewChannelName("")
      setNewChannelType("group")
      setNewChannelDescription("")
      setShowNewChannelModal(false)
    } catch (error) {
      console.error("Error creating channel:", error)
    }
  }
  
  // Handle sending a message
  const handleSendMessage = async (content: string, files: File[]) => {
    if (!content.trim() && files.length === 0) return
    
    try {
      // Handle files if any
      if (files.length > 0) {
        for (const file of files) {
          const fileData = await actions.uploadFile(file)
          
          // Determine content type based on file type
          const contentType = file.type.startsWith("image/")
            ? "image"
            : "file"
          
          await actions.sendMessage(
            contentType === "image" ? "" : file.name,
            contentType,
            replyingTo?.id,
            {
              ...fileData,
              url: fileData.url,
            }
          )
        }
      }
      
      // Send text message if there's content
      if (content.trim()) {
        if (editingMessage) {
          await actions.editMessage(editingMessage.id, content)
          setEditingMessage(null)
        } else {
          await actions.sendMessage(content, "text", replyingTo?.id)
          setReplyingTo(null)
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }
  
  // Handle editing a message
  const handleEditMessage = (message: ChatMessage) => {
    setEditingMessage(message)
    setReplyingTo(null)
  }
  
  // Handle replying to a message
  const handleReplyMessage = (message: ChatMessage) => {
    setReplyingTo(message)
    setEditingMessage(null)
  }
  
  // Handle canceling edit/reply
  const handleCancelAction = () => {
    setEditingMessage(null)
    setReplyingTo(null)
  }
  
  return (
    <div className={`flex h-full ${className}`}>
      {/* Channel list (desktop) */}
      {showChannelList && (
        <div className="hidden md:block w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ChatChannelList
            channels={state.channels}
            currentChannel={state.currentChannel}
            onSelectChannel={actions.switchChannel}
            onCreateChannel={() => setShowNewChannelModal(true)}
            allowChannelCreation={allowChannelCreation}
          />
        </div>
      )}
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Chat header */}
        <ChatHeader
          channel={state.currentChannel}
          onShowChannels={() => setShowMobileChannelList(true)}
          onShowMembers={() => setShowMobileMemberList(true)}
          showChannelButton={showChannelList}
          showMemberButton={showMemberList}
        />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {state.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : state.messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <>
              {state.hasMoreMessages && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={actions.loadMoreMessages}
                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Load more messages
                  </button>
                </div>
              )}
              
              <ChatMessageList
                messages={state.messages}
                currentUserId={state.currentChannel?.createdBy || ""}
                onReaction={actions.addReaction}
                onEdit={handleEditMessage}
                onReply={handleReplyMessage}
                onDelete={actions.deleteMessage}
              />
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Typing indicator */}
        {state.typingUsers.length > 0 && (
          <div className="px-4 py-1 text-sm text-gray-500 dark:text-gray-400">
            {state.typingUsers.length === 1
              ? `${state.typingUsers[0].userName} is typing...`
              : `${state.typingUsers.length} people are typing...`}
          </div>
        )}
        
        {/* Chat input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <ChatInput
            onSendMessage={handleSendMessage}
            onTyping={(isTyping) => actions.setTyping(isTyping)}
            editingMessage={editingMessage}
            replyingTo={replyingTo}
            onCancelAction={handleCancelAction}
          />
        </div>
      </div>
      
      {/* Member list (desktop) */}
      {showMemberList && (
        <div className="hidden md:block w-64 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <ChatMemberList
            members={state.members}
            currentUserId={state.currentChannel?.createdBy || ""}
            onAddMember={allowMemberManagement ? actions.addMember : undefined}
            onRemoveMember={allowMemberManagement ? actions.removeMember : undefined}
          />
        </div>
      )}
      
      {/* Mobile channel list */}
      {showMobileChannelList && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex md:hidden">
          <div className="w-3/4 max-w-xs bg-white dark:bg-gray-800 h-full overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">Channels</h2>
              <button
                onClick={() => setShowMobileChannelList(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <ChatChannelList
              channels={state.channels}
              currentChannel={state.currentChannel}
              onSelectChannel={(channelId) => {
                actions.switchChannel(channelId)
                setShowMobileChannelList(false)
              }}
              onCreateChannel={() => {
                setShowNewChannelModal(true)
                setShowMobileChannelList(false)
              }}
              allowChannelCreation={allowChannelCreation}
            />
          </div>
          <div
            className="flex-1"
            onClick={() => setShowMobileChannelList(false)}
          ></div>
        </div>
      )}
      
      {/* Mobile member list */}
      {showMobileMemberList && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex md:hidden">
          <div
            className="flex-1"
            onClick={() => setShowMobileMemberList(false)}
          ></div>
          <div className="w-3/4 max-w-xs bg-white dark:bg-gray-800 h-full overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold">Members</h2>
              <button
                onClick={() => setShowMobileMemberList(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <ChatMemberList
              members={state.members}
              currentUserId={state.currentChannel?.createdBy || ""}
              onAddMember={allowMemberManagement ? actions.addMember : undefined}
              onRemoveMember={allowMemberManagement ? actions.removeMember : undefined}
            />
          </div>
        </div>
      )}
      
      {/* New channel modal */}
      {showNewChannelModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Channel</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Channel Name
                  </label>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter channel name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Channel Type
                  </label>
                  <select
                    value={newChannelType}
                    onChange={(e) => setNewChannelType(e.target.value as ChatChannelType)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="group">Group</option>
                    <option value="direct">Direct Message</option>
                    <option value="resource">Resource</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter channel description"
                    rows={3}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewChannelModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChannel}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!newChannelName.trim()}
                >
                  Create Channel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}