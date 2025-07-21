import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toaster } from "../components/ui/toaster";
import { useSermonGeneration } from "../app/components/ai-sermon-assistant";
import { Button } from "../components/ui/button";

jest.mock("../components/auth-provider", () => ({
  useAuth: () => ({ language: "en", setLanguage: jest.fn(), user: { email: "test@example.com" } }),
}));

jest.mock("../lib/ai-sermon-assistant", () => ({
  AISermonAssistant: {
    generateSermonOutline: jest.fn(),
  },
}));

describe("AISermonAssistantComponent", () => {
  it("shows error toast on AI error", async () => {
    const { AISermonAssistant } = require("../lib/ai-sermon-assistant");
    AISermonAssistant.generateSermonOutline.mockImplementation(() => {
      // eslint-disable-next-line no-console
      console.log("MOCK generateSermonOutline CALLED");
      return Promise.reject(new Error("AI error"));
    });

    type SermonOutline = any;
    function TestSermonGen() {
      const [sermonOutlines, setSermonOutlines] = React.useState<SermonOutline[]>([]);
      const [selectedOutline, setSelectedOutline] = React.useState<SermonOutline | null>(null);
      const [isGenerating, setIsGenerating] = React.useState(false);
      const [sermonConfig] = React.useState({
        theme: "Test Theme",
        targetAudience: "general" as "general" | "youth" | "children" | "seniors",
        language: "en" as "en" | "pt" | "fr",
        duration: 30,
      });
      const { handleGenerateSermon } = useSermonGeneration({ sermonOutlines, setSermonOutlines, setSelectedOutline, setIsGenerating, sermonConfig });
      return <Button onClick={handleGenerateSermon}>Generate Sermon</Button>;
    }

    render(
      <>
        <TestSermonGen />
        <Toaster />
      </>
    );
    fireEvent.click(screen.getByText("Generate Sermon"));
    await screen.findByText("Generation Failed", { exact: false });
    await screen.findByText("Failed to generate sermon outline. Please try again.", { exact: false });
  });
}); 