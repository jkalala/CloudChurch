'use client';

import React, { useState } from 'react';
import { MobileOptimizedLayout } from '@/components/ui/mobile/mobile-optimized-layout';
import { TouchButton } from '@/components/ui/mobile/touch-button';
import { TouchCard } from '@/components/ui/mobile/touch-card';
import { DashboardGrid } from './dashboard-grid';
import { DashboardProvider } from '@/lib/contexts/dashboard-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  PlusCircle, 
  LayoutGrid, 
  LayoutList, 
  LayoutDashboard,
  Home,
  Bell,
  Menu,
  User,
  Calendar,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { FeatureManager } from '@/lib/feature-management';
import { useAuth } from '@/components/auth-provider';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGestureDetection, SwipeDirection } from '@/hooks/use-gesture-detection';
import { motion } from 'framer-motion';

interface MobileDashboardLayoutProps {
  children?: React.ReactNode;
}

export function MobileDashboardLayout({ children }: MobileDashboardLayoutProps) {
  const [view, setView] = useState<'grid' | 'list' | 'compact'>('grid');
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState<string[]>([]);
  
  // Get enabled features
  const features = FeatureManager.getAllFeatures().filter(f => f.enabled);

  // Add a notification message
  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
  };

  // Handle swipe on a card
  const handleSwipe = (direction: SwipeDirection) => {
    if (direction === 'left') {
      // Navigate to next tab
      if (activeTab === 'dashboard') {
        setActiveTab('features');
      }
    } else if (direction === 'right') {
      // Navigate to previous tab
      if (activeTab === 'features') {
        setActiveTab('dashboard');
      }
    }
    addNotification(`Swiped ${direction}`);
  };
  
  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Navigation</h3>
      
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('dashboard')}>
          <Home className="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('features')}>
          <Settings className="mr-2 h-4 w-4" />
          Features
        </Button>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-2">Quick Access</h4>
        <div className="space-y-2">
          {features.slice(0, 5).map(feature => (
            <Button 
              key={feature.id} 
              variant="ghost" 
              className="w-full justify-start text-sm"
              asChild
            >
              <a href={`/${feature.id.toLowerCase().replace(/\s+/g, '-')}`}>
                {feature.name}
              </a>
            </Button>
          ))}
        </div>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-2">Recent Notifications</h4>
        {notifications.length > 0 ? (
          <ul className="space-y-2">
            {notifications.map((notification, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {notification}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No recent notifications</p>
        )}
      </div>
    </div>
  );

  // Header content
  const headerContent = (
    <div className="flex justify-between items-center w-full">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => addNotification('Notification clicked')}>
          <Bell className="h-5 w-5" />
        </Button>
        {isAdmin && !isMobile && (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        )}
      </div>
    </div>
  );

  // Footer content for mobile
  const footerContent = isMobile ? (
    <div className="flex justify-around items-center">
      <TouchButton variant="ghost" size="icon" onClick={() => setActiveTab('dashboard')}>
        <Home className="h-5 w-5" />
      </TouchButton>
      <TouchButton variant="ghost" size="icon" onClick={() => addNotification('Calendar clicked')}>
        <Calendar className="h-5 w-5" />
      </TouchButton>
      <TouchButton variant="ghost" size="icon" onClick={() => addNotification('Messages clicked')}>
        <MessageSquare className="h-5 w-5" />
      </TouchButton>
      <TouchButton variant="ghost" size="icon" onClick={() => addNotification('Profile clicked')}>
        <User className="h-5 w-5" />
      </TouchButton>
    </div>
  ) : null;

  // Main content
  const mainContent = (
    <DashboardProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground">
            Welcome to your church management dashboard.
          </p>
        </div>
        
        {!isMobile && (
          <div className="flex items-center space-x-2">
            <div className="border rounded-md p-1">
              <Button 
                variant={view === 'grid' ? 'default' : 'ghost'} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === 'list' ? 'default' : 'ghost'} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setView('list')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === 'compact' ? 'default' : 'ghost'} 
                size="icon"
                className="h-8 w-8"
                onClick={() => setView('compact')}
              >
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <TouchCard 
              title="Quick Overview" 
              onSwipe={handleSwipe}
              className="col-span-full"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-2xl font-bold">1,234</span>
                  <span className="text-xs text-muted-foreground">Total Members</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-2xl font-bold">$24,500</span>
                  <span className="text-xs text-muted-foreground">Monthly Giving</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-2xl font-bold">12</span>
                  <span className="text-xs text-muted-foreground">Upcoming Events</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-2xl font-bold">45</span>
                  <span className="text-xs text-muted-foreground">Prayer Requests</span>
                </div>
              </div>
            </TouchCard>
            
            <div className={`grid gap-4 ${
              view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 
              view === 'compact' ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' : 
              'grid-cols-1'
            }`}>
              <DashboardGrid viewMode={isMobile ? 'list' : view} />
            </div>
          </TabsContent>
          
          <TabsContent value="features">
            <TouchCard title="Available Features" onSwipe={handleSwipe}>
              <p className="text-sm text-muted-foreground mb-4">
                These features are currently enabled for your church.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {features.map(feature => (
                  <div key={feature.id} className="border rounded-lg p-4 flex flex-col">
                    <h3 className="font-medium">{feature.name}</h3>
                    <p className="text-sm text-muted-foreground flex-1">{feature.description}</p>
                    <div className="mt-2 flex items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        feature.category === 'core' ? 'bg-blue-100 text-blue-800' :
                        feature.category === 'ministry' ? 'bg-green-100 text-green-800' :
                        feature.category === 'communication' ? 'bg-yellow-100 text-yellow-800' :
                        feature.category === 'analytics' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {feature.category}
                      </span>
                      {feature.beta && (
                        <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Beta
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TouchCard>
          </TabsContent>
        </Tabs>
        
        {children}
      </div>
    </DashboardProvider>
  );

  return (
    <MobileOptimizedLayout
      sidebar={sidebarContent}
      header={headerContent}
      footer={footerContent}
      className="min-h-screen"
    >
      {mainContent}
    </MobileOptimizedLayout>
  );
}

export default MobileDashboardLayout;