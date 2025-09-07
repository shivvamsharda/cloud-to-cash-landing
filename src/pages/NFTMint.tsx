import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletAuth } from "@/components/WalletAuth";
import { toast } from "@/hooks/use-toast";
import { Minus, Plus, Shield, Zap, Star } from "lucide-react";

const NFTMint = () => {
  const { publicKey, connected } = useWallet();
  const { user } = useAuth();

  const [mintQuantity, setMintQuantity] = useState(1);
  const [isMinting, setIsMinting] = useState(false);

  // Collection stats (placeholder data)
  const collectionStats = {
    totalSupply: 5000,
    minted: 1247,
    price: 0.1, // SOL
    remaining: 3753,
  };

  const adjustQuantity = (change: number) => {
    const next = mintQuantity + change;
    if (next >= 1 && next <= 10) setMintQuantity(next);
  };

  const totalCost = (mintQuantity * collectionStats.price).toFixed(1);
  const progressPercentage =
    (collectionStats.minted / collectionStats.totalSupply) * 100;

  const handleMint = async () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      });
      return;
    }
    setIsMinting(true);
    try {
      // Placeholder mint logic - replace with actual Solana NFT minting
      await new Promise((r) => setTimeout(r, 2000));
      toast({
        title: "Mint Successful!",
        description: `Successfully minted ${mintQuantity} VapeFi NFT${
          mintQuantity > 1 ? "s" : ""
        }!`,
      });
      setMintQuantity(1);
    } catch (error) {
      toast({
        title: "Mint Failed",
        description: "There was an error minting your NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* === HERO =========================================================== */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="relative z-10 w-full">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
            {/* 1) Headline block */}
            <div className="text-center space-y-4 md:space-y-5 pt-8">
              <h1 className="text-4xl md:text-6xl font-archivo-black tracking-tight text-hero-text">
                MINT Your <span className="text-brand-yellow">Genesis NFT</span>
              </h1>
              <p className="text-base md:text-lg text-muted-text max-w-2xl mx-auto">
                Securing funds and assets with VapeFi reliability — mint, track,
                and earn inside the VapeFi ecosystem.
              </p>
            </div>

            {/* 2) KPI strip (kept tight + symmetric) */}
            <div className="mt-8 md:mt-12 grid grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto">
              <div className="rounded-2xl border border-card-border/80 bg-card-bg/40 backdrop-blur-sm px-5 py-4 text-center">
                <div className="text-sm text-muted-text">Remaining</div>
                <div className="text-2xl md:text-3xl font-bold text-hero-text">
                  {collectionStats.remaining} / {collectionStats.totalSupply}
                </div>
              </div>
              <div className="rounded-2xl border border-card-border/80 bg-card-bg/40 backdrop-blur-sm px-5 py-4 text-center">
                <div className="text-sm text-muted-text">Price per NFT</div>
                <div className="text-2xl md:text-3xl font-bold text-hero-text">
                  {collectionStats.price} SOL
                </div>
              </div>
            </div>

            {/* 3) Mint panel (primary focal element) */}
            <Card className="mt-8 md:mt-12 mx-auto max-w-3xl rounded-3xl border-card-border/90 bg-card-bg/70 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.45)]">
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-2xl md:text-3xl text-hero-text">
                  Mint Panel
                </CardTitle>
                <CardDescription className="text-muted-text">
                  Connect your wallet, choose quantity, and mint instantly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 md:space-y-7">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-muted-text">Progress</span>
                    <span className="text-hero-text font-medium">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-card-border">
                    <div
                      className="h-2.5 rounded-full bg-gradient-to-r from-button-green to-brand-yellow transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[12px] text-muted-text">
                    <span>{collectionStats.minted} minted</span>
                    <span>{collectionStats.remaining} left</span>
                  </div>
                </div>

                {/* Controls row */}
                <div className="grid grid-cols-3 gap-4 md:gap-6 items-end">
                  {/* Price */}
                  <div className="col-span-1">
                    <div className="text-sm text-muted-text">Price</div>
                    <div className="text-2xl font-semibold text-hero-text">
                      {collectionStats.price} SOL
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-1">
                    <div className="text-sm text-muted-text">Quantity</div>
                    <div className="mt-2 flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustQuantity(-1)}
                        disabled={mintQuantity <= 1}
                        className="border-card-border hover:bg-card-border"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-10 text-center text-2xl font-bold text-hero-text">
                        {mintQuantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustQuantity(1)}
                        disabled={mintQuantity >= 10}
                        className="border-card-border hover:bg-card-border"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="mt-1 text-center text-xs text-muted-text">
                      Max 10 per tx
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-1 text-right">
                    <div className="text-sm text-muted-text">Total</div>
                    <div className="text-2xl font-semibold text-hero-text">
                      {totalCost} SOL
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="pt-1">
                  {!connected ? (
                    <div className="text-center">
                      <p className="text-muted-text mb-4">
                        Connect your wallet to mint
                      </p>
                      <WalletAuth />
                    </div>
                  ) : (
                    <Button
                      onClick={handleMint}
                      disabled={isMinting}
                      size="lg"
                      className="w-full rounded-2xl bg-button-green text-pure-black font-extrabold hover:bg-button-green/90 py-6 text-lg"
                    >
                      {isMinting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-pure-black border-t-transparent" />
                          Minting…
                        </>
                      ) : (
                        `Mint ${mintQuantity} NFT${
                          mintQuantity > 1 ? "s" : ""
                        }`
                      )}
                    </Button>
                  )}
                </div>

                {/* Fine print */}
                <p className="text-center text-xs text-muted-text">
                  Gas fees apply. Your NFT will be verified under the VapeFi
                  collection on mint.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* === UTILITIES ====================================================== */}
      <section className="py-20 bg-gradient-to-b from-background to-card-bg">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-archivo-black text-hero-text">
              Genesis NFT <span className="text-brand-yellow">Utilities</span>
            </h2>
            <p className="mt-3 text-lg text-muted-text max-w-2xl mx-auto">
              Unlock exclusive benefits and enhanced features with your VapeFi
              Genesis NFT.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <Card className="rounded-3xl bg-card-bg border-card-border hover:border-button-green/50 transition">
              <CardHeader>
                <Shield className="w-12 h-12 text-button-green mb-4" />
                <CardTitle className="text-hero-text">Premium Access</CardTitle>
                <CardDescription className="text-muted-text">
                  Tools that put you ahead.
                </CardDescription>
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

            <Card className="rounded-3xl bg-card-bg border-card-border hover:border-brand-purple/50 transition">
              <CardHeader>
                <Zap className="w-12 h-12 text-brand-purple mb-4" />
                <CardTitle className="text-hero-text">Enhanced Rewards</CardTitle>
                <CardDescription className="text-muted-text">
                  Earn more, faster.
                </CardDescription>
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

            <Card className="rounded-3xl bg-card-bg border-card-border hover:border-brand-yellow/50 transition">
              <CardHeader>
                <Star className="w-12 h-12 text-brand-yellow mb-4" />
                <CardTitle className="text-hero-text">Community Perks</CardTitle>
                <CardDescription className="text-muted-text">
                  Access, voice, and merch.
                </CardDescription>
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

      {/* === ROADMAP ======================================================== */}
      <section className="py-20 bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-archivo-black text-hero-text">
              Collection <span className="text-brand-purple">Roadmap</span>
            </h2>
            <p className="mt-3 text-lg text-muted-text max-w-2xl mx-auto">
              Our journey to revolutionize vaping rewards through blockchain
              technology.
            </p>
          </div>

          <div className="space-y-8 max-w-3xl mx-auto">
            {[
              {
                phase: "Phase 1",
                title: "Genesis Launch",
                description:
                  "Launch 5,000 Genesis NFTs with premium utility features",
                status: "current",
                color: "button-green",
              },
              {
                phase: "Phase 2",
                title: "Enhanced Platform",
                description:
                  "Advanced tracking features and gamification for NFT holders",
                status: "upcoming",
                color: "brand-purple",
              },
              {
                phase: "Phase 3",
                title: "Marketplace & Trading",
                description:
                  "Secondary marketplace and NFT breeding mechanics",
                status: "future",
                color: "brand-yellow",
              },
              {
                phase: "Phase 4",
                title: "Metaverse Integration",
                description:
                  "VR/AR experiences and virtual vaping competitions",
                status: "future",
                color: "hero-bg",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full bg-${item.color}/20 border-2 border-${item.color} flex items-center justify-center`}
                  >
                    <span className="text-sm font-bold text-hero-text">
                      {i + 1}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-xl font-bold text-hero-text">
                      {item.title}
                    </h3>
                    <Badge
                      variant={item.status === "current" ? "default" : "outline"}
                      className={
                        item.status === "current"
                          ? "bg-button-green text-pure-black"
                          : ""
                      }
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
      </section>
    </div>
  );
};

export default NFTMint;
