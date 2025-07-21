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
import { format } from 'date-fns';
import { Megaphone, Calendar, ChevronRight } from 'lucide-react';

interface AnnouncementsWidgetProps {
  id: string;
  size: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: Date;
  type: 'general' | 'event' | 'urgent';
}

export function AnnouncementsWidget({ id, size }: AnnouncementsWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { updateWidgetSettings } = useDashboard();
  const [filter, setFilter] = useState<'all' | 'general' | 'event' | 'urgent'>('all');
  
  // Sample announcements for demonstration
  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'Special Guest Speaker',
      content: 'We are pleased to announce that Pastor John Smith will be our guest speaker this Sunday.',
      date: new Date(),
      type: 'general'
    },
    {
      id: '2',
      title: 'Church Picnic',
      content: 'Join us for our annual church picnic next Saturday at Central Park. Bring your family and friends!',
      date: new Date(2025, 6, 26), // July 26, 2025
      type: 'event'
    },
    {
      id: '3',
      title: 'Building Maintenance',
      content: 'The church building will be closed for maintenance on Monday, July 21. All activities are canceled for that day.',
      date: new Date(2025, 6, 21), // July 21, 2025
      type: 'urgent'
    },
    {
      id: '4',
      title: 'Volunteer Opportunity',
      content: 'We need volunteers for the upcoming youth camp. Please sign up at the information desk.',
      date: new Date(2025, 6, 22), // July 22, 2025
      type: 'general'
    }
  ];

  const handleSaveSettings = () => {
    updateWidgetSettings(id, { filter });
    setShowSettings(false);
  };

  // Filter announcements based on the selected filter
  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return announcement.type === filter;
  });

  // Sort announcements by date (newest first)
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  const getAnnouncementTypeIcon = (type: string) => {
    switch (type) {
      case 'general': return <Megaphone className="h-4 w-4 text-blue-500" />;
      case 'event': return <Calendar className="h-4 w-4 text-green-500" />;
      case 'urgent': return <Megaphone className="h-4 w-4 text-red-500" />;
      default: return <Megaphone className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAnnouncementTypeClass = (type: string) => {
    switch (type) {
      case 'general': return 'border-l-blue-500';
      case 'event': return 'border-l-green-500';
      case 'urgent': return 'border-l-red-500';
      default: return 'border-l-blue-500';
    }
  };

  return (
    <>
      <WidgetBase 
        id={id} 
        title="Church Announcements" 
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
                variant={filter === 'urgent' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setFilter('urgent')}
                className="text-red-500"
              >
                Urgent
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {sortedAnnouncements.length > 0 ? (
              sortedAnnouncements.map(announcement => (
                <div 
                  key={announcement.id} 
                  className={`border-l-4 pl-3 py-2 ${getAnnouncementTypeClass(announcement.type)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      {getAnnouncementTypeIcon(announcement.type)}
                      <h4 className="text-sm font-medium">{announcement.title}</h4>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(announcement.date, 'MMM d')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {announcement.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No announcements to display</p>
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
            <DialogTitle>Announcements Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Default Filter</label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={filter === 'general' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('general')}
                >
                  General
                </Button>
                <Button 
                  variant={filter === 'event' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('event')}
                >
                  Events
                </Button>
                <Button 
                  variant={filter === 'urgent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('urgent')}
                >
                  Urgent
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