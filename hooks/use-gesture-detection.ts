'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

export type GestureType = 'swipe' | 'pinch' | 'tap' | 'longPress' | 'rotate';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';
export type PinchType = 'in' | 'out';

export interface GestureOptions {
  swipeThreshold?: number;
  longPressDelay?: number;
  pinchThreshold?: number;
  rotateThreshold?: number;
  doubleTapDelay?: number;
  preventDefaultTouchEvents?: boolean;
}

export interface GestureHandlers {
  onSwipe?: (direction: SwipeDirection, event: TouchEvent) => void;
  onPinch?: (scale: number, type: PinchType, event: TouchEvent) => void;
  onTap?: (event: TouchEvent) => void;
  onDoubleTap?: (event: TouchEvent) => void;
  onLongPress?: (event: TouchEvent) => void;
  onRotate?: (angle: number, event: TouchEvent) => void;
}

export interface GestureState {
  isSwiping: boolean;
  isPinching: boolean;
  isRotating: boolean;
  isLongPressing: boolean;
  lastSwipeDirection: SwipeDirection | null;
  lastPinchScale: number | null;
  lastRotateAngle: number | null;
}

/**
 * Custom hook for detecting and handling mobile touch gestures
 * 
 * @param elementRef - Reference to the element to attach gesture detection to
 * @param handlers - Object containing gesture handler functions
 * @param options - Configuration options for gesture detection
 * @returns Current gesture state and ref to attach to element
 */
export function useGestureDetection(
  handlers: GestureHandlers = {},
  options: GestureOptions = {}
) {
  const isMobile = useIsMobile();
  const elementRef = useRef<HTMLElement | null>(null);
  
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    pinchThreshold = 0.1,
    rotateThreshold = 15,
    doubleTapDelay = 300,
    preventDefaultTouchEvents = true,
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>({
    isSwiping: false,
    isPinching: false,
    isRotating: false,
    isLongPressing: false,
    lastSwipeDirection: null,
    lastPinchScale: null,
    lastRotateAngle: null,
  });

  // Refs to store touch data
  const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
  const touchesRef = useRef<Touch[]>([]);
  const initialDistanceRef = useRef<number>(0);
  const initialAngleRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Calculate angle between two touch points
  const getAngle = useCallback((touch1: Touch, touch2: Touch): number => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
  }, []);

  // Handle touch start event
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (preventDefaultTouchEvents) {
      event.preventDefault();
    }

    const touch = event.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Store initial touches for multi-touch gestures
    if (event.touches.length === 2) {
      const touches = Array.from(event.touches);
      touchesRef.current = touches;
      initialDistanceRef.current = getDistance(touches[0], touches[1]);
      initialAngleRef.current = getAngle(touches[0], touches[1]);
    }

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      if (handlers.onLongPress) {
        setGestureState(prev => ({ ...prev, isLongPressing: true }));
        handlers.onLongPress(event);
      }
    }, longPressDelay);

  }, [getDistance, getAngle, handlers, longPressDelay, preventDefaultTouchEvents]);

  // Handle touch move event
  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (preventDefaultTouchEvents) {
      event.preventDefault();
    }

    // Clear long press timer if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Handle swipe
    if (distance > swipeThreshold && !gestureState.isSwiping) {
      let direction: SwipeDirection;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      setGestureState(prev => ({ 
        ...prev, 
        isSwiping: true,
        lastSwipeDirection: direction 
      }));

      if (handlers.onSwipe) {
        handlers.onSwipe(direction, event);
      }
    }

    // Handle pinch
    if (event.touches.length === 2) {
      const touches = Array.from(event.touches);
      const currentDistance = getDistance(touches[0], touches[1]);
      const scale = currentDistance / initialDistanceRef.current;
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        const pinchType: PinchType = scale > 1 ? 'out' : 'in';
        
        setGestureState(prev => ({ 
          ...prev, 
          isPinching: true,
          lastPinchScale: scale 
        }));

        if (handlers.onPinch) {
          handlers.onPinch(scale, pinchType, event);
        }
      }

      // Handle rotation
      const currentAngle = getAngle(touches[0], touches[1]);
      const rotation = currentAngle - initialAngleRef.current;
      
      if (Math.abs(rotation) > rotateThreshold) {
        setGestureState(prev => ({ 
          ...prev, 
          isRotating: true,
          lastRotateAngle: rotation 
        }));

        if (handlers.onRotate) {
          handlers.onRotate(rotation, event);
        }
      }
    }
  }, [
    getDistance, 
    getAngle, 
    handlers, 
    swipeThreshold, 
    pinchThreshold, 
    rotateThreshold, 
    gestureState.isSwiping,
    preventDefaultTouchEvents
  ]);

  // Handle touch end event
  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (preventDefaultTouchEvents) {
      event.preventDefault();
    }

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Reset gesture states
    setGestureState(prev => ({
      ...prev,
      isSwiping: false,
      isPinching: false,
      isRotating: false,
      isLongPressing: false,
    }));

    // Handle tap and double tap
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartRef.current.time;
    
    if (touchDuration < 300) {
      if (handlers.onTap) {
        handlers.onTap(event);
      }

      // Check for double tap
      const timeSinceLastTap = touchEndTime - lastTapTimeRef.current;
      if (timeSinceLastTap < doubleTapDelay && handlers.onDoubleTap) {
        handlers.onDoubleTap(event);
      }
      
      lastTapTimeRef.current = touchEndTime;
    }
  }, [handlers, doubleTapDelay, preventDefaultTouchEvents]);

  // Attach and detach event listeners
  useEffect(() => {
    if (!isMobile || !elementRef.current) return;

    const element = elementRef.current;
    
    element.addEventListener('touchstart', handleTouchStart as any);
    element.addEventListener('touchmove', handleTouchMove as any);
    element.addEventListener('touchend', handleTouchEnd as any);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart as any);
      element.removeEventListener('touchmove', handleTouchMove as any);
      element.removeEventListener('touchend', handleTouchEnd as any);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Function to attach ref to an element
  const attachRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  return {
    gestureState,
    ref: attachRef,
  };
}

export default useGestureDetection;