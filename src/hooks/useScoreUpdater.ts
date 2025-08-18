import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useScoreUpdater = () => {
  const triggerScoreUpdate = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('score-updater');
      
      if (error) {
        console.error('❌ Score updater error:', error);
      } else {
        console.log('✅ Score update triggered:', data);
      }
    } catch (error) {
      console.error('❌ Failed to trigger score update:', error);
    }
  }, []);

  // Trigger score update every 3 minutes
  useEffect(() => {
    // Initial call
    triggerScoreUpdate();

    // Set up interval for every 3 minutes (180,000ms)
    const interval = setInterval(triggerScoreUpdate, 3 * 60 * 1000);

    return () => clearInterval(interval);
  }, [triggerScoreUpdate]);

  return { triggerScoreUpdate };
};