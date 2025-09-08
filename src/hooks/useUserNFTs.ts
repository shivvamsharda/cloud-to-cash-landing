import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '@/integrations/supabase/client';

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface UserNFT {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  multiplier: number;
  attributes: NFTAttribute[];
  mint: string;
}

export const useUserNFTs = () => {
  const { publicKey, connected } = useWallet();
  const [nfts, setNfts] = useState<UserNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserNFTs = async () => {
    if (!publicKey || !connected) {
      setNfts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletAddress = publicKey.toString();
      
      const { data, error } = await supabase.functions.invoke('get-user-nfts', {
        body: { walletAddress },
      });

      if (error) {
        throw new Error(error.message);
      }

      setNfts(data?.nfts || []);
    } catch (err) {
      console.error('Error fetching user NFTs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
      setNfts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserNFTs();
  }, [publicKey, connected]);

  const totalMultiplier = nfts.reduce((sum, nft) => sum + nft.multiplier, 0);

  return {
    nfts,
    loading,
    error,
    refetch: fetchUserNFTs,
    totalMultiplier,
    nftCount: nfts.length,
  };
};