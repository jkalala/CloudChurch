import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Search, BookOpen, Sun } from "lucide-react"

// Custom hook for devotional and study generation logic
interface UseBibleToolsGenerationParams {
  setDevotional: React.Dispatch<React.SetStateAction<any | null>>;
  setDevotionalLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setDevotionalError: React.Dispatch<React.SetStateAction<string>>;
  setStudyResult: React.Dispatch<React.SetStateAction<any | null>>;
  setStudyLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setStudyError: React.Dispatch<React.SetStateAction<string>>;
}
export function useBibleToolsGeneration({ setDevotional, setDevotionalLoading, setDevotionalError, setStudyResult, setStudyLoading, setStudyError }: UseBibleToolsGenerationParams) {
  const handleGetDevotional = useCallback(async () => {
    setDevotionalLoading(true);
    setDevotionalError("");
    setDevotional(null);
    try {
      const res = await fetch("/api/bible/devotional");
      if (!res.ok) throw new Error("Failed to fetch devotional");
      const data = await res.json();
      setDevotional(data);
    } catch (e: any) {
      setDevotionalError(e.message || "Failed to fetch devotional");
    } finally {
      setDevotionalLoading(false);
    }
  }, [setDevotional, setDevotionalLoading, setDevotionalError]);

  const handleStudy = useCallback(async (studyInput: string, studyType: string) => {
    if (!studyInput.trim()) return;
    setStudyLoading(true);
    setStudyError("");
    setStudyResult(null);
    try {
      const res = await fetch("/api/bible/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verse: studyInput, reference: studyInput, studyType }),
      });
      if (!res.ok) throw new Error("Failed to generate study");
      const data = await res.json();
      setStudyResult(data);
    } catch (e: any) {
      setStudyError(e.message || "Failed to generate study");
    } finally {
      setStudyLoading(false);
    }
  }, [setStudyResult, setStudyLoading, setStudyError]);

  return { handleGetDevotional, handleStudy };
}

export default function AIBibleTools() {
  const [activeTab, setActiveTab] = useState("search")

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")

  // Devotional state
  const [devotional, setDevotional] = useState<any | null>(null)
  const [devotionalLoading, setDevotionalLoading] = useState(false)
  const [devotionalError, setDevotionalError] = useState("")

  // Study/Q&A state
  const [studyInput, setStudyInput] = useState("")
  const [studyType, setStudyType] = useState("general")
  const [studyResult, setStudyResult] = useState<any | null>(null)
  const [studyLoading, setStudyLoading] = useState(false)
  const [studyError, setStudyError] = useState("")

  // Place this after all state declarations
  const { handleGetDevotional, handleStudy } = useBibleToolsGeneration({ setDevotional, setDevotionalLoading, setDevotionalError, setStudyResult, setStudyLoading, setStudyError });

  // --- Handlers ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearchLoading(true)
    setSearchError("")
    setSearchResults([])
    try {
      const res = await fetch("/api/bible/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, limit: 10 }),
      })
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setSearchResults(data.verses || [])
    } catch (e: any) {
      setSearchError(e.message || "Search failed")
    } finally {
      setSearchLoading(false)
    }
  }

  // --- UI ---
  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-blue-600" /> AI Bible Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" /> Search
              </TabsTrigger>
              <TabsTrigger value="devotional" className="flex items-center gap-2">
                <Sun className="h-4 w-4" /> Daily Devotional
              </TabsTrigger>
              <TabsTrigger value="study" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> AI Bible Study
              </TabsTrigger>
            </TabsList>

            {/* --- Search Tab --- */}
            <TabsContent value="search">
              <div className="space-y-4">
                <Input
                  placeholder="Search for a Bible verse, topic, or question..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  disabled={searchLoading}
                />
                <Button onClick={handleSearch} disabled={searchLoading || !searchQuery.trim()}>
                  {searchLoading ? "Searching..." : "Search"}
                </Button>
                {searchError && <div className="text-red-500 text-sm">{searchError}</div>}
                <div className="space-y-2 mt-4">
                  {searchResults.length > 0 && (
                    <div className="font-semibold mb-2">Results:</div>
                  )}
                  {searchResults.map((v, i) => (
                    <Card key={i} className="bg-blue-50 border-blue-100">
                      <CardContent className="py-2 px-4">
                        <div className="font-bold">{v.reference}</div>
                        <div className="text-gray-700">{v.verse}</div>
                        <div className="text-xs text-gray-500 mt-1">Themes: {v.themes?.join(", ")}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* --- Devotional Tab --- */}
            <TabsContent value="devotional">
              <div className="space-y-4">
                <Button onClick={handleGetDevotional} disabled={devotionalLoading}>
                  {devotionalLoading ? "Loading..." : "Get Today's Devotional"}
                </Button>
                {devotionalError && <div className="text-red-500 text-sm">{devotionalError}</div>}
                {devotional && (
                  <Card className="bg-yellow-50 border-yellow-100 mt-4">
                    <CardContent className="py-4 px-6 space-y-2">
                      <div className="font-bold text-lg">{devotional.verse}</div>
                      <div className="text-gray-700 mb-2">({devotional.reference})</div>
                      <div className="italic text-gray-800">{devotional.devotional}</div>
                      <div className="mt-2">
                        <div className="font-semibold">Reflection Questions:</div>
                        <ul className="list-disc list-inside text-gray-700">
                          {devotional.reflectionQuestions?.map((q: string, i: number) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* --- Study/Q&A Tab --- */}
            <TabsContent value="study">
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter a Bible verse (e.g., John 3:16) or question..."
                  value={studyInput}
                  onChange={e => setStudyInput(e.target.value)}
                  disabled={studyLoading}
                />
                <div className="flex gap-2 items-center">
                  <label className="text-sm">Study Type:</label>
                  <select
                    className="border rounded px-2 py-1"
                    value={studyType}
                    onChange={e => setStudyType(e.target.value)}
                    disabled={studyLoading}
                  >
                    <option value="general">General</option>
                    <option value="historical">Historical</option>
                    <option value="theological">Theological</option>
                    <option value="practical">Practical</option>
                  </select>
                  <Button onClick={() => handleStudy(studyInput, studyType)} disabled={studyLoading || !studyInput.trim()}>
                    {studyLoading ? "Analyzing..." : "Analyze"}
                  </Button>
                </div>
                {studyError && <div className="text-red-500 text-sm">{studyError}</div>}
                {studyResult && (
                  <Card className="bg-green-50 border-green-100 mt-4">
                    <CardContent className="py-4 px-6 space-y-2">
                      <div className="font-bold text-lg">{studyResult.reference}</div>
                      <div className="text-gray-700 mb-2">{studyResult.studyContent}</div>
                      {studyResult.relatedVerses?.length > 0 && (
                        <div className="mt-2">
                          <div className="font-semibold">Related Verses:</div>
                          <ul className="list-disc list-inside text-gray-700">
                            {studyResult.relatedVerses.map((v: any, i: number) => (
                              <li key={i}>
                                <span className="font-bold">{v.reference}:</span> {v.verse}
                                <span className="text-xs text-gray-500 ml-2">({v.connection})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
