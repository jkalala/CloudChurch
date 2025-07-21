"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Music, Calendar, Sparkles, Download, Play, Plus, Settings, History, Info } from "lucide-react"
import { AIWorshipPlanner, type WorshipSet } from "@/lib/ai-worship-planner"
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Custom hook for worship set generation logic
interface UseWorshipSetGenerationParams {
  worshipSets: WorshipSet[];
  setWorshipSets: React.Dispatch<React.SetStateAction<WorshipSet[]>>;
  setSelectedSet: React.Dispatch<React.SetStateAction<WorshipSet | null>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>;
  plannerConfig: {
    theme: string;
    date: string;
    duration: number;
    language: "pt" | "en" | "fr";
    includeHymns: boolean;
    tempoPreference: "slow" | "medium" | "fast" | "mixed";
    difficultyLevel: "easy" | "medium" | "hard";
  };
}
export function useWorshipSetGeneration({ worshipSets, setWorshipSets, setSelectedSet, setIsGenerating, plannerConfig }: UseWorshipSetGenerationParams) {
  const handleGenerateWorshipSet = useCallback(async () => {
    if (!plannerConfig.theme.trim()) {
      toast({
        title: "Missing Theme",
        description: "Please enter a worship theme.",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    try {
      const worshipSet = await AIWorshipPlanner.generateWorshipSet(
        plannerConfig.date,
        plannerConfig.theme,
        plannerConfig.language,
        plannerConfig.duration,
        {
          includeHymns: plannerConfig.includeHymns,
          tempoPreference: plannerConfig.tempoPreference === "mixed" ? undefined : plannerConfig.tempoPreference,
          difficultyLevel: plannerConfig.difficultyLevel,
        },
      );
      setWorshipSets([worshipSet, ...worshipSets]);
      setSelectedSet(worshipSet);
      toast({
        title: "Worship Set Generated",
        description: `Created a ${worshipSet.songs.length}-song worship set for \"${plannerConfig.theme}\".`,
      });
    } catch (error) {
      console.error("Error generating worship set:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate worship set. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [plannerConfig, worshipSets, setWorshipSets, setSelectedSet, setIsGenerating]);
  return { handleGenerateWorshipSet };
}

export default function AIWorshipPlannerComponent() {
  const [worshipSets, setWorshipSets] = useState<WorshipSet[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSet, setSelectedSet] = useState<WorshipSet | null>(null)
  const [plannerConfig, setPlannerConfig] = useState({
    theme: "",
    date: new Date().toISOString().split("T")[0],
    duration: 25,
    language: "pt" as "pt" | "en" | "fr",
    includeHymns: true,
    tempoPreference: "mixed" as "slow" | "medium" | "fast" | "mixed",
    difficultyLevel: "medium" as "easy" | "medium" | "hard",
  })
  const [showHelpBanner, setShowHelpBanner] = useState(true)

  const { language } = useAuth()
  const { t } = useTranslation(language)

  const { handleGenerateWorshipSet } = useWorshipSetGeneration({ worshipSets, setWorshipSets, setSelectedSet, setIsGenerating, plannerConfig });

  const getTempoIcon = (tempo: string) => {
    switch (tempo) {
      case "fast":
        return "🔥"
      case "medium":
        return "🎵"
      case "slow":
        return "🕊️"
      default:
        return "🎶"
    }
  }

  const getTempoColor = (tempo: string) => {
    switch (tempo) {
      case "fast":
        return "text-red-500"
      case "medium":
        return "text-blue-500"
      case "slow":
        return "text-green-500"
      default:
        return "text-gray-500"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "worship":
        return "bg-blue-100 text-blue-800"
      case "praise":
        return "bg-orange-100 text-orange-800"
      case "hymn":
        return "bg-purple-100 text-purple-800"
      case "contemporary":
        return "bg-green-100 text-green-800"
      case "gospel":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Onboarding/Help Banner */}
      {showHelpBanner && (
        <Card className="bg-blue-50 border-blue-200 mb-4">
          <CardContent className="flex items-center gap-4 py-4">
            <Info className="h-6 w-6 text-blue-500" />
            <div className="flex-1">
              <div className="font-semibold text-blue-700">Welcome to the AI Worship Planner!</div>
              <div className="text-sm text-blue-700">
                Generate intelligent worship sets with AI. Fill in your preferences, and let the AI suggest songs, keys, and notes. Hover over fields for tips. Your recent sets appear below for quick access.
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setShowHelpBanner(false)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
          <Music className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI Worship Planner</h2>
          <p className="text-gray-600">Generate intelligent worship sets with AI-powered song selection</p>
        </div>
      </div>
      <TooltipProvider>
        <Tabs defaultValue="planner" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planner">Worship Planner</TabsTrigger>
            <TabsTrigger value="sets">Generated Sets</TabsTrigger>
            <TabsTrigger value="songs">Song Database</TabsTrigger>
          </TabsList>
          <TabsContent value="planner" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuration Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-500" />
                    Worship Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Basic Info Section */}
                  <div className="mb-2">
                    <div className="font-semibold text-sm mb-1">Basic Info</div>
                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                        Worship Theme
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>Enter a theme or topic for your worship set (e.g., Faith, Hope, Love).</TooltipContent>
                        </Tooltip>
                      </label>
                      <Input
                        placeholder="e.g., God's Love, Faith, Hope, Salvation..."
                        value={plannerConfig.theme}
                        onChange={(e) => setPlannerConfig({ ...plannerConfig, theme: e.target.value })}
                      />
                    </div>
                    <div className="mt-2">
                      <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                        Service Date
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>Select the date for your worship service.</TooltipContent>
                        </Tooltip>
                      </label>
                      <Input
                        type="date"
                        value={plannerConfig.date}
                        onChange={(e) => setPlannerConfig({ ...plannerConfig, date: e.target.value })}
                      />
                    </div>
                  </div>
                  {/* Preferences Section */}
                  <div className="mb-2">
                    <div className="font-semibold text-sm mb-1">Preferences</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                          Duration (minutes)
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>How long should the worship set last?</TooltipContent>
                          </Tooltip>
                        </label>
                        <Select
                          value={plannerConfig.duration.toString()}
                          onValueChange={(value) => setPlannerConfig({ ...plannerConfig, duration: Number.parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutes</SelectItem>
                            <SelectItem value="20">20 minutes</SelectItem>
                            <SelectItem value="25">25 minutes</SelectItem>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="35">35 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                          Language
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>Choose the language for your worship set.</TooltipContent>
                          </Tooltip>
                        </label>
                        <Select
                          value={plannerConfig.language}
                          onValueChange={(value: "pt" | "en" | "fr") => setPlannerConfig({ ...plannerConfig, language: value })}
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
                    </div>
                  </div>
                  {/* Advanced Options Section */}
                  <div className="mb-2">
                    <div className="font-semibold text-sm mb-1">Advanced Options</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                          Tempo Preference
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>Choose the overall tempo for your set (or leave as mixed).</TooltipContent>
                          </Tooltip>
                        </label>
                        <Select
                          value={plannerConfig.tempoPreference}
                          onValueChange={(value: "slow" | "medium" | "fast" | "mixed") => setPlannerConfig({ ...plannerConfig, tempoPreference: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mixed">🎶 Mixed Tempo</SelectItem>
                            <SelectItem value="slow">🕊️ Slow & Worshipful</SelectItem>
                            <SelectItem value="medium">🎵 Medium Tempo</SelectItem>
                            <SelectItem value="fast">🔥 Fast & Energetic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                          Difficulty Level
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>How complex should the arrangements be?</TooltipContent>
                          </Tooltip>
                        </label>
                        <Select
                          value={plannerConfig.difficultyLevel}
                          onValueChange={(value: "easy" | "medium" | "hard") => setPlannerConfig({ ...plannerConfig, difficultyLevel: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy (Simple chords)</SelectItem>
                            <SelectItem value="medium">Medium (Moderate complexity)</SelectItem>
                            <SelectItem value="hard">Hard (Advanced arrangements)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="includeHymns"
                        checked={plannerConfig.includeHymns}
                        onChange={(e) => setPlannerConfig({ ...plannerConfig, includeHymns: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="includeHymns" className="text-sm font-medium flex items-center gap-1">
                        Include Traditional Hymns
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>Include classic hymns in the song selection.</TooltipContent>
                        </Tooltip>
                      </label>
                    </div>
                  </div>
                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateWorshipSet}
                    disabled={isGenerating || !plannerConfig.theme.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate Worship Set
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent>Click to generate a worship set based on your preferences.</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
              {/* Preview Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-green-500" />
                    Worship Set Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSet ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{selectedSet.theme}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedSet.date).toLocaleDateString()} • {Math.round(selectedSet.totalDuration)}{" "}
                            min
                          </p>
                        </div>
                        <Badge variant="outline">{selectedSet.songs.length} songs</Badge>
                      </div>

                      <ScrollArea className="h-64">
                        <div className="space-y-3">
                          {selectedSet.songs.map((song, index) => (
                            <div key={song.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium text-purple-600">
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-medium">{song.title}</p>
                                  <p className="text-sm text-gray-600">{song.artist}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {song.key}
                                </Badge>
                                <Badge className={`text-xs ${getCategoryColor(song.category)}`}>{song.category}</Badge>
                                <span className={`text-lg ${getTempoColor(song.tempo)}`}>{getTempoIcon(song.tempo)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Key Progression:</label>
                          <div className="mt-1 space-y-1">
                            {selectedSet.key_progression.map((progression, index) => (
                              <p key={index} className="text-sm text-gray-700">
                                {progression}
                              </p>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-600">Ministry Notes:</label>
                          <ScrollArea className="h-24 w-full border rounded-lg p-3 mt-1">
                            <pre className="whitespace-pre-wrap text-xs">{selectedSet.notes}</pre>
                          </ScrollArea>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export PDF
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Generate a worship set to see preview</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Recent Worship Sets Panel */}
            {worshipSets.length > 1 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-blue-500" />
                    Recent Worship Sets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {worshipSets.slice(1, 6).map((set, idx) => (
                      <div key={set.date + set.theme + idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium">{set.theme}</span>
                          <span className="text-xs text-gray-500 ml-2">{new Date(set.date).toLocaleDateString()}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setSelectedSet(set)}>
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="sets" className="space-y-4">
            {worshipSets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Worship Sets Generated</h3>
                  <p className="text-gray-600">Create your first AI-generated worship set to see it here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {worshipSets.map((set) => (
                  <Card
                    key={set.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedSet(set)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{set.theme}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {new Date(set.date).toLocaleDateString()} • {Math.round(set.totalDuration)} minutes
                          </p>
                        </div>
                        <Badge variant="outline">{set.songs.length} songs</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {set.songs.slice(0, 3).map((song) => (
                          <Badge key={song.id} variant="secondary" className="text-xs">
                            {song.title}
                          </Badge>
                        ))}
                        {set.songs.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{set.songs.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="songs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Song Database</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Song
              </Button>
            </div>
            <div className="grid gap-4">
              {AIWorshipPlanner.getSongDatabase().map((song) => (
                <Card key={song.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                          <Music className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{song.title}</h4>
                          <p className="text-sm text-gray-600">{song.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {song.key}
                        </Badge>
                        <Badge className={`text-xs ${getCategoryColor(song.category)}`}>{song.category}</Badge>
                        <span className={`text-lg ${getTempoColor(song.tempo)}`}>{getTempoIcon(song.tempo)}</span>
                        <Badge variant="outline" className="text-xs">
                          {song.language.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {song.theme.map((theme, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </TooltipProvider>
    </div>
  )
}
