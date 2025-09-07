import { useState, useEffect } from 'react';

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

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setStats({
        totalSupply: 5000,
        minted: 1247,
        price: 0.1,
        remaining: 3753,
        candyMachineId: 'mock_candy_machine_id',
        collectionMintId: 'mock_collection_mint_id',
        creatorWallet: 'mock_creator_wallet',
        isLive: true
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { stats, loading };
};