import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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
  const { isAuthenticated, signInWithWallet, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleClick = async () => {
    if (isAuthenticated) {
      // Already authenticated, go to tracking
      navigate(redirectTo);
      return;
    }

    if (!connected) {
      // Show wallet selection modal
      setIsConnecting(true);
      setVisible(true);
      return;
    }

    // Connected but not authenticated, sign in with Web3
    const success = await signInWithWallet();
    if (success) {
      navigate(redirectTo);
    }
  };

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
    if (isAuthenticated) return children;
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