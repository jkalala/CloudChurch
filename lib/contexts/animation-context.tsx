'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useAnimationPreferences } from '@/hooks/use-animation-preferences';

export type AnimationPreference = 'full' | 'reduced' | 'none';

interface AnimationContextType {
  preference: AnimationPreference;
  duration: number;
  setPreference: (preference: AnimationPreference) => void;
  setDuration: (duration: number) => void;
  isAnimationEnabled: () => boolean;
  getAdjustedDuration: (baseDuration: number) => number;
  loading: boolean;
}

const defaultContext: AnimationContextType = {
  preference: 'full',
  duration: 0.3,
  setPreference: () => {},
  setDuration: () => {},
  isAnimationEnabled: () => true,
  getAdjustedDuration: (baseDuration) => baseDuration,
  loading: false,
};

const AnimationContext = createContext<AnimationContextType>(defaultContext);

export const useAnimationContext = () => useContext(AnimationContext);

interface AnimationProviderProps {
  children: React.ReactNode;
}

export function AnimationProvider({
  children,
}: AnimationProviderProps) {
  const { 
    preferences, 
    loading, 
    setPreference: savePreference, 
    setDuration: saveDuration 
  } = useAnimationPreferences();

  const { preference, duration } = preferences;

  const isAnimationEnabled = useCallback(() => {
    return preference !== 'none';
  }, [preference]);

  const getAdjustedDuration = useCallback(
    (baseDuration: number) => {
      switch (preference) {
        case 'full':
          return baseDuration;
        case 'reduced':
          return baseDuration * 0.5;
        case 'none':
          return 0;
        default:
          return baseDuration;
      }
    },
    [preference]
  );

  const value = {
    preference,
    duration,
    setPreference: savePreference,
    setDuration: saveDuration,
    isAnimationEnabled,
    getAdjustedDuration,
    loading,
  };

  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
}

export default AnimationProvider;