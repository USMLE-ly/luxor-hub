import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image, colorSeason } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a color analysis expert. Extract the dominant colors from the provided image and evaluate each against the user's color season.

User's color season: ${colorSeason || "Unknown"}

Use the provided tool to return your analysis.`;

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
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the dominant colors from this image and tell me which ones match my color season." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ],
        tools: [{
          type: "function",
          function: {
            name: "extract_palette",
            description: "Return extracted color palette with season compatibility",
            parameters: {
              type: "object",
              properties: {
                colors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      hex: { type: "string", description: "Hex color code like #FF5733" },
                      name: { type: "string", description: "Color name like Burnt Orange" },
                      matchesSeason: { type: "boolean", description: "Whether this color suits the user's season" },
                      advice: { type: "string", description: "Brief tip like 'Great for tops' or 'Use as accent only'" },
                    },
                    required: ["hex", "name", "matchesSeason", "advice"],
                    additionalProperties: false,
                  },
                },
                summary: { type: "string", description: "Overall assessment of how well these colors match" },
                matchCount: { type: "number", description: "How many colors match the season" },
                totalColors: { type: "number", description: "Total colors extracted" },
              },
              required: ["colors", "summary", "matchCount", "totalColors"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_palette" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-palette error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
