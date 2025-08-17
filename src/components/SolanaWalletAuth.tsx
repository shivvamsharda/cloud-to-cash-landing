import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';

interface SolanaWalletAuthProps {
  onSuccess?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const SolanaWalletAuth: React.FC<SolanaWalletAuthProps> = ({ 
  onSuccess, 
  className = "",
  children 
}) => {
  const wallet = useWallet();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'I accept the VapeFi Terms of Service',
        wallet: wallet as any,
      });

      if (error) {
        console.error('Supabase auth error:', error);
        toast({
          title: "Authentication failed",
          description: error.message || "Failed to authenticate with wallet",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Successfully connected!",
        description: "Welcome to VapeFi - start earning rewards!",
      });

      // Navigate to tracking page
      navigate('/track');
      onSuccess?.();
    } catch (error) {
      console.error('Wallet authentication error:', error);
      toast({
        title: "Authentication error",
        description: "An unexpected error occurred during authentication",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If user is already authenticated, show different content
  if (user) {
    return (
      <Button 
        onClick={() => navigate('/track')}
        className={className}
        variant="hero-primary"
        size="lg"
      >
        {children || "Go to Tracking"}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {wallet.connected ? (
        <Button
          onClick={handleSignIn}
          disabled={loading}
          className={className}
          variant="hero-primary"
          size="lg"
        >
          {loading ? "Authenticating..." : children || "Sign In & Start Earning"}
        </Button>
      ) : (
        <WalletMultiButton className={`wallet-adapter-button rounded-full ${className}`}>
          {children || "Connect Wallet"}
        </WalletMultiButton>
      )}
    </div>
  );
};

export default SolanaWalletAuth;