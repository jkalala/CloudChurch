import { supabase, getAuthenticatedClient } from "./supabase-client"

/* ──────────────────
 *  TYPES
 * ──────────────────*/
export interface CommunityContact {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  age_group?: string
  family_size?: number
  interests?: string[]
  needs?: string[]
  contact_source: string
  contact_status: "new" | "contacted" | "engaged" | "member" | "inactive"
  preferred_contact_method: "phone" | "email" | "text" | "in_person"
  language_preference?: string
  notes?: string
  last_contact_date?: string
  next_follow_up_date?: string
  assigned_volunteer?: string
  created_at: string
  updated_at?: string
}

export interface OutreachProgram {
  id: string
  name: string
  description?: string
  program_type: "food_bank" | "community_service" | "education" | "health" | "youth" | "seniors" | "families" | "other"
  status: "planning" | "active" | "paused" | "completed"
  start_date: string
  end_date?: string
  target_audience?: string
  goals?: string
  budget_allocated?: number
  budget_spent?: number
  volunteer_coordinator?: string
  location?: string
  meeting_schedule?: string
  impact_metrics?: {
    people_served: number
    volunteers_involved: number
    resources_distributed: number
    follow_ups_completed: number
  }
  created_at: string
  updated_at?: string
}

export interface OutreachEvent {
  id: string
  program_id?: string
  title: string
  description?: string
  event_type: "outreach" | "community_service" | "food_distribution" | "health_fair" | "education" | "social"
  date: string
  start_time?: string
  end_time?: string
  location: string
  target_participants?: number
  actual_participants?: number
  volunteer_slots?: number
  volunteers_registered?: number
  resources_needed?: string[]
  resources_provided?: string[]
  coordinator_id?: string
  status: "planned" | "confirmed" | "in_progress" | "completed" | "cancelled"
  feedback_summary?: string
  impact_notes?: string
  created_at: string
  updated_at?: string
}

export interface CommunityPartnership {
  id: string
  organization_name: string
  contact_person: string
  contact_email?: string
  contact_phone?: string
  partnership_type: "nonprofit" | "government" | "business" | "school" | "healthcare" | "other"
  partnership_status: "prospective" | "active" | "inactive" | "ended"
  collaboration_areas?: string[]
  resources_shared?: string[]
  joint_programs?: string[]
  agreement_date?: string
  renewal_date?: string
  notes?: string
  created_at: string
  updated_at?: string
}

export interface VolunteerProfile {
  id: string
  member_id?: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  skills?: string[]
  interests?: string[]
  availability?: {
    days: string[]
    times: string[]
  }
  experience_level: "beginner" | "intermediate" | "experienced" | "expert"
  background_check_status?: "pending" | "approved" | "expired"
  training_completed?: string[]
  preferred_roles?: string[]
  emergency_contact?: {
    name: string
    phone: string
    relationship: string
  }
  hours_contributed?: number
  programs_involved?: string[]
  status: "active" | "inactive" | "on_break"
  created_at: string
  updated_at?: string
}

export interface OutreachInteraction {
  id: string
  contact_id: string
  volunteer_id?: string
  interaction_type: "phone_call" | "email" | "text" | "in_person" | "home_visit" | "event_attendance"
  interaction_date: string
  duration_minutes?: number
  outcome: "positive" | "neutral" | "negative" | "no_response"
  follow_up_needed: boolean
  follow_up_date?: string
  notes?: string
  program_id?: string
  event_id?: string
  created_at: string
}

/* ──────────────────
 *  SERVICE
 * ──────────────────*/
