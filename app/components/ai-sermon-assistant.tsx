"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Lightbulb, Clock, Users, Sparkles, Download, Eye, Plus, Search } from "lucide-react"
import { AISermonAssistant, type SermonOutline } from "@/lib/ai-sermon-assistant"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Dispatch, SetStateAction } from "react";

function SortablePoint({ id, index, point, onFindVerses, supportingVerses, isLoadingVerses }: {
  id: string;
  index: number;
  point: any;
  onFindVerses: (point: any, index: number) => void;
  supportingVerses: any[];
  isLoadingVerses: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        background: isDragging ? '#e0f2fe' : undefined,
      }}
      className="border-l-4 border-blue-500 pl-4 bg-white rounded mb-2"
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center gap-2">
        <h5 className="font-medium">
          {index + 1}. {point.title}
        </h5>
        <Button size="sm" variant="outline" onClick={() => onFindVerses(point, index)} disabled={isLoadingVerses}>
          {isLoadingVerses ? "Searching..." : "Find Supporting Verses"}
        </Button>
      </div>
      <p className="text-sm text-gray-600 mt-1">{point.explanation}</p>
      <p className="text-sm text-blue-600 mt-1 italic">{point.application}</p>
      {supportingVerses && supportingVerses.length > 0 && (
        <div className="mt-2 bg-blue-50 p-2 rounded">
          <div className="font-semibold text-xs mb-1">Supporting Verses:</div>
          <ul className="list-disc list-inside text-xs">
            {supportingVerses.map((v: any, i: number) => (
              <li key={i}>
                <span className="font-bold">{v.reference}:</span> {v.verse}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Custom hook for sermon generation logic
interface UseSermonGenerationParams {
  sermonOutlines: SermonOutline[];
  setSermonOutlines: Dispatch<SetStateAction<SermonOutline[]>>;
  setSelectedOutline: Dispatch<SetStateAction<SermonOutline | null>>;
  setIsGenerating: Dispatch<SetStateAction<boolean>>;
  sermonConfig: {
    theme: string;
    targetAudience: "general" | "youth" | "children" | "seniors";
    language: "pt" | "en" | "fr";
    duration: number;
  };
}
export function useSermonGeneration({ sermonOutlines, setSermonOutlines, setSelectedOutline, setIsGenerating, sermonConfig }: UseSermonGenerationParams) {
  const handleGenerateSermon = useCallback(async () => {
    if (!sermonConfig.theme.trim()) {
      toast({
        title: "Missing Theme",
        description: "Please enter a sermon theme.",
        variant: "destructive",
      })
      return;
    }
    setIsGenerating(true);
    try {
      const outline = await AISermonAssistant.generateSermonOutline(
        sermonConfig.theme,
        sermonConfig.targetAudience,
        sermonConfig.language,
        sermonConfig.duration,
      );
      setSermonOutlines([outline, ...sermonOutlines]);
      setSelectedOutline(outline);
      toast({
        title: "Sermon Outline Generated",
        description: `Created sermon outline: \"${outline.title}\".`,
      });
    } catch (error) {
      console.error("Error generating sermon:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate sermon outline. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [sermonConfig, sermonOutlines, setSermonOutlines, setSelectedOutline, setIsGenerating]);
  return { handleGenerateSermon };
}

export default function AISermonAssistantComponent() {
  const [sermonOutlines, setSermonOutlines] = useState<SermonOutline[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedOutline, setSelectedOutline] = useState<SermonOutline | null>(null)
  const [sermonConfig, setSermonConfig] = useState({
    theme: "",
    targetAudience: "general" as "general" | "youth" | "children" | "seniors",
    language: "pt" as "pt" | "en" | "fr",
    duration: 30,
  })
  const [verseSearch, setVerseSearch] = useState("")
  const [draggedPoints, setDraggedPoints] = useState<any[]>([])
  const [supportingVerses, setSupportingVerses] = useState<{ [key: number]: any[] }>({})
  const [loadingVerses, setLoadingVerses] = useState<{ [key: number]: boolean }>({})
  const [allVerses, setAllVerses] = useState<any[]>([])
  const filteredVerses = allVerses.filter(
    (verse) =>
      (verse.reference?.toLowerCase?.().includes(verseSearch.toLowerCase()) || "") ||
      (verse.text?.toLowerCase?.().includes(verseSearch.toLowerCase()) || "") ||
      (verse.theme && Array.isArray(verse.theme) && verse.theme.some((t: string) => t.toLowerCase().includes(verseSearch.toLowerCase())))
  )

  const { language } = useAuth()
  const { t } = useTranslation(language)

  const { handleGenerateSermon } = useSermonGeneration({ sermonOutlines, setSermonOutlines, setSelectedOutline, setIsGenerating, sermonConfig });

  const handleGenerateSeries = async () => {
    if (!sermonConfig.theme.trim()) {
      toast({
        title: "Missing Theme",
        description: "Please enter a series theme.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const series = await AISermonAssistant.generateSermonSeries(
        sermonConfig.theme,
        4, // 4-part series
        sermonConfig.language,
      )

      setSermonOutlines([...series, ...sermonOutlines])
      setSelectedOutline(series[0])

      toast({
        title: "Sermon Series Generated",
        description: `Created 4-part sermon series: "${sermonConfig.theme}".`,
      })
    } catch (error) {
      console.error("Error generating series:", error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate sermon series. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (selectedOutline) {
      setDraggedPoints(selectedOutline.outline.points)
    }
  }, [selectedOutline])

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = draggedPoints.findIndex((p: any) => p.id === active.id)
      const newIndex = draggedPoints.findIndex((p: any) => p.id === over.id)
      const newPoints = arrayMove(draggedPoints, oldIndex, newIndex)
      setDraggedPoints(newPoints)
      setSelectedOutline((prev) =>
        prev
          ? {
              ...prev,
              outline: { ...prev.outline, points: newPoints },
            }
          : prev,
      )
    }
  }

  async function handleFindVerses(point: any, index: number) {
    setLoadingVerses((prev) => ({ ...prev, [index]: true }))
    try {
      const res = await fetch("/api/bible/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: point.title + " " + point.explanation, limit: 3 }),
      })
      const data = await res.json()
      setSupportingVerses((prev) => ({ ...prev, [index]: data.verses || data.results || [] }))
    } catch {
      setSupportingVerses((prev) => ({ ...prev, [index]: [] }))
    } finally {
      setLoadingVerses((prev) => ({ ...prev, [index]: false }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-r from-green-500 to-blue-600">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Sermon Assistant</h2>
          <p className="text-gray-600">Generate sermon outlines and find relevant Bible verses with AI</p>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Sermon Generator</TabsTrigger>
          <TabsTrigger value="outlines">Generated Outlines</TabsTrigger>
          <TabsTrigger value="verses">Bible Verses</TabsTrigger>
          <TabsTrigger value="series">Sermon Series</TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Sermon Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sermon Theme</label>
                  <Input
                    placeholder="e.g., Faith, Love, Forgiveness, Hope..."
                    value={sermonConfig.theme}
                    onChange={(e) =>
                      setSermonConfig({
                        ...sermonConfig,
                        theme: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Audience</label>
                  <Select
                    value={sermonConfig.targetAudience}
                    onValueChange={(value: "general" | "youth" | "children" | "seniors") =>
                      setSermonConfig({
                        ...sermonConfig,
                        targetAudience: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">👥 General Congregation</SelectItem>
                      <SelectItem value="youth">🧑‍🎓 Youth (13-25)</SelectItem>
                      <SelectItem value="children">👶 Children (5-12)</SelectItem>
                      <SelectItem value="seniors">👴 Seniors (65+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Language */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select
                    value={sermonConfig.language}
                    onValueChange={(value: "pt" | "en" | "fr") =>
                      setSermonConfig({
                        ...sermonConfig,
                        language: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                  <Select
                    value={sermonConfig.duration.toString()}
                    onValueChange={(value) =>
                      setSermonConfig({
                        ...sermonConfig,
                        duration: Number.parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="40">40 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={handleGenerateSermon}
                    disabled={isGenerating || !sermonConfig.theme.trim()}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate Sermon Outline
                      </div>
                    )}
                  </Button>

                  <Button
                    onClick={handleGenerateSeries}
                    disabled={isGenerating || !sermonConfig.theme.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Generate 4-Part Series
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Preview Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Sermon Outline Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedOutline ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg">{selectedOutline.title}</h3>
                        <p className="text-sm text-gray-600">
                          Theme: {selectedOutline.theme} • {selectedOutline.estimatedDuration} min
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {selectedOutline.language.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Main Text:</h4>
                        <Badge variant="secondary">{selectedOutline.mainText}</Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Introduction:</h4>
                        <p className="text-sm text-gray-700">{selectedOutline.outline.introduction}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Main Points:</h4>
                        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                          <SortableContext items={draggedPoints.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                            {draggedPoints.map((point, index) => (
                              <SortablePoint
                                key={point.id}
                                id={point.id}
                                index={index}
                                point={point}
                                onFindVerses={handleFindVerses}
                                supportingVerses={supportingVerses[index]}
                                isLoadingVerses={!!loadingVerses[index]}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Conclusion:</h4>
                        <p className="text-sm text-gray-700">{selectedOutline.outline.conclusion}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Application Questions:</h4>
                        <ul className="space-y-1">
                          {selectedOutline.applicationQuestions.map((question, index) => (
                            <li key={index} className="text-sm text-gray-700">
                              • {question}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Illustrations:</h4>
                        <ul className="space-y-1">
                          {selectedOutline.illustrations.map((illustration, index) => (
                            <li key={index} className="text-sm text-gray-700">
                              • {illustration}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Generate a sermon outline to see preview</p>
                  </div>
                )}
                {selectedOutline && (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="outlines" className="space-y-4">
          {sermonOutlines.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sermon Outlines Generated</h3>
                <p className="text-gray-600">Create your first AI-generated sermon outline to see it here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sermonOutlines.map((outline) => (
                <Card
                  key={outline.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedOutline(outline)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{outline.title}</CardTitle>
                        <p className="text-sm text-gray-600">
                          Theme: {outline.theme} • {outline.estimatedDuration} minutes
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{outline.language.toUpperCase()}</Badge>
                        <Badge variant="secondary">{outline.mainText}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 line-clamp-2">{outline.outline.introduction}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 capitalize">
                        {outline.outline.points.length} main points
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="verses" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search verses by reference, text, or theme..."
                value={verseSearch}
                onChange={(e) => setVerseSearch(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredVerses.slice(0, 20).map((verse, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{verse.reference}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          {verse.version}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {verse.language.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">"{verse.text}"</p>
                      <div className="flex flex-wrap gap-1">
                        {verse.theme.map((theme: string, themeIndex: number) => (
                          <Badge key={themeIndex} variant="secondary" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="series" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sermon Series Generator</h3>
              <p className="text-gray-600 mb-4">Generate comprehensive sermon series with multiple related messages.</p>
              <Button onClick={handleGenerateSeries} disabled={!sermonConfig.theme.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Series from Current Theme
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
