"use client";

import { useEffect, useState } from "react";
import { DialogShell } from "./_shared/dialog-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseService } from "@/lib/database";
import { supabase } from "@/lib/supabase-client";

interface MemberAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
}

interface AuditLog {
  id: string;
  member_id: string;
  action: string;
  user_id: string;
  user_email: string;
  details: any;
  created_at: string;
}

export function MemberAuditLogModal({ isOpen, onClose, memberId }: MemberAuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    supabase
      .from("member_audit_log")
      .select("*")
      .eq("member_id", memberId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setLogs(data || []);
        setLoading(false);
      });
  }, [isOpen, memberId]);

  return (
    <DialogShell isOpen={isOpen} onClose={onClose} title="Member Change History">
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-600">{error}</div>
          ) : logs.length === 0 ? (
            <div>No changes recorded for this member.</div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {logs.map(log => (
                <div key={log.id} className="border-b pb-2">
                  <div className="text-xs text-gray-500 mb-1">{new Date(log.created_at).toLocaleString()} by {log.user_email}</div>
                  <div className="font-semibold">{log.action}</div>
                  <pre className="text-xs bg-gray-50 rounded p-2 mt-1 overflow-x-auto">{JSON.stringify(log.details, null, 2)}</pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DialogShell>
  );
} 