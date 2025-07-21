export interface Resource {
  id: string
  type: string
  title: string
  file: string
  date?: string
  speaker?: string
  mediaType?: string
  tags?: string[]
  [key: string]: any
}

export const ResourceService = {
  async listResources(type?: string) {
    const url = type ? `/api/resources?type=${type}` : "/api/resources"
    const res = await fetch(url)
    return res.ok ? res.json() : []
  },

  async uploadResource(data: any) {
    let options: any = { method: "POST" }
    if (typeof window !== "undefined" && data instanceof FormData) {
      options.body = data
      // Let browser set Content-Type for FormData
    } else {
      options.headers = { "Content-Type": "application/json" }
      options.body = JSON.stringify(data)
    }
    const res = await fetch("/api/resources", options)
    return res.ok ? res.json() : null
  },

  async deleteResource(id: string) {
    const res = await fetch(`/api/resources?id=${id}`, {
      method: "DELETE",
    })
    return res.ok
  },

  getResourceUrl(resource: any) {
    return resource?.file_url || ""
  },

  async getResourcesByTag(tag: string) {
    // Fetch resources with a given tag
    const res = await fetch(`/api/resources?tag=${encodeURIComponent(tag)}`)
    return res.json()
  },
  async addTagToResource(resourceId: string, tag: string) {
    return fetch(`/api/resources`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId, tag, action: "addTag" })
    })
  },
  async removeTagFromResource(resourceId: string, tag: string) {
    return fetch(`/api/resources`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resourceId, tag, action: "removeTag" })
    })
  },
  async updateSharing(resourceId: string, { shared_with, is_public, permissions }: { shared_with: string[]; is_public: boolean; permissions: string[] }) {
    return fetch(`/api/resources`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceId,
        action: "share",
        shared_with,
        is_public,
        permissions
      })
    }).then(res => res.json())
  },
} 