import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { closetItems, occasion, mood, styleProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const itemsList = closetItems.map((item: any) =>
      `- ${item.name || 'Unnamed'} (${item.category}, ${item.color || 'unknown color'}, ${item.style || 'unclassified'}, ${item.season || 'all-season'})`
    ).join("\n");

    const systemPrompt = `You are AURELIA, an elite AI stylist. Generate exactly 3 complete outfit combinations from the user's closet items.

User's closet items:
${itemsList}

${styleProfile ? `Style DNA: ${styleProfile.archetype}` : ""}

Rules:
- Each outfit must use ONLY items from the closet list above
- Reference items by their exact names
- Each outfit needs at minimum a top and bottom (or a dress)
- Consider the occasion and mood requested`;

    const userPrompt = `Create 3 outfits for: ${occasion || "everyday"}${mood ? `, mood: ${mood}` : ""}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "suggest_outfits",
            description: "Return 3 outfit suggestions from the user's closet",
            parameters: {
              type: "object",
              properties: {
                outfits: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Creative outfit name" },
                      description: { type: "string", description: "Brief style description" },
                      items: { type: "array", items: { type: "string" }, description: "Exact item names from closet" },
                      explanation: { type: "string", description: "Why this outfit works" },
                      confidence: { type: "number", description: "Style match score 0-100" },
                    },
                    required: ["name", "description", "items", "explanation", "confidence"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["outfits"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "suggest_outfits" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
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
    if (!toolCall) throw new Error("No outfit suggestions returned");

    const outfits = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(outfits), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-outfits error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
