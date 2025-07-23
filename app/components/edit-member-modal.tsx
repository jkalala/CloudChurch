"use client"

import type React from "react"
import { DialogShell } from "./_shared/dialog-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Props {
  memberId: string
  isOpen: boolean
  onClose: () => void
}

export function EditMemberModal({ memberId, isOpen, onClose }: Props) {
  const member = {
    id: memberId,
    name: "Sample Member",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    address: "123 Main St",
    gender: "male",
    marital_status: "single",
    occupation: "Engineer",
    department: "IT",
    emergency_contact: "Jane Doe",
    notes: "Sample notes",
    member_status: "active" as const,
  }

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    gender: "",
    marital_status: "",
    occupation: "",
    department: "",
    emergency_contact: "",
    notes: "",
    member_status: "active" as const,
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFormData({
      first_name: member.first_name || "",
      last_name: member.last_name || "",
      email: member.email || "",
      phone: member.phone || "",
      address: member.address || "",
      gender: member.gender || "",
      marital_status: member.marital_status || "",
      occupation: member.occupation || "",
      department: member.department || "",
      emergency_contact: member.emergency_contact || "",
      notes: member.notes || "",
      member_status: member.member_status || "active",
    })
  }, [memberId])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // TODO: Call the real update member API here
      // await updateMember(memberId, formData)
      // Simulate success
      setTimeout(() => {}, 500)
    } catch (err: any) {
      setError(err.message || 'Erro ao editar membro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogShell title="Edit Member" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="first_name">Primeiro Nome *</Label>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="last_name">Último Nome *</Label>
            <Input
              id="last_name"
              name="last_name"
              defaultValue={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              defaultValue={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            name="address"
            defaultValue={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gender">Gênero</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="marital_status">Estado Civil</Label>
            <Select
              value={formData.marital_status}
              onValueChange={(value) => setFormData({ ...formData, marital_status: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar estado civil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Solteiro</SelectItem>
                <SelectItem value="married">Casado</SelectItem>
                <SelectItem value="divorced">Divorciado</SelectItem>
                <SelectItem value="widowed">Viúvo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="occupation">Profissão</Label>
            <Input
              id="occupation"
              name="occupation"
              defaultValue={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="department">Departamento</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar departamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="worship">Ministério de Louvor</SelectItem>
                <SelectItem value="children">Ministério Infantil</SelectItem>
                <SelectItem value="youth">Ministério Jovem</SelectItem>
                <SelectItem value="evangelism">Evangelismo</SelectItem>
                <SelectItem value="administration">Administração</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="member_status">Status</Label>
          <Select
            value={formData.member_status}
            onValueChange={(value: any) => setFormData({ ...formData, member_status: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="emergency_contact">Contato de Emergência</Label>
          <Input
            id="emergency_contact"
            name="emergency_contact"
            defaultValue={formData.emergency_contact}
            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="notes">Observações</Label>
          <Textarea
            id="notes"
            name="notes"
            defaultValue={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => alert(JSON.stringify({ id: memberId, ...formData }))} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </DialogShell>
  )
}

export default EditMemberModal
