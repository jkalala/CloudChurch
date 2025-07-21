import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"

export default function AuditLogDashboard() {
  const [logs, setLogs] = useState<any[]>([])
  const [summary, setSummary] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [actionType, setActionType] = useState("")
  const [category, setCategory] = useState("")
  const [userId, setUserId] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [view, setView] = useState("dashboard") // dashboard or timeline

  const fetchLogs = async (csv = false) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate.toISOString())
    if (endDate) params.append("endDate", endDate.toISOString())
    if (actionType) params.append("actionTypes", actionType)
    if (category) params.append("categories", category)
    if (userId) params.append("userIds", userId)
    if (csv) params.append("format", "csv")
    const res = await fetch(`/api/audit-logs?${params.toString()}`)
    if (csv) {
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      setLoading(false)
      return
    }
    const data = await res.json()
    setLogs(data.logs || [])
    setSummary(data.summary || [])
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [startDate, endDate, actionType, category, userId])
  useEffect(() => {
    fetch("/api/users").then(res => res.json()).then(setUsers)
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4 items-end">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
            <div>
              <label className="block text-xs mb-1">Action Type</label>
              <Input value={actionType} onChange={e => setActionType(e.target.value)} placeholder="e.g. view, edit, delete" className="w-32" />
            </div>
            <div>
              <label className="block text-xs mb-1">Category</label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. general, resource" className="w-32" />
            </div>
            <div>
              <label className="block text-xs mb-1">User</label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button variant={view === 'dashboard' ? 'secondary' : 'outline'} onClick={() => setView('dashboard')}>Dashboard</Button>
                <Button variant={view === 'timeline' ? 'secondary' : 'outline'} onClick={() => setView('timeline')}>Timeline</Button>
              </div>
              <Button onClick={() => fetchLogs(true)} variant="outline" className="ml-auto"><Download className="h-4 w-4 mr-1" /> Export CSV</Button>
            </div>
            {view === 'dashboard' ? (
              <>
                {/* Summary and Charts */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Summary (last 30 days)</h3>
                  <div className="flex flex-wrap gap-4">
                    {summary.map((s: any, i: number) => (
                      <div key={i} className="bg-gray-50 border rounded p-3 min-w-[180px]">
                        <div className="text-xs text-gray-500">{new Date(s.day).toLocaleDateString()}</div>
                        <div className="font-bold text-lg">{s.action_count}</div>
                        <div className="text-xs">{s.action_type} ({s.action_category})</div>
                        <div className="text-xs text-gray-500">{s.unique_users} users, {s.resources_affected} resources</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                  <Card>
                    <CardHeader><CardTitle>Activity by Type</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={summary}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="action_type" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="action_count" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle>Daily Activity</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={summary}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="action_count" stroke="#82ca9d" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Activity Timeline</h3>
                <div className="space-y-4">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-24 text-right text-xs text-gray-500">{new Date(log.log_timestamp).toLocaleString()}</div>
                      <div className="relative w-full">
                        <div className="absolute top-1/2 left-0 w-px h-full bg-gray-200 -translate-x-4 -translate-y-1/2"></div>
                        <div className="absolute top-1/2 left-0 w-2 h-2 bg-blue-500 rounded-full -translate-x-5 -translate-y-1/2"></div>
                        <div className="pl-4">
                          <div className="font-medium">{log.log_user_email}</div>
                          <div className="text-sm">{log.log_action_type} - {log.log_action_category}</div>
                          <div className="text-xs text-gray-600">{log.log_details}</div>
                          <div className="text-xs text-gray-500">Resource ID: {log.log_resource_id}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 