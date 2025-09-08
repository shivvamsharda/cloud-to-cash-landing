import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useWalletDisconnect = () => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { disconnect } = useWallet();
  const { signOut } = useAuth();

  const handleDisconnect = async () => {
    if (isDisconnecting) return; // Prevent multiple simultaneous disconnects
    
    setIsDisconnecting(true);
    
    try {
      // Step 1: Disconnect wallet first to ensure clean state
      if (disconnect) {
        await disconnect();
      }
      
      // Step 2: Sign out from Supabase auth
      await signOut();
      
      toast.success('Successfully disconnected wallet and signed out');
    } catch (error: any) {
      console.error('Disconnect error:', error);
      
      // If one operation fails, try to complete the other
      try {
        if (disconnect) {
          await disconnect();
        }
        await signOut();
        toast.success('Disconnected with some issues - please refresh if needed');
      } catch (fallbackError: any) {
        console.error('Fallback disconnect error:', fallbackError);
        toast.error(`Failed to disconnect: ${error.message}`);
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  return {
    handleDisconnect,
    isDisconnecting
  };
};