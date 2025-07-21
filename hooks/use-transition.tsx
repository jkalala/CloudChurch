'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';
export type TransitionType = 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';

export interface TransitionOptions {
  type?: TransitionType;
  duration?: number;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  custom?: Record<string, any>;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
}

export interface UseTransitionResult {
  state: TransitionState;
  isVisible: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  getMotionProps: () => Record<string, any>;
}

/**
 * Custom hook for managing transitions and animations
 * 
 * @param initialVisible - Whether the element should be initially visible
 * @param options - Transition options
 * @returns Transition state and control functions
 */
export function useTransition(
  initialVisible = false,
  options: TransitionOptions = {}
): UseTransitionResult {
  const {
    type = 'fade',
    duration = 0.3,
    delay = 0,
    direction = 'down',
    custom = {},
    onEnter,
    onEntered,
    onExit,
    onExited,
  } = options;

  const [isVisible, setIsVisible] = useState(initialVisible);
  const [state, setState] = useState<TransitionState>(
    initialVisible ? 'entered' : 'exited'
  );

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isVisible && state === 'exited') {
      setState('entering');
      onEnter?.();
      
      timeoutId = setTimeout(() => {
        setState('entered');
        onEntered?.();
      }, duration * 1000);
    } else if (!isVisible && state === 'entered') {
      setState('exiting');
      onExit?.();
      
      timeoutId = setTimeout(() => {
        setState('exited');
        onExited?.();
      }, duration * 1000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, state, duration, onEnter, onEntered, onExit, onExited]);

  const show = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hide = useCallback(() => {
    setIsVisible(false);
  }, []);

  const toggle = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const getMotionProps = useCallback(() => {
    const baseProps = {
      initial: 'initial',
      animate: isVisible ? 'animate' : 'exit',
      exit: 'exit',
      transition: {
        duration,
        delay,
        ...custom.transition,
      },
    };

    // Define variants based on transition type
    const variants = {
      fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      slide: {
        initial: { 
          x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
          y: direction === 'up' ? -50 : direction === 'down' ? 50 : 0,
          opacity: 0 
        },
        animate: { x: 0, y: 0, opacity: 1 },
        exit: { 
          x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
          y: direction === 'up' ? -50 : direction === 'down' ? 50 : 0,
          opacity: 0 
        },
      },
      scale: {
        initial: { scale: 0.9, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 0.9, opacity: 0 },
      },
      rotate: {
        initial: { rotate: -10, opacity: 0 },
        animate: { rotate: 0, opacity: 1 },
        exit: { rotate: 10, opacity: 0 },
      },
      custom: custom.variants || {},
    };

    return {
      ...baseProps,
      variants: variants[type],
    };
  }, [isVisible, type, duration, delay, direction, custom]);

  return {
    state,
    isVisible,
    show,
    hide,
    toggle,
    getMotionProps,
  };
}

export default useTransition;