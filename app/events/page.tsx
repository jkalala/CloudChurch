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
import { Calendar } from '@/components/ui/calendar';
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
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  MoreHorizontal,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Tag
} from 'lucide-react';
import { format, addDays, isSameMonth, isSameDay, parseISO } from 'date-fns';

// Sample event data
const events = [
  {
    id: '1',
    title: 'Sunday Morning Service',
    description: 'Regular Sunday worship service',
    date: '2025-07-21',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: 'Main Sanctuary',
    type: 'service',
    attendees: 150,
    recurring: true,
    organizer: 'Pastor Johnson'
  },
  {
    id: '2',
    title: 'Youth Group Meeting',
    description: 'Weekly youth group gathering with games and Bible study',
    date: '2025-07-23',
    startTime: '6:30 PM',
    endTime: '8:30 PM',
    location: 'Youth Room',
    type: 'youth',
    attendees: 25,
    recurring: true,
    organizer: 'Michael Chen'
  },
  {
    id: '3',
    title: 'Church Picnic',
    description: 'Annual church picnic at Central Park',
    date: '2025-07-26',
    startTime: '11:00 AM',
    endTime: '3:00 PM',
    location: 'Central Park',
    type: 'social',
    attendees: 75,
    recurring: false,
    organizer: 'Events Committee'
  },
  {
    id: '4',
    title: 'Bible Study',
    description: 'Weekly Bible study on the Book of Romans',
    date: '2025-07-22',
    startTime: '7:00 PM',
    endTime: '8:30 PM',
    location: 'Fellowship Hall',
    type: 'study',
    attendees: 30,
    recurring: true,
    organizer: 'Pastor Johnson'
  },
  {
    id: '5',
    title: 'Worship Team Practice',
    description: 'Rehearsal for Sunday service',
    date: '2025-07-19',
    startTime: '6:00 PM',
    endTime: '8:00 PM',
    location: 'Main Sanctuary',
    type: 'rehearsal',
    attendees: 12,
    recurring: true,
    organizer: 'Sarah Johnson'
  }
];

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [typeFilter, setTypeFilter] = useState<'all' | 'service' | 'youth' | 'social' | 'study' | 'rehearsal'>('all');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Filter events based on search query and type filter
  const filteredEvents = events.filter(event => {
    // First filter by type
    if (typeFilter !== 'all' && event.type !== typeFilter) return false;
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.organizer.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Get events for selected date in calendar view
  const eventsOnSelectedDate = events.filter(event => {
    const eventDate = parseISO(event.date);
    return isSameDay(eventDate, selectedDate);
  });
  
  // Get event type badge class
  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'service': return 'bg-blue-100 text-blue-800';
      case 'youth': return 'bg-green-100 text-green-800';
      case 'social': return 'bg-yellow-100 text-yellow-800';
      case 'study': return 'bg-purple-100 text-purple-800';
      case 'rehearsal': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Function to highlight dates with events on the calendar
  const isDayWithEvent = (day: Date) => {
    return events.some(event => {
      const eventDate = parseISO(event.date);
      return isSameDay(eventDate, day);
    });
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Management</h1>
          <p className="text-muted-foreground">
            Create and manage church events and activities.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search events..." 
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
              <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                All Events
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('service')}>
                Services
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('youth')}>
                Youth Events
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('social')}>
                Social Events
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('study')}>
                Bible Studies
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('rehearsal')}>
                Rehearsals
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="border rounded-md p-1">
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredEvents
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(event => (
                  <Card key={event.id}>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium">{event.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeBadge(event.type)}`}>
                              {event.type}
                            </span>
                            {event.recurring && (
                              <Badge variant="outline">Recurring</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span>{format(parseISO(event.date), 'MMMM d, yyyy')}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{event.startTime} - {event.endTime}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{event.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{event.attendees} attendees</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2 mt-4 md:mt-0">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button size="sm">
                            Manage
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Duplicate Event</DropdownMenuItem>
                              <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                              <DropdownMenuItem>View Attendees</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Cancel Event</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
              {filteredEvents.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No events found matching your criteria.</p>
                </div>
              )}
            </div>
          )}
          
          {viewMode === 'calendar' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border"
                    modifiers={{
                      hasEvent: (date) => isDayWithEvent(date)
                    }}
                    modifiersStyles={{
                      hasEvent: { 
                        fontWeight: 'bold',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '0.25rem'
                      }
                    }}
                  />
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Events on {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {eventsOnSelectedDate.length > 0 ? (
                    <div className="space-y-4">
                      {eventsOnSelectedDate.map(event => (
                        <div key={event.id} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{event.title}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeBadge(event.type)}`}>
                                  {event.type}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              <div className="flex flex-wrap gap-4 text-sm mt-2">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  <span>{event.startTime} - {event.endTime}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  <span>{event.location}</span>
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  <span>{event.attendees} attendees</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Manage
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No events scheduled for this date.</p>
                      <Button variant="outline" className="mt-4">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Event
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="past">
          <Card>
            <CardHeader>
              <CardTitle>Past Events</CardTitle>
              <CardDescription>
                View and analyze past church events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Sunday Morning Service</p>
                        <p className="text-sm text-muted-foreground">Main Sanctuary</p>
                      </div>
                    </TableCell>
                    <TableCell>July 14, 2025</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                        service
                      </span>
                    </TableCell>
                    <TableCell>145</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Report</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Bible Study</p>
                        <p className="text-sm text-muted-foreground">Fellowship Hall</p>
                      </div>
                    </TableCell>
                    <TableCell>July 15, 2025</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                        study
                      </span>
                    </TableCell>
                    <TableCell>28</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Report</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Youth Group Meeting</p>
                        <p className="text-sm text-muted-foreground">Youth Room</p>
                      </div>
                    </TableCell>
                    <TableCell>July 16, 2025</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        youth
                      </span>
                    </TableCell>
                    <TableCell>22</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">View Report</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recurring">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Events</CardTitle>
              <CardDescription>
                Manage recurring events and schedules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events
                  .filter(event => event.recurring)
                  .map(event => (
                    <div key={event.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{event.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getEventTypeBadge(event.type)}`}>
                              {event.type}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm mt-2">
                            <div className="flex items-center">
                              <Tag className="h-4 w-4 mr-1" />
                              <span>Weekly</span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{event.startTime} - {event.endTime}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{event.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit Schedule
                          </Button>
                          <Button variant="ghost" size="sm">
                            View Instances
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registration">
          <Card>
            <CardHeader>
              <CardTitle>Event Registration</CardTitle>
              <CardDescription>
                Manage event registrations and RSVPs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Events with Registration</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Registration Form
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <div>
                          <p className="font-medium">Church Picnic</p>
                          <p className="text-sm text-muted-foreground">Central Park</p>
                        </div>
                      </TableCell>
                      <TableCell>July 26, 2025</TableCell>
                      <TableCell>45</TableCell>
                      <TableCell>100</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Open
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div>
                          <p className="font-medium">Youth Camp</p>
                          <p className="text-sm text-muted-foreground">Mountain Retreat Center</p>
                        </div>
                      </TableCell>
                      <TableCell>August 10-15, 2025</TableCell>
                      <TableCell>28</TableCell>
                      <TableCell>30</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                          Almost Full
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <div>
                          <p className="font-medium">Marriage Retreat</p>
                          <p className="text-sm text-muted-foreground">Lakeside Resort</p>
                        </div>
                      </TableCell>
                      <TableCell>September 5-7, 2025</TableCell>
                      <TableCell>15</TableCell>
                      <TableCell>20</TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Open
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">Manage</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}