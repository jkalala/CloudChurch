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
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  MoreHorizontal,
  UserPlus,
  Users,
  UserCheck,
  Calendar,
  MapPin
} from 'lucide-react';

// Sample member data
const members = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, CA',
    status: 'active',
    joinDate: '2020-05-15',
    lastAttendance: '2025-07-14',
    department: 'Worship',
    role: 'Worship Leader',
    avatar: '/placeholder-user.jpg'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Anytown, CA',
    status: 'active',
    joinDate: '2019-10-22',
    lastAttendance: '2025-07-14',
    department: 'Youth',
    role: 'Youth Pastor',
    avatar: ''
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    phone: '(555) 345-6789',
    address: '789 Pine St, Anytown, CA',
    status: 'new',
    joinDate: '2025-06-30',
    lastAttendance: '2025-07-14',
    department: 'Children',
    role: 'Sunday School Teacher',
    avatar: '/placeholder-user.jpg'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.k@example.com',
    phone: '(555) 456-7890',
    address: '101 Elm St, Anytown, CA',
    status: 'active',
    joinDate: '2018-03-12',
    lastAttendance: '2025-07-07',
    department: 'Administration',
    role: 'Elder',
    avatar: ''
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.t@example.com',
    phone: '(555) 567-8901',
    address: '202 Cedar Rd, Anytown, CA',
    status: 'inactive',
    joinDate: '2021-01-05',
    lastAttendance: '2025-05-12',
    department: 'Outreach',
    role: 'Volunteer',
    avatar: ''
  }
];

export default function DesktopMembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'new'>('all');
  
  // Filter members based on search query and status filter
  const filteredMembers = members.filter(member => {
    // First filter by status
    if (statusFilter !== 'all' && member.status !== statusFilter) return false;
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.phone.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Management</h1>
          <p className="text-muted-foreground">
            Manage your church members, profiles, and attendance.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search members..." 
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
                All Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                Active Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                Inactive Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('new')}>
                New Members
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
              <DropdownMenuItem>Worship</DropdownMenuItem>
              <DropdownMenuItem>Youth</DropdownMenuItem>
              <DropdownMenuItem>Children</DropdownMenuItem>
              <DropdownMenuItem>Administration</DropdownMenuItem>
              <DropdownMenuItem>Outreach</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="border rounded-md p-1">
            <Button 
              variant={viewMode === 'table' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('table')}
            >
              <Users className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('grid')}
            >
              <UserCheck className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode('list')}
            >
              <UserPlus className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all-members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-members">All Members</TabsTrigger>
          <TabsTrigger value="new-members">New Members</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-members">
          {viewMode === 'table' && (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Attendance</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map(member => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{member.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{member.department}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(member.status)}`}>
                            {member.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{new Date(member.lastAttendance).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit Member</DropdownMenuItem>
                              <DropdownMenuItem>Send Message</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">Delete Member</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                  Showing {filteredMembers.length} of {members.length} members
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </CardFooter>
            </Card>
          )}
          
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map(member => (
                <Card key={member.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{member.name}</CardTitle>
                          <CardDescription>{member.role}</CardDescription>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full h-fit ${getStatusBadge(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-2" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-2" />
                        <span className="truncate">{member.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2" />
                        <span>Last attended: {new Date(member.lastAttendance).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex space-x-2 w-full">
                      <Button variant="outline" size="sm" className="flex-1">
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Message
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Member</DropdownMenuItem>
                          <DropdownMenuItem>View Attendance</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete Member</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {viewMode === 'list' && (
            <div className="space-y-2">
              {filteredMembers.map(member => (
                <Card key={member.id}>
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <span className="mr-2">{member.role}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(member.status)}`}>
                            {member.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="new-members">
          <Card>
            <CardHeader>
              <CardTitle>New Members</CardTitle>
              <CardDescription>
                Members who have joined in the last 30 days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members
                  .filter(member => member.status === 'new')
                  .map(member => (
                    <div key={member.id} className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">Joined on {new Date(member.joinDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Send Welcome
                        </Button>
                        <Button size="sm">
                          Assign to Group
                        </Button>
                      </div>
                    </div>
                  ))
                }
                
                {members.filter(member => member.status === 'new').length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No new members in the last 30 days.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Tracking</CardTitle>
              <CardDescription>
                Track and manage member attendance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Recent Services</h3>
                  <Button variant="outline" size="sm">
                    Record Attendance
                  </Button>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>New Visitors</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>July 14, 2025</TableCell>
                      <TableCell>Sunday Morning</TableCell>
                      <TableCell>145</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>July 7, 2025</TableCell>
                      <TableCell>Sunday Morning</TableCell>
                      <TableCell>138</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>June 30, 2025</TableCell>
                      <TableCell>Sunday Morning</TableCell>
                      <TableCell>142</TableCell>
                      <TableCell>2</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle>Member Groups</CardTitle>
              <CardDescription>
                Organize members into groups and departments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Church Groups</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Create Group
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Worship Team</CardTitle>
                      <CardDescription>15 members</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Musicians, vocalists, and audio/visual team members.
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Group
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Youth Ministry</CardTitle>
                      <CardDescription>28 members</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Youth leaders and teenage church members.
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Group
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Children's Ministry</CardTitle>
                      <CardDescription>12 members</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">
                        Sunday school teachers and children's program volunteers.
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Group
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}