import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Trash2, ArrowUp, Camera, X, Sparkles, ChevronDown, ChevronUp, Brain, CalendarPlus, Heart, Share2, Shirt } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { VoiceInput } from "@/components/app/VoiceInput";
import { MoodSelector } from "@/components/app/MoodSelector";
import { CouncilStageProgress } from "@/components/app/CouncilStageProgress";
import { CouncilResponseCard } from "@/components/app/CouncilResponseCard";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { format } from "date-fns";

const COUNCIL_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/council-chat`;

interface Stage1Response {
  model: string;
  response: string;
}

interface Ranking {
  label: string;
  model: string;
  avgScore: number;
  reasons: string[];
}

interface CouncilMessage {
  role: "user" | "assistant";
  content: string;
  imagePreview?: string;
  stage1?: Stage1Response[];
  rankings?: Ranking[];
  synthesis?: string;
  mentionedItems?: { name: string; photo_url?: string; category?: string }[];
  actionSuggestions?: string[];
}

const quickPrompts = [
  { emoji: "🔬", label: "Deep style audit for my wardrobe" },
  { emoji: "🗺️", label: "Full wardrobe gap analysis" },
  { emoji: "🎯", label: "Complete outfit strategy for a wedding" },
  { emoji: "🌍", label: "Capsule wardrobe for a 2-week trip" },
];

const vanishPlaceholders = [
  "Deep style audit for my wardrobe...",
  "Full wardrobe gap analysis...",
  "Complete outfit strategy for an event...",
  "Build me a capsule wardrobe...",
];

const Council = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<CouncilMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [styleProfile, setStyleProfile] = useState<any>(null);
  const [closetSummary, setClosetSummary] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [stageStatus, setStageStatus] = useState<"idle" | "start" | "complete">("idle");
  const [liveStage1, setLiveStage1] = useState<Stage1Response[]>([]);
  const [liveRankings, setLiveRankings] = useState<Ranking[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 24, maxHeight: 96 });

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("style_profiles").select("archetype, preferences").eq("user_id", user.id).single(),
      supabase.from("clothing_items").select("name, category, color, style").eq("user_id", user.id),
    ]).then(([styleRes, closetRes]) => {
      if (styleRes.data) setStyleProfile(styleRes.data);
      if (closetRes.data) setClosetSummary(closetRes.data.map(i => `${i.name || "Unnamed"} (${i.category}, ${i.color || ""})`).join("; "));
    });
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStage, liveStage1, liveRankings]);

  // Save conversation to database
  const saveConversation = async (msgs: CouncilMessage[], title?: string) => {
    if (!user) return;
    const serializable = msgs.map(m => ({
      role: m.role,
      content: m.content,
      stage1: m.stage1 || null,
      rankings: m.rankings || null,
      synthesis: m.synthesis || null,
    }));

    const autoTitle = title || msgs.find(m => m.role === "user")?.content?.slice(0, 60) || "New Council Session";

    if (conversationId) {
      await supabase
        .from("council_conversations")
        .update({ messages: serializable as any, title: autoTitle })
        .eq("id", conversationId);
    } else {
      const { data } = await supabase
        .from("council_conversations")
        .insert({ user_id: user.id, messages: serializable as any, title: autoTitle })
        .select("id")
        .single();
      if (data) setConversationId(data.id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result as string);
      if (!input.trim()) setInput("Analyze this item with the full council");
    };
    reader.readAsDataURL(file);
  };

  const send = async (overrideInput?: string) => {
    const text = overrideInput || input.trim();
    if (!text || isLoading || !user) return;

    const userMsg: CouncilMessage = { role: "user", content: text, imagePreview: pendingImage || undefined };
    const imageToSend = pendingImage;
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setPendingImage(null);
    setIsLoading(true);
    adjustHeight(true);
    setCurrentStage(0);
    setStageStatus("idle");
    setLiveStage1([]);
    setLiveRankings([]);

    const allMessages = [...messages, userMsg]
      .filter(m => m.role === "user" || m.synthesis)
      .map(m => ({ role: m.role, content: m.role === "assistant" ? (m.synthesis || m.content) : m.content }));

    let synthesis = "";
    let stage1Data: Stage1Response[] = [];
    let rankingsData: Ranking[] = [];

    try {
      const resp = await fetch(COUNCIL_URL, {
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
          mood: currentMood || undefined,
          ...(imageToSend ? { image: imageToSend } : {}),
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 429) { toast.error("Rate limited. Please wait."); throw new Error("rate limited"); }
        if (resp.status === 402) { toast.error("AI credits exhausted."); throw new Error("credits exhausted"); }
        throw new Error(err.error || "Failed");
      }

      const reader = resp.body!.getReader();
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
            const event = JSON.parse(jsonStr);

            if (event.type === "stage") {
              setCurrentStage(event.stage);
              setStageStatus(event.status);
              if (event.stage === 1 && event.status === "complete" && event.data) {
                stage1Data = event.data;
                setLiveStage1(event.data);
              }
              if (event.stage === 2 && event.status === "complete" && event.data) {
                rankingsData = event.data;
                setLiveRankings(event.data);
              }
            }

            if (event.type === "synthesis_delta") {
              synthesis += event.content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, synthesis, content: synthesis } : m);
                }
                return [...prev, { role: "assistant", content: synthesis, synthesis, stage1: stage1Data, rankings: rankingsData }];
              });
            }

            if (event.type === "synthesis_fallback") {
              synthesis = event.content;
              setMessages(prev => [...prev, { role: "assistant", content: synthesis, synthesis, stage1: stage1Data, rankings: rankingsData }]);
            }

            if (event.type === "error") {
              toast.error(event.error);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final message update with all council data
      let finalMessages: CouncilMessage[] = [];
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          finalMessages = prev.map((m, i) => i === prev.length - 1 ? { ...m, stage1: stage1Data, rankings: rankingsData, synthesis } : m);
        } else if (synthesis) {
          finalMessages = [...prev, { role: "assistant", content: synthesis, synthesis, stage1: stage1Data, rankings: rankingsData }];
        } else {
          finalMessages = prev;
        }
        return finalMessages;
      });

      // Save to database
      if (synthesis) {
        // Use a timeout to ensure state is updated
        setTimeout(() => {
          setMessages(current => {
            saveConversation(current);
            return current;
          });
        }, 100);
      }
    } catch (e: any) {
      if (e.message !== "rate limited" && e.message !== "credits exhausted") {
        toast.error(e.message || "Council deliberation failed");
      }
    } finally {
      setIsLoading(false);
      setCurrentStage(0);
      setStageStatus("idle");
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setConversationId(null);
    toast.success("Council history cleared");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-56px)] max-w-lg mx-auto overflow-x-hidden">
        {/* Header with mode toggle */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h1 className="font-sans font-semibold text-foreground text-sm">Style Council</h1>
              <p className="text-muted-foreground font-sans text-[10px]">3 AI stylists deliberate for you</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Mode toggle back to Quick Chat */}
            <button
              onClick={() => navigate("/chat")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
              title="Switch to Quick Chat"
            >
              <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[10px] font-sans font-medium text-muted-foreground">Quick</span>
            </button>
            {messages.length > 0 && (
              <button onClick={clearHistory} className="text-muted-foreground hover:text-destructive transition-colors p-1.5">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-3">
          {messages.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-8 pb-4">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-1.5">The Style Council</h2>
                <p className="text-muted-foreground font-sans text-xs max-w-xs mx-auto leading-relaxed">
                  Three AI stylists with different perspectives will deliberate, rank each other, and synthesize the ultimate answer.
                </p>
              </div>

              <div className="mb-6">
                <PlaceholdersAndVanishInput
                  placeholders={vanishPlaceholders}
                  onChange={() => {}}
                  onSubmit={(e) => {
                    const form = e.currentTarget;
                    const inp = form.querySelector("input");
                    if (inp?.value) send(inp.value);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {quickPrompts.map(prompt => (
                  <button
                    key={prompt.label}
                    onClick={() => send(prompt.label)}
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
                {msg.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl px-3.5 py-2.5 font-sans text-sm bg-foreground text-background rounded-br-md">
                    {msg.imagePreview && (
                      <div className="mb-2 rounded-lg overflow-hidden">
                        <img src={msg.imagePreview} alt="Uploaded" className="w-full max-h-48 object-cover rounded-lg" />
                      </div>
                    )}
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                ) : (
                  <div className="max-w-[95%] w-full space-y-2">
                    {msg.stage1?.length ? (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-sans text-muted-foreground font-medium uppercase tracking-wider">Council Responses</p>
                        {msg.stage1.map((s, j) => {
                          const ranking = msg.rankings?.find(r => r.model === s.model);
                          const rank = msg.rankings ? msg.rankings.findIndex(r => r.model === s.model) + 1 : undefined;
                          return (
                            <CouncilResponseCard key={j} model={s.model} response={s.response} ranking={ranking} rank={rank} />
                          );
                        })}
                      </div>
                    ) : null}

                    {msg.synthesis && (
                      <div className="rounded-2xl px-3.5 py-2.5 bg-card border-2 border-primary/30 rounded-bl-md relative overflow-hidden">
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
                        <p className="text-[10px] font-sans text-primary font-semibold uppercase tracking-wider mb-1.5">✨ Council Synthesis</p>
                        <div className="prose prose-sm prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 font-sans text-sm">
                          <ReactMarkdown>{msg.synthesis}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Live stage progress */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <CouncilStageProgress currentStage={currentStage} stageStatus={stageStatus} />

              {liveStage1.length > 0 && currentStage >= 2 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-sans text-muted-foreground font-medium uppercase tracking-wider">Council Responses</p>
                  {liveStage1.map((s, j) => {
                    const ranking = liveRankings.find(r => r.model === s.model);
                    const rank = liveRankings.length ? liveRankings.findIndex(r => r.model === s.model) + 1 : undefined;
                    return (
                      <CouncilResponseCard key={j} model={s.model} response={s.response} ranking={ranking} rank={rank} />
                    );
                  })}
                </div>
              )}

              {currentStage > 0 && (
                <div className="flex justify-start">
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay }}
                        />
                      ))}
                    </div>
                    <motion.span
                      className="text-xs text-muted-foreground font-sans"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {currentStage === 1 ? "Consulting the council..." : currentStage === 2 ? "Cross-ranking responses..." : "Synthesizing final answer..."}
                    </motion.span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Pending Image */}
        {pendingImage && (
          <div className="px-4 pt-2">
            <div className="relative inline-block">
              <img src={pendingImage} alt="To upload" className="h-20 w-20 object-cover rounded-xl border border-border" />
              <button onClick={() => setPendingImage(null)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Mood */}
        <div className="px-4">
          <MoodSelector selected={currentMood} onSelect={setCurrentMood} />
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-3 py-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-primary transition-colors">
              <Camera className="w-4 h-4" />
            </button>
            <VoiceInput onTranscript={(text) => setInput(prev => prev ? prev + " " + text : text)} disabled={isLoading} />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
              onKeyDown={handleKeyDown}
              placeholder="Ask the council..."
              rows={1}
              className="flex-1 bg-transparent border-none outline-none resize-none font-sans text-sm text-foreground placeholder:text-muted-foreground min-h-[24px] max-h-24 py-0.5"
            />
            <button
              onClick={() => send()}
              disabled={isLoading || (!input.trim() && !pendingImage)}
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                (input.trim() || pendingImage) && !isLoading ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"
              }`}
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 bg-primary rounded-sm animate-spin" style={{ animationDuration: "3s" }} />
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

export default Council;
