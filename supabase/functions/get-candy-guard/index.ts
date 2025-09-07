import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { createUmi } from 'https://esm.sh/@metaplex-foundation/umi-bundle-defaults@0.9.2';
import { fetchCandyMachine } from 'https://esm.sh/@metaplex-foundation/mpl-candy-machine@6.0.1';
import { publicKey } from 'https://esm.sh/@metaplex-foundation/umi@0.9.2';

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
    const { candyMachineId } = await req.json();
    
    if (!candyMachineId) {
      return new Response(
        JSON.stringify({ error: 'Candy Machine ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const devnetRpc = Deno.env.get('DEVNET_RPC') || 'https://api.devnet.solana.com';
    
    // Initialize Umi with devnet RPC
    const umi = createUmi(devnetRpc);
    
    const candyMachinePubkey = publicKey(candyMachineId);
    
    // Fetch candy machine
    const candyMachine = await fetchCandyMachine(umi, candyMachinePubkey);
    
    if (!candyMachine) {
      return new Response(
        JSON.stringify({ error: 'Candy Machine not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For now, we'll return basic candy machine info without guard details
    // Guards can be added later if needed
    const response = {
      candyMachine: {
        address: candyMachine.publicKey,
        itemsLoaded: Number(candyMachine.itemsLoaded),
        itemsRedeemed: Number(candyMachine.itemsRedeemed),
        mintAuthority: candyMachine.mintAuthority,
        collectionMint: candyMachine.collectionMint
      },
      guard: null // Guards implementation can be added later if needed
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-candy-guard function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch candy guard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});