// backend/supabase/functions/video-token/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { StreamClient } from "npm:@stream-io/node-sdk";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      throw new Error("User ID is strictly required to generate a token.");
    }

    // Grab the secrets from the Supabase Vault
    const apiKey = Deno.env.get('STREAM_API_KEY');
    const apiSecret = Deno.env.get('STREAM_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error("CRITICAL: Stream credentials missing from Supabase Vault");
    }

    // Initialize the Stream backend client
    const client = new StreamClient(apiKey, apiSecret);

    // Generate a secure JWT token for this specific user
    // (Optional: add expiration time, e.g., expires_at: Math.floor(Date.now() / 1000) + 3600)
    const token = client.generateUserToken({ user_id: userId });

    return new Response(
      JSON.stringify({ token }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("TOKEN ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});