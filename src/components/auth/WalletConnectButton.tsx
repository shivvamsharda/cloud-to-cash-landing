import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';

interface WalletConnectButtonProps {
  children: React.ReactNode;
  variant?: any;
  className?: string;
  size?: any;
  redirectTo?: string;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ 
  children, 
  variant, 
  className, 
  size,
  redirectTo = '/track' 
}) => {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { isAuthenticated, profileComplete, signInWithWallet, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Use auth navigation hook for automatic redirects
  useAuthNavigation();

  const handleClick = async () => {
    if (isAuthenticated && profileComplete) {
      // Fully authenticated with complete profile, go to tracking
      navigate(redirectTo);
      return;
    }

    if (isAuthenticated && profileComplete === false) {
      // Authenticated but incomplete profile, go to setup
      navigate('/setup-profile');
      return;
    }

    if (!connected) {
      // Show wallet selection modal
      setIsConnecting(true);
      setVisible(true);
      return;
    }

    // Connected but not authenticated, sign in with Web3
    try {
      const success = await signInWithWallet();
      // useAuthNavigation hook will handle automatic redirection
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  // Only navigate after explicit button click authentication
  // Remove automatic navigation to prevent interference with other navigation

  // Reset connecting state when wallet connects (but don't auto-authenticate)
  useEffect(() => {
    if (connected && isConnecting) {
      setIsConnecting(false);
    }
  }, [connected, isConnecting]);

  const isLoading = isAuthenticating || isConnecting;

  // Determine button text based on state
  const getButtonText = () => {
    if (isLoading) {
      if (isAuthenticating) return 'Signing...';
      if (isConnecting) return 'Connecting...';
    }
    if (isAuthenticated && profileComplete) return children;
    if (isAuthenticated && profileComplete === false) return 'Complete Profile';
    if (connected) return 'Sign Message';
    return 'Connect Wallet';
  };

  return (
    <Button 
      variant={variant} 
      className={className} 
      size={size}
      onClick={handleClick}
      disabled={isLoading}
    >
      {getButtonText()}
    </Button>
  );
};