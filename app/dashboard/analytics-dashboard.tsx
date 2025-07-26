"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, Pie } from "react-chartjs-2"
import { Loader2 } from "lucide-react"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
} from "chart.js"
import { saveAs } from "file-saver"
import { format, subDays } from "date-fns"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
)

function exportToCSV(data: any) {
  const flatten = (obj: any, prefix = "") =>
    Object.keys(obj).reduce((acc: any, k) => {
      const pre = prefix.length ? prefix + "." : ""
      if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k]))
        Object.assign(acc, flatten(obj[k], pre + k))
      else acc[pre + k] = obj[k]
      return acc
    }, {})
  const flat = flatten(data)
  const headers = Object.keys(flat)
  const values = headers.map((h) => JSON.stringify(flat[h] ?? ""))
  const csv = headers.join(",") + "\n" + values.join(",")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  saveAs(blob, "analytics.csv")
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(
    () => ({ start: subDays(new Date(), 30), end: new Date() })
  )
  const [departments, setDepartments] = useState<string[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [eventTypes, setEventTypes] = useState<string[]>([])
  const [selectedEventType, setSelectedEventType] = useState<string>("")
  const [memberStatus, setMemberStatus] = useState<string>("")
  const [activeTab, setActiveTab] = useState("overview")
  const [attendance, setAttendance] = useState<any[]>([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)
  const [manualCheckin, setManualCheckin] = useState({ event: "", members: [] as string[] })
  const [allMembers, setAllMembers] = useState<any[]>([])

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch("/api/departments")
        if (!res.ok) return
        const data = await res.json()
        setDepartments(data.departments || [])
      } catch {}
    }
    fetchDepartments()
  }, [])

  useEffect(() => {
    async function fetchEventTypes() {
      try {
        const res = await fetch("/api/event-types")
        if (!res.ok) return
        const data = await res.json()
        setEventTypes(data.eventTypes || [])
      } catch {}
    }
    fetchEventTypes()
  }, [])

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      setError(null)
      try {
        const params =
          `?start=${format(dateRange.start, "yyyy-MM-dd")}&end=${format(dateRange.end, "yyyy-MM-dd")}` +
          (selectedDepartment ? `&department=${encodeURIComponent(selectedDepartment)}` : "") +
          (selectedEventType ? `&eventType=${encodeURIComponent(selectedEventType)}` : "") +
          (memberStatus ? `&memberStatus=${encodeURIComponent(memberStatus)}` : "")
        const res = await fetch(`/api/analytics${params}`)
        if (!res.ok) throw new Error("Failed to fetch analytics")
        const data = await res.json()
        setAnalytics(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [dateRange, selectedDepartment, selectedEventType, memberStatus])

  useEffect(() => {
    async function fetchAttendance() {
      setAttendanceLoading(true)
      const res = await fetch("/api/attendance")
      const data = await res.json()
      setAttendance(data.records || data || [])
      setAttendanceLoading(false)
    }
    fetchAttendance()
    fetch("/api/members").then(r => r.json()).then(d => setAllMembers(d.members || d))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>
  }

  if (!analytics) {
    return <div className="text-center">No analytics data available.</div>
  }

  // Example chart data
  const memberPieData = {
    labels: ["Active", "Inactive", "New This Month"],
    datasets: [
      {
        data: [
          analytics.members.active,
          analytics.members.inactive,
          analytics.members.newThisMonth,
        ],
        backgroundColor: ["#22c55e", "#ef4444", "#3b82f6"],
      },
    ],
  }

  const eventBarData = {
    labels: ["Upcoming", "Past"],
    datasets: [
      {
        label: "Events",
        data: [analytics.events.upcoming, analytics.events.past],
        backgroundColor: ["#6366f1", "#a3a3a3"],
      },
    ],
  }

  // Trend chart data
  const attendanceTrendData = {
    labels: analytics.trends.attendance.map((t: any) => t.week),
    datasets: [
      {
        label: "Attendance (last 12 weeks)",
        data: analytics.trends.attendance.map((t: any) => t.count),
        backgroundColor: "#3b82f6",
        borderColor: "#3b82f6",
        fill: false,
        tension: 0.4,
      },
    ],
  }

  const financialTrendData = {
    labels: analytics.trends.financial.map((t: any) => t.month),
    datasets: [
      {
        label: "Total Giving (last 12 months)",
        data: analytics.trends.financial.map((t: any) => t.total),
        backgroundColor: "#22c55e",
        borderColor: "#22c55e",
        fill: false,
        tension: 0.4,
      },
    ],
  }

  const newMembersTrendData = {
    labels: analytics.trends.newMembers.map((t: any) => t.month),
    datasets: [
      {
        label: "New Members (last 12 months)",
        data: analytics.trends.newMembers.map((t: any) => t.count),
        backgroundColor: "#6366f1",
        borderColor: "#6366f1",
        fill: false,
        tension: 0.4,
      },
    ],
  }

  const eventParticipationTrendData = {
    labels: analytics.trends.eventParticipation.map((t: any) => t.month),
    datasets: [
      {
        label: "Events (last 12 months)",
        data: analytics.trends.eventParticipation.map((t: any) => t.count),
        backgroundColor: "#f59e42",
        borderColor: "#f59e42",
        fill: false,
        tension: 0.4,
      },
    ],
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="mb-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="attendance">Attendance</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 px-6 pt-6">
          <label className="font-semibold">Date Range:</label>
          <input
            type="date"
            value={format(dateRange.start, "yyyy-MM-dd")}
            onChange={e => setDateRange(r => ({ ...r, start: new Date(e.target.value) }))}
            className="border rounded px-2 py-1"
          />
          <span>-</span>
          <input
            type="date"
            value={format(dateRange.end, "yyyy-MM-dd")}
            onChange={e => setDateRange(r => ({ ...r, end: new Date(e.target.value) }))}
            className="border rounded px-2 py-1"
          />
          <button
            className="ml-2 px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setDateRange({ start: subDays(new Date(), 30), end: new Date() })}
          >
            Last 30 Days
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setDateRange({ start: subDays(new Date(), 6), end: new Date() })}
          >
            Last 7 Days
          </button>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={() => setDateRange({ start: new Date(new Date().getFullYear(), 0, 1), end: new Date() })}
          >
            This Year
          </button>
          {/* Department Filter */}
          <label className="font-semibold ml-6">Department:</label>
          <select
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            {departments.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          {/* Event Type Filter */}
          <label className="font-semibold ml-6">Event Type:</label>
          <select
            value={selectedEventType}
            onChange={e => setSelectedEventType(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {/* Member Status Filter */}
          <label className="font-semibold ml-6">Member Status:</label>
          <select
            value={memberStatus}
            onChange={e => setMemberStatus(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="new">New</option>
          </select>
        </div>
        {/* Export Buttons */}
        <div className="flex justify-end gap-4 px-6 pt-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={() => exportToCSV(analytics)}
          >
            Export CSV
          </button>
          <button
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
            onClick={() => alert("PDF export coming soon!")}
          >
            Export PDF
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 p-6">
          {/* Attendance */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analytics.attendance.totalRecords ?? 0}</div>
              <div className="text-gray-500">Total Attendance Records</div>
            </CardContent>
          </Card>

          {/* Financial */}
          <Card>
            <CardHeader>
              <CardTitle>Financial</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${analytics.financial.totalIncome?.toLocaleString() ?? 0}</div>
              <div className="text-gray-500">Total Income</div>
              <div className="flex gap-4 mt-2">
                <div>
                  <div className="font-semibold text-green-600">Tithes</div>
                  <div>${analytics.financial.totalTithes?.toLocaleString() ?? 0}</div>
                </div>
                <div>
                  <div className="font-semibold text-blue-600">Offerings</div>
                  <div>${analytics.financial.totalOfferings?.toLocaleString() ?? 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={memberPieData} />
              <div className="flex justify-between mt-4 text-sm text-gray-600">
                <div>Total: {analytics.members.total}</div>
                <div>New: {analytics.members.newThisMonth}</div>
              </div>
            </CardContent>
          </Card>

          {/* Events Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={eventBarData} />
              <div className="flex justify-between mt-4 text-sm text-gray-600">
                <div>Total: {analytics.events.total}</div>
                <div>Upcoming: {analytics.events.upcoming}</div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Trend Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Trend (Last 12 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={attendanceTrendData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Financial Trend (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={financialTrendData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>New Members (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={newMembersTrendData} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Event Participation (Last 12 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={eventParticipationTrendData} />
            </CardContent>
          </Card>
        </div>
        {/* Forecast Section */}
        <div className="px-6 mt-10">
          <h2 className="text-2xl font-bold mb-4">Forecast</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Next Week's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{analytics.predictions.nextWeekAttendance}</div>
                <div className="text-gray-500">Projected attendees</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Next Month's Giving</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">${analytics.predictions.nextMonthGiving?.toLocaleString()}</div>
                <div className="text-gray-500">Projected total giving</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Next Month's Member Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{analytics.predictions.nextMonthMemberGrowth}</div>
                <div className="text-gray-500">Projected new members</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="attendance">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {attendanceLoading ? <Loader2 className="animate-spin" /> : (
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
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Manual Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={async e => {
              e.preventDefault()
              for (const memberId of manualCheckin.members) {
                await fetch("/api/attendance", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    member_id: memberId,
                    activity: manualCheckin.event || "manual",
                    checked_in_at: new Date().toISOString(),
                  })
                })
              }
              setManualCheckin({ event: "", members: [] })
              // Refresh attendance
              const res = await fetch("/api/attendance")
              const data = await res.json()
              setAttendance(data.records || data || [])
            }}>
              <div className="flex gap-2">
                <Input placeholder="Event/Service/Group" value={manualCheckin.event} onChange={e => setManualCheckin(m => ({ ...m, event: e.target.value }))} className="flex-1" />
                <Select value={manualCheckin.members[0] || ""} onValueChange={v => setManualCheckin(m => ({ ...m, members: [v] }))}>
                  <SelectTrigger className="w-64"><SelectValue placeholder="Select Member" /></SelectTrigger>
                  <SelectContent>
                    {allMembers.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.first_name} {m.last_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full mt-2">Check-in</Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 