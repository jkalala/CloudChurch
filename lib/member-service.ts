export const MemberService = {
  // Attachments
  async getAttachments(memberId: string) {
    return fetch(`/api/member-attachments?memberId=${memberId}`).then(res => res.json())
  },
  async uploadAttachment(memberId: string, file: File) {
    const formData = new FormData()
    formData.append('memberId', memberId)
    formData.append('file', file)
    return fetch('/api/member-attachments', { method: 'POST', body: formData }).then(res => res.json())
  },
  async deleteAttachment(attachmentId: string) {
    return fetch(`/api/member-attachments?attachmentId=${attachmentId}`, { method: 'DELETE' }).then(res => res.json())
  },
  // Custom Fields
  async getCustomFields() {
    return fetch('/api/member-custom-fields').then(res => res.json())
  },
  async getMemberCustomFields(memberId: string) {
    return fetch(`/api/member-custom-fields?memberId=${memberId}`).then(res => res.json())
  },
  async setMemberCustomField(memberId: string, fieldId: string, value: string) {
    return fetch('/api/member-custom-fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, fieldId, value })
    }).then(res => res.json())
  },
  async deleteMemberCustomField(memberId: string, fieldId: string) {
    return fetch(`/api/member-custom-fields?memberId=${memberId}&fieldId=${fieldId}`, { method: 'DELETE' }).then(res => res.json())
  },
  // Tags
  async getTags(memberId?: string) {
    return fetch(`/api/member-tags${memberId ? `?memberId=${memberId}` : ''}`).then(res => res.json())
  },
  async addTag(memberId: string, tag: string) {
    return fetch('/api/member-tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId, tag })
    }).then(res => res.json())
  },
  async removeTag(memberId: string, tag: string) {
    return fetch(`/api/member-tags?memberId=${memberId}&tag=${tag}`, { method: 'DELETE' }).then(res => res.json())
  },
} 