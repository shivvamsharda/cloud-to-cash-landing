import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DashboardStats {
  weeklyPuffs: number;
  weeklyEarnings: number;
  monthlyPuffs: number;
  monthlyEarnings: number;
  averageDailyPuffs: number;
  streakDays: number;
  totalSessions: number;
  bestSession: {
    puffs: number;
    date: string;
  };
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    if (!user) {
      setStats(null);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Fetch sessions for calculations
      const { data: sessions, error } = await supabase
        .from('puff_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessionsData = sessions || [];

      // Calculate weekly stats
      const weeklySession = sessionsData.filter(
        session => new Date(session.created_at) >= weekAgo
      );
      const weeklyPuffs = weeklySession.reduce((sum, session) => sum + (session.puffs_count || 0), 0);
      const weeklyEarnings = weeklySession.reduce((sum, session) => sum + (session.rewards_earned || 0), 0);

      // Calculate monthly stats
      const monthlySessions = sessionsData.filter(
        session => new Date(session.created_at) >= monthAgo
      );
      const monthlyPuffs = monthlySessions.reduce((sum, session) => sum + (session.puffs_count || 0), 0);
      const monthlyEarnings = monthlySessions.reduce((sum, session) => sum + (session.rewards_earned || 0), 0);

      // Calculate average daily puffs (last 30 days)
      const averageDailyPuffs = monthlyPuffs / 30;

      // Find best session
      const bestSession = sessionsData.reduce(
        (best, session) => {
          if ((session.puffs_count || 0) > best.puffs) {
            return {
              puffs: session.puffs_count || 0,
              date: session.created_at,
            };
          }
          return best;
        },
        { puffs: 0, date: '' }
      );

      // Calculate streak (simplified - consecutive days with sessions)
      const dailySessions = new Map();
      sessionsData.forEach(session => {
        const date = new Date(session.created_at).toDateString();
        if (!dailySessions.has(date)) {
          dailySessions.set(date, true);
        }
      });

      let streakDays = 0;
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateString = checkDate.toDateString();
        if (dailySessions.has(dateString)) {
          streakDays++;
        } else if (i > 0) {
          break; // Streak broken
        }
      }

      setStats({
        weeklyPuffs,
        weeklyEarnings,
        monthlyPuffs,
        monthlyEarnings,
        averageDailyPuffs,
        streakDays,
        totalSessions: sessionsData.length,
        bestSession,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    refetch: fetchStats,
  };
};