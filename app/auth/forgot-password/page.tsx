"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Phone, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

export default function ForgotPasswordPage() {
  const [method, setMethod] = useState("email")
  const [step, setStep] = useState("request") // request, sent, reset
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const handlePasswordReset = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStep("sent")
    } catch (error) {
      setErrors({ general: "Failed to send reset code" })
    } finally {
      setLoading(false)
    }
  }

  const handleCodeVerification = async () => {
    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStep("reset")
    } catch (error) {
      setErrors({ code: "Invalid verification code" })
    } finally {
      setLoading(false)
    }
  }

  const handleNewPassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    setLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      router.push("/auth?message=password-reset-success")
    } catch (error) {
      setErrors({ general: "Failed to reset password" })
    } finally {
      setLoading(false)
    }
  }

  if (step === "sent") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Check Your {method === "email" ? "Email" : "Phone"}</CardTitle>
            <CardDescription>
              We've sent a password reset code to {method === "email" ? formData.email : formData.phone}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reset-code">Reset Code</Label>
              <Input
                id="reset-code"
                placeholder="Enter 6-digit code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
              {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
            </div>

            <Button
              onClick={handleCodeVerification}
              disabled={loading || formData.code.length !== 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center">
              <Button variant="link" size="sm" className="text-indigo-600">
                Resend Code
              </Button>
            </div>

            <Button variant="ghost" onClick={() => setStep("request")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "reset") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>Enter a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className={`mt-1 ${errors.confirmPassword ? "border-red-500" : ""}`}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                Password should be at least 8 characters with a mix of letters, numbers, and symbols.
              </p>
            </div>

            <Button
              onClick={handleNewPassword}
              disabled={loading || !formData.newPassword || !formData.confirmPassword}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>Enter your email or phone number to receive a password reset code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method Selection */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={method === "email" ? "default" : "outline"}
              size="sm"
              onClick={() => setMethod("email")}
              className="flex-1"
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </Button>
            <Button
              variant={method === "phone" ? "default" : "outline"}
              size="sm"
              onClick={() => setMethod("phone")}
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-1" />
              Phone
            </Button>
          </div>

          <div>
            <Label htmlFor="reset-input">{method === "email" ? "Email Address" : "Phone Number"}</Label>
            <Input
              id="reset-input"
              type={method === "email" ? "email" : "tel"}
              placeholder={method === "email" ? "john@church.com" : "+254 700 123 456"}
              value={method === "email" ? formData.email : formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  [method]: e.target.value,
                }))
              }
              className="mt-1"
            />
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          )}

          <Button
            onClick={handlePasswordReset}
            disabled={loading || !(method === "email" ? formData.email : formData.phone)}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending Code...
              </>
            ) : (
              "Send Reset Code"
            )}
          </Button>

          <Button variant="ghost" onClick={() => router.push("/auth")} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
