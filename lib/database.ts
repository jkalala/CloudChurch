import { supabase } from '@/lib/supabase-client';
import type { Database } from "./database-types"
import { offlineStorage } from "@/lib/offline-storage"

/* ------------------------------------------------------------------ */
/*  🔵 Domain types (kept in-file so callers can `import type` easily) */
/* ------------------------------------------------------------------ */
export interface Member {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  address?: string
  date_of_birth?: string | null
  baptism_date?: string | null
  join_date: string
  member_status: "active" | "inactive" | "pending"
  department?: string
  profile_image?: string
  gender?: string
  marital_status?: string
  occupation?: string
  emergency_contact?: string
  notes?: string
  created_at: string
  updated_at: string
  tags?: string[]
}

export interface Event {
  id: string
  title: string
  description?: string
  event_date: string
  start_time?: string
  end_time?: string
  location?: string
  event_type: string
  status: string
  max_capacity?: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface FinancialTransaction {
  id: string
  amount: number
  transaction_type: string
  description?: string
  transaction_date: string
  payment_method: string
  member_id?: string
  created_by: string
  created_at: string
  updated_at: string
  transaction_reference?: string
  ministry_id?: string
  notes?: string
  members?: {
    first_name: string
    last_name: string
  }
}

export interface Budget {
  id: string
  name: string
  description?: string
  total_amount: number
  spent_amount: number
  period: string
  start_date: string
  end_date: string
  status: string
  categories: BudgetCategory[]
  created_at: string
  updated_at: string
}

export interface BudgetCategory {
  id: string
  name: string
  allocated_amount: number
  spent_amount: number
  color: string
  icon: string
}

export interface Expense {
  id: string
  budget_id: string
  category_id: string
  amount: number
  description: string
  date: string
  payment_method: string
  receipt_url?: string
  approved_by?: string
  status: "pending" | "approved" | "rejected"
}

export interface Department {
  id: string
  name: string
  description?: string
  department_type: string
  leader_id?: string
  meeting_schedule?: string
  meeting_location?: string
  contact_email?: string
  contact_phone?: string
  goals?: string
  member_count: number
  status: string
  created_at: string
  updated_at: string
}

/* ------------------------------------------------------------------ */
/*  ⚡️ Lightweight in-memory DB fallback (during local dev / tests)   */
/* ------------------------------------------------------------------ */
type Row = Record<string, unknown>

class InMemoryDB {
  private store = new Map<string, Row[]>()

  select<T = Row>(table: string): T[] {
    return (this.store.get(table) ?? []) as T[]
  }

  insert<T = Row>(table: string, row: T) {
    const data = this.select<T>(table)
    data.push(row)
    this.store.set(table, data as Row[])
  }
}

const db = new InMemoryDB()

/**
 * VERY LIGHT abstraction so any part of the app can:
 *   import { getDb } from "@/lib/database"
 * and start reading/writing without crashing – even when Supabase
 * credentials are not present (e.g. Preview deployments).
 */
export function getDb() {
  return db
}

/* ------------------------------------------------------------------ */
/*  🗄️  Real data-access helpers powered by Supabase                  */
/* ------------------------------------------------------------------ */
class DatabaseService {
  // Singleton Supabase client (component-safe)
  private static supabase = supabase

  static async logMemberAudit(memberId: string, action: string, details: any, userId: string = 'system', userEmail: string = 'system') {
    await this.supabase.from('member_audit_log').insert({
      member_id: memberId,
      action,
      user_id: userId,
      user_email: userEmail,
      details,
    })
  }

  /* ---------- MEMBERS ---------- */
  static async getMembers(): Promise<Member[]> {
    try {
      const { data, error } = await this.supabase
        .from("members")
        .select("*, member_tags:member_tags(tag)")
        .order("created_at", { ascending: false })
      if (error) throw error
      // Map tags into tags: string[]
      return (data || []).map((m: any) => ({
        ...m,
        tags: m.member_tags ? m.member_tags.map((t: any) => t.tag) : [],
      }))
    } catch (error) {
      console.error("Error fetching members:", error)
      return []
    }
  }

