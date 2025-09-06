import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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

    const rewards_earned = puffs_count * 0.1; // 0.1 tokens per puff

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
      
      // Refresh sessions
      await fetchSessions();
      
      return data;
    } catch (error) {
      console.error('Error creating puff session:', error);
      throw error;
    }
  };

  return {
    sessions,
    loading,
    createSession,
    refetch: fetchSessions,
  };
};