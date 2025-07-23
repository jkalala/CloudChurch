'use client';

import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Music,
  Calendar,
  Clock,
  Users,
  FileText,
  Play,
  Download,
  Edit,
  Mic,
  Guitar,
  Piano,
  Drum
} from 'lucide-react';
import { format } from 'date-fns';

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

// Sample songs data
const songs = [
  {
    id: '1',
    title: 'Amazing Grace',
    author: 'John Newton',
    key: 'G',
    tempo: 72,
    tags: ['hymn', 'classic', 'worship'],
    lastUsed: '2025-07-14',
    timesUsed: 12,
    hasChords: true,
    hasLyrics: true,
    hasSheet: true
  },
  {
    id: '2',
    title: 'How Great Is Our God',
    author: 'Chris Tomlin',
    key: 'C',
    tempo: 78,
    tags: ['worship', 'contemporary'],
    lastUsed: '2025-07-07',
    timesUsed: 8,
    hasChords: true,
    hasLyrics: true,
    hasSheet: true
  },
  {
    id: '3',
    title: 'Oceans (Where Feet May Fail)',
    author: 'Hillsong United',
    key: 'D',
    tempo: 68,
    tags: ['worship', 'contemporary'],
    lastUsed: '2025-06-30',
    timesUsed: 5,
    hasChords: true,
    hasLyrics: true,
    hasSheet: false
  },
  {
    id: '4',
    title: 'Great Are You Lord',
    author: 'All Sons & Daughters',
    key: 'A',
    tempo: 72,
    tags: ['worship', 'contemporary'],
    lastUsed: '2025-06-23',
    timesUsed: 7,
    hasChords: true,
    hasLyrics: true,
    hasSheet: true
  },
  {
    id: '5',
    title: 'What A Beautiful Name',
    author: 'Hillsong Worship',
    key: 'D',
    tempo: 68,
    tags: ['worship', 'contemporary'],
    lastUsed: '2025-07-14',
    timesUsed: 10,
    hasChords: true,
    hasLyrics: true,
    hasSheet: true
  }
];

// Sample team members data
const teamMembers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Worship Leader',
    instrument: 'Vocals',
    email: 'sarah.j@example.com',
    phone: '(555) 123-4567',
    avatar: '/placeholder-user.jpg',
    availability: ['Sunday Morning', 'Wednesday Evening']
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Musician',
    instrument: 'Guitar',
    email: 'michael.c@example.com',
    phone: '(555) 234-5678',
    avatar: '',
    availability: ['Sunday Morning', 'Sunday Evening']
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Vocalist',
    instrument: 'Vocals',
    email: 'emily.r@example.com',
    phone: '(555) 345-6789',
    avatar: '/placeholder-user.jpg',
    availability: ['Sunday Morning']
  },
  {
    id: '4',
    name: 'David Kim',
    role: 'Musician',
    instrument: 'Piano',
    email: 'david.k@example.com',
    phone: '(555) 456-7890',
    avatar: '',
    availability: ['Sunday Morning', 'Wednesday Evening']
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    role: 'Musician',
    instrument: 'Drums',
    email: 'lisa.t@example.com',
    phone: '(555) 567-8901',
    avatar: '',
    availability: ['Sunday Morning', 'Sunday Evening']
  }
];

// Sample rehearsals data
const rehearsals = [
  {
    id: '1',
    date: '2025-07-19',
    time: '6:00 PM - 8:00 PM',
    location: 'Main Sanctuary',
    status: 'upcoming',
    attendees: 8,
    songs: ['Amazing Grace', 'How Great Is Our God', 'What A Beautiful Name']
  },
  {
    id: '2',
    date: '2025-07-12',
    time: '6:00 PM - 8:00 PM',
    location: 'Main Sanctuary',
    status: 'completed',
    attendees: 7,
    songs: ['Oceans (Where Feet May Fail)', 'Great Are You Lord']
  },
  {
    id: '3',
    date: '2025-07-05',
    time: '6:00 PM - 8:00 PM',
    location: 'Main Sanctuary',
    status: 'completed',
    attendees: 8,
    songs: ['Amazing Grace', 'How Great Is Our God']
  }
];

// Sample worship sets data
const worshipSets = [
  {
    id: '1',
    date: '2025-07-21',
    service: 'Sunday Morning',
    theme: 'God\'s Grace',
    songs: [
      { title: 'Amazing Grace', key: 'G' },
      { title: 'How Great Is Our God', key: 'C' },
      { title: 'What A Beautiful Name', key: 'D' }
    ],
    status: 'upcoming',
    leader: 'Sarah Johnson'
  },
  {
    id: '2',
    date: '2025-07-14',
    service: 'Sunday Morning',
    theme: 'Faith',
    songs: [
      { title: 'Oceans (Where Feet May Fail)', key: 'D' },
      { title: 'Great Are You Lord', key: 'A' },
      { title: 'What A Beautiful Name', key: 'D' }
    ],
    status: 'completed',
    leader: 'Sarah Johnson'
  },
  {
    id: '3',
    date: '2025-07-07',
    service: 'Sunday Morning',
    theme: 'Worship',
    songs: [
      { title: 'How Great Is Our God', key: 'C' },
      { title: 'Amazing Grace', key: 'G' }
    ],
    status: 'completed',
    leader: 'Michael Chen'
  }
];

