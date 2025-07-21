'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useGestureDetection, SwipeDirection } from '@/hooks/use-gesture-detection';
import { useAnimationContext } from '@/lib/contexts/animation-context';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';

interface TouchCardProps {
  title: string;
  children: React.ReactNode;
  onSwipe?: (direction: SwipeDirection) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  className?: string;
}

/**
 * A touch-friendly card component that supports various gestures
 */
export function TouchCard({
  title,
  children,
  onSwipe,
  onTap,
  onDoubleTap,
  onLongPress,
  className = '',
}: TouchCardProps) {
  const isMobile = useIsMobile();
  const { getAdjustedDuration } = useAnimationContext();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [animation, setAnimation] = useState<string | null>(null);

  // Handle gestures
  const { gestureState, ref } = useGestureDetection({
    onSwipe: (direction, event) => {
      setFeedback(`Swiped ${direction}`);
      setAnimation(`swipe-${direction}`);
      onSwipe?.(direction);
      
      // Clear feedback after 1 second
      setTimeout(() => {
        setFeedback(null);
        setAnimation(null);
      }, 1000);
    },
    onTap: (event) => {
      setFeedback('Tapped');
      setAnimation('tap');
      onTap?.();
      
      setTimeout(() => {
        setFeedback(null);
        setAnimation(null);
      }, 500);
    },
    onDoubleTap: (event) => {
      setFeedback('Double tapped');
      setAnimation('double-tap');
      onDoubleTap?.();
      
      setTimeout(() => {
        setFeedback(null);
        setAnimation(null);
      }, 500);
    },
    onLongPress: (event) => {
      setFeedback('Long pressed');
      setAnimation('long-press');
      onLongPress?.();
      
      setTimeout(() => {
        setFeedback(null);
        setAnimation(null);
      }, 500);
    }
  }, {
    swipeThreshold: 30,
    longPressDelay: 500,
    preventDefaultTouchEvents: false
  });

  // Animation variants
  const variants = {
    initial: { scale: 1 },
    tap: { scale: 0.95, transition: { duration: getAdjustedDuration(0.2) } },
    'double-tap': { scale: 0.9, transition: { duration: getAdjustedDuration(0.2) } },
    'long-press': { scale: 0.9, backgroundColor: '#f0f0f0', transition: { duration: getAdjustedDuration(0.3) } },
    'swipe-left': { x: -20, transition: { duration: getAdjustedDuration(0.3) } },
    'swipe-right': { x: 20, transition: { duration: getAdjustedDuration(0.3) } },
    'swipe-up': { y: -20, transition: { duration: getAdjustedDuration(0.3) } },
    'swipe-down': { y: 20, transition: { duration: getAdjustedDuration(0.3) } },
  };

  return (
    <motion.div
      ref={ref as any}
      className={`touch-card ${className}`}
      variants={variants}
      animate={animation || 'initial'}
      initial="initial"
      whileTap={isMobile ? undefined : "tap"}
    >
      <Card className="w-full h-full relative overflow-hidden">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        {feedback && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-sm">
            {feedback}
          </div>
        )}
        <CardFooter className="text-sm text-muted-foreground">
          {isMobile ? 'Try swiping, tapping, double-tapping, or long-pressing' : 'Touch gestures available on mobile devices'}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default TouchCard;