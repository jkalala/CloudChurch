/**
 * Common animation variants for use with Framer Motion
 */

export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

export const slideUpVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 },
};

export const slideDownVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

export const slideLeftVariants = {
  hidden: { x: 20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: -20, opacity: 0 },
};

export const slideRightVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

export const scaleVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

export const rotateVariants = {
  hidden: { rotate: -5, opacity: 0 },
  visible: { rotate: 0, opacity: 1 },
  exit: { rotate: 5, opacity: 0 },
};

export const popVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 15 }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2 }
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 }
  },
};

export const getTransitionProps = (
  duration: number = 0.3, 
  delay: number = 0
) => ({
  transition: {
    duration,
    delay,
    ease: [0.25, 0.1, 0.25, 1.0], // Cubic bezier curve for natural motion
  }
});

export const getStaggerProps = (
  staggerDelay: number = 0.05,
  childrenDelay: number = 0
) => ({
  transition: {
    staggerChildren: staggerDelay,
    delayChildren: childrenDelay,
  }
});

export default {
  fadeVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleVariants,
  rotateVariants,
  popVariants,
  staggerContainer,
  pageTransition,
  getTransitionProps,
  getStaggerProps,
};