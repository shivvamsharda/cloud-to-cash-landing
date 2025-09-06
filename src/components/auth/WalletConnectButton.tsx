import React, { useState, useEffect, useRef } from 'react';
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
  const { setVisible, visible } = useWalletModal();
  const { isAuthenticated, profileComplete, signInWithWallet, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const clickGuardRef = useRef(false);
  
  // Use auth navigation hook for automatic redirects
  useAuthNavigation();

  const handleClick = async () => {
    // If fully authenticated, go to tracking
    if (isAuthenticated && profileComplete) {
      navigate(redirectTo);
      return;
    }

    // If authenticated but profile incomplete, go to setup
    if (isAuthenticated && profileComplete === false) {
      navigate('/setup-profile');
      return;
    }

    // If not connected, open wallet modal
    if (!connected) {
      setIsConnecting(true);
      setVisible(true);
      return;
    }

    // Guard against duplicate sign-ins
    if (isAuthenticating || clickGuardRef.current) return;
    clickGuardRef.current = true;

    try {
      if (visible) setVisible(false);
      const success = await signInWithWallet();
      if (success) {
        if (profileComplete) {
          navigate(redirectTo);
        } else {
          navigate('/setup-profile');
        }
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      clickGuardRef.current = false;
    }
  };

  // Only navigate after explicit button click authentication
  // Remove automatic navigation to prevent interference with other navigation

  // Reset connecting state when wallet connects (no auto sign-in)
  useEffect(() => {
    if (connected && isConnecting) {
      setIsConnecting(false);
    }
  }, [connected, isConnecting]);

  // Reset connecting if modal closes without a connection
  useEffect(() => {
    if (!visible && isConnecting && !connected) {
      setIsConnecting(false);
    }
  }, [visible, isConnecting, connected]);

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