'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { AnimationPreference } from '@/lib/contexts/animation-context';
import { useAuth } from '@/components/auth-provider';

interface AnimationPreferences {
  preference: AnimationPreference;
  duration: number;
}

/**
 * Hook to manage user animation preferences
 * Loads and saves preferences to Supabase
 */
export function useAnimationPreferences() {
  const [preferences, setPreferences] = useState<AnimationPreferences>({
    preference: 'full',
    duration: 0.3,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Use the auth context instead of direct Supabase calls
  const { user, loading: authLoading } = useAuth();

  // Load preferences from Supabase
  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    async function loadPreferences() {
      if (!user) {
        // Use default preferences for unauthenticated users
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // First check if the user has preferences
        const { data, error: selectError } = await supabase
          .from('user_preferences')
          .select('animation_preferences')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to handle no rows case

        if (selectError && selectError.code !== 'PGRST116') {
          // If it's not the "no rows" error, it's a real error
          throw selectError;
        }

        if (data?.animation_preferences) {
          // User has preferences, use them
          setPreferences(data.animation_preferences as AnimationPreferences);
        } else {
          // User doesn't have preferences yet, create a new record
          const defaultPrefs = {
            preference: 'full' as AnimationPreference,
            duration: 0.3
          };
          
          // Insert new preferences
          const { error: insertError } = await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              animation_preferences: defaultPrefs
            });
            
          if (insertError) {
            console.warn('Could not create initial preferences:', insertError);
            // Continue with default preferences in memory
          }
          
          // Keep using default preferences
          setPreferences(defaultPrefs);
        }
      } catch (err) {
        console.error('Error loading animation preferences:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user, authLoading]);

  // Save preferences to Supabase
  const savePreferences = async (newPreferences: Partial<AnimationPreferences>) => {
    if (!user) {
      // Just update local state for unauthenticated users
      setPreferences(prev => ({ ...prev, ...newPreferences }));
      return;
    }

    try {
      const updatedPreferences = { ...preferences, ...newPreferences };
      setPreferences(updatedPreferences);

      const { error } = await supabase
        .from('user_preferences')
        .update({ animation_preferences: updatedPreferences })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Error saving animation preferences:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      // Revert to previous preferences on error
      setPreferences(preferences);
    }
  };

  const setPreference = (preference: AnimationPreference) => {
    savePreferences({ preference });
  };

  const setDuration = (duration: number) => {
    savePreferences({ duration });
  };

  return {
    preferences,
    loading: loading || authLoading,
    error,
    setPreference,
    setDuration,
  };
}

export default useAnimationPreferences;