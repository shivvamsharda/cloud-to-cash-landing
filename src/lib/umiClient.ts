import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { WalletAdapter } from '@solana/wallet-adapter-base';
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a Umi client instance configured for the current wallet and network
 */
export const createUmiClient = (wallet: WalletAdapter | null, rpcEndpoint?: string) => {
  // Default to mainnet if no RPC endpoint provided
  const endpoint = rpcEndpoint || 'https://api.mainnet-beta.solana.com';
  
  // Create Umi instance
  const umi = createUmi(endpoint);
  
  // If wallet is connected, use it as identity
  if (wallet) {
    umi.use(walletAdapterIdentity(wallet));
  }
  
  return umi;
};

/**
 * Gets RPC endpoint from edge function (since secrets can't be accessed directly in frontend)
 */
export const getRpcEndpoint = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('get-rpc-endpoint');
    
    if (error) {
      console.warn('Failed to fetch RPC endpoint from edge function:', error);
      return 'https://api.mainnet-beta.solana.com';
    }

    const endpoint = data?.rpcEndpoint || 'https://api.mainnet-beta.solana.com';
    
    // Log warning if we're still on public endpoint
    if (endpoint.includes('api.mainnet-beta.solana.com')) {
      console.warn('Using public Solana RPC endpoint - may encounter rate limits');
    } else {
      console.log('Using Solana RPC host:', new URL(endpoint).hostname);
    }
    
    return endpoint;
  } catch (error) {
    console.warn('Failed to fetch RPC endpoint, using default:', error);
    return 'https://api.mainnet-beta.solana.com';
  }
};