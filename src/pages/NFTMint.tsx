import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletAuth } from '@/components/WalletAuth';
import { toast } from '@/hooks/use-toast';
import { Minus, Plus, Zap, Shield, Trophy, Users, Sparkles, Star } from 'lucide-react';
const NFTMint = () => {
  const {
    publicKey,
    connected
  } = useWallet();
  const {
    user
  } = useAuth();
  const [mintQuantity, setMintQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);

  // Collection stats (placeholder data)
  const collectionStats = {
    totalSupply: 5000,
    minted: 1247,
    price: 0.1,
    // SOL
    remaining: 3753
  };
  const handleMint = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive"
      });
      return;
    }
    setIsMinting(true);
    try {
      // Placeholder mint logic - replace with actual Solana NFT minting
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Mint Successful!",
        description: `Successfully minted ${mintQuantity} VapeFi NFT${mintQuantity > 1 ? 's' : ''}!`
      });

      // Reset quantity after successful mint
      setMintQuantity(1);
    } catch (error) {
      toast({
        title: "Mint Failed",
        description: "There was an error minting your NFT. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsMinting(false);
    }
  };
  const adjustQuantity = (change: number) => {
    const newQuantity = mintQuantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setMintQuantity(newQuantity);
    }
  };
  const totalCost = (mintQuantity * collectionStats.price).toFixed(1);
  const progressPercentage = collectionStats.minted / collectionStats.totalSupply * 100;
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Hero Image Overlay */}
        <div className="absolute inset-0 bg-center bg-no-repeat bg-contain" style={{backgroundImage: 'url(https://paugtcnvqdbjcrrmjxma.supabase.co/storage/v1/object/public/website/Mint_Hero.png)'}} />

        <div className="container mx-auto px-4 py-20 relative z-10">
          {/* Centered Mint Interface */}
          <div className="flex flex-col items-center justify-center text-center space-y-12">
            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-bold text-hero-text">
                MINT Your Genesis NFT
              </h1>
              <p className="text-xl text-hero-text/70 max-w-2xl">
                Securing funds and assets with VapeFi reliability
              </p>
            </div>

            {/* Mint Controls */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-4xl">
              {/* Remaining Count */}
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-hero-text">
                  {collectionStats.remaining} / {collectionStats.totalSupply}
                </div>
                <div className="text-hero-text/60 text-lg">
                  REMAINING
                </div>
              </div>

              {/* Mint Button */}
              <div className="flex-shrink-0 flex justify-center items-center">
                {!connected ? (
                  <div className="flex justify-center">
                    <WalletAuth />
                  </div>
                ) : (
                  <Button
                    onClick={handleMint}
                    disabled={isMinting}
                    className="bg-button-green text-pure-black hover:bg-button-green/90 text-2xl px-12 py-6 h-auto rounded-full font-bold mx-auto"
                  >
                    {isMinting ? "Minting..." : "Mint"}
                  </Button>
                )}
              </div>

              {/* Price */}
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-hero-text">
                  {collectionStats.price} SOL
                </div>
                <div className="text-hero-text/60 text-lg">
                  PRICE PER NFT
                </div>
              </div>
            </div>

            {/* Connection Message */}
            {!connected && (
              <p className="text-hero-text/60 text-lg">
                Connect your wallet to mint
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Utility Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-archivo-black text-hero-text mb-6">
              Genesis NFT <span className="text-brand-yellow">Utilities</span>
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

            <Card className="bg-card-bg border-card-border hover:border-brand-purple/50 transition-colors">
              <CardHeader>
                <Zap className="w-12 h-12 text-brand-purple mb-4" />
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

            <Card className="bg-card-bg border-card-border hover:border-brand-yellow/50 transition-colors">
              <CardHeader>
                <Star className="w-12 h-12 text-brand-yellow mb-4" />
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
              Collection <span className="text-brand-purple">Roadmap</span>
            </h2>
            <p className="text-lg text-muted-text max-w-2xl mx-auto">
              Our journey to revolutionize vaping rewards through blockchain technology
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[{
              phase: "Phase 1",
              title: "Genesis Launch",
              description: "Launch 5,000 Genesis NFTs with premium utility features",
              status: "current",
              color: "button-green"
            }, {
              phase: "Phase 2",
              title: "Enhanced Platform",
              description: "Advanced tracking features and gamification for NFT holders",
              status: "upcoming",
              color: "brand-purple"
            }, {
              phase: "Phase 3",
              title: "Marketplace & Trading",
              description: "Secondary marketplace and NFT breeding mechanics",
              status: "future",
              color: "brand-yellow"
            }, {
              phase: "Phase 4",
              title: "Metaverse Integration",
              description: "VR/AR experiences and virtual vaping competitions",
              status: "future",
              color: "hero-bg"
            }].map((item, index) => <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full bg-${item.color}/20 border-2 border-${item.color} flex items-center justify-center`}>
                      <span className="text-sm font-bold text-hero-text">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-hero-text">{item.title}</h3>
                      <Badge variant={item.status === 'current' ? 'default' : 'outline'} className={item.status === 'current' ? 'bg-button-green text-pure-black' : ''}>
                        {item.phase}
                      </Badge>
                    </div>
                    <p className="text-muted-text">{item.description}</p>
                  </div>
                </div>)}
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default NFTMint;