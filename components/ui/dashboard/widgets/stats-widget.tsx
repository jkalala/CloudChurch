"use client";

import { WidgetBase } from '../widget-base';
import { WidgetSize } from '@/lib/types/dashboard-widget';
import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../dialog';
import { Button } from '../../button';
import { useDashboard } from '@/lib/contexts/dashboard-context';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../select';
import { TrendingUp, TrendingDown, Users, UserCheck, UserPlus, Percent } from 'lucide-react';

interface StatsWidgetProps {
  id: string;
  size: string;
}

export function StatsWidget({ id, size }: StatsWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { updateWidgetSettings } = useDashboard();
  const [statType, setStatType] = useState('members');

  const handleSaveSettings = () => {
    updateWidgetSettings(id, { statType });
    setShowSettings(false);
  };

  return (
    <>
      <WidgetBase 
        id={id} 
        title="Church Statistics" 
        size={size as WidgetSize}
        hasSettings={true}
        onSettingsClick={() => setShowSettings(true)}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Members</p>
                <h3 className="text-2xl font-bold">1,234</h3>
              </div>
              <Users className="h-5 w-5 text-primary opacity-70" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-500">+5.2% from last month</p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Active Members</p>
                <h3 className="text-2xl font-bold">876</h3>
              </div>
              <UserCheck className="h-5 w-5 text-primary opacity-70" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-500">+3.1% from last month</p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">New Visitors</p>
                <h3 className="text-2xl font-bold">45</h3>
              </div>
              <UserPlus className="h-5 w-5 text-primary opacity-70" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-xs text-green-500">+12.5% from last month</p>
            </div>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <h3 className="text-2xl font-bold">78%</h3>
              </div>
              <Percent className="h-5 w-5 text-primary opacity-70" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              <p className="text-xs text-red-500">-2.3% from last month</p>
            </div>
          </div>
        </div>
      </WidgetBase>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Statistics Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="stat-type" className="text-sm font-medium">
                Statistics Type
              </label>
              <Select value={statType} onValueChange={setStatType}>
                <SelectTrigger id="stat-type">
                  <SelectValue placeholder="Select statistics type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members">Members</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="giving">Giving</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                </SelectContent>
              </Select>
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