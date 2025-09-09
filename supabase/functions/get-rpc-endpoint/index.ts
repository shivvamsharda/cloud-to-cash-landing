import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get mainnet RPC from environment variables
    const mainnetRpc = Deno.env.get('MAINNET_RPC') || 'https://api.mainnet-beta.solana.com';
    
    console.log('Providing mainnet RPC endpoint');
    
    return new Response(
      JSON.stringify({ 
        rpcEndpoint: mainnetRpc,
        network: 'mainnet' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error getting RPC endpoint:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to get RPC endpoint',
        rpcEndpoint: 'https://api.mainnet-beta.solana.com', // fallback
        network: 'mainnet'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});