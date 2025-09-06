import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const WalletAuth: React.FC = () => {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const { user, signOut } = useAuth();

  const handleSignIn = async () => {
    if (!connected || !publicKey || !signMessage) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      // Create a wrapper object that matches Supabase's expected interface
      const walletAdapter = {
        publicKey: {
          toBase58: () => publicKey.toBase58(),
        },
        signMessage: async (message: Uint8Array) => {
          const signature = await signMessage(message);
          return new Uint8Array(signature);
        }
      };

      const { error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'Sign in to VapeFi to track your usage and earn tokens',
        wallet: walletAdapter,
      });

      if (error) throw error;
      
      toast.success('Successfully signed in with your wallet!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(`Failed to sign in: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      if (disconnect) {
        await disconnect();
      }
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(`Failed to sign out: ${error.message}`);
    }
  };

  if (user) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {connected ? (
        <Button onClick={handleSignIn} variant="hero-primary">
          Sign In with Solana
        </Button>
      ) : (
        <WalletMultiButton className="!bg-[hsl(var(--button-green))] !text-[hsl(var(--pure-black))] hover:!bg-[hsl(var(--button-green))]/90 !rounded-full !h-10 !px-6" />
      )}
    </div>
  );
};