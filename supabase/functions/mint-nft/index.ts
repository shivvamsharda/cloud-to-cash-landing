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
const candyMachineAuthority = Deno.env.get('CANDY_MACHINE_AUTHORITY'); // Private key for candy machine authority

const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress, quantity, candyMachineId } = await req.json();
    
    console.log('Processing NFT mint request:', {
      walletAddress,
      quantity,
      candyMachineId
    });

    // Validate inputs
    if (!walletAddress || !quantity || !candyMachineId) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: walletAddress, quantity, candyMachineId' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (quantity < 1 || quantity > 10) {
      return new Response(JSON.stringify({ 
        error: 'Invalid quantity. Must be between 1 and 10.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate candy machine authority is available
    if (!candyMachineAuthority) {
      return new Response(JSON.stringify({ 
        error: 'Candy machine authority not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize connection and Metaplex
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
    
    // Create keypair from the authority private key
    let authorityKeypair: Keypair;
    try {
      console.log('Parsing candy machine authority key...');
      const secretKeyArray = JSON.parse(candyMachineAuthority);
      
      if (!Array.isArray(secretKeyArray) || secretKeyArray.length !== 64) {
        throw new Error('Authority key must be a JSON array of 64 numbers');
      }
      
      authorityKeypair = Keypair.fromSecretKey(new Uint8Array(secretKeyArray));
      console.log('Authority keypair created successfully:', {
        publicKey: authorityKeypair.publicKey.toString()
      });
    } catch (error) {
      console.error('Failed to create authority keypair:', error);
      return new Response(JSON.stringify({ 
        error: 'Invalid candy machine authority key format. Must be JSON array of 64 numbers.',
        details: error.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Metaplex with the authority keypair
    const metaplex = Metaplex.make(connection).use(keypairIdentity(authorityKeypair));
    
    try {
      // Find the candy machine
      const candyMachine = await metaplex.candyMachines().findByAddress({
        address: new PublicKey(candyMachineId)
      });

      console.log('Candy machine loaded:', {
        address: candyMachine.address.toString(),
        itemsAvailable: candyMachine.itemsAvailable.toString(),
        itemsMinted: candyMachine.itemsMinted.toString()
      });

      // Check if candy machine has enough items remaining
      const itemsRemaining = candyMachine.itemsAvailable.sub(candyMachine.itemsMinted);
      if (itemsRemaining.toNumber() < quantity) {
        return new Response(JSON.stringify({ 
          error: `Not enough NFTs remaining. Only ${itemsRemaining.toString()} left.` 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Mint NFTs for the specified quantity
      const signatures: string[] = [];
      const minterPublicKey = new PublicKey(walletAddress);

      for (let i = 0; i < quantity; i++) {
        console.log(`Minting NFT ${i + 1} of ${quantity}...`);
        
        let retries = 3;
        let mintSuccess = false;
        let nft, response;
        
        while (retries > 0 && !mintSuccess) {
          try {
            console.log(`Attempt ${4 - retries} for NFT ${i + 1}...`);
            
            const mintResult = await metaplex.candyMachines().mint({
              candyMachine,
              owner: minterPublicKey,
              guards: {},
              newMint: Keypair.generate() // Generate a new mint keypair for each NFT
            });
            
            nft = mintResult.nft;
            response = mintResult.response;
            mintSuccess = true;
            
            console.log(`NFT ${i + 1} minted successfully:`, {
              mint: nft.address.toString(),
              signature: response.signature,
              owner: minterPublicKey.toString()
            });
            
            signatures.push(response.signature);
            
          } catch (mintError) {
            retries--;
            console.error(`Mint attempt failed for NFT ${i + 1}:`, mintError);
            
            if (retries === 0) {
              throw mintError;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      const primarySignature = signatures[0];
      
      return new Response(JSON.stringify({
        success: true,
        signature: primarySignature,
        signatures: signatures,
        confirmed: true,
        quantity,
        solscanUrl: `https://solscan.io/tx/${primarySignature}?cluster=devnet`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (mintError) {
      console.error('Minting error:', mintError);
      
      // Handle specific candy machine errors
      if (mintError.message.includes('sold out')) {
        return new Response(JSON.stringify({ 
          error: 'Candy machine is sold out' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (mintError.message.includes('insufficient funds')) {
        return new Response(JSON.stringify({ 
          error: 'Insufficient SOL for minting' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ 
        error: 'Minting failed',
        details: mintError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in mint-nft function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});