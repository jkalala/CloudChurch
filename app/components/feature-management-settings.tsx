"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Settings,
  Shield,
  Crown,
  TestTube,
  Download,
  Upload,
  RotateCcw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Home,
  DollarSign,
  Heart,
  MessageSquare,
  CheckCircle2,
  BookOpen,
  Building2,
  BarChart3,
  Bot,
  Award,
  Users,
  Calendar,
  Radio,
  Camera,
  Smartphone,
  Wifi,
  MapPin,
  Music,
} from "lucide-react"
import { FeatureManager, type Feature, type FeatureCategory } from "@/lib/feature-management"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { useFeatureFlags } from "./_shared/feature-context";

const ICON_MAP = {
  Home,
  DollarSign,
  Heart,
  MessageSquare,
  CheckCircle: CheckCircle2,
  BookOpen,
  Building2,
  BarChart3,
  Bot,
  Award,
  Users,
  Calendar,
  Radio,
  Camera,
  Smartphone,
  Wifi,
  MapPin,
  Music,
}

export default function FeatureManagementSettings() {
  const { userProfile } = useAuth()
  const isAdmin = userProfile?.role === "admin"
  const [features, setFeatures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const { refreshFeatures } = useFeatureFlags();

  useEffect(() => {
    fetchFeatures()
  }, [])

  async function fetchFeatures() {
    setLoading(true)
    try {
      const res = await fetch("/api/features", { credentials: "include" })
      if (!res.ok) throw new Error('Failed to fetch features')
      const data = await res.json()
      setFeatures(data.features || [])
    } catch (error) {
      toast({ title: "Error", description: "Could not load features.", variant: "destructive" })
      setFeatures([])
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(name: string, enabled: boolean) {
    setSaving(name)
    const feature = features.find(f => f.name === name)
    try {
      const res = await fetch("/api/features", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          enabled,
          roles: feature?.roles || [],
          description: feature?.description || ""
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to update feature.", variant: "destructive" })
      }
      await refreshFeatures();
    } catch (err) {
      toast({ title: "Error", description: "Network or server error.", variant: "destructive" })
    }
    fetchFeatures()
    setSaving(null)
  }

  async function handleUpdate(name: string, description: string, roles: string) {
    setSaving(name)
    try {
      const res = await fetch("/api/features", {
        credentials: "include",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          roles: roles.split(",").map((r: string) => r.trim()),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Failed to update feature.", variant: "destructive" })
      }
      await refreshFeatures();
    } catch (err) {
      toast({ title: "Error", description: "Network or server error.", variant: "destructive" })
    }
    fetchFeatures()
    setSaving(null)
  }

  if (!isAdmin) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Management</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading features...</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Enabled</th>
                <th>Roles</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.name}>
                  <td>{f.name}</td>
                  <td>
                    <Input
                      value={f.description || ""}
                      onChange={e => setFeatures(features.map(feat => feat.name === f.name ? { ...feat, description: e.target.value } : feat))}
                      className="w-48"
                    />
                  </td>
                  <td>
                    <Switch
                      checked={!!f.enabled}
                      onCheckedChange={val => handleToggle(f.name, val)}
                      disabled={saving === f.name}
                    />
                  </td>
                  <td>
                    <Input
                      value={f.roles ? f.roles.join(", ") : ""}
                      onChange={e => setFeatures(features.map(feat => feat.name === f.name ? { ...feat, roles: e.target.value.split(",").map((r: string) => r.trim()) } : feat))}
                      className="w-40"
                    />
                  </td>
                  <td>
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(f.name, f.description, f.roles ? f.roles.join(", ") : "")}
                      disabled={saving === f.name}
                    >
                      Save
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  )
}
