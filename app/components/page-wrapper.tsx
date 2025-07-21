'use client';

import React from 'react';
import { PageTransition } from '@/components/ui/transitions/page-transition';
import { useAnimationContext } from '@/lib/contexts/animation-context';

interface PageWrapperProps {
  children: React.ReactNode;
  mode?: 'fade' | 'slide' | 'scale' | 'none';
  direction?: 'left' | 'right' | 'up' | 'down';
}

/**
 * Page wrapper component that applies transitions to pages
 * Use this component in page layouts to add smooth transitions
 */
export function PageWrapper({
  children,
  mode = 'fade',
  direction = 'up',
}: PageWrapperProps) {
  const { preference, getAdjustedDuration } = useAnimationContext();
  
  // If animations are disabled, don't apply transitions
  if (preference === 'none') {
    return <>{children}</>;
  }

  // Calculate duration based on user preference
  const duration = getAdjustedDuration(0.3);

  return (
    <PageTransition mode={mode} direction={direction} duration={duration}>
      {children}
    </PageTransition>
  );
}

export default PageWrapper;