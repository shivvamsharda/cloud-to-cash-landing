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

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - NFT Showcase */}
            <div className="space-y-8">
              

              {/* NFT Preview */}
              
            </div>

            {/* Right Side - Mint Interface */}
            <div className="space-y-6">
              <Card className="bg-card-bg border-card-border">
                <CardHeader>
                  <CardTitle className="text-hero-text text-2xl">Mint Your Genesis NFT</CardTitle>
                  <CardDescription className="text-muted-text">
                    {collectionStats.remaining} of {collectionStats.totalSupply} remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-text">Progress</span>
                      <span className="text-hero-text">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-card-border rounded-full h-2">
                      <div className="bg-gradient-to-r from-button-green to-brand-yellow h-2 rounded-full transition-all duration-300" style={{
                      width: `${progressPercentage}%`
                    }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-text">
                      <span>{collectionStats.minted} minted</span>
                      <span>{collectionStats.remaining} left</span>
                    </div>
                  </div>

                  {/* Price and Quantity */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-text">Price per NFT</span>
                      <span className="text-hero-text font-bold text-lg">{collectionStats.price} SOL</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-text">Quantity (Max 10)</label>
                      <div className="flex items-center space-x-3">
                        <Button variant="outline" size="icon" onClick={() => adjustQuantity(-1)} disabled={mintQuantity <= 1} className="border-card-border hover:bg-card-border">
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-2xl font-bold text-hero-text w-8 text-center">
                          {mintQuantity}
                        </span>
                        <Button variant="outline" size="icon" onClick={() => adjustQuantity(1)} disabled={mintQuantity >= 10} className="border-card-border hover:bg-card-border">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-card-border">
                      <span className="text-muted-text">Total Cost</span>
                      <span className="text-hero-text font-bold text-xl">{totalCost} SOL</span>
                    </div>
                  </div>

                  {/* Mint Button or Wallet Connection */}
                  <div className="space-y-3">
                    {!connected ? <div className="text-center">
                        <p className="text-muted-text mb-4">Connect your wallet to mint</p>
                        <WalletAuth />
                      </div> : <Button onClick={handleMint} disabled={isMinting} className="w-full bg-button-green hover:bg-button-green/90 text-pure-black font-bold py-3 text-lg" size="lg">
                        {isMinting ? <>
                            <div className="animate-spin w-4 h-4 border-2 border-pure-black border-t-transparent rounded-full mr-2" />
                            Minting...
                          </> : `Mint ${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''}`}
                      </Button>}
                  </div>
                </CardContent>
              </Card>

              {/* Collection Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-card-bg border-card-border">
                  <CardContent className="p-4 text-center">
                    <Users className="w-8 h-8 text-brand-purple mx-auto mb-2" />
                    <p className="text-2xl font-bold text-hero-text">{collectionStats.minted}</p>
                    <p className="text-sm text-muted-text">Minted</p>
                  </CardContent>
                </Card>
                <Card className="bg-card-bg border-card-border">
                  <CardContent className="p-4 text-center">
                    <Trophy className="w-8 h-8 text-brand-yellow mx-auto mb-2" />
                    <p className="text-2xl font-bold text-hero-text">{collectionStats.totalSupply}</p>
                    <p className="text-sm text-muted-text">Total Supply</p>
                  </CardContent>
                </Card>
              </div>
            </div>
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