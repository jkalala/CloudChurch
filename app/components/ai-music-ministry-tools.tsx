"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
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
  Trash2,
} from "lucide-react"
import { AIMusicMinistry, type Song, type SetList, type Musician, type Rehearsal } from "@/lib/ai-music-ministry"
import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "@/lib/i18n"
import { useAuth } from "@/components/auth-provider"
import { toast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import WaveSurfer from 'wavesurfer.js';

/**
 * Custom hook for setlist generation logic
 * @param {Object} params - Parameters for setlist generation
 * @param {SetList[]} params.setLists - Current setlists
 * @param {Dispatch<SetStateAction<SetList[]>>} params.setSetLists - State setter for setlists
 * @param {Dispatch<SetStateAction<SetList | null>>} params.setSelectedSetList - State setter for selected setlist
 * @param {Dispatch<SetStateAction<boolean>>} params.setShowCreateSetList - State setter for create setlist modal
 * @param {Dispatch<SetStateAction<boolean>>} params.setIsLoading - State setter for loading state
 * @param {any} params.setListConfig - Configuration for setlist generation
 * @returns {Object} - Handler function for generating setlists
 */
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
    if (!setListConfig.title.trim()) {
      toast({
        title: "Please enter a setlist title",
        variant: "destructive",
      })
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/music/setlists/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setListConfig),
      });
      const data = await res.json();
      setSetLists([data.setList, ...setLists]);
      setSelectedSetList(data.setList);
      setShowCreateSetList(false);
      toast({ title: 'AI setlist generated successfully!' });
    } catch (error) {
      toast({ title: 'Failed to generate setlist', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [setListConfig, setLists, setSetLists, setSelectedSetList, setShowCreateSetList, setIsLoading]);

  return { handleGenerateSetList };
}

type AIMusicMinistryToolsProps = {
  initialTab?: string;
};

/**
 * Main component for AI Music Ministry Tools
 * Provides a comprehensive interface for managing songs, setlists, musicians, and rehearsals
 * with AI-powered features for generation and optimization.
 */
export default function AIMusicMinistryTools({ initialTab = "dashboard" }: AIMusicMinistryToolsProps) {
  // State management for tabs and data
  const [activeTab, setActiveTab] = useState(initialTab);
  const [songs, setSongs] = useState<Song[]>([]);
  const [setLists, setSetLists] = useState<SetList[]>([]);
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [rehearsals, setRehearsals] = useState<Rehearsal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for selected items
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [selectedSetList, setSelectedSetList] = useState<SetList | null>(null);
  
  // State for audio playback
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [waveSurfers, setWaveSurfers] = useState<Record<string, WaveSurfer | null>>({});
  const waveformRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // State for modals and forms
  const [showCreateSetList, setShowCreateSetList] = useState(false);
  const [showChordAnalyzer, setShowChordAnalyzer] = useState(false);
  const [chordInput, setChordInput] = useState("");
  const [chordAnalysis, setChordAnalysis] = useState<any>(null);
  const [showAIBanner, setShowAIBanner] = useState(true);
  
  // Onboarding state
  const [firstVisit, setFirstVisit] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('aiMusicMinistryOnboarded');
    }
    return false;
  });

  // SetList generation form state
  const [setListConfig, setSetListConfig] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    serviceType: "sunday_morning",
    theme: "",
    duration: 25,
    language: "en",
    includeHymns: true,
    maxSongs: 6,
  });

  // Form states for CRUD operations
  const [showSongModal, setShowSongModal] = useState(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [songForm, setSongForm] = useState<Partial<Song>>({});
  const [songFormLoading, setSongFormLoading] = useState(false);
  const [songFormError, setSongFormError] = useState<string | null>(null);
  
  const [showSetListModal, setShowSetListModal] = useState(false);
  const [editingSetList, setEditingSetList] = useState<SetList | null>(null);
  const [setListForm, setSetListForm] = useState<Partial<SetList>>({});
  const [setListFormLoading, setSetListFormLoading] = useState(false);
  const [setListFormError, setSetListFormError] = useState<string | null>(null);
  
  const [showMusicianModal, setShowMusicianModal] = useState(false);
  const [editingMusician, setEditingMusician] = useState<Musician | null>(null);
  const [musicianForm, setMusicianForm] = useState<Partial<Musician>>({});
  const [musicianFormLoading, setMusicianFormLoading] = useState(false);
  const [musicianFormError, setMusicianFormError] = useState<string | null>(null);
  
  const [showRehearsalModal, setShowRehearsalModal] = useState(false);
  const [editingRehearsal, setEditingRehearsal] = useState<Rehearsal | null>(null);
  const [rehearsalForm, setRehearsalForm] = useState<Partial<Rehearsal>>({});
  const [rehearsalFormLoading, setRehearsalFormLoading] = useState(false);
  const [rehearsalFormError, setRehearsalFormError] = useState<string | null>(null);

  // Delete confirmation states
  const [showSongDeleteDialog, setShowSongDeleteDialog] = useState(false);
  const [deletingSong, setDeletingSong] = useState<Song | null>(null);
  const [songDeleteLoading, setSongDeleteLoading] = useState(false);
  const [songDeleteError, setSongDeleteError] = useState<string | null>(null);
  
  const [showSetListDeleteDialog, setShowSetListDeleteDialog] = useState(false);
  const [deletingSetList, setDeletingSetList] = useState<SetList | null>(null);
  const [setListDeleteLoading, setSetListDeleteLoading] = useState(false);
  const [setListDeleteError, setSetListDeleteError] = useState<string | null>(null);
  
  const [showMusicianDeleteDialog, setShowMusicianDeleteDialog] = useState(false);
  const [deletingMusician, setDeletingMusician] = useState<Musician | null>(null);
  const [musicianDeleteLoading, setMusicianDeleteLoading] = useState(false);
  const [musicianDeleteError, setMusicianDeleteError] = useState<string | null>(null);
  
  const [showRehearsalDeleteDialog, setShowRehearsalDeleteDialog] = useState(false);
  const [deletingRehearsal, setDeletingRehearsal] = useState<Rehearsal | null>(null);
  const [rehearsalDeleteLoading, setRehearsalDeleteLoading] = useState(false);
  const [rehearsalDeleteError, setRehearsalDeleteError] = useState<string | null>(null);

  // 1. Add state:
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  const { language } = useAuth();
  const { t } = useTranslation(language);
  const { handleGenerateSetList } = useSetListGeneration({
    setLists,
    setSetLists,
    setSelectedSetList,
    setShowCreateSetList,
    setIsLoading,
    setListConfig
  });

  // Clean up wavesurfers on unmount
  useEffect(() => {
    return () => {
      Object.values(waveSurfers).forEach(ws => ws && ws.destroy());
    };
  }, []);

  // Set active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Mark onboarding as complete
  useEffect(() => {
    if (firstVisit && typeof window !== 'undefined') {
      localStorage.setItem('aiMusicMinistryOnboarded', 'true');
    }
  }, [firstVisit]);

  /**
   * Fetches songs from the backend API
   */
  const fetchSongs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/music/songs');
      const data = await res.json();
      setSongs(data.songs || []);
    } catch (err) {
      setSongFormError('Failed to load songs');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches setlists from the backend API
   */
  const fetchSetlists = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/music/setlists');
      const data = await res.json();
      setSetLists(data.setlists || []);
    } catch (err) {
      setSetListFormError('Failed to load setlists');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches musicians from the backend API
   */
  const fetchMusicians = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/music/musicians');
      const data = await res.json();
      setMusicians(data.musicians || []);
    } catch (err) {
      setMusicianFormError('Failed to load musicians');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetches rehearsals from the backend API
   */
  const fetchRehearsals = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/music/rehearsals');
      const data = await res.json();
      setRehearsals(data.rehearsals || []);
    } catch (err) {
      setRehearsalFormError('Failed to load rehearsals');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchSongs();
    fetchSetlists();
    fetchMusicians();
    fetchRehearsals();
  }, []);

  /**
   * Handles song form submission (create/update)
   * @param {React.FormEvent} e - Form event
   */
  const handleSongFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSongFormLoading(true);
    setSongFormError(null);
    try {
      let resp;
      if (editingSong) {
        resp = await fetch('/api/music/songs', { 
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ id: editingSong.id, ...songForm }) 
        });
      } else {
        resp = await fetch('/api/music/songs', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(songForm) 
        });
      }
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save song');
      toast({ title: 'Song saved successfully!', variant: 'default' });
      await fetchSongs();
      closeSongModal();
    } catch (err: any) {
      setSongFormError(err.message || 'Failed to save song');
      toast({ title: err.message || 'Failed to save song', variant: 'destructive' });
    } finally {
      setSongFormLoading(false);
    }
  };

  /**
   * Handles song deletion
   */
  const handleDeleteSong = async () => {
    if (!deletingSong) return;
    setSongDeleteLoading(true);
    setSongDeleteError(null);
    try {
      const resp = await fetch('/api/music/songs', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: deletingSong.id }) 
      });
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to delete song');
      toast({ title: 'Song deleted successfully!', variant: 'default' });
      await fetchSongs();
      closeSongDeleteDialog();
    } catch (err: any) {
      setSongDeleteError(err.message || 'Failed to delete song');
      toast({ title: err.message || 'Failed to delete song', variant: 'destructive' });
    } finally {
      setSongDeleteLoading(false);
    }
  };

  /**
   * Handles setlist form submission (create/update)
   * @param {React.FormEvent} e - Form event
   */
  const handleSetListFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetListFormLoading(true);
    setSetListFormError(null);
    try {
      let resp;
      if (editingSetList) {
        resp = await fetch('/api/music/setlists', { 
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ id: editingSetList.id, ...setListForm }) 
        });
      } else {
        resp = await fetch('/api/music/setlists', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(setListForm) 
        });
      }
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save setlist');
      toast({ title: 'Setlist saved successfully!', variant: 'default' });
      await fetchSetlists();
      closeSetListModal();
    } catch (err: any) {
      setSetListFormError(err.message || 'Failed to save setlist');
      toast({ title: err.message || 'Failed to save setlist', variant: 'destructive' });
    } finally {
      setSetListFormLoading(false);
    }
  };

  /**
   * Handles setlist deletion
   */
  const handleDeleteSetList = async () => {
    if (!deletingSetList) return;
    setSetListDeleteLoading(true);
    setSetListDeleteError(null);
    try {
      const resp = await fetch('/api/music/setlists', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: deletingSetList.id }) 
      });
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to delete setlist');
      toast({ title: 'Setlist deleted successfully!', variant: 'default' });
      await fetchSetlists();
      closeSetListDeleteDialog();
    } catch (err: any) {
      setSetListDeleteError(err.message || 'Failed to delete setlist');
      toast({ title: err.message || 'Failed to delete setlist', variant: 'destructive' });
    } finally {
      setSetListDeleteLoading(false);
    }
  };

  /**
   * Handles musician form submission (create/update)
   * @param {React.FormEvent} e - Form event
   */
  const handleMusicianFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMusicianFormLoading(true);
    setMusicianFormError(null);
    try {
      let resp;
      if (editingMusician) {
        resp = await fetch('/api/music/musicians', { 
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ id: editingMusician.id, ...musicianForm }) 
        });
      } else {
        resp = await fetch('/api/music/musicians', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(musicianForm) 
        });
      }
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save musician');
      toast({ title: 'Musician saved successfully!', variant: 'default' });
      await fetchMusicians();
      closeMusicianModal();
    } catch (err: any) {
      setMusicianFormError(err.message || 'Failed to save musician');
      toast({ title: err.message || 'Failed to save musician', variant: 'destructive' });
    } finally {
      setMusicianFormLoading(false);
    }
  };

  /**
   * Handles musician deletion
   */
  const handleDeleteMusician = async () => {
    if (!deletingMusician) return;
    setMusicianDeleteLoading(true);
    setMusicianDeleteError(null);
    try {
      const resp = await fetch('/api/music/musicians', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: deletingMusician.id }) 
      });
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to delete musician');
      toast({ title: 'Musician deleted successfully!', variant: 'default' });
      await fetchMusicians();
      closeMusicianDeleteDialog();
    } catch (err: any) {
      setMusicianDeleteError(err.message || 'Failed to delete musician');
      toast({ title: err.message || 'Failed to delete musician', variant: 'destructive' });
    } finally {
      setMusicianDeleteLoading(false);
    }
  };

  /**
   * Handles rehearsal form submission (create/update)
   * @param {React.FormEvent} e - Form event
   */
  const handleRehearsalFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRehearsalFormLoading(true);
    setRehearsalFormError(null);
    try {
      let resp;
      if (editingRehearsal) {
        resp = await fetch('/api/music/rehearsals', { 
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ id: editingRehearsal.id, ...rehearsalForm }) 
        });
      } else {
        resp = await fetch('/api/music/rehearsals', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(rehearsalForm) 
        });
      }
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to save rehearsal');
      toast({ title: 'Rehearsal saved successfully!', variant: 'default' });
      await fetchRehearsals();
      closeRehearsalModal();
    } catch (err: any) {
      setRehearsalFormError(err.message || 'Failed to save rehearsal');
      toast({ title: err.message || 'Failed to save rehearsal', variant: 'destructive' });
    } finally {
      setRehearsalFormLoading(false);
    }
  };

  /**
   * Handles rehearsal deletion
   */
  const handleDeleteRehearsal = async () => {
    if (!deletingRehearsal) return;
    setRehearsalDeleteLoading(true);
    setRehearsalDeleteError(null);
    try {
      const resp = await fetch('/api/music/rehearsals', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: deletingRehearsal.id }) 
      });
      if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to delete rehearsal');
      toast({ title: 'Rehearsal deleted successfully!', variant: 'default' });
      await fetchRehearsals();
      closeRehearsalDeleteDialog();
    } catch (err: any) {
      setRehearsalDeleteError(err.message || 'Failed to delete rehearsal');
      toast({ title: err.message || 'Failed to delete rehearsal', variant: 'destructive' });
    } finally {
      setRehearsalDeleteLoading(false);
    }
  };

  /**
   * Handles form changes for song form
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - Change event
   */
  const handleSongFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSongForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles form changes for setlist form
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - Change event
   */
  const handleSetListFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSetListForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles form changes for musician form
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - Change event
   */
  const handleMusicianFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMusicianForm(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles form changes for rehearsal form
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>} e - Change event
   */
  const handleRehearsalFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRehearsalForm(prev => ({ ...prev, [name]: value }));
  };

  // Modal open/close handlers
  const openNewSongModal = () => { 
    setEditingSong(null); 
    setSongForm({}); 
    setShowSongModal(true); 
    setSongFormError(null); 
  };

  const openEditSongModal = (song: Song) => { 
    setEditingSong(song); 
    setSongForm(song); 
    setShowSongModal(true); 
    setSongFormError(null); 
  };

  const closeSongModal = () => { 
    setShowSongModal(false); 
    setEditingSong(null); 
    setSongForm({}); 
    setSongFormError(null); 
  };

  const openNewSetListModal = () => { 
    setEditingSetList(null); 
    setSetListForm({}); 
    setShowSetListModal(true); 
    setSetListFormError(null); 
  };

  const openEditSetListModal = (setList: SetList) => { 
    setEditingSetList(setList); 
    setSetListForm(setList); 
    setShowSetListModal(true); 
    setSetListFormError(null); 
  };

  const closeSetListModal = () => { 
    setShowSetListModal(false); 
    setEditingSetList(null); 
    setSetListForm({}); 
    setSetListFormError(null); 
  };

  const openNewMusicianModal = () => { 
    setEditingMusician(null); 
    setMusicianForm({}); 
    setShowMusicianModal(true); 
    setMusicianFormError(null); 
  };

  const openEditMusicianModal = (musician: Musician) => { 
    setEditingMusician(musician); 
    setMusicianForm(musician); 
    setShowMusicianModal(true); 
    setMusicianFormError(null); 
  };

  const closeMusicianModal = () => { 
    setShowMusicianModal(false); 
    setEditingMusician(null); 
    setMusicianForm({}); 
    setMusicianFormError(null); 
  };

  const openNewRehearsalModal = () => { 
    setEditingRehearsal(null); 
    setRehearsalForm({}); 
    setShowRehearsalModal(true); 
    setRehearsalFormError(null); 
  };

  const openEditRehearsalModal = (rehearsal: Rehearsal) => { 
    setEditingRehearsal(rehearsal); 
    setRehearsalForm(rehearsal); 
    setShowRehearsalModal(true); 
    setRehearsalFormError(null); 
  };

  const closeRehearsalModal = () => { 
    setShowRehearsalModal(false); 
    setEditingRehearsal(null); 
    setRehearsalForm({}); 
    setRehearsalFormError(null); 
  };

  // Delete dialog handlers
  const openSongDeleteDialog = (song: Song) => { 
    setDeletingSong(song); 
    setShowSongDeleteDialog(true); 
    setSongDeleteError(null); 
  };

  const closeSongDeleteDialog = () => { 
    setShowSongDeleteDialog(false); 
    setDeletingSong(null); 
    setSongDeleteError(null); 
  };

  const openSetListDeleteDialog = (setList: SetList) => { 
    setDeletingSetList(setList); 
    setShowSetListDeleteDialog(true); 
    setSetListDeleteError(null); 
  };

  const closeSetListDeleteDialog = () => { 
    setShowSetListDeleteDialog(false); 
    setDeletingSetList(null); 
    setSetListDeleteError(null); 
  };

  const openMusicianDeleteDialog = (musician: Musician) => { 
    setDeletingMusician(musician); 
    setShowMusicianDeleteDialog(true); 
    setMusicianDeleteError(null); 
  };

  const closeMusicianDeleteDialog = () => { 
    setShowMusicianDeleteDialog(false); 
    setDeletingMusician(null); 
    setMusicianDeleteError(null); 
  };

  const openRehearsalDeleteDialog = (rehearsal: Rehearsal) => { 
    setDeletingRehearsal(rehearsal); 
    setShowRehearsalDeleteDialog(true); 
    setRehearsalDeleteError(null); 
  };

  const closeRehearsalDeleteDialog = () => { 
    setShowRehearsalDeleteDialog(false); 
    setDeletingRehearsal(null); 
    setRehearsalDeleteError(null); 
  };

  /**
   * Handles song playback
   * @param {string} songId - ID of the song to play
   * @param {string} [audioUrl] - Optional audio URL
   */
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

  /**
   * Gets AI song recommendations based on current setlist config
   */
  const handleRecommendSongs = async () => {
    setRecommendationLoading(true);
    setRecommendationError(null);
    try {
      const res = await fetch('/api/music/songs/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: setListConfig.theme,
          serviceType: setListConfig.serviceType,
          language: setListConfig.language,
          duration: setListConfig.duration,
        }),
      });
      const data = await res.json();
      setRecommendedSongs(data.songs || []);
      toast({ title: `Found ${data.songs.length} recommended songs` });
    } catch (error) {
      setRecommendationError('Failed to get song recommendations');
      toast({ title: 'Failed to get song recommendations', variant: 'destructive' });
    } finally {
      setRecommendationLoading(false);
    }
  };

  /**
   * Analyzes chord progression input
   */
  const handleAnalyzeChords = () => {
    if (!chordInput.trim()) {
      toast({
        title: "Please enter chord progression",
        variant: "destructive",
      });
      return;
    }

    const analysis = AIMusicMinistry.analyzeChordProgression(chordInput);
    setChordAnalysis(analysis);
    toast({
      title: "Chord progression analyzed!",
    });
  };

  // Filter songs based on search query
  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.themes.some((theme) => theme.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  // Add at the top of the component:
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Fetch analytics on mount and when dashboard tab is selected
  useEffect(() => {
    if (activeTab === 'dashboard') {
      setIsLoading(true);
      fetch('/api/music/analytics')
        .then(res => res.json())
        .then(data => {
          setAnalytics(data);
          setAnalyticsError(null);
        })
        .catch(() => setAnalyticsError('Failed to load analytics'))
        .finally(() => setIsLoading(false));
    }
  }, [activeTab]);

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
          <Button variant="outline" onClick={openNewSongModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Song
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
          {isLoading && <div>Loading analytics...</div>}
          {analyticsError && <div className="text-red-600">{analyticsError}</div>}
          {analytics && (
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
                    {analytics.popularSongs.map((song: any, index: number) => (
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
                    {analytics.keyUsage.map((key: any) => (
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
                    {analytics.genreDistribution.map((genre: any) => (
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
          )}
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
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => openEditSongModal(song)} aria-label={t("aiMusic.edit")}> 
                            <Wand2 className="h-4 w-4" aria-label={t("aiMusic.edit")}/>
                            <span className="sr-only">{t("aiMusic.edit")}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('aiMusic.editTooltip')}</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="destructive" onClick={() => openSongDeleteDialog(song)} aria-label={t("aiMusic.delete")}> 
                            <Trash2 className="h-4 w-4" aria-label={t("aiMusic.delete")}/>
                            <span className="sr-only">{t("aiMusic.delete")}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{t('aiMusic.deleteTooltip')}</TooltipContent>
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
                    <Button size="sm" variant="outline" onClick={() => openEditSetListModal(setList)} aria-label={t("aiMusic.edit")}> 
                      <Wand2 className="h-4 w-4" aria-label={t("aiMusic.edit")}/>
                      <span className="sr-only">{t("aiMusic.edit")}</span>
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => openSetListDeleteDialog(setList)} aria-label={t("aiMusic.delete")}> 
                      <Trash2 className="h-4 w-4" aria-label={t("aiMusic.delete")}/>
                      <span className="sr-only">{t("aiMusic.delete")}</span>
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
          <Button variant="outline" onClick={openNewSetListModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add SetList
          </Button>
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
          <Button variant="outline" onClick={openNewMusicianModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Musician
          </Button>
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
          <Button variant="outline" onClick={openNewRehearsalModal}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rehearsal
          </Button>
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
                  {recommendationLoading && <div>Loading recommendations...</div>}
                  {recommendationError && <div className="text-red-600">{recommendationError}</div>}
                  {recommendedSongs.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {recommendedSongs.map(song => (
                        <Card key={song.id} className="p-2">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">{song.title}</div>
                              <div className="text-sm text-muted-foreground">{song.artist} • {song.genre} • {song.key}</div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setSelectedSong(song)}>View</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
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

      {/* Song Modal */}
      <Dialog open={showSongModal} onOpenChange={setShowSongModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSong ? 'Edit Song' : 'Add Song'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSongFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="title">Title</label>
              <input name="title" value={songForm.title || ''} onChange={handleSongFormChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="artist">Artist</label>
              <input name="artist" value={songForm.artist || ''} onChange={handleSongFormChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="genre">Genre</label>
              <input name="genre" value={songForm.genre || ''} onChange={handleSongFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="key">Key</label>
              <input name="key" value={songForm.key || ''} onChange={handleSongFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="duration">Duration (seconds)</label>
              <input type="number" name="duration" value={songForm.duration || ''} onChange={handleSongFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="difficulty">Difficulty</label>
              <select name="difficulty" value={songForm.difficulty || ''} onChange={handleSongFormChange} className="w-full border rounded px-2 py-1">
                <option value="">Select</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            {songFormError && <div className="text-red-600 text-sm">{songFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeSongModal} disabled={songFormLoading}>Cancel</Button>
              <Button type="submit" disabled={songFormLoading}>{songFormLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Song Delete Confirmation Dialog */}
      <Dialog open={showSongDeleteDialog} onOpenChange={setShowSongDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Song</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this song?</div>
          {songDeleteError && <div className="text-red-600 text-sm">{songDeleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeSongDeleteDialog} disabled={songDeleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteSong} disabled={songDeleteLoading}>{songDeleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* SetList Modal */}
      <Dialog open={showSetListModal} onOpenChange={setShowSetListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSetList ? 'Edit SetList' : 'Add SetList'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSetListFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="title">Title</label>
              <input name="title" value={setListForm.title || ''} onChange={handleSetListFormChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="date">Date</label>
              <input type="date" name="date" value={setListForm.date || ''} onChange={handleSetListFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="serviceType">Service Type</label>
              <input name="serviceType" value={setListForm.serviceType || ''} onChange={handleSetListFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="theme">Theme</label>
              <input name="theme" value={setListForm.theme || ''} onChange={handleSetListFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            {setListFormError && <div className="text-red-600 text-sm">{setListFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeSetListModal} disabled={setListFormLoading}>Cancel</Button>
              <Button type="submit" disabled={setListFormLoading}>{setListFormLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* SetList Delete Confirmation Dialog */}
      <Dialog open={showSetListDeleteDialog} onOpenChange={setShowSetListDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete SetList</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this setlist?</div>
          {setListDeleteError && <div className="text-red-600 text-sm">{setListDeleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeSetListDeleteDialog} disabled={setListDeleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteSetList} disabled={setListDeleteLoading}>{setListDeleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Musician Modal */}
      <Dialog open={showMusicianModal} onOpenChange={setShowMusicianModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMusician ? 'Edit Musician' : 'Add Musician'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMusicianFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="name">Name</label>
              <input name="name" value={musicianForm.name || ''} onChange={handleMusicianFormChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="instruments">Instruments</label>
              <input
                name="instruments"
                value={Array.isArray(musicianForm.instruments) ? musicianForm.instruments.join(", ") : ""}
                onChange={e =>
                  setMusicianForm(prev => ({
                    ...prev,
                    instruments: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  }))
                }
                className="w-full border rounded px-2 py-1"
              />
            </div>
            {musicianFormError && <div className="text-red-600 text-sm">{musicianFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeMusicianModal} disabled={musicianFormLoading}>Cancel</Button>
              <Button type="submit" disabled={musicianFormLoading}>{musicianFormLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Musician Delete Confirmation Dialog */}
      <Dialog open={showMusicianDeleteDialog} onOpenChange={setShowMusicianDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Musician</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this musician?</div>
          {musicianDeleteError && <div className="text-red-600 text-sm">{musicianDeleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeMusicianDeleteDialog} disabled={musicianDeleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteMusician} disabled={musicianDeleteLoading}>{musicianDeleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Rehearsal Modal */}
      <Dialog open={showRehearsalModal} onOpenChange={setShowRehearsalModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRehearsal ? 'Edit Rehearsal' : 'Add Rehearsal'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRehearsalFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="title">Title</label>
              <input name="title" value={rehearsalForm.title || ''} onChange={handleRehearsalFormChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="date">Date</label>
              <input type="date" name="date" value={rehearsalForm.date || ''} onChange={handleRehearsalFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label htmlFor="location">Location</label>
              <input name="location" value={rehearsalForm.location || ''} onChange={handleRehearsalFormChange} className="w-full border rounded px-2 py-1" />
            </div>
            {rehearsalFormError && <div className="text-red-600 text-sm">{rehearsalFormError}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeRehearsalModal} disabled={rehearsalFormLoading}>Cancel</Button>
              <Button type="submit" disabled={rehearsalFormLoading}>{rehearsalFormLoading ? 'Saving...' : 'Save'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Rehearsal Delete Confirmation Dialog */}
      <Dialog open={showRehearsalDeleteDialog} onOpenChange={setShowRehearsalDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rehearsal</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this rehearsal?</div>
          {rehearsalDeleteError && <div className="text-red-600 text-sm">{rehearsalDeleteError}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeRehearsalDeleteDialog} disabled={rehearsalDeleteLoading}>Cancel</Button>
            <Button type="button" variant="destructive" onClick={handleDeleteRehearsal} disabled={rehearsalDeleteLoading}>{rehearsalDeleteLoading ? 'Deleting...' : 'Delete'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}