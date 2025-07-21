"use client"

import { useState } from "react"
import { ChatMember } from "../../../hooks/use-real-time-chat"

interface ChatMemberListProps {
  members: ChatMember[]
  currentUserId: string
  onAddMember?: (userId: string, role?: string) => Promise<void>
  onRemoveMember?: (userId: string) => Promise<void>
}

/**
 * Component to display a list of chat channel members
 */
export function ChatMemberList({
  members,
  currentUserId,
  onAddMember,
  onRemoveMember,
}: ChatMemberListProps) {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [newMemberId, setNewMemberId] = useState("")
  const [newMemberRole, setNewMemberRole] = useState("member")
  
  // Check if current user is an admin or owner
  const isCurrentUserAdmin = members.some(
    (member) =>
      member.userId === currentUserId &&
      (member.role === "admin" || member.role === "owner")
  )
  
  // Handle adding a new member
  const handleAddMember = async () => {
    if (!newMemberId.trim() || !onAddMember) return
    
    try {
      await onAddMember(newMemberId, newMemberRole)
      
      // Reset form
      setNewMemberId("")
      setNewMemberRole("member")
      setShowAddMemberModal(false)
    } catch (error) {
      console.error("Error adding member:", error)
    }
  }
  
  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    }
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="font-semibold">Members</h2>
        {onAddMember && isCurrentUserAdmin && (
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title="Add member"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {members.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No members available
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <li
                key={member.id}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center min-w-0">
                  <div className="mr-3">
                    {member.user.profileImage ? (
                      <img
                        src={member.user.profileImage}
                        alt={`${member.user.firstName} ${member.user.lastName}`}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                          {member.user.firstName?.[0] || member.user.lastName?.[0] || "?"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {member.user.firstName} {member.user.lastName}
                      {member.userId === currentUserId && (
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                          (You)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(
                          member.role
                        )}`}
                      >
                        {member.role}
                      </span>
                    </div>
                  </div>
                </div>
                
                {onRemoveMember &&
                  isCurrentUserAdmin &&
                  member.userId !== currentUserId &&
                  member.role !== "owner" && (
                    <button
                      onClick={() => onRemoveMember(member.userId)}
                      className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      title="Remove member"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Add member modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Add Member</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={newMemberId}
                    onChange={(e) => setNewMemberId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Enter user ID"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role
                  </label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!newMemberId.trim()}
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}