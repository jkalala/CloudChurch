import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bar } from "react-chartjs-2"
import { useAuth } from "@/components/auth-provider"

export default function ModernMembersPage() {
  const { userProfile } = useAuth()
  const memberId = userProfile?.id || "demo-member-id"
  const [events, setEvents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkinEvent, setCheckinEvent] = useState("")
  const [checkinStatus, setCheckinStatus] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const eventsRes = await fetch("/api/events")
      const eventsData = await eventsRes.json()
      setEvents(eventsData.events || eventsData)
      const attRes = await fetch(`/api/attendance?member_id=${memberId}`)
      const attData = await attRes.json()
      setAttendance(attData.records || attData)
      setLoading(false)
    }
    if (memberId) fetchData()
  }, [memberId])

  async function handleCheckin() {
    if (!checkinEvent) return
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        member_id: memberId,
        activity: checkinEvent,
        checked_in_at: new Date().toISOString(),
      })
    })
    setCheckinStatus("success")
    setCheckinEvent("")
    // Refresh attendance
    const attRes = await fetch(`/api/attendance?member_id=${memberId}`)
    const attData = await attRes.json()
    setAttendance(attData.records || attData)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Self Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2 items-end" onSubmit={e => { e.preventDefault(); handleCheckin() }}>
            <select value={checkinEvent} onChange={e => setCheckinEvent(e.target.value)} className="border rounded px-2 py-1 flex-1">
              <option value="">Select Event/Service/Group</option>
              {events.map((ev: any) => <option key={ev.id} value={ev.title}>{ev.title}</option>)}
            </select>
            <Button type="submit" disabled={!checkinEvent}>Check-in</Button>
          </form>
          {checkinStatus === "success" && <div className="text-green-600 mt-2">Check-in successful!</div>}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>My Attendance History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Loading...</div> : (
            <>
              <ul className="mb-4">
                {attendance.map((a: any, i: number) => (
                  <li key={i} className="flex gap-2 items-center text-sm border-b py-1">
                    <span>{a.date}</span>
                    <span className="text-gray-500">{a.activity}</span>
                    <span className="text-xs text-gray-400">{a.check_in_time && new Date(a.check_in_time).toLocaleTimeString()}</span>
                  </li>
                ))}
                {attendance.length === 0 && <li className="text-gray-400">No attendance records yet.</li>}
              </ul>
              <Bar
                data={{
                  labels: Array.from(new Set(attendance.map(a => a.date))).sort(),
                  datasets: [
                    {
                      label: "Check-ins",
                      data: Array.from(new Set(attendance.map(a => a.date))).sort().map(date => attendance.filter(a => a.date === date).length),
                      backgroundColor: "#6366f1",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { x: { title: { display: true, text: "Date" } }, y: { title: { display: true, text: "Check-ins" }, beginAtZero: true } },
                }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
