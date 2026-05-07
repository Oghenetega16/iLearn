// backend/supabase/functions/chat-ai/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, history } = await req.json();
    
    // 2. Check if the API key exists
    const apiKey = Deno.env.get('GEMINI_API_KEY'); 
    if (!apiKey) {
      throw new Error("CRITICAL: GEMINI_API_KEY is missing from Supabase Vault!");
    }

    console.log(`Sending message to Gemini: "${message}"`);

    // 3. Call Google Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ 
            text: `You are iLearn AI, a helpful and concise coding tutor. The user says: "${message}". Answer them clearly and accurately.` 
          }]
        }]
      })
    });

    // 4. Parse Google's exact response
    const aiData = await response.json();
    console.log("GOOGLE REPLIED WITH:", JSON.stringify(aiData));

    // 5. Did Google reject us?
    if (!response.ok || aiData.error) {
      throw new Error(`Google API Error: ${aiData.error?.message || 'Unknown error from Google'}`);
    }

    // 6. Safely extract the text
    const reply = aiData.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("EDGE FUNCTION CRASHED:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});