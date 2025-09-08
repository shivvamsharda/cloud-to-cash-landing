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
                    <h3 className="text-2xl font-bold text-hero-text mb-2">VapeFi Genesis</h3>
                    <p className="text-muted-text mb-4">
                      {collectionStats.minted.toLocaleString()} / {collectionStats.totalSupply.toLocaleString()} minted
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
            <h2 className="text-4xl font-bold text-hero-text mb-4">NFT Utilities</h2>
            <p className="text-xl text-muted-text max-w-3xl mx-auto">
              Each VapeFi Genesis NFT comes with exclusive benefits and utilities within our ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-background border-card-border hover:border-button-green/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-button-green/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-button-green" />
                </div>
                <CardTitle className="text-hero-text">Exclusive Access</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-text">
                  Get priority access to new features, beta testing, and VapeFi ecosystem launches
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-card-border hover:border-button-green/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-button-green/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-button-green" />
                </div>
                <CardTitle className="text-hero-text">Governance Rights</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-text">
                  Participate in DAO governance and help shape the future direction of VapeFi
                </p>
              </CardContent>
            </Card>

            <Card className="bg-background border-card-border hover:border-button-green/50 transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-button-green/20 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-button-green" />
                </div>
                <CardTitle className="text-hero-text">Rewards & Benefits</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-text">
                  Earn exclusive rewards, airdrops, and special benefits as a Genesis holder
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Collection Roadmap */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hero-text mb-4">Collection Roadmap</h2>
            <p className="text-xl text-muted-text">
              Our journey to revolutionize the vaping industry with blockchain technology
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  phase: "Phase 1",
                  title: "Genesis Launch",
                  description: "Launch of 1,000 unique VapeFi Genesis NFTs with exclusive artwork and utilities",
                  status: "current"
                },
                {
                  phase: "Phase 2", 
                  title: "Community Building",
                  description: "Build a strong community of vaping enthusiasts and establish governance framework",
                  status: "upcoming"
                },
                {
                  phase: "Phase 3",
                  title: "Ecosystem Expansion", 
                  description: "Launch VapeFi marketplace, staking mechanisms, and partner integrations",
                  status: "upcoming"
                },
                {
                  phase: "Phase 4",
                  title: "Global Adoption",
                  description: "Expand globally with new partnerships and innovative blockchain solutions",
                  status: "upcoming"
                }
              ].map((item, index) => (
                <div key={index} className="flex gap-6 items-start">
                  <div className={`w-4 h-4 rounded-full mt-2 flex-shrink-0 ${
                    item.status === 'current' ? 'bg-button-green' : 'bg-card-border'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-hero-text">{item.phase}</h3>
                      <Badge variant={item.status === 'current' ? 'default' : 'secondary'}>
                        {item.status === 'current' ? 'Current' : 'Coming Soon'}
                      </Badge>
                    </div>
                    <h4 className="text-lg font-semibold text-hero-text mb-2">{item.title}</h4>
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