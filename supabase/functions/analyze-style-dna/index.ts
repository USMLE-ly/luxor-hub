import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { selfieImage, fullBodyImage, preferences, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Mode: "face" = face shape only, "body" = body shape only, default = full analysis
    if (mode === "face") {
      return await analyzeFace(selfieImage, LOVABLE_API_KEY, corsHeaders);
    }
    if (mode === "body") {
      return await analyzeBody(fullBodyImage, preferences, LOVABLE_API_KEY, corsHeaders);
    }

    // Full analysis (original behavior + face/body shape)
    const content: any[] = [
      {
        type: "text",
        text: `You are an expert fashion stylist and color analyst. Analyze these photos to determine the user's:

1. **Color Type** (Season): Determine if they are Spring, Summer, Autumn, or Winter based on their skin tone, hair color, and eye color. Also determine warm/cool undertone.
2. **Best Colors**: List 6-8 colors that would look best on them.
3. **Colors to Avoid**: List 3-4 colors they should avoid.
4. **Style Archetype**: Based on their body proportions, psychographic profile, and preferences below, create a unique Style Archetype name (e.g., "Modern Minimal Power", "Romantic Street Edge", "Creative Bohemian Intellect"). Factor in their lifestyle, profession, and desired mood.
5. **Style Score**: Rate their current style potential 1-100 based on proportions and features.
6. **Key Recommendations**: 3-4 specific style tips for their body type, coloring, AND lifestyle/profession.
7. **Face Shape**: Determine face shape from selfie (Oval, Round, Square, Heart, Oblong, or Diamond).
8. **Body Shape**: Determine body shape from full body photo. For women: Hourglass, Triangle, Inverted Triangle, Rectangle, or Round. For men: Rectangle, Triangle, Inverted Triangle, Oval, or Trapezoid.
9. **Recommended Prints**: 4-6 print/pattern types that suit their style archetype and body type.
10. **Recommended Fabrics**: 4-6 fabric/material types that complement their body and style.
11. **Flattering Silhouettes**: 4-6 specific garment silhouettes/cuts that flatter their body type.
12. **Color Usage Tips**: For each best color, suggest what garment type it works best for.
13. **Style Evolution Prediction**: Based on their current preferences, lifestyle, profession, and mood goals, predict 3 style evolution stages they're likely to go through over the next 1-3 years. Each stage should have a name, timeframe, key changes, and what triggers the evolution.

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
  "summary": "string (2-3 sentence summary)",
  "faceShape": "string",
  "faceShapeDescription": "string (1 sentence about their face shape characteristics)",
  "bodyShape": "string",
  "bodyShapeTraits": ["string (3 traits)"],
  "recommendedPrints": ["string"],
  "recommendedFabrics": ["string"],
  "flatteringSilhouettes": ["string"],
  "colorUsageTips": [{"color": "string", "usage": "string"}],
  "styleEvolution": [{"stage": "string", "timeframe": "string", "changes": ["string"], "trigger": "string"}]
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
                  faceShape: { type: "string", enum: ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"] },
                  faceShapeDescription: { type: "string" },
                  bodyShape: { type: "string" },
                  bodyShapeTraits: { type: "array", items: { type: "string" } },
                  recommendedPrints: { type: "array", items: { type: "string" } },
                  recommendedFabrics: { type: "array", items: { type: "string" } },
                  flatteringSilhouettes: { type: "array", items: { type: "string" } },
                  colorUsageTips: { type: "array", items: { type: "object", properties: { color: { type: "string" }, usage: { type: "string" } }, required: ["color", "usage"] } },
                },
                required: ["colorSeason", "undertone", "bestColors", "colorsToAvoid", "archetype", "styleScore", "recommendations", "summary", "faceShape", "faceShapeDescription", "bodyShape", "bodyShapeTraits", "recommendedPrints", "recommendedFabrics", "flatteringSilhouettes", "colorUsageTips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "style_dna_analysis" } },
      }),
    });

    if (!response.ok) {
      return handleAIError(response, corsHeaders);
    }

    const data = await response.json();
    const analysis = parseToolCall(data);

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

async function analyzeFace(selfieImage: string, apiKey: string, corsHeaders: Record<string, string>) {
  if (!selfieImage) {
    return new Response(JSON.stringify({ error: "No selfie image provided" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this selfie photo and determine the person's face shape. Choose from: Oval, Round, Square, Heart, Oblong, Diamond. Also provide a brief 1-sentence description of their facial characteristics that led to this determination.`,
          },
          { type: "image_url", image_url: { url: selfieImage } },
        ],
      }],
      tools: [{
        type: "function",
        function: {
          name: "face_shape_result",
          description: "Return the detected face shape",
          parameters: {
            type: "object",
            properties: {
              faceShape: { type: "string", enum: ["Oval", "Round", "Square", "Heart", "Oblong", "Diamond"] },
              description: { type: "string" },
            },
            required: ["faceShape", "description"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "face_shape_result" } },
    }),
  });

  if (!response.ok) return handleAIError(response, corsHeaders);
  const data = await response.json();
  const result = parseToolCall(data);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function analyzeBody(fullBodyImage: string, preferences: any, apiKey: string, corsHeaders: Record<string, string>) {
  if (!fullBodyImage) {
    return new Response(JSON.stringify({ error: "No full body image provided" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const gender = preferences?.gender || "female";
  const bodyOptions = gender === "female"
    ? "Hourglass, Triangle, Inverted Triangle, Rectangle, Round"
    : "Rectangle, Triangle, Inverted Triangle, Oval, Trapezoid";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text: `Analyze this full body photo and determine the person's body shape. The person identifies as ${gender}. Choose from: ${bodyOptions}. Also provide exactly 3 short trait descriptions that characterize this body shape.`,
          },
          { type: "image_url", image_url: { url: fullBodyImage } },
        ],
      }],
      tools: [{
        type: "function",
        function: {
          name: "body_shape_result",
          description: "Return the detected body shape",
          parameters: {
            type: "object",
            properties: {
              bodyShape: { type: "string" },
              traits: { type: "array", items: { type: "string" } },
            },
            required: ["bodyShape", "traits"],
            additionalProperties: false,
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "body_shape_result" } },
    }),
  });

  if (!response.ok) return handleAIError(response, corsHeaders);
  const data = await response.json();
  const result = parseToolCall(data);

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function handleAIError(response: Response, corsHeaders: Record<string, string>) {
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

function parseToolCall(data: any) {
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }
  const content = data.choices?.[0]?.message?.content || "";
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  throw new Error("Could not parse AI response");
}
