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
  UserPlus, 
  Calendar, 
  MessageSquare, 
  FileText, 
  Settings,
  ChevronRight
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../avatar';

interface ActivityWidgetProps {
  id: string;
  size: string;
}

interface Activity {
  id: string;
  type: 'member' | 'event' | 'message' | 'resource' | 'system';
  title: string;
  description: string;
  date: Date;
  user?: {
    name: string;
    avatar?: string;
  };
}

export function ActivityWidget({ id, size }: ActivityWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { updateWidgetSettings } = useDashboard();
  const [activityType, setActivityType] = useState<'all' | 'member' | 'event' | 'message' | 'resource' | 'system'>('all');
  
  // Sample activities for demonstration
  const activities: Activity[] = [
    {
      id: '1',
      type: 'member',
      title: 'New Member Joined',
      description: 'Emily Rodriguez joined the church',
      date: new Date(2025, 6, 18, 14, 30), // July 18, 2025, 2:30 PM
      user: {
        name: 'Emily Rodriguez',
        avatar: '/placeholder-user.jpg'
      }
    },
    {
      id: '2',
      type: 'event',
      title: 'Event Created',
      description: 'Youth Camp 2025 event was created',
      date: new Date(2025, 6, 18, 10, 15), // July 18, 2025, 10:15 AM
      user: {
        name: 'Michael Chen'
      }
    },
    {
      id: '3',
      type: 'message',
      title: 'New Announcement',
      description: 'Special Guest Speaker announcement was posted',
      date: new Date(2025, 6, 17, 16, 45), // July 17, 2025, 4:45 PM
      user: {
        name: 'Pastor Johnson',
        avatar: '/placeholder-user.jpg'
      }
    },
    {
      id: '4',
      type: 'resource',
      title: 'Resource Uploaded',
      description: 'Sunday Sermon - Faith in Action was uploaded',
      date: new Date(2025, 6, 17, 9, 20), // July 17, 2025, 9:20 AM
      user: {
        name: 'Admin User'
      }
    },
    {
      id: '5',
      type: 'system',
      title: 'System Update',
      description: 'Church management system was updated to version 2.0',
      date: new Date(2025, 6, 16, 22, 0), // July 16, 2025, 10:00 PM
    }
  ];

  const handleSaveSettings = () => {
    updateWidgetSettings(id, { activityType });
    setShowSettings(false);
  };

  // Filter activities based on type
  const filteredActivities = activities.filter(activity => {
    if (activityType === 'all') return true;
    return activity.type === activityType;
  });

  // Sort activities by date (newest first)
  const sortedActivities = [...filteredActivities].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'member': return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'event': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case 'resource': return <FileText className="h-4 w-4 text-purple-500" />;
      case 'system': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

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
        title="Recent Activity" 
        size={size as WidgetSize}
        hasSettings={true}
        onSettingsClick={() => setShowSettings(true)}
      >
        <div className="space-y-4">
          <div className="flex space-x-2 overflow-x-auto pb-1">
            <Button 
              variant={activityType === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActivityType('all')}
            >
              All
            </Button>
            <Button 
              variant={activityType === 'member' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActivityType('member')}
            >
              Members
            </Button>
            <Button 
              variant={activityType === 'event' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActivityType('event')}
            >
              Events
            </Button>
            <Button 
              variant={activityType === 'message' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActivityType('message')}
            >
              Messages
            </Button>
          </div>
          
          <div className="space-y-3">
            {sortedActivities.length > 0 ? (
              sortedActivities.map(activity => (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-2 rounded-md hover:bg-muted/30 transition-colors"
                >
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(activity.date, { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.description}
                    </p>
                    {activity.user && (
                      <div className="flex items-center mt-2">
                        <Avatar className="h-5 w-5 mr-2">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(activity.user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{activity.user.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No activity to display</p>
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
            <DialogTitle>Activity Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Activity Type</label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={activityType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivityType('all')}
                >
                  All
                </Button>
                <Button 
                  variant={activityType === 'member' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivityType('member')}
                >
                  Members
                </Button>
                <Button 
                  variant={activityType === 'event' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivityType('event')}
                >
                  Events
                </Button>
                <Button 
                  variant={activityType === 'message' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivityType('message')}
                >
                  Messages
                </Button>
                <Button 
                  variant={activityType === 'resource' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivityType('resource')}
                >
                  Resources
                </Button>
                <Button 
                  variant={activityType === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivityType('system')}
                >
                  System
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