import React, { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction } from '@solana/web3.js';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Loader2, Zap, Shield, Star } from 'lucide-react';
import { useCollectionStats } from '@/hooks/useCollectionStats';
import { Progress } from '@/components/ui/progress';
import { CANDY_MACHINE_CONFIG, getSolanaExplorerUrl, formatSol } from '@/config/candyMachine';
import { supabase } from '@/integrations/supabase/client';

const NFTMint = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [lastMintSignature, setLastMintSignature] = useState<string | null>(null);
  
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();

  const { stats: collectionStats, loading: statsLoading } = useCollectionStats();

  const handleMint = useCallback(async () => {
    if (!connected || !publicKey) {
      toast.error(CANDY_MACHINE_CONFIG.ERRORS.WALLET_NOT_CONNECTED);
      return;
    }

    if (!signTransaction) {
      toast.error('Wallet does not support transaction signing');
      return;
    }

    if (!collectionStats) {
      toast.error('Collection data not available');
      return;
    }

    // Check if sold out
    if (collectionStats.remaining < 1) {
      toast.error(CANDY_MACHINE_CONFIG.ERRORS.SOLD_OUT);
      return;
    }

    setIsMinting(true);
    
    try {
      console.log('Starting mint process...', {
        wallet: publicKey.toString(),
        price: collectionStats.price
      });

      // Call edge function for single NFT
      const { data, error } = await supabase.functions.invoke('mint-nft-v2', {
        body: {
          walletAddress: publicKey.toString()
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Edge function failed');
      }

      if (data?.error) {
        console.error('Mint error:', data);
        throw new Error(data.error);
      }

      console.log('Mint response:', data);

      if (!data.transaction) {
        throw new Error('No transaction returned from server');
      }

      // Decode base64 transaction
      const transactionBytes = Uint8Array.from(
        atob(data.transaction),
        c => c.charCodeAt(0)
      );
      
      const transaction = VersionedTransaction.deserialize(transactionBytes);
      console.log('Transaction deserialized successfully');
      console.log('NFT mint address:', data.nftMint);

      // Sign transaction
      console.log('Requesting wallet signature...');
      const signedTransaction = await signTransaction(transaction);
      console.log('Transaction signed');

      // Send transaction
      console.log('Sending transaction...');
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3
        }
      );
      console.log('Transaction sent:', signature);

      // Wait for confirmation
      console.log('Waiting for confirmation...');
      const latestBlockhash = await connection.getLatestBlockhash();
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: data.blockhash || latestBlockhash.blockhash,
        lastValidBlockHeight: data.lastValidBlockHeight || latestBlockhash.lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('Transaction confirmed!');
      setLastMintSignature(signature);
      
      toast.success('Successfully minted NFT!', {
        action: {
          label: 'View Transaction',
          onClick: () => window.open(getSolanaExplorerUrl(signature), '_blank')
        }
      });
      
      // Refresh stats after a delay
      setTimeout(() => {
        window.location.reload();
      }, 3000);

    } catch (error: any) {
      console.error('Minting error:', error);
      
      // Parse error message
      let errorMessage = 'Minting failed';
      
      if (error?.message) {
        if (error.message.includes('insufficient')) {
          errorMessage = 'Insufficient SOL balance';
        } else if (error.message.includes('User rejected')) {
          errorMessage = 'Transaction cancelled';
        } else if (error.message.includes('0x')) {
          errorMessage = `Mint error: ${error.message}`;
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsMinting(false);
    }
  }, [connected, publicKey, signTransaction, collectionStats, connection]);

  if (statsLoading || !collectionStats) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-button-green mx-auto mb-4"></div>
          <p className="text-hero-text">Loading collection data...</p>
        </div>
      </div>
    );
  }

  const totalCostLabel = formatSol(collectionStats.price);
  const progressPercentage = (collectionStats.minted / collectionStats.totalSupply) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] z-0" />
        
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-10"
          style={{
            backgroundImage: `url('https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/Mint_Hero2%20(1).png')`
          }}
        />

        <div className="container mx-auto px-4 py-20 relative z-20">
          {/* NFT Minting Menu */}
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="bg-card-bg/90 backdrop-blur-sm border-card-border shadow-2xl max-w-4xl w-full">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  
                  {/* Collection Info */}
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-hero-text mb-2">VapeFi Genesis Rigs</h3>
                    <p className="text-muted-text mb-2">
                      {collectionStats.minted.toLocaleString()} / 5,000 minted
                    </p>
                    <p className="text-sm text-muted-text mb-4">
                      Scarce by design - only 5,000 genesis rigs ever minted at 0.15 SOL each
                    </p>
                    <Progress value={progressPercentage} className="h-3 mb-2" />
                    <p className="text-sm text-muted-text">
                      {progressPercentage.toFixed(1)}% Complete
                    </p>
                    {!collectionStats.isLive && (
                      <Badge variant="destructive" className="mt-2">
                        Minting Not Live
                      </Badge>
                    )}
                  </div>

                  {/* Mint Action */}
                  <div className="text-center">
                    <div className="mb-6">
                      <p className="text-3xl font-bold text-hero-text mb-2">{totalCostLabel}</p>
                      <p className="text-sm text-muted-text">Price per NFT</p>
                    </div>

                    {!connected ? (
                      <div className="space-y-4">
                        <WalletMultiButton className="!bg-button-green !text-pure-black hover:!bg-button-green/90 !rounded-full !px-8 !py-3 !font-semibold" />
                        <p className="text-sm text-muted-text">Connect your wallet to mint</p>
                      </div>
                    ) : collectionStats.remaining === 0 ? (
                      <div className="text-center">
                        <Badge variant="destructive" className="text-lg px-6 py-2">
                          SOLD OUT
                        </Badge>
                        <p className="text-sm text-muted-text mt-2">All NFTs have been minted</p>
                      </div>
                    ) : !collectionStats.isLive ? (
                      <div className="text-center">
                        <Button disabled className="w-full py-3">
                          Minting Not Live
                        </Button>
                        <p className="text-sm text-muted-text mt-2">Minting will begin soon</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Button
                          onClick={handleMint}
                          disabled={isMinting}
                          variant="hero-primary"
                          className="w-full py-3 font-semibold"
                          size="lg"
                        >
                          {isMinting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Minting...
                            </>
                          ) : (
                            'Mint 1 NFT'
                          )}
                        </Button>
                        
                        {lastMintSignature && (
                          <Button
                            variant="outline"
                            onClick={() => window.open(getSolanaExplorerUrl(lastMintSignature), '_blank')}
                            className="w-full"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Last Transaction
                          </Button>
                        )}
                        
                        <p className="text-xs text-muted-text">
                          {collectionStats.remaining.toLocaleString()} remaining
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* NFT Utilities Section */}
      <section className="py-20 bg-card-bg relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hero-text mb-4">Rig Mechanics & Utilities</h2>
            <p className="text-xl text-muted-text max-w-4xl mx-auto">
              VapeFi Rigs aren't just JPEGs to flip - they're playable assets with stats, durability, and soul. 
              Your weapon in the cloud wars.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-background border-card-border hover:border-button-green/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-button-green/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-button-green" />
                </div>
                <CardTitle className="text-hero-text">Main Rig Power</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-text">
                  Designate one rig as your earning machine. Its stats determine your $PUFF output per puff.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-card-border hover:border-button-green/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-button-green/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-button-green" />
                </div>
                <CardTitle className="text-hero-text">Energy Extension</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-text">
                  Side rigs act as batteries, each adding +2 Energy (~10 minutes) to your daily grind capacity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-card-border hover:border-button-green/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-button-green/20 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-button-green" />
                </div>
                <CardTitle className="text-hero-text">4-Stat System</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-text">
                  Drift (farming), Juice (RNG), Flow (endurance), Burn (efficiency). Choose your playstyle.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-card-border hover:border-button-green/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-button-green/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-button-green" />
                </div>
                <CardTitle className="text-hero-text">Level Progression</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-text">
                  Level up with $PUFF investment. Hit L10/L20/L30 milestones for multiplier boosts and VAPE access.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-card-border hover:border-button-green/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-button-green/20 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-button-green" />
                </div>
                <CardTitle className="text-hero-text">Fusion Mechanics</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-text">
                  Fuse 5 rigs into higher-tier monsters. Chase the legendary Rainbow Rigs for ultimate flex.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-card-border hover:border-button-green/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-button-green/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-button-green" />
                </div>
                <CardTitle className="text-hero-text">Mystery Crates</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-text">
                  High Juice rigs trigger RNG crate drops with mods, cosmetics, PUFF packs, and rare shards.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-4xl mx-auto bg-card-bg/50 border border-card-border rounded-2xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-hero-text mb-4">Scarcity & Strategy</h3>
              <p className="text-muted-text mb-6">
                With only 5,000 genesis rigs ever minted, each NFT is a strategic asset in the VapeFi ecosystem. 
                Collectors stack batteries, grinders build monsters, and degens chase Rainbow Rig glory.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-button-green mb-2">Main + Sides</div>
                  <div className="text-sm text-muted-text">Strategic rig allocation system</div>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-button-green mb-2">L30 → VAPE</div>
                  <div className="text-sm text-muted-text">Governance token unlock</div>
                </div>
                <div className="bg-background/50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-button-green mb-2">5→1 Fusion</div>
                  <div className="text-sm text-muted-text">Path to Rainbow Rigs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Roadmap */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hero-text mb-4">The Cloud Prophecy</h2>
            <p className="text-xl text-muted-text max-w-3xl mx-auto">
              A story told in puffs, burns, and milestones. The saga of where this movement is headed.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  chapter: "Chapter 1",
                  title: "Genesis (Q4 2025)",
                  description: "The smoke rises. 5,000 rigs minted into existence. AI puff-verification MVP goes live. PUFF emissions begin. The great 90-day cloudburst kicks off.",
                  status: "current",
                  highlights: ["5,000 Genesis Rigs", "AI Verification Live", "Season 1 Sprint"]
                },
                {
                  chapter: "Chapter 2", 
                  title: "The Marketplace Awakens (Q1 2026)",
                  description: "Trading chaos begins. Mods, cosmetics, and loot circulate. 2% platform fee + 4% royalty burns tokens. Whales start fusing rigs and chasing Rainbow Rigs.",
                  status: "upcoming",
                  highlights: ["Full Marketplace", "Fusion System", "Rainbow Rigs"]
                },
                {
                  chapter: "Chapter 3",
                  title: "The Prestige Era (Mid 2026)", 
                  description: "Strongest grinders hit Level 30, unlock VAPE governance token. The DAO forms. PUFF remains the grind currency, VAPE becomes influence.",
                  status: "upcoming",
                  highlights: ["VAPE Token Launch", "DAO Governance", "Level 30 Elite"]
                },
                {
                  chapter: "Chapter 4",
                  title: "Expansion into Smoke (2027+)",
                  description: "Metaverse lounges, avatar systems, multi-chain gameplay. VapeFi becomes a living mythology in Web3, a cultural relic of degeneracy.",
                  status: "upcoming",
                  highlights: ["Metaverse Integration", "Multi-chain", "Cultural Legacy"]
                }
              ].map((item, index) => (
                <div key={index} className="bg-card-bg/30 border border-card-border rounded-2xl p-6 hover:border-button-green/30 transition-all duration-300">
                  <div className="flex gap-6 items-start">
                    <div className={`w-6 h-6 rounded-full mt-1 flex-shrink-0 flex items-center justify-center ${
                      item.status === 'current' ? 'bg-button-green' : 'bg-card-border'
                    }`}>
                      {item.status === 'current' && <div className="w-2 h-2 bg-background rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-hero-text">{item.chapter}</h3>
                        <Badge variant={item.status === 'current' ? 'default' : 'secondary'}>
                          {item.status === 'current' ? 'Active' : 'Prophecy'}
                        </Badge>
                      </div>
                      <h4 className="text-lg font-semibold text-hero-text mb-3">{item.title}</h4>
                      <p className="text-muted-text mb-4">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.highlights.map((highlight, idx) => (
                          <span key={idx} className="text-xs bg-button-green/10 text-button-green px-2 py-1 rounded-full">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-button-green/10 to-card-bg/50 border border-button-green/20 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-hero-text mb-2">The Vibe</h3>
                <p className="text-muted-text text-sm">
                  Short term → Chaos, emissions, degen rush<br/>
                  Mid term → PUFF burns, Marketplace dynamics, VAPE prestige<br/>
                  Long term → VapeFi as lifestyle brand, metaverse flex, Web3 cultural mythology
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NFTMint;