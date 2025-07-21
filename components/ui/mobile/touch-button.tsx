'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { useGestureDetection } from '@/hooks/use-gesture-detection';
import { useAnimationContext } from '@/lib/contexts/animation-context';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface TouchButtonProps extends ButtonProps {
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  touchFeedback?: boolean;
  rippleEffect?: boolean;
}

/**
 * A touch-friendly button component with enhanced mobile interactions
 */
export function TouchButton({
  children,
  onLongPress,
  onDoubleTap,
  touchFeedback = true,
  rippleEffect = true,
  className,
  onClick,
  ...props
}: TouchButtonProps) {
  const isMobile = useIsMobile();
  const { getAdjustedDuration } = useAnimationContext();
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Handle gestures
  const { ref } = useGestureDetection({
    onTap: (event) => {
      if (onClick) {
        onClick(event as any);
      }
      
      if (rippleEffect && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const touch = event.touches[0] || event.changedTouches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        const id = Date.now();
        setRipples(prev => [...prev, { id, x, y }]);
        
        // Remove ripple after animation completes
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== id));
        }, 1000);
      }
    },
    onLongPress: onLongPress ? (event) => {
      onLongPress();
    } : undefined,
    onDoubleTap: onDoubleTap ? (event) => {
      onDoubleTap();
    } : undefined
  }, {
    preventDefaultTouchEvents: false
  });

  // Combine refs
  const combinedRef = (element: HTMLButtonElement | null) => {
    buttonRef.current = element;
    ref(element);
  };

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    tap: { scale: 0.95, transition: { duration: getAdjustedDuration(0.1) } },
    hover: { scale: 1.02, transition: { duration: getAdjustedDuration(0.2) } }
  };

  return (
    <motion.div
      className="relative inline-block"
      variants={buttonVariants}
      initial="initial"
      whileTap={touchFeedback ? "tap" : undefined}
      whileHover={touchFeedback && !isMobile ? "hover" : undefined}
    >
      <Button
        ref={combinedRef as any}
        className={cn("relative overflow-hidden", className)}
        onClick={isMobile ? undefined : onClick} // On mobile, we use the tap gesture
        {...props}
      >
        {children}
        
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <span
            key={ripple.id}
            className="absolute rounded-full bg-white bg-opacity-30 animate-ripple"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
        ))}
      </Button>
    </motion.div>
  );
}

export default TouchButton;