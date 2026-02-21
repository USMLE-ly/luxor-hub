import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Sparkles, Loader2, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const Chat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [styleProfile, setStyleProfile] = useState<any>(null);
  const [closetSummary, setClosetSummary] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    // Load chat history, style profile, and closet summary in parallel
    Promise.all([
      supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("style_profiles").select("archetype, preferences").eq("user_id", user.id).single(),
      supabase.from("clothing_items").select("name, category, color, style").eq("user_id", user.id),
    ]).then(([chatRes, styleRes, closetRes]) => {
      if (chatRes.data) {
        setMessages(chatRes.data.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })));
      }
      if (styleRes.data) setStyleProfile(styleRes.data);
      if (closetRes.data) {
        setClosetSummary(closetRes.data.map((i) => `${i.name || "Unnamed"} (${i.category}, ${i.color || ""})`).join("; "));
      }
    });
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = async (role: string, content: string) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, role, content });
  };

  const send = async () => {
    if (!input.trim() || isLoading || !user) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    saveMessage("user", userMsg.content);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, userId: user.id, styleProfile, closetSummary }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Failed to get response");
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
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
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && !last.id) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
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
            if (content) assistantSoFar += content;
          } catch {}
        }
        if (assistantSoFar) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && !last.id) {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
            }
            return [...prev, { role: "assistant", content: assistantSoFar }];
          });
        }
      }

      saveMessage("assistant", assistantSoFar);
    } catch (e: any) {
      toast.error(e.message || "Failed to get response");
      setMessages((prev) => prev.filter((m) => m !== userMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from("chat_messages").delete().eq("user_id", user.id);
    setMessages([]);
    toast.success("Chat history cleared");
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh)] max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-6 pb-3 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> AI Stylist
            </h1>
            <p className="text-muted-foreground font-sans text-sm">Your personal fashion advisor</p>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-xl text-foreground mb-2">Ask me anything about style</h3>
              <p className="text-muted-foreground font-sans text-sm mb-6 max-w-md mx-auto">
                I know your closet, your style DNA, and the latest trends. Try asking me what to wear!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["What should I wear today?", "Dress me for a dinner date", "Help me build a capsule wardrobe"].map((q) => (
                  <button
                    key={q}
                    onClick={() => { setInput(q); }}
                    className="px-4 py-2 rounded-full text-xs font-sans bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 font-sans text-sm ${
                msg.role === "user"
                  ? "gold-gradient text-primary-foreground"
                  : "glass"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="glass rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-glass-border">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your AI stylist..."
              className="bg-secondary border-glass-border resize-none min-h-[44px] max-h-32 font-sans"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
            />
            <Button onClick={send} disabled={isLoading || !input.trim()} className="gold-gradient text-primary-foreground shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
