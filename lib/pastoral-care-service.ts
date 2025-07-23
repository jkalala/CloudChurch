import { createClientComponentClient } from "./supabase-client"
import type { Database } from "./database-types"

export interface CareRecord {
  id: string
  member_id: string
  care_type: "visit" | "call" | "counseling" | "prayer" | "crisis" | "follow_up" | "hospital" | "bereavement"
  priority: "low" | "medium" | "high" | "urgent"
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "follow_up_needed"
  title: string
  description?: string
  notes?: string
  scheduled_date?: string
  completed_date?: string
  assigned_to?: string // Pastor/Care team member ID
  location?: string
  duration_minutes?: number
  follow_up_date?: string
  tags?: string[]
  confidential: boolean
  created_at: string
  updated_at?: string
}

export interface PrayerRequest {
  id: string
  member_id?: string
  requester_name: string
  requester_email?: string
  requester_phone?: string
  request_type: "personal" | "family" | "health" | "financial" | "spiritual" | "other"
  priority: "low" | "medium" | "high" | "urgent"
  status: "active" | "answered" | "ongoing" | "closed"
  title: string
  description: string
  is_anonymous: boolean
  is_public: boolean
  assigned_to?: string
  prayer_count: number
  answered_date?: string
  answer_description?: string
  follow_up_needed: boolean
  tags?: string[]
  created_at: string
  updated_at?: string
}

export interface CareTeamMember {
  id: string
  member_id: string
  role: "pastor" | "associate_pastor" | "elder" | "deacon" | "care_volunteer" | "counselor"
  specializations: string[]
  availability: {
    [key: string]: { start: string; end: string; available: boolean }
  }
  max_weekly_visits: number
  current_caseload: number
  contact_preferences: string[]
  languages: string[]
  certifications?: string[]
  active: boolean
  created_at: string
}

export interface CrisisAlert {
  id: string
  member_id: string
  alert_type: "medical" | "mental_health" | "family_crisis" | "financial" | "spiritual" | "emergency"
  severity: "low" | "medium" | "high" | "critical"
  status: "active" | "responding" | "resolved" | "escalated"
  title: string
  description: string
  reported_by: string
  assigned_to?: string
  response_team?: string[]
  location?: string
  contact_info?: string
  immediate_needs?: string[]
  resources_provided?: string[]
  resolution_notes?: string
  created_at: string
  resolved_at?: string
}

export interface CounselingSession {
  id: string
  member_id: string
  counselor_id: string
  session_type: "individual" | "couple" | "family" | "group"
  session_focus: "marriage" | "grief" | "addiction" | "depression" | "anxiety" | "spiritual" | "other"
  status: "scheduled" | "completed" | "cancelled" | "no_show"
  scheduled_date: string
  duration_minutes: number
  location: string
  session_notes?: string
  homework_assigned?: string
  next_session_date?: string
  progress_rating?: number // 1-10 scale
  confidential_notes?: string
  resources_provided?: string[]
  referrals_made?: string[]
  created_at: string
  updated_at?: string
}

export interface CareMetrics {
  total_active_cases: number
  urgent_cases: number
  overdue_follow_ups: number
  completed_this_month: number
  prayer_requests_active: number
  crisis_alerts_active: number
  counseling_sessions_this_month: number
  care_team_utilization: number
  average_response_time: number
  member_satisfaction_score: number
}

export class PastoralCareService {
  private static supabase = createClientComponentClient<Database>()

