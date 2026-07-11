import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const mimoApiKey = Deno.env.get("MIMO_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { ticket_id, action, user_message, error_context } = await req.json();

    // ─── DIAGNOSE: MiMo Vision analyzes the error ─────────────
    if (action === "diagnose") {
      const diagnosisPrompt = `You are LEXOR®'s AI support engineer. A user encountered this error:

Error: ${error_context?.message || "Unknown error"}
Page: ${error_context?.page || "Unknown"}
Feature: ${error_context?.feature || "Unknown"}
Browser: ${error_context?.browser || "Unknown"}
Timestamp: ${error_context?.timestamp || new Date().toISOString()}

The LEXOR® app is a luxury AI fashion platform. Common issues include:
- Auth/login failures (Supabase Auth)
- Payment/subscription issues (PayPal)
- AI analysis failures (MiMo Vision API)
- Image upload failures (Supabase Storage)
- Weather API failures
- Domain/DNS issues (Vercel)

Provide a JSON response with:
{
  "diagnosis": "What went wrong (1-2 sentences)",
  "root_cause": "The technical root cause",
  "category": "auth|payment|ai|wardrobe|weather|dns|ui|other",
  "severity": "low|medium|high|critical",
  "fix_suggestion": "Step-by-step fix the user can try",
  "confidence": 0.0-1.0,
  "auto_fixable": true/false,
  "internal_notes": "Notes for the support team"
}`;

      const mimoResponse = await fetch("https://api.mimo.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mimoApiKey}`,
        },
        body: JSON.stringify({
          model: "mimo-vision-2.5v",
          messages: [{ role: "user", content: diagnosisPrompt }],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      const mimoData = await mimoResponse.json();
      const aiContent = mimoData.choices?.[0]?.message?.content || "";

      // Parse the AI response
      let diagnosis;
      try {
        diagnosis = JSON.parse(aiContent);
      } catch {
        diagnosis = {
          diagnosis: aiContent.slice(0, 500),
          root_cause: "AI could not parse structured response",
          category: "other",
          severity: "medium",
          fix_suggestion: "Please try refreshing the page or contact support.",
          confidence: 0.3,
          auto_fixable: false,
          internal_notes: aiContent,
        };
      }

      // Update the ticket with diagnosis
      if (ticket_id) {
        await supabase
          .from("support_tickets")
          .update({
            ai_diagnosis: diagnosis,
            ai_fix_suggestion: diagnosis.fix_suggestion,
            ai_confidence: diagnosis.confidence,
            category: diagnosis.category,
            severity: diagnosis.severity,
            status: diagnosis.auto_fixable ? "in_progress" : "open",
          })
          .eq("id", ticket_id);

        // Add AI message to conversation
        await supabase.from("support_messages").insert({
          ticket_id,
          sender: "ai",
          message: `**Diagnosis:** ${diagnosis.diagnosis}\n\n**Root Cause:** ${diagnosis.root_cause}\n\n**Suggested Fix:** ${diagnosis.fix_suggestion}`,
          metadata: { diagnosis },
        });
      }

      return new Response(JSON.stringify({ diagnosis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── CHAT: User asks follow-up questions ───────────────────
    if (action === "chat") {
      // Get conversation history
      const { data: messages } = await supabase
        .from("support_messages")
        .select("sender, message")
        .eq("ticket_id", ticket_id)
        .order("created_at", { ascending: true })
        .limit(20);

      const conversationHistory = (messages || []).map((m: any) => ({
        role: m.sender === "ai" ? "assistant" : "user",
        content: m.message,
      }));

      conversationHistory.push({ role: "user", content: user_message });

      const chatPrompt = `You are LEXOR®'s AI support assistant. You help users with their fashion app issues. Be concise, helpful, and professional. If you can fix the issue automatically, do so. If not, guide the user through the fix.

Current conversation:
${conversationHistory.map((m: any) => `${m.role}: ${m.content}`).join("\n")}

Respond with a helpful message. If the issue is resolved, say so clearly.`;

      const mimoResponse = await fetch("https://api.mimo.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mimoApiKey}`,
        },
        body: JSON.stringify({
          model: "mimo-vision-2.5v",
          messages: [{ role: "user", content: chatPrompt }],
          temperature: 0.5,
          max_tokens: 800,
        }),
      });

      const mimoData = await mimoResponse.json();
      const aiReply = mimoData.choices?.[0]?.message?.content || "I'm having trouble understanding. Could you rephrase that?";

      // Save AI reply
      await supabase.from("support_messages").insert({
        ticket_id,
        sender: "ai",
        message: aiReply,
      });

      // Check if issue is resolved
      if (aiReply.toLowerCase().includes("resolved") || aiReply.toLowerCase().includes("fixed")) {
        await supabase
          .from("support_tickets")
          .update({ status: "resolved", resolved_at: new Date().toISOString() })
          .eq("id", ticket_id);
      }

      return new Response(JSON.stringify({ reply: aiReply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Support AI error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
