"use client"
import { DialogShell } from "./_shared/dialog-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { FormEvent } from "react"
import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Member {
  id?: string
  name?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  date_of_birth?: string
  baptism_date?: string
  gender?: string
  marital_status?: string
  occupation?: string
  department?: string
  emergency_contact?: string
  notes?: string
  join_date?: string
  member_status?: string
}

interface AddMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (memberData: Partial<Member>) => void
}

export function AddMemberModal({ open, onOpenChange, onSubmit }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    date_of_birth: undefined as Date | undefined,
    baptism_date: undefined as Date | undefined,
    gender: "",
    marital_status: "",
    occupation: "",
    department: "",
    emergency_contact: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit({
        ...formData,
        date_of_birth: formData.date_of_birth ? formData.date_of_birth.toISOString().slice(0, 10) : undefined,
        baptism_date: formData.baptism_date ? formData.baptism_date.toISOString().slice(0, 10) : undefined,
        join_date: new Date().toISOString().slice(0, 10),
        member_status: "active",
      })
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        date_of_birth: undefined,
        baptism_date: undefined,
        gender: "",
        marital_status: "",
        occupation: "",
        department: "",
        emergency_contact: "",
        notes: "",
      })
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || 'Erro ao adicionar membro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogShell isOpen={open} onClose={() => onOpenChange(false)} title="Adicionar Novo Membro" size="xl" className="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name">Primeiro Nome *</label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="last_name">Último Nome *</label>
            <Input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="phone">Telefone</label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="address">Endereço</label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Data de Nascimento</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date_of_birth && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date_of_birth ? format(formData.date_of_birth, "PPP") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date_of_birth}
                  onSelect={(date) => setFormData({ ...formData, date_of_birth: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <label>Data de Batismo</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.baptism_date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.baptism_date ? format(formData.baptism_date, "PPP") : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.baptism_date}
                  onSelect={(date) => setFormData({ ...formData, baptism_date: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gender">Gênero</label>
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
            <label htmlFor="marital_status">Estado Civil</label>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="occupation">Profissão</label>
            <Input
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="department">Departamento</label>
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
          <label htmlFor="emergency_contact">Contato de Emergência</label>
          <Input
            id="emergency_contact"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="notes">Observações</label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex flex-col md:flex-row gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full md:w-auto" disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" className="w-full md:w-auto" disabled={loading}>
            {loading ? 'Adicionando...' : 'Adicionar Membro'}
          </Button>
        </div>
      </form>
    </DialogShell>
  )
}

export default AddMemberModal
