export type WidgetType = 
  | 'stats' 
  | 'chart' 
  | 'calendar' 
  | 'tasks' 
  | 'announcements' 
  | 'members' 
  | 'resources'
  | 'activity'
  | 'prayer'
  | 'custom';

export type WidgetSize = 'small' | 'medium' | 'large';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetLayout {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  position: WidgetPosition;
  settings?: Record<string, any>;
}

export interface IDashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  position: WidgetPosition;
  settings: Record<string, any>;
  render(): JSX.Element;
}