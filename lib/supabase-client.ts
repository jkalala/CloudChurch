import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database-types"
import {
  createClientComponentClient as _createClientComponentClient,
  createServerComponentClient as _createServerComponentClient,
} from "@supabase/auth-helpers-nextjs"

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gdrbytizqbpyticofapo.supabase.co"
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkcmJ5dGl6cWJweXRpY29mYXBvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MDM1MjUsImV4cCI6MjA2NjA3OTUyNX0.dD4WMZyJ-e7sQosiKyJboTHsjI57DHlgleD2bkEQiOk"

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Browser client (singleton)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// Server client for API routes and server actions
export function createServerClient() {
  const serverKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

  return createClient<Database>(supabaseUrl, serverKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Browser client factory
export function createBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}

// --- SAFE WRAPPERS ----------------------------------------------------------
// These helpers forward to `@supabase/auth-helpers-nextjs`, but we **always**
// pass `supabaseUrl` & `supabaseKey` so they never crash in Preview builds
// where NEXT_PUBLIC_SUPABASE_* env vars might be missing.

export function createClientComponentClient<Db = Database>() {
  return _createClientComponentClient<Db>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}

export function createServerComponentClient<Db = Database>() {
  // Provide a default cookies function as required by the type definition
  return _createServerComponentClient<Db>({ cookies: () => { return {} as any; } });
}

export function getAuthenticatedClient() {
  // For now, just return the default supabase client
  // In the future, this could be extended to handle user sessions, etc.
  return supabase;
}
