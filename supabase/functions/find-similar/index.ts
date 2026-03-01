import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { itemName, itemCategory, itemColor, itemStyle } = await req.json();
    if (!itemName) throw new Error("itemName is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a fashion shopping assistant. Given a clothing item description, find real similar products available online from popular retailers (Zara, H&M, COS, Uniqlo, Mango, ASOS, Massimo Dutti, Arket, & Other Stories, etc). Return realistic product suggestions with real brand names, realistic prices, and actual retailer URLs. Focus on items that closely match the style, color, and category described.`,
          },
          {
            role: "user",
            content: `Find similar items to: "${itemName}" - Category: ${itemCategory || "clothing"}, Color: ${itemColor || "neutral"}, Style: ${itemStyle || "classic"}. Return 6 similar products from real online stores.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_similar_products",
              description: "Return a list of similar products found online",
              parameters: {
                type: "object",
                properties: {
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Product name" },
                        brand: { type: "string", description: "Brand name" },
                        price: { type: "string", description: "Price with currency e.g. €49.95" },
                        color: { type: "string", description: "Product color" },
                        similarity: { type: "number", description: "Similarity score 0-100" },
                        shopUrl: { type: "string", description: "URL to the retailer's website" },
                        description: { type: "string", description: "Brief 1-sentence description" },
                      },
                      required: ["name", "brand", "price", "color", "similarity", "shopUrl", "description"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["products"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_similar_products" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No results returned");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("find-similar error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
