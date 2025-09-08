import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Zap, Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollectionStats } from '@/hooks/useCollectionStats';
import { useUserNFTs } from '@/hooks/useUserNFTs';
import { useWallet } from '@solana/wallet-adapter-react';

const NFTGallery = () => {
  const { stats, loading: statsLoading } = useCollectionStats();
  const { nfts, loading: nftsLoading, error, refetch, totalMultiplier, nftCount } = useUserNFTs();
  const { connected } = useWallet();


  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Epic': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'Rare': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const loading = statsLoading || nftsLoading;

  if (!connected) {
    return (
      <div className="space-y-4">
        <Card className="bg-card-bg border-card-border border-dashed">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-hero-bg/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-muted-text" />
            </div>
            <h3 className="text-lg font-semibold text-hero-text mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-muted-text text-sm">
              Connect your wallet to view your VapeFi NFT collection
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-button-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error State */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-destructive text-sm">{error}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* NFT Collection Overview */}
      {nfts.length > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-button-green/10 to-button-green/20 border-button-green/30">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-hero-text">{nftCount}</div>
              <div className="text-xs text-muted-text">NFTs Owned</div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-brand-yellow/10 to-brand-yellow/20 border-brand-yellow/30">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-hero-text">{totalMultiplier}x</div>
              <div className="text-xs text-muted-text">Total Multiplier</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nfts.length > 0 ? (
          nfts.map((nft) => (
            <Card key={nft.id} className="bg-card-bg border-card-border overflow-hidden group hover:border-button-green/50 transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-brand-purple/20 to-hero-bg/20 flex items-center justify-center relative">
                {/* NFT Image */}
                {nft.image ? (
                  <img 
                    src={nft.image} 
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-brand-purple/30 to-hero-bg/30 flex items-center justify-center ${nft.image ? 'hidden' : ''}`}>
                  <Star className="h-16 w-16 text-brand-yellow" />
                </div>
                
                {/* Rarity Badge */}
                <Badge 
                  className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)} text-white border-0`}
                >
                  {nft.rarity}
                </Badge>

                {/* Multiplier Badge */}
                <Badge 
                  className="absolute bottom-2 left-2 bg-button-green/90 text-pure-black border-0"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {nft.multiplier}x
                </Badge>
              </div>

              <CardContent className="p-4">
                <h3 className="font-semibold text-hero-text text-sm mb-2 truncate">
                  {nft.name}
                </h3>
                
                {/* Attributes */}
                <div className="space-y-1">
                  {nft.attributes.slice(0, 2).map((attr, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="text-muted-text">{attr.trait_type}:</span>
                      <span className="text-hero-text">{attr.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          /* Empty State */
          <div className="col-span-full">
            <Card className="bg-card-bg border-card-border border-dashed">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-purple/20 to-hero-bg/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-8 w-8 text-muted-text" />
                </div>
                <h3 className="text-lg font-semibold text-hero-text mb-2">
                  No NFTs Yet
                </h3>
                <p className="text-muted-text mb-4 text-sm">
                  Mint your first VapeFi NFT to unlock multipliers and exclusive benefits
                </p>
                <Link to="/mint">
                  <Button variant="hero-primary" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Mint Your First NFT
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Collection Stats */}
      {stats && (
        <div className="mt-6 pt-4 border-t border-card-border">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-text">Collection Size</div>
              <div className="text-lg font-semibold text-hero-text">
                {stats.totalSupply}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-text">Minted</div>
              <div className="text-lg font-semibold text-hero-text">
                {stats.minted} ({((stats.minted / stats.totalSupply) * 100).toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { NFTGallery };