import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import ProfileCreationModal from './ProfileCreationModal';

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
  const { user, profile, profileLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

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
      const walletAddress = wallet.publicKey.toString();
      
      const { error } = await supabase.auth.signInWithWeb3({
        chain: 'solana',
        statement: 'I accept the VapeFi Terms of Service',
        wallet: wallet as any,
        options: {
          data: {
            wallet_address: walletAddress,
          },
        },
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

      // Wait a moment for profile to load, then check if complete
      setTimeout(() => {
        checkProfileAndProceed();
      }, 1000);
      
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

  const checkProfileAndProceed = async () => {
    if (!user) return;
    
    // Refresh profile to get latest data
    await refreshProfile();
    
    // Check if profile is complete (has name, twitter_username, and wallet_address)
    if (!profile || !profile.name || !profile.twitter_username || !profile.wallet_address) {
      setShowProfileModal(true);
    } else {
      navigate('/track');
    }
  };

  const handleProfileCreated = async () => {
    await refreshProfile();
    navigate('/track');
  };

  // Check profile completeness when user/profile changes
  useEffect(() => {
    if (user && profile !== null && !profileLoading) {
      if (!profile || !profile.name || !profile.twitter_username || !profile.wallet_address) {
        setShowProfileModal(true);
      }
    }
  }, [user, profile, profileLoading]);

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
    <>
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
      
      <ProfileCreationModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onProfileCreated={handleProfileCreated}
      />
    </>
  );
};

export default SolanaWalletAuth;