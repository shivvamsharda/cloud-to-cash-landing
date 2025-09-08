// Handle multiple transactions for multiple NFTs
      if (data.transactions && Array.isArray(data.transactions)) {
        console.log(`Received ${data.transactions.length} transactions for ${quantity} NFTs`);
        
        if (data.transactions.length !== quantity) {
          console.warn(`Expected ${quantity} transactions but got ${data.transactions.length}`);
        }
        
        const signatures = [];
        
        // Process each transaction sequentially
        for (let i = 0; i < data.transactions.length; i++) {
          const txData = data.transactions[i];
          console.log(`\n=== Processing NFT ${i + 1}/${data.transactions.length} ===`);
          console.log(`NFT Mint: ${txData.nftMint}`);
          
          toast.info(`Signing transaction ${i + 1} of ${data.transactions.length}...`);
          
          try {
                  // Handle multiple transactions for multiple NFTs
      if (data.transactions && Array.isArray(data.transactions)) {
        console.log(`Received ${data.transactions.length} transactions for ${quantity} NFTs`);
        
        if (data.transactions.length !== quantity) {
          console.warn(`Expected ${quantity} transactions but got ${data.transactions.length}`);
        }
        
        const signatures = [];
        let successCount = 0;
        
        for (let i = 0; i < data.transactions.length; i++) {
          const txData = data.transactions[i];
          console.log(`\n=== Processing NFT ${i + 1}/${data.transactions.length} ===`);
          console.log(`NFT Mint: ${txData.nftMint}`);
          
          try {
            // Decode base64 transaction
            const transactionBytes = Uint8Array.from(
              atob(txData.transaction),
              c => c.charCodeAt(0)
            );
            
            // Deserialize versioned transaction
            const transaction = VersionedTransaction.deserialize(transactionBytes);
            console.log(`Transaction ${i + 1} deserialized successfully`);

            // Signimport React, { useState, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { VersionedTransaction, TransactionMessage } from '@solana/web3.js';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Minus, Plus, Loader2, Zap, Shield, Star } from 'lucide-react';
import { useCollectionStats } from '@/hooks/useCollectionStats';
import { Progress } from '@/components/ui/progress';
import { CANDY_MACHINE_CONFIG, getSolscanUrl, formatSol } from '@/config/candyMachine';
import { supabase } from '@/integrations/supabase/client';

const NFTMint = () => {
  const [mintQuantity, setMintQuantity] = useState(1);
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
    if (collectionStats.remaining < mintQuantity) {
      toast.error(CANDY_MACHINE_CONFIG.ERRORS.SOLD_OUT);
      return;
    }

    setIsMinting(true);
    
    try {
      console.log('Starting mint process...', {
        wallet: publicKey.toString(),
        quantity: mintQuantity,
        totalCost: mintQuantity * collectionStats.price
      });

      // Call edge function
      const { data, error } = await supabase.functions.invoke('mint-nft-v2', {
        body: {
          walletAddress: publicKey.toString(),
          quantity: mintQuantity
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

      // Handle multiple transactions for multiple NFTs
      if (data.transactions && Array.isArray(data.transactions)) {
        console.log(`Received ${data.transactions.length} transactions for ${quantity} NFTs`);
        
        const signatures = [];
        const failedMints = [];
        
        // Deserialize all transactions first
        const deserializedTransactions = [];
        for (let i = 0; i < data.transactions.length; i++) {
          try {
            const transactionBytes = Uint8Array.from(
              atob(data.transactions[i].transaction),
              c => c.charCodeAt(0)
            );
            const transaction = VersionedTransaction.deserialize(transactionBytes);
            deserializedTransactions.push({
              transaction,
              nftMint: data.transactions[i].nftMint,
              index: i
            });
          } catch (e) {
            console.error(`Failed to deserialize transaction ${i + 1}:`, e);
            failedMints.push(i + 1);
          }
        }
        
        if (failedMints.length > 0) {
          throw new Error(`Failed to prepare transactions for NFTs: ${failedMints.join(', ')}`);
        }
        
        // Process each transaction sequentially
        for (const { transaction, nftMint, index } of deserializedTransactions) {
          try {
            console.log(`\n=== Minting NFT ${index + 1}/${deserializedTransactions.length} ===`);
            console.log(`NFT Mint Address: ${nftMint}`);
            
            // Update UI to show progress
            if (index > 0) {
              toast.loading(`Processing NFT ${index + 1} of ${deserializedTransactions.length}...`);
            }
            
            // Sign transaction
            console.log(`Requesting signature for transaction ${index + 1}...`);
            const signedTransaction = await signTransaction(transaction);
            console.log(`Transaction ${index + 1} signed`);
            
            // Send transaction
            const signature = await connection.sendRawTransaction(
              signedTransaction.serialize(),
              {
                skipPreflight: false,
                preflightCommitment: 'confirmed',
                maxRetries: 3
              }
            );
            console.log(`Transaction ${index + 1} sent: ${signature}`);
            
            // Store signature
            signatures.push({
              signature,
              nftMint,
              index: index + 1
            });
            
            // Small delay between transactions to avoid rate limiting
            if (index < deserializedTransactions.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            // Don't wait for confirmation here - do it in batch later
            
          } catch (error) {
            console.error(`Failed to mint NFT ${index + 1}:`, error);
            
            // Check if user rejected
            if (error?.message?.includes('rejected') || error?.message?.includes('cancelled')) {
              toast.error('Minting cancelled by user');
              break; // Stop trying to mint more
            }
            
            failedMints.push(index + 1);
            // Continue trying remaining NFTs
          }
        }
        
        // If no signatures were collected, all failed
        if (signatures.length === 0) {
          throw new Error('All mint transactions failed');
        }
        
        // Wait for confirmations
        console.log(`Confirming ${signatures.length} transactions...`);
        toast.loading(`Confirming ${signatures.length} transaction${signatures.length > 1 ? 's' : ''}...`);
        
        const latestBlockhash = await connection.getLatestBlockhash();
        const confirmedSignatures = [];
        
        for (const { signature, nftMint, index } of signatures) {
          try {
            const confirmation = await connection.confirmTransaction({
              signature,
              blockhash: data.blockhash || latestBlockhash.blockhash,
              lastValidBlockHeight: data.lastValidBlockHeight || latestBlockhash.lastValidBlockHeight
            }, 'confirmed');
            
            if (confirmation.value.err) {
              console.error(`Transaction ${index} failed:`, confirmation.value.err);
              failedMints.push(index);
            } else {
              confirmedSignatures.push({ signature, nftMint, index });
            }
          } catch (error) {
            console.error(`Failed to confirm transaction ${index}:`, error);
            failedMints.push(index);
          }
        }
        
        // Report results
        if (confirmedSignatures.length > 0) {
          setLastMintSignature(confirmedSignatures[0].signature);
          
          const message = failedMints.length > 0
            ? `Successfully minted ${confirmedSignatures.length} of ${quantity} NFTs. Failed: ${failedMints.join(', ')}`
            : `Successfully minted all ${confirmedSignatures.length} NFTs!`;
          
          toast.success(message, {
            action: {
              label: 'View Transaction',
              onClick: () => window.open(getSolscanUrl(confirmedSignatures[0].signature), '_blank')
            }
          });
          
          // Log all successful mints
          console.log('Successfully minted NFTs:');
          confirmedSignatures.forEach(({ signature, nftMint }) => {
            console.log(`- ${nftMint}: ${signature}`);
          });
        } else {
          throw new Error(`All ${quantity} mint transactions failed`);
        }
        
      } else if (data.transaction) {
        // Fallback to single transaction (old format)
        console.log('Single transaction mode');
        
        // Decode base64 transaction
        let transaction: VersionedTransaction;
        try {
          const transactionBytes = Uint8Array.from(
            atob(data.transaction),
            c => c.charCodeAt(0)
          );
          
          transaction = VersionedTransaction.deserialize(transactionBytes);
          console.log('Transaction deserialized successfully');
        } catch (e) {
          console.error('Deserialization error:', e);
          throw new Error('Failed to decode transaction');
        }

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
        
        toast.success(
          `Successfully minted ${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''}!`,
          {
            action: {
              label: 'View Transaction',
              onClick: () => window.open(getSolscanUrl(signature), '_blank')
            }
          }
        );
      } else {
        throw new Error('No transaction returned from server');
      }
      
      // Reset quantity
      setMintQuantity(1);
      
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
      
      // Try to get transaction logs if available
      if (error?.logs) {
        console.error('Transaction logs:', error.logs);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsMinting(false);
    }
  }, [connected, publicKey, signTransaction, mintQuantity, collectionStats, connection]);

  const adjustQuantity = (change: number) => {
    const newQuantity = mintQuantity + change;
    if (newQuantity >= 1 && newQuantity <= CANDY_MACHINE_CONFIG.MAX_MINT_PER_TRANSACTION) {
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

  const totalCostLabel = formatSol(mintQuantity * collectionStats.price);
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
                <div className="grid md:grid-cols-3 gap-8 items-center">
                  
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

                  {/* Quantity Selector */}
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-hero-text mb-4">Select Quantity</h4>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustQuantity(-1)}
                        disabled={mintQuantity <= 1 || isMinting}
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
                        disabled={mintQuantity >= CANDY_MACHINE_CONFIG.MAX_MINT_PER_TRANSACTION || isMinting}
                        className="h-12 w-12"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-text">Max {CANDY_MACHINE_CONFIG.MAX_MINT_PER_TRANSACTION} per transaction</p>
                  </div>

                  {/* Mint Button */}
                  <div className="text-center md:text-right">
                    <div className="mb-4">
                      <p className="text-lg font-semibold text-hero-text">
                        {totalCostLabel}
                      </p>
                      <p className="text-sm text-muted-text">
                        {formatSol(collectionStats.price)} each
                      </p>
                    </div>
                    
                    {connected ? (
                      <div className="space-y-3">
                        <Button
                          variant="hero-primary"
                          size="lg"
                          onClick={handleMint}
                          disabled={isMinting || !collectionStats?.isLive || collectionStats.remaining === 0}
                          className="w-full md:w-auto px-8 py-4 text-lg font-bold"
                        >
                          {isMinting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Minting...
                            </>
                          ) : collectionStats.remaining === 0 ? (
                            'Sold Out'
                          ) : !collectionStats.isLive ? (
                            'Not Live'
                          ) : (
                            `Mint ${mintQuantity} NFT${mintQuantity > 1 ? 's' : ''}`
                          )}
                        </Button>
                        {lastMintSignature && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-button-green">Success!</span>
                            <a
                              href={getSolscanUrl(lastMintSignature)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-button-green hover:underline flex items-center gap-1"
                            >
                              View Transaction
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full md:w-auto">
                        <WalletMultiButton className="!bg-gradient-to-r !from-button-green !to-button-green/80 !text-pure-black !font-bold !px-8 !py-4 !text-lg !rounded-lg hover:!from-button-green/90 hover:!to-button-green/70 !transition-all" />
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