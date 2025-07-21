"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Music,
  Users,
  Calendar,
  BarChart3,
  Sparkles,
  Play,
  Pause,
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Clock,
  Guitar,
  Piano,
  Headphones,
  TrendingUp,
  Target,
  Zap,
  Brain,
  Wand2,
  ListMusic,
  UserCheck,
  CalendarDays,
  BarChart,
  Shuffle,
  SkipForward,
  Share2,
  Sliders,
  Info,
} from "lucide-react"
import { AIMusicMinistry, type Song, type SetList, type Musician, type Rehearsal } from "@/lib/ai-music-ministry"
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import WaveSurfer from 'wavesurfer.js';

// Custom hook for setlist generation logic
export function useSetListGeneration({
  setLists,
  setSetLists,
  setSelectedSetList,
  setShowCreateSetList,
  setIsLoading,
  setListConfig
}: {
  setLists: SetList[];
  setSetLists: Dispatch<SetStateAction<SetList[]>>;
  setSelectedSetList: Dispatch<SetStateAction<SetList | null>>;
  setShowCreateSetList: Dispatch<SetStateAction<boolean>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  setListConfig: any;
}) {
  const handleGenerateSetList = useCallback(async () => {
    // eslint-disable-next-line no-console
    console.log('HANDLE GENERATE SETLIST CALLED')
    if (!setListConfig.title.trim()) {
      toast({
        title: "Please enter a setlist title",
        variant: "destructive",
      })
      return;
    }
    setIsLoading(true);
    try {
      const newSetList = await AIMusicMinistry.generateSetList(setListConfig);
      setSetLists([newSetList, ...setLists]);
      setSelectedSetList(newSetList);
      setShowCreateSetList(false);
      toast({
        title: "AI setlist generated successfully!",
      });
    } catch (error) {
      console.error("Error generating setlist:", error);
      toast({
        title: "Failed to generate setlist",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [setListConfig, setLists, setSetLists, setSelectedSetList, setShowCreateSetList, setIsLoading]);
  return { handleGenerateSetList };
}

type AIMusicMinistryToolsProps = {
  initialTab?: string;
};

export default function AIMusicMinistryTools({ initialTab = "dashboard" }: AIMusicMinistryToolsProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [songs, setSongs] = useState<Song[]>([])
  const [setLists, setSetLists] = useState<SetList[]>([])
  const [musicians, setMusicians] = useState<Musician[]>([])
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSong, setSelectedSong] = useState<Song | null>(null)
  const [selectedSetList, setSelectedSetList] = useState<SetList | null>(null)
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [showCreateSetList, setShowCreateSetList] = useState(false)
  const [showAddSong, setShowAddSong] = useState(false)
  const [showChordAnalyzer, setShowChordAnalyzer] = useState(false)
  const [chordInput, setChordInput] = useState("")
  const [chordAnalysis, setChordAnalysis] = useState<any>(null)
  const [showAIBanner, setShowAIBanner] = useState(true)
  const [waveSurfers, setWaveSurfers] = useState<Record<string, WaveSurfer | null>>({});
  const waveformRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [firstVisit, setFirstVisit] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('aiMusicMinistryOnboarded');
    }
    return false;
  });

  useEffect(() => {
    if (firstVisit && typeof window !== 'undefined') {
      localStorage.setItem('aiMusicMinistryOnboarded', 'true');
    }
  }, [firstVisit]);

  useEffect(() => {
    // Clean up wavesurfers on unmount
    return () => {
      Object.values(waveSurfers).forEach(ws => ws && ws.destroy());
    };
  }, []);

  const { language } = useAuth()
  const { t } = useTranslation(language)

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})

  // SetList generation form
  const [setListConfig, setSetListConfig] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    serviceType: "sunday_morning",
    theme: "",
    duration: 25,
    language: "en",
    includeHymns: true,
    maxSongs: 6,
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadData = async () => {
    setIsLoading(true)
    try {
      setSongs(AIMusicMinistry.getSongs())
      setSetLists(AIMusicMinistry.getSetLists())
      setMusicians(AIMusicMinistry.getMusicians())
      setRehearsals(AIMusicMinistry.getRehearsals())
    } catch (error) {
      console.error("Error loading music ministry data:", error)
      toast({
        title: "Failed to load music ministry data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const { handleGenerateSetList } = useSetListGeneration({
    setLists,
    setSetLists,
    setSelectedSetList,
    setShowCreateSetList,
    setIsLoading,
    setListConfig
  } as {
    setLists: SetList[];
    setSetLists: Dispatch<SetStateAction<SetList[]>>;
    setSelectedSetList: Dispatch<SetStateAction<SetList | null>>;
    setShowCreateSetList: Dispatch<SetStateAction<boolean>>;
    setIsLoading: Dispatch<SetStateAction<boolean>>;
    setListConfig: any;
  });

  const handleRecommendSongs = async () => {
    setIsLoading(true)
    try {
      const recommendations = await AIMusicMinistry.recommendSongs({
        theme: setListConfig.theme,
        serviceType: setListConfig.serviceType,
        language: setListConfig.language,
        duration: setListConfig.duration,
      })

      toast({
        title: `Found ${recommendations.length} recommended songs`,
      })
      // You could display these in a modal or update the UI
    } catch (error) {
      console.error("Error getting recommendations:", error)
      toast({
        title: "Failed to get song recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyzeChords = () => {
    if (!chordInput.trim()) {
      toast({
        title: "Please enter chord progression",
        variant: "destructive",
      })
      return
    }

    const analysis = AIMusicMinistry.analyzeChordProgression(chordInput)
    setChordAnalysis(analysis)
    toast({
      title: "Chord progression analyzed!",
    })
  }

  const handlePlaySong = (songId: string, audioUrl?: string) => {
    if (!audioUrl) return;
    // Pause all other players
    Object.entries(waveSurfers).forEach(([id, ws]) => {
      if (id !== songId && ws) ws.pause();
    });
    if (isPlaying === songId) {
      waveSurfers[songId]?.pause();
      setIsPlaying(null);
      toast({
        title: t("aiMusic.playbackStopped"),
        description: t("aiMusic.stoppedPlaying"),
      });
    } else {
      if (!waveSurfers[songId] && waveformRefs.current[songId] && audioUrl) {
        const ws = WaveSurfer.create({
          container: waveformRefs.current[songId]!,
          waveColor: '#a5b4fc',
          progressColor: '#6366f1',
          height: 48,
          barWidth: 2,
        });
        ws.load(audioUrl);
        ws.on('ready', () => {
          ws.play();
          setIsPlaying(songId);
        });
        ws.on('finish', () => setIsPlaying(null));
        setWaveSurfers(prev => ({ ...prev, [songId]: ws }));
      } else {
        waveSurfers[songId]?.play();
        setIsPlaying(songId);
      }
      toast({
        title: t("aiMusic.playbackStarted"),
        description: t("aiMusic.playingPreview"),
      });
    }
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.themes.some((theme) => theme.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const analytics = AIMusicMinistry.generateAnalytics()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
            <Music className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Music Ministry Tools
            </h1>
            <p className="text-muted-foreground">
              Professional music management with AI-powered insights and automation
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateSetList(true)}>
            <Plus className="h-4 w-4 mr-2" aria-label={t("aiMusic.generateSetList")}/>
            <span className="sr-only">{t("aiMusic.generateSetList")}</span>
            {t("aiMusic.generateSetList")}
          </Button>
          <Button variant="outline" onClick={() => setShowAddSong(true)}>
            <Upload className="h-4 w-4 mr-2" aria-label={t("aiMusic.addSong")}/>
            <span className="sr-only">{t("aiMusic.addSong")}</span>
            {t("aiMusic.addSong")}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{songs.length}</div>
            <div className="text-sm text-muted-foreground">Songs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-pink-600">{setLists.length}</div>
            <div className="text-sm text-muted-foreground">SetLists</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{musicians.length}</div>
            <div className="text-sm text-muted-foreground">Musicians</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{rehearsals.length}</div>
            <div className="text-sm text-muted-foreground">Rehearsals</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="songs">
            <Music className="h-4 w-4 mr-2" />
            Songs
          </TabsTrigger>
          <TabsTrigger value="setlists">
            <ListMusic className="h-4 w-4 mr-2" />
            SetLists
          </TabsTrigger>
          <TabsTrigger value="musicians">
            <Users className="h-4 w-4 mr-2" />
            Musicians
          </TabsTrigger>
          <TabsTrigger value="rehearsals">
            <Calendar className="h-4 w-4 mr-2" />
            Rehearsals
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wand2 className="h-4 w-4 mr-2" />
            AI Tools
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Songs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Most Popular Songs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.popularSongs.map((song, index) => (
                    <div key={song.songId} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{song.title}</p>
                          <p className="text-sm text-muted-foreground">{song.timesPlayed} times played</p>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Piano className="h-5 w-5 text-blue-500" />
                  Key Usage Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.keyUsage.map((key) => (
                    <div key={key.key} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{key.key} Major</span>
                        <span>{key.percentage}%</span>
                      </div>
                      <Progress value={key.percentage} className="h-2" aria-label={`${key.key} Major key usage`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Genre Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-purple-500" />
                  Genre Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.genreDistribution.map((genre) => (
                    <div key={genre.genre} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{genre.genre}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${genre.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{genre.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Service Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  Service Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Songs/Service</span>
                    <span className="font-bold">{analytics.serviceMetrics.averageSongsPerService}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Duration</span>
                    <span className="font-bold">{analytics.serviceMetrics.averageServiceDuration} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Popular Time</span>
                    <span className="font-bold">{analytics.serviceMetrics.mostPopularServiceTime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">New setlist created</p>
                    <p className="text-sm text-muted-foreground">Sunday Morning Worship - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Musician scheduled</p>
                    <p className="text-sm text-muted-foreground">Sarah Johnson assigned to piano - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Rehearsal scheduled</p>
                    <p className="text-sm text-muted-foreground">Saturday practice session - 6 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Songs Tab */}
        <TabsContent value="songs" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <label htmlFor="song-search" className="sr-only">{t("aiMusic.searchSongs")}</label>
                  <Input
                    id="song-search"
                    placeholder={t("aiMusic.searchSongs")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    aria-label={t("aiMusic.searchSongs")}
                  />
                </div>
                <Button variant="outline" aria-label={t("aiMusic.filters")}> 
                  <Filter className="h-4 w-4 mr-2" aria-label={t("aiMusic.filters")}/>
                  <span className="sr-only">{t("aiMusic.filters")}</span>
                  {t("aiMusic.filters")}
                </Button>
                <Button onClick={handleRecommendSongs} aria-label={t("aiMusic.recommend")}> 
                  <Sparkles className="h-4 w-4 mr-2" aria-label={t("aiMusic.recommend")}/>
                  <span className="sr-only">{t("aiMusic.recommend")}</span>
                  {t("aiMusic.recommend")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Songs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => (
              <Card key={song.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{song.title}</CardTitle>
                      <CardDescription>{song.artist}</CardDescription>
                    </div>
                    <Badge
                      variant={
                        song.difficulty === "beginner"
                          ? "secondary"
                          : song.difficulty === "intermediate"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {song.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Piano className="h-4 w-4" />
                      {song.key}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, "0")}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {song.genre}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {song.themes.slice(0, 3).map((theme) => (
                      <Badge key={theme} variant="secondary" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                    {song.themes.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{song.themes.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handlePlaySong(song.id, song.audioUrl)} aria-label={isPlaying === song.id ? t("aiMusic.pause") : t("aiMusic.play") }>
                      {isPlaying === song.id ? (
                        <Pause className="h-4 w-4 animate-pulse" aria-label={t("aiMusic.pause")}/>
                      ) : (
                        <Play className="h-4 w-4 animate-bounce" aria-label={t("aiMusic.play")}/>
                      )}
                      <span className="sr-only">{isPlaying === song.id ? t("aiMusic.pause") : t("aiMusic.play")}</span>
                    </Button>
                    <div ref={el => { waveformRefs.current[song.id] = el; }} className="w-full h-12 my-2" />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" aria-label={t("aiMusic.download")}> 
                            <Download className="h-4 w-4" aria-label={t("aiMusic.download")}/>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('aiMusic.downloadTooltip')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedSong(song)} aria-label={t("aiMusic.viewDetails")}> 
                            <span className="sr-only">{t("aiMusic.viewDetails")}</span>
                            {t("aiMusic.viewDetails")}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('aiMusic.viewDetailsTooltip')}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SetLists Tab */}
        <TabsContent value="setlists" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {setLists.map((setList) => (
              <Card key={setList.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{setList.title}</CardTitle>
                      <CardDescription>
                        {new Date(setList.date).toLocaleDateString()} • {setList.serviceType.replace("_", " ")}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        setList.status === "approved" ? "default" : setList.status === "draft" ? "secondary" : "outline"
                      }
                    >
                      {setList.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {setList.theme && (
                    <div>
                      <span className="text-sm font-medium">Theme: </span>
                      <span className="text-sm text-muted-foreground">{setList.theme}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{setList.songs.length} songs</span>
                      <span>{Math.floor(setList.totalDuration / 60)} min</span>
                    </div>
                    <div className="space-y-1">
                      {setList.songs.slice(0, 3).map((song) => (
                        <div key={song.songId} className="text-sm text-muted-foreground">
                          {song.order}. {song.song.title} ({song.key})
                        </div>
                      ))}
                      {setList.songs.length > 3 && (
                        <div className="text-sm text-muted-foreground">+{setList.songs.length - 3} more songs</div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setSelectedSetList(setList)}>
                      View Full
                    </Button>
                    <Button size="sm" variant="outline" aria-label={t("aiMusic.share")}> 
                      <Share2 className="h-4 w-4" aria-label={t("aiMusic.share")}/>
                      <span className="sr-only">{t("aiMusic.share")}</span>
                    </Button>
                    <Button size="sm" variant="outline" aria-label={t("aiMusic.download")}> 
                      <Download className="h-4 w-4" aria-label={t("aiMusic.download")}/>
                      <span className="sr-only">{t("aiMusic.download")}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Musicians Tab */}
        <TabsContent value="musicians" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {musicians.map((musician) => (
              <Card key={musician.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{musician.name}</CardTitle>
                      <CardDescription>{musician.email}</CardDescription>
                    </div>
                    <Badge variant={musician.isActive ? "default" : "secondary"}>
                      {musician.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Instruments:</p>
                    <div className="flex flex-wrap gap-1">
                      {musician.instruments.map((instrument) => (
                        <Badge key={instrument} variant="outline" className="text-xs">
                          {instrument}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Voice Parts:</p>
                    <div className="flex flex-wrap gap-1">
                      {musician.voiceParts.map((part) => (
                        <Badge key={part} variant="secondary" className="text-xs">
                          {part}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>Skill Level:</span>
                    <Badge variant="outline">{musician.skillLevel}</Badge>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Availability:</p>
                    <div className="grid grid-cols-7 gap-1">
                      {Object.entries(musician.availability).map(([day, available]) => (
                        <div
                          key={day}
                          className={`text-xs text-center p-1 rounded ${
                            available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {day.slice(0, 3)}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Rehearsals Tab */}
        <TabsContent value="rehearsals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {rehearsals.map((rehearsal) => (
              <Card key={rehearsal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{rehearsal.title}</CardTitle>
                      <CardDescription>
                        {new Date(rehearsal.date).toLocaleDateString()} • {rehearsal.startTime} - {rehearsal.endTime}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        rehearsal.status === "completed"
                          ? "default"
                          : rehearsal.status === "in_progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {rehearsal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{rehearsal.attendees.length} attendees</span>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Agenda:</p>
                    <div className="space-y-2">
                      {rehearsal.agenda.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>{item.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{item.duration}min</span>
                            {item.isCompleted && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                          </div>
                        </div>
                      ))}
                      {rehearsal.agenda.length > 3 && (
                        <div className="text-sm text-muted-foreground">+{rehearsal.agenda.length - 3} more items</div>
                      )}
                    </div>
                  </div>

                  <Button size="sm" className="w-full">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          {/* Onboarding/Help Banner */}
          {showAIBanner && (
            <Card className="bg-blue-50 border-blue-200 mb-4">
              <CardContent className="flex items-center gap-4 py-4">
                <Info className="h-6 w-6 text-blue-500" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-700">Welcome to AI Music Ministry Tools!</div>
                  <div className="text-sm text-blue-700">
                    Explore grouped AI-powered tools for music ministry: analyze chords, generate practice tracks, get song recommendations, schedule musicians, and optimize setlists. Hover over each tool for more info.
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setShowAIBanner(false)}>
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}
          {firstVisit && (
            <Card className="bg-blue-50 border-blue-200 mb-4 animate-fade-in">
              <CardContent className="flex items-center gap-4 py-4">
                <Info className="h-6 w-6 text-blue-500 animate-bounce" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-700">{t('aiMusic.onboardingTitle')}</div>
                  <div className="text-sm text-blue-700">{t('aiMusic.onboardingDesc')}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setFirstVisit(false)}>
                  {t('aiMusic.dismiss')}
                </Button>
              </CardContent>
            </Card>
          )}
          <TooltipProvider>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Chord Tools Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Guitar className="h-5 w-5 text-orange-500" />
                    <span>Chord Analyzer</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>Analyze chord progressions and get AI suggestions.</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter chord progression (e.g., C - Am - F - G)"
                    value={chordInput}
                    onChange={(e) => setChordInput(e.target.value)}
                  />
                  <Button onClick={handleAnalyzeChords} className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Chords
                  </Button>
                  {chordAnalysis && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Key:</strong> {chordAnalysis.key}
                      </div>
                      <div>
                        <strong>Difficulty:</strong> {chordAnalysis.difficulty}
                      </div>
                      <div>
                        <strong>Suggestions:</strong>
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {chordAnalysis.suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-muted-foreground">
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sliders className="h-5 w-5 text-green-500" />
                    <span>Key Transposer</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>Transpose songs to different keys automatically.</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select song" />
                    </SelectTrigger>
                    <SelectContent>
                      {songs.map((song) => (
                        <SelectItem key={song.id} value={song.id}>
                          {song.title} ({song.key})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="From key" />
                      </SelectTrigger>
                      <SelectContent>
                        {["C", "D", "E", "F", "G", "A", "B"].map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="To key" />
                      </SelectTrigger>
                      <SelectContent>
                        {["C", "D", "E", "F", "G", "A", "B"].map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    <Shuffle className="h-4 w-4 mr-2" />
                    Transpose
                  </Button>
                </CardContent>
              </Card>
              {/* Practice Tools Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-blue-500" />
                    <span>Practice Tracks</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>Generate custom practice tracks for musicians.</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select song" />
                    </SelectTrigger>
                    <SelectContent>
                      {songs.map((song) => (
                        <SelectItem key={song.id} value={song.id}>
                          {song.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Remove voice part" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soprano">Soprano</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                      <SelectItem value="tenor">Tenor</SelectItem>
                      <SelectItem value="bass">Bass</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Track
                  </Button>
                </CardContent>
              </Card>
              {/* Recommendations Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span>Song Recommendations</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>Get AI-powered song suggestions for your services.</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input placeholder="Service theme (e.g., Grace, Love, Hope)" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday_morning">Sunday Morning</SelectItem>
                      <SelectItem value="sunday_evening">Sunday Evening</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="special_event">Special Event</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">
                    <Brain className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-red-500" />
                    <span>SetList Optimizer</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>Optimize song order and key flow automatically.</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select setlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {setLists.map((setList) => (
                        <SelectItem key={setList.id} value={setList.id}>
                          {setList.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="optimize-keys" />
                      <label htmlFor="optimize-keys" className="text-sm">
                        Optimize key flow
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="optimize-tempo" />
                      <label htmlFor="optimize-tempo" className="text-sm">
                        Optimize tempo flow
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="optimize-themes" />
                      <label htmlFor="optimize-themes" className="text-sm">
                        Group by themes
                      </label>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Optimize SetList
                  </Button>
                </CardContent>
              </Card>
              {/* Scheduling Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-indigo-500" />
                    <span>Musician Scheduler</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent>AI-powered musician scheduling and availability.</TooltipContent>
                    </Tooltip>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input type="date" aria-label={t("aiMusic.scheduleMusiciansDate")} />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Required Instruments:</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Piano", "Guitar", "Bass", "Drums", "Vocals"].map((instrument) => (
                        <div key={instrument} className="flex items-center space-x-2">
                          <Switch id={instrument} />
                          <label htmlFor={instrument} className="text-sm">
                            {instrument}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Musicians
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TooltipProvider>
        </TabsContent>
      </Tabs>

      {/* Create SetList Modal */}
      <Dialog open={showCreateSetList} onOpenChange={setShowCreateSetList}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Generate AI SetList
            </DialogTitle>
            <DialogDescription>Let AI create an intelligent setlist based on your preferences</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">SetList Title</label>
                <Input
                  placeholder="e.g., Sunday Morning Worship"
                  value={setListConfig.title}
                  onChange={(e) => setSetListConfig({ ...setListConfig, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input
                  type="date"
                  value={setListConfig.date}
                  onChange={(e) => setSetListConfig({ ...setListConfig, date: e.target.value })}
                  aria-label={t("aiMusic.setListDate")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Service Type</label>
                <Select
                  value={setListConfig.serviceType}
                  onValueChange={(value) => setSetListConfig({ ...setListConfig, serviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday_morning">Sunday Morning</SelectItem>
                    <SelectItem value="sunday_evening">Sunday Evening</SelectItem>
                    <SelectItem value="wednesday">Wednesday Service</SelectItem>
                    <SelectItem value="special_event">Special Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                <Select
                  value={setListConfig.duration.toString()}
                  onValueChange={(value) => setSetListConfig({ ...setListConfig, duration: Number.parseInt(value) })}
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
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Theme (Optional)</label>
              <Input
                placeholder="e.g., Grace, Love, Hope, Salvation..."
                value={setListConfig.theme}
                onChange={(e) => setSetListConfig({ ...setListConfig, theme: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Select
                  value={setListConfig.language}
                  onValueChange={(value) => setSetListConfig({ ...setListConfig, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="pt">🇵🇹 Portuguese</SelectItem>
                    <SelectItem value="fr">🇫🇷 French</SelectItem>
                    <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Max Songs</label>
                <Select
                  value={setListConfig.maxSongs.toString()}
                  onValueChange={(value) => setSetListConfig({ ...setListConfig, maxSongs: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 songs</SelectItem>
                    <SelectItem value="5">5 songs</SelectItem>
                    <SelectItem value="6">6 songs</SelectItem>
                    <SelectItem value="7">7 songs</SelectItem>
                    <SelectItem value="8">8 songs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="include-hymns"
                checked={setListConfig.includeHymns}
                onCheckedChange={(checked) => setSetListConfig({ ...setListConfig, includeHymns: checked })}
              />
              <label htmlFor="include-hymns" className="text-sm font-medium">
                Include traditional hymns
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleGenerateSetList} disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate SetList
                  </div>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateSetList(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Song Details Modal */}
      {selectedSong && (
        <Dialog open={!!selectedSong} onOpenChange={() => setSelectedSong(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedSong.title}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" aria-label={t("aiMusic.download")}> 
                    <Download className="h-4 w-4" aria-label={t("aiMusic.download")}/>
                    <span className="sr-only">{t("aiMusic.download")}</span>
                  </Button>
                  <Button size="sm" variant="outline" aria-label={t("aiMusic.share")}> 
                    <Share2 className="h-4 w-4" aria-label={t("aiMusic.share")}/>
                    <span className="sr-only">{t("aiMusic.share")}</span>
                  </Button>
                </div>
              </DialogTitle>
              <DialogDescription>
                by {selectedSong.artist} {selectedSong.composer && `• Composed by ${selectedSong.composer}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Song Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Key</label>
                  <p className="font-medium">{selectedSong.key}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tempo</label>
                  <p className="font-medium capitalize">{selectedSong.tempo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                  <p className="font-medium capitalize">{selectedSong.difficulty}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="font-medium">
                    {Math.floor(selectedSong.duration / 60)}:{(selectedSong.duration % 60).toString().padStart(2, "0")}
                  </p>
                </div>
              </div>

              {/* Themes */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Themes</label>
                <div className="flex flex-wrap gap-2">
                  {selectedSong.themes.map((theme) => (
                    <Badge key={theme} variant="secondary">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Voice Parts */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Voice Parts</label>
                <div className="grid grid-cols-2 gap-4">
                  {selectedSong.voiceParts.map((part) => (
                    <div key={part.name} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{part.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {part.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Range: {part.range.lowest} - {part.range.highest}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instruments */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Instruments</label>
                <div className="grid grid-cols-2 gap-4">
                  {selectedSong.instruments.map((instrument) => (
                    <div key={instrument.name} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{instrument.name}</span>
                        <div className="flex gap-1">
                          {instrument.isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {instrument.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{instrument.type}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chords */}
              {selectedSong.chords && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Chord Progression</label>
                  <div className="bg-muted rounded-lg p-4">
                    <code className="text-sm">{selectedSong.chords}</code>
                  </div>
                </div>
              )}

              {/* Lyrics */}
              {selectedSong.lyrics && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Lyrics</label>
                  <ScrollArea className="h-32 w-full border rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm">{selectedSong.lyrics}</pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* SetList Details Modal */}
      {selectedSetList && (
        <Dialog open={!!selectedSetList} onOpenChange={() => setSelectedSetList(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedSetList.title}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" aria-label={t("aiMusic.download")}> 
                    <Download className="h-4 w-4" aria-label={t("aiMusic.download")}/>
                    <span className="sr-only">{t("aiMusic.download")}</span>
                  </Button>
                  <Button size="sm" variant="outline" aria-label={t("aiMusic.share")}> 
                    <Share2 className="h-4 w-4" aria-label={t("aiMusic.share")}/>
                    <span className="sr-only">{t("aiMusic.share")}</span>
                  </Button>
                </div>
              </DialogTitle>
              <DialogDescription>
                {new Date(selectedSetList.date).toLocaleDateString()} • {selectedSetList.serviceType.replace("_", " ")}
                {selectedSetList.theme && ` • Theme: ${selectedSetList.theme}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* SetList Info */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Duration</label>
                  <p className="font-medium">{Math.floor(selectedSetList.totalDuration / 60)} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Songs</label>
                  <p className="font-medium">{selectedSetList.songs.length} songs</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={selectedSetList.status === "approved" ? "default" : "secondary"}>
                    {selectedSetList.status}
                  </Badge>
                </div>
              </div>

              {/* Key Flow */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Key Flow</label>
                <div className="flex items-center gap-2">
                  {selectedSetList.keyFlow.map((key, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline">{key}</Badge>
                      {index < selectedSetList.keyFlow.length - 1 && (
                        <SkipForward className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Songs List */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Songs</label>
                <div className="space-y-3">
                  {selectedSetList.songs.map((setListSong) => (
                    <div key={setListSong.songId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {setListSong.order}
                          </div>
                          <div>
                            <h4 className="font-medium">{setListSong.song.title}</h4>
                            <p className="text-sm text-muted-foreground">{setListSong.song.artist}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{setListSong.key}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {Math.floor(setListSong.estimatedDuration / 60)}:
                            {(setListSong.estimatedDuration % 60).toString().padStart(2, "0")}
                          </span>
                          <Button size="sm" variant="ghost" aria-label={t("aiMusic.play")}> 
                            <Play className="h-4 w-4" aria-label={t("aiMusic.play")}/>
                            <span className="sr-only">{t("aiMusic.play")}</span>
                          </Button>
                        </div>
                      </div>
                      {setListSong.specialInstructions && (
                        <p className="text-sm text-muted-foreground italic">Note: {setListSong.specialInstructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedSetList.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Notes</label>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm">{selectedSetList.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
