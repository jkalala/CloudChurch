"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WidgetLayout, WidgetType, WidgetSize } from '../types/dashboard-widget';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/components/auth-provider';

interface DashboardContextProps {
  widgets: WidgetLayout[];
  addWidget: (type: WidgetType, size: WidgetSize) => void;
  removeWidget: (id: string) => void;
  updateWidgetPosition: (id: string, position: { x: number, y: number }) => void;
  updateWidgetSize: (id: string, size: WidgetSize) => void;
  updateWidgetSettings: (id: string, settings: Record<string, any>) => void;
  loading: boolean;
}

const DashboardContext = createContext<DashboardContextProps | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load widgets from user preferences
  useEffect(() => {
    async function loadWidgets() {
      try {
        console.log('Loading dashboard widgets for user:', user?.id);
        
        if (!user) {
          console.log('No user found, using default widgets');
          setWidgets(getDefaultWidgets());
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('user_preferences')
          .select('dashboard_layout')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to handle case where no record exists

        console.log('Loaded user preferences:', data, error);

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading dashboard widgets:', error);
          // Set default widgets if there's an error
          const defaultWidgets = getDefaultWidgets();
          console.log('Using default widgets due to error:', defaultWidgets);
          setWidgets(defaultWidgets);
        } else if (data && data.dashboard_layout && Array.isArray(data.dashboard_layout) && data.dashboard_layout.length > 0) {
          console.log('Using saved dashboard layout:', data.dashboard_layout);
          setWidgets(data.dashboard_layout);
        } else {
          // Set default widgets if none exist or if the layout is empty
          const defaultWidgets = getDefaultWidgets();
          console.log('Creating default widgets for user:', defaultWidgets);
          setWidgets(defaultWidgets);
          
          // Create default dashboard layout for the user
          try {
            const { error: upsertError } = await supabase
              .from('user_preferences')
              .upsert({
                user_id: user.id,
                dashboard_layout: defaultWidgets,
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'user_id'
              });
              
            if (upsertError) {
              console.error('Error creating default dashboard layout:', upsertError);
            } else {
              console.log('Successfully created default dashboard layout');
            }
          } catch (upsertError) {
            console.error('Exception creating default dashboard layout:', upsertError);
          }
        }
      } catch (error) {
        console.error('Exception loading dashboard widgets:', error);
        const defaultWidgets = getDefaultWidgets();
        console.log('Using default widgets due to exception:', defaultWidgets);
        setWidgets(defaultWidgets);
      } finally {
        setLoading(false);
      }
    }

    // Always set loading to true when user changes
    setLoading(true);

    if (!user) {
      // Set default widgets for unauthenticated users
      const defaultWidgets = getDefaultWidgets();
      console.log('User not authenticated, using default widgets:', defaultWidgets);
      setWidgets(defaultWidgets);
      setLoading(false);
      return;
    }

    loadWidgets();
  }, [user]);

  // Save widgets to user preferences
  const saveWidgets = async (updatedWidgets: WidgetLayout[]) => {
    try {
      // Use the user from auth context instead of fetching it again
      if (!user) return;

      await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          dashboard_layout: updatedWidgets,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
    } catch (error) {
      console.error('Error saving dashboard widgets:', error);
    }
  };

  const addWidget = (type: WidgetType, size: WidgetSize) => {
    const newWidget: WidgetLayout = {
      id: `widget-${Date.now()}`,
      type,
      size,
      position: { x: 0, y: 0 } // Default position, will be adjusted by grid layout
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  const removeWidget = (id: string) => {
    const updatedWidgets = widgets.filter(widget => widget.id !== id);
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  const updateWidgetPosition = (id: string, position: { x: number, y: number }) => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === id ? { ...widget, position } : widget
    );
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  const updateWidgetSize = (id: string, size: WidgetSize) => {
    const updatedWidgets = widgets.map(widget => 
      widget.id === id ? { ...widget, size } : widget
    );
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  const updateWidgetSettings = (id: string, settings: Record<string, any>) => {
    const updatedWidgets = widgets.map(widget => {
      if (widget.id === id) {
        // Ensure widget.settings exists before spreading
        const currentSettings = widget.settings || {};
        return { 
          ...widget, 
          settings: { ...currentSettings, ...settings } 
        };
      }
      return widget;
    });
    
    console.log('Updating widget settings:', id, settings);
    console.log('Updated widgets:', updatedWidgets);
    
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  return (
    <DashboardContext.Provider value={{
      widgets,
      addWidget,
      removeWidget,
      updateWidgetPosition,
      updateWidgetSize,
      updateWidgetSettings,
      loading
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

// Helper function to get default widgets
function getDefaultWidgets(): WidgetLayout[] {
  return [
    {
      id: 'stats-widget',
      type: 'stats',
      size: 'medium',
      position: { x: 0, y: 0 }
    },
    {
      id: 'calendar-widget',
      type: 'calendar',
      size: 'medium',
      position: { x: 1, y: 0 }
    },
    {
      id: 'tasks-widget',
      type: 'tasks',
      size: 'small',
      position: { x: 0, y: 1 }
    },
    {
      id: 'announcements-widget',
      type: 'announcements',
      size: 'small',
      position: { x: 1, y: 1 }
    }
  ];
}