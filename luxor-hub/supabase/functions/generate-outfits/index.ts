import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Extract authenticated user from JWT — NEVER trust userId from request body */
async function getAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return null;
  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: { user }, error } = await sb.auth.getUser();
  if (error || !user) return null;
  return user;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders, status: 200 });

  try {
    // ── TENANT ISOLATION: Validate user via JWT ──
    const authUser = await getAuthenticatedUser(req);
    if (!authUser) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    const { closetItems, occasion, mood, styleProfile, upcomingEvents, weatherForecast, count } = await req.json();
    const MIMO_API_KEY = Deno.env.get("MIMO_API_KEY");
    if (!MIMO_API_KEY) throw new Error("MIMO_API_KEY is not configured");

    const outfitCount = Math.min(count || 3, 7);

    const itemsList = closetItems.map((item: any) =>
      `- ${item.name || 'Unnamed'} (${item.category}, ${item.color || 'unknown color'}, ${item.style || 'unclassified'}, ${item.season || 'all-season'})`
    ).join("\n");

    let calendarContext = "";
    if (upcomingEvents && upcomingEvents.length > 0) {
      calendarContext = `\n\nUpcoming calendar events (factor these into your suggestions):\n${upcomingEvents.map((e: any) => `- ${e.title} on ${e.event_date}${e.occasion ? ` (${e.occasion})` : ""}`).join("\n")}`;
    }

    let weatherContext = "";
    if (weatherForecast && weatherForecast.length > 0) {
      weatherContext = `\n\nWeather forecast for upcoming days (factor temperature and conditions into outfit choices):\n${weatherForecast.map((w: any) => `- ${w.date}: ${w.temp}°C, ${w.description}${w.rain ? ', rain expected' : ''}`).join("\n")}`;
    }

    const systemPrompt = `You are LUXOR®, an elite AI stylist. Generate exactly ${outfitCount} complete outfit combinations from the user's closet items.

User's closet items:
${itemsList}

${styleProfile ? `Style DNA: ${styleProfile.archetype}` : ""}${calendarContext}${weatherContext}

Rules:
- Each outfit must use ONLY items from the closet list above
- Reference items by their exact names
- Each outfit needs at minimum a top and bottom (or a dress)
- Consider the occasion and mood requested
- If there are upcoming calendar events, tailor at least one outfit for the nearest event
- If weather data is provided, choose items appropriate for the temperature and conditions (e.g., layers for cold, waterproof for rain, breathable for heat)`;

    const userPrompt = `Create 3 outfits for: ${occasion || "everyday"}${mood ? `, mood: ${mood}` : ""}`;

    const response = await fetch("https://api.xiaomimimo.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "api-key": MIMO_API_KEY,
        "HTTP-Referer": "https://luxor.ly",
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
