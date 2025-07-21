"use client";

import { useState } from 'react';
import { WidgetBase } from '../widget-base';
import { WidgetSize } from '@/lib/types/dashboard-widget';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../dialog';
import { Button } from '../../button';
import { useDashboard } from '@/lib/contexts/dashboard-context';
import { Input } from '../../input';
import { Avatar, AvatarFallback, AvatarImage } from '../../avatar';
import { Search, ChevronRight, Phone, Mail, UserPlus } from 'lucide-react';

interface MembersWidgetProps {
  id: string;
  size: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'new';
}

export function MembersWidget({ id, size }: MembersWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { updateWidgetSettings } = useDashboard();
  const [viewMode, setViewMode] = useState<'recent' | 'active' | 'new'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample members for demonstration
  const members: Member[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '(555) 123-4567',
      role: 'Worship Leader',
      avatar: '/placeholder-user.jpg',
      status: 'active'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.c@example.com',
      phone: '(555) 234-5678',
      role: 'Youth Pastor',
      status: 'active'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      phone: '(555) 345-6789',
      role: 'Sunday School Teacher',
      avatar: '/placeholder-user.jpg',
      status: 'new'
    },
    {
      id: '4',
      name: 'David Kim',
      email: 'david.k@example.com',
      phone: '(555) 456-7890',
      role: 'Elder',
      status: 'active'
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      email: 'lisa.t@example.com',
      phone: '(555) 567-8901',
      role: 'Volunteer',
      status: 'new'
    }
  ];

  const handleSaveSettings = () => {
    updateWidgetSettings(id, { viewMode });
    setShowSettings(false);
  };

  // Filter members based on view mode and search query
  const filteredMembers = members.filter(member => {
    // First filter by view mode
    if (viewMode === 'active' && member.status !== 'active') return false;
    if (viewMode === 'new' && member.status !== 'new') return false;
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.role.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Sort members by name
  const sortedMembers = [...filteredMembers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <WidgetBase 
        id={id} 
        title="Church Members" 
        size={size as WidgetSize}
        hasSettings={true}
        onSettingsClick={() => setShowSettings(true)}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search members..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant={viewMode === 'recent' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('recent')}
            >
              Recent
            </Button>
            <Button 
              variant={viewMode === 'active' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('active')}
            >
              Active
            </Button>
            <Button 
              variant={viewMode === 'new' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('new')}
            >
              New
            </Button>
          </div>
          
          <div className="space-y-2">
            {sortedMembers.length > 0 ? (
              sortedMembers.map(member => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No members found</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" size="sm" className="text-xs">
              <UserPlus className="h-3 w-3 mr-1" /> Add Member
            </Button>
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </WidgetBase>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Members Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default View</label>
              <div className="flex space-x-2">
                <Button 
                  variant={viewMode === 'recent' ? 'default' : 'outline'}
                  onClick={() => setViewMode('recent')}
                >
                  Recent
                </Button>
                <Button 
                  variant={viewMode === 'active' ? 'default' : 'outline'}
                  onClick={() => setViewMode('active')}
                >
                  Active
                </Button>
                <Button 
                  variant={viewMode === 'new' ? 'default' : 'outline'}
                  onClick={() => setViewMode('new')}
                >
                  New
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}