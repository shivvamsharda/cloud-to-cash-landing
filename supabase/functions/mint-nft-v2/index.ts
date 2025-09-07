import { corsHeaders } from '../_shared/cors.ts';
import { createUmi } from 'https://esm.sh/@metaplex-foundation/umi-bundle-defaults@1.4.1';
import { generateSigner, publicKey, transactionBuilder } from 'https://esm.sh/@metaplex-foundation/umi@1.4.1';
import { 
  fetchCandyMachine, 
  mintV2,
  safeFetchCandyGuard
} from 'https://esm.sh/@metaplex-foundation/mpl-candy-machine@6.0.1';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { walletAddress, quantity = 1 } = await req.json();
    
    console.log('Mint request:', { walletAddress, quantity });
    
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get configuration from Supabase secrets
    const devnetRpc = Deno.env.get('DEVNET_RPC') || 'https://api.devnet.solana.com';
    const candyMachineIdStr = Deno.env.get('CANDY_MACHINE_ID');
    const authorityStr = Deno.env.get('CANDY_MACHINE_AUTHORITY');
    
    if (!candyMachineIdStr || !authorityStr) {
      throw new Error('Candy machine configuration not found');
    }

    console.log('Using configuration:', {
      rpc: devnetRpc,
      candyMachine: candyMachineIdStr,
      authority: authorityStr
    });

    // Initialize Umi
    const umi = createUmi(devnetRpc);
    
    // Parse addresses
    const candyMachineId = publicKey(candyMachineIdStr);
    const authority = publicKey(authorityStr);
    const minter = publicKey(walletAddress);
    
    // Fetch candy machine data
    console.log('Fetching candy machine...');
    const candyMachine = await fetchCandyMachine(umi, candyMachineId);
    
    // Check if sold out
    if (candyMachine.itemsRedeemed >= candyMachine.itemsLoaded) {
      return new Response(
        JSON.stringify({ error: 'Collection is sold out' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if enough items remaining
    const remaining = Number(candyMachine.itemsLoaded) - Number(candyMachine.itemsRedeemed);
    if (quantity > remaining) {
      return new Response(
        JSON.stringify({ 
          error: `Only ${remaining} NFTs remaining` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch candy guard if it exists
    let candyGuard = null;
    try {
      candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);
      console.log('Candy guard found:', candyGuard);
    } catch (error) {
      console.log('No candy guard found or error fetching:', error);
    }

    // Generate NFT mint address
    const nftMint = generateSigner(umi);
    
    console.log('Generating mint transaction...');
    
    // Create mint transaction
    let builder = transactionBuilder();
    
    // Add mint instruction
    builder = builder.add(
      mintV2(umi, {
        candyMachine: candyMachineId,
        nftMint,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
        minter,
        // Add candy guard if present
        ...(candyGuard && { 
          candyGuard: candyGuard.publicKey,
          group: undefined // Use default group
        })
      })
    );

    // Build the transaction
    const transaction = await builder.buildAndSign(umi);
    
    console.log('Transaction built successfully');
    
    // Return the transaction for the frontend to sign and send
    return new Response(
      JSON.stringify({
        success: true,
        nftMint: nftMint.publicKey.toString(),
        message: 'Transaction prepared successfully',
        // Note: In a production app, you'd return the transaction bytes
        // for the frontend to sign and submit
        transactionSignature: 'mock_signature_' + Date.now()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('Mint error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Minting failed',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );
  }
});