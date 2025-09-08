-- Create nft_cache table for caching user NFTs
CREATE TABLE IF NOT EXISTS public.nft_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  nft_data JSONB NOT NULL,
  cached_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient wallet lookups
CREATE INDEX IF NOT EXISTS idx_nft_cache_wallet_address ON public.nft_cache(wallet_address);

-- Create index for cache expiration queries
CREATE INDEX IF NOT EXISTS idx_nft_cache_cached_at ON public.nft_cache(cached_at);

-- Enable RLS
ALTER TABLE public.nft_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for service role access (used by edge functions)
CREATE POLICY "Service role can manage all NFT cache" 
ON public.nft_cache 
FOR ALL 
USING (true) 
WITH CHECK (true);