import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            content: `You are AURELIA, an elite AI fashion analyst. You provide comprehensive, detailed outfit analysis. Be specific, insightful, and constructive. Use a warm but professional tone.`,
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: imageUrl } },
              {
                type: "text",
                text: `Analyze this outfit photo comprehensively. Return a detailed JSON analysis using the analyze_outfit tool.

For each occasion rating, give a score from 0-100 and a brief reason.
For improvement suggestions, be specific and actionable.
For color analysis, identify the palette and harmony.
Identify each visible clothing item with its category, color, and estimated style.`,
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_outfit",
              description: "Return comprehensive outfit analysis",
              parameters: {
                type: "object",
                properties: {
                  overallStyle: {
                    type: "string",
                    description: "Overall style classification e.g. 'Smart Casual', 'Business Casual', 'Streetwear'",
                  },
                  styleScore: {
                    type: "number",
                    description: "Overall style score 0-100",
                  },
                  summary: {
                    type: "string",
                    description: "2-3 sentence summary of the outfit",
                  },
                  occasionRatings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        occasion: { type: "string" },
                        score: { type: "number" },
                        reason: { type: "string" },
                      },
                      required: ["occasion", "score", "reason"],
                      additionalProperties: false,
                    },
                    description: "Ratings for: Casual, Work/Office, Evening Out, Date Night, Formal Event, Weekend Brunch",
                  },
                  detectedItems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string" },
                        color: { type: "string" },
                        style: { type: "string" },
                      },
                      required: ["name", "category", "color", "style"],
                      additionalProperties: false,
                    },
                  },
                  colorPalette: {
                    type: "object",
                    properties: {
                      colors: {
                        type: "array",
                        items: { type: "string" },
                        description: "List of hex color codes detected",
                      },
                      harmony: { type: "string", description: "Color harmony type e.g. 'Warm Tonal', 'Complementary'" },
                      rating: { type: "string", description: "How well colors work together" },
                    },
                    required: ["colors", "harmony", "rating"],
                    additionalProperties: false,
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 strengths of this outfit",
                  },
                  improvements: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        suggestion: { type: "string" },
                        reason: { type: "string" },
                        priority: { type: "string", enum: ["high", "medium", "low"] },
                      },
                      required: ["suggestion", "reason", "priority"],
                      additionalProperties: false,
                    },
                    description: "Specific improvement suggestions",
                  },
                  seasonalFit: {
                    type: "string",
                    description: "Which season(s) this outfit is best suited for",
                  },
                  bodyTypeNotes: {
                    type: "string",
                    description: "How the silhouette and fit work",
                  },
                },
                required: [
                  "overallStyle",
                  "styleScore",
                  "summary",
                  "occasionRatings",
                  "detectedItems",
                  "colorPalette",
                  "strengths",
                  "improvements",
                  "seasonalFit",
                  "bodyTypeNotes",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_outfit" } },
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
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned");

    const analysis = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-outfit error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
