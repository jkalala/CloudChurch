export interface Song {
  id: string
  title: string
  artist: string
  composer?: string
  arranger?: string
  key: string
  originalKey?: string
  tempo: "slow" | "medium" | "fast"
  bpm?: number
  timeSignature: string
  difficulty: "beginner" | "intermediate" | "advanced" | "expert"
  genre: "worship" | "praise" | "hymn" | "contemporary" | "gospel" | "traditional"
  language: "pt" | "en" | "fr" | "es"
  themes: string[]
  lyrics?: string
  chords?: string
  sheetMusicUrl?: string
  audioUrl?: string
  videoUrl?: string
  duration: number // in seconds
  ccliNumber?: string
  copyright?: string
  isPublicDomain: boolean
  tags: string[]
  voiceParts: VoicePart[]
  instruments: Instrument[]
  createdAt: string
  updatedAt: string
}

export interface VoicePart {
  name: "soprano" | "alto" | "tenor" | "bass" | "lead" | "harmony"
  range: {
    lowest: string
    highest: string
  }
  difficulty: "easy" | "medium" | "hard"
  notes?: string
}

export interface Instrument {
  name: string
  type: "keyboard" | "guitar" | "bass" | "drums" | "strings" | "brass" | "woodwind" | "other"
  difficulty: "easy" | "medium" | "hard"
  isRequired: boolean
  notes?: string
}

export interface SetList {
  id: string
  title: string
  date: string
  serviceType: "sunday_morning" | "sunday_evening" | "wednesday" | "special_event" | "rehearsal"
  theme?: string
  songs: SetListSong[]
  totalDuration: number
  keyFlow: string[]
  tempoFlow: string[]
  notes?: string
  createdBy: string
  status: "draft" | "approved" | "archived"
  createdAt: string
  updatedAt: string
}

export interface SetListSong {
  songId: string
  song: Song
  order: number
  key: string
  tempo?: "slower" | "normal" | "faster"
  specialInstructions?: string
  transitionNotes?: string
  estimatedDuration: number
}

export interface Musician {
  id: string
  name: string
  email: string
  phone?: string
  instruments: string[]
  voiceParts: string[]
  skillLevel: "beginner" | "intermediate" | "advanced" | "professional"
  availability: {
    [key: string]: boolean // day of week
  }
  preferences: {
    genres: string[]
    languages: string[]
    maxSongsPerService: number
  }
  isActive: boolean
  joinedAt: string
}

export interface Rehearsal {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  setListId: string
  attendees: string[] // musician IDs
  agenda: RehearsalItem[]
  notes?: string
  recordings?: string[]
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  createdAt: string
}

export interface RehearsalItem {
  id: string
  type: "song" | "prayer" | "break" | "discussion"
  songId?: string
  title: string
  duration: number
  notes?: string
  isCompleted: boolean
}

export interface MusicAnalytics {
  popularSongs: {
    songId: string
    title: string
    timesPlayed: number
    lastPlayed: string
  }[]
  keyUsage: {
    key: string
    count: number
    percentage: number
  }[]
  genreDistribution: {
    genre: string
    count: number
    percentage: number
  }[]
  musicianParticipation: {
    musicianId: string
    name: string
    servicesAttended: number
    rehearsalsAttended: number
  }[]
  serviceMetrics: {
    averageSongsPerService: number
    averageServiceDuration: number
    mostPopularServiceTime: string
  }
}

export class AIMusicMinistry {
  private static songs: Song[] = []
  private static musicians: Musician[] = []
  private static setLists: SetList[] = []
  private static rehearsals: Rehearsal[] = []

  // AI-powered song recommendation based on theme, mood, and context
  static async recommendSongs(criteria: {
    theme?: string
    mood?: "celebratory" | "reflective" | "worshipful" | "energetic" | "peaceful"
    serviceType?: string
    duration?: number
    language?: string
    difficulty?: string
    excludeSongs?: string[]
  }): Promise<Song[]> {
    const availableSongs = this.songs.filter((song) => {
      if (criteria.language && song.language !== criteria.language) return false
      if (criteria.difficulty && song.difficulty !== criteria.difficulty) return false
      if (criteria.excludeSongs?.includes(song.id)) return false
      return true
    })

    // AI scoring based on criteria
    const scoredSongs = availableSongs
      .map((song) => ({
        ...song,
        score: this.calculateSongScore(song, criteria),
      }))
      .sort((a, b) => b.score - a.score)

    return scoredSongs.slice(0, 20)
  }

