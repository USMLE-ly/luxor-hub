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

    // Fetch closet, calendar events for next 7 days, style profile, and weather
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const [closetRes, eventsRes, styleRes] = await Promise.all([
      sb.from("clothing_items")
        .select("name, category, color, style, season")
        .eq("user_id", userId),
      sb.from("calendar_events")
        .select("title, event_date, occasion, notes")
        .eq("user_id", userId)
        .gte("event_date", today.toISOString().split("T")[0])
        .lte("event_date", nextWeek.toISOString().split("T")[0])
        .order("event_date"),
      sb.from("style_profiles")
        .select("archetype, preferences")
        .eq("user_id", userId)
        .single(),
    ]);

    const closetItems = closetRes.data || [];
    const events = eventsRes.data || [];
    const style = styleRes.data;

    // Try to get weather
    let weatherInfo = "";
    try {
      const weatherRes = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/get-weather`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
          },
          body: JSON.stringify({}),
        }
      );
      if (weatherRes.ok) {
        const w = await weatherRes.json();
        if (w.temperature !== undefined) {
          weatherInfo = `Current weather: ${w.temperature}°C, ${w.description || ""}. Plan outfits accordingly.`;
        }
      }
    } catch { /* non-fatal */ }

    const itemsList = closetItems.map((i: any) =>
      `${i.name || "Unnamed"} (${i.category}, ${i.color || "?"}, ${i.style || "?"}, ${i.season || "all-season"})`
    ).join("; ");

    const eventsList = events.length > 0
      ? events.map((e: any) => `${e.event_date}: ${e.title}${e.occasion ? ` [${e.occasion}]` : ""}`).join("\n")
      : "No scheduled events";

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      days.push(d.toISOString().split("T")[0]);
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
          {
            role: "system",
            content: `You are AURELIA, an elite AI stylist. Generate a 7-day capsule wardrobe plan using ONLY items from the user's closet.

Closet: ${itemsList}
Style: ${style?.archetype || "Unknown"}
Color Season: ${(style?.preferences as any)?.aiAnalysis?.colorSeason || "Unknown"}
${weatherInfo}

Calendar:\n${eventsList}

Rules:
- Use ONLY items from the closet list. Reference by exact name.
- Each day needs a complete outfit (top + bottom or dress, plus optional layers/accessories).
- Tailor outfits to calendar events on those days.
- Minimize repetition — maximize variety.
- Consider weather and season.
- The 7 days are: ${days.join(", ")}`,
          },
          { role: "user", content: "Generate my 7-day capsule wardrobe plan." },
        ],
        tools: [{
          type: "function",
          function: {
            name: "weekly_capsule_plan",
            description: "Return a 7-day outfit plan",
            parameters: {
              type: "object",
              properties: {
                plan: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      date: { type: "string", description: "YYYY-MM-DD" },
                      dayLabel: { type: "string", description: "e.g. Monday, Tuesday" },
                      outfitName: { type: "string", description: "Creative outfit name" },
                      items: { type: "array", items: { type: "string" }, description: "Exact item names from closet" },
                      occasion: { type: "string", description: "Occasion like everyday, work, date night" },
                      tip: { type: "string", description: "One-line styling tip for the day" },
                    },
                    required: ["date", "dayLabel", "outfitName", "items", "occasion", "tip"],
                    additionalProperties: false,
                  },
                },
                summary: { type: "string", description: "Brief overview of the week's style theme" },
              },
              required: ["plan", "summary"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "weekly_capsule_plan" } },
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
    if (!toolCall) throw new Error("No plan returned");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weekly-capsule error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
