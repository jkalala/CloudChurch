'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { MainNav } from './main-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAnimationContext } from '@/lib/contexts/animation-context';
import { useAuth } from '@/components/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TouchButton } from '@/components/ui/mobile/touch-button';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon,
  User,
  Settings,
  LogOut,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { getAdjustedDuration } = useAnimationContext();
  const { user, userProfile, signOut } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Get user initials for avatar
  const getInitials = (name: string = 'User') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };
  
  // Search component
  const searchComponent = (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: '100%' }}
          exit={{ opacity: 0, width: 0 }}
          transition={{ duration: getAdjustedDuration(0.2) }}
          className="relative"
        >
          <Input
            placeholder="Search..."
            className="w-full pr-8"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            onClick={() => setSearchOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <header className={cn('sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60', className)}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
              <span className="text-primary-foreground font-bold">C</span>
            </div>
            {!isMobile && (
              <span className="font-bold text-xl">Connectus</span>
            )}
          </Link>
          
          {/* Main Navigation */}
          <MainNav />
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search */}
          {!searchOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          {searchComponent}
          
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hidden sm:flex"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">3</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {[
                  { title: 'New prayer request', description: 'Sarah Johnson submitted a new prayer request', time: '5 minutes ago' },
                  { title: 'Event reminder', description: 'Sunday service starts in 2 hours', time: '2 hours ago' },
                  { title: 'New member', description: 'Emily Rodriguez joined the church', time: '1 day ago' }
                ].map((notification, index) => (
                  <DropdownMenuItem key={index} className="cursor-pointer p-0">
                    <div className="flex flex-col w-full p-3 hover:bg-accent rounded-md">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-muted-foreground">{notification.description}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer justify-center font-medium">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {isMobile ? (
                <TouchButton variant="ghost" size="icon">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.avatar_url || ''} />
                    <AvatarFallback>{getInitials(userProfile?.full_name)}</AvatarFallback>
                  </Avatar>
                </TouchButton>
              ) : (
                <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userProfile?.avatar_url || ''} />
                    <AvatarFallback>{getInitials(userProfile?.full_name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{userProfile?.full_name || 'User'}</span>
                    <span className="text-xs text-muted-foreground">{userProfile?.role || 'Member'}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => signOut?.()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;