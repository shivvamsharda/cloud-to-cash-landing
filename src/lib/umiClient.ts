import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { WalletAdapter } from '@solana/wallet-adapter-base';

/**
 * Creates a Umi client instance configured for the current wallet and network
 */
export const createUmiClient = (wallet: WalletAdapter | null, rpcEndpoint?: string) => {
  // Default to devnet if no RPC endpoint provided
  const endpoint = rpcEndpoint || 'https://api.devnet.solana.com';
  
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
    // This would typically come from an edge function that has access to secrets
    // For now, we'll use the default devnet endpoint
    return 'https://api.devnet.solana.com';
  } catch (error) {
    console.warn('Failed to fetch RPC endpoint, using default:', error);
    return 'https://api.devnet.solana.com';
  }
};