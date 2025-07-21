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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../select';
import { 
  FileText, 
  Video, 
  Music, 
  Image as ImageIcon, 
  Download, 
  ChevronRight,
  Search
} from 'lucide-react';
import { Input } from '../../input';

interface ResourcesWidgetProps {
  id: string;
  size: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'image';
  category: 'sermon' | 'study' | 'music' | 'media';
  date: Date;
  size: string;
  url: string;
}

export function ResourcesWidget({ id, size }: ResourcesWidgetProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { updateWidgetSettings } = useDashboard();
  const [category, setCategory] = useState<'all' | 'sermon' | 'study' | 'music' | 'media'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample resources for demonstration
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Sunday Sermon - Faith in Action',
      type: 'document',
      category: 'sermon',
      date: new Date(2025, 6, 14), // July 14, 2025
      size: '2.4 MB',
      url: '#'
    },
    {
      id: '2',
      title: 'Bible Study Guide - Book of Romans',
      type: 'document',
      category: 'study',
      date: new Date(2025, 6, 10), // July 10, 2025
      size: '1.8 MB',
      url: '#'
    },
    {
      id: '3',
      title: 'Worship Team Practice - Amazing Grace',
      type: 'audio',
      category: 'music',
      date: new Date(2025, 6, 15), // July 15, 2025
      size: '8.2 MB',
      url: '#'
    },
    {
      id: '4',
      title: 'Youth Camp Promotional Video',
      type: 'video',
      category: 'media',
      date: new Date(2025, 6, 12), // July 12, 2025
      size: '24.5 MB',
      url: '#'
    },
    {
      id: '5',
      title: 'Church Picnic Photos',
      type: 'image',
      category: 'media',
      date: new Date(2025, 6, 5), // July 5, 2025
      size: '15.3 MB',
      url: '#'
    }
  ];

  const handleSaveSettings = () => {
    updateWidgetSettings(id, { category });
    setShowSettings(false);
  };

  // Filter resources based on category and search query
  const filteredResources = resources.filter(resource => {
    // First filter by category
    if (category !== 'all' && resource.category !== category) return false;
    
    // Then filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return resource.title.toLowerCase().includes(query);
    }
    
    return true;
  });

  // Sort resources by date (newest first)
  const sortedResources = [...filteredResources].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  );

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'video': return <Video className="h-4 w-4 text-red-500" />;
      case 'audio': return <Music className="h-4 w-4 text-purple-500" />;
      case 'image': return <ImageIcon className="h-4 w-4 text-green-500" />;
      default: return <FileText className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <>
      <WidgetBase 
        id={id} 
        title="Ministry Resources" 
        size={size as WidgetSize}
        hasSettings={true}
        onSettingsClick={() => setShowSettings(true)}
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search resources..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-1">
            <Button 
              variant={category === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategory('all')}
            >
              All
            </Button>
            <Button 
              variant={category === 'sermon' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategory('sermon')}
            >
              Sermons
            </Button>
            <Button 
              variant={category === 'study' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategory('study')}
            >
              Studies
            </Button>
            <Button 
              variant={category === 'music' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategory('music')}
            >
              Music
            </Button>
            <Button 
              variant={category === 'media' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategory('media')}
            >
              Media
            </Button>
          </div>
          
          <div className="space-y-2">
            {sortedResources.length > 0 ? (
              sortedResources.map(resource => (
                <div 
                  key={resource.id} 
                  className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getResourceIcon(resource.type)}
                    <div>
                      <p className="text-sm font-medium">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {resource.size} • {new Date(resource.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No resources found</p>
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
            <DialogTitle>Resources Widget Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Default Category
              </label>
              <Select value={category} onValueChange={(value: any) => setCategory(value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="sermon">Sermons</SelectItem>
                  <SelectItem value="study">Bible Studies</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
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