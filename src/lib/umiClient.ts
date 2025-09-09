import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { WalletAdapter } from '@solana/wallet-adapter-base';

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
    // This comes from an edge function that has access to secrets
    // For now, we'll use the default mainnet endpoint
    return 'https://api.mainnet-beta.solana.com';
  } catch (error) {
    console.warn('Failed to fetch RPC endpoint, using default:', error);
    return 'https://api.mainnet-beta.solana.com';
  }
};