'use client';

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar } from "react-chartjs-2"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ModernLeaderDashboard() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const attRes = await fetch("/api/attendance")
      const attData = await attRes.json()
      setAttendance(attData.records || attData)
      const groupRes = await fetch("/api/bible-study/groups")
      const groupData = await groupRes.json()
      setGroups(groupData.groups || groupData)
      setLoading(false)
    }
    fetchData()
  }, [])

  // Volunteer hours: count attendance records with activity 'volunteer' per member
  const volunteerHours = attendance.filter(a => a.activity === 'volunteer')
  const volunteerByMember: Record<string, number> = {}
  volunteerHours.forEach(a => {
    if (!volunteerByMember[a.member_id]) volunteerByMember[a.member_id] = 0
    volunteerByMember[a.member_id] += 1 // 1 hour per record (customize as needed)
  })

  // Group participation: count attendance per group
  const groupParticipation: Record<string, number> = {}
  attendance.filter(a => a.activity && a.activity.startsWith('group:')).forEach(a => {
    const group = a.activity.split(':')[1]
    if (!groupParticipation[group]) groupParticipation[group] = 0
    groupParticipation[group] += 1
  })

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Volunteer Hours by Member</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>Loading...</div> : (
            <Bar
              data={{
                labels: Object.keys(volunteerByMember),
                datasets: [
                  {
                    label: "Hours",
                    data: Object.values(volunteerByMember),
                    backgroundColor: "#6366f1",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { title: { display: true, text: "Member" } }, y: { title: { display: true, text: "Hours" }, beginAtZero: true } },
              }}
            />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Group Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Filter by Group" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {groups.map((g: any) => <SelectItem key={g.id} value={g.name}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {loading ? <div>Loading...</div> : (
            <Bar
              data={{
                labels: Object.keys(groupParticipation).filter(g => selectedGroup === 'all' || g === selectedGroup),
                datasets: [
                  {
                    label: "Check-ins",
                    data: Object.entries(groupParticipation).filter(([g]) => selectedGroup === 'all' || g === selectedGroup).map(([_, v]) => v),
                    backgroundColor: "#f59e42",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { title: { display: true, text: "Group" } }, y: { title: { display: true, text: "Check-ins" }, beginAtZero: true } },
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}