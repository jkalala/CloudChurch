"use client";

import React, { useState } from 'react';
import { DashboardGrid } from './dashboard-grid';
import { DashboardProvider } from '@/lib/contexts/dashboard-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, PlusCircle, LayoutGrid, LayoutList, LayoutDashboard } from 'lucide-react';
import { FeatureManager } from '@/lib/feature-management';
import { useAuth } from '@/components/auth-provider';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [view, setView] = useState<'grid' | 'list' | 'compact'>('grid');
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  
  // Get enabled features
  const features = FeatureManager.getAllFeatures().filter(f => f.enabled);
  
  return (
    <DashboardProvider>
      <div className="container py-6 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome to your church management dashboard.
            </p>
          </div>
          
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
            
            {isAdmin && (
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <div className={`grid gap-4 ${
              view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 
              view === 'compact' ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' : 
              'grid-cols-1'
            }`}>
              <Card className="col-span-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Quick Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                </CardContent>
              </Card>
              
              <DashboardGrid viewMode={view} />
            </div>
          </TabsContent>
          
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle>Available Features</CardTitle>
                <CardDescription>
                  These features are currently enabled for your church.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {children}
      </div>
    </DashboardProvider>
  );
}