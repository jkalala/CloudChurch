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
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Heart, 
  MessageCircle, 
  PlusCircle,
  ChevronRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Textarea } from '../../textarea';
import { Input } from '../../input';
import { Avatar, AvatarFallback, AvatarImage } from '../../avatar';

interface PrayerWidgetProps {
  id: string;
  size: string;
}

interface PrayerRequest {
  id: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  date: Date;
  prayerCount: number;
  status: 'active' | 'answered';
  isPrivate: boolean;
}

export function PrayerWidget({ id, size }: PrayerWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { updateWidgetSettings } = useDashboard();
  const [filter, setFilter] = useState<'all' | 'active' | 'answered'>('all');
  const [newRequest, setNewRequest] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Sample prayer requests for demonstration
  const prayerRequests: PrayerRequest[] = [
    {
      id: '1',
      content: 'Please pray for my mother who is in the hospital.',
      author: {
        name: 'Sarah Johnson',
        avatar: '/placeholder-user.jpg'
      },
      date: new Date(2025, 6, 18), // July 18, 2025
      prayerCount: 12,
      status: 'active',
      isPrivate: false
    },
    {
      id: '2',
      content: 'Praying for our youth camp next week.',
      author: {
        name: 'Michael Chen'
      },
      date: new Date(2025, 6, 17), // July 17, 2025
      prayerCount: 8,
      status: 'active',
      isPrivate: false
    },
    {
      id: '3',
      content: 'Thankful for successful surgery! God is good.',
      author: {
        name: 'Emily Rodriguez',
        avatar: '/placeholder-user.jpg'
      },
      date: new Date(2025, 6, 15), // July 15, 2025
      prayerCount: 15,
      status: 'answered',
      isPrivate: false
    },
    {
      id: '4',
      content: 'Praying for guidance in my career decision.',
      author: {
        name: 'David Kim'
      },
      date: new Date(2025, 6, 16), // July 16, 2025
      prayerCount: 5,
      status: 'active',
      isPrivate: true
    }
  ];

  const handleSaveSettings = () => {
    updateWidgetSettings(id, { filter });
    setShowSettings(false);
  };

  const handleAddRequest = () => {
    if (newRequest.trim()) {
      // In a real app, this would save to the database
      console.log('New prayer request:', {
        content: newRequest,
        isPrivate
      });
      
      // Reset form
      setNewRequest('');
      setIsPrivate(false);
      setShowAddForm(false);
    }
  };

  const handlePray = (requestId: string) => {
    // In a real app, this would update the prayer count in the database
    console.log('Prayed for request:', requestId);
  };

  // Filter prayer requests based on filter
  const filteredRequests = prayerRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  // Sort prayer requests by date (newest first)
  const sortedRequests = [...filteredRequests].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
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
        title="Prayer Requests" 
        size={size as WidgetSize}
        hasSettings={true}
        onSettingsClick={() => setShowSettings(true)}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button 
                variant={filter === 'active' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('active')}
              >
                Active
              </Button>
              <Button 
                variant={filter === 'answered' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('answered')}
              >
                Answered
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          
          {showAddForm && (
            <div className="space-y-3 p-3 border rounded-md">
              <Textarea 
                placeholder="Share your prayer request..." 
                value={newRequest}
                onChange={(e) => setNewRequest(e.target.value)}
                className="min-h-[80px]"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span>Private request</span>
                </label>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleAddRequest}
                    disabled={!newRequest.trim()}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            {sortedRequests.length > 0 ? (
              sortedRequests.map(request => (
                <div 
                  key={request.id} 
                  className={`p-3 rounded-md ${
                    request.status === 'answered' ? 'bg-green-50/50' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={request.author.avatar} />
                        <AvatarFallback className="text-xs">
                          {getInitials(request.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{request.author.name}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDistanceToNow(request.date, { addSuffix: true })}</span>
                    </div>
                  </div>
                  <p className="text-sm mt-2">{request.content}</p>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs flex items-center"
                        onClick={() => handlePray(request.id)}
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Pray ({request.prayerCount})
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 text-xs flex items-center"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Comment
                      </Button>
                    </div>
                    {request.status === 'answered' && (
                      <div className="flex items-center text-xs text-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Answered
                      </div>
                    )}
                    {request.isPrivate && (
                      <div className="text-xs text-muted-foreground">
                        Private
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No prayer requests to display</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" className="text-xs">
              View All <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </WidgetBase>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prayer Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Filter</label>
              <div className="flex space-x-2">
                <Button 
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={filter === 'active' ? 'default' : 'outline'}
                  onClick={() => setFilter('active')}
                >
                  Active
                </Button>
                <Button 
                  variant={filter === 'answered' ? 'default' : 'outline'}
                  onClick={() => setFilter('answered')}
                >
                  Answered
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