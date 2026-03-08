import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userId, styleProfile, closetSummary, image, mood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ── AI Memory: Fetch recent analyses, favorites, and remembered preferences ──
    let memoryContext = "";
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const sb = createClient(supabaseUrl, supabaseKey);

        const [analysesRes, favoritesRes, wearRes] = await Promise.all([
          sb.from("outfit_analyses")
            .select("overall_style, style_score, strengths, improvements, summary, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(5),
          sb.from("outfits")
            .select("name, occasion, mood, ai_explanation")
            .eq("user_id", userId)
            .eq("is_favorite", true)
            .limit(5),
          sb.from("wear_logs")
            .select("worn_at, clothing_item_id, clothing_items(name, category, color)")
            .eq("user_id", userId)
            .order("worn_at", { ascending: false })
            .limit(10),
        ]);

        const parts: string[] = [];

        if (analysesRes.data?.length) {
          parts.push(`Recent outfit analyses (most recent first):\n${analysesRes.data.map(a =>
            `- Score ${a.style_score}/100: "${a.overall_style}" — ${a.summary}`
          ).join("\n")}`);
        }

        if (favoritesRes.data?.length) {
          parts.push(`User's favorite outfits:\n${favoritesRes.data.map(f =>
            `- "${f.name}" for ${f.occasion || "any occasion"}${f.mood ? `, mood: ${f.mood}` : ""}${f.ai_explanation ? ` — ${f.ai_explanation}` : ""}`
          ).join("\n")}`);
        }

        if (wearRes.data?.length) {
          parts.push(`Recent wear history:\n${wearRes.data.map((w: any) => {
            const item = w.clothing_items;
            return `- Wore "${item?.name || "item"}" (${item?.category || ""}, ${item?.color || ""}) on ${w.worn_at}`;
          }).join("\n")}`);
        }

        // Extract remembered preferences from style_profiles.preferences
        const prefs = styleProfile?.preferences;
        if (prefs) {
          const remembered: string[] = [];
          if (prefs.dislikes) remembered.push(`Dislikes: ${JSON.stringify(prefs.dislikes)}`);
          if (prefs.favoriteColors) remembered.push(`Favorite colors: ${prefs.favoriteColors.join(", ")}`);
          if (prefs.avoidColors) remembered.push(`Colors to avoid: ${prefs.avoidColors.join(", ")}`);
          if (prefs.styleGoals) remembered.push(`Style goals: ${prefs.styleGoals}`);
          if (prefs.lifestyle) remembered.push(`Lifestyle: ${prefs.lifestyle}`);
          if (prefs.profession) remembered.push(`Profession: ${prefs.profession}`);
          if (remembered.length) parts.push(`Remembered preferences:\n${remembered.join("\n")}`);
        }

        if (parts.length) {
          memoryContext = `\n\n=== YOUR MEMORY (use this to personalize advice) ===\n${parts.join("\n\n")}`;
        }
      } catch (e) {
        console.error("Memory fetch error (non-fatal):", e);
      }
    }

    const moodContext = mood ? `\nThe user's current mood is: ${mood}. Adjust your suggestions to match their emotional state.` : "";

    const systemPrompt = `You are AURELIA, an elite AI personal stylist. You speak with warmth, confidence, and deep fashion knowledge.

${styleProfile ? `User's Style DNA: ${styleProfile.archetype}
Color Season: ${(styleProfile.preferences as any)?.aiAnalysis?.colorSeason || "Unknown"}
Body Type: ${(styleProfile.preferences as any)?.bodyShape || "Unknown"}
Preferences: ${JSON.stringify(styleProfile.preferences)}` : ""}

${closetSummary ? `User's Closet Summary: ${closetSummary}` : ""}${memoryContext}${moodContext}

Guidelines:
- Give specific, actionable fashion advice
- Reference items from their closet when possible
- Use your memory of past analyses, favorite outfits, and wear patterns to personalize advice
- If the user mentions a preference or dislike, acknowledge you'll remember it
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
- End with a verdict: ✅ Great Match, ⚠️ Partial Match, or ❌ Not Recommended

IMPORTANT — Preference Memory:
When a user says they like or dislike something (colors, fabrics, styles, fits), note it explicitly in your response.
For example: "Got it — I'll remember that you prefer relaxed fits over slim cuts."`;

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
