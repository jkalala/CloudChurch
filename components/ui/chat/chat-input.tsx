"use client"

import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "../../../hooks/use-real-time-chat"

interface ChatInputProps {
  onSendMessage: (content: string, files: File[]) => Promise<void>
  onTyping: (isTyping: boolean) => void
  editingMessage: ChatMessage | null
  replyingTo: ChatMessage | null
  onCancelAction: () => void
}

/**
 * Input component for sending chat messages
 */
export function ChatInput({
  onSendMessage,
  onTyping,
  editingMessage,
  replyingTo,
  onCancelAction,
}: ChatInputProps) {
  const [content, setContent] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Set content when editing a message
  useEffect(() => {
    if (editingMessage) {
      setContent(editingMessage.content)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [editingMessage])
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    
    // Handle typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    onTyping(true)
    
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false)
    }, 3000)
  }
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prevFiles) => [...prevFiles, ...selectedFiles])
    }
  }
  
  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if ((!content.trim() && files.length === 0) || isUploading) return
    
    try {
      setIsUploading(true)
      await onSendMessage(content, files)
      setContent("")
      setFiles([])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsUploading(false)
    }
  }
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
    
    // Cancel on Escape
    if (e.key === "Escape" && (editingMessage || replyingTo)) {
      e.preventDefault()
      onCancelAction()
    }
  }
  
  return (
    <div>
      {/* Editing/Replying indicator */}
      {(editingMessage || replyingTo) && (
        <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md flex justify-between items-center">
          <div>
            {editingMessage ? (
              <span className="text-sm">
                <span className="font-medium">Editing message</span>
              </span>
            ) : (
              <span className="text-sm">
                <span className="font-medium">
                  Replying to {replyingTo?.user.firstName}{" "}
                  {replyingTo?.user.lastName}
                </span>
                : {replyingTo?.content.substring(0, 50)}
                {replyingTo?.content.length! > 50 ? "..." : ""}
              </span>
            )}
          </div>
          <button
            onClick={onCancelAction}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
        </div>
      )}
      
      {/* File previews */}
      {files.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative p-2 bg-gray-50 dark:bg-gray-800 rounded-md flex items-center"
            >
              {file.type.startsWith("image/") ? (
                <div className="h-12 w-12 mr-2 relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-full w-full object-cover rounded"
                  />
                </div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-gray-500 dark:text-gray-400"
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
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </div>
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
            </div>
          ))}
        </div>
      )}
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-end">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 border rounded-l-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
            placeholder={
              editingMessage
                ? "Edit your message..."
                : replyingTo
                ? "Type your reply..."
                : "Type a message..."
            }
            rows={1}
            style={{ minHeight: "42px", maxHeight: "120px" }}
          />
          
          {/* File attachment button */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
        </div>
        
        {/* Send button */}
        <button
          type="submit"
          disabled={(!content.trim() && files.length === 0) || isUploading}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-[42px]"
        >
          {isUploading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          )}
        </button>
      </form>
    </div>
  )
}

// Format file size
function formatFileSize(bytes: number) {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}