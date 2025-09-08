-- Ensure a single cache row per wallet
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'nft_cache_wallet_unique'
  ) THEN
    ALTER TABLE public.nft_cache
    ADD CONSTRAINT nft_cache_wallet_unique UNIQUE (wallet_address);
  END IF;
END $$;