export class OutreachCRMService {
  private static async getClient() {
    const client = getAuthenticatedClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session && typeof window !== "undefined") {
      console.log("No active session – using demo mode")
    }
    return client
  }

  /** ─────────────────────────────
   *  COMMUNITY CONTACTS
   *  ────────────────────────────*/
  static async getCommunityContacts(): Promise<CommunityContact[]> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from("community_contacts")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Database error:", error)
        return this.getDemoCommunityContacts()
      }

      return data || []
    } catch (error) {
      console.error("Error fetching community contacts:", error)
      return this.getDemoCommunityContacts()
    }
  }

  static async createCommunityContact(contactData: Partial<CommunityContact>): Promise<CommunityContact> {
    try {
      const client = await this.getClient()
      const cleanData = Object.fromEntries(
        Object.entries(contactData).filter(([_, value]) => value !== undefined && value !== ""),
      )

      const { data, error } = await client.from("community_contacts").insert([cleanData]).select().single()

      if (error) {
        console.error("Database error creating contact:", error)
        return {
          id: `demo-contact-${Date.now()}`,
          ...cleanData,
          created_at: new Date().toISOString(),
        } as CommunityContact
      }

      return data
    } catch (error) {
      console.error("Error creating community contact:", error)
      return {
        id: `demo-contact-${Date.now()}`,
        ...contactData,
        created_at: new Date().toISOString(),
      } as CommunityContact
    }
  }

  static async updateCommunityContact(id: string, contactData: Partial<CommunityContact>): Promise<CommunityContact> {
    try {
      const client = await this.getClient()
      const cleanData = Object.fromEntries(
        Object.entries(contactData).filter(([_, value]) => value !== undefined && value !== ""),
      )

      const { data, error } = await client.from("community_contacts").update(cleanData).eq("id", id).select().single()

      if (error) {
        console.error("Database error updating contact:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error updating community contact:", error)
      throw error
    }
  }

  /** ─────────────────────────────
   *  OUTREACH PROGRAMS
   *  ────────────────────────────*/
  static async getOutreachPrograms(): Promise<OutreachProgram[]> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from("outreach_programs")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Database error:", error)
        return this.getDemoOutreachPrograms()
      }

      return data || []
    } catch (error) {
      console.error("Error fetching outreach programs:", error)
      return this.getDemoOutreachPrograms()
    }
  }

  static async createOutreachProgram(programData: Partial<OutreachProgram>): Promise<OutreachProgram> {
    try {
      const client = await this.getClient()
      const cleanData = Object.fromEntries(
        Object.entries(programData).filter(([_, value]) => value !== undefined && value !== ""),
      )

      const { data, error } = await client.from("outreach_programs").insert([cleanData]).select().single()

      if (error) {
        console.error("Database error creating program:", error)
        return {
          id: `demo-program-${Date.now()}`,
          ...cleanData,
          created_at: new Date().toISOString(),
        } as OutreachProgram
      }

      return data
    } catch (error) {
      console.error("Error creating outreach program:", error)
      return {
        id: `demo-program-${Date.now()}`,
        ...programData,
        created_at: new Date().toISOString(),
      } as OutreachProgram
    }
  }

  /** ─────────────────────────────
   *  OUTREACH EVENTS
   *  ────────────────────────────*/
  static async getOutreachEvents(): Promise<OutreachEvent[]> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from("outreach_events")
        .select(`
          *,
          outreach_programs (name)
        `)
        .order("date", { ascending: true })

      if (error) {
        console.error("Database error:", error)
        return this.getDemoOutreachEvents()
      }

      return data || []
    } catch (error) {
      console.error("Error fetching outreach events:", error)
      return this.getDemoOutreachEvents()
    }
  }

  static async createOutreachEvent(eventData: Partial<OutreachEvent>): Promise<OutreachEvent> {
    try {
      const client = await this.getClient()
      const cleanData = Object.fromEntries(
        Object.entries(eventData).filter(([_, value]) => value !== undefined && value !== ""),
      )

      const { data, error } = await client.from("outreach_events").insert([cleanData]).select().single()

      if (error) {
        console.error("Database error creating event:", error)
        return {
          id: `demo-event-${Date.now()}`,
          ...cleanData,
          created_at: new Date().toISOString(),
        } as OutreachEvent
      }

      return data
    } catch (error) {
      console.error("Error creating outreach event:", error)
      return {
        id: `demo-event-${Date.now()}`,
        ...eventData,
        created_at: new Date().toISOString(),
      } as OutreachEvent
    }
  }

  /** ─────────────────────────────
   *  VOLUNTEER PROFILES
   *  ────────────────────────────*/
  static async getVolunteerProfiles(): Promise<VolunteerProfile[]> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from("volunteer_profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Database error:", error)
        return this.getDemoVolunteerProfiles()
      }

      return data || []
    } catch (error) {
      console.error("Error fetching volunteer profiles:", error)
      return this.getDemoVolunteerProfiles()
    }
  }

  static async createVolunteerProfile(volunteerData: Partial<VolunteerProfile>): Promise<VolunteerProfile> {
    try {
      const client = await this.getClient()
      const cleanData = Object.fromEntries(
        Object.entries(volunteerData).filter(([_, value]) => value !== undefined && value !== ""),
      )

      const { data, error } = await client.from("volunteer_profiles").insert([cleanData]).select().single()

      if (error) {
        console.error("Database error creating volunteer:", error)
        return {
          id: `demo-volunteer-${Date.now()}`,
          ...cleanData,
          created_at: new Date().toISOString(),
        } as VolunteerProfile
      }

      return data
    } catch (error) {
      console.error("Error creating volunteer profile:", error)
      return {
        id: `demo-volunteer-${Date.now()}`,
        ...volunteerData,
        created_at: new Date().toISOString(),
      } as VolunteerProfile
    }
  }

  /** ─────────────────────────────
   *  PARTNERSHIPS
   *  ────────────────────────────*/
  static async getCommunityPartnerships(): Promise<CommunityPartnership[]> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from("community_partnerships")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Database error:", error)
        return this.getDemoCommunityPartnerships()
      }

      return data || []
    } catch (error) {
      console.error("Error fetching partnerships:", error)
      return this.getDemoCommunityPartnerships()
    }
  }

  static async createCommunityPartnership(
    partnershipData: Partial<CommunityPartnership>,
  ): Promise<CommunityPartnership> {
    try {
      const client = await this.getClient()
      const cleanData = Object.fromEntries(
        Object.entries(partnershipData).filter(([_, value]) => value !== undefined && value !== ""),
      )

      const { data, error } = await client.from("community_partnerships").insert([cleanData]).select().single()

      if (error) {
        console.error("Database error creating partnership:", error)
        return {
          id: `demo-partnership-${Date.now()}`,
          ...cleanData,
          created_at: new Date().toISOString(),
        } as CommunityPartnership
      }

      return data
    } catch (error) {
      console.error("Error creating partnership:", error)
      return {
        id: `demo-partnership-${Date.now()}`,
        ...partnershipData,
        created_at: new Date().toISOString(),
      } as CommunityPartnership
    }
  }

  /** ─────────────────────────────
   *  INTERACTIONS
   *  ────────────────────────────*/
  static async recordOutreachInteraction(interactionData: Partial<OutreachInteraction>): Promise<OutreachInteraction> {
    try {
      const client = await this.getClient()
      const cleanData = Object.fromEntries(
        Object.entries(interactionData).filter(([_, value]) => value !== undefined && value !== ""),
      )

      const { data, error } = await client.from("outreach_interactions").insert([cleanData]).select().single()

      if (error) {
        console.error("Database error recording interaction:", error)
        return {
          id: `demo-interaction-${Date.now()}`,
          ...cleanData,
          created_at: new Date().toISOString(),
        } as OutreachInteraction
      }

      return data
    } catch (error) {
      console.error("Error recording interaction:", error)
      return {
        id: `demo-interaction-${Date.now()}`,
        ...interactionData,
        created_at: new Date().toISOString(),
      } as OutreachInteraction
    }
  }

  /** ─────────────────────────────
   *  ANALYTICS
   *  ────────────────────────────*/
  static async getOutreachAnalytics() {
    try {
      const client = await this.getClient()

      // Get contact statistics
      const { data: contacts } = await client.from("community_contacts").select("contact_status, created_at")
      const { data: programs } = await client.from("outreach_programs").select("status, impact_metrics")
      const { data: events } = await client.from("outreach_events").select("status, actual_participants")
      const { data: volunteers } = await client.from("volunteer_profiles").select("status, hours_contributed")

      const totalContacts = contacts?.length || 0
      const newContacts = contacts?.filter((c) => c.contact_status === "new").length || 0
      const engagedContacts = contacts?.filter((c) => c.contact_status === "engaged").length || 0
      const convertedMembers = contacts?.filter((c) => c.contact_status === "member").length || 0

      const activePrograms = programs?.filter((p) => p.status === "active").length || 0
      const completedEvents = events?.filter((e) => e.status === "completed").length || 0
      const totalParticipants = events?.reduce((sum, e) => sum + (e.actual_participants || 0), 0) || 0

      const activeVolunteers = volunteers?.filter((v) => v.status === "active").length || 0
      const totalVolunteerHours = volunteers?.reduce((sum, v) => sum + (v.hours_contributed || 0), 0) || 0

      return {
        totalContacts,
        newContacts,
        engagedContacts,
        convertedMembers,
        conversionRate: totalContacts > 0 ? Math.round((convertedMembers / totalContacts) * 100) : 0,
        activePrograms,
        completedEvents,
        totalParticipants,
        activeVolunteers,
        totalVolunteerHours,
        avgHoursPerVolunteer: activeVolunteers > 0 ? Math.round(totalVolunteerHours / activeVolunteers) : 0,
      }
    } catch (error) {
      console.error("Error getting outreach analytics:", error)
      return {
        totalContacts: 247,
        newContacts: 45,
        engagedContacts: 128,
        convertedMembers: 74,
        conversionRate: 30,
        activePrograms: 8,
        completedEvents: 23,
        totalParticipants: 1456,
        activeVolunteers: 52,
        totalVolunteerHours: 2340,
        avgHoursPerVolunteer: 45,
      }
    }
  }

  /** ─────────────────────────────
   *  DEMO DATA
   *  ────────────────────────────*/
  private static getDemoCommunityContacts(): CommunityContact[] {
    const today = new Date()
    const minusDays = (d: number) => new Date(today.getTime() - d * 86_400_000)
    const plusDays = (d: number) => new Date(today.getTime() + d * 86_400_000)

    return [
      {
        id: "demo-contact-1",
        first_name: "Ana",
        last_name: "Silva",
        email: "ana.silva@email.com",
        phone: "+244 923 456 789",
        address: "Rua das Flores, 123, Maianga",
        age_group: "30-40",
        family_size: 4,
        interests: ["community_service", "children_programs"],
        needs: ["food_assistance", "job_training"],
        contact_source: "food_distribution",
        contact_status: "engaged",
        preferred_contact_method: "phone",
        language_preference: "Portuguese",
        notes: "Single mother, very interested in children's programs",
        last_contact_date: minusDays(3).toISOString(),
        next_follow_up_date: plusDays(7).toISOString(),
        assigned_volunteer: "demo-volunteer-1",
        created_at: minusDays(30).toISOString(),
      },
      {
        id: "demo-contact-2",
        first_name: "Carlos",
        last_name: "Mendes",
        email: "carlos.mendes@email.com",
        phone: "+244 912 345 678",
        address: "Avenida 4 de Fevereiro, 456, Ingombota",
        age_group: "50-60",
        family_size: 2,
        interests: ["health_programs", "senior_activities"],
        needs: ["healthcare_access", "social_connection"],
        contact_source: "health_fair",
        contact_status: "contacted",
        preferred_contact_method: "in_person",
        language_preference: "Portuguese",
        notes: "Retired teacher, interested in volunteering",
        last_contact_date: minusDays(7).toISOString(),
        next_follow_up_date: plusDays(3).toISOString(),
        assigned_volunteer: "demo-volunteer-2",
        created_at: minusDays(45).toISOString(),
      },
      {
        id: "demo-contact-3",
        first_name: "Maria",
        last_name: "Santos",
        phone: "+244 934 567 890",
        address: "Bairro Operário, Rua 15, Casa 78",
        age_group: "20-30",
        family_size: 3,
        interests: ["youth_programs", "education"],
        needs: ["childcare", "education_support"],
        contact_source: "community_event",
        contact_status: "new",
        preferred_contact_method: "text",
        language_preference: "Portuguese",
        notes: "Young mother, needs childcare support to attend programs",
        last_contact_date: minusDays(1).toISOString(),
        next_follow_up_date: plusDays(2).toISOString(),
        created_at: minusDays(7).toISOString(),
      },
    ]
  }

  private static getDemoOutreachPrograms(): OutreachProgram[] {
    const today = new Date()
    return [
      {
        id: "demo-program-1",
        name: "Banco Alimentar Comunitário",
        description: "Distribuição mensal de alimentos para famílias necessitadas",
        program_type: "food_bank",
        status: "active",
        start_date: "2024-01-01",
        target_audience: "Famílias em situação de vulnerabilidade",
        goals: "Atender 200 famílias mensalmente",
        budget_allocated: 50000,
        budget_spent: 32000,
        volunteer_coordinator: "demo-volunteer-1",
        location: "Centro Comunitário da Igreja",
        meeting_schedule: "Toda primeira sexta-feira do mês",
        impact_metrics: {
          people_served: 850,
          volunteers_involved: 25,
          resources_distributed: 12000,
          follow_ups_completed: 340,
        },
        created_at: today.toISOString(),
      },
      {
        id: "demo-program-2",
        name: "Programa de Alfabetização de Adultos",
        description: "Aulas de alfabetização para adultos da comunidade",
        program_type: "education",
        status: "active",
        start_date: "2024-02-01",
        end_date: "2024-12-31",
        target_audience: "Adultos não alfabetizados",
        goals: "Alfabetizar 50 adultos por ano",
        budget_allocated: 25000,
        budget_spent: 15000,
        volunteer_coordinator: "demo-volunteer-2",
        location: "Salas de aula da igreja",
        meeting_schedule: "Terças e quintas, 18h-20h",
        impact_metrics: {
          people_served: 35,
          volunteers_involved: 8,
          resources_distributed: 500,
          follow_ups_completed: 120,
        },
        created_at: today.toISOString(),
      },
      {
        id: "demo-program-3",
        name: "Cuidado aos Idosos",
        description: "Visitas e apoio aos idosos da comunidade",
        program_type: "seniors",
        status: "active",
        start_date: "2024-01-15",
        target_audience: "Idosos da comunidade",
        goals: "Visitar 100 idosos mensalmente",
        budget_allocated: 15000,
        budget_spent: 8500,
        volunteer_coordinator: "demo-volunteer-3",
        location: "Domicílios",
        meeting_schedule: "Visitas semanais",
        impact_metrics: {
          people_served: 95,
          volunteers_involved: 15,
          resources_distributed: 300,
          follow_ups_completed: 280,
        },
        created_at: today.toISOString(),
      },
    ]
  }

  private static getDemoOutreachEvents(): OutreachEvent[] {
    const today = new Date()
    const plusDays = (d: number) => new Date(today.getTime() + d * 86_400_000)
    const minusDays = (d: number) => new Date(today.getTime() - d * 86_400_000)

    return [
      {
        id: "demo-event-1",
        program_id: "demo-program-1",
        title: "Distribuição de Alimentos - Janeiro",
        description: "Distribuição mensal de cestas básicas",
        event_type: "food_distribution",
        date: plusDays(5).toISOString().split("T")[0],
        start_time: "08:00",
        end_time: "12:00",
        location: "Centro Comunitário da Igreja",
        target_participants: 200,
        actual_participants: 185,
        volunteer_slots: 20,
        volunteers_registered: 18,
        resources_needed: ["cestas_basicas", "voluntarios", "transporte"],
        resources_provided: ["cestas_basicas", "agua", "lanche_voluntarios"],
        coordinator_id: "demo-volunteer-1",
        status: "confirmed",
        impact_notes: "Atendimento eficiente, boa organização",
        created_at: today.toISOString(),
      },
      {
        id: "demo-event-2",
        program_id: "demo-program-2",
        title: "Feira de Saúde Comunitária",
        description: "Exames gratuitos e orientações de saúde",
        event_type: "health_fair",
        date: plusDays(12).toISOString().split("T")[0],
        start_time: "09:00",
        end_time: "16:00",
        location: "Praça Central do Bairro",
        target_participants: 300,
        volunteer_slots: 25,
        volunteers_registered: 22,
        resources_needed: ["equipamentos_medicos", "medicamentos", "tendas"],
        coordinator_id: "demo-volunteer-2",
        status: "planned",
        created_at: today.toISOString(),
      },
      {
        id: "demo-event-3",
        title: "Mutirão de Limpeza do Bairro",
        description: "Ação comunitária de limpeza e conscientização ambiental",
        event_type: "community_service",
        date: minusDays(7).toISOString().split("T")[0],
        start_time: "07:00",
        end_time: "11:00",
        location: "Várias ruas do bairro",
        target_participants: 100,
        actual_participants: 85,
        volunteer_slots: 30,
        volunteers_registered: 28,
        resources_needed: ["sacos_lixo", "vassouras", "luvas"],
        resources_provided: ["sacos_lixo", "vassouras", "luvas", "agua", "lanche"],
        coordinator_id: "demo-volunteer-3",
        status: "completed",
        feedback_summary: "Excelente participação da comunidade",
        impact_notes: "5 ruas completamente limpas, 2 toneladas de lixo coletadas",
        created_at: today.toISOString(),
      },
    ]
  }

  private static getDemoVolunteerProfiles(): VolunteerProfile[] {
    const today = new Date()
    return [
      {
        id: "demo-volunteer-1",
        first_name: "Grace",
        last_name: "Mwangi",
        email: "grace.mwangi@email.com",
        phone: "+244 923 111 222",
        skills: ["coordenacao", "comunicacao", "logistica"],
        interests: ["assistencia_social", "educacao"],
        availability: {
          days: ["friday", "saturday", "sunday"],
          times: ["morning", "afternoon"],
        },
        experience_level: "experienced",
        background_check_status: "approved",
        training_completed: ["primeiros_socorros", "lideranca", "gestao_voluntarios"],
        preferred_roles: ["coordenador", "facilitador"],
        emergency_contact: {
          name: "John Mwangi",
          phone: "+244 923 111 223",
          relationship: "spouse",
        },
        hours_contributed: 120,
        programs_involved: ["demo-program-1", "demo-program-2"],
        status: "active",
        created_at: today.toISOString(),
      },
      {
        id: "demo-volunteer-2",
        first_name: "Michael",
        last_name: "Okafor",
        email: "michael.okafor@email.com",
        phone: "+244 912 333 444",
        skills: ["ensino", "informatica", "traducao"],
        interests: ["educacao", "tecnologia"],
        availability: {
          days: ["tuesday", "thursday", "saturday"],
          times: ["evening"],
        },
        experience_level: "expert",
        background_check_status: "approved",
        training_completed: ["pedagogia", "informatica_basica", "gestao_projetos"],
        preferred_roles: ["professor", "facilitador_tecnologia"],
        emergency_contact: {
          name: "Sarah Okafor",
          phone: "+244 912 333 445",
          relationship: "spouse",
        },
        hours_contributed: 95,
        programs_involved: ["demo-program-2"],
        status: "active",
        created_at: today.toISOString(),
      },
      {
        id: "demo-volunteer-3",
        first_name: "Sarah",
        last_name: "Johnson",
        email: "sarah.johnson@email.com",
        phone: "+244 934 555 666",
        skills: ["cuidados_idosos", "enfermagem", "psicologia"],
        interests: ["saude", "cuidado_idosos"],
        availability: {
          days: ["monday", "wednesday", "friday"],
          times: ["morning", "afternoon"],
        },
        experience_level: "expert",
        background_check_status: "approved",
        training_completed: ["primeiros_socorros", "cuidados_geriatricos", "psicologia_basica"],
        preferred_roles: ["cuidador", "visitador"],
        emergency_contact: {
          name: "David Johnson",
          phone: "+244 934 555 667",
          relationship: "spouse",
        },
        hours_contributed: 150,
        programs_involved: ["demo-program-3"],
        status: "active",
        created_at: today.toISOString(),
      },
    ]
  }

  private static getDemoCommunityPartnerships(): CommunityPartnership[] {
    const today = new Date()
    return [
      {
        id: "demo-partnership-1",
        organization_name: "Hospital Municipal de Luanda",
        contact_person: "Dr. António Silva",
        contact_email: "antonio.silva@hospital.gov.ao",
        contact_phone: "+244 222 123 456",
        partnership_type: "healthcare",
        partnership_status: "active",
        collaboration_areas: ["feiras_saude", "campanhas_vacinacao", "educacao_saude"],
        resources_shared: ["profissionais_saude", "equipamentos_medicos", "medicamentos"],
        joint_programs: ["Feira de Saúde Comunitária", "Campanha de Vacinação"],
        agreement_date: "2024-01-15",
        renewal_date: "2025-01-15",
        notes: "Parceria muito produtiva, excelente colaboração",
        created_at: today.toISOString(),
      },
      {
        id: "demo-partnership-2",
        organization_name: "Escola Primária do Bairro",
        contact_person: "Professora Maria Fernandes",
        contact_email: "maria.fernandes@escola.edu.ao",
        contact_phone: "+244 923 789 012",
        partnership_type: "school",
        partnership_status: "active",
        collaboration_areas: ["alfabetizacao_adultos", "apoio_escolar", "atividades_extracurriculares"],
        resources_shared: ["salas_aula", "materiais_didaticos", "professores_voluntarios"],
        joint_programs: ["Programa de Alfabetização de Adultos"],
        agreement_date: "2024-02-01",
        renewal_date: "2024-12-31",
        notes: "Escola muito receptiva, direção colaborativa",
        created_at: today.toISOString(),
      },
      {
        id: "demo-partnership-3",
        organization_name: "Supermercado Central",
        contact_person: "Sr. João Pereira",
        contact_email: "joao.pereira@supercentral.ao",
        contact_phone: "+244 912 456 789",
        partnership_type: "business",
        partnership_status: "active",
        collaboration_areas: ["doacao_alimentos", "desconto_compras", "patrocinio_eventos"],
        resources_shared: ["alimentos", "desconto_produtos", "espaco_eventos"],
        joint_programs: ["Banco Alimentar Comunitário"],
        agreement_date: "2024-01-01",
        renewal_date: "2024-12-31",
        notes: "Parceiro confiável, sempre disponível para ajudar",
        created_at: today.toISOString(),
      },
    ]
  }
}
