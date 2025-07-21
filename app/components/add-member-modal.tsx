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
import { UserPlus, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Member {
  id?: number | string
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
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    await onSubmit({
      ...formData,
      date_of_birth: formData.date_of_birth?.toISOString(),
      baptism_date: formData.baptism_date?.toISOString(),
    })
    setSubmitting(false)
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
  }

  return (
    <DialogShell isOpen={open} onClose={() => onOpenChange(false)} title=" " size="xl" className="max-w-xl">
      <div className="flex flex-col items-center gap-2 mb-4">
        <UserPlus className="h-10 w-10 text-blue-600 animate-pop-in" />
        <h2 className="text-2xl font-bold text-center">Adicionar Novo Membro</h2>
        <p className="text-gray-500 text-center">Preencha os campos abaixo para cadastrar um novo membro.</p>
      </div>
      <AnimatePresence>
        {submitting && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 justify-center mb-4">
            <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
            <span className="text-blue-600">Adicionando membro...</span>
          </motion.div>
        )}
      </AnimatePresence>
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="first_name" className="font-medium">Primeiro Nome *</label>
            <Input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="last_name" className="font-medium">Último Nome *</label>
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
            <label htmlFor="email" className="font-medium">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="phone" className="font-medium">Telefone</label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label htmlFor="address" className="font-medium">Endereço</label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Data de Nascimento</label>
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
            <label className="font-medium">Data de Batismo</label>
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
            <label htmlFor="gender" className="font-medium">Gênero</label>
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
            <label htmlFor="marital_status" className="font-medium">Estado Civil</label>
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
            <label htmlFor="occupation" className="font-medium">Profissão</label>
            <Input
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="department" className="font-medium">Departamento</label>
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
          <label htmlFor="emergency_contact" className="font-medium">Contato de Emergência</label>
          <Input
            id="emergency_contact"
            name="emergency_contact"
            value={formData.emergency_contact}
            onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="notes" className="font-medium">Observações</label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full md:w-auto">
            Cancelar
          </Button>
          <Button type="submit" className="w-full md:w-auto" disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
            Adicionar Membro
          </Button>
        </div>
      </form>
    </DialogShell>
  )
}

export default AddMemberModal
