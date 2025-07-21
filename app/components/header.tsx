import Image from "next/image"
import LanguageSelector from "./language-selector";
import { useState } from "react";
import { getCountryLanguage } from "@/lib/i18n";
import { useAuth } from "@/components/auth-provider";

export default function Header() {
  const { language, setLanguage } = useAuth();
  return (
    <header className="flex items-center justify-between py-4 px-6 border-b bg-white">
      <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/semente-bendita-logo.png" alt="Connectus" width={40} height={40} />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Connectus</h1>
              <p className="text-sm text-gray-600">Mobile Church Platform</p>
            </div>
          </div>
          {/* Navigation or other header elements can go here */}
        </div>
      </div>
      <div className="flex-1 flex items-center gap-4">
        {/* ...existing logo, nav, etc... */}
      </div>
      <div className="flex items-center gap-4">
        {/* ...existing user/profile dropdown, etc... */}
        <LanguageSelector
          currentLanguage={language}
          onLanguageChange={setLanguage}
          variant="button"
          size="sm"
        />
      </div>
    </header>
  )
}
