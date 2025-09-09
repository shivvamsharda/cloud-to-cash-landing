import React, { ReactNode, useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { supabase } from '@/integrations/supabase/client';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextProviderProps {
  children: ReactNode;
}

export const WalletContextProvider: React.FC<WalletContextProviderProps> = ({ children }) => {
  const [endpoint, setEndpoint] = useState<string>('https://api.mainnet-beta.solana.com');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch RPC endpoint from edge function
  useEffect(() => {
    const fetchEndpoint = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-rpc-endpoint');
        
        if (error) {
          console.warn('Failed to fetch RPC endpoint from edge function:', error);
          setIsLoading(false);
          return;
        }

        const rpcEndpoint = data?.rpcEndpoint || 'https://api.mainnet-beta.solana.com';
        setEndpoint(rpcEndpoint);
        
        // Log warning if we're still on public endpoint
        if (rpcEndpoint.includes('api.mainnet-beta.solana.com')) {
          console.warn('Using public Solana RPC endpoint - may encounter rate limits');
        } else {
          console.log('Using Solana RPC host:', new URL(rpcEndpoint).hostname);
        }
      } catch (error) {
        console.warn('Failed to load RPC endpoint, using default:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEndpoint();
  }, []);
  
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  // Show loading state briefly while fetching endpoint
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-button-green"></div>
      </div>
    );
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};