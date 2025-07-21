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
  MapPin,
  User
} from 'lucide-react';
import { ModernLayout } from '@/components/ui/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

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
  }
];

export default function ModernMembersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'new'>('all');
  const isMobile = useIsMobile();
  
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

  // Members content
  const membersContent = (
    <div className="space-y-6">
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
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => (
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
                    <Button variant="outline" size="sm">View Profile</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <ModernLayout>
      {membersContent}
    </ModernLayout>
  );
}