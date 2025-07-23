"use client";
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle } from "lucide-react"

export default function CheckinPage({ params }: { params: { memberId: string } }) {
  const { memberId } = params
  const [status, setStatus] = useState<"loading" | "success" | "already" | "error">("loading")
  const [member, setMember] = useState<any>(null)
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkin() {
      // Fetch member info
      const { data: m } = await supabase.from("members").select("*", { count: "exact" }).eq("id", memberId).single()
      setMember(m)
      if (!m) { setStatus("error"); return }
      // Check if already checked in today
      const today = new Date().toISOString().slice(0, 10)
      const { data: existing } = await supabase.from("attendance").select("*").eq("member_id", memberId).eq("date", today).single()
      if (existing) {
        setStatus("already")
        setCheckedInAt(existing.checked_in_at)
        return
      }
      // Insert attendance
      const { error, data: att } = await supabase.from("attendance").insert({
        member_id: memberId,
        date: today,
        activity: "church",
        checked_in_at: new Date().toISOString(),
      }).select().single()
      if (error) setStatus("error")
      else {
        setStatus("success")
        setCheckedInAt(att.checked_in_at)
      }
    }
    checkin()
  }, [memberId])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Check-in de Membro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "loading" && <div>Processando check-in...</div>}
          {status === "error" && <div className="text-red-600">Erro ao processar check-in. Verifique o QR code ou tente novamente.</div>}
          {status === "success" && (
            <div>
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-700 mb-2">Check-in realizado com sucesso!</div>
              <div className="mb-2">{member?.first_name} {member?.last_name}</div>
              <Badge variant="secondary">{member?.email}</Badge>
              <div className="text-xs text-gray-500 mt-2">Horário: {checkedInAt && new Date(checkedInAt).toLocaleTimeString()}</div>
            </div>
          )}
          {status === "already" && (
            <div>
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
              <div className="text-lg font-bold text-yellow-700 mb-2">Já fez check-in hoje</div>
              <div className="mb-2">{member?.first_name} {member?.last_name}</div>
              <Badge variant="secondary">{member?.email}</Badge>
              <div className="text-xs text-gray-500 mt-2">Horário: {checkedInAt && new Date(checkedInAt).toLocaleTimeString()}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 