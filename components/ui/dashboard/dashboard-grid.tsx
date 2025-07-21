"use client";

import { useState, useEffect } from 'react';
import { 
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter
} from '@dnd-kit/core';
import { 
  SortableContext, 
  rectSortingStrategy,
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDashboard } from '@/lib/contexts/dashboard-context';
import { WidgetRegistry } from './widget-registry';
import { WidgetBase } from './widget-base';
import { Button } from '../button';
import { Plus, Settings, LayoutGrid, LayoutList, LayoutDashboard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../dropdown-menu';
import { WidgetType, WidgetSize } from '@/lib/types/dashboard-widget';
import { useFeature } from '@/lib/feature-management';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs';

interface SortableWidgetProps {
  id: string;
  children: React.ReactNode;
}

function SortableWidget({ id, children }: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      {children}
    </div>
  );
}

interface DashboardGridProps {
  viewMode?: 'grid' | 'list' | 'compact';
}

export function DashboardGrid({ viewMode = 'grid' }: DashboardGridProps) {
  const { widgets, updateWidgetPosition, addWidget, loading } = useDashboard();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'ministry' | 'communication' | 'analytics'>('all');
  
  // Check if features are enabled
  const hasPastoralCare = useFeature('pastoral-care');
  const hasMusicMinistry = useFeature('music-ministry');
  const hasLiveStreaming = useFeature('live-streaming');
  const hasBibleStudy = useFeature('bible-study');
  const hasCommunication = useFeature('communication-tools');
  const hasOutreach = useFeature('outreach-crm');
  const hasReporting = useFeature('reporting-analytics');
  const hasDepartments = useFeature('department-management');
  const hasAI = useFeature('ai-assistant');
  const hasFaceRecognition = useFeature('face-recognition');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeWidget = widgets.find(w => w.id === active.id);
      const overWidget = widgets.find(w => w.id === over.id);
      
      if (activeWidget && overWidget) {
        updateWidgetPosition(activeWidget.id, overWidget.position);
        updateWidgetPosition(overWidget.id, activeWidget.position);
      }
    }
    
    setActiveId(null);
  };

  const handleAddWidget = (type: WidgetType) => {
    addWidget(type, 'small');
  };

  // Filter widgets based on active tab
  const filteredWidgets = widgets.filter(widget => {
    if (activeTab === 'all') return true;
    
    switch (activeTab) {
      case 'ministry':
        return ['prayer', 'calendar', 'resources'].includes(widget.type);
      case 'communication':
        return ['announcements', 'activity'].includes(widget.type);
      case 'analytics':
        return ['stats', 'chart'].includes(widget.type);
      default:
        return true;
    }
  });

  // Check if widgets array is empty or invalid
  const hasWidgets = Array.isArray(widgets) && widgets.length > 0;
  console.log('Dashboard has widgets:', hasWidgets, widgets);

  // Determine grid layout based on view mode
  const gridLayout = {
    grid: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]',
    list: 'grid-cols-1 gap-4 auto-rows-[minmax(200px,auto)]',
    compact: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[minmax(180px,auto)]'
  }[viewMode];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="all">All Widgets</TabsTrigger>
            <TabsTrigger value="ministry">Ministry</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Analytics</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleAddWidget('stats')}>
              Statistics Widget
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('chart')}>
              Chart Widget
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Ministry</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleAddWidget('calendar')}>
              Calendar Widget
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('tasks')}>
              Tasks Widget
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('prayer')}>
              Prayer Widget
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('resources')}>
              Resources Widget
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Communication</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleAddWidget('announcements')}>
              Announcements Widget
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('members')}>
              Members Widget
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAddWidget('activity')}>
              Activity Widget
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!hasWidgets && (
        <Card className="bg-muted/20 border">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">Your dashboard is empty</h3>
            <p className="text-muted-foreground mb-4">
              Add widgets to customize your dashboard experience.
            </p>
            <Button onClick={() => handleAddWidget('stats')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Widget
            </Button>
          </CardContent>
        </Card>
      )}

      {hasWidgets && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={filteredWidgets.map(w => w.id)} strategy={rectSortingStrategy}>
            <div className={`grid ${gridLayout}`}>
              {filteredWidgets.map((widget) => (
                <SortableWidget key={widget.id} id={widget.id}>
                  <WidgetRegistry widget={widget} />
                </SortableWidget>
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <div className="opacity-50">
                <WidgetRegistry 
                  widget={widgets.find(w => w.id === activeId)!} 
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      
      {/* Feature-specific content */}
      {hasPastoralCare && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Pastoral Care</CardTitle>
            <CardDescription>
              Member care, prayer requests, and pastoral support tools are enabled.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      {hasLiveStreaming && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Live Streaming</CardTitle>
            <CardDescription>
              Stream services and manage online congregation tools are enabled.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}