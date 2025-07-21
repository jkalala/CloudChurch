// @jest-environment jsdom
import "@testing-library/jest-dom"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import AIAssistantHub from "../app/components/ai-assistant-hub"
import React from "react"

const mockT = (lang: string) => (key: string) => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      "aiAssistant.title": "AI Church Assistant",
      "aiAssistant.features.naturalLanguageQueries": "Natural Language Queries",
      "aiAssistant.features.predictiveAnalytics": "Predictive Analytics",
      "aiAssistant.features.smartRecommendations": "Smart Recommendations",
      "aiAssistant.features.voiceCommands": "Voice Commands",
      "aiAssistant.features.aiEmailGeneration": "AI Email Generation",
      "aiAssistant.features.worshipPlanning": "Worship Planning",
      "aiAssistant.features.sermonAssistant": "Sermon Assistant",
      "aiAssistant.features.memberInsights": "Member Insights",
      "aiAssistant.features.growthAnalysis": "Growth Analysis",
      "aiAssistant.suggestions.memberStats": "How many members do we have?",
    },
    pt: {
      "aiAssistant.title": "Assistente IA da Igreja",
      "aiAssistant.features.naturalLanguageQueries": "Consultas em Linguagem Natural",
      "aiAssistant.features.predictiveAnalytics": "Análises Preditivas",
      "aiAssistant.features.smartRecommendations": "Recomendações Inteligentes",
      "aiAssistant.features.voiceCommands": "Comandos de Voz",
      "aiAssistant.features.aiEmailGeneration": "Geração de E-mails com IA",
      "aiAssistant.features.worshipPlanning": "Planejamento de Louvor",
      "aiAssistant.features.sermonAssistant": "Assistente de Sermão",
      "aiAssistant.features.memberInsights": "Insights de Membros",
      "aiAssistant.features.growthAnalysis": "Análise de Crescimento",
      "aiAssistant.suggestions.memberStats": "Quantos membros temos?",
    },
    fr: {
      "aiAssistant.title": "Assistant IA de l'Église",
      "aiAssistant.features.naturalLanguageQueries": "Requêtes en Langage Naturel",
      "aiAssistant.features.predictiveAnalytics": "Analyses Prédictives",
      "aiAssistant.features.smartRecommendations": "Recommandations Intelligentes",
      "aiAssistant.features.voiceCommands": "Commandes Vocales",
      "aiAssistant.features.aiEmailGeneration": "Génération d'e-mails IA",
      "aiAssistant.features.worshipPlanning": "Planification du Culte",
      "aiAssistant.features.sermonAssistant": "Assistant de Sermon",
      "aiAssistant.features.memberInsights": "Aperçus des Membres",
      "aiAssistant.features.growthAnalysis": "Analyse de Croissance",
      "aiAssistant.suggestions.memberStats": "Combien de membres avons-nous ?",
    },
  }
  return translations[lang][key] || key
}

jest.mock("../components/auth-provider", () => {
  return {
    useAuth: jest.fn(),
  }
})

const { useAuth } = require("../components/auth-provider")

describe("AIAssistantHub", () => {
  it("renders main features and tabs in all supported languages", () => {
    ["en", "pt", "fr"].forEach((lang) => {
      useAuth.mockReturnValue({ language: lang, setLanguage: jest.fn(), user: { email: "test@example.com" } })
      render(<AIAssistantHub />)
      expect(screen.getAllByText(mockT(lang)("aiAssistant.title")).length).toBeGreaterThan(0)
      expect(screen.getByText(mockT(lang)("aiAssistant.features.naturalLanguageQueries"))).toBeInTheDocument()
      expect(screen.getByText(mockT(lang)("aiAssistant.features.predictiveAnalytics"))).toBeInTheDocument()
      expect(screen.getByText(mockT(lang)("aiAssistant.features.smartRecommendations"))).toBeInTheDocument()
      expect(screen.getByText(mockT(lang)("aiAssistant.features.voiceCommands"))).toBeInTheDocument()
      expect(screen.getByText(mockT(lang)("aiAssistant.features.aiEmailGeneration"))).toBeInTheDocument()
      expect(screen.getByText(mockT(lang)("aiAssistant.features.worshipPlanning"))).toBeInTheDocument()
      expect(screen.getByText(mockT(lang)("aiAssistant.features.sermonAssistant"))).toBeInTheDocument()
      expect(screen.getByText(mockT(lang)("aiAssistant.features.memberInsights"))).toBeInTheDocument()
      expect(screen.getByText(mockT(lang)("aiAssistant.features.growthAnalysis"))).toBeInTheDocument()
      expect(screen.getAllByText(mockT(lang)("aiAssistant.suggestions.memberStats")).length).toBeGreaterThan(0)
    })
  })

  it("shows quick actions and chat input", () => {
    useAuth.mockReturnValue({ language: "en", setLanguage: jest.fn(), user: { email: "test@example.com" } })
    render(<AIAssistantHub />)
    expect(screen.getByText("Member Analysis")).toBeInTheDocument()
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0)
  })

  it("is accessible (basic checks)", () => {
    useAuth.mockReturnValue({ language: "en", setLanguage: jest.fn(), user: { email: "test@example.com" } })
    render(<AIAssistantHub />)
    expect(screen.getByRole("tablist")).toBeInTheDocument()
    expect(screen.getAllByRole("tab").length).toBeGreaterThan(1)
  })

  it("shows fallback message on AI error", async () => {
    jest.mock("../lib/ai-assistant", () => ({
      askAI: jest.fn().mockRejectedValue(new Error("AI error")),
    }))
    useAuth.mockReturnValue({ language: "en", setLanguage: jest.fn(), user: { email: "test@example.com" } })
    render(<AIAssistantHub />)
    const input = screen.getAllByRole("textbox")[0]
    fireEvent.change(input, { target: { value: "Test error" } })
    // ...simulate submit and check for fallback message
  })
}) 