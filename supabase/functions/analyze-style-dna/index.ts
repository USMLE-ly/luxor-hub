import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { selfieImage, fullBodyImage, preferences } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const content: any[] = [
      {
        type: "text",
        text: `You are an expert fashion stylist and color analyst. Analyze these photos to determine the user's:

1. **Color Type** (Season): Determine if they are Spring, Summer, Autumn, or Winter based on their skin tone, hair color, and eye color. Also determine warm/cool undertone.
2. **Best Colors**: List 6-8 colors that would look best on them.
3. **Colors to Avoid**: List 3-4 colors they should avoid.
4. **Style Archetype**: Based on their body proportions and the preferences below, create a unique Style Archetype name (e.g., "Modern Minimal Power", "Romantic Street Edge").
5. **Style Score**: Rate their current style potential 1-100 based on proportions and features.
6. **Key Recommendations**: 3-4 specific style tips for their body type and coloring.

User preferences: ${JSON.stringify(preferences)}

Return JSON with this exact structure:
{
  "colorSeason": "string",
  "undertone": "warm" | "cool" | "neutral",
  "bestColors": ["string"],
  "colorsToAvoid": ["string"],
  "archetype": "string",
  "styleScore": number,
  "recommendations": ["string"],
  "summary": "string (2-3 sentence summary)"
}`
      }
    ];

    if (selfieImage) {
      content.push({ type: "image_url", image_url: { url: selfieImage } });
    }
    if (fullBodyImage) {
      content.push({ type: "image_url", image_url: { url: fullBodyImage } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content }],
        tools: [
          {
            type: "function",
            function: {
              name: "style_dna_analysis",
              description: "Return the complete style DNA analysis",
              parameters: {
                type: "object",
                properties: {
                  colorSeason: { type: "string", enum: ["Spring", "Summer", "Autumn", "Winter"] },
                  undertone: { type: "string", enum: ["warm", "cool", "neutral"] },
                  bestColors: { type: "array", items: { type: "string" } },
                  colorsToAvoid: { type: "array", items: { type: "string" } },
                  archetype: { type: "string" },
                  styleScore: { type: "number" },
                  recommendations: { type: "array", items: { type: "string" } },
                  summary: { type: "string" },
                },
                required: ["colorSeason", "undertone", "bestColors", "colorsToAvoid", "archetype", "styleScore", "recommendations", "summary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "style_dna_analysis" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    let analysis;
    
    if (toolCall?.function?.arguments) {
      analysis = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse from content
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-style-dna error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