export default function MusicMinistryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [songFilter, setSongFilter] = useState<'all' | 'hymn' | 'contemporary'>('all');
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Get instrument icon
  const getInstrumentIcon = (instrument: string) => {
    switch (instrument.toLowerCase()) {
      case 'vocals': return <Mic className="h-4 w-4" />;
      case 'guitar': return <Guitar className="h-4 w-4" />;
      case 'piano': return <Piano className="h-4 w-4" />;
      case 'drums': return <Drum className="h-4 w-4" />;
      default: return <Music className="h-4 w-4" />;
    }
  };
  
  // Filter songs based on search query and filter
  const filteredSongs = songs.filter(song => {
    // First filter by tag
    if (songFilter !== 'all' && !song.tags.includes(songFilter)) return false;
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(query) ||
        song.author.toLowerCase().includes(query) ||
        song.key.toLowerCase().includes(query) ||
        song.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Music Ministry</h1>
          <p className="text-muted-foreground">
            Manage worship teams, song libraries, and service planning.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Worship Set
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="songs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="songs">Song Library</TabsTrigger>
          <TabsTrigger value="team">Worship Team</TabsTrigger>
          <TabsTrigger value="rehearsals">Rehearsals</TabsTrigger>
          <TabsTrigger value="planning">Service Planning</TabsTrigger>
        </TabsList>
        
        <TabsContent value="songs">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search songs..." 
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSongFilter('all')}>
                    All Songs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSongFilter('hymn')}>
                    Hymns
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSongFilter('contemporary')}>
                    Contemporary
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Song
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Key</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Resources</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSongs.map(song => (
                    <TableRow key={song.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{song.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {song.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{song.key}</TableCell>
                      <TableCell>{song.author}</TableCell>
                      <TableCell>{new Date(song.lastUsed).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {song.hasLyrics && (
                            <Badge variant="outline" className="bg-blue-50">Lyrics</Badge>
                          )}
                          {song.hasChords && (
                            <Badge variant="outline" className="bg-green-50">Chords</Badge>
                          )}
                          {song.hasSheet && (
                            <Badge variant="outline" className="bg-purple-50">Sheet</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end space-x-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <Card key={member.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{member.name}</CardTitle>
                        <CardDescription>{member.role}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getInstrumentIcon(member.instrument)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Music className="h-3 w-3 mr-2" />
                      <span>{member.instrument}</span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Availability</p>
                      <div className="flex flex-wrap gap-1">
                        {member.availability.map((day, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex space-x-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1">
                      Contact
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Schedule
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Member</DropdownMenuItem>
                        <DropdownMenuItem>View Schedule</DropdownMenuItem>
                        <DropdownMenuItem>Manage Roles</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardFooter>
              </Card>
            ))}
            
            <Card className="flex flex-col items-center justify-center h-full">
              <CardContent className="pt-6 text-center">
                <div className="rounded-full bg-muted/50 p-3 mb-4 inline-block">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="font-medium mb-2">Add Team Member</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a new member to your worship team
                </p>
                <Button>Add Member</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="rehearsals">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Rehearsal Schedule</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Rehearsal
            </Button>
          </div>
          
          <div className="space-y-4">
            {rehearsals.map(rehearsal => (
              <Card key={rehearsal.id}>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium">Worship Team Rehearsal</h3>
                        <Badge variant={rehearsal.status === 'upcoming' ? 'default' : 'secondary'}>
                          {rehearsal.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(rehearsal.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{rehearsal.time}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{rehearsal.attendees} attendees</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Songs</p>
                        <div className="flex flex-wrap gap-1">
                          {rehearsal.songs.map((song, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {song}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 mt-4 md:mt-0">
                      {rehearsal.status === 'upcoming' ? (
                        <>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button size="sm">
                            Manage Attendance
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="planning">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Worship Sets</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Worship Set
            </Button>
          </div>
          
          <div className="space-y-4">
            {worshipSets.map(set => (
              <Card key={set.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle>{set.service} - {new Date(set.date).toLocaleDateString()}</CardTitle>
                      <CardDescription>Theme: {set.theme}</CardDescription>
                    </div>
                    <Badge variant={set.status === 'upcoming' ? 'default' : 'secondary'}>
                      {set.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">Worship Leader: {set.leader}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Songs</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Key</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {set.songs.map((song, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{song.title}</TableCell>
                              <TableCell>{song.key}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-end space-x-2 w-full">
                    {set.status === 'upcoming' ? (
                      <>
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm">
                          <Music className="h-4 w-4 mr-1" />
                          Prepare Slides
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}