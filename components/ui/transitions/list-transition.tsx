'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ListTransitionProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  duration?: number;
  type?: 'fade' | 'slide' | 'scale';
  direction?: 'left' | 'right' | 'up' | 'down';
  className?: string;
  itemClassName?: string;
}

/**
 * List transition component for animating lists with staggered animations
 */
export function ListTransition({
  children,
  staggerDelay = 0.05,
  duration = 0.3,
  type = 'fade',
  direction = 'up',
  className = '',
  itemClassName = '',
}: ListTransitionProps) {
  // Define variants based on transition type
  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const getItemVariants = () => {
    switch (type) {
      case 'slide':
        return {
          hidden: { 
            x: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
            y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
            opacity: 0 
          },
          show: { 
            x: 0, 
            y: 0, 
            opacity: 1,
            transition: { duration }
          },
        };
      case 'scale':
        return {
          hidden: { scale: 0.8, opacity: 0 },
          show: { 
            scale: 1, 
            opacity: 1,
            transition: { duration }
          },
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          show: { 
            opacity: 1,
            transition: { duration }
          },
        };
    }
  };

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            className={itemClassName}
            variants={getItemVariants()}
            exit={{ opacity: 0, transition: { duration: duration / 2 } }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export default ListTransition;