import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Metaplex, keypairIdentity } from 'https://esm.sh/@metaplex-foundation/js@0.20.1';
import { Connection, Keypair, PublicKey } from 'https://esm.sh/@solana/web3.js@1.98.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const devnetRpc = Deno.env.get('DEVNET_RPC')!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candyMachineId } = await req.json();
    
    console.log('Fetching candy machine guard info for:', candyMachineId);

    // Validate input
    if (!candyMachineId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameter: candyMachineId' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize connection
    console.log('Initializing Solana connection to:', devnetRpc);
    const connection = new Connection(devnetRpc, 'confirmed');
    
    // Test connection
    try {
      const version = await connection.getVersion();
      console.log('Solana connection established:', version);
    } catch (error) {
      console.error('Failed to connect to Solana network:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to connect to Solana network',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a dummy keypair for Metaplex (we're only reading, not signing)
    const dummyKeypair = Keypair.generate();
    const metaplex = Metaplex.make(connection).use(keypairIdentity(dummyKeypair));
    
    try {
      // Find the candy machine
      const candyMachine = await metaplex.candyMachines().findByAddress({
        address: new PublicKey(candyMachineId)
      });

      console.log('Candy machine loaded:', {
        address: candyMachine.address.toString(),
        itemsAvailable: candyMachine.itemsAvailable.toString(),
        itemsMinted: candyMachine.itemsMinted.toString(),
        hasGuards: !!candyMachine.candyGuard
      });

      // Get candy guard information if available
      let guardsInfo = null;
      if (candyMachine.candyGuard) {
        try {
          const candyGuard = await metaplex.candyMachines().findCandyGuard({
            address: candyMachine.candyGuard.address
          });
          
          guardsInfo = {
            address: candyGuard.address.toString(),
            base: candyGuard.baseGuards,
            groups: candyGuard.groups || []
          };
          
          console.log('Candy guard loaded:', {
            address: candyGuard.address.toString(),
            baseGuards: Object.keys(candyGuard.baseGuards || {}),
            groupCount: candyGuard.groups?.length || 0
          });
        } catch (guardError) {
          console.error('Failed to load candy guard:', guardError);
          guardsInfo = {
            error: 'Failed to load candy guard details',
            details: guardError.message
          };
        }
      }
      
      return new Response(JSON.stringify({
        success: true,
        candyMachine: {
          address: candyMachine.address.toString(),
          itemsAvailable: candyMachine.itemsAvailable.toString(),
          itemsMinted: candyMachine.itemsMinted.toString(),
          itemsRemaining: candyMachine.itemsAvailable.sub(candyMachine.itemsMinted).toString(),
          authority: candyMachine.authorityAddress.toString(),
          creator: candyMachine.creatorAddress.toString(),
          collection: candyMachine.collectionMintAddress?.toString() || null,
        },
        guards: guardsInfo
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (candyMachineError) {
      console.error('Failed to load candy machine:', candyMachineError);
      
      return new Response(JSON.stringify({ 
        error: 'Failed to load candy machine',
        details: candyMachineError.message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in get-candy-guard function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});