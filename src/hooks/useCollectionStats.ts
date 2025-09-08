import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CANDY_MACHINE_CONFIG } from '@/config/candyMachine';

export interface CollectionStats {
  totalSupply: number;
  minted: number;
  price: number;
  remaining: number;
  candyMachineId: string;
  collectionMintId: string;
  creatorWallet: string;
  isLive: boolean;
}

export const useCollectionStats = () => {
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      try {
        setError(null);
        const { data, error } = await supabase.functions.invoke('get-collection-stats');
        if (error) throw error;
        if (data && isMounted) {
          const safePrice = Number.isFinite(data.price) ? data.price : CANDY_MACHINE_CONFIG.DEFAULT_MINT_PRICE;
          setStats({ ...data, price: safePrice });
        }
      } catch (err) {
        console.error('Error fetching collection stats:', err);
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to fetch collection stats');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    const interval = window.setInterval(fetchStats, 15000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  return { stats, loading, error };
};