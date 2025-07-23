"use client"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function AcceptInvitationPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [valid, setValid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [success, setSuccess] = useState(false)
  const [phone, setPhone] = useState("")
  const [department, setDepartment] = useState("")
  const [churchName, setChurchName] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) {
      setError("Missing invitation token.")
      setLoading(false)
      return
    }
    fetch(`/api/invitations/accept?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.valid) {
          setEmail(data.email)
          setRole(data.role)
          setValid(true)
        } else {
          setError(data.error || "Invalid or expired invitation.")
        }
      })
      .catch(() => setError("Failed to validate invitation."))
      .finally(() => setLoading(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    const res = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, firstName, lastName, phone, department, churchName, profileImage }),
    })
    const data = await res.json()
    if (res.ok) {
      setSuccess(true)
    } else {
      setError(data.error || "Failed to complete signup.")
    }
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setProfileImage(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  if (loading) return <div className="p-8 text-center">Validating invitation...</div>
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>
  if (success) return (
    <div className="p-8 text-center text-green-600">
      <h2 className="text-2xl font-bold mb-2">Welcome to MobileChurch!</h2>
      <p className="mb-4">Your account has been created. You can now log in.</p>
      <a href="/auth" className="text-blue-600 underline">Go to Login</a>
    </div>
  )

  return (
    <div className="max-w-md mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Accept Invitation</h2>
      <p className="mb-2">Email: <b>{email}</b></p>
      <p className="mb-4">Role: <b>{role}</b></p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col items-center gap-2">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400">No Image</span>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Upload Profile Image
          </Button>
        </div>
        <Input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        <Input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <Input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <Input placeholder="Department" value={department} onChange={e => setDepartment(e.target.value)} />
        <Input placeholder="Church Name" value={churchName} onChange={e => setChurchName(e.target.value)} />
        <Button type="submit" className="w-full">Complete Signup</Button>
      </form>
    </div>
  )
} 