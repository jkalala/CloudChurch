'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransition, TransitionType } from '../../../hooks/use-transition';

interface ComponentTransitionProps {
  children: React.ReactNode;
  show?: boolean;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  custom?: Record<string, any>;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
}

/**
 * Component transition wrapper for animating components
 */
export function ComponentTransition({
  children,
  show = true,
  type = 'fade',
  duration = 0.3,
  delay = 0,
  direction = 'down',
  className = '',
  custom = {},
  onEnter,
  onEntered,
  onExit,
  onExited,
}: ComponentTransitionProps) {
  const { isVisible, getMotionProps } = useTransition(show, {
    type,
    duration,
    delay,
    direction,
    custom,
    onEnter,
    onEntered,
    onExit,
    onExited,
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div className={className} {...getMotionProps()}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ComponentTransition;