  private static calculateSongScore(song: Song, criteria: any): number {
    let score = 0

    // Theme matching
    if (criteria.theme) {
      const themeWords = criteria.theme.toLowerCase().split(" ")
      themeWords.forEach((word) => {
        if (song.themes.some((theme) => theme.toLowerCase().includes(word))) {
          score += 25
        }
        if (song.title.toLowerCase().includes(word)) {
          score += 15
        }
        if (song.lyrics?.toLowerCase().includes(word)) {
          score += 10
        }
      })
    }

    // Mood matching
    if (criteria.mood) {
      const moodMapping = {
        celebratory: ["praise", "joy", "celebration", "victory"],
        reflective: ["meditation", "contemplation", "quiet", "reflection"],
        worshipful: ["worship", "adoration", "reverence", "holy"],
        energetic: ["praise", "upbeat", "joyful", "celebration"],
        peaceful: ["peace", "calm", "rest", "comfort"],
      }

      const moodThemes = moodMapping[criteria.mood] || []
      moodThemes.forEach((theme) => {
        if (song.themes.some((t) => t.toLowerCase().includes(theme))) {
          score += 20
        }
      })

      // Tempo matching for mood
      if (criteria.mood === "energetic" && song.tempo === "fast") score += 15
      if (criteria.mood === "peaceful" && song.tempo === "slow") score += 15
      if (criteria.mood === "reflective" && song.tempo === "slow") score += 15
    }

    // Service type matching
    if (criteria.serviceType) {
      if (criteria.serviceType === "sunday_morning" && song.genre === "contemporary") score += 10
      if (criteria.serviceType === "sunday_evening" && song.genre === "worship") score += 10
      if (criteria.serviceType === "special_event" && song.genre === "hymn") score += 5
    }

    // Popularity boost
    score += Math.min(song.tags.length * 2, 10)

    return score
  }

