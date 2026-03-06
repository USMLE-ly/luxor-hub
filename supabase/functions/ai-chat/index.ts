import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userId, styleProfile, closetSummary, image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are AURELIA, an elite AI personal stylist. You speak with warmth, confidence, and deep fashion knowledge.

${styleProfile ? `User's Style DNA: ${styleProfile.archetype}
Color Season: ${(styleProfile.preferences as any)?.aiAnalysis?.colorSeason || "Unknown"}
Body Type: ${(styleProfile.preferences as any)?.bodyShape || "Unknown"}
Preferences: ${JSON.stringify(styleProfile.preferences)}` : ""}

${closetSummary ? `User's Closet Summary: ${closetSummary}` : ""}

Guidelines:
- Give specific, actionable fashion advice
- Reference items from their closet when possible
- Consider occasion, weather, and personal style
- Be encouraging and supportive
- Use markdown formatting for readability
- Keep responses concise but helpful

When the user shares an image of a clothing item for compatibility checking:
- Analyze the item's color, style, silhouette, and fabric
- Compare against their color season palette (best colors vs colors to avoid)
- Evaluate fit with their body type and style archetype
- Give a **Match Score** from 0-100% with clear reasoning
- Format: Start with "## 🎯 Match Score: X%" followed by breakdown
- Categories: Color Match, Style Fit, Wardrobe Synergy, Body Type Compatibility
- End with a verdict: ✅ Great Match, ⚠️ Partial Match, or ❌ Not Recommended`;

    // Build the last user message with optional image
    const processedMessages = [...messages];
    if (image && processedMessages.length > 0) {
      const lastMsg = processedMessages[processedMessages.length - 1];
      if (lastMsg.role === "user") {
        processedMessages[processedMessages.length - 1] = {
          role: "user",
          content: [
            { type: "text", text: lastMsg.content },
            { type: "image_url", image_url: { url: image } },
          ],
        };
      }
    }

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
          ...processedMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
