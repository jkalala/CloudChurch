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
  Calendar,
  MapPin,
  User,
  Building,
  Tag,
  Clock,
  Star,
  MessageSquare,
  FileText
} from 'lucide-react';
import { ModernLayout } from '@/components/ui/navigation';
import { Badge } from '@/components/ui/badge';

// Sample contact data
const contacts = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.s@example.com',
    phone: '(555) 123-4567',
    address: '123 Main St, Anytown, CA',
    status: 'lead',
    source: 'Website',
    lastContact: '2025-07-10',
    nextFollowUp: '2025-07-20',
    notes: 'Interested in volunteering',
    organization: 'ABC Company',
    tags: ['Volunteer', 'First-time visitor'],
    avatar: '/placeholder-user.jpg'
  },
  {
    id: '2',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    phone: '(555) 234-5678',
    address: '456 Oak Ave, Anytown, CA',
    status: 'contacted',
    source: 'Event',
    lastContact: '2025-07-05',
    nextFollowUp: '2025-07-15',
    notes: 'Attended summer event, has two children',
    organization: 'Local School',
    tags: ['Parent', 'Event attendee'],
    avatar: ''
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.j@example.com',
    phone: '(555) 345-6789',
    address: '789 Pine St, Anytown, CA',
    status: 'qualified',
    source: 'Referral',
    lastContact: '2025-07-12',
    nextFollowUp: '2025-07-22',
    notes: 'Referred by church member, interested in joining',
    organization: 'XYZ Corporation',
    tags: ['Referral', 'Potential member'],
    avatar: '/placeholder-user.jpg'
  }
];

export default function OutreachCRMPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lead' | 'contacted' | 'qualified' | 'converted'>('all');
  
  // Filter contacts based on search query and status filter
  const filteredContacts = contacts.filter(contact => {
    // First filter by status
    if (statusFilter !== 'all' && contact.status !== statusFilter) return false;
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.phone.toLowerCase().includes(query) ||
        contact.organization.toLowerCase().includes(query) ||
        contact.notes.toLowerCase().includes(query)
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
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Outreach CRM content
  const outreachContent = (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outreach CRM</h1>
          <p className="text-muted-foreground">
            Manage your outreach contacts and follow-ups.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Contact
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search contacts..." 
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
                All Contacts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('lead')}>
                Leads
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('contacted')}>
                Contacted
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('qualified')}>
                Qualified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('converted')}>
                Converted
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
              <DropdownMenuItem>Website</DropdownMenuItem>
              <DropdownMenuItem>Event</DropdownMenuItem>
              <DropdownMenuItem>Referral</DropdownMenuItem>
              <DropdownMenuItem>Social Media</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="tasks">Follow-ups</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contacts">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Follow-up</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map(contact => (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Mail className="h-3 w-3 mr-1" />
                              <span>{contact.email}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{contact.organization}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(contact.status)}`}>
                          {contact.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1 text-muted-foreground" />
                          <span>{new Date(contact.nextFollowUp).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contact.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
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
                            <DropdownMenuItem>Edit Contact</DropdownMenuItem>
                            <DropdownMenuItem>Add Follow-up</DropdownMenuItem>
                            <DropdownMenuItem>Send Email</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete Contact</DropdownMenuItem>
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
                Showing {filteredContacts.length} of {contacts.length} contacts
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Follow-up Tasks</CardTitle>
              <CardDescription>
                Manage your follow-up tasks and reminders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    contact: 'John Smith', 
                    task: 'Send welcome email', 
                    dueDate: '2025-07-20', 
                    priority: 'high',
                    status: 'pending'
                  },
                  { 
                    contact: 'Maria Garcia', 
                    task: 'Call to discuss children\'s program', 
                    dueDate: '2025-07-15', 
                    priority: 'medium',
                    status: 'pending'
                  },
                  { 
                    contact: 'Robert Johnson', 
                    task: 'Schedule in-person meeting', 
                    dueDate: '2025-07-22', 
                    priority: 'low',
                    status: 'completed'
                  }
                ].map((task, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="font-medium">{task.task}</h3>
                      <p className="text-sm text-muted-foreground">Contact: {task.contact}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {task.status === 'pending' ? (
                        <Button variant="outline" size="sm">
                          Complete
                        </Button>
                      ) : (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add New Task
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Outreach Campaigns</CardTitle>
              <CardDescription>
                Manage your outreach campaigns and events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { 
                    name: 'Summer Community Event', 
                    status: 'active', 
                    startDate: '2025-07-15', 
                    endDate: '2025-08-15',
                    contacts: 45,
                    responses: 12
                  },
                  { 
                    name: 'Back to School Drive', 
                    status: 'planned', 
                    startDate: '2025-08-01', 
                    endDate: '2025-08-31',
                    contacts: 120,
                    responses: 0
                  },
                  { 
                    name: 'Easter Invitation', 
                    status: 'completed', 
                    startDate: '2025-04-01', 
                    endDate: '2025-04-15',
                    contacts: 200,
                    responses: 35
                  }
                ].map((campaign, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle className="text-base">{campaign.name}</CardTitle>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                          campaign.status === 'planned' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                      <CardDescription>
                        {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Contacts</p>
                          <p className="text-xl font-bold">{campaign.contacts}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Responses</p>
                          <p className="text-xl font-bold">{campaign.responses}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Campaign
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create New Campaign
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Sources</CardTitle>
                <CardDescription>
                  Where your contacts are coming from.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Chart visualization would appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rate</CardTitle>
                <CardDescription>
                  Lead to member conversion rate over time.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Chart visualization would appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Outreach Performance</CardTitle>
                <CardDescription>
                  Performance metrics for your outreach efforts.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border rounded-md p-4">
                    <p className="text-sm text-muted-foreground">Total Contacts</p>
                    <p className="text-2xl font-bold">248</p>
                    <p className="text-xs text-green-600">↑ 12% from last month</p>
                  </div>
                  <div className="border rounded-md p-4">
                    <p className="text-sm text-muted-foreground">New Leads</p>
                    <p className="text-2xl font-bold">45</p>
                    <p className="text-xs text-green-600">↑ 5% from last month</p>
                  </div>
                  <div className="border rounded-md p-4">
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">18%</p>
                    <p className="text-xs text-red-600">↓ 2% from last month</p>
                  </div>
                  <div className="border rounded-md p-4">
                    <p className="text-sm text-muted-foreground">Follow-up Rate</p>
                    <p className="text-2xl font-bold">85%</p>
                    <p className="text-xs text-green-600">↑ 7% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <ModernLayout>
      {outreachContent}
    </ModernLayout>
  );
}