  static async createMember(memberData: Partial<Member>): Promise<Member> {
    // Handle empty date strings - convert to null for optional date fields
    const insertData = { ...memberData };
    if (insertData.date_of_birth === "") {
      insertData.date_of_birth = null;
    }
    if (insertData.baptism_date === "") {
      insertData.baptism_date = null;
    }
    if (insertData.join_date === "") {
      insertData.join_date = new Date().toISOString().split('T')[0]; // Use current date as default
    }
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Offline: queue for sync
      await offlineStorage.addPendingMemberUpdate(insertData, "POST")
      // Optionally add to local cache immediately
      const localMembers = await offlineStorage.getMembers()
      const newMember = { ...insertData, id: `offline-${Date.now()}` }
      await offlineStorage.saveMembers([newMember, ...localMembers])
      return newMember as Member
    }
    const { data, error } = await this.supabase
      .from("members")
      .insert({
        ...insertData,
        join_date: insertData.join_date || new Date().toISOString().split('T')[0],
        member_status: memberData.member_status || "active",
      })
      .select()
      .single()
    if (error) throw error
    await this.logMemberAudit(data.id, 'add', data)
    // Update IndexedDB
    const localMembers = await offlineStorage.getMembers()
    await offlineStorage.saveMembers([data, ...localMembers])
    return data
  }

