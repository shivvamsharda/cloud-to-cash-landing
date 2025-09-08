import { corsHeaders } from '../_shared/cors.ts';
import { createUmi } from 'https://esm.sh/@metaplex-foundation/umi-bundle-defaults@0.9.2?target=deno';
import { 
  generateSigner, 
  publicKey, 
  transactionBuilder,
  createNoopSigner,
  signerIdentity,
  keypairIdentity,
  some,
  none
} from 'https://esm.sh/@metaplex-foundation/umi@0.9.2?target=deno';
import {
  fetchCandyMachine,
  fetchCandyGuard,
  mintV2,
  mplCandyMachine,
  route,
  guardRoute
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
    
    console.log('=== MINT REQUEST START ===');
    console.log('Wallet:', walletAddress);
    console.log('Quantity:', quantity);
    
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

    console.log('Config:', {
      candyMachine: candyMachineIdStr,
      candyGuard: candyGuardIdStr || 'none'
    });

    // Initialize Umi
    const umi = createUmi(rpcUrl)
      .use(mplTokenMetadata())
      .use(mplCandyMachine());

    // Setup wallet as noop signer
    const userWallet = createNoopSigner(publicKey(walletAddress));
    umi.use(signerIdentity(userWallet));
    
    // Fetch Candy Machine
    const candyMachinePublicKey = publicKey(candyMachineIdStr);
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
    
    console.log('Candy Machine loaded:', {
      itemsAvailable: Number(candyMachine.itemsLoaded),
      itemsRedeemed: Number(candyMachine.itemsRedeemed),
      mintAuthority: candyMachine.mintAuthority,
      tokenStandard: candyMachine.tokenStandard
    });

    // Check availability
    const itemsAvailable = Number(candyMachine.itemsLoaded) - Number(candyMachine.itemsRedeemed);
    if (itemsAvailable <= 0) {
      return new Response(
        JSON.stringify({ error: 'Sold out' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate mint keypair
    const nftMint = generateSigner(umi);
    console.log('NFT mint address:', nftMint.publicKey);

    // Build transaction
    let builder = transactionBuilder();
    
    // Add compute unit limit
    builder = builder.add(setComputeUnitLimit(umi, { units: 800_000 }));

    // Handle with or without Candy Guard
    if (candyGuardIdStr) {
      console.log('Using Candy Guard flow');
      const candyGuardPublicKey = publicKey(candyGuardIdStr);
      
      try {
        const candyGuard = await fetchCandyGuard(umi, candyGuardPublicKey);
        console.log('Candy Guard fetched');
        
        // Build mint args based on guards
        let mintArgs: any = {};
        let guardGroup = none();
        
        // Check for solPayment
        if (candyGuard.guards.solPayment && candyGuard.guards.solPayment.__option === 'Some') {
          mintArgs.solPayment = some({ 
            destination: candyGuard.guards.solPayment.value.destination 
          });
          console.log('Added solPayment guard');
        }
        
        // Check groups
        if (candyGuard.groups && candyGuard.groups.length > 0) {
          for (const group of candyGuard.groups) {
            if (group.guards.solPayment && group.guards.solPayment.__option === 'Some') {
              guardGroup = some(group.label);
              mintArgs.solPayment = some({ 
                destination: group.guards.solPayment.value.destination 
              });
              console.log('Using group:', group.label);
              break;
            }
          }
        }
        
        // Use the route instruction for guard minting
        builder = builder.add(
          route(umi, {
            candyMachine: candyMachine.publicKey,
            candyGuard: candyGuardPublicKey,
            group: guardGroup,
            guard: 'mintV2',
            routeArgs: {
              nftMint,
              minter: userWallet,
              mintArgs
            }
          })
        );
        
      } catch (e) {
        console.log('Guard fetch failed, using direct mint');
        // Fallback to direct mint
        builder = builder.add(
          mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            nftMint,
            collectionMint: candyMachine.collectionMint,
            collectionUpdateAuthority: candyMachine.authority,
            tokenStandard: candyMachine.tokenStandard
          })
        );
      }
    } else {
      console.log('Using direct mint (no guard)');
      // Direct mint without guard
      builder = builder.add(
        mintV2(umi, {
          candyMachine: candyMachine.publicKey,
          nftMint,
          collectionMint: candyMachine.collectionMint,
          collectionUpdateAuthority: candyMachine.authority,
          tokenStandard: candyMachine.tokenStandard
        })
      );
    }

    // Set fee payer
    builder = builder.setFeePayer(userWallet);

    // Set blockhash
    const blockhash = await umi.rpc.getLatestBlockhash();
    builder = builder.setBlockhash(blockhash);
    
    // Sign with nftMint keypair
    console.log('Signing transaction...');
    const nftMintSigner = umi.use(keypairIdentity(nftMint));
    const signedTx = await nftMintSigner.transactions.build(builder);
    
    // Add nftMint signature
    const builtAndSigned = await builder.buildAndSign(nftMintSigner);
    
    // Serialize
    console.log('Serializing transaction...');
    const serialized = umi.transactions.serialize(builtAndSigned);
    const base64Tx = btoa(String.fromCharCode(...serialized));
    
    console.log('=== MINT REQUEST SUCCESS ===');
    
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
    console.error('=== MINT ERROR ===');
    console.error('Name:', error?.name);
    console.error('Message:', error?.message);
    console.error('Stack:', error?.stack);
    
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