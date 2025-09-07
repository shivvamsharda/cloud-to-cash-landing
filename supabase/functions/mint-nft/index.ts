import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { walletAddress, quantity, signedTransaction } = await req.json();
    
    console.log('Processing NFT mint request:', {
      walletAddress,
      quantity,
      transactionLength: signedTransaction?.length || 0
    });

    // Validate inputs
    if (!walletAddress || !quantity || !signedTransaction) {
      return new Response(JSON.stringify({ 
        error: 'Missing required parameters: walletAddress, quantity, signedTransaction' 
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

    // Send the signed transaction to Solana
    const response = await fetch(devnetRpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [signedTransaction, {
          encoding: 'base64',
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3
        }]
      })
    });

    const transactionResult = await response.json();
    console.log('Transaction result:', transactionResult);

    if (transactionResult.error) {
      console.error('Transaction failed:', transactionResult.error);
      return new Response(JSON.stringify({ 
        error: 'Transaction failed',
        details: transactionResult.error 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const signature = transactionResult.result;
    console.log('Transaction successful, signature:', signature);

    // Confirm the transaction
    let confirmed = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds timeout

    while (!confirmed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const confirmResponse = await fetch(devnetRpc, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignatureStatuses',
          params: [[signature]]
        })
      });

      const confirmResult = await confirmResponse.json();
      
      if (confirmResult.result?.value?.[0]?.confirmationStatus === 'confirmed' || 
          confirmResult.result?.value?.[0]?.confirmationStatus === 'finalized') {
        confirmed = true;
        console.log('Transaction confirmed:', signature);
      }
      
      attempts++;
    }

    return new Response(JSON.stringify({
      success: true,
      signature,
      confirmed,
      quantity,
      solscanUrl: `https://solscan.io/tx/${signature}?cluster=devnet`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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