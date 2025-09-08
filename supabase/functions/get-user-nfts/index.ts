import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const devnetRpc = Deno.env.get('DEVNET_RPC');
const collectionMintId = Deno.env.get('COLLECTION_MINT_ID');
const verifiedCreator = Deno.env.get('VERIFIED_CREATOR'); // Optional fallback

if (!supabaseUrl || !supabaseAnonKey || !devnetRpc || !collectionMintId) {
  console.error('Missing required environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
const supabaseServiceRole = createClient(supabaseUrl!, supabaseServiceRoleKey!);

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

    // Check cache first (5 minute expiry)
    const { data: cachedData } = await supabaseServiceRole
      .from('nft_cache')
      .select('nft_data, cached_at')
      .eq('wallet_address', walletAddress)
      .gte('cached_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // 5 minutes ago
      .maybeSingle();

    if (cachedData) {
      console.log(`Returning cached NFTs for wallet: ${walletAddress}`);
      return new Response(JSON.stringify({ nfts: cachedData.nft_data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use searchAssets for more flexible collection detection
    const searchResponse = await fetch(devnetRpc!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'search-assets',
        method: 'searchAssets',
        params: {
          ownerAddress: walletAddress,
          grouping: ["collection", collectionMintId],
          page: 1,
          limit: 1000,
        },
      }),
    });

    let data = await searchResponse.json();
    let collectionNFTs = data.result?.items || [];
    
    if (data.error) {
      console.error('Search Assets RPC Error:', data.error);
    }

    // If no results and we have a verified creator, try that fallback
    if (collectionNFTs.length === 0 && verifiedCreator) {
      console.log(`No NFTs found by collection, trying verified creator: ${verifiedCreator}`);
      
      const creatorResponse = await fetch(devnetRpc!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'search-by-creator',
          method: 'searchAssets',
          params: {
            ownerAddress: walletAddress,
            creatorAddress: verifiedCreator,
            page: 1,
            limit: 1000,
          },
        }),
      });

      const creatorData = await creatorResponse.json();
      if (!creatorData.error) {
        collectionNFTs = creatorData.result?.items || [];
        console.log(`Found ${collectionNFTs.length} NFTs by creator`);
      }
    }

    // Final fallback: get all assets and filter by collection or creator
    if (collectionNFTs.length === 0) {
      console.log('No NFTs found with search methods, trying getAssetsByOwner...');
      
      const ownerResponse = await fetch(devnetRpc!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'get-by-owner',
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

      const ownerData = await ownerResponse.json();
      
      if (!ownerData.error) {
        const allAssets = ownerData.result?.items || [];
        console.log(`Found ${allAssets.length} total assets for wallet`);
        
        // Filter by collection, creator, or metadata attributes
        collectionNFTs = allAssets.filter((asset: any) => {
          // Check collection grouping
          const hasCollectionGrouping = asset.grouping?.find((group: any) => 
            group.group_key === 'collection' && 
            group.group_value === collectionMintId
          );
          
          if (hasCollectionGrouping) return true;
          
          // Check creator
          if (verifiedCreator && asset.creators?.find((creator: any) => 
            creator.address === verifiedCreator
          )) {
            return true;
          }
          
          // Check if metadata contains collection reference
          const metadata = asset.content?.metadata;
          if (metadata?.collection?.name && metadata.collection.name.includes('VapeFi')) {
            return true;
          }
          
          return false;
        });
      }
    }

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

    // Cache the results in Supabase using service role
    try {
      const { error: cacheError } = await supabaseServiceRole
        .from('nft_cache')
        .upsert({
          wallet_address: walletAddress,
          nft_data: userNFTs,
          cached_at: new Date().toISOString(),
        });
      
      if (cacheError) {
        console.warn('Failed to cache NFTs:', cacheError);
      } else {
        console.log(`Cached ${userNFTs.length} NFTs for wallet: ${walletAddress}`);
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