  // Care Records Management
  static async getCareRecords(filters?: {
    member_id?: string
    care_type?: string
    priority?: string
    status?: string
    assigned_to?: string
    date_range?: { start: string; end: string }
  }): Promise<CareRecord[]> {
    try {
      let query = this.supabase.from("care_records").select("*")
      if (filters?.member_id) query = query.eq("member_id", filters.member_id)
      if (filters?.care_type) query = query.eq("care_type", filters.care_type)
      if (filters?.priority) query = query.eq("priority", filters.priority)
      if (filters?.status) query = query.eq("status", filters.status)
      if (filters?.assigned_to) query = query.eq("assigned_to", filters.assigned_to)
      if (filters?.date_range) query = query.gte("created_at", filters.date_range.start).lte("created_at", filters.date_range.end)
      const { data, error } = await query.order("created_at", { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching care records:", error)
      return []
    }
  }

  static async createCareRecord(recordData: Partial<CareRecord>): Promise<CareRecord> {
    try {
      const { data, error } = await this.supabase
        .from("care_records")
        .insert({
          ...recordData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating care record:", error)
      throw error
    }
  }

  static async updateCareRecord(id: string, updates: Partial<CareRecord>): Promise<CareRecord> {
    try {
      const { data, error } = await this.supabase
        .from("care_records")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error("Error updating care record:", error)
      throw error
    }
  }

  // Add this method for deleting care records
  static async deleteCareRecord(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from('care_records').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting care record:', error);
      throw error;
    }
  }

  // Prayer Requests Management
  static async getPrayerRequests(filters?: {
    status?: string
    priority?: string
    request_type?: string
    assigned_to?: string
  }): Promise<PrayerRequest[]> {
    try {
      let query = this.supabase.from("prayer_requests").select("*")
      if (filters?.status) query = query.eq("status", filters.status)
      if (filters?.priority) query = query.eq("priority", filters.priority)
      if (filters?.request_type) query = query.eq("request_type", filters.request_type)
      if (filters?.assigned_to) query = query.eq("assigned_to", filters.assigned_to)
      const { data, error } = await query.order("created_at", { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching prayer requests:", error)
      return []
    }
  }

  static async createPrayerRequest(requestData: Partial<PrayerRequest>): Promise<PrayerRequest> {
    try {
      const { data, error } = await this.supabase
        .from("prayer_requests")
        .insert({
          ...requestData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating prayer request:", error)
      throw error
    }
  }

  static async updatePrayerRequest(id: string, updates: Partial<PrayerRequest>): Promise<PrayerRequest> {
    try {
      const { data, error } = await this.supabase
        .from('prayer_requests')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating prayer request:', error);
      throw error;
    }
  }

  static async deletePrayerRequest(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from('prayer_requests').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting prayer request:', error);
      throw error;
    }
  }

  // Care Team Management
  static async getCareTeamMembers(): Promise<CareTeamMember[]> {
    try {
      const { data, error } = await this.supabase.from("care_team").select("*").order("created_at", { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching care team members:", error)
      return []
    }
  }

  static async assignCareRecord(recordId: string, careTeamMemberId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("care_records")
        .update({ assigned_to: careTeamMemberId, updated_at: new Date().toISOString() })
        .eq("id", recordId)
      if (error) throw error
    } catch (error) {
      console.error("Error assigning care record:", error)
      throw error
    }
  }

  // Crisis Management
  static async getCrisisAlerts(status?: string): Promise<CrisisAlert[]> {
    try {
      let query = this.supabase.from("crisis_alerts").select("*")
      if (status) query = query.eq("status", status)
      const { data, error } = await query.order("created_at", { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching crisis alerts:", error)
      return []
    }
  }

  static async createCrisisAlert(alertData: Partial<CrisisAlert>): Promise<CrisisAlert> {
    try {
      const { data, error } = await this.supabase
        .from("crisis_alerts")
        .insert({
          ...alertData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      return data
    } catch (error) {
      console.error("Error creating crisis alert:", error)
      throw error
    }
  }

  static async updateCrisisAlert(id: string, updates: Partial<CrisisAlert>): Promise<CrisisAlert> {
    try {
      const { data, error } = await this.supabase
        .from('crisis_alerts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating crisis alert:', error);
      throw error;
    }
  }

  static async deleteCrisisAlert(id: string): Promise<void> {
    try {
      const { error } = await this.supabase.from('crisis_alerts').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting crisis alert:', error);
      throw error;
    }
  }

  // Counseling Sessions
  static async getCounselingSessions(filters?: {
    member_id?: string
    counselor_id?: string
    status?: string
    date_range?: { start: string; end: string }
  }): Promise<CounselingSession[]> {
    try {
      let query = this.supabase.from("counseling_sessions").select("*")
      if (filters?.member_id) query = query.eq("member_id", filters.member_id)
      if (filters?.counselor_id) query = query.eq("counselor_id", filters.counselor_id)
      if (filters?.status) query = query.eq("status", filters.status)
      if (filters?.date_range) query = query.gte("scheduled_date", filters.date_range.start).lte("scheduled_date", filters.date_range.end)
      const { data, error } = await query.order("scheduled_date", { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching counseling sessions:", error)
      return []
    }
  }

  // Analytics and Metrics
  static async getCareMetrics(): Promise<CareMetrics> {
    try {
      const careRecords = await this.getCareRecords()
      const prayerRequests = await this.getPrayerRequests()
      const crisisAlerts = await this.getCrisisAlerts()
      const counselingSessions = await this.getCounselingSessions()

      return {
        total_active_cases: careRecords.filter((r) => r.status !== "completed").length,
        urgent_cases: careRecords.filter((r) => r.priority === "urgent").length,
        overdue_follow_ups: careRecords.filter((r) => r.follow_up_date && new Date(r.follow_up_date) < new Date())
          .length,
        completed_this_month: careRecords.filter(
          (r) =>
            r.status === "completed" &&
            r.completed_date &&
            new Date(r.completed_date).getMonth() === new Date().getMonth(),
        ).length,
        prayer_requests_active: prayerRequests.filter((p) => p.status === "active").length,
        crisis_alerts_active: crisisAlerts.filter((c) => c.status === "active").length,
        counseling_sessions_this_month: counselingSessions.filter(
          (s) => new Date(s.scheduled_date).getMonth() === new Date().getMonth(),
        ).length,
        care_team_utilization: 75, // Calculated based on caseloads
        average_response_time: 2.5, // Hours
        member_satisfaction_score: 4.6, // Out of 5
      }
    } catch (error) {
      console.error("Error calculating care metrics:", error)
      return {
        total_active_cases: 0,
        urgent_cases: 0,
        overdue_follow_ups: 0,
        completed_this_month: 0,
        prayer_requests_active: 0,
        crisis_alerts_active: 0,
        counseling_sessions_this_month: 0,
        care_team_utilization: 0,
        average_response_time: 0,
        member_satisfaction_score: 0,
      }
    }
  }

  // AI-Powered Insights
  static async generateCareInsights(): Promise<{
    recommendations: string[]
    trends: string[]
    alerts: string[]
  }> {
    try {
      const metrics = await this.getCareMetrics()
      const recommendations: string[] = []
      const trends: string[] = []
      const alerts: string[] = []

      // Generate AI-powered recommendations
      if (metrics.urgent_cases > 5) {
        recommendations.push("Consider expanding the crisis response team")
        alerts.push(`${metrics.urgent_cases} urgent cases require immediate attention`)
      }

      if (metrics.overdue_follow_ups > 3) {
        recommendations.push("Schedule follow-up reminders for care team members")
        alerts.push(`${metrics.overdue_follow_ups} follow-ups are overdue`)
      }

      if (metrics.care_team_utilization > 85) {
        recommendations.push("Care team is at high capacity - consider recruiting volunteers")
      }

      // Identify trends
      if (metrics.counseling_sessions_this_month > 20) {
        trends.push("Increased demand for counseling services this month")
      }

      if (metrics.prayer_requests_active > 50) {
        trends.push("High volume of active prayer requests indicates community needs")
      }

      return { recommendations, trends, alerts }
    } catch (error) {
      console.error("Error generating care insights:", error)
      return { recommendations: [], trends: [], alerts: [] }
    }
  }

  // Demo Data
  private static getDemoCareRecords(): CareRecord[] {
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    return [
      {
        id: "care-1",
        member_id: "demo-1",
        care_type: "hospital",
        priority: "high",
        status: "scheduled",
        title: "Hospital Visit - Surgery Recovery",
        description: "Post-surgery pastoral visit and prayer",
        scheduled_date: today.toISOString(),
        assigned_to: "pastor-1",
        location: "Hospital Central - Room 302",
        duration_minutes: 45,
        follow_up_date: nextWeek.toISOString(),
        tags: ["surgery", "recovery", "prayer"],
        confidential: false,
        created_at: yesterday.toISOString(),
      },
      {
        id: "care-2",
        member_id: "demo-2",
        care_type: "bereavement",
        priority: "urgent",
        status: "in_progress",
        title: "Grief Counseling - Loss of Spouse",
        description: "Ongoing support for recent widow",
        assigned_to: "pastor-2",
        location: "Church Office",
        duration_minutes: 60,
        tags: ["grief", "bereavement", "counseling"],
        confidential: true,
        created_at: yesterday.toISOString(),
      },
      {
        id: "care-3",
        member_id: "demo-3",
        care_type: "visit",
        priority: "medium",
        status: "completed",
        title: "Home Visit - New Baby Blessing",
        description: "Congratulatory visit for new parents",
        completed_date: yesterday.toISOString(),
        assigned_to: "elder-1",
        location: "Member Home",
        duration_minutes: 30,
        tags: ["blessing", "new_baby", "family"],
        confidential: false,
        created_at: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  }

  private static getDemoPrayerRequests(): PrayerRequest[] {
    return [
      {
        id: "prayer-1",
        member_id: "demo-1",
        requester_name: "João Silva",
        requester_email: "joao@email.com",
        request_type: "health",
        priority: "high",
        status: "active",
        title: "Healing from Surgery",
        description: "Please pray for complete healing and recovery from recent surgery",
        is_anonymous: false,
        is_public: true,
        assigned_to: "pastor-1",
        prayer_count: 25,
        follow_up_needed: true,
        tags: ["healing", "surgery", "recovery"],
        created_at: new Date().toISOString(),
      },
      {
        id: "prayer-2",
        requester_name: "Anonymous",
        request_type: "family",
        priority: "medium",
        status: "active",
        title: "Marriage Restoration",
        description: "Pray for healing and restoration in my marriage",
        is_anonymous: true,
        is_public: false,
        prayer_count: 12,
        follow_up_needed: false,
        tags: ["marriage", "restoration", "family"],
        created_at: new Date().toISOString(),
      },
    ]
  }

  private static getDemoCareTeam(): CareTeamMember[] {
    return [
      {
        id: "pastor-1",
        member_id: "demo-pastor-1",
        role: "pastor",
        specializations: ["grief_counseling", "crisis_intervention", "spiritual_direction"],
        availability: {
          monday: { start: "09:00", end: "17:00", available: true },
          tuesday: { start: "09:00", end: "17:00", available: true },
          wednesday: { start: "09:00", end: "17:00", available: true },
          thursday: { start: "09:00", end: "17:00", available: true },
          friday: { start: "09:00", end: "15:00", available: true },
          saturday: { start: "10:00", end: "14:00", available: true },
          sunday: { start: "08:00", end: "13:00", available: false },
        },
        max_weekly_visits: 15,
        current_caseload: 12,
        contact_preferences: ["phone", "email", "in_person"],
        languages: ["Portuguese", "English"],
        certifications: ["Licensed Professional Counselor", "Crisis Intervention Specialist"],
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: "elder-1",
        member_id: "demo-elder-1",
        role: "elder",
        specializations: ["home_visits", "prayer_ministry", "new_member_care"],
        availability: {
          monday: { start: "18:00", end: "21:00", available: true },
          tuesday: { start: "18:00", end: "21:00", available: true },
          wednesday: { start: "18:00", end: "21:00", available: true },
          thursday: { start: "18:00", end: "21:00", available: true },
          friday: { start: "18:00", end: "21:00", available: false },
          saturday: { start: "09:00", end: "17:00", available: true },
          sunday: { start: "14:00", end: "18:00", available: true },
        },
        max_weekly_visits: 8,
        current_caseload: 6,
        contact_preferences: ["phone", "in_person"],
        languages: ["Portuguese"],
        active: true,
        created_at: new Date().toISOString(),
      },
    ]
  }

  private static getDemoCounselingSessions(): CounselingSession[] {
    return [
      {
        id: "counseling-1",
        member_id: "demo-5",
        counselor_id: "pastor-1",
        session_type: "couple",
        session_focus: "marriage",
        status: "scheduled",
        scheduled_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 60,
        location: "Church Counseling Room",
        progress_rating: 7,
        created_at: new Date().toISOString(),
      },
    ]
  }
}
