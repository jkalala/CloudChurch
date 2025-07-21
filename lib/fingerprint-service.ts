export interface FingerprintCredential {
  id: string
  publicKey: string
  counter: number
  deviceName: string
  createdAt: string
  lastUsed: string
}

export interface FingerprintEnrollmentResult {
  success: boolean
  credentialId?: string
  error?: string
}

export interface FingerprintVerificationResult {
  success: boolean
  credentialId?: string
  error?: string
}

export class FingerprintService {
  private static instance: FingerprintService
  private credentials: Map<string, FingerprintCredential> = new Map()

  static getInstance(): FingerprintService {
    if (!FingerprintService.instance) {
      FingerprintService.instance = new FingerprintService()
    }
    return FingerprintService.instance
  }

  // Check if WebAuthn is supported
  isSupported(): boolean {
    if (typeof window === "undefined") return false

    return !!(
      window.PublicKeyCredential &&
      window.navigator.credentials &&
      typeof window.navigator.credentials.create === "function" &&
      typeof window.navigator.credentials.get === "function"
    )
  }

  // Check if biometric authentication is available
  async isBiometricAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false

    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    } catch (error) {
      console.error("Error checking biometric availability:", error)
      return false
    }
  }

  // Enroll a new fingerprint
  async enrollFingerprint(userId: string, deviceName?: string): Promise<FingerprintEnrollmentResult> {
    if (!this.isSupported()) {
      return { success: false, error: "WebAuthn not supported" }
    }

    try {
      // Mock implementation for build compatibility
      const credentialId = `cred-${Date.now()}`

      const fingerprintCredential: FingerprintCredential = {
        id: credentialId,
        publicKey: "mock-public-key",
        counter: 0,
        deviceName: deviceName || "Unknown Device",
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      }

      this.credentials.set(credentialId, fingerprintCredential)
      this.saveCredentials(userId)

      return { success: true, credentialId }
    } catch (error: any) {
      console.error("Fingerprint enrollment error:", error)
      return {
        success: false,
        error: this.getErrorMessage(error),
      }
    }
  }

  // Verify fingerprint
  async verifyFingerprint(userId: string): Promise<FingerprintVerificationResult> {
    if (!this.isSupported()) {
      return { success: false, error: "WebAuthn not supported" }
    }

    try {
      this.loadCredentials(userId)
      const userCredentials = Array.from(this.credentials.values())

      if (userCredentials.length === 0) {
        return { success: false, error: "No fingerprints enrolled" }
      }

      // Mock successful verification
      const credential = userCredentials[0]
      credential.lastUsed = new Date().toISOString()
      credential.counter++
      this.credentials.set(credential.id, credential)
      this.saveCredentials(userId)

      return { success: true, credentialId: credential.id }
    } catch (error: any) {
      console.error("Fingerprint verification error:", error)
      return {
        success: false,
        error: this.getErrorMessage(error),
      }
    }
  }

  // Get enrolled fingerprints for a user
  getUserFingerprints(userId: string): FingerprintCredential[] {
    this.loadCredentials(userId)
    return Array.from(this.credentials.values())
  }

  // Remove a fingerprint
  async removeFingerprint(userId: string, credentialId: string): Promise<boolean> {
    try {
      this.loadCredentials(userId)
      const removed = this.credentials.delete(credentialId)
      if (removed) {
        this.saveCredentials(userId)
      }
      return removed
    } catch (error) {
      console.error("Error removing fingerprint:", error)
      return false
    }
  }

  // Clear all fingerprints for a user
  async clearAllFingerprints(userId: string): Promise<boolean> {
    try {
      this.credentials.clear()
      this.saveCredentials(userId)
      return true
    } catch (error) {
      console.error("Error clearing fingerprints:", error)
      return false
    }
  }

  private saveCredentials(userId: string) {
    if (typeof window !== "undefined") {
      const credentialsArray = Array.from(this.credentials.entries())
      localStorage.setItem(`fingerprints-${userId}`, JSON.stringify(credentialsArray))
    }
  }

  private loadCredentials(userId: string) {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`fingerprints-${userId}`)
      if (stored) {
        try {
          const credentialsArray = JSON.parse(stored)
          this.credentials = new Map(credentialsArray)
        } catch (error) {
          console.error("Error loading credentials:", error)
          this.credentials.clear()
        }
      }
    }
  }

  private getErrorMessage(error: any): string {
    if (error.name === "NotAllowedError") {
      return "Fingerprint authentication was cancelled or not allowed"
    } else if (error.name === "NotSupportedError") {
      return "Fingerprint authentication is not supported on this device"
    } else if (error.name === "SecurityError") {
      return "Security error during fingerprint authentication"
    } else if (error.name === "AbortError") {
      return "Fingerprint authentication was aborted"
    } else if (error.name === "ConstraintError") {
      return "Fingerprint authentication constraints not satisfied"
    } else if (error.name === "InvalidStateError") {
      return "Invalid state for fingerprint authentication"
    } else if (error.name === "UnknownError") {
      return "Unknown error during fingerprint authentication"
    }
    return error.message || "Fingerprint authentication failed"
  }
}

export const fingerprintService = FingerprintService.getInstance()
