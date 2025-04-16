
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
const MODEL = "google/gemini-2.0-flash-exp:free";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    const systemPrompt = `You are a helpful assistant for the DormMate dormitory management system. 
    Your purpose is to answer questions ONLY related to:
    - Room booking and availability
    - Dormitory facilities and amenities
    - Mess menu and meal information
    - Student accommodation policies
    - Check-in/check-out procedures
    - Complaint filing processes
    - WiFi and utility information
    - Laundry services
    - Visitor policies
    - Payment information for accommodation
    
    If a question is asked that is NOT related to the dormitory management system, 
    politely decline to answer and suggest asking a dormitory-related question instead.
    
    Always be professional, concise, and helpful in your responses.`;

    console.log("Calling OpenRouter API with message:", message);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://dormmate.lovable.ai",
        "X-Title": "DormMate Chatbot"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    console.log("OpenRouter API response:", data);
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to get response from OpenRouter API");
    }

    const assistantResponse = data.choices[0].message.content;
    
    return new Response(JSON.stringify({ reply: assistantResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
