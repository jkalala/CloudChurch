'use client';

import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useGestureDetection, SwipeDirection } from '@/hooks/use-gesture-detection';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimationContext } from '@/lib/contexts/animation-context';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * A responsive layout component optimized for mobile devices
 * Features:
 * - Swipe to open/close sidebar
 * - Touch-friendly navigation
 * - Optimized spacing for mobile screens
 */
export function MobileOptimizedLayout({
  children,
  sidebar,
  header,
  footer,
  className = '',
}: MobileOptimizedLayoutProps) {
  const isMobile = useIsMobile();
  const { getAdjustedDuration } = useAnimationContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Close sidebar when switching to desktop
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  // Handle gestures for the main content area
  const { ref: contentRef } = useGestureDetection({
    onSwipe: (direction) => {
      if (isMobile) {
        if (direction === 'right' && !sidebarOpen) {
          setSidebarOpen(true);
        } else if (direction === 'left' && sidebarOpen) {
          setSidebarOpen(false);
        }
      }
    }
  });

  // Handle gestures for the sidebar
  const { ref: sidebarRef } = useGestureDetection({
    onSwipe: (direction) => {
      if (isMobile && direction === 'left') {
        setSidebarOpen(false);
      }
    }
  });

  // Animation variants
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: getAdjustedDuration(0.3)
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        duration: getAdjustedDuration(0.3)
      }
    }
  };

  const overlayVariants = {
    open: {
      opacity: 0.5,
      display: 'block',
      transition: {
        duration: getAdjustedDuration(0.2)
      }
    },
    closed: {
      opacity: 0,
      transitionEnd: {
        display: 'none'
      },
      transition: {
        duration: getAdjustedDuration(0.2)
      }
    }
  };

  return (
    <div className={`mobile-optimized-layout relative h-full w-full ${className}`}>
      {/* Header */}
      {header && (
        <div className="mobile-header sticky top-0 z-10 bg-background border-b">
          <div className="flex items-center p-4">
            {isMobile && sidebar && (
              <Button
                variant="ghost"
                size="icon"
                className="mr-2"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1">{header}</div>
          </div>
        </div>
      )}

      <div className="mobile-layout-container flex relative h-[calc(100%-4rem)]">
        {/* Sidebar for desktop */}
        {sidebar && !isMobile && (
          <div className="desktop-sidebar w-64 border-r p-4 overflow-y-auto">
            {sidebar}
          </div>
        )}

        {/* Mobile sidebar with animation */}
        {sidebar && isMobile && (
          <>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  className="fixed inset-0 bg-black z-20"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={overlayVariants}
                  onClick={() => setSidebarOpen(false)}
                />
              )}
            </AnimatePresence>

            <motion.div
              ref={sidebarRef as any}
              className="mobile-sidebar fixed top-0 left-0 h-full w-3/4 max-w-xs bg-background z-30 border-r shadow-lg pt-16 overflow-y-auto"
              initial="closed"
              animate={sidebarOpen ? 'open' : 'closed'}
              variants={sidebarVariants}
            >
              <div className="p-4">
                {sidebar}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={() => setSidebarOpen(false)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </motion.div>
          </>
        )}

        {/* Main content */}
        <div
          ref={contentRef as any}
          className={`mobile-content flex-1 overflow-y-auto p-4 ${isMobile ? 'pb-20' : ''}`}
        >
          {children}
        </div>
      </div>

      {/* Footer */}
      {footer && (
        <div className="mobile-footer fixed bottom-0 left-0 right-0 bg-background border-t z-10">
          <div className="p-4">
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}

export default MobileOptimizedLayout;