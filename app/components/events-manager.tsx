"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Plus, Filter } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import CreateEventModal from './create-event-modal';
import EditEventModal from './edit-event-modal';
import ViewEventModal from './view-event-modal';
import { DatabaseService } from '@/lib/database';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import React from "react";
import Papa from 'papaparse';

export default function EventsManager() {
  const { t } = useTranslation();
  const [view, setView] = useState('grid');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<any | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const EVENTS_PER_PAGE = 9;
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // Fetch events from backend
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await DatabaseService.getEvents();
      setEvents(data || []);
    } catch (err) {
      toast({ title: 'Erro ao carregar eventos', description: String(err), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  // Load events on mount
  React.useEffect(() => { fetchEvents(); }, []);

  // Handlers
  const handleEventCreated = () => { fetchEvents(); };
  const handleEventUpdated = () => { fetchEvents(); };
  const openEditModal = (event: any) => { setSelectedEvent(event); setShowEditModal(true); };
  const openViewModal = (event: any) => { setSelectedEvent(event); setShowViewModal(true); };
  const openDeleteDialog = (event: any) => { setDeletingEvent(event); setShowDeleteDialog(true); setDeleteError(null); };
  const closeDeleteDialog = () => { setShowDeleteDialog(false); setDeletingEvent(null); setDeleteError(null); };
  const handleDeleteEvent = async () => {
    if (!deletingEvent) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await DatabaseService.deleteEvent(deletingEvent.id);
      toast({ title: 'Evento excluído', description: 'O evento foi removido com sucesso.' });
      fetchEvents();
      closeDeleteDialog();
    } catch (err: any) {
      setDeleteError(err.message || 'Erro ao excluir evento');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    setBulkDeleteLoading(true);
    setBulkDeleteError(null);
    try {
      for (const id of selectedEvents) {
        await DatabaseService.deleteEvent(id);
      }
      toast({ title: 'Eventos excluídos', description: 'Os eventos selecionados foram removidos.' });
      setSelectedEvents([]);
      setShowBulkDeleteDialog(false);
      fetchEvents();
    } catch (err: any) {
      setBulkDeleteError(err.message || 'Erro ao excluir eventos');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const exportEvents = selectedEvents.length > 0
      ? events.filter(e => selectedEvents.includes(e.id))
      : events;
    const csv = Papa.unparse(exportEvents);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eventos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const stats = {
    total: events.length,
    upcoming: events.filter(e => new Date(e.event_date || e.date) >= new Date()).length,
    byType: Object.entries(events.reduce((acc, e) => {
      const type = e.event_type || e.type || 'Outro';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)) as [string, number][],
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "worship":
        return "bg-blue-100 text-blue-800"
      case "study":
        return "bg-green-100 text-green-800"
      case "outreach":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "planning":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // Filtered events
  const filteredEvents = events.filter(event => {
    // Search filter
    const searchMatch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(search.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(search.toLowerCase()));
    // Type filter
    const typeMatch = typeFilter === 'all' || (event.event_type || event.type) === typeFilter;
    // Status filter
    const statusMatch = statusFilter === 'all' || event.status === statusFilter;
    return searchMatch && typeMatch && statusMatch;
  });

  // Sorting
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let aValue = a[sortField] || '';
    let bValue = b[sortField] || '';
    if (sortField === 'date' || sortField === 'event_date') {
      aValue = new Date(a.event_date || a.date).getTime();
      bValue = new Date(b.event_date || b.date).getTime();
    } else {
      aValue = (aValue || '').toString().toLowerCase();
      bValue = (bValue || '').toString().toLowerCase();
    }
    if (sortOrder === 'asc') return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = sortedEvents.slice((page - 1) * EVENTS_PER_PAGE, page * EVENTS_PER_PAGE);

  if (loading) {
    return <div className="flex justify-center items-center h-96">Carregando eventos...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t("events")}</h2>
          <p className="text-gray-600">Gerencie eventos e atividades da igreja</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            Exportar CSV
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("createEvent")}
          </Button>
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card><CardContent className="p-4"><div className="flex flex-col"><span className="text-sm text-gray-600">Total</span><span className="text-2xl font-bold">{stats.total}</span></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex flex-col"><span className="text-sm text-gray-600">Próximos</span><span className="text-2xl font-bold">{stats.upcoming}</span></div></CardContent></Card>
        {stats.byType.map(([type, count]) => (
          <Card key={type}><CardContent className="p-4"><div className="flex flex-col"><span className="text-sm text-gray-600">{type}</span><span className="text-2xl font-bold">{count}</span></div></CardContent></Card>
        ))}
      </div>
      {/* Search, Filters, and Sorting */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-4">
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-64"
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Todos os Tipos</option>
          <option value="worship">Culto</option>
          <option value="study">Estudo</option>
          <option value="outreach">Evangelismo</option>
          <option value="service">Serviço</option>
          <option value="meeting">Reunião</option>
          <option value="practice">Ensaio</option>
          <option value="fellowship">Confraternização</option>
          <option value="conference">Conferência</option>
          <option value="workshop">Workshop</option>
          <option value="prayer">Vigília/Oração</option>
          <option value="youth">Evento Jovens</option>
          <option value="children">Evento Crianças</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Todos os Status</option>
          <option value="confirmed">Confirmado</option>
          <option value="planning">Planejando</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <select
          value={sortField}
          onChange={e => setSortField(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="event_date">Data</option>
          <option value="title">Título</option>
          <option value="event_type">Tipo</option>
        </select>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="border rounded px-3 py-2"
        >
          <option value="asc">Crescente</option>
          <option value="desc">Decrescente</option>
        </select>
      </div>
      {/* Bulk Actions */}
      {selectedEvents.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span>{selectedEvents.length} selecionado(s)</span>
          <Button variant="destructive" size="sm" onClick={() => setShowBulkDeleteDialog(true)}>
            Excluir Selecionados
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            Exportar Selecionados
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedEvents([])}>
            Limpar Seleção
          </Button>
        </div>
      )}
      {/* Stats and Event List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedEvents.map((event) => (
          <Card key={event.id} className={`hover:shadow-lg transition-shadow ${selectedEvents.includes(event.id) ? 'ring-2 ring-blue-400' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription className="mt-1">{event.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(event.status)}>
                  {event.status === "confirmed"
                    ? "Confirmado"
                    : event.status === "planning"
                      ? "Planejando"
                      : "Cancelado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedEvents.includes(event.id)}
                    onChange={e => {
                      if (e.target.checked) setSelectedEvents(prev => [...prev, event.id]);
                      else setSelectedEvents(prev => prev.filter(id => id !== event.id));
                    }}
                  />
                  <Calendar className="h-4 w-4" />
                  {new Date(event.event_date || event.date).toLocaleDateString("pt-BR")}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {event.start_time || event.time}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  {event.attendees || event.actual_participants || 0}/{event.maxAttendees || event.max_capacity || 0} participantes
                </div>
                <Badge className={getEventTypeColor(event.event_type || event.type)}>
                  {event.event_type === "worship" ? "Culto" : event.event_type === "study" ? "Estudo" : event.event_type === "outreach" ? "Evangelismo" : event.event_type || event.type}
                </Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(event)}>
                  Editar
                </Button>
                <Button size="sm" className="flex-1" onClick={() => openViewModal(event)}>
                  Ver Detalhes
                </Button>
                <Button variant="destructive" size="sm" className="flex-1" onClick={() => openDeleteDialog(event)}>
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Anterior</Button>
        <span>Página {page} de {totalPages}</span>
        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Próxima</Button>
      </div>
      {/* Modals */}
      <CreateEventModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onEventCreated={handleEventCreated} />
      {selectedEvent && (
        <EditEventModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} event={selectedEvent} onEventUpdated={handleEventUpdated} />
      )}
      {selectedEvent && (
        <ViewEventModal isOpen={showViewModal} onClose={() => setShowViewModal(false)} event={selectedEvent} onEdit={() => { setShowViewModal(false); setShowEditModal(true); }} onDelete={() => openDeleteDialog(selectedEvent)} />
      )}
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Evento</DialogTitle>
          </DialogHeader>
          <div>Tem certeza de que deseja excluir este evento?</div>
          {deleteError && <div className="text-red-600 text-sm">{deleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDeleteDialog} disabled={deleteLoading}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteEvent} disabled={deleteLoading}>
              {deleteLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Eventos Selecionados</DialogTitle>
          </DialogHeader>
          <div>Tem certeza de que deseja excluir os eventos selecionados?</div>
          {bulkDeleteError && <div className="text-red-600 text-sm">{bulkDeleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowBulkDeleteDialog(false)} disabled={bulkDeleteLoading}>Cancelar</Button>
            <Button type="button" variant="destructive" onClick={handleBulkDelete} disabled={bulkDeleteLoading}>
              {bulkDeleteLoading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
