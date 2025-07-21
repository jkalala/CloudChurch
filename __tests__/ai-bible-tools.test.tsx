import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Toaster } from "../components/ui/toaster";
import { useBibleToolsGeneration } from "../app/components/ai-bible-tools";
import { Button } from "../components/ui/button";

describe("AIBibleTools", () => {
  beforeEach(() => {
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("shows error message on devotional fetch error", async () => {
    // @ts-ignore
    global.fetch.mockImplementation(() => Promise.resolve({ ok: false }));

    function TestDevotional() {
      const [devotional, setDevotional] = React.useState<any | null>(null);
      const [devotionalLoading, setDevotionalLoading] = React.useState(false);
      const [devotionalError, setDevotionalError] = React.useState("");
      const [studyResult, setStudyResult] = React.useState<any | null>(null);
      const [studyLoading, setStudyLoading] = React.useState(false);
      const [studyError, setStudyError] = React.useState("");
      const { handleGetDevotional } = useBibleToolsGeneration({ setDevotional, setDevotionalLoading, setDevotionalError, setStudyResult, setStudyLoading, setStudyError });
      return (
        <>
          <Button onClick={handleGetDevotional}>Get Devotional</Button>
          {devotionalError && <div>{devotionalError}</div>}
        </>
      );
    }

    render(
      <>
        <TestDevotional />
        <Toaster />
      </>
    );
    fireEvent.click(screen.getByText("Get Devotional"));
    await screen.findByText("Failed to fetch devotional", { exact: false });
  });

  it("shows error message on study fetch error", async () => {
    // @ts-ignore
    global.fetch.mockImplementation(() => Promise.resolve({ ok: false }));

    function TestStudy() {
      const [devotional, setDevotional] = React.useState<any | null>(null);
      const [devotionalLoading, setDevotionalLoading] = React.useState(false);
      const [devotionalError, setDevotionalError] = React.useState("");
      const [studyResult, setStudyResult] = React.useState<any | null>(null);
      const [studyLoading, setStudyLoading] = React.useState(false);
      const [studyError, setStudyError] = React.useState("");
      const { handleStudy } = useBibleToolsGeneration({ setDevotional, setDevotionalLoading, setDevotionalError, setStudyResult, setStudyLoading, setStudyError });
      return (
        <>
          <Button onClick={() => handleStudy("John 3:16", "general")}>Analyze</Button>
          {studyError && <div>{studyError}</div>}
        </>
      );
    }

    render(
      <>
        <TestStudy />
        <Toaster />
      </>
    );
    fireEvent.click(screen.getByText("Analyze"));
    await screen.findByText("Failed to generate study", { exact: false });
  });
}); 