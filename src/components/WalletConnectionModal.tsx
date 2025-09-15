import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Wallet, Shield, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const navigate = useNavigate();
  const { publicKey, signMessage } = useWallet();
  const { user } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Close modal if user becomes authenticated
  useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

  const handleSignIn = async () => {
    if (!publicKey || !signMessage) return;

    setIsSigningIn(true);
    try {
      const message = `Sign in to VapeFi with your wallet address: ${publicKey.toString()}`;
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);

      const { error } = await supabase.auth.signInWithPassword({
        email: `${publicKey.toString()}@solana.wallet`,
        password: signature.toString(),
      });

      if (error) {
        // If user doesn't exist, create account
        const { error: signUpError } = await supabase.auth.signUp({
          email: `${publicKey.toString()}@solana.wallet`,
          password: signature.toString(),
          options: {
            data: {
              wallet_address: publicKey.toString(),
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (signUpError) {
          toast.error(`Authentication failed: ${signUpError.message}`);
          return;
        }
      }

      toast.success('Successfully signed in with your wallet!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(`Failed to sign in: ${error.message}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleCancel = () => {
    onClose();
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!bg-neutral-900 !border-neutral-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-white mb-2">
            Connect Your Wallet
          </DialogTitle>
          <DialogDescription className="text-center text-white/70 text-base">
            Connect your Solana wallet to start tracking puffs and earning $VAPE tokens
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Benefits */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--button-green))]/20 flex items-center justify-center">
                <Coins className="w-4 h-4 text-[hsl(var(--button-green))]" />
              </div>
              <span>Earn 0.1 $VAPE tokens per puff</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--effect-purple))]/20 flex items-center justify-center">
                <Shield className="w-4 h-4 text-[hsl(var(--effect-purple))]" />
              </div>
              <span>Secure blockchain authentication</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-blue-400" />
              </div>
              <span>Track your vaping progress</span>
            </div>
          </div>

          {/* Connection Steps */}
          <div className="space-y-4">
            {!publicKey ? (
              <div className="text-center">
                <p className="text-white/60 mb-4 text-sm">
                  Step 1: Connect your Solana wallet
                </p>
                <div className="flex justify-center">
                  <WalletMultiButton className="!bg-[hsl(var(--button-green))] !text-[hsl(var(--pure-black))] hover:!bg-[hsl(var(--button-green))]/90 !rounded-full !font-semibold !px-6 !py-3" />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-white/60 mb-4 text-sm">
                  Step 2: Sign in to VapeFi with your wallet
                </p>
                <Button
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="w-full rounded-full bg-[hsl(var(--button-green))] text-[hsl(var(--pure-black))] hover:bg-[hsl(var(--button-green))]/90 font-semibold py-3"
                >
                  {isSigningIn ? 'Signing In...' : 'Sign In with Solana'}
                </Button>
              </div>
            )}
          </div>

          {/* Cancel Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleCancel}
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              Cancel & Go Back
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};