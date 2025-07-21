'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TouchButton } from '@/components/ui/mobile/touch-button';
import { useAnimationContext } from '@/lib/contexts/animation-context';
import { 
  Home, 
  Users, 
  Calendar, 
  Menu,
  MessageSquare,
  Bell,
  Search,
  Grid,
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MobileNavProps {
  className?: string;
  onOpenSidebar?: () => void;
}

export function MobileNav({ className, onOpenSidebar }: MobileNavProps) {
  const pathname = usePathname();
  const { getAdjustedDuration } = useAnimationContext();
  const [hasNotifications, setHasNotifications] = useState(true);
  
  // Define navigation items
  const navItems = [
    {
      title: 'Home',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      isActive: pathname === '/dashboard',
    },
    {
      title: 'Members',
      href: '/members',
      icon: <Users className="h-5 w-5" />,
      isActive: pathname === '/members',
    },
    {
      title: 'Events',
      href: '/events',
      icon: <Calendar className="h-5 w-5" />,
      isActive: pathname === '/events',
    },
    {
      title: 'Messages',
      href: '/messages',
      icon: <MessageSquare className="h-5 w-5" />,
      isActive: pathname === '/messages',
      badge: 2,
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: <User className="h-5 w-5" />,
      isActive: pathname === '/profile',
    },
  ];

  return (
    <div className={cn('fixed bottom-0 left-0 right-0 border-t bg-background z-50 pb-safe-area', className)}>
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link key={item.title} href={item.href} className="flex-1">
            <TouchButton
              variant="ghost"
              className={cn(
                'w-full h-full flex flex-col items-center justify-center rounded-none',
                item.isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              rippleEffect={item.isActive}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <Badge className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center p-0 text-[10px]">
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span className="text-[10px] mt-1">{item.title}</span>
              {item.isActive && (
                <motion.div
                  className="absolute bottom-0 w-1/2 h-0.5 bg-primary rounded-full"
                  layoutId="activeTab"
                  transition={{ duration: getAdjustedDuration(0.2) }}
                />
              )}
            </TouchButton>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default MobileNav;