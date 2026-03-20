import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const COUNCIL_MODELS = [
  { id: "google/gemini-2.5-pro", name: "Gemini Pro" },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini" },
  { id: "google/gemini-3-flash-preview", name: "Gemini Flash" },
];

const CHAIRMAN_MODEL = "google/gemini-2.5-pro";

async function callModel(
  apiKey: string,
  model: string,
  messages: any[],
  stream = false,
  tools?: any[],
  toolChoice?: any,
): Promise<Response> {
  const body: any = { model, messages, stream };
  if (tools) body.tools = tools;
  if (toolChoice) body.tool_choice = toolChoice;

  return fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function extractContent(resp: Response): Promise<string> {
  if (!resp.ok) {
    const t = await resp.text();
    console.error("Model error:", resp.status, t);
    throw new Error(`Model returned ${resp.status}`);
  }
  const json = await resp.json();
  // Handle tool call responses
  const toolCalls = json.choices?.[0]?.message?.tool_calls;
  if (toolCalls?.length) {
    return toolCalls[0].function.arguments;
  }
  return json.choices?.[0]?.message?.content || "";
}

function buildSystemPrompt(styleProfile: any, closetSummary: string, memoryContext: string, mood: string | null) {
  const moodContext = mood ? `\nThe user's current mood is: ${mood}. Adjust your suggestions to match their emotional state.` : "";
  return `You are LEXOR®, an elite AI personal stylist. You speak with warmth, confidence, and deep fashion knowledge.

${styleProfile ? `User's Style DNA: ${styleProfile.archetype}
Color Season: ${(styleProfile.preferences as any)?.aiAnalysis?.colorSeason || "Unknown"}
Body Type: ${(styleProfile.preferences as any)?.bodyShape || "Unknown"}
Preferences: ${JSON.stringify(styleProfile.preferences)}` : ""}

${closetSummary ? `User's Closet Summary: ${closetSummary}` : ""}${memoryContext}${moodContext}

Guidelines:
- Give specific, actionable fashion advice
- Reference items from their closet when possible
- Use your memory of past analyses and wear patterns to personalize advice
- Consider occasion, weather, and personal style
- Be encouraging and supportive
- Use markdown formatting for readability
- Keep responses concise but helpful`;
}

async function fetchMemory(userId: string, styleProfile: any) {
  let memoryContext = "";
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const [analysesRes, favoritesRes, wearRes] = await Promise.all([
      sb.from("outfit_analyses")
        .select("overall_style, style_score, strengths, improvements, summary, created_at")
        .eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
      sb.from("outfits")
        .select("name, occasion, mood, ai_explanation")
        .eq("user_id", userId).eq("is_favorite", true).limit(5),
      sb.from("wear_logs")
        .select("worn_at, clothing_item_id, clothing_items(name, category, color)")
        .eq("user_id", userId).order("worn_at", { ascending: false }).limit(10),
    ]);

    const parts: string[] = [];
    if (analysesRes.data?.length) {
      parts.push(`Recent outfit analyses:\n${analysesRes.data.map(a => `- Score ${a.style_score}/100: "${a.overall_style}" — ${a.summary}`).join("\n")}`);
    }
    if (favoritesRes.data?.length) {
      parts.push(`Favorite outfits:\n${favoritesRes.data.map(f => `- "${f.name}" for ${f.occasion || "any occasion"}`).join("\n")}`);
    }
    if (wearRes.data?.length) {
      parts.push(`Recent wear history:\n${wearRes.data.map((w: any) => {
        const item = w.clothing_items;
        return `- Wore "${item?.name || "item"}" (${item?.category || ""}, ${item?.color || ""}) on ${w.worn_at}`;
      }).join("\n")}`);
    }
    const prefs = styleProfile?.preferences;
    if (prefs) {
      const remembered: string[] = [];
      if (prefs.dislikes) remembered.push(`Dislikes: ${JSON.stringify(prefs.dislikes)}`);
      if (prefs.favoriteColors) remembered.push(`Favorite colors: ${prefs.favoriteColors.join(", ")}`);
      if (prefs.avoidColors) remembered.push(`Colors to avoid: ${prefs.avoidColors.join(", ")}`);
      if (remembered.length) parts.push(`Remembered preferences:\n${remembered.join("\n")}`);
    }
    if (parts.length) memoryContext = `\n\n=== YOUR MEMORY ===\n${parts.join("\n\n")}`;
  } catch (e) {
    console.error("Memory fetch error (non-fatal):", e);
  }
  return memoryContext;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, userId, styleProfile, closetSummary, image, mood } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const memoryContext = userId ? await fetchMemory(userId, styleProfile) : "";
    const systemPrompt = buildSystemPrompt(styleProfile, closetSummary || "", memoryContext, mood);

    // Build user messages with optional image
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

    const allMessages = [{ role: "system", content: systemPrompt }, ...processedMessages];

    // SSE encoder
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          // ═══ STAGE 1: Query 3 models in parallel ═══
          sendEvent({ type: "stage", stage: 1, status: "start" });

          const stage1Results = await Promise.allSettled(
            COUNCIL_MODELS.map(async (m) => {
              const resp = await callModel(LOVABLE_API_KEY, m.id, allMessages, false);
              if (!resp.ok) {
                if (resp.status === 429 || resp.status === 402) throw new Error(`${resp.status}`);
                throw new Error(`Model ${m.name} failed: ${resp.status}`);
              }
              const content = await extractContent(resp);
              return { model: m.name, modelId: m.id, response: content };
            })
          );

          const stage1Data = stage1Results
            .filter((r): r is PromiseFulfilledResult<{ model: string; modelId: string; response: string }> => r.status === "fulfilled")
            .map(r => r.value);

          if (stage1Data.length < 2) {
            // Check for rate limit / payment errors
            const rejected = stage1Results.find(r => r.status === "rejected");
            const errMsg = (rejected as PromiseRejectedResult)?.reason?.message || "";
            if (errMsg.includes("429")) {
              sendEvent({ type: "error", error: "Rate limit exceeded. Please try again in a moment." });
              controller.close();
              return;
            }
            if (errMsg.includes("402")) {
              sendEvent({ type: "error", error: "AI credits exhausted. Please add credits." });
              controller.close();
              return;
            }
            sendEvent({ type: "error", error: "Not enough council members responded. Please try again." });
            controller.close();
            return;
          }

          sendEvent({
            type: "stage", stage: 1, status: "complete",
            data: stage1Data.map(d => ({ model: d.model, response: d.response })),
          });

          // ═══ STAGE 2: Cross-ranking ═══
          sendEvent({ type: "stage", stage: 2, status: "start" });

          const labels = ["A", "B", "C"];
          const anonymized = stage1Data.map((d, i) => `## Response ${labels[i]}\n${d.response}`).join("\n\n---\n\n");

          const rankingPrompt = `You are evaluating fashion advice responses. Here are anonymized responses to the same question:\n\n${anonymized}\n\nRank each response on quality, specificity, and personalization.`;

          const rankingTools = [{
            type: "function",
            function: {
              name: "submit_rankings",
              description: "Submit rankings for each response",
              parameters: {
                type: "object",
                properties: {
                  rankings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        response: { type: "string", enum: labels.slice(0, stage1Data.length) },
                        score: { type: "number", description: "Score from 1-10" },
                        reason: { type: "string", description: "Brief reason for this score" },
                      },
                      required: ["response", "score", "reason"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["rankings"],
                additionalProperties: false,
              },
            },
          }];

          const stage2Results = await Promise.allSettled(
            COUNCIL_MODELS.slice(0, stage1Data.length).map(async (m) => {
              const resp = await callModel(
                LOVABLE_API_KEY,
                m.id,
                [{ role: "system", content: "You are a fashion advice quality evaluator." }, { role: "user", content: rankingPrompt }],
                false,
                rankingTools,
                { type: "function", function: { name: "submit_rankings" } },
              );
              const raw = await extractContent(resp);
              try {
                return JSON.parse(raw);
              } catch {
                // If tool calling failed, try to extract JSON from text
                const match = raw.match(/\{[\s\S]*\}/);
                if (match) return JSON.parse(match[0]);
                return { rankings: [] };
              }
            })
          );

          // Aggregate scores
          const scoreMap: Record<string, { total: number; count: number; reasons: string[] }> = {};
          labels.slice(0, stage1Data.length).forEach(l => { scoreMap[l] = { total: 0, count: 0, reasons: [] }; });

          stage2Results.forEach(r => {
            if (r.status === "fulfilled" && r.value?.rankings) {
              r.value.rankings.forEach((rank: any) => {
                if (scoreMap[rank.response]) {
                  scoreMap[rank.response].total += Number(rank.score) || 0;
                  scoreMap[rank.response].count += 1;
                  if (rank.reason) scoreMap[rank.response].reasons.push(rank.reason);
                }
              });
            }
          });

          const rankings = Object.entries(scoreMap).map(([label, data]) => ({
            label,
            model: stage1Data[labels.indexOf(label)]?.model || label,
            avgScore: data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
            reasons: data.reasons.slice(0, 2),
          })).sort((a, b) => b.avgScore - a.avgScore);

          sendEvent({
            type: "stage", stage: 2, status: "complete",
            data: rankings,
          });

          // ═══ STAGE 3: Chairman synthesis (streamed) ═══
          sendEvent({ type: "stage", stage: 3, status: "start" });

          const rankedResponses = rankings.map((r, i) => {
            const idx = labels.indexOf(r.label);
            return `### #${i + 1} (Score: ${r.avgScore}/10) — Response ${r.label}\n${stage1Data[idx]?.response || ""}`;
          }).join("\n\n---\n\n");

          const synthesisPrompt = `You are LEXOR®'s Chairman Synthesizer. Multiple AI stylists have answered the user's question and been ranked by quality. Synthesize the BEST final answer using the top-ranked insights.

Ranked responses (best first):
${rankedResponses}

Instructions:
- Combine the strongest insights from all responses
- Resolve any contradictions by favoring higher-ranked advice
- Maintain LEXOR®'s warm, confident voice
- Use markdown formatting
- Be specific and actionable
- Do NOT mention that multiple models were consulted`;

          const synthResp = await callModel(
            LOVABLE_API_KEY,
            CHAIRMAN_MODEL,
            [...allMessages, { role: "user", content: synthesisPrompt }],
            true,
          );

          if (!synthResp.ok) {
            sendEvent({ type: "error", error: "Chairman synthesis failed. Showing top-ranked response instead." });
            // Fallback: send the top-ranked response as synthesis
            const topIdx = labels.indexOf(rankings[0]?.label);
            sendEvent({ type: "synthesis_fallback", content: stage1Data[topIdx]?.response || "" });
            sendEvent({ type: "stage", stage: 3, status: "complete" });
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }

          // Stream the chairman's response
          const reader = synthResp.body!.getReader();
          const decoder = new TextDecoder();
          let textBuffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            textBuffer += decoder.decode(value, { stream: true });

            let newlineIndex: number;
            while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
              let line = textBuffer.slice(0, newlineIndex);
              textBuffer = textBuffer.slice(newlineIndex + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (line.startsWith(":") || line.trim() === "") continue;
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  sendEvent({ type: "synthesis_delta", content });
                }
              } catch {
                textBuffer = line + "\n" + textBuffer;
                break;
              }
            }
          }

          // Flush remaining
          if (textBuffer.trim()) {
            for (let raw of textBuffer.split("\n")) {
              if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
              const jsonStr = raw.slice(6).trim();
              if (jsonStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) sendEvent({ type: "synthesis_delta", content });
              } catch {}
            }
          }

          sendEvent({ type: "stage", stage: 3, status: "complete" });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (e) {
          console.error("Council error:", e);
          sendEvent({ type: "error", error: e instanceof Error ? e.message : "Council deliberation failed" });
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("council-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
