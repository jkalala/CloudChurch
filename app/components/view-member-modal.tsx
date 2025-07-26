"use client"

import { DialogShell } from "./_shared/dialog-shell"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Mail, Phone, MapPin, User, Briefcase, Heart, MessageSquare } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"
import { MemberService } from "@/lib/member-service"
import { QRCodeCanvas } from "qrcode.react"
// @ts-ignore
import html2canvas from 'html2canvas'
import { DatabaseService } from "@/lib/database"
import { MemberAuditLogModal } from "./member-audit-log-modal";

interface ViewMemberModalProps {
  memberId: string
}

export function ViewMemberModal({ memberId }: ViewMemberModalProps) {
  const [member, setMember] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // --- All hooks must be called before any conditional returns ---
  const [tab, setTab] = useState<'attachments' | 'fields' | 'tags'>('attachments')
  const [attachments, setAttachments] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [customFields, setCustomFields] = useState<any[]>([])
  const [memberFields, setMemberFields] = useState<any[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const dropRef = useRef<HTMLDivElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [open, setOpen] = useState(true)
  const [showCard, setShowCard] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [showAuditLog, setShowAuditLog] = useState(false);

  useEffect(() => {
    setLoading(true)
    DatabaseService.getMemberById(memberId).then(m => {
      setMember(m)
      setLoading(false)
    })
  }, [memberId])

  useEffect(() => {
    if (memberId) {
      MemberService.getAttachments(memberId).then((r: any) => setAttachments(r.attachments || []))
      MemberService.getCustomFields().then((r: any) => setCustomFields(r.customFields || []))
      MemberService.getMemberCustomFields(memberId).then((r: any) => setMemberFields(r.fields || []))
      MemberService.getTags(memberId).then((r: any) => setTags(r.tags || []))
      MemberService.getTags().then((r: any) => setAllTags(r.tags || []))
    }
  }, [memberId])

  if (loading) return (
    <DialogShell title="Member Details" isOpen={open} onClose={() => setOpen(false)}>
      <DialogContent className="sm:max-w-2xl">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading member details...</p>
          </div>
        </div>
      </DialogContent>
    </DialogShell>
  );
  
  if (!member) return (
    <DialogShell title="Member Details" isOpen={open} onClose={() => setOpen(false)}>
      <DialogContent className="sm:max-w-2xl">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-red-600">Member not found.</p>
            <Button onClick={() => setOpen(false)} className="mt-4">Close</Button>
          </div>
        </div>
      </DialogContent>
    </DialogShell>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const handleExportData = () => {
    if (!member) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(member, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `member-${member.id}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <DialogShell title="Member Details" isOpen={open} onClose={() => setOpen(false)}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Membro</DialogTitle>
          <DialogDescription>Informações completas do membro</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={member.profile_image || "/placeholder.svg"}
                alt={member.first_name + " " + member.last_name}
              />
              <AvatarFallback className="text-lg">
                {member.first_name[0]}
                {member.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">
                {member.first_name} {member.last_name}
              </h3>
              <p className="text-gray-600">{member.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusColor(member.member_status)}>
                  {member.member_status === "active"
                    ? "Ativo"
                    : member.member_status === "inactive"
                      ? "Inativo"
                      : "Pendente"}
                </Badge>
                {member.department && <Badge variant="secondary">{member.department}</Badge>}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Informações de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{member.email}</span>
                </div>
              )}
              {member.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{member.phone}</span>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{member.address}</span>
                </div>
              )}
              {member.emergency_contact && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-red-400" />
                  <span>Emergência: {member.emergency_contact}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {member.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    Nascimento: {new Date(member.date_of_birth).toLocaleDateString("pt-BR")}
                    {calculateAge(member.date_of_birth) && ` (${calculateAge(member.date_of_birth)} anos)`}
                  </span>
                </div>
              )}
              {member.gender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>Gênero: {member.gender === "male" ? "Masculino" : "Feminino"}</span>
                </div>
              )}
              {member.marital_status && (
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-gray-400" />
                  <span>
                    Estado Civil:{" "}
                    {member.marital_status === "single"
                      ? "Solteiro"
                      : member.marital_status === "married"
                        ? "Casado"
                        : member.marital_status === "divorced"
                          ? "Divorciado"
                          : "Viúvo"}
                  </span>
                </div>
              )}
              {member.occupation && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400" />
                  <span>Profissão: {member.occupation}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Church Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informações da Igreja
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Membro desde: {new Date(member.join_date).toLocaleDateString("pt-BR")}</span>
              </div>
              {member.baptism_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span>Batizado em: {new Date(member.baptism_date).toLocaleDateString("pt-BR")}</span>
                </div>
              )}
              {member.department && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>Departamento: {member.department}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {member.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{member.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* --- New Tabs Section --- */}
          <Tabs value={tab} onValueChange={v => setTab(v as 'attachments' | 'fields' | 'tags')} className="mt-6">
            <TabsList>
              <TabsTrigger value="attachments">Anexos</TabsTrigger>
              <TabsTrigger value="fields">Campos Personalizados</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>
            <TabsContent value="attachments">
              <div
                ref={dropRef}
                className={`mb-2 flex items-center gap-2 border-2 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-dashed border-gray-300'} rounded p-4 transition-colors`}
                onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                onDragLeave={e => { e.preventDefault(); setDragActive(false) }}
                onDrop={async e => {
                  e.preventDefault(); setDragActive(false)
                  const files = Array.from(e.dataTransfer.files)
                  for (const file of files) {
                    setUploading(true)
                    setUploadProgress(0)
                    // Use XMLHttpRequest for progress
                    await new Promise<void>((resolve, reject) => {
                      const xhr = new XMLHttpRequest()
                      xhr.open('POST', '/api/member-attachments')
                      xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) setUploadProgress(Math.round((event.loaded / event.total) * 100))
                      }
                      xhr.onload = () => { setUploadProgress(null); setUploading(false); resolve() }
                      xhr.onerror = () => { setUploadProgress(null); setUploading(false); reject() }
                      const formData = new FormData()
                      formData.append('memberId', memberId)
                      formData.append('file', file)
                      xhr.send(formData)
                    })
                  }
                  MemberService.getAttachments(memberId).then((r: any) => setAttachments(r.attachments || []))
                }}
              >
                <span className="text-gray-500">Arraste arquivos aqui ou clique para selecionar</span>
                {uploadProgress !== null && <span className="ml-2 text-blue-600">{uploadProgress}%</span>}
                <input type="file" id="member-attachment-upload" style={{ display: 'none' }} onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  setUploading(true)
                  await MemberService.uploadAttachment(memberId, file)
                  setUploading(false)
                  MemberService.getAttachments(memberId).then((r: any) => setAttachments(r.attachments || []))
                }} />
                <Button size="sm" onClick={() => document.getElementById('member-attachment-upload')?.click()} disabled={uploading}>
                  {uploading ? 'Enviando...' : 'Upload Anexo'}
                </Button>
              </div>
              <ul className="space-y-2">
                {attachments.map(att => (
                  <li key={att.id} className="flex items-center gap-2 border rounded p-2">
                    <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate">{att.file_name}</a>
                    <span className="text-xs text-gray-500">{Math.round((att.file_size || 0)/1024)} KB</span>
                    <Button size="sm" variant="destructive" onClick={async () => {
                      await MemberService.deleteAttachment(att.id)
                      MemberService.getAttachments(memberId).then(r => setAttachments(r.attachments || []))
                    }}>Excluir</Button>
                  </li>
                ))}
                {attachments.length === 0 && <li className="text-sm text-gray-500">Nenhum anexo.</li>}
              </ul>
            </TabsContent>
            <TabsContent value="fields">
              <ul className="space-y-2">
                {customFields.map(field => {
                  const value = memberFields.find((f: any) => f.field_id === field.id)?.value || ""
                  return (
                    <li key={field.id} className="flex items-center gap-2">
                      <span className="w-48 font-medium">{field.name}</span>
                      <Input
                        value={value}
                        onChange={e => {
                          MemberService.setMemberCustomField(memberId, field.id, e.target.value)
                          setMemberFields(f => f.map((mf: any) => mf.field_id === field.id ? { ...mf, value: e.target.value } : mf))
                        }}
                        className="flex-1"
                      />
                      {value && (
                        <Button size="sm" variant="outline" onClick={async () => {
                          await MemberService.deleteMemberCustomField(memberId, field.id)
                          MemberService.getMemberCustomFields(memberId).then(r => setMemberFields(r.fields || []))
                        }}>Limpar</Button>
                      )}
                    </li>
                  )
                })}
                {customFields.length === 0 && <li className="text-sm text-gray-500">Nenhum campo personalizado.</li>}
              </ul>
            </TabsContent>
            <TabsContent value="tags">
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <Button size="sm" variant="ghost" onClick={async () => {
                      await MemberService.removeTag(memberId, tag)
                      MemberService.getTags(memberId).then((r: any) => setTags(r.tags || []))
                    }}>x</Button>
                  </Badge>
                ))}
              </div>
              <form className="flex gap-2" onSubmit={async e => {
                e.preventDefault()
                if (!newTag.trim()) return
                await MemberService.addTag(memberId, newTag.trim())
                setNewTag("")
                MemberService.getTags(memberId).then(r => setTags(r.tags || []))
              }}>
                <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Adicionar tag..." className="w-48" list="all-member-tags" />
                <datalist id="all-member-tags">
                  {allTags.map(tag => <option key={tag} value={tag} />)}
                </datalist>
                <Button size="sm" type="submit">Adicionar</Button>
              </form>
            </TabsContent>
          </Tabs>
          {/* --- End Tabs Section --- */}
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
      <div className="flex flex-col items-center gap-2 my-4">
        <QRCodeCanvas value={`${window.location.origin}/checkin/${member.id}`} size={96} />
        <Button size="sm" variant="outline" onClick={() => setShowCard(true)}>Gerar Carteirinha</Button>
      </div>
      {/* Membership Card Modal */}
      <Dialog open={showCard} onOpenChange={setShowCard}>
        <DialogContent className="max-w-md p-0 bg-gray-100">
          <div ref={cardRef} className="bg-white rounded shadow p-6 flex flex-col items-center gap-4 w-[340px]">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500">
              <img src={member.profile_image || '/placeholder-user.jpg'} alt="Foto" className="w-full h-full object-cover" />
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{member.first_name} {member.last_name}</div>
              <div className="text-sm text-gray-600">ID: {member.id}</div>
              <div className="text-sm text-gray-600">{member.email}</div>
              <div className="text-sm text-gray-600">{member.phone}</div>
            </div>
            <QRCodeCanvas value={`${window.location.origin}/checkin/${member.id}`} size={128} />
            <div className="text-xs text-gray-400 mt-2">Apresente este QR code para check-in</div>
          </div>
          <div className="flex gap-2 justify-center mt-4">
            <Button size="sm" variant="outline" onClick={() => window.print()}>Imprimir</Button>
            <Button size="sm" variant="default" onClick={async () => {
              if (!cardRef.current) return
              const canvas = await html2canvas(cardRef.current)
              const link = document.createElement('a')
              link.download = `carteirinha-${member.id}.png`
              link.href = canvas.toDataURL()
              link.click()
            }}>Download Card</Button>
            <Button size="sm" variant="outline" onClick={handleExportData}>
              Export Data
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAuditLog(true)}>
              View Change History
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <MemberAuditLogModal isOpen={showAuditLog} onClose={() => setShowAuditLog(false)} memberId={memberId} />
    </DialogShell>
  )
}

export default ViewMemberModal
