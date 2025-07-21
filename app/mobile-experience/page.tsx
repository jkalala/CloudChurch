'use client';

import React, { useState } from 'react';
import { MobileOptimizedLayout } from '@/components/ui/mobile/mobile-optimized-layout';
import { TouchCard } from '@/components/ui/mobile/touch-card';
import { TouchButton } from '@/components/ui/mobile/touch-button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGestureDetection, SwipeDirection } from '@/hooks/use-gesture-detection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Home, 
  Settings, 
  User, 
  Bell, 
  Calendar, 
  MessageSquare,
  Menu,
  ChevronRight
} from 'lucide-react';

export default function MobileExperiencePage() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('touch');
  const [notifications, setNotifications] = useState<string[]>([]);

  // Add a notification message
  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev].slice(0, 5));
  };

  // Handle swipe on a card
  const handleSwipe = (direction: SwipeDirection) => {
    addNotification(`Swiped ${direction}`);
  };

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Navigation</h3>
      
      <div className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('touch')}>
          <Home className="mr-2 h-4 w-4" />
          Touch Components
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('layout')}>
          <Settings className="mr-2 h-4 w-4" />
          Responsive Layout
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" onClick={() => setActiveTab('gestures')}>
          <User className="mr-2 h-4 w-4" />
          Gesture Demo
        </Button>
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
      <h1 className="text-xl font-bold">Mobile Experience</h1>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => addNotification('Notification clicked')}>
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => addNotification('Calendar clicked')}>
          <Calendar className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  // Footer content for mobile
  const footerContent = isMobile ? (
    <div className="flex justify-around items-center">
      <Button variant="ghost" size="icon" onClick={() => setActiveTab('touch')}>
        <Home className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setActiveTab('layout')}>
        <Settings className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setActiveTab('gestures')}>
        <User className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => addNotification('Messages clicked')}>
        <MessageSquare className="h-5 w-5" />
      </Button>
    </div>
  ) : null;

  // Gesture demo area
  const { ref: gestureAreaRef, gestureState } = useGestureDetection({
    onSwipe: (direction) => {
      addNotification(`Gesture area: Swiped ${direction}`);
    },
    onPinch: (scale, type) => {
      addNotification(`Gesture area: Pinched ${type} (scale: ${scale.toFixed(2)})`);
    },
    onRotate: (angle) => {
      addNotification(`Gesture area: Rotated ${angle.toFixed(2)} degrees`);
    },
    onLongPress: () => {
      addNotification('Gesture area: Long pressed');
    },
    onDoubleTap: () => {
      addNotification('Gesture area: Double tapped');
    },
    onTap: () => {
      addNotification('Gesture area: Tapped');
    }
  });

  return (
    <MobileOptimizedLayout
      sidebar={sidebarContent}
      header={headerContent}
      footer={footerContent}
      className="min-h-screen"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Mobile Experience Demo</h2>
          <p className="text-muted-foreground">
            This page demonstrates the mobile experience enhancements implemented for the Connectus application.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="touch">Touch Components</TabsTrigger>
            <TabsTrigger value="layout">Responsive Layout</TabsTrigger>
            <TabsTrigger value="gestures">Gesture Demo</TabsTrigger>
          </TabsList>
          
          {/* Touch Components Tab */}
          <TabsContent value="touch" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Touch-Friendly Components</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TouchCard 
                title="Interactive Card" 
                onSwipe={handleSwipe}
                onTap={() => addNotification('Card tapped')}
                onDoubleTap={() => addNotification('Card double tapped')}
                onLongPress={() => addNotification('Card long pressed')}
              >
                <p>This card responds to various touch gestures. Try swiping, tapping, double-tapping, or long-pressing.</p>
              </TouchCard>
              
              <Card>
                <CardHeader>
                  <CardTitle>Touch Buttons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <TouchButton 
                      onClick={() => addNotification('Primary button clicked')}
                      onLongPress={() => addNotification('Primary button long pressed')}
                    >
                      Primary Button
                    </TouchButton>
                  </div>
                  
                  <div className="space-y-2">
                    <TouchButton 
                      variant="secondary"
                      onClick={() => addNotification('Secondary button clicked')}
                      onDoubleTap={() => addNotification('Secondary button double tapped')}
                    >
                      Secondary Button
                    </TouchButton>
                  </div>
                  
                  <div className="space-y-2">
                    <TouchButton 
                      variant="outline"
                      onClick={() => addNotification('Outline button clicked')}
                      rippleEffect={false}
                    >
                      No Ripple Effect
                    </TouchButton>
                  </div>
                  
                  <div className="space-y-2">
                    <TouchButton 
                      variant="ghost"
                      onClick={() => addNotification('Ghost button clicked')}
                      touchFeedback={false}
                    >
                      No Touch Feedback
                    </TouchButton>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Touch-Optimized Form</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Enter your name" 
                      className={isMobile ? "h-12 text-base" : ""}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      className={isMobile ? "h-12 text-base" : ""}
                    />
                  </div>
                  
                  <TouchButton className="w-full">
                    Submit Form
                  </TouchButton>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Responsive Layout Tab */}
          <TabsContent value="layout" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Responsive Layout</h3>
            
            <Card>
              <CardHeader>
                <CardTitle>Layout Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Swipe Navigation</h4>
                  <p className="text-muted-foreground">
                    On mobile devices, swipe from the left edge to open the sidebar menu, or swipe right to close it.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Optimized Touch Targets</h4>
                  <p className="text-muted-foreground">
                    All interactive elements have been sized appropriately for touch interaction.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Mobile-First Footer Navigation</h4>
                  <p className="text-muted-foreground">
                    On mobile devices, a persistent footer navigation provides quick access to key features.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mobile View</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>Current device: <strong>{isMobile ? 'Mobile' : 'Desktop'}</strong></p>
                    <p className="text-muted-foreground">
                      {isMobile 
                        ? 'You are viewing this on a mobile device or narrow viewport.' 
                        : 'Try viewing this page on a mobile device or resize your browser window.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Touch-Friendly Lists</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, index) => (
                      <li key={index}>
                        <Button 
                          variant="ghost" 
                          className={`w-full justify-between ${isMobile ? 'py-3' : ''}`}
                          onClick={() => addNotification(`${item} clicked`)}
                        >
                          {item}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Gesture Demo Tab */}
          <TabsContent value="gestures" className="space-y-4 mt-4">
            <h3 className="text-lg font-semibold">Gesture Detection</h3>
            
            <Card>
              <CardHeader>
                <CardTitle>Gesture Playground</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  ref={gestureAreaRef as any}
                  className="bg-muted/30 border-2 border-dashed border-muted rounded-md h-64 flex items-center justify-center"
                >
                  <div className="text-center p-4">
                    <p className="font-medium mb-2">Try different gestures here</p>
                    <p className="text-sm text-muted-foreground">
                      Swipe, pinch, rotate, tap, double-tap, or long-press
                    </p>
                    {isMobile ? (
                      <div className="mt-4 text-sm">
                        <p>Current gesture: {
                          gestureState.isSwiping ? 'Swiping' :
                          gestureState.isPinching ? 'Pinching' :
                          gestureState.isRotating ? 'Rotating' :
                          gestureState.isLongPressing ? 'Long pressing' :
                          'None'
                        }</p>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-muted-foreground">
                        Gestures are only available on touch devices
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Gesture Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {notifications.length > 0 ? (
                    <ul className="space-y-2">
                      {notifications.map((notification, index) => (
                        <li key={index} className="text-sm p-2 bg-muted/30 rounded-md">
                          {notification}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">
                      Interact with the components to see gesture logs
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileOptimizedLayout>
  );
}