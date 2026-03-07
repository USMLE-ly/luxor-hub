import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, archetype, colorSeason, bestColors, garmentType } = await req.json();
    if (!prompt) throw new Error("prompt is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const styleContext = [
      archetype ? `Style archetype: ${archetype}.` : "",
      colorSeason ? `Color season: ${colorSeason}.` : "",
      bestColors?.length ? `Best colors: ${bestColors.join(", ")}.` : "",
      garmentType ? `Garment type: ${garmentType}.` : "",
    ].filter(Boolean).join(" ");

    const fullPrompt = `Design a high-fashion ${garmentType || "clothing"} piece. ${styleContext} User request: ${prompt}. 
Show it as a professional fashion illustration on a clean white background, studio lighting, high detail, editorial quality. Show only the garment, no model.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: fullPrompt }],
        modalities: ["image", "text"],
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
    const message = data.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url;
    const description = message?.content || "";

    if (!imageUrl) throw new Error("No image generated");

    return new Response(JSON.stringify({ imageUrl, description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("design-clothing error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
