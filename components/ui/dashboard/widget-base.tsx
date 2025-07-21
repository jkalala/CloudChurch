"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../card';
import { Button } from '../button';
import { X, Settings, ChevronDown, ChevronUp, Maximize, Minimize } from 'lucide-react';
import { useDashboard } from '@/lib/contexts/dashboard-context';
import { WidgetSize } from '@/lib/types/dashboard-widget';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../collapsible';

interface WidgetBaseProps {
  id: string;
  title: string;
  size: WidgetSize;
  children: React.ReactNode;
  onSettingsClick?: () => void;
  hasSettings?: boolean;
}

export function WidgetBase({
  id,
  title,
  size,
  children,
  onSettingsClick,
  hasSettings = false
}: WidgetBaseProps) {
  const { removeWidget, updateWidgetSize } = useDashboard();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleRemove = () => {
    removeWidget(id);
  };

  const toggleSize = () => {
    const newSize: WidgetSize = size === 'small' ? 'medium' : 
                               size === 'medium' ? 'large' : 'small';
    updateWidgetSize(id, newSize);
  };

  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-1 row-span-2',
    large: 'col-span-2 row-span-2'
  };

  return (
    <Card className={`${sizeClasses[size]} overflow-hidden shadow-md transition-all duration-200`}>
      <CardHeader className="p-3 flex flex-row items-center justify-between bg-muted/20">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSize}>
            {size === 'large' ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
          {hasSettings && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onSettingsClick}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRemove}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <Collapsible open={!isCollapsed} className="h-full">
        <CollapsibleContent className="h-full">
          <CardContent className="p-3 h-full overflow-auto">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}