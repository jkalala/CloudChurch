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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal,
  Heart,
  Calendar,
  Clock,
  CheckCircle,
  User,
  MessageSquare,
  Phone
} from 'lucide-react';

// Sample prayer request data
const prayerRequests = [
  {
    id: '1',
    content: 'Please pray for my mother who is in the hospital.',
    author: {
      name: 'Sarah Johnson',
      avatar: '/placeholder-user.jpg'
    },
    date: '2025-07-18',
    prayerCount: 12,
    status: 'active',
    isPrivate: false,
    updates: [
      { date: '2025-07-19', content: 'Mom is doing better today. Thank you for your prayers.' }
    ]
  },
  {
    id: '2',
    content: 'Praying for our youth camp next week.',
    author: {
      name: 'Michael Chen',
      avatar: ''
    },
    date: '2025-07-17',
    prayerCount: 8,
    status: 'active',
    isPrivate: false,
    updates: []
  },
  {
    id: '3',
    content: 'Thankful for successful surgery! God is good.',
    author: {
      name: 'Emily Rodriguez',
      avatar: '/placeholder-user.jpg'
    },
    date: '2025-07-15',
    prayerCount: 15,
    status: 'answered',
    isPrivate: false,
    updates: [
      { date: '2025-07-16', content: 'Surgery went well, now in recovery.' },
      { date: '2025-07-17', content: 'Coming home today!' }
    ]
  }
];

// Sample pastoral care needs
const pastoralCareNeeds = [
  {
    id: '1',
    member: {
      name: 'David Kim',
      avatar: ''
    },
    type: 'hospital',
    description: 'In hospital for knee surgery',
    status: 'active',
    assignedTo: 'Pastor Johnson',
    date: '2025-07-16',
    followUpDate: '2025-07-21'
  },
  {
    id: '2',
    member: {
      name: 'Lisa Thompson',
      avatar: ''
    },
    type: 'bereavement',
    description: 'Loss of grandmother',
    status: 'active',
    assignedTo: 'Pastor Wilson',
    date: '2025-07-15',
    followUpDate: '2025-07-22'
  },
  {
    id: '3',
    member: {
      name: 'Robert Martinez',
      avatar: '/placeholder-user.jpg'
    },
    type: 'counseling',
    description: 'Marriage counseling',
    status: 'completed',
    assignedTo: 'Pastor Johnson',
    date: '2025-07-10',
    followUpDate: '2025-07-17'
  }
];

export default function PastoralCarePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'answered' | 'completed'>('all');
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Get status badge class
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'answered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get care type badge class
  const getCareTypeBadge = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-red-100 text-red-800';
      case 'bereavement': return 'bg-purple-100 text-purple-800';
      case 'counseling': return 'bg-yellow-100 text-yellow-800';
      case 'homebound': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pastoral Care</h1>
          <p className="text-muted-foreground">
            Member care, prayer requests, and pastoral support.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Care Need
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="prayer-requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="prayer-requests">Prayer Requests</TabsTrigger>
          <TabsTrigger value="care-needs">Care Needs</TabsTrigger>
          <TabsTrigger value="follow-ups">Follow-ups</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="prayer-requests">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search prayer requests..." 
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
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    All Requests
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    Active Requests
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('answered')}>
                    Answered Prayers
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Request
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {prayerRequests
              .filter(request => statusFilter === 'all' || request.status === statusFilter)
              .map(request => (
                <Card key={request.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={request.author.avatar} />
                          <AvatarFallback>{getInitials(request.author.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{request.author.name}</CardTitle>
                          <CardDescription>
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{new Date(request.date).toLocaleDateString()}</span>
                            </div>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={request.status === 'answered' ? 'default' : 'outline'}>
                          {request.status === 'answered' ? 'Answered' : 'Active'}
                        </Badge>
                        {request.isPrivate && (
                          <Badge variant="outline">Private</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm">{request.content}</p>
                    
                    {request.updates.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium">Updates</h4>
                        {request.updates.map((update, index) => (
                          <div key={index} className="bg-muted/30 p-2 rounded-md">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>{new Date(update.date).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm mt-1">{update.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex justify-between w-full">
                      <div className="flex items-center">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Heart className="h-3 w-3 mr-1" />
                          Praying ({request.prayerCount})
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Add Update
                        </Button>
                        {request.status === 'active' && (
                          <Button size="sm">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Answered
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="care-needs">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search care needs..." 
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
                  <DropdownMenuItem>Hospital Visits</DropdownMenuItem>
                  <DropdownMenuItem>Bereavement</DropdownMenuItem>
                  <DropdownMenuItem>Counseling</DropdownMenuItem>
                  <DropdownMenuItem>Homebound</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Care Need
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            {pastoralCareNeeds.map(need => (
              <Card key={need.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={need.member.avatar} />
                        <AvatarFallback>{getInitials(need.member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{need.member.name}</CardTitle>
                        <CardDescription>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCareTypeBadge(need.type)}`}>
                            {need.type}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={need.status === 'completed' ? 'default' : 'outline'}>
                        {need.status === 'completed' ? 'Completed' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm">{need.description}</p>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Assigned To</p>
                      <p className="font-medium">{need.assignedTo}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Follow-up Date</p>
                      <p className="font-medium">{new Date(need.followUpDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="flex justify-end space-x-2 w-full">
                    <Button variant="outline" size="sm">
                      <Phone className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Add Note
                    </Button>
                    {need.status === 'active' && (
                      <Button size="sm">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="follow-ups">
          <Card>
            <CardHeader>
              <CardTitle>Follow-ups</CardTitle>
              <CardDescription>
                Upcoming and overdue follow-ups for pastoral care.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="font-medium">Today's Follow-ups</h3>
                <div className="space-y-2">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>RM</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Robert Martinez</p>
                          <p className="text-sm text-muted-foreground">Marriage counseling follow-up</p>
                        </div>
                      </div>
                      <Badge>Today</Badge>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button size="sm">Complete</Button>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-medium">Upcoming Follow-ups</h3>
                <div className="space-y-2">
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>DK</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">David Kim</p>
                          <p className="text-sm text-muted-foreground">Hospital visit follow-up</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="text-sm">July 21, 2025</span>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>LT</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Lisa Thompson</p>
                          <p className="text-sm text-muted-foreground">Bereavement follow-up</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span className="text-sm">July 22, 2025</span>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <Button variant="outline" size="sm">Reschedule</Button>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Pastoral Care Reports</CardTitle>
              <CardDescription>
                Analytics and reports for pastoral care activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Prayer Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">24</div>
                    <p className="text-sm text-muted-foreground">Active requests</p>
                    <div className="text-3xl font-bold mt-2">18</div>
                    <p className="text-sm text-muted-foreground">Answered this month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Care Needs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">12</div>
                    <p className="text-sm text-muted-foreground">Active care needs</p>
                    <div className="text-3xl font-bold mt-2">8</div>
                    <p className="text-sm text-muted-foreground">Completed this month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Follow-ups</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">5</div>
                    <p className="text-sm text-muted-foreground">Scheduled this week</p>
                    <div className="text-3xl font-bold mt-2">2</div>
                    <p className="text-sm text-muted-foreground">Overdue</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-4">Care Type Distribution</h3>
                <div className="h-64 bg-muted/30 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">Chart visualization would go here</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Generate Detailed Report
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}