import { corsHeaders } from '../_shared/cors.ts';
import { createUmi } from 'https://esm.sh/@metaplex-foundation/umi-bundle-defaults@1.4.1?target=deno';
import { 
  generateSigner, 
  publicKey, 
  transactionBuilder, 
  keypairIdentity, 
  createNoopSigner, 
  signerIdentity,
  some
} from 'https://esm.sh/@metaplex-foundation/umi@1.4.1?target=deno';
import {
  fetchCandyMachine,
  mintV2,
  safeFetchCandyGuard,
  mplCandyMachine
} from 'https://esm.sh/@metaplex-foundation/mpl-candy-machine@6.0.1?target=deno';
import { mplTokenMetadata } from 'https://esm.sh/@metaplex-foundation/mpl-token-metadata@3.3.0?target=deno';
import { fromWeb3JsInstruction } from 'https://esm.sh/@metaplex-foundation/umi-web3js-adapters@1.4.1?target=deno';
import { ComputeBudgetProgram } from 'https://esm.sh/@solana/web3.js@1.98.4?target=deno';
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
    const candyGuardIdStr = Deno.env.get('CANDY_GUARD_ID');
    
    if (!candyMachineIdStr) {
      throw new Error('Candy machine configuration not found: missing CANDY_MACHINE_ID');
    }

    console.log('Using configuration:', {
      rpc: devnetRpc,
      candyMachine: candyMachineIdStr
    });

    // Initialize Umi with required Metaplex programs
    const umi = createUmi(devnetRpc)
      .use(mplTokenMetadata())
      .use(mplCandyMachine());
    
    // Parse addresses
    const candyMachineId = publicKey(candyMachineIdStr);
    const minterPubkey = publicKey(walletAddress);
    const minter = createNoopSigner(minterPubkey);
    // Use the user's wallet as fee payer (Noop signer, will be signed client-side)
    (umi as any).use(signerIdentity(minter));
    
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
      const guardPk = candyGuardIdStr ? publicKey(candyGuardIdStr) : candyMachine.mintAuthority;
      candyGuard = await safeFetchCandyGuard(umi, guardPk);
    } catch (_) {
      // ignore if not found
    }

    // Determine guard group and required mint args (e.g., solPayment destination)
    let groupLabel: string | undefined = undefined;
    let solPaymentDestination: any | null = null;
    if (candyGuard) {
      const topSol = (candyGuard as any).guards?.solPayment;
      if (topSol && topSol.__option === 'Some') {
        solPaymentDestination = topSol.value.destination;
      } else if (Array.isArray((candyGuard as any).groups) && (candyGuard as any).groups.length > 0) {
        for (const grp of (candyGuard as any).groups) {
          const grpSol = grp?.guards?.solPayment;
          if (grpSol && grpSol.__option === 'Some') {
            groupLabel = grp.label;
            solPaymentDestination = grpSol.value.destination;
            break;
          }
        }
      }
    }

    // Generate NFT mint address
    const nftMint = generateSigner(umi);
    
    console.log('Generating mint transaction...');
    
    // Create mint transaction
    let builder = transactionBuilder();
    
    // Add compute budget instructions using proper Web3.js adapter
    console.log('Adding compute budget instructions...');
    builder = builder
      .add(fromWeb3JsInstruction(ComputeBudgetProgram.setComputeUnitPrice({ 
        microLamports: 1000 
      })))
      .add(fromWeb3JsInstruction(ComputeBudgetProgram.setComputeUnitLimit({ 
        units: 400000 
      })));
    
    // Add mint instruction
    console.log('Adding mint instruction...');
    builder = builder.add(
      mintV2(umi, {
        candyMachine: candyMachineId,
        nftMint,
        collectionMint: candyMachine.collectionMint,
        collectionUpdateAuthority: candyMachine.authority,
        minter,
        ...(candyGuard && { candyGuard: (candyGuard as any).publicKey }),
        ...(groupLabel ? { group: groupLabel } : {}),
        mintArgs: solPaymentDestination
          ? { solPayment: some({ destination: solPaymentDestination }) }
          : undefined,
      })
    );

    // Ensure the fee payer is the user's wallet (they will sign client-side)
    builder = builder.setFeePayer(minter);

    // Set latest blockhash (required to build the transaction)
    console.log('Getting latest blockhash...');
    const latestBlockhash = await umi.rpc.getLatestBlockhash();
    builder = builder.setBlockhash(latestBlockhash);

    // Create temporary Umi with plugins and nftMint keypair to partially sign
    console.log('Building and signing transaction...');
    const tempUmi = createUmi(devnetRpc)
      .use(mplTokenMetadata())
      .use(mplCandyMachine())
      .use(keypairIdentity(nftMint));
    
    // Build and sign with the nftMint keypair only
    const partiallySignedTransaction = await builder.buildAndSign(tempUmi);
    
    // Serialize the full transaction (with partial signatures) to base64 for frontend
    console.log('Serializing transaction...');
    const serializedBytes = umi.transactions.serialize(partiallySignedTransaction);
    const serializedTx = encodeBase64(serializedBytes);
    
    console.log('Transaction prepared successfully');
    console.log('NFT Mint:', nftMint.publicKey.toString());
    
    // Return the transaction for the frontend to sign and send
    return new Response(
      JSON.stringify({
        success: true,
        nftMint: nftMint.publicKey.toString(),
        message: 'Transaction prepared successfully',
        transaction: serializedTx,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    );

  } catch (error: any) {
    console.error('Mint error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      source: error?.source,
      identifier: error?.identifier,
      cluster: error?.cluster,
      raw: String(error),
    });
    
    const body = {
      error: error?.message || 'Minting failed',
      name: error?.name,
      details: String(error),
      hint: 'Ensure Metaplex programs (mplCandyMachine and mplTokenMetadata) are registered in Umi.',
    };

    return new Response(
      JSON.stringify(body),
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