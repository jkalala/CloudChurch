"use client";

import { useFeatureFlags } from '../components/_shared/feature-context';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Users, Calendar, DollarSign, Building2, Radio, Heart, MapPin, BookOpen, Bot, Settings, MessageCircle, BarChart3, Smartphone, Zap, Link2, Cpu, Users2, Group, Video, Activity, Layers } from 'lucide-react';
import { useState } from 'react';
import { FeatureProvider } from '../components/_shared/feature-context';

const featureGroups = [
  {
    group: 'Core Features',
    features: [
      { key: 'members', label: 'Members', description: 'Manage church members, profiles, and roles.' },
      { key: 'events', label: 'Events', description: 'Create and manage church events and RSVPs.' },
      { key: 'financial', label: 'Financial', description: 'Track donations, expenses, and budgets.' },
      { key: 'departments', label: 'Departments', description: 'Organize and manage church departments.' },
      { key: 'streaming', label: 'Streaming', description: 'Live stream services and events.' },
      { key: 'pastoral', label: 'Pastoral Care', description: 'Manage care records and prayer requests.' },
      { key: 'outreach', label: 'Outreach', description: 'Community outreach and CRM tools.' },
      { key: 'resources', label: 'Resources', description: 'Resource library for documents and media.' },
      { key: 'ai', label: 'AI Tools', description: 'Access AI-powered church tools.' },
    ],
  },
  {
    group: 'Collaboration',
    features: [
      { key: 'dashboard-widgets', label: 'Customizable Dashboard Widgets', description: 'Personalize your dashboard with drag-and-drop widgets.' },
      { key: 'presence', label: 'Real-time Presence', description: 'See who is online and active.' },
      { key: 'collaborative-editing', label: 'Collaborative Editing', description: 'Edit documents with others in real time.' },
      { key: 'real-time-chat', label: 'Real-time Chat', description: 'Chat with members and teams instantly.' },
      { key: 'version-history', label: 'Version History Tracking', description: 'Track changes and restore previous versions.' },
      { key: 'offline-collab', label: 'Offline Collaboration Sync', description: 'Collaborate even when offline, with sync on reconnect.' },
    ],
  },
  {
    group: 'Analytics & Reporting',
    features: [
      { key: 'analytics', label: 'Analytics Dashboard', description: 'View analytics and insights for your church.' },
      { key: 'visualizations', label: 'Enhanced Visualizations', description: 'Advanced charts and data visualizations.' },
      { key: 'insights', label: 'Insights Engine', description: 'Get actionable insights from your data.' },
      { key: 'report-builder', label: 'Report Builder', description: 'Build and export custom reports.' },
    ],
  },
  {
    group: 'Mobile & Offline',
    features: [
      { key: 'mobile-enhancements', label: 'Mobile Experience Enhancements', description: 'Optimized layouts and gestures for mobile.' },
      { key: 'offline-data', label: 'Offline Data Manager', description: 'Access and sync data offline.' },
      { key: 'progressive-media', label: 'Progressive Media Loading', description: 'Faster media loading and adaptive quality.' },
      { key: 'biometric-auth', label: 'Biometric Authentication', description: 'Sign in with fingerprint or face ID.' },
      { key: 'push-notifications', label: 'Push Notification System', description: 'Send and receive push notifications.' },
    ],
  },
  {
    group: 'Integrations',
    features: [
      { key: 'integration-framework', label: 'Integration Framework', description: 'Connect with third-party services.' },
      { key: 'oauth-manager', label: 'OAuth Manager', description: 'Manage OAuth providers and tokens.' },
      { key: 'webhooks', label: 'Webhook System', description: 'Automate workflows with webhooks.' },
      { key: 'api-gateway', label: 'API Gateway', description: 'Centralized API management and security.' },
    ],
  },
  {
    group: 'AI & Automation',
    features: [
      { key: 'ai-content', label: 'AI Content Generator', description: 'Generate content using AI.' },
      { key: 'pattern-recognition', label: 'Pattern Recognition', description: 'Detect trends and anomalies in data.' },
      { key: 'ai-assistant', label: 'AI Assistant Interface', description: 'Conversational AI assistant for help and automation.' },
      { key: 'ai-scheduling', label: 'Intelligent Scheduling', description: 'AI-powered volunteer and event scheduling.' },
    ],
  },
  {
    group: 'Community & Engagement',
    features: [
      { key: 'community-feed', label: 'Community Social Feed', description: 'Activity streams and social posts.' },
      { key: 'virtual-groups', label: 'Virtual Groups', description: 'Online groups and discussions.' },
      { key: 'prayer-requests', label: 'Prayer Request System', description: 'Manage and share prayer requests.' },
      { key: 'video-conferencing', label: 'Video Conferencing', description: 'Host and join video meetings.' },
      { key: 'volunteer-management', label: 'Volunteer Management', description: 'Track and schedule volunteers.' },
    ],
  },
  {
    group: 'Performance & Media',
    features: [
      { key: 'performance-monitoring', label: 'Performance Monitoring', description: 'Monitor app performance and health.' },
      { key: 'adaptive-media', label: 'Adaptive Media Delivery', description: 'Deliver media with adaptive quality.' },
    ],
  },
];

const groupIcons: Record<string, any> = {
  'Core Features': Settings,
  'Collaboration': MessageCircle,
  'Analytics & Reporting': BarChart3,
  'Mobile & Offline': Smartphone,
  'Integrations': Link2,
  'AI & Automation': Cpu,
  'Community & Engagement': Users2,
  'Performance & Media': Activity,
};

const coreFeatureKeys = [
  'members', 'events', 'financial', 'departments', 'streaming', 'pastoral', 'outreach', 'resources', 'ai'
];

export default function SettingsPage() {
  return (
    <FeatureProvider>
      <SettingsPageContent />
    </FeatureProvider>
  );
}

function SettingsPageContent() {
  const { features, refreshFeatures } = useFeatureFlags();
  const [saving, setSaving] = useState<string | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (group: string) => setOpenGroups(g => ({ ...g, [group]: !g[group] }));

  async function handleToggle(key: string, enabled: boolean) {
    setSaving(key);
    await fetch('/api/features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name: key, enabled }),
    });
    await refreshFeatures();
    setSaving(null);
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Feature Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {featureGroups.map(group => {
              const Icon = groupIcons[group.group] || Layers;
              const isOpen = openGroups[group.group] ?? true;
              return (
                <div key={group.group}>
                  <button
                    type="button"
                    className="flex items-center w-full mb-2 px-2 py-2 rounded bg-gray-50 hover:bg-gray-100 transition-colors group"
                    onClick={() => toggleGroup(group.group)}
                  >
                    <span className="mr-2 text-primary"><Icon className="h-5 w-5" /></span>
                    <span className="font-semibold text-lg flex-1 text-left">{group.group}</span>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary" /> : <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />}
                  </button>
                  <div
                    className={`space-y-3 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}
                  >
                    {group.features.map(f => (
                      <div key={f.key} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <span className="font-medium">{f.label}</span>
                          <span className="block text-xs text-muted-foreground mt-1">{f.description}</span>
                        </div>
                        <Switch
                          checked={coreFeatureKeys.includes(f.key) ? true : !!features[f.key]}
                          onCheckedChange={val => handleToggle(f.key, val)}
                          disabled={coreFeatureKeys.includes(f.key) || saving === f.key}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="my-4"><hr className="border-t border-gray-200" /></div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 