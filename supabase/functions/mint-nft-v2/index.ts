import { corsHeaders } from '../_shared/cors.ts';
import { createUmi } from 'https://esm.sh/@metaplex-foundation/umi-bundle-defaults@0.9.2?target=deno';
import { 
  generateSigner, 
  publicKey, 
  transactionBuilder, 
  some,
  createNoopSigner,
  signerIdentity,
  keypairIdentity
} from 'https://esm.sh/@metaplex-foundation/umi@0.9.2?target=deno';
import {
  fetchCandyMachine,
  fetchCandyGuard,
  mintV2,
  mplCandyMachine,
  safeFetchCandyGuard
} from 'https://esm.sh/@metaplex-foundation/mpl-candy-machine@6.0.1?target=deno';
import { 
  setComputeUnitLimit 
} from 'https://esm.sh/@metaplex-foundation/mpl-toolbox@0.9.4?target=deno';
import { mplTokenMetadata } from 'https://esm.sh/@metaplex-foundation/mpl-token-metadata@3.2.1?target=deno';

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

    // Configuration
    const rpcUrl = Deno.env.get('DEVNET_RPC') || 'https://api.devnet.solana.com';
    const candyMachineIdStr = Deno.env.get('CANDY_MACHINE_ID');
    const candyGuardIdStr = Deno.env.get('CANDY_GUARD_ID');
    
    if (!candyMachineIdStr) {
      throw new Error('CANDY_MACHINE_ID not configured');
    }

    // Initialize Umi following official pattern
    const umi = createUmi(rpcUrl)
      .use(mplTokenMetadata())
      .use(mplCandyMachine());

    // Setup wallet as noop signer (will be signed client-side)
    const userWallet = createNoopSigner(publicKey(walletAddress));
    umi.use(signerIdentity(userWallet));
    
    // Fetch Candy Machine
    const candyMachinePublicKey = publicKey(candyMachineIdStr);
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
    
    console.log('Candy Machine:', {
      itemsAvailable: Number(candyMachine.itemsLoaded),
      itemsRedeemed: Number(candyMachine.itemsRedeemed),
      authority: candyMachine.authority
    });

    // Check availability
    const itemsAvailable = Number(candyMachine.itemsLoaded) - Number(candyMachine.itemsRedeemed);
    if (itemsAvailable <= 0) {
      return new Response(
        JSON.stringify({ error: 'Sold out' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare mint arguments based on guards
    let mintArgs = {};
    let group = undefined;
    
    // Fetch Candy Guard if configured
    if (candyGuardIdStr) {
      try {
        const candyGuardPublicKey = publicKey(candyGuardIdStr);
        const candyGuard = await fetchCandyGuard(umi, candyGuardPublicKey);
        
        console.log('Candy Guard found');
        
        // Check for solPayment guard
        if (candyGuard.guards.solPayment && candyGuard.guards.solPayment.__option === 'Some') {
          const destination = candyGuard.guards.solPayment.value.destination;
          mintArgs = {
            ...mintArgs,
            solPayment: some({ destination })
          };
          console.log('Added solPayment guard');
        }
        
        // Check for groups with solPayment
        if (!mintArgs.solPayment && candyGuard.groups && candyGuard.groups.length > 0) {
          for (const grp of candyGuard.groups) {
            if (grp.guards.solPayment && grp.guards.solPayment.__option === 'Some') {
              group = some(grp.label);
              mintArgs = {
                ...mintArgs,
                solPayment: some({ destination: grp.guards.solPayment.value.destination })
              };
              console.log('Using group:', grp.label);
              break;
            }
          }
        }
      } catch (e) {
        console.log('No candy guard or error fetching:', e.message);
      }
    }

    // Generate mint keypair
    const nftMint = generateSigner(umi);
    console.log('NFT mint address:', nftMint.publicKey);

    // Build transaction following official pattern
    let tx = transactionBuilder();
    
    // Add compute unit limit for safety
    tx = tx.add(setComputeUnitLimit(umi, { units: 800_000 }));
    
    // Add mint instruction
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
    
    tx = tx.add(mintInstruction);
    
    // CRITICAL: Set the user's wallet as fee payer
    tx = tx.setFeePayer(userWallet);

    // Set blockhash
    const blockhash = await umi.rpc.getLatestBlockhash();
    tx = tx.setBlockhash(blockhash);
    
    // Sign with nftMint only (user will sign as fee payer on client)
    const nftMintSigner = umi.use(keypairIdentity(nftMint));
    const signedTx = await tx.buildAndSign(nftMintSigner);
    
    // Serialize for client
    const serialized = umi.transactions.serialize(signedTx);
    // Use Deno's native base64 encoding instead of Buffer
    const base64Tx = btoa(String.fromCharCode(...serialized));
    
    console.log('Transaction prepared successfully');
    
    return new Response(
      JSON.stringify({
        success: true,
        transaction: base64Tx,
        nftMint: nftMint.publicKey,
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

  } catch (error: any) {
    console.error('Mint error:', error);
    
    return new Response(
      JSON.stringify({
        error: error?.message || 'Mint failed',
        details: error?.toString()
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