import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserNFTs } from './useUserNFTs';

interface DailySlots {
  user_id: string;
  free_slot_minutes_used: number;
  free_slot_minutes_remaining: number;
  nft_slot_minutes_used: number;
  nft_slot_minutes_remaining: number;
  date: string;
  free_slot_multiplier: number;
  nft_slot_multiplier: number;
  total_available_nft_minutes: number;
}

export const useTimeSlots = () => {
  const { user } = useAuth();
  const { nfts, nftCount } = useUserNFTs();
  const [dailySlots, setDailySlots] = useState<DailySlots | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDailySlots = async () => {
    if (!user) {
      setDailySlots(null);
      return;
    }

    setLoading(true);
    try {
      // Get slot data from database function
      const { data, error } = await supabase.rpc('get_user_daily_slots', {
        target_user_id: user.id
      });

      if (error) throw error;

      // Type the response data
      const slotData = data as any;
      
      // Calculate NFT slot availability based on owned NFTs
      const totalNFTMinutes = nftCount * 10; // 10 minutes per NFT
      const nftMinutesRemaining = Math.max(0, totalNFTMinutes - (slotData?.nft_slot_minutes_used || 0));

      setDailySlots({
        user_id: slotData?.user_id || user.id,
        free_slot_minutes_used: slotData?.free_slot_minutes_used || 0,
        free_slot_minutes_remaining: slotData?.free_slot_minutes_remaining || 0,
        nft_slot_minutes_used: slotData?.nft_slot_minutes_used || 0,
        nft_slot_minutes_remaining: nftMinutesRemaining,
        date: slotData?.date || new Date().toISOString().split('T')[0],
        free_slot_multiplier: slotData?.free_slot_multiplier || 0.5,
        nft_slot_multiplier: slotData?.nft_slot_multiplier || 10.0,
        total_available_nft_minutes: totalNFTMinutes,
      });
    } catch (error) {
      console.error('Error fetching daily slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const useSlot = async (slotType: 'free' | 'nft', minutesUsed: number) => {
    if (!user || !dailySlots) return false;

    try {
      if (slotType === 'free') {
        // Update free slot usage in profiles table
        const { error } = await supabase
          .from('profiles')
          .update({
            daily_free_slot_used: dailySlots.free_slot_minutes_used + minutesUsed
          })
          .eq('id', user.id);

        if (error) throw error;
      } else {
        // Insert/update NFT slot usage in time_slots table
        const { error } = await supabase
          .from('time_slots')
          .upsert({
            user_id: user.id,
            slot_type: 'nft',
            minutes_used: dailySlots.nft_slot_minutes_used + minutesUsed,
            multiplier: dailySlots.nft_slot_multiplier,
            slot_date: new Date().toISOString().split('T')[0]
          }, {
            onConflict: 'user_id,slot_type,slot_date,nft_mint'
          });

        if (error) throw error;
      }

      // Refresh slot data
      await fetchDailySlots();
      return true;
    } catch (error) {
      console.error('Error using slot:', error);
      return false;
    }
  };

  const getAvailableSlotType = (): { type: 'free' | 'nft' | null, multiplier: number, minutesRemaining: number } => {
    if (!dailySlots) return { type: null, multiplier: 0, minutesRemaining: 0 };

    // Prioritize NFT slots if available (higher multiplier)
    if (dailySlots.nft_slot_minutes_remaining > 0) {
      return {
        type: 'nft',
        multiplier: dailySlots.nft_slot_multiplier,
        minutesRemaining: dailySlots.nft_slot_minutes_remaining
      };
    }

    // Fall back to free slot
    if (dailySlots.free_slot_minutes_remaining > 0) {
      return {
        type: 'free',
        multiplier: dailySlots.free_slot_multiplier,
        minutesRemaining: dailySlots.free_slot_minutes_remaining
      };
    }

    return { type: null, multiplier: 0, minutesRemaining: 0 };
  };

  const getTotalRemainingTime = (): number => {
    if (!dailySlots) return 0;
    return dailySlots.free_slot_minutes_remaining + dailySlots.nft_slot_minutes_remaining;
  };

  useEffect(() => {
    fetchDailySlots();
  }, [user, nftCount]);

  return {
    dailySlots,
    loading,
    useSlot,
    getAvailableSlotType,
    getTotalRemainingTime,
    refetch: fetchDailySlots,
  };
};