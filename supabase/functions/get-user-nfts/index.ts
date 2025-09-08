import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
const devnetRpc = Deno.env.get('DEVNET_RPC');
const collectionMintId = Deno.env.get('COLLECTION_MINT_ID');

if (!supabaseUrl || !supabaseAnonKey || !devnetRpc || !collectionMintId) {
  console.error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

interface NFTAttribute {
  trait_type: string;
  value: string;
}

interface UserNFT {
  id: string;
  name: string;
  image: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  multiplier: number;
  attributes: NFTAttribute[];
  mint: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress } = await req.json();
    
    if (!walletAddress) {
      return new Response(JSON.stringify({ error: 'Wallet address is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching NFTs for wallet: ${walletAddress}`);

    // Use Helius DAS API to get assets by owner
    const response = await fetch(devnetRpc!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'get-user-nfts',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: walletAddress,
          page: 1,
          limit: 1000,
          displayOptions: {
            showFungible: false,
            showNativeBalance: false,
          },
        },
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      console.error('RPC Error:', data.error);
      return new Response(JSON.stringify({ error: data.error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter NFTs by collection
    const allAssets = data.result?.items || [];
    const collectionNFTs = allAssets.filter((asset: any) => {
      return asset.grouping?.find((group: any) => 
        group.group_key === 'collection' && 
        group.group_value === collectionMintId
      );
    });

    console.log(`Found ${collectionNFTs.length} NFTs from collection`);

    // Transform to our NFT format
    const userNFTs: UserNFT[] = collectionNFTs.map((asset: any) => {
      const metadata = asset.content?.metadata;
      const attributes = metadata?.attributes || [];
      
      // Determine rarity based on attributes or name
      let rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' = 'Common';
      let multiplier = 1.0;

      const rarityAttr = attributes.find((attr: any) => 
        attr.trait_type?.toLowerCase() === 'rarity'
      );
      
      if (rarityAttr) {
        rarity = rarityAttr.value as any;
      } else {
        // Fallback: determine rarity from other attributes or name
        const name = metadata?.name || '';
        if (name.includes('Legendary') || attributes.length >= 8) {
          rarity = 'Legendary';
        } else if (name.includes('Epic') || attributes.length >= 6) {
          rarity = 'Epic';
        } else if (name.includes('Rare') || attributes.length >= 4) {
          rarity = 'Rare';
        }
      }

      // Set multiplier based on rarity
      switch (rarity) {
        case 'Legendary': multiplier = 3.0; break;
        case 'Epic': multiplier = 2.0; break;
        case 'Rare': multiplier = 1.5; break;
        default: multiplier = 1.0; break;
      }

      // Check for specific multiplier attribute
      const multiplierAttr = attributes.find((attr: any) => 
        attr.trait_type?.toLowerCase() === 'multiplier'
      );
      if (multiplierAttr) {
        const parsedMultiplier = parseFloat(multiplierAttr.value);
        if (!isNaN(parsedMultiplier)) {
          multiplier = parsedMultiplier;
        }
      }

      return {
        id: asset.id,
        name: metadata?.name || `NFT #${asset.id.slice(-4)}`,
        image: metadata?.image || asset.content?.links?.image || '',
        rarity,
        multiplier,
        attributes: attributes.map((attr: any) => ({
          trait_type: attr.trait_type || 'Unknown',
          value: attr.value || 'Unknown',
        })),
        mint: asset.id,
      };
    });

    // Cache the results in Supabase for 5 minutes
    try {
      const { error: cacheError } = await supabase
        .from('nft_cache')
        .upsert({
          wallet_address: walletAddress,
          nfts: userNFTs,
          cached_at: new Date().toISOString(),
        });
      
      if (cacheError) {
        console.warn('Failed to cache NFTs:', cacheError);
      }
    } catch (cacheErr) {
      console.warn('Cache operation failed:', cacheErr);
    }

    return new Response(JSON.stringify({ nfts: userNFTs }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-user-nfts function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      nfts: [] 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});