  // Generate intelligent setlist with optimal flow
  static async generateSetList(config: {
    title: string
    date: string
    serviceType: string
    theme?: string
    duration: number
    language: string
    includeHymns?: boolean
    maxSongs?: number
    keyPreferences?: string[]
  }): Promise<SetList> {
    const maxSongs = config.maxSongs || Math.floor(config.duration / 4)
    const songs: SetListSong[] = []

    // Opening song (energetic/praise)
    const openingSongs = await this.recommendSongs({
      mood: "energetic",
      serviceType: config.serviceType,
      language: config.language,
      theme: config.theme,
    })

    if (openingSongs.length > 0) {
      songs.push(this.createSetListSong(openingSongs[0], songs.length + 1))
    }

    // Worship songs (2-3 songs, more reflective)
    const worshipSongs = await this.recommendSongs({
      mood: "worshipful",
      serviceType: config.serviceType,
      language: config.language,
      theme: config.theme,
      excludeSongs: songs.map((s) => s.songId),
    })

    const numWorshipSongs = Math.min(3, maxSongs - songs.length - 1)
    worshipSongs.slice(0, numWorshipSongs).forEach((song) => {
      songs.push(this.createSetListSong(song, songs.length + 1))
    })

    // Closing song (celebratory or peaceful)
    const closingSongs = await this.recommendSongs({
      mood: "celebratory",
      serviceType: config.serviceType,
      language: config.language,
      theme: config.theme,
      excludeSongs: songs.map((s) => s.songId),
    })

    if (closingSongs.length > 0 && songs.length < maxSongs) {
      songs.push(this.createSetListSong(closingSongs[0], songs.length + 1))
    }

    // Optimize key flow
    this.optimizeKeyFlow(songs)

    const totalDuration = songs.reduce((sum, song) => sum + song.estimatedDuration, 0)
    const keyFlow = songs.map((s) => s.key)
    const tempoFlow = songs.map((s) => s.song.tempo)

    return {
      id: `setlist-${Date.now()}`,
      title: config.title,
      date: config.date,
      serviceType: config.serviceType as any,
      theme: config.theme,
      songs,
      totalDuration,
      keyFlow,
      tempoFlow,
      createdBy: "AI Assistant",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  private static createSetListSong(song: Song, order: number): SetListSong {
    return {
      songId: song.id,
      song,
      order,
      key: song.key,
      estimatedDuration: song.duration,
    }
  }

  private static optimizeKeyFlow(songs: SetListSong[]): void {
    // Implement key flow optimization logic
    const keyCompatibility: Record<string, string[]> = {
      C: ["F", "G", "Am", "Dm"],
      G: ["C", "D", "Em", "Am"],
      D: ["G", "A", "Bm", "Em"],
      A: ["D", "E", "F#m", "Bm"],
      E: ["A", "B", "C#m", "F#m"],
      F: ["C", "Bb", "Dm", "Gm"],
    }

    for (let i = 1; i < songs.length; i++) {
      const currentKey = songs[i - 1].key
      const nextKey = songs[i].key

      if (!keyCompatibility[currentKey]?.includes(nextKey)) {
        // Suggest key change for smoother transition
        const compatibleKeys = keyCompatibility[currentKey] || []
        if (compatibleKeys.length > 0) {
          songs[i].key = compatibleKeys[0]
          songs[i].specialInstructions = `Transposed from ${nextKey} to ${compatibleKeys[0]} for smoother transition`
        }
      }
    }
  }

  // Chord progression analysis and suggestions
  static analyzeChordProgression(chords: string): {
    key: string
    progression: string[]
    difficulty: "easy" | "medium" | "hard"
    suggestions: string[]
  } {
    // Basic chord analysis
    const chordArray = chords.split(/[\s\-|]+/).filter((c) => c.trim())

    // Determine key (simplified)
    const key = this.determineKey(chordArray)

    // Analyze difficulty
    const difficulty = this.analyzeDifficulty(chordArray)

    // Generate suggestions
    const suggestions = this.generateChordSuggestions(chordArray, key)

    return {
      key,
      progression: chordArray,
      difficulty,
      suggestions,
    }
  }

  private static determineKey(chords: string[]): string {
    // Simplified key detection based on common chord patterns
    const keySignatures = {
      C: ["C", "F", "G", "Am", "Dm", "Em"],
      G: ["G", "C", "D", "Em", "Am", "Bm"],
      D: ["D", "G", "A", "Bm", "Em", "F#m"],
      A: ["A", "D", "E", "F#m", "Bm", "C#m"],
      F: ["F", "Bb", "C", "Dm", "Gm", "Am"],
    }

    let bestMatch = "C"
    let maxMatches = 0

    Object.entries(keySignatures).forEach(([key, signature]) => {
      const matches = chords.filter((chord) => signature.includes(chord)).length
      if (matches > maxMatches) {
        maxMatches = matches
        bestMatch = key
      }
    })

    return bestMatch
  }

  private static analyzeDifficulty(chords: string[]): "easy" | "medium" | "hard" {
    const easyChords = ["C", "G", "Am", "F", "D", "Em"]
    const mediumChords = ["Dm", "A", "E", "Bm", "F#m", "Bb"]

    const easyCount = chords.filter((c) => easyChords.includes(c)).length
    const mediumCount = chords.filter((c) => mediumChords.includes(c)).length
    const hardCount = chords.length - easyCount - mediumCount

    if (hardCount > chords.length * 0.3) return "hard"
    if (mediumCount > chords.length * 0.4) return "medium"
    return "easy"
  }

  private static generateChordSuggestions(chords: string[], key: string): string[] {
    const suggestions = []

    // Common substitutions
    const substitutions: Record<string, string[]> = {
      C: ["Cadd9", "Csus4", "C/E"],
      G: ["G/B", "Gsus4", "G/D"],
      Am: ["Am7", "Am/C", "Asus2"],
      F: ["Fmaj7", "F/A", "Fsus2"],
    }

    chords.forEach((chord) => {
      if (substitutions[chord]) {
        suggestions.push(`Try ${substitutions[chord].join(" or ")} instead of ${chord}`)
      }
    })

    return suggestions
  }

  // Musician scheduling and availability
  static async scheduleMusicians(
    setListId: string,
    date: string,
    requiredInstruments: string[],
  ): Promise<{
    assigned: { musicianId: string; instrument: string }[]
    conflicts: { musicianId: string; reason: string }[]
    suggestions: string[]
  }> {
    const dayOfWeek = new Date(date).toLocaleLowerCase()
    const assigned: { musicianId: string; instrument: string }[] = []
    const conflicts: { musicianId: string; reason: string }[] = []
    const suggestions: string[] = []

    for (const instrument of requiredInstruments) {
      const availableMusicians = this.musicians.filter(
        (musician) =>
          musician.isActive && musician.instruments.includes(instrument) && musician.availability[dayOfWeek],
      )

      if (availableMusicians.length === 0) {
        conflicts.push({
          musicianId: "",
          reason: `No available musicians for ${instrument} on ${date}`,
        })
        suggestions.push(`Consider recruiting a ${instrument} player or moving the service time`)
      } else {
        // Assign best available musician
        const bestMusician = availableMusicians.sort((a, b) => {
          const skillOrder = { professional: 4, advanced: 3, intermediate: 2, beginner: 1 }
          return skillOrder[b.skillLevel] - skillOrder[a.skillLevel]
        })[0]

        assigned.push({
          musicianId: bestMusician.id,
          instrument,
        })
      }
    }

    return { assigned, conflicts, suggestions }
  }

  // Generate practice tracks with AI
  static async generatePracticeTrack(
    songId: string,
    options: {
      removeVoicePart?: string
      tempo?: "slower" | "normal" | "faster"
      key?: string
      includeClickTrack?: boolean
    },
  ): Promise<{
    trackUrl: string
    duration: number
    settings: any
  }> {
    // In a real implementation, this would integrate with AI audio processing
    const song = this.songs.find((s) => s.id === songId)
    if (!song) throw new Error("Song not found")

    const settings = {
      originalKey: song.key,
      newKey: options.key || song.key,
      tempo: options.tempo || "normal",
      removedPart: options.removeVoicePart,
      clickTrack: options.includeClickTrack,
    }

    // Mock track generation
    const trackUrl = `/api/music/practice-tracks/${songId}?${new URLSearchParams(settings).toString()}`

    return {
      trackUrl,
      duration: song.duration,
      settings,
    }
  }

  // Analytics and insights
  static generateAnalytics(): MusicAnalytics {
    // Mock analytics data
    return {
      popularSongs: [
        { songId: "1", title: "Amazing Grace", timesPlayed: 45, lastPlayed: "2024-01-15" },
        { songId: "2", title: "How Great Thou Art", timesPlayed: 38, lastPlayed: "2024-01-14" },
        { songId: "3", title: "Blessed Be Your Name", timesPlayed: 32, lastPlayed: "2024-01-13" },
      ],
      keyUsage: [
        { key: "G", count: 25, percentage: 35 },
        { key: "C", count: 18, percentage: 25 },
        { key: "D", count: 15, percentage: 21 },
        { key: "A", count: 10, percentage: 14 },
        { key: "F", count: 4, percentage: 5 },
      ],
      genreDistribution: [
        { genre: "contemporary", count: 35, percentage: 45 },
        { genre: "hymn", count: 25, percentage: 32 },
        { genre: "worship", count: 12, percentage: 15 },
        { genre: "praise", count: 6, percentage: 8 },
      ],
      musicianParticipation: [
        { musicianId: "1", name: "John Smith", servicesAttended: 12, rehearsalsAttended: 15 },
        { musicianId: "2", name: "Sarah Johnson", servicesAttended: 10, rehearsalsAttended: 12 },
      ],
      serviceMetrics: {
        averageSongsPerService: 5.2,
        averageServiceDuration: 25.5,
        mostPopularServiceTime: "Sunday 10:00 AM",
      },
    }
  }

  // Initialize with demo data
  static initializeDemoData(): void {
    this.songs = this.getDemoSongs()
    this.musicians = this.getDemoMusicians()
    this.setLists = this.getDemoSetLists()
    this.rehearsals = this.getDemoRehearsals()
  }

  private static getDemoSongs(): Song[] {
    return [
      {
        id: "song-1",
        title: "Amazing Grace",
        artist: "Traditional",
        composer: "John Newton",
        key: "G",
        tempo: "slow",
        bpm: 72,
        timeSignature: "4/4",
        difficulty: "beginner",
        genre: "hymn",
        language: "en",
        themes: ["grace", "salvation", "redemption"],
        lyrics: "Amazing grace how sweet the sound...",
        chords: "G - C - G - D - G",
        duration: 240,
        isPublicDomain: true,
        tags: ["classic", "traditional", "beloved"],
        voiceParts: [
          { name: "soprano", range: { lowest: "D4", highest: "G5" }, difficulty: "easy" },
          { name: "alto", range: { lowest: "B3", highest: "D5" }, difficulty: "easy" },
          { name: "tenor", range: { lowest: "G3", highest: "B4" }, difficulty: "easy" },
          { name: "bass", range: { lowest: "D3", highest: "G4" }, difficulty: "easy" },
        ],
        instruments: [
          { name: "Piano", type: "keyboard", difficulty: "easy", isRequired: true },
          { name: "Acoustic Guitar", type: "guitar", difficulty: "easy", isRequired: false },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        audioUrl: "/audio/amazing-grace.mp3", // <-- Add a valid audio file path or URL
      },
      {
        id: "song-2",
        title: "How Great Thou Art",
        artist: "Traditional",
        composer: "Carl Boberg",
        key: "C",
        tempo: "medium",
        bpm: 88,
        timeSignature: "4/4",
        difficulty: "intermediate",
        genre: "hymn",
        language: "en",
        themes: ["worship", "creation", "majesty"],
        lyrics: "O Lord my God, when I in awesome wonder...",
        chords: "C - F - C - G - C",
        duration: 280,
        isPublicDomain: true,
        tags: ["worship", "powerful", "majestic"],
        voiceParts: [
          { name: "soprano", range: { lowest: "C4", highest: "F5" }, difficulty: "medium" },
          { name: "alto", range: { lowest: "A3", highest: "C5" }, difficulty: "medium" },
          { name: "tenor", range: { lowest: "F3", highest: "A4" }, difficulty: "medium" },
          { name: "bass", range: { lowest: "C3", highest: "F4" }, difficulty: "medium" },
        ],
        instruments: [
          { name: "Piano", type: "keyboard", difficulty: "medium", isRequired: true },
          { name: "Organ", type: "keyboard", difficulty: "medium", isRequired: false },
          { name: "Acoustic Guitar", type: "guitar", difficulty: "medium", isRequired: false },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        audioUrl: "/audio/how-great-thou-art.mp3", // <-- Add a valid audio file path or URL
      },
    ]
  }

  private static getDemoMusicians(): Musician[] {
    return [
      {
        id: "musician-1",
        name: "John Smith",
        email: "john@church.com",
        phone: "+1234567890",
        instruments: ["Piano", "Organ"],
        voiceParts: ["tenor"],
        skillLevel: "advanced",
        availability: {
          sunday: true,
          monday: false,
          tuesday: true,
          wednesday: true,
          thursday: false,
          friday: true,
          saturday: false,
        },
        preferences: {
          genres: ["hymn", "contemporary"],
          languages: ["en"],
          maxSongsPerService: 6,
        },
        isActive: true,
        joinedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: "musician-2",
        name: "Sarah Johnson",
        email: "sarah@church.com",
        instruments: ["Acoustic Guitar", "Electric Guitar"],
        voiceParts: ["soprano", "alto"],
        skillLevel: "professional",
        availability: {
          sunday: true,
          monday: true,
          tuesday: false,
          wednesday: true,
          thursday: true,
          friday: false,
          saturday: true,
        },
        preferences: {
          genres: ["contemporary", "worship"],
          languages: ["en", "pt"],
          maxSongsPerService: 8,
        },
        isActive: true,
        joinedAt: "2024-01-01T00:00:00Z",
      },
    ]
  }

  private static getDemoSetLists(): SetList[] {
    return [
      {
        id: "setlist-1",
        title: "Sunday Morning Worship",
        date: "2024-01-21",
        serviceType: "sunday_morning",
        theme: "God's Grace",
        songs: [
          {
            songId: "song-1",
            song: this.getDemoSongs()[0],
            order: 1,
            key: "G",
            estimatedDuration: 240,
          },
          {
            songId: "song-2",
            song: this.getDemoSongs()[1],
            order: 2,
            key: "C",
            estimatedDuration: 280,
          },
        ],
        totalDuration: 520,
        keyFlow: ["G", "C"],
        tempoFlow: ["slow", "medium"],
        notes: "Focus on the theme of grace throughout the service",
        createdBy: "Pastor John",
        status: "approved",
        createdAt: "2024-01-15T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
      },
    ]
  }

  private static getDemoRehearsals(): Rehearsal[] {
    return [
      {
        id: "rehearsal-1",
        title: "Sunday Service Rehearsal",
        date: "2024-01-20",
        startTime: "09:00",
        endTime: "11:00",
        location: "Main Sanctuary",
        setListId: "setlist-1",
        attendees: ["musician-1", "musician-2"],
        agenda: [
          {
            id: "item-1",
            type: "song",
            songId: "song-1",
            title: "Amazing Grace",
            duration: 30,
            notes: "Practice key transition",
            isCompleted: false,
          },
          {
            id: "item-2",
            type: "song",
            songId: "song-2",
            title: "How Great Thou Art",
            duration: 35,
            notes: "Work on harmonies",
            isCompleted: false,
          },
        ],
        status: "scheduled",
        createdAt: "2024-01-15T00:00:00Z",
      },
    ]
  }

  // Getters for demo data
  static getSongs(): Song[] {
    return this.songs
  }
  static getMusicians(): Musician[] {
    return this.musicians
  }
  static getSetLists(): SetList[] {
    return this.setLists
  }
  static getRehearsals(): Rehearsal[] {
    return this.rehearsals
  }
}

// Initialize demo data
AIMusicMinistry.initializeDemoData()
