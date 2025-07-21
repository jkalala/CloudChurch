import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toaster } from "../components/ui/toaster";
import { useWorshipSetGeneration } from "../app/components/ai-worship-planner";
import { Button } from "../components/ui/button";

jest.mock("../components/auth-provider", () => ({
  useAuth: () => ({ language: "en", setLanguage: jest.fn(), user: { email: "test@example.com" } }),
}));

jest.mock("../lib/ai-worship-planner", () => ({
  AIWorshipPlanner: {
    generateWorshipSet: jest.fn(),
  },
}));

describe("AIWorshipPlannerComponent", () => {
  it("shows error toast on AI error", async () => {
    const { AIWorshipPlanner } = require("../lib/ai-worship-planner");
    AIWorshipPlanner.generateWorshipSet.mockImplementation(() => {
      // eslint-disable-next-line no-console
      console.log("MOCK generateWorshipSet CALLED");
      return Promise.reject(new Error("AI error"));
    });

    type WorshipSet = any;
    function TestWorshipSetGen() {
      const [worshipSets, setWorshipSets] = React.useState<WorshipSet[]>([]);
      const [selectedSet, setSelectedSet] = React.useState<WorshipSet | null>(null);
      const [isGenerating, setIsGenerating] = React.useState(false);
      const [plannerConfig] = React.useState({
        theme: "Test Theme",
        date: new Date().toISOString().split("T")[0],
        duration: 25,
        language: "en" as "en" | "pt" | "fr",
        includeHymns: true,
        tempoPreference: "mixed" as "slow" | "medium" | "fast" | "mixed",
        difficultyLevel: "medium" as "easy" | "medium" | "hard",
      });
      const { handleGenerateWorshipSet } = useWorshipSetGeneration({ worshipSets, setWorshipSets, setSelectedSet, setIsGenerating, plannerConfig });
      return <Button onClick={handleGenerateWorshipSet}>Generate Worship Set</Button>;
    }

    render(
      <>
        <TestWorshipSetGen />
        <Toaster />
      </>
    );
    fireEvent.click(screen.getByText("Generate Worship Set"));
    await screen.findByText("Generation Failed", { exact: false });
    await screen.findByText("Failed to generate worship set. Please try again.", { exact: false });
  });
}); 