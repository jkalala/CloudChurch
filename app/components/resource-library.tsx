import { useState, useEffect, useRef } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Search, FileText, Video, Music, BookOpen, Download, Eye, Trash2, Share2, Users } from "lucide-react"
import { ResourceService } from "@/lib/resource-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { EditorContent, useEditor } from '@tiptap/react'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function ResourceLibrary() {
  const [tab, setTab] = useState("sermons")
  const [search, setSearch] = useState("")
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [versionModal, setVersionModal] = useState<{ open: boolean; resource: any | null }>({ open: false, resource: null })
  const [versions, setVersions] = useState<any[]>([])
  const [loadingVersions, setLoadingVersions] = useState(false)
  const [collabModal, setCollabModal] = useState<{ open: boolean; resource: any | null }>({ open: false, resource: null })
  const ydocRef = useRef<Y.Doc | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const editor = useEditor({
    extensions: [
      Collaboration.configure({ document: ydocRef.current || new Y.Doc() }),
      CollaborationCursor.configure({ provider: providerRef.current, user: { name: 'User', color: '#007bff' } })
    ],
    content: '',
    editable: true,
  })
  const [auditModal, setAuditModal] = useState<{ open: boolean; resource: any | null }>({ open: false, resource: null })
  const [auditLog, setAuditLog] = useState<any[]>([])
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [collabUsers, setCollabUsers] = useState<{ id: string; name: string; color: string }[]>([])
  const { user, userProfile } = useAuth()
  const [tagFilter, setTagFilter] = useState("")
  const [tagInput, setTagInput] = useState("")
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({})
  const [shareModal, setShareModal] = useState<{ open: boolean; resource: any | null }>({ open: false, resource: null })
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(false)
  const [permissions, setPermissions] = useState<string[]>(["view"])
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  const loadResources = async () => {
    setLoading(true)
    const type = tab === "sermons" ? "sermon" : tab === "media" ? "media" : "document"
    const data = tagFilter ? await ResourceService.getResourcesByTag(tagFilter) : await ResourceService.listResources(type)
    setResources(data)
    setLoading(false)
  }

  useEffect(() => {
    loadResources()
    // eslint-disable-next-line
  }, [tab])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const title = window.prompt("Enter resource title:")
    if (!title) return
    setUploading(true)
    const type = tab === "sermons" ? "sermon" : tab === "media" ? "media" : "document"
    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("type", type)
    await ResourceService.uploadResource(formData)
    setUploading(false)
    loadResources()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this resource?")) return
    await ResourceService.deleteResource(id)
    loadResources()
  }

  const handleOpenVersions = async (resource: any) => {
    setLoadingVersions(true)
    setVersionModal({ open: true, resource })
    const res = await fetch(`/api/resources?versions=1&resourceId=${resource.id}`)
    const data = await res.json()
    setVersions(data)
    setLoadingVersions(false)
  }

  const handleRestoreVersion = async (version: any) => {
    if (!version || !version.resource_id) return;
    // Update the main resource's file_url to the selected version's file_url
    const res = await fetch("/api/resources", {
      method: "POST",
      body: (() => {
        const form = new FormData();
        form.append("resourceId", version.resource_id);
        form.append("file", new Blob([])); // No new file, just restoring
        form.append("title", versionModal.resource?.title || "");
        form.append("type", versionModal.resource?.type || "document");
        form.append("uploadedBy", "restored");
        form.append("changeNote", `Restored to version ${version.version_number}`);
        form.append("fileUrl", version.file_url);
        return form;
      })(),
    });
    if (res.ok) {
      toast({ title: "Version Restored", description: `Resource restored to version ${version.version_number}` });
      setVersionModal(v => ({ ...v, open: false }));
      loadResources();
    } else {
      toast({ title: "Restore Failed", description: "Could not restore version." });
    }
  }

  const handleOpenCollab = (resource: any) => {
    setCollabModal({ open: true, resource })
    // Setup Yjs doc and provider
    ydocRef.current = new Y.Doc()
    providerRef.current = new WebsocketProvider('wss://demos.yjs.dev', `resource-${resource.id}`, ydocRef.current)
    if (editor) {
      editor.commands.setContent(resource.content || '')
    }
  }
  const handleCloseCollab = () => {
    setCollabModal({ open: false, resource: null })
    providerRef.current?.destroy()
    ydocRef.current?.destroy()
  }

  const handleOpenAudit = async (resource: any) => {
    setLoadingAudit(true)
    setAuditModal({ open: true, resource })
    const res = await fetch(`/api/resources?audit=1&resourceId=${resource.id}`)
    const data = await res.json()
    setAuditLog(data)
    setLoadingAudit(false)
  }

  const handleShare = async () => {
    if (!shareModal.resource) return
    await ResourceService.updateSharing(shareModal.resource.id, {
      shared_with: selectedUsers,
      is_public: isPublic,
      permissions
    })
    setShareModal({ open: false, resource: null })
    loadResources()
  }

  useEffect(() => {
    if (!editor || !providerRef.current) return
    const awareness = providerRef.current.awareness
    const userId = user?.id || Math.random().toString(36).slice(2)
    const userName = userProfile?.first_name && userProfile?.last_name ? `${userProfile.first_name} ${userProfile.last_name}` : user?.email || "Guest"
    const userColor = `hsl(${Math.floor(Math.random() * 360)},70%,60%)`
    awareness.setLocalStateField('user', { id: userId, name: userName, color: userColor })
    const onChange = () => {
      const users = Array.from(awareness.getStates().values())
        .map((s: any) => s.user)
        .filter(Boolean)
      setCollabUsers(users)
    }
    awareness.on('change', onChange)
    onChange()
    return () => awareness.off('change', onChange)
  }, [editor, user, userProfile])

  useEffect(() => {
    if (shareModal.open) {
      setLoadingUsers(true)
      fetch('/api/users')
        .then(res => res.json())
        .then(data => setUsers(data))
        .finally(() => setLoadingUsers(false))
    }
  }, [shareModal.open])

  // Helper function to check permissions
  const hasPermission = (resource: any, permission: string) => {
    if (resource.is_public) return true
    if (userProfile?.role === 'admin') return true
    return resource.shared_with?.includes(user?.id) && resource.permissions?.includes(permission)
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Resource Library</h2>
          <p className="text-gray-600">Sermons, media, and document management for your church</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.mp3,.mp4,.doc,.docx,.jpg,.jpeg,.png,.ppt,.pptx"
          />
          <Button className="flex items-center gap-2" onClick={handleUploadClick} disabled={uploading}>
            <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="sermons"><BookOpen className="h-4 w-4 mr-1" /> Sermons</TabsTrigger>
          <TabsTrigger value="media"><Video className="h-4 w-4 mr-1" /> Media</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-1" /> Documents</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={e => setTagFilter(e.target.value)}
            className="max-w-xs"
          />
          <Button size="sm" variant="outline" onClick={loadResources}>Search</Button>
          {tagFilter && <Button size="sm" variant="ghost" onClick={() => { setTagFilter(""); loadResources(); }}>Clear</Button>}
        </div>
        <TabsContent value="sermons">
          {loading ? <div>Loading...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.filter(s => s.title.toLowerCase().includes(search.toLowerCase())).map(sermon => (
                <Card key={sermon.id}>
                  <CardHeader>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {sermon.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button size="icon" variant="ghost" className="p-0 h-4 w-4" onClick={async () => { await ResourceService.removeTagFromResource(sermon.id, tag); loadResources(); }}>
                            ×
                          </Button>
                        </Badge>
                      ))}
                      <form onSubmit={async e => { e.preventDefault(); const val = tagInputs[sermon.id]?.trim(); if (val) { await ResourceService.addTagToResource(sermon.id, val); setTagInputs(inputs => ({ ...inputs, [sermon.id]: "" })); loadResources(); } }}>
                        <Input
                          value={tagInputs[sermon.id] || ""}
                          onChange={e => setTagInputs(inputs => ({ ...inputs, [sermon.id]: e.target.value }))}
                          placeholder="Add tag"
                          className="inline-block w-20 h-6 text-xs px-1 py-0.5"
                        />
                      </form>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" /> {sermon.title}
                    </CardTitle>
                    <div className="text-sm text-gray-500">{sermon.speaker} {sermon.date ? `• ${sermon.date}` : null}</div>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Preview</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Download</Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenVersions(sermon)}>Version History</Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenAudit(sermon)}>Audit Log</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setShareModal({ open: true, resource: sermon })
                      setSelectedUsers(sermon.shared_with || [])
                      setIsPublic(sermon.is_public || false)
                      setPermissions(sermon.permissions || ["view"])
                    }}>
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(sermon.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="media">
          {loading ? <div>Loading...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).map(media => (
                <Card key={media.id}>
                  <CardHeader>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {media.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button size="icon" variant="ghost" className="p-0 h-4 w-4" onClick={async () => { await ResourceService.removeTagFromResource(media.id, tag); loadResources(); }}>
                            ×
                          </Button>
                        </Badge>
                      ))}
                      <form onSubmit={async e => { e.preventDefault(); const val = tagInputs[media.id]?.trim(); if (val) { await ResourceService.addTagToResource(media.id, val); setTagInputs(inputs => ({ ...inputs, [media.id]: "" })); loadResources(); } }}>
                        <Input
                          value={tagInputs[media.id] || ""}
                          onChange={e => setTagInputs(inputs => ({ ...inputs, [media.id]: e.target.value }))}
                          placeholder="Add tag"
                          className="inline-block w-20 h-6 text-xs px-1 py-0.5"
                        />
                      </form>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      {media.mediaType === "video" ? <Video className="h-5 w-5 text-purple-600" /> : <Music className="h-5 w-5 text-green-600" />} {media.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Preview</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Download</Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenVersions(media)}>Version History</Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenAudit(media)}>Audit Log</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setShareModal({ open: true, resource: media })
                      setSelectedUsers(media.shared_with || [])
                      setIsPublic(media.is_public || false)
                      setPermissions(media.permissions || ["view"])
                    }}>
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(media.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="documents">
          {loading ? <div>Loading...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.filter(d => d.title.toLowerCase().includes(search.toLowerCase())).map(doc => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {doc.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <Button size="icon" variant="ghost" className="p-0 h-4 w-4" onClick={async () => { await ResourceService.removeTagFromResource(doc.id, tag); loadResources(); }}>
                            ×
                          </Button>
                        </Badge>
                      ))}
                      <form onSubmit={async e => { e.preventDefault(); const val = tagInputs[doc.id]?.trim(); if (val) { await ResourceService.addTagToResource(doc.id, val); setTagInputs(inputs => ({ ...inputs, [doc.id]: "" })); loadResources(); } }}>
                        <Input
                          value={tagInputs[doc.id] || ""}
                          onChange={e => setTagInputs(inputs => ({ ...inputs, [doc.id]: e.target.value }))}
                          placeholder="Add tag"
                          className="inline-block w-20 h-6 text-xs px-1 py-0.5"
                        />
                      </form>
                    </div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-600" /> {doc.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex gap-2">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1" /> Preview</Button>
                    <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Download</Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenVersions(doc)}>Version History</Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenCollab(doc)}
                      disabled={!hasPermission(doc, 'collaborate')}
                    >
                      Edit Collaboratively
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenAudit(doc)}>Audit Log</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setShareModal({ open: true, resource: doc })
                      setSelectedUsers(doc.shared_with || [])
                      setIsPublic(doc.is_public || false)
                      setPermissions(doc.permissions || ["view"])
                    }}>
                      <Share2 className="h-4 w-4 mr-1" /> Share
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(doc.id)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      {versionModal.open && (
        <Dialog open={versionModal.open} onOpenChange={open => setVersionModal(v => ({ ...v, open }))}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Version History for {versionModal.resource?.title}</DialogTitle>
            </DialogHeader>
            {loadingVersions ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-4">
                {versions.map((v) => (
                  <div key={v.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">Version {v.version_number}</div>
                      <div className="text-xs text-muted-foreground">Uploaded by: {v.uploaded_by || 'Unknown'} on {new Date(v.uploaded_at).toLocaleString()}</div>
                      {v.change_note && <div className="text-xs italic">{v.change_note}</div>}
                    </div>
                    <div className="flex gap-2">
                      <a href={v.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="outline">Download</Button>
                      </a>
                      <Button size="sm" variant="ghost" onClick={() => handleRestoreVersion(v)}>Restore</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      {collabModal.open && (
        <Dialog open={collabModal.open} onOpenChange={handleCloseCollab}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Collaborative Editing: {collabModal.resource?.title}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {collabUsers.map(u => (
                <div key={u.id} className="flex items-center gap-1">
                  <Avatar style={{ background: u.color }} className="w-6 h-6 text-xs">
                    <AvatarFallback>{u.name.slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs" style={{ color: u.color }}>{u.name}</span>
                </div>
              ))}
              {collabUsers.length > 0 && <span className="ml-2 text-xs text-muted-foreground">editing now</span>}
            </div>
            <div className="border rounded-lg p-4 bg-white">
              <EditorContent editor={editor} />
            </div>
          </DialogContent>
        </Dialog>
      )}
      {auditModal.open && (
        <Dialog open={auditModal.open} onOpenChange={open => setAuditModal({ open, resource: open ? auditModal.resource : null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Audit Log for {auditModal.resource?.title}</DialogTitle>
            </DialogHeader>
            {loadingAudit ? (
              <div>Loading...</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {auditLog.length === 0 ? (
                  <div>No audit log entries found.</div>
                ) : (
                  auditLog.map((log, i) => (
                    <div key={i} className="border-b pb-2 mb-2">
                      <div><b>Action:</b> {log.action}</div>
                      <div><b>User:</b> {log.user_email || log.user_id}</div>
                      <div><b>Time:</b> {new Date(log.timestamp).toLocaleString()}</div>
                      <div><b>Details:</b> {log.details}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      {/* Sharing Dialog */}
      <Dialog open={shareModal.open} onOpenChange={open => setShareModal({ open, resource: open ? shareModal.resource : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {shareModal.resource?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              <Label>Make Public</Label>
            </div>
            <div className="space-y-2">
              <Label>Share with specific users</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    {loadingUsers ? (
                      "Loading users..."
                    ) : selectedUsers.length === 0 ? (
                      "Select users..."
                    ) : (
                      `${selectedUsers.length} user(s) selected`
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search users..." />
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {users.map(user => (
                        <CommandItem
                          key={user.id}
                          onSelect={() => {
                            setSelectedUsers(current => 
                              current.includes(user.id)
                                ? current.filter(id => id !== user.id)
                                : [...current, user.id]
                            )
                          }}
                        >
                          <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </div>
                          {selectedUsers.includes(user.id) && (
                            <span className="ml-auto">✓</span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex gap-2">
                {["view", "edit", "collaborate"].map(perm => (
                  <Button
                    key={perm}
                    variant={permissions.includes(perm) ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (permissions.includes(perm)) {
                        setPermissions(perms => perms.filter(p => p !== perm))
                      } else {
                        setPermissions(perms => [...perms, perm])
                      }
                    }}
                  >
                    {perm.charAt(0).toUpperCase() + perm.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareModal({ open: false, resource: null })}>Cancel</Button>
            <Button onClick={handleShare}>Share</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 