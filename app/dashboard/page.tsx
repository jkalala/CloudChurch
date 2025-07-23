"use client";

import { useState } from 'react';
import { DashboardProvider } from '@/lib/contexts/dashboard-context';
import Header from '@/app/components/header';
import Footer from '@/components/ui/navigation/footer';
import { FeatureProvider, useFeatureFlags } from '../components/_shared/feature-context';
import { Users, Calendar, DollarSign, Building2, Radio, Heart, MapPin, BookOpen, Bot, Settings, Plus, User } from 'lucide-react';
import MemberManagement from '@/app/components/member-management';
import EventsManager from '@/app/components/events-manager';
import FinancialDashboard from '@/app/components/financial-dashboard';
import UserProfileDropdown from '@/app/components/user-profile-dropdown';
import Link from 'next/link';
import DepartmentHub from '@/app/components/department-hub';
import LiveStreamingPlatform from '@/app/components/live-streaming-platform';
import PastoralCareDashboard from '@/app/components/pastoral-care-dashboard';
import CommunityOutreach from '@/app/components/community-outreach';
import ResourceLibrary from '@/app/components/resource-library';
import AIAssistantHub from '@/app/components/ai-assistant-hub';
import { useAuth } from "@/components/auth-provider";
import { useTranslation } from "@/lib/i18n";

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

// Core features always enabled
const coreFeatureKeys = [
  'members', 'events', 'financial', 'departments', 'streaming', 'pastoral', 'outreach', 'resources', 'ai'
];

export default function DashboardPage() {
  return (
    <FeatureProvider>
      <DashboardPageContent />
    </FeatureProvider>
  );
}

function DashboardPageContent() {
  const [activeTab, setActiveTab] = useState('members');
  const { features } = useFeatureFlags();
  const { language } = useAuth();
  const { t } = useTranslation(language);
  // TODO: Replace with real admin check
  const isAdmin = true;

  // Move these arrays inside so they update on language change
  const allFeatures = [
    { key: 'members', label: t('members'), icon: Users, path: '/members' },
    { key: 'events', label: t('events'), icon: Calendar, path: '/events' },
    { key: 'financial', label: t('financial'), icon: DollarSign, path: '/financial' },
    { key: 'departments', label: t('departments'), icon: Building2, path: '/departments' },
    { key: 'streaming', label: t('liveStreaming'), icon: Radio, path: '/streaming' },
    { key: 'pastoral', label: t('pastoralCare'), icon: Heart, path: '/pastoral-care' },
    { key: 'outreach', label: t('outreach'), icon: MapPin, path: '/outreach' },
    { key: 'resources', label: t('resources'), icon: BookOpen, path: '/resources' },
    { key: 'ai', label: t('aiAndTechnology'), icon: Bot, path: '/ai' },
  ];

  const mainTabs = [
    { key: 'members', label: t('members'), icon: Users },
    { key: 'events', label: t('events'), icon: Calendar },
    { key: 'financial', label: t('financial'), icon: DollarSign },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 container mx-auto py-6">
        {/* Top Bar: Tabs + User Profile */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 border-b">
            {mainTabs.filter(tab => features[tab.key]).map(tab => (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-primary'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <UserProfileDropdown />
            {isAdmin && (
              <Link href="/settings" className="flex items-center gap-1 px-3 py-2 rounded hover:bg-gray-100 font-semibold">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            )}
          </div>
        </div>
        <div className="flex">
          {/* Sidebar: All enabled features */}
          <aside className="w-56 bg-white border-r min-h-[60vh] p-4 flex flex-col">
            <nav className="flex-1 space-y-2">
              {allFeatures.filter(f =>
                coreFeatureKeys.includes(f.key) || features[f.key]
              ).map(f => (
                <button
                  key={f.key}
                  className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 w-full text-left ${activeTab === f.key ? 'bg-gray-100 font-semibold' : ''}`}
                  onClick={() => setActiveTab(f.key)}
                >
                  <f.icon className="h-5 w-5" />
                  <span>{f.label}</span>
                </button>
              ))}
            </nav>
          </aside>
          {/* Main Content */}
          <main className="flex-1 pl-8">
            {/* Quick Actions */}
            <div className="mb-6 flex gap-4">
              {isAdmin && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/90" onClick={() => setActiveTab('members')}>
                  <Plus className="h-4 w-4" />
                  {t('members.actions.addMember')}
                </button>
              )}
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700" onClick={() => setActiveTab('events')}>
                <Calendar className="h-4 w-4" />
                {t('events.addEvent')}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700" onClick={() => setActiveTab('financial')}>
                <DollarSign className="h-4 w-4" />
                {t('financial.recordDonation')}
              </button>
            </div>
            <DashboardProvider>
              {activeTab === 'members' && <MemberManagement />}
              {activeTab === 'events' && <EventsManager />}
              {activeTab === 'financial' && <FinancialDashboard />}
              {activeTab === 'departments' && <DepartmentHub />}
              {activeTab === 'streaming' && <LiveStreamingPlatform />}
              {activeTab === 'pastoral' && <PastoralCareDashboard />}
              {activeTab === 'outreach' && <CommunityOutreach />}
              {activeTab === 'resources' && <ResourceLibrary />}
              {activeTab === 'ai' && <AIAssistantHub />}
            </DashboardProvider>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}