"use client";

import React, { Component, ErrorInfo } from 'react';
import { WidgetLayout, WidgetType } from '@/lib/types/dashboard-widget';
import { WidgetBase } from './widget-base';
import { StatsWidget } from './widgets/stats-widget';
import { ChartWidget } from './widgets/chart-widget';
import { CalendarWidget } from './widgets/calendar-widget';
import { TasksWidget } from './widgets/tasks-widget';
import { AnnouncementsWidget } from './widgets/announcements-widget';
import { MembersWidget } from './widgets/members-widget';
import { ResourcesWidget } from './widgets/resources-widget';
import { ActivityWidget } from './widgets/activity-widget';
import { PrayerWidget } from './widgets/prayer-widget';

// Error boundary to catch errors in widget rendering
class WidgetErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Widget rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface WidgetRegistryProps {
  widget: WidgetLayout;
}

export function WidgetRegistry({ widget }: WidgetRegistryProps) {
  console.log('Rendering widget:', widget);
  
  const widgetComponents: Record<WidgetType, React.FC<{ id: string; size: string }>> = {
    stats: StatsWidget,
    chart: ChartWidget,
    calendar: CalendarWidget,
    tasks: TasksWidget,
    announcements: AnnouncementsWidget,
    members: MembersWidget,
    resources: ResourcesWidget,
    activity: ActivityWidget,
    prayer: PrayerWidget,
    custom: ({ id, size }) => (
      <WidgetBase id={id} title="Custom Widget" size={size as any}>
        <div className="flex items-center justify-center h-full">
          <p>Custom Widget Content</p>
        </div>
      </WidgetBase>
    )
  };

  const WidgetComponent = widgetComponents[widget.type];

  if (!WidgetComponent) {
    return (
      <WidgetBase id={widget.id} title="Unknown Widget" size={widget.size}>
        <div className="flex items-center justify-center h-full">
          <p>Unknown widget type: {widget.type}</p>
        </div>
      </WidgetBase>
    );
  }

  const errorFallback = (
    <WidgetBase id={widget.id} title={`${widget.type} Widget (Error)`} size={widget.size}>
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Error rendering widget</p>
          <p className="text-sm text-muted-foreground">There was a problem displaying this widget.</p>
        </div>
      </div>
    </WidgetBase>
  );

  return (
    <WidgetErrorBoundary fallback={errorFallback}>
      <WidgetComponent id={widget.id} size={widget.size} />
    </WidgetErrorBoundary>
  );
}