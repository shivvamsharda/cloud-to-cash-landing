/**
 * Candy Machine configuration constants
 * These should match the values stored in Supabase secrets
 */
export const CANDY_MACHINE_CONFIG = {
  // Default values - actual values come from Supabase secrets via edge functions
  DEFAULT_MINT_PRICE: 0.02, // SOL
  MAX_MINT_PER_TRANSACTION: 10,
  NETWORK: 'mainnet' as const,
  
  // Error messages
  ERRORS: {
    WALLET_NOT_CONNECTED: 'Please connect your wallet to mint NFTs',
    INSUFFICIENT_FUNDS: 'Insufficient SOL balance for minting',
    SOLD_OUT: 'Collection is sold out',
    INVALID_QUANTITY: 'Invalid mint quantity',
    MINT_FAILED: 'Minting failed. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  },
  
  // Success messages
  SUCCESS: {
    MINT_SUCCESS: 'NFT minted successfully!',
    TRANSACTION_CONFIRMED: 'Transaction confirmed',
  }
} as const;

/**
 * Get Solana Explorer URL for a transaction
 */
export const getSolanaExplorerUrl = (signature: string, network: 'mainnet' | 'devnet' = 'mainnet') => {
  const cluster = network === 'devnet' ? '?cluster=devnet' : '';
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
};

/**
 * Format SOL amount for display
 */
export const formatSol = (amount: number) => {
  return `${amount.toFixed(3)} SOL`;
};