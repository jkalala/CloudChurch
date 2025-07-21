'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  mode?: 'fade' | 'slide' | 'scale' | 'none';
  direction?: 'left' | 'right' | 'up' | 'down';
  duration?: number;
}

/**
 * Page transition component for smooth transitions between pages
 */
export function PageTransition({
  children,
  mode = 'fade',
  direction = 'up',
  duration = 0.3,
}: PageTransitionProps) {
  const pathname = usePathname();
  const [renderKey, setRenderKey] = useState(pathname);

  useEffect(() => {
    setRenderKey(pathname);
  }, [pathname]);

  // Define variants based on transition mode
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slide: {
      initial: { 
        x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
        opacity: 0 
      },
      animate: { x: 0, y: 0, opacity: 1 },
      exit: { 
        x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
        y: direction === 'up' ? -50 : direction === 'down' ? 50 : 0,
        opacity: 0 
      },
    },
    scale: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.95, opacity: 0 },
    },
    none: {
      initial: {},
      animate: {},
      exit: {},
    },
  };

  if (mode === 'none') {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={renderKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants[mode]}
        transition={{ duration }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default PageTransition;