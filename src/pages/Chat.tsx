import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Send, Sparkles, Loader2, Trash2, ArrowUp, Camera, Image, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { VoiceInput } from "@/components/app/VoiceInput";
import { useAnimatedText } from "@/components/ui/animated-text";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { MoodSelector } from "@/components/app/MoodSelector";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  isStreaming?: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const quickPrompts = [
  { emoji: "👔", label: "What should I wear today?" },
  { emoji: "🌙", label: "Outfit for a dinner date" },
  { emoji: "💼", label: "Smart casual for work" },
  { emoji: "🎉", label: "Party outfit ideas" },
  { emoji: "📸", label: "Check if this item matches me" },
  { emoji: "🛍️", label: "What's missing in my closet?" },
];

const vanishPlaceholders = [
  "What should I wear today?",
  "Outfit for a dinner date",
  "Smart casual for work",
  "Party outfit ideas",
  "What's missing in my closet?",
  "Style tips for my body type",
];

// Animated assistant message component
function AnimatedAssistantMessage({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const animatedContent = useAnimatedText(content, " ");
  const displayContent = isStreaming ? content : animatedContent;
  
  return (
    <div className="prose prose-sm prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm">
      <ReactMarkdown>{displayContent}</ReactMarkdown>
    </div>
  );
}

const Chat = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [styleProfile, setStyleProfile] = useState<any>(null);
  const [closetSummary, setClosetSummary] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 24,
    maxHeight: 96,
  });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("style_profiles").select("archetype, preferences").eq("user_id", user.id).single(),
      supabase.from("clothing_items").select("name, category, color, style").eq("user_id", user.id),
    ]).then(([chatRes, styleRes, closetRes]) => {
      if (chatRes.data) setMessages(chatRes.data.map((m) => ({ id: m.id, role: m.role as "user" | "assistant", content: m.content })));
      if (styleRes.data) setStyleProfile(styleRes.data);
      if (closetRes.data) setClosetSummary(closetRes.data.map((i) => `${i.name || "Unnamed"} (${i.category}, ${i.color || ""})`).join("; "));
    });
  }, [user]);

  // Handle pre-filled context from navigation (e.g., from Inspiration page)
  useEffect(() => {
    const prefill = searchParams.get("prefill");
    if (prefill) {
      setInput(prefill);
    }
  }, [searchParams]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessage = async (role: string, content: string) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, role, content });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result as string);
      if (!input.trim()) {
        setInput("Check if this item matches my style DNA");
      }
    };
    reader.readAsDataURL(file);
  };

  const send = async (overrideInput?: string) => {
    const text = overrideInput || input.trim();
    if (!text || isLoading || !user) return;
    const userMsg: Message = { role: "user", content: text, imagePreview: pendingImage || undefined };
    const imageToSend = pendingImage;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPendingImage(null);
    setIsLoading(true);
    adjustHeight(true);
    saveMessage("user", imageToSend ? `[Image attached] ${userMsg.content}` : userMsg.content);

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          userId: user.id,
          styleProfile,
          closetSummary,
          ...(imageToSend ? { image: imageToSend } : {}),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 429) { toast.error("Rate limited. Please wait a moment."); throw new Error("rate limited"); }
        if (resp.status === 402) { toast.error("AI credits exhausted. Please add credits."); throw new Error("credits exhausted"); }
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
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar, isStreaming: true } : m));
                }
                return [...prev, { role: "assistant", content: assistantSoFar, isStreaming: true }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

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
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar, isStreaming: false } : m));
            }
            return [...prev, { role: "assistant", content: assistantSoFar, isStreaming: false }];
          });
        }
      }

      // Mark streaming as done
      setMessages((prev) =>
        prev.map((m, i) => (i === prev.length - 1 && m.role === "assistant" ? { ...m, isStreaming: false } : m))
      );

      saveMessage("assistant", assistantSoFar);
    } catch (e: any) {
      if (e.message !== "rate limited" && e.message !== "credits exhausted") {
        toast.error(e.message || "Failed to get response");
      }
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-56px)] max-w-lg mx-auto overflow-x-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h1 className="font-sans font-semibold text-foreground text-sm">AI Stylist</h1>
              <p className="text-muted-foreground font-sans text-[10px]">Your personal fashion advisor</p>
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={clearHistory} className="text-muted-foreground hover:text-destructive transition-colors p-1.5">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-3">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-8 pb-4"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-1.5">Hi! I'm your AI Stylist</h2>
                <p className="text-muted-foreground font-sans text-xs max-w-xs mx-auto leading-relaxed">
                  I know your closet, your style DNA, and the latest trends. Ask me anything about fashion!
                </p>
              </div>

              {/* Vanish Input for empty state */}
              <div className="mb-6">
                <PlaceholdersAndVanishInput
                  placeholders={vanishPlaceholders}
                  onChange={() => {}}
                  onSubmit={(e) => {
                    const form = e.currentTarget;
                    const input = form.querySelector("input");
                    if (input?.value) {
                      send(input.value);
                    }
                  }}
                />
              </div>

              {/* Quick Prompts Grid */}
              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => {
                      if (prompt.emoji === "📸") {
                        fileInputRef.current?.click();
                      } else {
                        send(prompt.label);
                      }
                    }}
                    className="rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40 transition-colors group"
                  >
                    <span className="text-lg mb-1 block">{prompt.emoji}</span>
                    <span className="font-sans text-xs text-foreground group-hover:text-primary transition-colors leading-tight">
                      {prompt.label}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 font-sans text-sm relative overflow-hidden transition-shadow duration-500 ease-out ${
                    msg.role === "user"
                      ? "bg-foreground text-background rounded-br-md"
                      : "bg-card border border-border rounded-bl-md hover:shadow-[0_0_15px_-3px_hsl(var(--gold)/0.35),0_0_6px_-2px_hsl(var(--gold)/0.2)] hover:border-[hsl(var(--gold)/0.4)]"
                  }`}
                >
                  {/* Gold shimmer overlay for assistant messages */}
                  {msg.role === "assistant" && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0.6 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "linear-gradient(105deg, transparent 40%, hsl(var(--gold-light) / 0.12) 45%, hsl(var(--gold) / 0.18) 50%, hsl(var(--gold-light) / 0.12) 55%, transparent 60%)",
                          backgroundSize: "200% 100%",
                          animation: "gold-shimmer-sweep 1.8s ease-out forwards",
                        }}
                      />
                    </motion.div>
                  )}
                  {msg.imagePreview && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                      <img src={msg.imagePreview} alt="Uploaded item" className="w-full max-h-48 object-cover rounded-lg" />
                    </div>
                  )}
                  {msg.role === "assistant" ? (
                    <AnimatedAssistantMessage content={msg.content} isStreaming={msg.isStreaming} />
                  ) : (
                    <p className="leading-relaxed">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <motion.span
                  className="text-xs text-muted-foreground font-sans"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Styling your answer...
                </motion.span>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Pending Image Preview */}
        {pendingImage && (
          <div className="px-4 pt-2">
            <div className="relative inline-block">
              <img src={pendingImage} alt="To upload" className="h-20 w-20 object-cover rounded-xl border border-border" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-3 py-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
              title="Upload image for compatibility check"
            >
              <Camera className="w-4 h-4" />
            </button>
            <VoiceInput
              onTranscript={(text) => {
                setInput((prev) => (prev ? prev + " " + text : text));
              }}
              disabled={isLoading}
            />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask your stylist..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none font-sans text-sm text-foreground placeholder:text-muted-foreground min-h-[24px] max-h-24 py-0.5"
            />
            <button
              onClick={() => send()}
              disabled={isLoading || (!input.trim() && !pendingImage)}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                (input.trim() || pendingImage) && !isLoading
                  ? "bg-foreground text-background"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {isLoading ? (
                <div
                  className="w-3.5 h-3.5 bg-primary rounded-sm animate-spin"
                  style={{ animationDuration: "3s" }}
                />
              ) : (
                <ArrowUp className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
