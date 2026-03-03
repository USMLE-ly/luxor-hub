import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl, itemName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const messages: any[] = [
      {
        role: "system",
        content: "You are a fashion item analyzer. Analyze the clothing item and extract structured data about it.",
      },
    ];

    if (imageUrl) {
      messages.push({
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: `Analyze this clothing item${itemName ? ` called "${itemName}"` : ""}. Determine its category, color, style, season, and occasion.` },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `Analyze a clothing item${itemName ? ` called "${itemName}"` : ""}. Based on the name, determine likely category, color, style, season, and occasion.`,
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        tools: [{
          type: "function",
          function: {
            name: "analyze_clothing",
            description: "Return structured analysis of a clothing item",
            parameters: {
              type: "object",
              properties: {
                category: { type: "string", enum: ["top", "bottom", "shoes", "accessory", "outerwear", "dress", "other"] },
                color: { type: "string", description: "Primary color" },
                style: { type: "string", enum: ["casual", "formal", "streetwear", "sporty", "bohemian", "classic", "avant-garde", "minimalist"] },
                season: { type: "string", enum: ["spring", "summer", "fall", "winter", "all-season"] },
                occasion: { type: "string", enum: ["everyday", "work", "party", "formal", "athletic", "date", "travel"] },
                suggestedName: { type: "string", description: "Suggested name if none provided" },
              },
              required: ["category", "color", "style", "season", "occasion"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "analyze_clothing" } },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "unknown");
      console.error(`AI gateway error: status=${response.status} body=${errorBody}`);
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
      throw new Error(`AI service error (${response.status}): ${errorBody.substring(0, 200)}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned");

    const analysis = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-item error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
