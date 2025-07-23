"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Database, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOffline } from "@/hooks/use-offline"
import { useEffect, useState } from "react"
import { offlineStorage } from "@/lib/offline-storage"

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function OfflinePage() {
  const router = useRouter()
  const { isOnline, isOfflineReady, addPendingSync, getOfflineData } = useOffline()
  const [members, setMembers] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [attendanceNote, setAttendanceNote] = useState("")
  const [attendanceStatus, setAttendanceStatus] = useState<string | null>(null)

  useEffect(() => {
    if (isOfflineReady) {
      getOfflineData("members").then(setMembers)
      getOfflineData("events").then(setEvents)
    }
  }, [isOfflineReady])

  const handleRetry = () => {
    if (isOnline) {
      router.back()
    } else {
      window.location.reload()
    }
  }

  const handleAttendance = async () => {
    await addPendingSync("attendance", { note: attendanceNote, timestamp: Date.now() })
    setAttendanceStatus("Recorded for sync when online.")
    setAttendanceNote("")
  }

  const offlineFeatures = [
    {
      icon: Users,
      title: "Member Directory",
      description: "View member information and contact details",
      available: true,
    },
    {
      icon: Calendar,
      title: "Events Calendar",
      description: "Check upcoming events and schedules",
      available: true,
    },
    {
      icon: Database,
      title: "Attendance Recording",
      description: "Record attendance (will sync when online)",
      available: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Main Offline Card */}
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>You're Offline</CardTitle>
            <CardDescription>
              No internet connection detected. Don't worry, you can still access some features!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>

        {/* Available Features */}
        {isOfflineReady && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Offline</CardTitle>
              <CardDescription>These features work without an internet connection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1">Member Directory</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {members.length === 0 ? <li>No members cached.</li> : members.map((m) => <li key={m.id}>{m.name || m.email}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Events Calendar</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {events.length === 0 ? <li>No events cached.</li> : events.map((e) => <li key={e.id}>{e.title || e.name}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Attendance Recording</h4>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={attendanceNote}
                    onChange={e => setAttendanceNote(e.target.value)}
                    placeholder="Add note (optional)"
                    className="border rounded px-2 py-1 text-xs w-full"
                  />
                  <Button size="sm" onClick={handleAttendance}>Record</Button>
                </div>
                {attendanceStatus && <p className="text-xs text-green-600">{attendanceStatus}</p>}
                <p className="text-xs text-muted-foreground">Attendance will sync when back online.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/app")} className="flex-1">
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push("/app/members")} className="flex-1">
            View Members
          </Button>
        </div>
      </div>
    </div>
  )
}
