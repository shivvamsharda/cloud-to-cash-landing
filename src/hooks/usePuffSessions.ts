import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useTimeSlots } from './useTimeSlots';

interface PuffSession {
  id: string;
  user_id: string;
  puffs_count: number;
  session_duration: number;
  rewards_earned: number;
  created_at: string;
}

export const usePuffSessions = () => {
  const { user } = useAuth();
  const { useSlot, getAvailableSlotType } = useTimeSlots();
  const [sessions, setSessions] = useState<PuffSession[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    if (!user) {
      setSessions([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('puff_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching puff sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const createSession = async (puffs_count: number, session_duration: number) => {
    if (!user) throw new Error('User not authenticated');

    // Get current slot type and multiplier
    const slotInfo = getAvailableSlotType();
    if (!slotInfo.type) {
      throw new Error('No available time slots remaining for today');
    }

    const sessionMinutes = Math.ceil(session_duration / 60);
    if (sessionMinutes > slotInfo.minutesRemaining) {
      throw new Error('Session duration exceeds available slot time');
    }

    // Calculate rewards with the appropriate multiplier
    const rewards_earned = puffs_count * slotInfo.multiplier;

    try {
      const { data, error } = await supabase
        .from('puff_sessions')
        .insert({
          user_id: user.id,
          puffs_count,
          session_duration,
          rewards_earned,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update slot usage
      await useSlot(slotInfo.type, sessionMinutes);
      
      // Trigger instant score update
      try {
        console.log('🚀 Triggering instant score update for user:', user.id);
        const { error: updateError } = await supabase.functions.invoke('instant-score-update', {
          body: { user_id: user.id }
        });
        
        if (updateError) {
          console.error('❌ Score update error:', updateError);
        } else {
          console.log('✅ Scores updated instantly');
        }
      } catch (updateError) {
        console.error('❌ Failed to trigger instant score update:', updateError);
      }
      
      // Refresh sessions
      await fetchSessions();
      
      return data;
    } catch (error) {
      console.error('Error creating puff session:', error);
      throw error;
    }
  };

  const getCurrentMultiplier = () => {
    const slotInfo = getAvailableSlotType();
    return slotInfo.multiplier;
  };

  const hasAvailableSlots = () => {
    const slotInfo = getAvailableSlotType();
    return slotInfo.type !== null;
  };

  return {
    sessions,
    loading,
    createSession,
    refetch: fetchSessions,
    getCurrentMultiplier,
    hasAvailableSlots,
  };
};