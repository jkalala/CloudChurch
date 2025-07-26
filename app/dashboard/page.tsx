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
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Line, Bar } from 'react-chartjs-2';
import 'chart.js/auto';

export const themeColor = "#000000";
export const viewport = "width=device-width, initial-scale=1, maximum-scale=1";

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
  const { language, userProfile } = useAuth();
  const { t } = useTranslation(language);
  const isAdmin = true;
  const userName = userProfile?.first_name || "Leader";

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

  // Example stats (replace with real data as needed)
  const stats = [
    { label: 'Members', value: 320, icon: Users, color: 'bg-blue-500', text: 'text-blue-500' },
    { label: 'Events', value: 24, icon: Calendar, color: 'bg-green-500', text: 'text-green-500' },
    { label: 'Donations', value: '$12,400', icon: DollarSign, color: 'bg-yellow-500', text: 'text-yellow-500' },
  ];

  // Example data for widgets/charts (replace with real data)
  const attendanceTrend = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Attendance",
        data: [120, 135, 150, 170, 160, 180, 200],
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };
  const memberGrowth = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "New Members",
        data: [10, 12, 15, 18, 14, 20, 22],
        backgroundColor: "#10b981",
      },
    ],
  };
  const upcomingEvents = [
    { title: "Sunday Service", date: "2024-07-28", time: "10:00 AM" },
    { title: "Youth Fellowship", date: "2024-07-30", time: "6:00 PM" },
    { title: "Choir Practice", date: "2024-08-01", time: "7:00 PM" },
  ];
  const recentDonations = [
    { name: "Jane Doe", amount: "$100", date: "2024-07-20" },
    { name: "John Smith", amount: "$50", date: "2024-07-19" },
    { name: "Mary Johnson", amount: "$200", date: "2024-07-18" },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-blue-900 transition-colors duration-500">
        <Header />
        <div className="flex-1 container mx-auto py-8">
          {/* Dashboard Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2 animate-fade-in">Welcome, {userName}!</h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Here’s a snapshot of your church’s activity and quick access to everything you need.</p>
            </div>
            <div className="flex gap-4">
              {stats.map(stat => (
                <Card key={stat.label} className="shadow-lg rounded-xl px-6 py-4 flex items-center gap-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-0">
                  <div className={`rounded-full p-3 ${stat.color} bg-opacity-20`}>
                    <stat.icon className={`h-7 w-7 ${stat.text}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-gray-500 dark:text-gray-300 text-sm font-medium">{stat.label}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex rounded-2xl shadow-xl overflow-hidden bg-white/70 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-800">
            {/* Sidebar */}
            <aside className="w-60 min-h-[60vh] p-6 bg-gradient-to-b from-white/80 to-blue-50 dark:from-gray-900/80 dark:to-blue-950 border-r border-gray-200 dark:border-gray-800 flex flex-col gap-2">
              <nav className="flex-1 space-y-1">
                {allFeatures.filter(f => coreFeatureKeys.includes(f.key) || features[f.key]).map(f => (
                  <Tooltip key={f.key}>
                    <TooltipTrigger asChild>
                      <button
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors w-full text-left font-semibold hover:bg-blue-100/60 dark:hover:bg-blue-900/40 ${activeTab === f.key ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 shadow' : 'text-gray-700 dark:text-gray-200'}`}
                        onClick={() => setActiveTab(f.key)}
                      >
                        <f.icon className="h-5 w-5" />
                        <span>{f.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{f.label}</TooltipContent>
                  </Tooltip>
                ))}
              </nav>
            </aside>
            {/* Main Content */}
            <main className="flex-1 p-8 animate-fade-in">
              {/* Quick Actions */}
              <div className="mb-8 flex flex-wrap gap-4">
                {isAdmin && (
                  <button className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-lg shadow hover:bg-primary/90 transition-colors" onClick={() => setActiveTab('members')}>
                    <Plus className="h-5 w-5" />
                    {t('members.actions.addMember')}
                  </button>
                )}
                <Link href="/checkin/kiosk" className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors">
                  <MapPin className="h-5 w-5" />
                  Check-In
                </Link>
                <button className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors" onClick={() => setActiveTab('events')}>
                  <Calendar className="h-5 w-5" />
                  {t('events.addEvent')}
                </button>
                <button className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition-colors" onClick={() => setActiveTab('financial')}>
                  <DollarSign className="h-5 w-5" />
                  {t('financial.recordDonation')}
                </button>
              </div>
              {/* Dashboard Widgets & Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {/* Attendance Trend */}
                <Card className="col-span-2 shadow-lg rounded-xl bg-white/80 dark:bg-gray-900/80">
                  <CardContent className="p-4">
                    <div className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Attendance Trend</div>
                    <div style={{ height: 180 }}>
                      <Line data={attendanceTrend} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }} />
                    </div>
                  </CardContent>
                </Card>
                {/* Member Growth */}
                <Card className="shadow-lg rounded-xl bg-white/80 dark:bg-gray-900/80">
                  <CardContent className="p-4">
                    <div className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Member Growth</div>
                    <div style={{ height: 180 }}>
                      <Bar data={memberGrowth} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: false }} />
                    </div>
                  </CardContent>
                </Card>
                {/* Upcoming Events */}
                <Card className="shadow-lg rounded-xl bg-white/80 dark:bg-gray-900/80">
                  <CardContent className="p-6">
                    <div className="font-semibold text-lg mb-2 text-gray-700 dark:text-gray-200">Upcoming Events</div>
                    <ul className="space-y-2">
                      {upcomingEvents.map(ev => (
                        <li key={ev.title + ev.date} className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{ev.title}</span>
                          <span className="text-xs text-gray-500 ml-auto">{ev.date} {ev.time}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              {/* Main dashboard content */}
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
    </TooltipProvider>
  );
}