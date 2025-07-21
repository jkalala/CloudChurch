import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database-types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gdrbytizqbpyticofapo.supabase.co"
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkcmJ5dGl6cWJweXRpY29mYXBvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUwMzUyNSwiZXhwIjoyMDY2MDc5NTI1fQ.M9rDWUHi2XTTM8fkLk5kfYO0Gd4994bWu_w7GP05pLo"

export function createAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Grants all admin permissions to the specified user_id.
 * @param userId - The UUID of the user to grant admin permissions to.
 */
export async function grantAdminPermissions(userId: string) {
  const supabase = createAdminClient();
  const permissions = [
    'manage_users',
    'manage_finances',
    'manage_events',
    'manage_members',
    'manage_settings',
    'view_analytics',
    'manage_departments',
    'manage_streaming',
    'manage_pastoral_care',
    'super_admin',
  ];
  const rows = permissions.map(permission => ({
    user_id: userId,
    permission_type: permission,
    granted_at: new Date().toISOString(),
  }));
  const { data, error } = await supabase
    .from('admin_permissions')
    .upsert(rows, { onConflict: 'user_id,permission_type' });
  if (error) {
    throw new Error('Error granting admin permissions: ' + error.message);
  }
  return data;
}
