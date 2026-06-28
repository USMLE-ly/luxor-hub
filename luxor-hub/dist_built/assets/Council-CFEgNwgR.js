import { j as jsxRuntimeExports, r as reactExports, e as useNavigate } from "./index-CqA86RF3.js";
import { T as TierGate } from "./TierGate-BrdTI6rL.js";
import { A as AppLayout } from "./AppLayout-QSRtcW1a.js";
import { c as cn, e as useAuth, s as supabase, h as haptic } from "./AppContent-h4IlOpH8.js";
import { t as toast } from "./index-J9_vYcP0.js";
import { a as Markdown, u as useAutoResizeTextarea, P as PlaceholdersAndVanishInput, M as MoodSelector, V as VoiceInput } from "./MoodSelector-B5YgjY5l.js";
import { m as motion } from "./proxy-ShtysCL3.js";
import { C as ChevronDown } from "./chevron-down-Pq0_e0vr.js";
import { U as Users } from "./users-Ct3uOvsQ.js";
import { B as Brain } from "./brain-dsVkugIX.js";
import { S as Shirt } from "./shirt-Cl12YkbS.js";
import { S as Sparkles } from "./sparkles-DKAjMG4z.js";
import { T as Trash2 } from "./trash-2-SiDm1HtV.js";
import { A as AnimatePresence } from "./index-CwmenB4e.js";
import { X } from "./x-BJDvVtyz.js";
import { C as Camera } from "./camera-rs6e02bH.js";
import { A as ArrowUp } from "./arrow-up-DKCS5j2l.js";
import { H as Heart } from "./heart-DFe5gpV-.js";
import { C as CalendarPlus } from "./calendar-plus-DGqkWhLd.js";
import { S as Share2 } from "./share-2-CnYn2YRv.js";
import { j as format } from "./format-CHv4aOWu.js";
import "./usePlanTier-CvY4ap50.js";
import "./useQuery-0OzZNLy2.js";
import "./planRestrictions-__Vqe2nr.js";
import "./lock-81NW8mrd.js";
import "./arrow-right-B1HpFnXV.js";
import "./BottomNav-DTwSgLpq.js";
const stages = [
  { label: "Consulting", icon: "🧠" },
  { label: "Ranking", icon: "⚖️" },
  { label: "Synthesizing", icon: "✨" }
];
function CouncilStageProgress({ currentStage, stageStatus }) {
  if (currentStage === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center gap-1 py-3", children: stages.map((stage, i) => {
    const stageNum = i + 1;
    const isComplete = currentStage > stageNum || currentStage === stageNum && stageStatus === "complete";
    const isActive = currentStage === stageNum && stageStatus === "start";
    const isPending = currentStage < stageNum;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            className: cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-colors",
              isComplete && "border-primary bg-primary/20",
              isActive && "border-primary bg-primary/10",
              isPending && "border-border bg-card"
            ),
            animate: isActive ? { scale: [1, 1.1, 1] } : {},
            transition: isActive ? { duration: 1.5, repeat: Infinity } : {},
            children: isComplete ? "✓" : stage.icon
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "text-[9px] font-sans font-medium",
              isComplete && "text-primary",
              isActive && "text-primary",
              isPending && "text-muted-foreground"
            ),
            children: stage.label
          }
        )
      ] }),
      i < stages.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: cn(
            "w-8 h-0.5 rounded-full mb-4 transition-colors",
            currentStage > stageNum + 1 || currentStage === stageNum + 1 ? "bg-primary/50" : "bg-border"
          )
        }
      )
    ] }, stage.label);
  }) });
}
function CouncilResponseCard({ model, response, ranking, rank }) {
  var _a;
  const [expanded, setExpanded] = reactExports.useState(false);
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      className: cn(
        "border rounded-xl overflow-hidden transition-colors",
        rank === 1 ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setExpanded(!expanded),
            className: "w-full flex items-center justify-between px-3 py-2.5 text-left",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                medal && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: medal }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-sans font-semibold text-foreground", children: model }),
                ranking && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-sans px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium", children: [
                  ranking.avgScore,
                  "/10"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ChevronDown,
                {
                  className: cn(
                    "w-3.5 h-3.5 text-muted-foreground transition-transform",
                    expanded && "rotate-180"
                  )
                }
              )
            ]
          }
        ),
        expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { height: 0, opacity: 0 },
            animate: { height: "auto", opacity: 1 },
            className: "px-3 pb-3 border-t border-border",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 prose prose-sm prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 text-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: response }) }),
              ((_a = ranking == null ? void 0 : ranking.reasons) == null ? void 0 : _a.length) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 pt-2 border-t border-border/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans font-medium mb-1", children: "Ranking Reasons:" }),
                ranking.reasons.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground font-sans italic", children: [
                  "• ",
                  r
                ] }, i))
              ] }) : null
            ]
          }
        )
      ]
    }
  );
}
const COUNCIL_URL = `${"https://uakkwvdjoqsceewhsfjb.supabase.co"}/functions/v1/council-chat`;
const quickPrompts = [
  { emoji: "🔬", label: "Deep style audit for my wardrobe" },
  { emoji: "🗺️", label: "Full wardrobe gap analysis" },
  { emoji: "🎯", label: "Complete outfit strategy for a wedding" },
  { emoji: "🌍", label: "Capsule wardrobe for a 2-week trip" }
];
const vanishPlaceholders = [
  "Deep style audit for my wardrobe...",
  "Full wardrobe gap analysis...",
  "Complete outfit strategy for an event...",
  "Build me a capsule wardrobe..."
];
const Council = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(TierGate, { requiredTier: "elite", featureName: "Personal Style Concierge", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CouncilInner, {}) });
};
const CouncilInner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = reactExports.useState([]);
  const [conversationId, setConversationId] = reactExports.useState(null);
  const [input, setInput] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [styleProfile, setStyleProfile] = reactExports.useState(null);
  const [closetSummary, setClosetSummary] = reactExports.useState("");
  const [closetItems, setClosetItems] = reactExports.useState([]);
  const [pendingImage, setPendingImage] = reactExports.useState(null);
  const [currentMood, setCurrentMood] = reactExports.useState(null);
  const [currentStage, setCurrentStage] = reactExports.useState(0);
  const [stageStatus, setStageStatus] = reactExports.useState("idle");
  const [liveStage1, setLiveStage1] = reactExports.useState([]);
  const [liveRankings, setLiveRankings] = reactExports.useState([]);
  const [showWardrobePanel, setShowWardrobePanel] = reactExports.useState(false);
  const [memoryCount, setMemoryCount] = reactExports.useState(0);
  const bottomRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 24, maxHeight: 96 });
  reactExports.useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("style_profiles").select("archetype, preferences").eq("user_id", user.id).single(),
      supabase.from("clothing_items").select("id, name, category, color, style, photo_url").eq("user_id", user.id),
      supabase.from("outfit_analyses").select("id").eq("user_id", user.id)
    ]).then(([styleRes, closetRes, analysesRes]) => {
      if (styleRes.data) setStyleProfile(styleRes.data);
      if (closetRes.data) {
        setClosetItems(closetRes.data);
        setClosetSummary(closetRes.data.map((i) => `${i.name || "Unnamed"} (${i.category}, ${i.color || ""})`).join("; "));
      }
      if (analysesRes.data) setMemoryCount(analysesRes.data.length);
    });
  }, [user]);
  reactExports.useEffect(() => {
    var _a;
    (_a = bottomRef.current) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentStage, liveStage1, liveRankings]);
  const saveConversation = async (msgs, title) => {
    var _a, _b;
    if (!user) return;
    const serializable = msgs.map((m) => ({
      role: m.role,
      content: m.content,
      stage1: m.stage1 || null,
      rankings: m.rankings || null,
      synthesis: m.synthesis || null
    }));
    const autoTitle = ((_b = (_a = msgs.find((m) => m.role === "user")) == null ? void 0 : _a.content) == null ? void 0 : _b.slice(0, 60)) || "New Council Session";
    if (conversationId) {
      await supabase.from("council_conversations").update({ messages: serializable, title: autoTitle }).eq("id", conversationId);
    } else {
      const { data } = await supabase.from("council_conversations").insert({ user_id: user.id, messages: serializable, title: autoTitle }).select("id").single();
      if (data) setConversationId(data.id);
    }
  };
  const handleImageUpload = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result);
      if (!input.trim()) setInput("Analyze this item with the full council");
    };
    reader.readAsDataURL(file);
  };
  const send = async (overrideInput) => {
    const text = overrideInput || input.trim();
    if (!text || isLoading || !user) return;
    const userMsg = { role: "user", content: text, imagePreview: pendingImage || void 0 };
    const imageToSend = pendingImage;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPendingImage(null);
    setIsLoading(true);
    adjustHeight(true);
    setCurrentStage(0);
    setStageStatus("idle");
    setLiveStage1([]);
    setLiveRankings([]);
    const allMessages = [...messages, userMsg].filter((m) => m.role === "user" || m.synthesis).map((m) => ({ role: m.role, content: m.role === "assistant" ? m.synthesis || m.content : m.content }));
    let synthesis = "";
    let stage1Data = [];
    let rankingsData = [];
    try {
      const resp = await fetch(COUNCIL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVha2t3dmRqb3FzY2Vld2hzZmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NjE2ODEsImV4cCI6MjA4NzIzNzY4MX0.2bqKl0gFyNESBduLwg6GNYbFIMwF5XjDw_9xlWd1Nfo"}`
        },
        body: JSON.stringify({
          messages: allMessages,
          userId: user.id,
          styleProfile,
          closetSummary,
          mood: currentMood || void 0,
          ...imageToSend ? { image: imageToSend } : {}
        })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        if (resp.status === 429) {
          toast.error("Rate limited. Please wait.");
          throw new Error("rate limited");
        }
        if (resp.status === 402) {
          toast.error("AI credits exhausted.");
          throw new Error("credits exhausted");
        }
        throw new Error(err.error || "Failed");
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex;
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
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if ((last == null ? void 0 : last.role) === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, synthesis, content: synthesis } : m);
                }
                return [...prev, { role: "assistant", content: synthesis, synthesis, stage1: stage1Data, rankings: rankingsData }];
              });
            }
            if (event.type === "synthesis_fallback") {
              synthesis = event.content;
              setMessages((prev) => [...prev, { role: "assistant", content: synthesis, synthesis, stage1: stage1Data, rankings: rankingsData }]);
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
      const matchItems = (text2) => {
        return closetItems.filter((ci) => {
          const name = (ci.name || "").toLowerCase();
          return name.length > 2 && text2.toLowerCase().includes(name);
        }).slice(0, 6).map((ci) => ({ name: ci.name, photo_url: ci.photo_url, category: ci.category }));
      };
      let finalMessages = [];
      setMessages((prev) => {
        const mentioned = matchItems(synthesis);
        const last = prev[prev.length - 1];
        if ((last == null ? void 0 : last.role) === "assistant") {
          finalMessages = prev.map((m, i) => i === prev.length - 1 ? { ...m, stage1: stage1Data, rankings: rankingsData, synthesis, mentionedItems: mentioned, actionSuggestions: ["Save as Outfit", "Add to Calendar", "Share"] } : m);
        } else if (synthesis) {
          finalMessages = [...prev, { role: "assistant", content: synthesis, synthesis, stage1: stage1Data, rankings: rankingsData, mentionedItems: mentioned, actionSuggestions: ["Save as Outfit", "Add to Calendar", "Share"] }];
        } else {
          finalMessages = prev;
        }
        return finalMessages;
      });
      if (synthesis) {
        setTimeout(() => {
          setMessages((current) => {
            saveConversation(current);
            return current;
          });
        }, 100);
      }
    } catch (e) {
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
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };
  const moodTint = reactExports.useMemo(() => {
    const tints = {
      confident: "hsl(40 80% 55% / 0.06)",
      relaxed: "hsl(200 60% 55% / 0.06)",
      bold: "hsl(350 70% 55% / 0.06)",
      elegant: "hsl(270 50% 55% / 0.06)",
      creative: "hsl(160 60% 50% / 0.06)",
      cozy: "hsl(30 70% 55% / 0.06)"
    };
    return currentMood ? tints[currentMood] || "transparent" : "transparent";
  }, [currentMood]);
  const handleQuickAction = async (action, msg) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!user) return;
    if (action === "Save as Outfit") {
      msg.mentionedItems || [];
      const { error } = await supabase.from("outfits").insert({
        user_id: user.id,
        name: `Council: ${((_b = (_a = messages.find((m) => m.role === "user")) == null ? void 0 : _a.content) == null ? void 0 : _b.slice(0, 40)) || "Suggestion"}`,
        description: ((_c = msg.synthesis) == null ? void 0 : _c.slice(0, 100)) || "",
        ai_generated: true,
        ai_explanation: (_d = msg.synthesis) == null ? void 0 : _d.slice(0, 300)
      });
      if (error) toast.error("Failed to save");
      else toast.success("Outfit saved from council synthesis!");
    } else if (action === "Add to Calendar") {
      const today = format(/* @__PURE__ */ new Date(), "yyyy-MM-dd");
      const { error } = await supabase.from("calendar_events").insert({
        user_id: user.id,
        title: `Council: ${((_f = (_e = messages.find((m) => m.role === "user")) == null ? void 0 : _e.content) == null ? void 0 : _f.slice(0, 40)) || "Suggestion"}`,
        event_date: today,
        occasion: "Casual",
        notes: (_g = msg.synthesis) == null ? void 0 : _g.slice(0, 200)
      });
      if (error) toast.error("Failed to add");
      else toast.success("Added to today's calendar!");
    } else if (action === "Share") {
      if (navigator.share) {
        navigator.share({ title: "Style Council Advice", text: ((_h = msg.synthesis) == null ? void 0 : _h.slice(0, 300)) || "" }).catch(() => {
        });
      } else {
        await navigator.clipboard.writeText(msg.synthesis || "");
        toast.success("Copied to clipboard!");
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-[calc(100vh-56px)] max-w-lg mx-auto overflow-x-hidden", style: { background: moodTint }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pt-4 pb-2 flex items-center justify-between", style: { background: moodTint }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4.5 h-4.5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-sans font-semibold text-foreground text-sm", children: "Style Council" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-[10px]", children: "3 AI stylists deliberate for you" }),
            memoryCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-[9px] font-sans text-primary/70 bg-primary/8 px-1.5 py-0.5 rounded-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { className: "w-2.5 h-2.5" }),
              " ",
              memoryCount,
              " memories"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        closetItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowWardrobePanel(!showWardrobePanel),
            className: `flex items-center gap-1 px-2 py-1.5 rounded-lg border transition-colors ${showWardrobePanel ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/40"}`,
            title: "Your Wardrobe",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-3.5 h-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans font-medium text-muted-foreground", children: closetItems.length })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => navigate("/chat"),
            className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors",
            title: "Switch to Quick Chat",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3.5 h-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans font-medium text-muted-foreground", children: "Quick" })
            ]
          }
        ),
        messages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearHistory, className: "text-muted-foreground hover:text-destructive transition-colors p-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showWardrobePanel && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { height: 0, opacity: 0 },
        animate: { height: "auto", opacity: 1 },
        exit: { height: 0, opacity: 0 },
        className: "overflow-hidden border-b border-border/50",
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2", children: "Your Wardrobe" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1.5 overflow-x-auto pb-1 scrollbar-none", children: [
            closetItems.slice(0, 12).map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 flex flex-col items-center gap-0.5", children: [
              item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: item.name || "", className: "w-10 h-10 rounded-lg object-cover border border-border/40" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg bg-secondary flex items-center justify-center border border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-4 h-4 text-muted-foreground/40" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-sans text-muted-foreground truncate max-w-[40px]", children: item.name || item.category })
            ] }, item.id)),
            closetItems.length > 12 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/60 flex items-center justify-center text-[9px] font-sans font-semibold text-muted-foreground", children: [
              "+",
              closetItems.length - 12
            ] })
          ] })
        ] })
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-5 space-y-3 pb-3", children: [
      messages.length === 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "pt-8 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-7 h-7 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground mb-1.5", children: "The Style Council" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs max-w-xs mx-auto leading-relaxed", children: "Three AI stylists with different perspectives will deliberate, rank each other, and synthesize the ultimate answer." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          PlaceholdersAndVanishInput,
          {
            placeholders: vanishPlaceholders,
            onChange: () => {
            },
            onSubmit: (e) => {
              const form = e.currentTarget;
              const inp = form.querySelector("input");
              if (inp == null ? void 0 : inp.value) send(inp.value);
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: quickPrompts.map((prompt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => send(prompt.label),
            className: "rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40 transition-colors group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg mb-1 block", children: prompt.emoji }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-xs text-foreground group-hover:text-primary transition-colors leading-tight", children: prompt.label })
            ]
          },
          prompt.label
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: messages.map((msg, i) => {
        var _a;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            className: `flex ${msg.role === "user" ? "justify-end" : "justify-start"}`,
            children: msg.role === "user" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[85%] rounded-2xl px-3.5 py-2.5 font-sans text-sm bg-foreground text-background rounded-br-md", children: [
              msg.imagePreview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: msg.imagePreview, alt: "Uploaded", className: "w-full max-h-48 object-cover rounded-lg" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "leading-relaxed", children: msg.content })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[95%] w-full space-y-2", children: [
              ((_a = msg.stage1) == null ? void 0 : _a.length) ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans text-muted-foreground font-medium uppercase tracking-wider", children: "Council Responses" }),
                msg.stage1.map((s, j) => {
                  var _a2;
                  const ranking = (_a2 = msg.rankings) == null ? void 0 : _a2.find((r) => r.model === s.model);
                  const rank = msg.rankings ? msg.rankings.findIndex((r) => r.model === s.model) + 1 : void 0;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(CouncilResponseCard, { model: s.model, response: s.response, ranking, rank }, j);
                })
              ] }) : null,
              msg.synthesis && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl px-3.5 py-2.5 bg-card border-2 border-primary/30 rounded-bl-md relative overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    motion.div,
                    {
                      className: "absolute inset-0 pointer-events-none",
                      initial: { opacity: 0.6 },
                      animate: { opacity: 0 },
                      transition: { duration: 2.5, ease: "easeOut" },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "div",
                        {
                          className: "absolute inset-0",
                          style: {
                            background: "linear-gradient(105deg, transparent 40%, hsl(var(--gold-light) / 0.12) 45%, hsl(var(--gold) / 0.18) 50%, hsl(var(--gold-light) / 0.12) 55%, transparent 60%)",
                            backgroundSize: "200% 100%",
                            animation: "gold-shimmer-sweep 1.8s ease-out forwards"
                          }
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans text-primary font-semibold uppercase tracking-wider mb-1.5", children: "✨ Council Synthesis" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-sm prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 font-sans text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: msg.synthesis }) })
                ] }),
                msg.mentionedItems && msg.mentionedItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 overflow-x-auto pb-1 scrollbar-none", children: msg.mentionedItems.map((item, mi) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 rounded-lg overflow-hidden", style: { background: "hsl(40 30% 96%)", border: "1px solid hsl(var(--border) / 0.4)" }, children: [
                  item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: item.name || "", className: "w-12 h-12 object-contain p-1", style: { mixBlendMode: "multiply" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-5 h-5 text-muted-foreground/30" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[7px] font-sans text-muted-foreground text-center truncate px-1 pb-1 max-w-[48px]", children: item.name })
                ] }, mi)) }),
                msg.actionSuggestions && msg.actionSuggestions.length > 0 && !isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 flex-wrap", children: msg.actionSuggestions.map((action) => {
                  const icons = {
                    "Save as Outfit": /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-3 h-3" }),
                    "Add to Calendar": /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarPlus, { className: "w-3 h-3" }),
                    "Share": /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-3 h-3" })
                  };
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    motion.button,
                    {
                      whileTap: { scale: 0.92 },
                      onClick: () => {
                        haptic("medium");
                        handleQuickAction(action, msg);
                      },
                      className: "flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-sans font-medium border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors",
                      children: [
                        icons[action],
                        action
                      ]
                    },
                    action
                  );
                }) })
              ] })
            ] })
          },
          i
        );
      }) }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CouncilStageProgress, { currentStage, stageStatus }),
        liveStage1.length > 0 && currentStage >= 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans text-muted-foreground font-medium uppercase tracking-wider", children: "Council Responses" }),
          liveStage1.map((s, j) => {
            const ranking = liveRankings.find((r) => r.model === s.model);
            const rank = liveRankings.length ? liveRankings.findIndex((r) => r.model === s.model) + 1 : void 0;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(CouncilResponseCard, { model: s.model, response: s.response, ranking, rank }, j);
          })
        ] }),
        currentStage > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: [0, 0.2, 0.4].map((delay, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "w-2 h-2 rounded-full bg-primary",
              animate: { scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] },
              transition: { duration: 1.2, repeat: Infinity, delay }
            },
            i
          )) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.span,
            {
              className: "text-xs text-muted-foreground font-sans",
              animate: { opacity: [0.5, 1, 0.5] },
              transition: { duration: 2, repeat: Infinity },
              children: currentStage === 1 ? "Consulting the council..." : currentStage === 2 ? "Cross-ranking responses..." : "Synthesizing final answer..."
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottomRef })
    ] }),
    pendingImage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: pendingImage, alt: "To upload", className: "h-20 w-20 object-cover rounded-xl border border-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingImage(null), className: "absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoodSelector, { selected: currentMood, onSelect: setCurrentMood }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 bg-card border border-border rounded-2xl px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleImageUpload }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        var _a;
        return (_a = fileInputRef.current) == null ? void 0 : _a.click();
      }, className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-primary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-4 h-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(VoiceInput, { onTranscript: (text) => setInput((prev) => prev ? prev + " " + text : text), disabled: isLoading }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          ref: textareaRef,
          value: input,
          onChange: (e) => {
            setInput(e.target.value);
            adjustHeight();
          },
          onKeyDown: handleKeyDown,
          placeholder: "Ask the council...",
          rows: 1,
          className: "flex-1 bg-transparent border-none outline-none resize-none font-sans text-sm text-foreground placeholder:text-muted-foreground min-h-[24px] max-h-24 py-0.5"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => send(),
          disabled: isLoading || !input.trim() && !pendingImage,
          className: `w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${(input.trim() || pendingImage) && !isLoading ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`,
          children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-3.5 h-3.5 bg-primary rounded-sm animate-spin", style: { animationDuration: "3s" } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-3.5 h-3.5" })
        }
      )
    ] }) })
  ] }) });
};
export {
  Council as default
};
