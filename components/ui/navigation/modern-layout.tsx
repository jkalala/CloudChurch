'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Footer } from './footer';
import { MobileNav } from './mobile-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileOptimizedLayout } from '@/components/ui/mobile/mobile-optimized-layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from '@/lib/contexts/animation-context';
import { 
  Home, 
  Users, 
  Calendar, 
  BookOpen, 
  Music, 
  Video, 
  Heart, 
  MessageSquare, 
  DollarSign,
  Settings,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

interface ModernLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
  minimalFooter?: boolean;
  showMobileNav?: boolean;
  sidebar?: React.ReactNode;
  className?: string;
}

export function ModernLayout({
  children,
  showFooter = true,
  minimalFooter = false,
  showMobileNav = true,
  sidebar,
  className,
}: ModernLayoutProps) {
  const isMobile = useIsMobile();
  const { getAdjustedDuration } = useAnimationContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Default sidebar content if none provided
  const defaultSidebar = (
    <div className="flex flex-col gap-4 p-4">
      <h3 className="font-medium text-lg">Navigation</h3>
      <div className="space-y-1">
        {[
          { title: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
          { title: 'Members', href: '/members', icon: <Users className="h-5 w-5" /> },
          { title: 'Events', href: '/events', icon: <Calendar className="h-5 w-5" /> },
          { title: 'Music Ministry', href: '/music', icon: <Music className="h-5 w-5" /> },
          { title: 'Live Streaming', href: '/streaming', icon: <Video className="h-5 w-5" /> },
          { title: 'Pastoral Care', href: '/pastoral-care', icon: <Heart className="h-5 w-5" /> },
          { title: 'Communication', href: '/communication', icon: <MessageSquare className="h-5 w-5" /> },
          { title: 'Finances', href: '/finances', icon: <DollarSign className="h-5 w-5" /> },
          { title: 'Settings', href: '/settings', icon: <Settings className="h-5 w-5" /> },
        ].map((item, index) => (
          <a
            key={index}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {item.icon}
            <span>{item.title}</span>
          </a>
        ))}
      </div>
    </div>
  );

  // For mobile devices, use MobileOptimizedLayout
  if (isMobile) {
    return (
      <div className={cn('min-h-screen flex flex-col', className)}>
        <Header />
        <MobileOptimizedLayout
          sidebar={sidebar || defaultSidebar}
          header={null} // Header is already included above
          footer={null} // Footer is handled separately
          className="flex-1"
        >
          <main className="flex-1 pb-20">
            {children}
          </main>
        </MobileOptimizedLayout>
        {showMobileNav && <MobileNav />}
        {showFooter && <Footer minimal={minimalFooter || true} />}
      </div>
    );
  }

  // For desktop devices
  return (
    <div className={cn('min-h-screen flex flex-col', className)}>
      <Header />
      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        {sidebar && (
          <aside className="hidden md:block w-64 border-r p-4 overflow-y-auto">
            {sidebar}
          </aside>
        )}
        
        {/* Main content */}
        <main className={cn('flex-1', sidebar ? 'md:ml-64' : '')}>
          <div className="container py-6">
            {children}
          </div>
        </main>
      </div>
      {showFooter && <Footer minimal={minimalFooter} />}
    </div>
  );
}

export default ModernLayout;