  static async updateMember(id: string, memberData: Partial<Member>): Promise<Member> {
    // Handle empty date strings - convert to null for optional date fields
    const updateData = { ...memberData };
    if (updateData.date_of_birth === "") {
      updateData.date_of_birth = null;
    }
    if (updateData.baptism_date === "") {
      updateData.baptism_date = null;
    }
    if (updateData.join_date === "") {
      updateData.join_date = new Date().toISOString().split('T')[0]; // Use current date as default
    }
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Offline: queue for sync
      await offlineStorage.addPendingMemberUpdate(updateData, "PUT", id)
      // Update local cache
      const localMembers = await offlineStorage.getMembers()
      const updatedMembers = localMembers.map(m => m.id === id ? { ...m, ...updateData } : m)
      await offlineStorage.saveMembers(updatedMembers)
      return updatedMembers.find(m => m.id === id) as Member
    }
    const { data, error } = await this.supabase
      .from("members")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    await this.logMemberAudit(id, 'edit', updateData)
    // Update IndexedDB
    const localMembers = await offlineStorage.getMembers()
    const updatedMembers = localMembers.map(m => m.id === id ? data : m)
    await offlineStorage.saveMembers(updatedMembers)
    return data
  }

  static async deleteMember(id: string): Promise<void> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Offline: queue for sync
      await offlineStorage.addPendingMemberUpdate({ id }, "DELETE", id)
      // Update local cache
      const localMembers = await offlineStorage.getMembers()
      const updatedMembers = localMembers.filter(m => m.id !== id)
      await offlineStorage.saveMembers(updatedMembers)
      return
    }
    const { error } = await this.supabase.from("members").delete().eq("id", id)
    if (error) throw error
    await this.logMemberAudit(id, 'delete', { id })
    // Update IndexedDB
    const localMembers = await offlineStorage.getMembers()
    const updatedMembers = localMembers.filter(m => m.id !== id)
    await offlineStorage.saveMembers(updatedMembers)
  }

  static async bulkUpdateMembers(memberIds: string[], updates: Record<string, any>): Promise<void> {
    const { error } = await this.supabase.from("members").update(updates).in("id", memberIds)
    if (error) throw error
  }

  static async getMemberById(id: string): Promise<Member | null> {
    const { data, error } = await this.supabase.from("members").select("*").eq("id", id).single();
    if (error) return null;
    return data;
  }

  static async createFamily(familyData: { family_name: string }): Promise<{ id: string; family_name: string }> {
    const { data, error } = await this.supabase
      .from("families")
      .insert({ family_name: familyData.family_name })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getFamilies(): Promise<{ id: string; family_name: string }[]> {
    try {
      const { data, error } = await this.supabase
        .from("families")
        .select("id, family_name")
        .order("family_name", { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching families:", error);
      return [];
    }
  }

  static async addMember(memberData: Partial<Member> & { family_id?: string | null; custom_fields?: { key: string; value: string }[]; membership_date?: string | null }): Promise<Member> {
    // Convert custom_fields to JSONB if present
    const insertData = { ...memberData };
    if (memberData.custom_fields) {
      insertData["custom_fields"] = memberData.custom_fields;
    }
    
    // Handle empty date strings - convert to null for optional date fields
    if (insertData.date_of_birth === "") {
      insertData.date_of_birth = null;
    }
    if (insertData.baptism_date === "") {
      insertData.baptism_date = null;
    }
    if (insertData.membership_date === "") {
      insertData.membership_date = null;
    }
    if (insertData.join_date === "") {
      insertData.join_date = new Date().toISOString().split('T')[0]; // Use current date as default
    }
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      await offlineStorage.addPendingMemberUpdate(insertData, "POST");
      const localMembers = await offlineStorage.getMembers();
      const newMember = { ...insertData, id: `offline-${Date.now()}` };
      await offlineStorage.saveMembers([newMember, ...localMembers]);
      return newMember as Member;
    }
    const { data, error } = await this.supabase
      .from("members")
      .insert({
        ...insertData,
        join_date: insertData.join_date || new Date().toISOString().split('T')[0],
        member_status: memberData.member_status || "active",
      })
      .select()
      .single();
    if (error) throw error;
    await this.logMemberAudit(data.id, 'add', data);
    const localMembers = await offlineStorage.getMembers();
    await offlineStorage.saveMembers([data, ...localMembers]);
    return data;
  }

  /* ---------- EVENTS ---------- */
  static async getEvents(): Promise<Event[]> {
    try {
      const { data, error } = await this.supabase.from("events").select("*").order("event_date", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching events:", error)
      return []
    }
  }

  static async createEvent(eventData: Partial<Event>): Promise<Event> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Offline: queue for sync
      if (offlineStorage.addPendingEventUpdate) {
        await offlineStorage.addPendingEventUpdate(eventData, "POST")
      }
      // Add to local cache
      const localEvents = await offlineStorage.getEvents()
      const newEvent = { ...eventData, id: `offline-${Date.now()}` }
      await offlineStorage.saveEvents([newEvent, ...localEvents])
      return newEvent as Event
    }
    const { data, error } = await this.supabase
      .from("events")
      .insert({
        ...eventData,
        status: eventData.status || "draft",
        created_by: "current-user-id", // TODO: inject real user id
      })
      .select()
      .single()
    if (error) throw error
    // Update IndexedDB
    const localEvents = await offlineStorage.getEvents()
    await offlineStorage.saveEvents([data, ...localEvents])
    return data
  }

  static async updateEvent(id: string, eventData: Partial<Event>): Promise<Event> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Offline: queue for sync
      if (offlineStorage.addPendingEventUpdate) {
        await offlineStorage.addPendingEventUpdate(eventData, "PUT", id)
      }
      // Update local cache
      const localEvents = await offlineStorage.getEvents()
      const updatedEvents = localEvents.map(e => e.id === id ? { ...e, ...eventData } : e)
      await offlineStorage.saveEvents(updatedEvents)
      return updatedEvents.find(e => e.id === id) as Event
    }
    const { data, error } = await this.supabase
      .from("events")
      .update({
        ...eventData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    // Update IndexedDB
    const localEvents = await offlineStorage.getEvents()
    const updatedEvents = localEvents.map(e => e.id === id ? data : e)
    await offlineStorage.saveEvents(updatedEvents)
    return data
  }

  static async deleteEvent(id: string): Promise<void> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Offline: queue for sync
      if (offlineStorage.addPendingEventUpdate) {
        await offlineStorage.addPendingEventUpdate({ id }, "DELETE", id)
      }
      // Update local cache
      const localEvents = await offlineStorage.getEvents()
      const updatedEvents = localEvents.filter(e => e.id !== id)
      await offlineStorage.saveEvents(updatedEvents)
      return
    }
    const { error } = await this.supabase.from("events").delete().eq("id", id)
    if (error) throw error
    // Update IndexedDB
    const localEvents = await offlineStorage.getEvents()
    const updatedEvents = localEvents.filter(e => e.id !== id)
    await offlineStorage.saveEvents(updatedEvents)
  }

  /* ---------- FINANCIAL ---------- */
  static async getFinancialSummary(): Promise<{
    totalTithes: number
    totalOfferings: number
    totalIncome: number
  }> {
    try {
      const { data, error } = await this.supabase.from("financial_transactions").select("amount, transaction_type")

      if (error) throw error

      const summary = data.reduce(
        (acc, transaction) => {
          const amount = Number(transaction.amount)
          if (transaction.transaction_type === "tithe") acc.totalTithes += amount
          else if (transaction.transaction_type === "offering") acc.totalOfferings += amount
          acc.totalIncome += amount
          return acc
        },
        { totalTithes: 0, totalOfferings: 0, totalIncome: 0 },
      )

      return summary
    } catch (error) {
      console.error("Error fetching financial summary:", error)
      return { totalTithes: 0, totalOfferings: 0, totalIncome: 0 }
    }
  }

  static async getFinancialTransactions(): Promise<FinancialTransaction[]> {
    try {
      const { data, error } = await this.supabase
        .from("financial_transactions")
        .select(
          `
            *,
            members (
              first_name,
              last_name
            )
          `,
        )
        .order("transaction_date", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching financial transactions:", error)
      return []
    }
  }

  static async createFinancialTransaction(
    transactionData: Partial<FinancialTransaction>,
  ): Promise<FinancialTransaction> {
    const { data, error } = await this.supabase
      .from("financial_transactions")
      .insert({
        ...transactionData,
        created_by: transactionData.created_by || "demo-user-id",
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateFinancialTransaction(id: string, transactionData: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
    const { data, error } = await this.supabase
      .from("financial_transactions")
      .update({
        ...transactionData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async deleteFinancialTransaction(id: string): Promise<void> {
    const { error } = await this.supabase.from("financial_transactions").delete().eq("id", id)
    if (error) throw error
  }

  /* ---------- BUDGETS ---------- */
  static async getBudgets(): Promise<Budget[]> {
    try {
      /* Using a JSON relationship so every budget comes with its categories
         (table name assumed to be budget_categories)                         */
      const { data, error } = await this.supabase
        .from("budgets")
        .select("*, budget_categories(*)")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Normalise: expose categories under the expected key
      return (data ?? []).map((b: any) => ({
        ...b,
        categories: b.budget_categories ?? [],
      }))
    } catch (error) {
      console.error("Error fetching budgets:", error)
      return []
    }
  }

  static async createBudget(budgetData: Partial<Budget>): Promise<Budget> {
    const { data, error } = await this.supabase
      .from("budgets")
      .insert({
        ...budgetData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*, budget_categories(*)")
      .single()

    if (error) throw error
    // Ensure 'categories' key is always present
    return { ...data, categories: data.budget_categories ?? [] }
  }

  /* ---------- EXPENSES ---------- */
  static async getExpenses(): Promise<Expense[]> {
    try {
      const { data, error } = await this.supabase.from("expenses").select("*").order("date", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching expenses:", error)
      return []
    }
  }

  static async createExpense(expenseData: Partial<Expense>): Promise<Expense> {
    const { data, error } = await this.supabase
      .from("expenses")
      .insert({
        ...expenseData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getExpenseById(id: string): Promise<Expense | null> {
    const { data, error } = await this.supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }
    return data;
  }

  static async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    const { data, error } = await this.supabase
      .from("expenses")
      .update({
        ...expenseData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async deleteExpense(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("expenses")
      .delete()
      .eq("id", id);
    if (error) throw error;
  }

  static async recordAttendance(attendanceData: any): Promise<any> {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      // Offline: queue for sync
      await offlineStorage.addPendingAttendance(attendanceData)
      // Optionally add to local cache (not shown in UI, but could be added)
      return { ...attendanceData, id: `offline-${Date.now()}` }
    }
    
    // Map the incoming data to match the database schema
    const mappedData: any = {
      member_id: attendanceData.member_id,
      attendance_type: attendanceData.activity || attendanceData.attendance_type,
      notes: attendanceData.notes,
      check_in_time: attendanceData.checked_in_at || new Date().toISOString(),
    }
    
    // Only add event_id if it's provided and not null
    if (attendanceData.event_id) {
      mappedData.event_id = attendanceData.event_id;
    }
    
    const { data, error } = await this.supabase
      .from("attendance")
      .insert(mappedData)
      .select()
      .single()
    if (error) throw error
    return data
  }

  static async getAttendanceStats(): Promise<any> {
    // Example: return total attendance records and attendance rate
    const { data, error } = await this.supabase.from("attendance").select("*")
    if (error) throw error
    const totalRecords = data?.length || 0
    // Optionally, calculate attendance rate if you have member count and present/absent info
    return { totalRecords }
  }

  static async getAttendanceRecords(): Promise<any[]> {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Offline: load from IndexedDB (not implemented, but could be added)
        return []
      }
      const { data, error } = await this.supabase.from("attendance").select("*")
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching attendance records:", error)
      return []
    }
  }

  static async getAttendanceRecordsByMember(memberId: string): Promise<any[]> {
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        // Offline: load from IndexedDB (not implemented, but could be added)
        return []
      }
      const { data, error } = await this.supabase
        .from("attendance")
        .select("*")
        .eq("member_id", memberId)
        .order("check_in_time", { ascending: false })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Error fetching attendance records for member:", error)
      return []
    }
  }

  static async getDepartments(): Promise<any[]> {
    const { data, error } = await this.supabase.from("departments").select("*")
    if (error) throw error
    return data || []
  }
}

/* ------------------------------------------------------------------ */
/*  🔄  Legacy export compatibility                                   */
/* ------------------------------------------------------------------ */
export default DatabaseService
export { DatabaseService }
