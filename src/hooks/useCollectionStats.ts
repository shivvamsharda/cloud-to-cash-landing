import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: functionError } = await supabase.functions.invoke('get-collection-stats');
      
      if (functionError) {
        throw new Error(functionError.message || 'Failed to fetch collection stats');
      }
      
      setStats(data);
    } catch (err) {
      console.error('Error fetching collection stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Fallback stats
      setStats({
        totalSupply: 5000,
        minted: 1247,
        price: 0.1,
        remaining: 3753,
        candyMachineId: '6wh5JirtZw74DTe7VsrUpxu7e65xpLcFiHzeNvob4jqH',
        collectionMintId: 'GFJkJTy88KV5JoU8kGpsEpC9gnXckgwDXcW8GQbrH2ed',
        creatorWallet: '6nCrzrjHu2rf78LQo23ZaysPFP6gZNzjwtf5Vg4Q1LfH',
        isLive: true
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};