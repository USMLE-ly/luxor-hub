import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { closetItems, styleProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a wardrobe analyst. Given a user's closet items and style profile, identify missing essential pieces.

Analyze completeness across these categories:
- Basics (plain tees, white shirts, neutral bottoms)
- Statement pieces (bold colors, patterns, unique cuts)
- Occasion wear (formal, date night, business)
- Seasonal coverage (winter coats, summer dresses, transitional layers)
- Accessories (belts, scarves, bags, watches)

Return analysis using the provided tool.`;

    const closetSummary = (closetItems || []).map((i: any) => 
      `${i.name || "Unnamed"} (${i.category}, ${i.color || "no color"}, ${i.style || "no style"})`
    ).join("; ");

    const userPrompt = `Closet items: ${closetSummary || "Empty closet"}
Style archetype: ${styleProfile?.archetype || "Unknown"}
Color season: ${(styleProfile?.preferences as any)?.aiAnalysis?.colorSeason || "Unknown"}
Body shape: ${(styleProfile?.preferences as any)?.bodyShape || "Unknown"}`;

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
            name: "wardrobe_gap_analysis",
            description: "Return wardrobe gap analysis results",
            parameters: {
              type: "object",
              properties: {
                overallScore: { type: "number", description: "Wardrobe completeness score 0-100" },
                gaps: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      item: { type: "string", description: "Specific missing item" },
                      reason: { type: "string", description: "Why this item matters" },
                      priority: { type: "string", enum: ["high", "medium", "low"] },
                      estimatedPrice: { type: "string", description: "Price range like €30-60" },
                      shopCategory: { type: "string", enum: ["Tops", "Bottoms", "Shoes", "Outerwear", "Accessories"] },
                    },
                    required: ["category", "item", "reason", "priority", "estimatedPrice", "shopCategory"],
                    additionalProperties: false,
                  },
                },
                summary: { type: "string", description: "Brief overall assessment" },
              },
              required: ["overallScore", "gaps", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "wardrobe_gap_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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
    console.error("wardrobe-gap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
