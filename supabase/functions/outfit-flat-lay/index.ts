import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { imageUrl } = await req.json();
    if (!imageUrl) throw new Error("imageUrl is required");

    // Run both AI calls in parallel
    const [imageResponse, itemsResponse] = await Promise.all([
      // 1. Generate flat-lay image
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `You are a fashion photography expert. Look at this outfit photo and create a beautiful flat-lay arrangement of ALL the clothing items and accessories visible on the person.

INSTRUCTIONS:
- Separate each individual garment, shoe, accessory, bag, jewelry piece
- Arrange them artfully on a clean cream/off-white linen fabric background
- Style it like a premium fashion magazine flat-lay editorial
- Each item should be neatly folded or displayed individually
- Add subtle shadows for depth
- Keep spacing balanced and aesthetically pleasing
- Include ALL visible items: tops, bottoms, shoes, belts, watches, bags, sunglasses, jewelry, hats
- The arrangement should be overhead/bird's-eye view

Generate the flat-lay image now.`,
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          modalities: ["image", "text"],
        }),
      }),

      // 2. Extract item details via tool calling
      fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this outfit photo and identify every individual clothing item and accessory the person is wearing. Be specific about each piece.",
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl },
                },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_outfit_items",
                description: "Extract all clothing items and accessories from the outfit photo",
                parameters: {
                  type: "object",
                  properties: {
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Item name e.g. 'Tailored Navy Blazer'" },
                          category: { type: "string", enum: ["top", "bottom", "outerwear", "shoes", "accessory", "bag", "jewelry", "hat", "eyewear"] },
                          color: { type: "string", description: "Primary color e.g. 'Navy Blue'" },
                          style: { type: "string", description: "Style descriptor e.g. 'Classic', 'Casual', 'Streetwear'" },
                          confidence: { type: "number", description: "Detection confidence 0-100" },
                        },
                        required: ["name", "category", "color", "style", "confidence"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["items"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "extract_outfit_items" } },
        }),
      }),
    ]);

    // Handle rate limits / payment errors
    for (const [resp, label] of [[imageResponse, "Image generation"], [itemsResponse, "Item extraction"]] as const) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!resp.ok) {
        const errText = await resp.text();
        console.error(`${label} error:`, resp.status, errText);
        throw new Error(`${label} failed`);
      }
    }

    const imageData = await imageResponse.json();
    const itemsData = await itemsResponse.json();

    // Extract flat-lay image
    const flatLayImage = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;

    // Extract items from tool call
    let items: any[] = [];
    try {
      const toolCall = itemsData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        items = parsed.items || [];
      }
    } catch (e) {
      console.error("Failed to parse items:", e);
    }

    return new Response(
      JSON.stringify({ flatLayImage, items }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("outfit-flat-lay error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
