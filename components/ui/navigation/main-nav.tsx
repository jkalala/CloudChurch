'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  isActive?: boolean;
  children?: NavItem[];
}

interface MainNavProps {
  className?: string;
}

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { getAdjustedDuration } = useAnimationContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  // Define navigation items
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <Home className="h-5 w-5" />,
      description: 'Overview of your church activities',
      isActive: pathname === '/dashboard',
    },
    {
      title: 'Members',
      href: '/members',
      icon: <Users className="h-5 w-5" />,
      description: 'Manage church members',
      isActive: pathname === '/members',
    },
    {
      title: 'Events',
      href: '/events',
      icon: <Calendar className="h-5 w-5" />,
      description: 'Schedule and manage events',
      isActive: pathname === '/events',
    },
    {
      title: 'Ministry',
      href: '#',
      icon: <BookOpen className="h-5 w-5" />,
      description: 'Ministry tools and resources',
      children: [
        {
          title: 'Music Ministry',
          href: '/music',
          icon: <Music className="h-5 w-5" />,
          isActive: pathname === '/music',
        },
        {
          title: 'Live Streaming',
          href: '/streaming',
          icon: <Video className="h-5 w-5" />,
          isActive: pathname === '/streaming',
        },
        {
          title: 'Pastoral Care',
          href: '/pastoral-care',
          icon: <Heart className="h-5 w-5" />,
          isActive: pathname === '/pastoral-care',
        },
      ],
    },
    {
      title: 'Communication',
      href: '/communication',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Communication tools',
      isActive: pathname === '/communication',
    },
    {
      title: 'Finances',
      href: '/finances',
      icon: <DollarSign className="h-5 w-5" />,
      description: 'Financial management',
      isActive: pathname === '/finances',
    },
  ];

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle group click in mobile menu
  const handleGroupClick = (title: string) => {
    setActiveGroup(activeGroup === title ? null : title);
  };

  // Desktop navigation
  const desktopNav = (
    <nav className={cn('hidden md:flex items-center space-x-4', className)}>
      {navItems.map((item) => {
        // If item has children, render a dropdown
        if (item.children) {
          return (
            <div key={item.title} className="relative group">
              <button
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                  item.children.some(child => child.isActive) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </button>
              
              <div className="absolute left-0 mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1 bg-popover border rounded-md shadow-lg">
                  {item.children.map((child) => (
                    <Link
                      key={child.title}
                      href={child.href}
                      className={cn(
                        'block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                        child.isActive ? 'bg-accent/50 text-accent-foreground' : 'text-muted-foreground'
                      )}
                    >
                      <div className="flex items-center">
                        {child.icon}
                        <span className="ml-2">{child.title}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        
        // Regular nav item
        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              'flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
              item.isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            )}
          >
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );

  // Mobile navigation toggle
  const mobileNavToggle = (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>
    </div>
  );

  // Mobile navigation menu
  const mobileNav = (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{
        opacity: mobileMenuOpen ? 1 : 0,
        height: mobileMenuOpen ? 'auto' : 0,
      }}
      transition={{ duration: getAdjustedDuration(0.2) }}
      className="md:hidden overflow-hidden"
    >
      <div className="px-2 pt-2 pb-3 space-y-1 bg-background border-b">
        {navItems.map((item) => {
          // If item has children, render an accordion-like item
          if (item.children) {
            const isGroupActive = activeGroup === item.title;
            
            return (
              <div key={item.title} className="space-y-1">
                <button
                  onClick={() => handleGroupClick(item.title)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 text-base font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                    item.children.some(child => child.isActive) ? 'bg-accent/50 text-accent-foreground' : 'text-muted-foreground'
                  )}
                >
                  <div className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-transform",
                    isGroupActive ? "transform rotate-90" : ""
                  )} />
                </button>
                
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: isGroupActive ? 1 : 0,
                    height: isGroupActive ? 'auto' : 0,
                  }}
                  transition={{ duration: getAdjustedDuration(0.2) }}
                  className="overflow-hidden"
                >
                  <div className="pl-6 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.title}
                        href={child.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                          child.isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {child.icon}
                        <span className="ml-2">{child.title}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            );
          }
          
          // Regular nav item
          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-base font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors',
                item.isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
              )}
            >
              {item.icon}
              <span className="ml-2">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center justify-between">
        {desktopNav}
        {mobileNavToggle}
      </div>
      {mobileNav}
    </div>
  );
}

export default MainNav;