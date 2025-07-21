"use client"

import { useState } from "react"
import { VersionHistoryViewer } from "../../components/ui/collaboration/version-history-viewer"
import { Version } from "../../lib/types/version-control"
import { useVersionControl } from "../../hooks/use-version-control"

export default function VersionControlDemoPage() {
  const [resourceId, setResourceId] = useState("demo-resource")
  const [content, setContent] = useState<string>("")
  const [comment, setComment] = useState("")
  const [tag, setTag] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  const {
    state,
    createVersion,
  } = useVersionControl<string>({
    resourceId,
    resourceType: "demo",
    initialLoad: true,
  })
  
  // Handle creating a new version
  const handleCreateVersion = async () => {
    if (!content.trim()) return
    
    try {
      setIsSaving(true)
      await createVersion(
        content,
        comment || undefined,
        tag ? [tag] : undefined
      )
      
      // Reset form
      setContent("")
      setComment("")
      setTag("")
    } catch (error) {
      console.error("Error creating version:", error)
    } finally {
      setIsSaving(false)
    }
  }
  
  // Handle selecting a version
  const handleVersionSelect = (version: Version<string>) => {
    setContent(version.content)
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Version Control System</h1>
      
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content editor */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Create New Version</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-md h-40"
                placeholder="Enter content for the new version"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Comment (optional)
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Describe the changes in this version"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Tag (optional)
              </label>
              <input
                type="text"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Add a tag (e.g., 'published', 'draft')"
              />
            </div>
            
            <div className="pt-2">
              <button
                onClick={handleCreateVersion}
                disabled={!content.trim() || isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save Version"}
              </button>
            </div>
          </div>
        </div>
        
        {/* Version history */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Version History</h2>
          
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300">
              {state.versions.length} version{state.versions.length !== 1 ? "s" : ""} available
            </p>
          </div>
          
          <VersionHistoryViewer
            resourceId={resourceId}
            resourceType="demo"
            onVersionSelect={handleVersionSelect}
          />
        </div>
      </div>
    </div>
  )
}