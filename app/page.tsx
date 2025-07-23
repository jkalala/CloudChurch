"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Users, DollarSign, Calendar, Heart } from "lucide-react"
import Image from "next/image"

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function ChurchApp() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("members")

  useEffect(() => {
    const tab = searchParams.get("tab")
    if (tab) {
      setActiveTab(tab)
    }
    // Redirect to onboarding for new users
    router.push("/onboarding")
  }, [searchParams, router])

  const stats = [
    { title: "Active Members", value: "1,247", icon: Users, change: "+12%" },
    { title: "Monthly Tithes", value: "$8,450", icon: DollarSign, change: "+8%" },
    { title: "Upcoming Events", value: "7", icon: Calendar, change: "+2" },
    { title: "Prayer Requests", value: "23", icon: Heart, change: "+5" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          <Image
            src="/images/semente-bendita-logo.png"
            alt="Connectus"
            width={120}
            height={120}
            className="mx-auto animate-pulse"
          />
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Connectus...</p>
      </div>
    </div>
  )
}
