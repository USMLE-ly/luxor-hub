import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { designPrompt, garmentType, archetype, styleFormula, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const bodyType = (preferences as any)?.bodyShape || (styleFormula as any)?.bodyShape || null;
    const colorSeason = (styleFormula as any)?.colorSeason || (preferences as any)?.colorSeason || null;
    const bestColors = (styleFormula as any)?.bestColors || (preferences as any)?.bestColors || [];

    const systemPrompt = `You are an expert fashion stylist and trend analyst. Given a fashion design description, provide personalized modification recommendations. Consider:
1. Current trending fashion elements (2026 trends)
2. The user's body type and what flatters it
3. Color theory and the user's color season
4. The user's style archetype
Keep recommendations concise (3-5 bullet points), actionable, and specific. Each bullet should suggest a concrete modification.`;

    const userPrompt = `Design: "${designPrompt}" (${garmentType})
${archetype ? `Style archetype: ${archetype}` : ""}
${bodyType ? `Body type: ${bodyType}` : ""}
${colorSeason ? `Color season: ${colorSeason}` : ""}
${bestColors?.length ? `Best colors: ${bestColors.join(", ")}` : ""}

Suggest modifications to make this design more flattering and on-trend for this person.`;

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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service error");
    }

    const data = await response.json();
    const recommendations = data.choices?.[0]?.message?.content || "No recommendations available.";

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("style-recommendations error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
