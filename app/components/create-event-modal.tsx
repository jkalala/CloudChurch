"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Users, Save, X } from "lucide-react"
import { DatabaseService } from "@/lib/database"
import { toast } from "@/hooks/use-toast"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onEventCreated: () => void
}

export default function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    event_type: "",
    max_capacity: "",
    ministry_id: "",
    registration_required: false,
    registration_deadline: "",
    cost: "",
    notes: "",
  })

  const eventTypes = [
    { value: "service", label: "Culto/Serviço" },
    { value: "meeting", label: "Reunião" },
    { value: "practice", label: "Ensaio" },
    { value: "outreach", label: "Evangelismo" },
    { value: "fellowship", label: "Confraternização" },
    { value: "conference", label: "Conferência" },
    { value: "workshop", label: "Workshop" },
    { value: "prayer", label: "Vigília/Oração" },
    { value: "youth", label: "Evento Jovens" },
    { value: "children", label: "Evento Crianças" },
  ]

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title || !formData.event_date || !formData.event_type) {
        toast({
          title: "Erro de Validação",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        })
        return
      }

      // Prepare event data
      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        event_date: formData.event_date,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        location: formData.location || undefined,
        event_type: formData.event_type,
        max_capacity: formData.max_capacity ? Number.parseInt(formData.max_capacity) : undefined,
        ministry_id: formData.ministry_id || undefined,
        registration_required: formData.registration_required,
        registration_deadline: formData.registration_deadline || undefined,
        cost: formData.cost ? Number.parseFloat(formData.cost) : undefined,
        notes: formData.notes || undefined,
        created_by: "current-user", // In real app, get from auth context
        created_at: new Date().toISOString(),
      }

      await DatabaseService.createEvent(eventData)

      toast({
        title: "Evento Criado!",
        description: `O evento "${formData.title}" foi criado com sucesso.`,
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        event_date: "",
        start_time: "",
        end_time: "",
        location: "",
        event_type: "",
        max_capacity: "",
        ministry_id: "",
        registration_required: false,
        registration_deadline: "",
        cost: "",
        notes: "",
      })

      onEventCreated()
      onClose()
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Erro ao Criar Evento",
        description: "Ocorreu um erro ao criar o evento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Criar Novo Evento
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Título do Evento *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ex: Culto Dominical, Conferência de Jovens..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva o evento, objetivos, programa..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="event_type">Tipo de Evento *</Label>
                <Select value={formData.event_type} onValueChange={(value) => handleInputChange("event_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Local</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    placeholder="Templo Principal, Salão, Online..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data e Horário</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="event_date">Data do Evento *</Label>
                <Input
                  id="event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => handleInputChange("event_date", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="start_time">Horário de Início</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange("start_time", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="end_time">Horário de Término</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange("end_time", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Capacity and Registration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Capacidade e Inscrições</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_capacity">Capacidade Máxima</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="max_capacity"
                    type="number"
                    value={formData.max_capacity}
                    onChange={(e) => handleInputChange("max_capacity", e.target.value)}
                    placeholder="Ex: 100"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cost">Custo (Kz)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => handleInputChange("cost", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="registration_required"
                    checked={formData.registration_required}
                    onChange={(e) => handleInputChange("registration_required", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="registration_required">Inscrição obrigatória</Label>
                </div>
              </div>

              {formData.registration_required && (
                <div>
                  <Label htmlFor="registration_deadline">Prazo de Inscrição</Label>
                  <Input
                    id="registration_deadline"
                    type="date"
                    value={formData.registration_deadline}
                    onChange={(e) => handleInputChange("registration_deadline", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Observações Adicionais</h3>

            <div>
              <Label htmlFor="notes">Notas Internas</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Notas para organizadores, requisitos especiais..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Criando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
