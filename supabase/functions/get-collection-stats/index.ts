import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0?target=deno';
import { createUmi } from 'https://esm.sh/@metaplex-foundation/umi-bundle-defaults@1.4.1?target=deno'
import { publicKey } from 'https://esm.sh/@metaplex-foundation/umi@1.4.1?target=deno'
import {
  fetchCandyMachine,
  safeFetchCandyGuard,
  mplCandyMachine
} from 'https://esm.sh/@metaplex-foundation/mpl-candy-machine@6.0.1?target=deno'
import { mplTokenMetadata } from 'https://esm.sh/@metaplex-foundation/mpl-token-metadata@3.3.0?target=deno'
import { mplCandyGuard } from 'https://esm.sh/@metaplex-foundation/mpl-candy-guard@0.5.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching collection stats...');
    
    // Get configuration from Supabase secrets
    const devnetRpc = Deno.env.get('DEVNET_RPC') || 'https://api.devnet.solana.com';
    const candyMachineIdStr = Deno.env.get('CANDY_MACHINE_ID');
    const candyGuardIdStr = Deno.env.get('CANDY_GUARD_ID');
    
    if (!candyMachineIdStr) {
      throw new Error('CANDY_MACHINE_ID not configured');
    }
    
    if (!candyGuardIdStr) {
      throw new Error('CANDY_GUARD_ID not configured');
    }
    
    console.log('Using RPC:', devnetRpc);
    console.log('Candy Machine ID:', candyMachineIdStr);
    console.log('Candy Guard ID:', candyGuardIdStr);

    // Initialize Umi with required Metaplex programs
    const umi = createUmi(devnetRpc)
      .use(mplTokenMetadata())
      .use(mplCandyMachine())
      .use(mplCandyGuard());
    
    const candyMachineId = publicKey(candyMachineIdStr);
    const candyGuardId = publicKey(candyGuardIdStr);
    
    // Fetch candy machine data using Umi
    const candyMachine = await fetchCandyMachine(umi, candyMachineId);
    
    if (!candyMachine) {
      throw new Error('Candy Machine not found');
    }

    // Fetch candy guard to get the actual price
    const candyGuard = await safeFetchCandyGuard(umi, candyGuardId);
    
    // Extract price from candy guard's solPayment guard (top-level or first group)
    let price = 0.15; // Default fallback price
    try {
      if (candyGuard) {
        const billion = 1_000_000_000;
        const top = candyGuard.guards?.solPayment;
        if (top && top.__option === 'Some') {
          price = Number(top.value.lamports) / billion;
          console.log('Price from top-level candy guard:', price, 'SOL');
        } else if (Array.isArray(candyGuard.groups) && candyGuard.groups.length > 0) {
          const groupSol = candyGuard.groups[0]?.guards?.solPayment;
          if (groupSol && groupSol.__option === 'Some') {
            price = Number(groupSol.value.lamports) / billion;
            console.log('Price from group candy guard:', price, 'SOL');
          } else {
            console.log('No solPayment guard found in groups, using fallback price:', price);
          }
        } else {
          console.log('No solPayment guard found, using fallback price:', price);
        }
      }
    } catch (priceError) {
      console.warn('Error reading price from candy guard:', priceError);
      console.log('Using fallback price:', price);
    }

    // Calculate stats
    const totalSupply = Number(candyMachine.itemsLoaded);
    const minted = Number(candyMachine.itemsRedeemed);
    const remaining = totalSupply - minted;

    const collectionStats = {
      totalSupply: totalSupply,
      minted: minted,
      price: price,
      remaining: remaining,
      candyMachineId: candyMachineId.toString(),
      collectionMintId: candyMachine.collectionMint?.toString() || '',
      creatorWallet: candyMachine.authority.toString(),
      isLive: candyMachine.itemsLoaded > candyMachine.itemsRedeemed
    };

    console.log('Returning collection stats:', collectionStats);

    return new Response(
      JSON.stringify(collectionStats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error fetching collection stats:', error);

    const body = {
      error: error instanceof Error ? error.message : 'Failed to fetch collection stats',
    };

    return new Response(
      JSON.stringify(body),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});