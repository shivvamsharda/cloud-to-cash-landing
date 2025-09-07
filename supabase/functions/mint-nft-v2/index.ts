import { corsHeaders } from '../_shared/cors.ts';
import { createUmi } from 'https://esm.sh/@metaplex-foundation/umi-bundle-defaults@1.4.1';
import { generateSigner, publicKey, transactionBuilder, keypairIdentity, createNoopSigner } from 'https://esm.sh/@metaplex-foundation/umi@1.4.1';
import { 
  fetchCandyMachine, 
  mintV2,
  safeFetchCandyGuard
} from 'https://esm.sh/@metaplex-foundation/mpl-candy-machine@6.0.1';
import { encodeBase64 } from 'jsr:@std/encoding/base64';

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
    const minterPubkey = publicKey(walletAddress);
    const minter = createNoopSigner(minterPubkey);
    
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

    // Create temporary Umi with nftMint keypair to partially sign
    const tempUmi = createUmi(devnetRpc).use(keypairIdentity(nftMint));
    
    // Build the transaction with proper signing
    const builtTransaction = await builder.build(tempUmi);
    const { signature, ...unsignedTransaction } = builtTransaction;
    
    // Partially sign with the nftMint keypair
    const partiallySignedTransaction = await builder.buildAndSign(tempUmi);
    
    // Serialize the full transaction (with partial signatures) to base64 for frontend
    const serializedBytes = umi.transactions.serialize(partiallySignedTransaction);
    const serializedTx = encodeBase64(serializedBytes);
    
    console.log('Transaction built and partially signed successfully');
    console.log('NFT Mint:', nftMint.publicKey.toString());
    
    // Return the transaction for the frontend to sign and send
    return new Response(
      JSON.stringify({
        success: true,
        nftMint: nftMint.publicKey.toString(),
        message: 'Transaction prepared successfully',
        transaction: serializedTx,
        blockhash: partiallySignedTransaction.message.blockhash,
        lastValidBlockHeight: partiallySignedTransaction.message.lastValidBlockHeight
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