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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase.functions.invoke('get-collection-stats');
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching collection stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch collection stats');
        
        // Fallback to mock data if the API fails
        setStats({
          totalSupply: 5000,
          minted: 0,
          price: 0.15,
          remaining: 5000,
          candyMachineId: '',
          collectionMintId: '',
          creatorWallet: '',
          isLive: false
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};