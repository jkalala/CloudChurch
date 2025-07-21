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
import { Calendar } from '../../calendar';
import { format, addDays } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';

interface CalendarWidgetProps {
  id: string;
  size: string;
}

export function CalendarWidget({ id, size }: CalendarWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { updateWidgetSettings } = useDashboard();
  const [date, setDate] = useState<Date>(new Date());
  const [viewType, setViewType] = useState<'month' | 'week'>('month');

  // Sample events for demonstration
  const events = [
    {
      id: '1',
      title: 'Sunday Service',
      date: new Date(),
      time: '10:00 AM',
      type: 'service'
    },
    {
      id: '2',
      title: 'Bible Study',
      date: addDays(new Date(), 2),
      time: '7:00 PM',
      type: 'study'
    },
    {
      id: '3',
      title: 'Youth Group',
      date: addDays(new Date(), 3),
      time: '6:30 PM',
      type: 'youth'
    },
    {
      id: '4',
      title: 'Prayer Meeting',
      date: addDays(new Date(), 5),
      time: '7:00 PM',
      type: 'prayer'
    }
  ];

  const handleSaveSettings = () => {
    updateWidgetSettings(id, { viewType });
    setShowSettings(false);
  };

  // Filter events for today and upcoming
  const todayEvents = events.filter(
    event => format(event.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  
  const upcomingEvents = events.filter(
    event => event.date > new Date() && 
    format(event.date, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd')
  ).slice(0, 3);

  return (
    <>
      <WidgetBase 
        id={id} 
        title="Church Calendar" 
        size={size as WidgetSize}
        hasSettings={true}
        onSettingsClick={() => setShowSettings(true)}
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">
              {format(date, 'MMMM yyyy')}
            </h3>
          </div>
          
          <div className="rounded-md border">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md"
            />
          </div>
          
          <div className="space-y-3">
            {todayEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Today</h4>
                {todayEvents.map(event => (
                  <div key={event.id} className="flex items-start space-x-2 mb-2 bg-muted/30 p-2 rounded-md">
                    <CalendarIcon className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {upcomingEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Upcoming</h4>
                {upcomingEvents.map(event => (
                  <div key={event.id} className="flex items-start space-x-2 mb-2 bg-muted/30 p-2 rounded-md">
                    <CalendarIcon className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="mr-2">{format(event.date, 'MMM d')}</span>
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {todayEvents.length === 0 && upcomingEvents.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p>No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </WidgetBase>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Calendar Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">View Type</label>
              <div className="flex space-x-2">
                <Button 
                  variant={viewType === 'month' ? 'default' : 'outline'}
                  onClick={() => setViewType('month')}
                >
                  Month
                </Button>
                <Button 
                  variant={viewType === 'week' ? 'default' : 'outline'}
                  onClick={() => setViewType('week')}
                >
                  Week
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