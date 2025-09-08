import { corsHeaders } from '../_shared/cors.ts';
import { createUmi } from 'https://esm.sh/@metaplex-foundation/umi-bundle-defaults@0.9.2?target=deno';
import { 
  generateSigner, 
  publicKey, 
  transactionBuilder,
  createNoopSigner,
  signerIdentity,
  keypairIdentity,
  some
} from 'https://esm.sh/@metaplex-foundation/umi@0.9.2?target=deno';
import {
  fetchCandyMachine,
  fetchCandyGuard,
  mintV2,
  mplCandyMachine
} from 'https://esm.sh/@metaplex-foundation/mpl-candy-machine@6.0.1?target=deno';
import { 
  setComputeUnitLimit 
} from 'https://esm.sh/@metaplex-foundation/mpl-toolbox@0.9.4?target=deno';
import { mplTokenMetadata } from 'https://esm.sh/@metaplex-foundation/mpl-token-metadata@3.2.1?target=deno';
import { encode as base64Encode } from 'https://deno.land/std@0.220.0/encoding/base64.ts';

Deno.serve(async (req) => {
  // Handle CORS
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
    const { walletAddress } = await req.json();
    
    console.log('Mint request received for wallet:', walletAddress);
    
    if (!walletAddress) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get environment variables
    const rpcUrl = Deno.env.get('DEVNET_RPC') || 'https://api.devnet.solana.com';
    const candyMachineIdStr = Deno.env.get('CANDY_MACHINE_ID');
    const candyGuardIdStr = Deno.env.get('CANDY_GUARD_ID');
    
    if (!candyMachineIdStr) {
      throw new Error('CANDY_MACHINE_ID not configured in environment');
    }

    console.log('Using Candy Machine:', candyMachineIdStr);

    // Initialize Umi
    const umi = createUmi(rpcUrl)
      .use(mplTokenMetadata())
      .use(mplCandyMachine());

    // Create user wallet as noop signer (will be signed client-side)
    const userPublicKey = publicKey(walletAddress);
    const userWallet = createNoopSigner(userPublicKey);
    umi.use(signerIdentity(userWallet));
    
    // Fetch Candy Machine
    const candyMachinePublicKey = publicKey(candyMachineIdStr);
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
    
    console.log('Candy Machine loaded:', candyMachine.itemsLoaded, 'redeemed:', candyMachine.itemsRedeemed);

    // Check if sold out
    const itemsRemaining = Number(candyMachine.itemsLoaded) - Number(candyMachine.itemsRedeemed);
    if (itemsRemaining <= 0) {
      return new Response(
        JSON.stringify({ error: 'Collection is sold out' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Prepare mint args for guards
    let mintArgs = {};
    let group = undefined;
    
    if (candyGuardIdStr) {
      try {
        const candyGuardPublicKey = publicKey(candyGuardIdStr);
        const candyGuard = await fetchCandyGuard(umi, candyGuardPublicKey);
        console.log('Candy Guard fetched');
        
        // Check for solPayment guard at top level
        if (candyGuard.guards?.solPayment?.__option === 'Some') {
          mintArgs = {
            solPayment: some({ 
              destination: candyGuard.guards.solPayment.value.destination 
            })
          };
          console.log('Using solPayment guard');
        }
        
        // Check for group guards if no top-level guard found
        if (!Object.keys(mintArgs).length && candyGuard.groups?.length > 0) {
          for (const grp of candyGuard.groups) {
            if (grp.guards?.solPayment?.__option === 'Some') {
              group = some(grp.label);
              mintArgs = {
                solPayment: some({ 
                  destination: grp.guards.solPayment.value.destination 
                })
              };
              console.log('Using group:', grp.label);
              break;
            }
          }
        }
      } catch (guardError) {
        console.log('Could not fetch guard, proceeding without:', guardError.message);
      }
    }

    // Generate new NFT mint keypair
    const nftMint = generateSigner(umi);
    console.log('NFT mint address:', nftMint.publicKey.toString());

    // Get blockhash for transaction
    const blockhash = await umi.rpc.getLatestBlockhash();
    console.log('Got blockhash:', blockhash.blockhash);
    
    // Build transaction
    let builder = transactionBuilder();
    
    // Add compute budget
    builder = builder.add(setComputeUnitLimit(umi, { units: 800_000 }));

    // Add the mint instruction
    const mintInstruction = mintV2(umi, {
      candyMachine: candyMachine.publicKey,
      candyGuard: candyGuardIdStr ? publicKey(candyGuardIdStr) : undefined,
      nftMint,
      collectionMint: candyMachine.collectionMint,
      collectionUpdateAuthority: candyMachine.authority,
      group,
      mintArgs,
      tokenStandard: candyMachine.tokenStandard
    });
    
    builder = builder.add(mintInstruction);

    // Set fee payer to user's wallet
    builder = builder.setFeePayer(userWallet);

    // Set blockhash
    builder = builder.setBlockhash(blockhash);
    
    // Sign with nftMint keypair
    const signerUmi = umi.use(keypairIdentity(nftMint));
    const signedTransaction = await builder.buildAndSign(signerUmi);
    
    // Serialize transaction
    const serializedTransaction = umi.transactions.serialize(signedTransaction);
    
    // Convert to base64 using Deno's standard library
    const base64Transaction = base64Encode(serializedTransaction);
    
    console.log('Transaction prepared successfully');
    
    // Return simplified response for single NFT mint
    return new Response(
      JSON.stringify({
        success: true,
        transaction: base64Transaction,
        nftMint: nftMint.publicKey.toString(),
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error) {
    console.error('=== MINT ERROR ===');
    console.error('Error:', error);
    console.error('Message:', error?.message);
    console.error('Stack:', error?.stack);
    
    return new Response(
      JSON.stringify({
        error: error?.message || 'Unknown error occurred',
        details: error?.stack || ''
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