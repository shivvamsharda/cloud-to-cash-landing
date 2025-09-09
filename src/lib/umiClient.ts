import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { WalletAdapter } from '@solana/wallet-adapter-base';

/**
 * Creates a Umi client instance configured for the current wallet and network
 */
export const createUmiClient = (wallet: WalletAdapter | null, rpcEndpoint?: string) => {
  // Use provided endpoint or fallback
  const endpoint = rpcEndpoint || 'https://api.mainnet-beta.solana.com';
  
  // Create Umi instance
  const umi = createUmi(endpoint);
  
  // If wallet is connected, use it as identity
  if (wallet) {
    umi.use(walletAdapterIdentity(wallet));
  }
  
  return umi;
};
