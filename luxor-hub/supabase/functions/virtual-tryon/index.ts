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


    const { userPhotoUrl, designImageUrl, garmentType } = await req.json();
    if (!userPhotoUrl || !designImageUrl) throw new Error("userPhotoUrl and designImageUrl are required");

    const MIMO_API_KEY = Deno.env.get("MIMO_API_KEY");
    if (!MIMO_API_KEY) throw new Error("MIMO_API_KEY is not configured");

    const editPrompt = `Take the person in the first image and dress them in the ${garmentType || "clothing"} garment shown in the second image. Create a realistic, photographic result showing the person wearing this exact garment. Maintain the person's face, body, and pose exactly. The garment should fit naturally on their body with proper proportions, shadows, and fabric draping. Professional fashion photography style.`;

    const response = await fetch("https://api.xiaomimimo.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "api-key": MIMO_API_KEY,
        "HTTP-Referer": "https://luxor.ly",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: editPrompt },
              { type: "image_url", image_url: { url: userPhotoUrl } },
              { type: "image_url", image_url: { url: designImageUrl } },
            ],
          },
        ],
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
    const resultImageUrl = message?.images?.[0]?.image_url?.url;
    const description = message?.content || "";

    if (!resultImageUrl) throw new Error("No try-on result generated");

    return new Response(JSON.stringify({ resultImageUrl, description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("virtual-tryon error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
