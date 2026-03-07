import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { userId } = await req.json();
    if (!userId) throw new Error("userId required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [styleRes, closetRes] = await Promise.all([
      sb.from("style_profiles").select("archetype, preferences").eq("user_id", userId).single(),
      sb.from("clothing_items").select("name, category, color, style").eq("user_id", userId),
    ]);

    const style = styleRes.data;
    const closet = closetRes.data || [];

    const closetSummary = closet.map((i: any) =>
      `${i.name || "Unnamed"} (${i.category}, ${i.color || "?"})`
    ).join("; ");

    const now = new Date();
    const month = now.toLocaleString("en-US", { month: "long" });
    const year = now.getFullYear();

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
            content: `You are a fashion trend analyst. It is ${month} ${year}. Analyze current fashion trends and match them to this user's profile.

User's Style Archetype: ${style?.archetype || "Unknown"}
Color Season: ${(style?.preferences as any)?.aiAnalysis?.colorSeason || "Unknown"}
Body Shape: ${(style?.preferences as any)?.bodyShape || "Unknown"}

User's closet: ${closetSummary || "Empty"}

Provide 5-6 current fashion trends. For each, indicate:
- Whether this trend matches their Style DNA (high/medium/low)
- Which closet items (if any) already fit this trend
- What they could add to embrace it`,
          },
          { role: "user", content: "What are the current fashion trends and how do they match my style?" },
        ],
        tools: [{
          type: "function",
          function: {
            name: "trend_report",
            description: "Return current fashion trends matched to user profile",
            parameters: {
              type: "object",
              properties: {
                season: { type: "string", description: "Current fashion season e.g. Spring/Summer 2026" },
                trends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Trend name" },
                      description: { type: "string", description: "Brief trend description" },
                      matchLevel: { type: "string", enum: ["high", "medium", "low"], description: "How well it matches user's Style DNA" },
                      matchReason: { type: "string", description: "Why it does/doesn't match" },
                      closetMatches: { type: "array", items: { type: "string" }, description: "User's closet items that fit this trend" },
                      shoppingTip: { type: "string", description: "What to add to embrace this trend" },
                      emoji: { type: "string", description: "Single emoji representing the trend" },
                    },
                    required: ["name", "description", "matchLevel", "matchReason", "closetMatches", "shoppingTip", "emoji"],
                    additionalProperties: false,
                  },
                },
                summary: { type: "string", description: "Overall trend alignment summary for this user" },
              },
              required: ["season", "trends", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "trend_report" } },
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
    if (!toolCall) throw new Error("No trend report returned");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("trend-intelligence error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
