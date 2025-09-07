import React, { useState, useCallback, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Minus, Plus, Loader2, Zap, Shield, Trophy, Users, Sparkles, Star } from 'lucide-react';
import { WalletAuth } from '@/components/WalletAuth';
import { useCollectionStats } from '@/hooks/useCollectionStats';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplCandyMachine, mintV2, fetchCandyMachine } from '@metaplex-foundation/mpl-candy-machine';
import { publicKey, lamports, sol, transactionBuilder, some, none, generateSigner } from '@metaplex-foundation/umi';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { NFT_CONFIG } from '@/config/nft';

const NFTMint = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { user } = useAuth();
  const [mintQuantity, setMintQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);
  const [lastMintSignature, setLastMintSignature] = useState<string | null>(null);

  // Use real collection stats
  const { stats: collectionStats, loading: statsLoading, refetch: refetchStats } = useCollectionStats();

  const handleMint = useCallback(async () => {
    if (!wallet?.publicKey || !connection) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!collectionStats) {
      toast.error('Collection data not available');
      return;
    }

    if (!collectionStats.isLive) {
      toast.error('NFT minting is currently not active');
      return;
    }

    setIsMinting(true);
    
    try {
      // Check SOL balance
      const balance = await connection.getBalance(wallet.publicKey);
      const solBalance = balance / 1e9;
      const requiredSOL = collectionStats.price * mintQuantity;
      
      if (solBalance < requiredSOL + 0.01) {
        throw new Error(`Insufficient SOL balance. Need ${requiredSOL + 0.01} SOL, have ${solBalance.toFixed(3)} SOL`);
      }

      // Initialize Umi with wallet adapter identity
      const umi = createUmi(connection.rpcEndpoint)
        .use(walletAdapterIdentity(wallet))
        .use(mplCandyMachine());

      const candyMachineId = publicKey(collectionStats.candyMachineId);
      const collectionMintId = publicKey(collectionStats.collectionMintId);

      // Fetch the candy machine to get current state
      const candyMachine = await fetchCandyMachine(umi, candyMachineId);
      
      if (!candyMachine) {
        throw new Error('Candy Machine not found');
      }

      // Check if there are items available
      if (candyMachine.itemsRedeemed >= candyMachine.itemsLoaded) {
        throw new Error('Collection is sold out');
      }

      // Check if there are enough items remaining for the requested quantity
      const remaining = Number(candyMachine.itemsLoaded) - Number(candyMachine.itemsRedeemed);
      if (remaining < mintQuantity) {
        throw new Error(`Only ${remaining} NFTs remaining`);
      }

      // Mint NFTs one by one
      const signatures = [];
      
      for (let i = 0; i < mintQuantity; i++) {
        console.log(`Minting NFT ${i + 1} of ${mintQuantity}...`);
        
        try {
          // Generate a new NFT mint
          const nftMint = generateSigner(umi);
          
          const mintResult = await transactionBuilder()
            .add(mintV2(umi, {
              candyMachine: candyMachineId,
              nftMint,
              collectionMint: collectionMintId,
              collectionUpdateAuthority: umi.identity.publicKey,
            }))
            .sendAndConfirm(umi);

          signatures.push(mintResult.signature);
          
          // Update UI after each successful mint
          toast.success(`NFT ${i + 1}/${mintQuantity} minted successfully!`);
        } catch (error) {
          console.error(`Failed to mint NFT ${i + 1}:`, error);
          toast.error(`Failed to mint NFT ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          break;
        }
      }

      if (signatures.length > 0) {
        setLastMintSignature(signatures[signatures.length - 1]);
        
        // Refresh collection stats
        setTimeout(() => {
          refetchStats();
        }, 2000);
        
        toast.success(`Successfully minted ${signatures.length} NFT${signatures.length > 1 ? 's' : ''}!`);
        
        // Reset mint quantity
        setMintQuantity(1);
      }

    } catch (error) {
      console.error('Minting error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  }, [wallet, connection, mintQuantity, collectionStats, refetchStats]);

  const adjustQuantity = (change: number) => {
    const newQuantity = mintQuantity + change;
    if (newQuantity >= 1 && newQuantity <= NFT_CONFIG.maxMintPerWallet) {
      setMintQuantity(newQuantity);
    }
  };

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

  const totalCost = (mintQuantity * collectionStats.price).toFixed(1);
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
                {/* Horizontal Layout */}
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  
                  {/* Collection Info Section */}
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-hero-text mb-2">VapeFi Genesis</h3>
                    <p className="text-muted-text mb-4">
                      {collectionStats.minted.toLocaleString()} / {collectionStats.totalSupply.toLocaleString()} minted
                    </p>
                    <Progress value={progressPercentage} className="h-3 mb-2" />
                    <p className="text-sm text-muted-text">
                      {progressPercentage.toFixed(1)}% Complete
                    </p>
                  </div>

                  {/* Quantity Selector Section */}
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-hero-text mb-4">Select Quantity</h4>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustQuantity(-1)}
                        disabled={mintQuantity <= 1}
                        className="h-12 w-12"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-3xl font-bold text-hero-text min-w-[3rem]">
                        {mintQuantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustQuantity(1)}
                        disabled={mintQuantity >= NFT_CONFIG.maxMintPerWallet}
                        className="h-12 w-12"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-text">Max {NFT_CONFIG.maxMintPerWallet} per wallet</p>
                  </div>

                  {/* Mint Section */}
                  <div className="text-center md:text-right">
                    <div className="mb-4">
                      <p className="text-lg font-semibold text-hero-text">
                        {totalCost} SOL
                      </p>
                      <p className="text-sm text-muted-text">
                        {collectionStats.price} SOL each
                      </p>
                    </div>
                    
                    {wallet.connected ? (
                      <div className="space-y-3">
                        <Button
                          variant="hero-primary"
                          size="lg"
                          onClick={handleMint}
                          disabled={isMinting || !collectionStats.isLive}
                          className="w-full md:w-auto px-8 py-4 text-lg font-bold"
                        >
                          {isMinting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Minting...
                            </>
                          ) : (
                            `Mint ${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''}`
                          )}
                        </Button>
                        {lastMintSignature && (
                          <a 
                            href={`https://solscan.io/tx/${lastMintSignature}?cluster=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-button-green hover:underline"
                          >
                            View last transaction <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="w-full md:w-auto">
                        <WalletAuth />
                      </div>
                    )}
                  </div>
                  
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Utility Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-archivo-black text-hero-text mb-6">
              Genesis NFT <span className="text-button-green">Utilities</span>
            </h2>
            <p className="text-lg text-muted-text max-w-2xl mx-auto">
              Unlock exclusive benefits and enhanced features with your VapeFi Genesis NFT
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card-bg border-card-border hover:border-button-green/50 transition-colors">
              <CardHeader>
                <Shield className="w-12 h-12 text-button-green mb-4" />
                <CardTitle className="text-hero-text">Premium Access</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-text">
                  <li>• Exclusive tracking features</li>
                  <li>• Advanced analytics dashboard</li>
                  <li>• Priority customer support</li>
                  <li>• Beta feature access</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card-bg border-card-border hover:border-button-green/50 transition-colors">
              <CardHeader>
                <Zap className="w-12 h-12 text-button-green mb-4" />
                <CardTitle className="text-hero-text">Enhanced Rewards</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-text">
                  <li>• 2x reward multiplier</li>
                  <li>• Exclusive reward tiers</li>
                  <li>• Monthly bonus drops</li>
                  <li>• VIP tournament access</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card-bg border-card-border hover:border-button-green/50 transition-colors">
              <CardHeader>
                <Star className="w-12 h-12 text-button-green mb-4" />
                <CardTitle className="text-hero-text">Community Perks</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-text">
                  <li>• Private Discord access</li>
                  <li>• Governance voting rights</li>
                  <li>• Future NFT allowlist</li>
                  <li>• Exclusive merchandise</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-archivo-black text-hero-text mb-6">
              Collection <span className="text-button-green">Roadmap</span>
            </h2>
            <p className="text-lg text-muted-text max-w-2xl mx-auto">
              Our journey to revolutionize vaping rewards through blockchain technology
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  phase: "Phase 1",
                  title: "Genesis Launch",
                  description: "Launch 5,000 Genesis NFTs with premium utility features",
                  status: "current",
                  color: "button-green"
                },
                {
                  phase: "Phase 2", 
                  title: "Enhanced Platform",
                  description: "Advanced tracking features and gamification for NFT holders",
                  status: "upcoming",
                  color: "button-green"
                },
                {
                  phase: "Phase 3",
                  title: "Marketplace & Trading", 
                  description: "Secondary marketplace and NFT breeding mechanics",
                  status: "future",
                  color: "button-green"
                },
                {
                  phase: "Phase 4",
                  title: "Metaverse Integration",
                  description: "VR/AR experiences and virtual vaping competitions", 
                  status: "future",
                  color: "hero-bg"
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full bg-${item.color}/20 border-2 border-${item.color} flex items-center justify-center`}>
                      <span className="text-sm font-bold text-hero-text">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-hero-text">{item.title}</h3>
                      <Badge 
                        variant={item.status === 'current' ? 'default' : 'outline'} 
                        className={item.status === 'current' ? 'bg-button-green text-pure-black' : ''}
                      >
                        {item.phase}
                      </Badge>
                    </div>
                    <p className="text-muted-text">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NFTMint;