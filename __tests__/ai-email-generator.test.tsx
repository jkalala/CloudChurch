import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Toaster } from "../components/ui/toaster";
import { useEmailGeneration } from "../app/components/ai-email-generator";
import { Button } from "../components/ui/button";

jest.mock("../components/auth-provider", () => ({
  useAuth: () => ({ language: "en", setLanguage: jest.fn(), user: { email: "test@example.com" } }),
}));

jest.mock("../lib/ai-email-service", () => ({
  AIEmailService: {
    generateBulkEmails: jest.fn(),
  },
}));

describe("AIEmailGenerator", () => {
  it("shows error toast on AI error", async () => {
    const { AIEmailService } = require("../lib/ai-email-service");
    AIEmailService.generateBulkEmails.mockImplementation(() => {
      // eslint-disable-next-line no-console
      console.log("MOCK generateBulkEmails CALLED");
      return Promise.reject(new Error("AI error"));
    });

    function TestEmailGen() {
      const [generatedEmails, setGeneratedEmails] = React.useState<any[]>([]);
      const [isGenerating, setIsGenerating] = React.useState(false);
      const selectedTemplate = "pastoral_care";
      const selectedMembers = ["1", "2"];
      const customContext = { custom_message: "Test message" };
      const { handleGenerateEmails } = useEmailGeneration({ selectedTemplate, selectedMembers, customContext, setGeneratedEmails, setIsGenerating });
      return <Button onClick={handleGenerateEmails}>Generate Emails</Button>;
    }

    render(
      <>
        <TestEmailGen />
        <Toaster />
      </>
    );
    fireEvent.click(screen.getByText("Generate Emails"));
    await screen.findByText("Generation Failed", { exact: false });
    await screen.findByText("Failed to generate emails. Please try again.", { exact: false });
  });
}); 