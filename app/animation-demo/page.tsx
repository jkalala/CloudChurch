'use client';

import { AnimationDemo } from '@/components/ui/transitions/animation-demo';
import { AnimationSettings } from '@/components/ui/settings/animation-settings';
import { LoginForm } from '@/components/ui/login-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

export default function AnimationDemoPage() {
  return (
    <div className="container py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Animation & Form Enhancements</h1>
        <p className="text-muted-foreground">
          This page demonstrates the enhanced form system with real-time validation and animated feedback.
        </p>
      </div>

      <Tabs defaultValue="demo" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Contact Form Demo</TabsTrigger>
          <TabsTrigger value="settings">Animation Settings</TabsTrigger>
          <TabsTrigger value="login">Authentication</TabsTrigger>
        </TabsList>
        <TabsContent value="demo" className="p-4">
          <AnimationDemo />
        </TabsContent>
        <TabsContent value="settings" className="p-4">
          <Card className="p-6">
            <AnimationSettings />
          </Card>
        </TabsContent>
        <TabsContent value="login" className="p-4">
          <LoginForm />
        </TabsContent>
      </Tabs>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">About Enhanced Forms</h2>
        <p>
          The enhanced form system extends React Hook Form with real-time validation, animated feedback indicators,
          and progressive disclosure patterns. Key features include:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Real-time validation with customizable validation modes (onChange, onBlur, onTouched)</li>
          <li>Visual feedback indicators that animate based on validation state</li>
          <li>Progressive disclosure of form fields based on user input</li>
          <li>Accessibility features including proper ARIA attributes and keyboard navigation</li>
          <li>Animation preferences that respect user settings and system preferences</li>
          <li>Comprehensive error handling and feedback mechanisms</li>
        </ul>
      </div>
    </div>
  );
}