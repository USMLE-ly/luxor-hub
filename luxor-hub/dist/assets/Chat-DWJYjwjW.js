import { r as reactExports, e as useNavigate, f as useSearchParams, j as jsxRuntimeExports } from "./index-DbMNM3HR.js";
import { u as usePlanTier } from "./usePlanTier-Dq2hHiUM.js";
import { P as PLAN_LIMITS } from "./planRestrictions-__Vqe2nr.js";
import { A as AppLayout } from "./AppLayout-z0hM-vSW.js";
import { e as useAuth, s as supabase } from "./AppContent-_r6To3FT.js";
import { t as toast } from "./index-eweMusN_.js";
import { u as useAutoResizeTextarea, P as PlaceholdersAndVanishInput, M as MoodSelector, V as VoiceInput, a as Markdown } from "./MoodSelector-Bp9v5xaQ.js";
import { a as animate } from "./index-CqBZZwGN.js";
import { S as Sparkles } from "./sparkles-Dn0VJ8Xg.js";
import { U as Users } from "./users-Dttc7gOA.js";
import { T as Trash2 } from "./trash-2-D0lMQ9Gw.js";
import { m as motion } from "./proxy-BW1EVREd.js";
import { A as AnimatePresence } from "./index-JsMeU7Bl.js";
import { X } from "./x-Ck9WgWm3.js";
import { C as Camera } from "./camera-C-B6mYPG.js";
import { A as ArrowUp } from "./arrow-up-BJXC3EYE.js";
import "./useQuery-CiOycrs6.js";
import "./BottomNav-BJG5rdUS.js";
import "./shirt-DOs4UNgN.js";
const lastCalls = {};
function canProceed(key, cooldownMs = 3e3) {
  const now = Date.now();
  const last = lastCalls[key];
  if (last && now - last < cooldownMs) {
    return false;
  }
  lastCalls[key] = now;
  return true;
}
function useAnimatedText(text, delimiter = "") {
  const [cursor, setCursor] = reactExports.useState(0);
  const [startingCursor, setStartingCursor] = reactExports.useState(0);
  const [prevText, setPrevText] = reactExports.useState(text);
  if (prevText !== text) {
    setPrevText(text);
    setStartingCursor(text.startsWith(prevText) ? cursor : 0);
  }
  reactExports.useEffect(() => {
    const parts = text.split(delimiter);
    const duration = delimiter === "" ? 8 : delimiter === " " ? 4 : 2;
    const controls = animate(startingCursor, parts.length, {
      duration,
      ease: "easeOut",
      onUpdate(latest) {
        setCursor(Math.floor(latest));
      }
    });
    return () => controls.stop();
  }, [startingCursor, text, delimiter]);
  return text.split(delimiter).slice(0, cursor).join(delimiter);
}
const CHAT_URL = `${"https://uakkwvdjoqsceewhsfjb.supabase.co"}/functions/v1/ai-chat`;
const quickPrompts = [
  { emoji: "👔", label: "Style me for today" },
  { emoji: "🌙", label: "Date night outfit" },
  { emoji: "💼", label: "Work-ready look" },
  { emoji: "🎉", label: "Something for a party" },
  { emoji: "📸", label: "Does this work on me?" },
  { emoji: "🛍️", label: "What am I missing?" }
];
const vanishPlaceholders = [
  "Style me for today",
  "Date night outfit",
  "Work-ready look",
  "Something for a party",
  "What am I missing?",
  "Does this work on me?"
];
function AnimatedAssistantMessage({ content, isStreaming }) {
  const animatedContent = useAnimatedText(content, " ");
  const displayContent = isStreaming ? content : animatedContent;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-sm prose-invert max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:text-base [&>h2]:text-sm [&>h3]:text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Markdown, { children: displayContent }) });
}
const Chat = () => {
  var _a;
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tier } = usePlanTier();
  const dailyLimit = PLAN_LIMITS[tier].aiSuggestionsPerDay;
  const [dailySendCount, setDailySendCount] = reactExports.useState(0);
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = reactExports.useState([]);
  const [input, setInput] = reactExports.useState("");
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const [styleProfile, setStyleProfile] = reactExports.useState(null);
  const [closetSummary, setClosetSummary] = reactExports.useState("");
  const [pendingImage, setPendingImage] = reactExports.useState(null);
  const [currentMood, setCurrentMood] = reactExports.useState(null);
  const bottomRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 24,
    maxHeight: 96
  });
  reactExports.useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("chat_messages").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("style_profiles").select("archetype, preferences").eq("user_id", user.id).single(),
      supabase.from("clothing_items").select("name, category, color, style").eq("user_id", user.id)
    ]).then(([chatRes, styleRes, closetRes]) => {
      if (chatRes.data) setMessages(chatRes.data.map((m) => ({ id: m.id, role: m.role, content: m.content })));
      if (styleRes.data) setStyleProfile(styleRes.data);
      if (closetRes.data) setClosetSummary(closetRes.data.map((i) => `${i.name || "Unnamed"} (${i.category}, ${i.color || ""})`).join("; "));
    });
  }, [user]);
  reactExports.useEffect(() => {
    const prefill = searchParams.get("prefill");
    if (prefill) setInput(prefill);
  }, [searchParams]);
  reactExports.useEffect(() => {
    var _a2;
    (_a2 = bottomRef.current) == null ? void 0 : _a2.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const saveMessage = async (role, content) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({ user_id: user.id, role, content });
  };
  const handleImageUpload = (e) => {
    var _a2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPendingImage(reader.result);
      if (!input.trim()) setInput("Check if this item matches my style DNA");
    };
    reader.readAsDataURL(file);
  };
  const send = async (overrideInput) => {
    var _a2, _b, _c, _d, _e, _f;
    const text = overrideInput || input.trim();
    if (!text || isLoading || !user) return;
    if (!canProceed("chat-send", 2e3)) {
      toast.error("Please wait a moment before sending another message.");
      return;
    }
    if (dailySendCount >= dailyLimit) {
      toast.error(`You've reached your ${dailyLimit} AI suggestions for today. Upgrade for more.`);
      return;
    }
    setDailySendCount((c) => c + 1);
    const userMsg = { role: "user", content: text, imagePreview: pendingImage || void 0 };
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
          toast.error("Rate limited. Please wait a moment.");
          throw new Error("rate limited");
        }
        if (resp.status === 402) {
          toast.error("AI credits exhausted.");
          throw new Error("credits exhausted");
        }
        throw new Error(err.error || "Failed to get response");
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      while (!streamDone) {
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
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = (_c = (_b = (_a2 = parsed.choices) == null ? void 0 : _a2[0]) == null ? void 0 : _b.delta) == null ? void 0 : _c.content;
            if (content) {
              assistantSoFar += content;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if ((last == null ? void 0 : last.role) === "assistant" && !last.id) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar, isStreaming: true } : m);
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
            const content = (_f = (_e = (_d = parsed.choices) == null ? void 0 : _d[0]) == null ? void 0 : _e.delta) == null ? void 0 : _f.content;
            if (content) assistantSoFar += content;
          } catch {
          }
        }
        if (assistantSoFar) {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if ((last == null ? void 0 : last.role) === "assistant" && !last.id) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar, isStreaming: false } : m);
            }
            return [...prev, { role: "assistant", content: assistantSoFar, isStreaming: false }];
          });
        }
      }
      setMessages(
        (prev) => prev.map((m, i) => i === prev.length - 1 && m.role === "assistant" ? { ...m, isStreaming: false } : m)
      );
      saveMessage("assistant", assistantSoFar);
    } catch (e) {
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
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-[calc(100vh-56px)] max-w-lg mx-auto overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pt-4 pb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-4.5 h-4.5 text-primary" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-sans font-semibold text-foreground text-sm", children: "Your Stylist" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-[10px]", children: "Knows your closet. Knows your body. Ask anything." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => navigate("/council"),
            className: "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors",
            title: "Switch to Council mode",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-3.5 h-3.5 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans font-medium text-muted-foreground", children: "Council" })
            ]
          }
        ),
        messages.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearHistory, className: "text-muted-foreground hover:text-destructive transition-colors p-1.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-5 space-y-3 pb-3", children: [
      messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "pt-8 pb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-7 h-7 text-primary" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground mb-1.5", children: "What are we wearing today?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs max-w-xs mx-auto leading-relaxed", children: "I have your entire closet memorized, I know your colors, and I track what's trending. Let's build something good." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          PlaceholdersAndVanishInput,
          {
            placeholders: vanishPlaceholders,
            onChange: () => {
            },
            onSubmit: (e) => {
              const form = e.currentTarget;
              const input2 = form.querySelector("input");
              if (input2 == null ? void 0 : input2.value) send(input2.value);
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: quickPrompts.map((prompt) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              var _a2;
              if (prompt.emoji === "📸") {
                (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
              } else {
                send(prompt.label);
              }
            },
            className: "rounded-xl border border-border bg-card p-3 text-left hover:border-primary/40 transition-colors group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg mb-1 block", children: prompt.emoji }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-xs text-foreground group-hover:text-primary transition-colors leading-tight", children: prompt.label })
            ]
          },
          prompt.label
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: messages.map((msg, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          className: `flex ${msg.role === "user" ? "justify-end" : "justify-start"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `max-w-[85%] rounded-2xl px-3.5 py-2.5 font-sans text-sm relative overflow-hidden transition-shadow duration-500 ease-out ${msg.role === "user" ? "bg-foreground text-background rounded-br-md" : "bg-card border border-border rounded-bl-md hover:shadow-[0_0_15px_-3px_hsl(var(--gold)/0.35),0_0_6px_-2px_hsl(var(--gold)/0.2)] hover:border-[hsl(var(--gold)/0.4)]"}`,
              children: [
                msg.role === "assistant" && /* @__PURE__ */ jsxRuntimeExports.jsx(
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
                msg.imagePreview && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 rounded-lg overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: msg.imagePreview, alt: "Uploaded item", className: "w-full max-h-48 object-cover rounded-lg" }) }),
                msg.role === "assistant" ? /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatedAssistantMessage, { content: msg.content, isStreaming: msg.isStreaming }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "leading-relaxed", children: msg.content })
              ]
            }
          )
        },
        i
      )) }),
      isLoading && ((_a = messages[messages.length - 1]) == null ? void 0 : _a.role) !== "assistant" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, className: "flex justify-start", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-3", children: [
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
            children: "Putting your look together..."
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: bottomRef })
    ] }),
    pendingImage && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative inline-block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: pendingImage, alt: "To upload", className: "h-20 w-20 object-cover rounded-xl border border-border" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPendingImage(null), className: "absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MoodSelector, { selected: currentMood, onSelect: setCurrentMood }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 pb-4 pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end gap-2 bg-card border border-border rounded-2xl px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleImageUpload }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            var _a2;
            return (_a2 = fileInputRef.current) == null ? void 0 : _a2.click();
          },
          className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-muted-foreground hover:text-primary transition-colors",
          title: "Upload image",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "w-4 h-4" })
        }
      ),
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
          placeholder: "What's the occasion?",
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
  Chat as default
};
