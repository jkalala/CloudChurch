'use client';

import { useState } from 'react';
import { MobileOptimizedLayout } from '@/components/ui/mobile/mobile-optimized-layout';
import { TouchCard } from '@/components/ui/mobile/touch-card';
import { TouchButton } from '@/components/ui/mobile/touch-button';
import { MobileForm } from '@/components/ui/mobile/mobile-form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SwipeDirection } from '@/hooks/use-gesture-detection';
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
  MapPin,
  ChevronRight,
  Home,
  Bell,
  MessageSquare,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

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

export default function MobileMembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all-members');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'new'>('all');
  const [notifications, setNotifications] = useState<string[]>([]);
  
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

  // Add a notification message
  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
  };

  // Handle swipe on a card
  const handleSwipe = (direction: SwipeDirection) => {
    if (direction === 'left') {
      // Navigate to next tab
      if (activeTab === 'all-members') setActiveTab('new-members');
      else if (activeTab === 'new-members') setActiveTab('attendance');
      else if (activeTab === 'attendance') setActiveTab('groups');
    } else if (direction === 'right') {
      // Navigate to previous tab
      if (activeTab === 'groups') setActiveTab('attendance');
      else if (activeTab === 'attendance') setActiveTab('new-members');
      else if (activeTab === 'new-members') setActiveTab('all-members');
    }
    addNotification(`Swiped ${direction}`);
  };
  
  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Member Management</h3>
      
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('all-members')}>
          <Users className="mr-2 h-4 w-4" />
          All Members
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('new-members')}>
          <UserPlus className="mr-2 h-4 w-4" />
          New Members
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('attendance')}>
          <Calendar className="mr-2 h-4 w-4" />
          Attendance
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('groups')}>
          <UserCheck className="mr-2 h-4 w-4" />
          Groups
        </Button>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-2">Quick Filters</h4>
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => setStatusFilter('all')}
          >
            All Members
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => setStatusFilter('active')}
          >
            Active Members
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => setStatusFilter('inactive')}
          >
            Inactive Members
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="w-full justify-start text-sm"
            onClick={() => setStatusFilter('new')}
          >
            New Members
          </Button>
        </div>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-2">Recent Actions</h4>
        {notifications.length > 0 ? (
          <ul className="space-y-2">
            {notifications.map((notification, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {notification}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No recent actions</p>
        )}
      </div>
    </div>
  );

  // Header content
  const headerContent = (
    <div className="flex justify-between items-center w-full">
      <h1 className="text-xl font-bold">Members</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => addNotification('Notification clicked')}>
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addNotification('Add member clicked')}>
          <UserPlus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  // Footer content
  const footerContent = (
    <div className="flex justify-around items-center">
      <TouchButton variant="ghost" size="icon" asChild>
        <a href="/dashboard">
          <Home className="h-5 w-5" />
        </a>
      </TouchButton>
      <TouchButton variant="ghost" size="icon" onClick={() => addNotification('Calendar clicked')}>
        <Calendar className="h-5 w-5" />
      </TouchButton>
      <TouchButton variant="ghost" size="icon" onClick={() => addNotification('Messages clicked')}>
        <MessageSquare className="h-5 w-5" />
      </TouchButton>
      <TouchButton variant="ghost" size="icon" onClick={() => addNotification('Profile clicked')}>
        <User className="h-5 w-5" />
      </TouchButton>
    </div>
  );

  return (
    <MobileOptimizedLayout
      sidebar={sidebarContent}
      header={headerContent}
      footer={footerContent}
      className="min-h-screen"
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">
            Manage your church members, profiles, and attendance.
          </p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search members..." 
            className="pl-8 h-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <TouchButton variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </TouchButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
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
          
          <TouchButton variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </TouchButton>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all-members">All</TabsTrigger>
            <TabsTrigger value="new-members">New</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="groups">Groups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-members" className="space-y-4">
            {filteredMembers.map(member => (
              <TouchCard 
                key={member.id} 
                title={member.name}
                onSwipe={handleSwipe}
                onTap={() => addNotification(`Viewed ${member.name}'s profile`)}
                className="p-0"
              >
                <div className="px-4 pb-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                  
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
                      <Calendar className="h-3 w-3 mr-2" />
                      <span>Last attended: {new Date(member.lastAttendance).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <TouchButton variant="outline" size="sm" className="flex-1" onClick={() => addNotification(`Called ${member.name}`)}>
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </TouchButton>
                    <TouchButton variant="outline" size="sm" className="flex-1" onClick={() => addNotification(`Messaged ${member.name}`)}>
                      <Mail className="h-3 w-3 mr-1" />
                      Message
                    </TouchButton>
                    <TouchButton variant="outline" size="sm" className="flex-1" onClick={() => addNotification(`Viewed ${member.name}'s profile`)}>
                      <User className="h-3 w-3 mr-1" />
                      Profile
                    </TouchButton>
                  </div>
                </div>
              </TouchCard>
            ))}
            
            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No members found matching your criteria.</p>
                <TouchButton className="mt-4" onClick={() => setStatusFilter('all')}>
                  Reset Filters
                </TouchButton>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="new-members" className="space-y-4">
            <TouchCard title="New Members" onSwipe={handleSwipe}>
              <p className="text-sm text-muted-foreground mb-4">
                Members who have joined in the last 30 days.
              </p>
              
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
                    </div>
                  ))
                }
                
                {members.filter(member => member.status === 'new').length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No new members in the last 30 days.</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <TouchButton variant="outline" className="flex-1" onClick={() => addNotification('Sent welcome email')}>
                  Send Welcome
                </TouchButton>
                <TouchButton className="flex-1" onClick={() => addNotification('Assigned to group')}>
                  Assign to Group
                </TouchButton>
              </div>
            </TouchCard>
          </TabsContent>
          
          <TabsContent value="attendance" className="space-y-4">
            <TouchCard title="Attendance Tracking" onSwipe={handleSwipe}>
              <p className="text-sm text-muted-foreground mb-4">
                Track and manage member attendance.
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Recent Services</h3>
                </div>
                
                <div className="space-y-4">
                  {[
                    { date: 'July 14, 2025', service: 'Sunday Morning', attendance: 145, visitors: 3 },
                    { date: 'July 7, 2025', service: 'Sunday Morning', attendance: 138, visitors: 5 },
                    { date: 'June 30, 2025', service: 'Sunday Morning', attendance: 142, visitors: 2 }
                  ].map((service, index) => (
                    <TouchCard 
                      key={index} 
                      title={service.service}
                      onTap={() => addNotification(`Viewed ${service.date} attendance`)}
                      className="p-0"
                    >
                      <div className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground">{service.date}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div className="flex flex-col space-y-1">
                            <span className="text-2xl font-bold">{service.attendance}</span>
                            <span className="text-xs text-muted-foreground">Total Attendance</span>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <span className="text-2xl font-bold">{service.visitors}</span>
                            <span className="text-xs text-muted-foreground">New Visitors</span>
                          </div>
                        </div>
                      </div>
                    </TouchCard>
                  ))}
                </div>
              </div>
              
              <TouchButton className="w-full mt-4" onClick={() => addNotification('Recording attendance')}>
                Record Attendance
              </TouchButton>
            </TouchCard>
          </TabsContent>
          
          <TabsContent value="groups" className="space-y-4">
            <TouchCard title="Member Groups" onSwipe={handleSwipe}>
              <p className="text-sm text-muted-foreground mb-4">
                Organize members into groups and departments.
              </p>
              
              <div className="space-y-4">
                {[
                  { name: 'Worship Team', members: 15, description: 'Musicians, vocalists, and audio/visual team members.' },
                  { name: 'Youth Ministry', members: 28, description: 'Youth leaders and teenage church members.' },
                  { name: 'Children\'s Ministry', members: 12, description: 'Sunday school teachers and children\'s program volunteers.' }
                ].map((group, index) => (
                  <TouchCard 
                    key={index} 
                    title={group.name}
                    onTap={() => addNotification(`Viewed ${group.name} group`)}
                    className="p-0"
                  >
                    <div className="px-4 pb-4">
                      <p className="text-sm font-medium">{group.members} members</p>
                      <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                      
                      <TouchButton variant="outline" className="w-full mt-3" onClick={() => addNotification(`Viewed ${group.name} group`)}>
                        View Group
                      </TouchButton>
                    </div>
                  </TouchCard>
                ))}
              </div>
              
              <TouchButton className="w-full mt-4" onClick={() => addNotification('Creating new group')}>
                <Plus className="h-4 w-4 mr-1" />
                Create Group
              </TouchButton>
            </TouchCard>
          </TabsContent>
        </Tabs>
      </div>
    </MobileOptimizedLayout>
  );
}