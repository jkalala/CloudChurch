import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import HelpWidget from "./components/help-widget"
import OnboardingTooltips from "./components/onboarding-tooltips"
import { useFeature } from "@/lib/feature-management"
import OfflineIndicator from "@/app/components/offline-indicator"
import { AnimationProvider } from "@/lib/contexts/animation-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Connectus",
  description: "Modern church management system",
  manifest: "/manifest.json",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isPWAEnabled = typeof window !== 'undefined' ? useFeature('mobile_pwa') : false;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {isPWAEnabled && (
          <>
            <link rel="manifest" href="/manifest.json" />
            <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js'); }); }` }} />
          </>
        )}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <AnimationProvider>
              {children}
              <Toaster />
              <HelpWidget />
              <OnboardingTooltips />
              {isPWAEnabled && <OfflineIndicator />}
            </AnimationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
