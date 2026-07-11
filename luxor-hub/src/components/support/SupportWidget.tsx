import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatCircle, X, PaperPlaneTilt, Warning, CheckCircle, Spinner } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Ticket {
  id: string;
  title: string;
  status: string;
  severity: string;
  ai_fix_suggestion?: string;
  created_at: string;
}

interface Message {
  id: string;
  sender: "user" | "ai" | "agent";
  message: string;
  created_at: string;
}

const CATEGORIES = [
  { value: "auth", label: "Login & Account" },
  { value: "payment", label: "Billing & Subscription" },
  { value: "ai", label: "AI Analysis" },
  { value: "wardrobe", label: "Wardrobe & Closet" },
  { value: "weather", label: "Weather & Outfits" },
  { value: "ui", label: "App Performance" },
  { value: "other", label: "Something Else" },
];

export default function SupportWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<"menu" | "new" | "chat" | "history">("menu");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [isTyping, setIsTyping] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const handler = () => setErrorCount((c) => c + 1);
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, [user]);

  useEffect(() => {
    if (errorCount >= 2) setIsOpen(true);
  }, [errorCount]);

  useEffect(() => {
    if (isOpen && user) loadTickets();
  }, [isOpen, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadTickets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("support_tickets")
      .select("id, title, status, severity, ai_fix_suggestion, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setTickets(data || []);
  };

  const loadMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("support_messages")
      .select("id, sender, message, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMessages((data as any) || []);
  };

  const createTicket = async () => {
    if (!user || !newTitle.trim() || !newDescription.trim()) return;
    const { data: ticket } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        page_url: window.location.href,
        browser_info: navigator.userAgent,
      })
      .select()
      .single();
    if (!ticket) return;
    await supabase.from("support_messages").insert({ ticket_id: ticket.id, sender: "user", message: newDescription.trim() });
    setIsTyping(true);
    try {
      const res = await supabase.functions.invoke("support-ai", {
        body: { ticket_id: ticket.id, action: "diagnose", error_context: { message: newDescription.trim(), page: window.location.pathname, feature: newCategory, browser: navigator.userAgent, timestamp: new Date().toISOString() } },
      });
      if (res.data?.diagnosis) { ticket.ai_fix_suggestion = res.data.diagnosis.fix_suggestion; ticket.status = "in_progress"; }
    } catch (e) { console.error("AI diagnosis failed:", e); }
    setIsTyping(false);
    setActiveTicket(ticket);
    setView("chat");
    await loadMessages(ticket.id);
    setNewTitle(""); setNewDescription(""); setNewCategory("other");
  };

  const sendMessage = async () => {
    if (!activeTicket || !newMessage.trim()) return;
    const userMsg = newMessage.trim();
    setNewMessage("");
    setMessages((prev) => [...prev, { id: `t${Date.now()}`, sender: "user", message: userMsg, created_at: new Date().toISOString() }]);
    await supabase.from("support_messages").insert({ ticket_id: activeTicket.id, sender: "user", message: userMsg });
    setIsTyping(true);
    try {
      const res = await supabase.functions.invoke("support-ai", { body: { ticket_id: activeTicket.id, action: "chat", user_message: userMsg } });
      if (res.data?.reply) setMessages((prev) => [...prev, { id: `a${Date.now()}`, sender: "ai", message: res.data.reply, created_at: new Date().toISOString() }]);
    } catch {
      setMessages((prev) => [...prev, { id: `e${Date.now()}`, sender: "ai", message: "Connection issue. Please try again.", created_at: new Date().toISOString() }]);
    }
    setIsTyping(false);
  };

  if (!user) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-[9998] w-12 h-12 rounded-full bg-gradient-to-br from-gold to-gold/80 text-background shadow-lg shadow-gold/20 flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5" /> : <ChatCircle className="w-5 h-5" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-34 right-4 z-[9999] w-[380px] max-h-[520px] bg-card border border-border/30 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-border/20 bg-gradient-to-r from-gold/10 to-transparent">
              <div className="flex items-center justify-between">
                <div><h3 className="font-display text-sm font-bold text-foreground">LUXOR® Support</h3><p className="text-[10px] text-muted-foreground mt-0.5">AI-powered assistance</p></div>
                {view !== "menu" && <button onClick={() => setView("menu")} className="text-xs text-muted-foreground hover:text-foreground">Back</button>}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {view === "menu" && (
                <div className="space-y-3">
                  <button onClick={() => setView("new")} className="w-full p-3 rounded-xl bg-gold/10 border border-gold/20 text-left hover:bg-gold/15 transition-colors">
                    <div className="text-sm font-medium text-foreground">New Support Ticket</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Describe your issue and get instant AI help</div>
                  </button>
                  <button onClick={() => setView("history")} className="w-full p-3 rounded-xl bg-background border border-border/20 text-left hover:bg-accent/50 transition-colors">
                    <div className="text-sm font-medium text-foreground">My Tickets ({tickets.length})</div>
                    <div className="text-xs text-muted-foreground mt-0.5">View your support history</div>
                  </button>
                </div>
              )}

              {view === "new" && (
                <div className="space-y-3">
                  <div><label className="text-xs font-medium text-muted-foreground">Category</label>
                    <select id="support-category" name="category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="w-full mt-1 p-2 rounded-lg bg-background border border-border/30 text-sm text-foreground">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div><label className="text-xs font-medium text-muted-foreground">Title</label>
                    <input id="support-title" name="title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Brief summary" className="w-full mt-1 p-2 rounded-lg bg-background border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50" />
                  </div>
                  <div><label className="text-xs font-medium text-muted-foreground">Description</label>
                    <textarea id="support-description" name="description" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="What happened?" rows={3} className="w-full mt-1 p-2 rounded-lg bg-background border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50 resize-none" />
                  </div>
                  <button onClick={createTicket} disabled={!newTitle.trim() || !newDescription.trim() || isTyping} className="w-full p-2.5 rounded-xl bg-gold text-background font-medium text-sm hover:bg-gold/90 transition-colors disabled:opacity-50">
                    {isTyping ? "Analyzing with AI..." : "Submit Ticket"}
                  </button>
                </div>
              )}

              {view === "chat" && activeTicket && (
                <div className="space-y-3">
                  {activeTicket.ai_fix_suggestion && (
                    <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
                      <div className="text-[10px] font-medium text-gold mb-1">AI Suggestion:</div>
                      <div className="text-xs text-foreground">{activeTicket.ai_fix_suggestion}</div>
                    </div>
                  )}
                  <div className="space-y-2 max-h-[280px] overflow-y-auto">
                    {messages.map((m) => (
                      <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-2.5 rounded-xl text-xs leading-relaxed ${m.sender === "user" ? "bg-gold/20 text-foreground rounded-br-sm" : "bg-background border border-border/20 text-foreground rounded-bl-sm"}`}>
                          {m.message}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-background border border-border/20 px-3 py-2 rounded-xl rounded-bl-sm">
                          <div className="flex gap-1"><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" /><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{animationDelay:"150ms"}} /><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{animationDelay:"300ms"}} /></div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>
              )}

              {view === "history" && (
                <div className="space-y-2">
                  {tickets.length === 0 ? <div className="text-center py-8 text-muted-foreground text-sm">No tickets yet</div> : tickets.map((t) => (
                    <button key={t.id} onClick={() => { setActiveTicket(t); setView("chat"); loadMessages(t.id); }} className="w-full p-3 rounded-xl bg-background border border-border/20 text-left hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {t.status === "resolved" ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Warning className="w-3 h-3 text-amber-400" />}
                        <span className="text-sm font-medium text-foreground truncate">{t.title}</span>
                        <span className="text-[10px] ml-auto text-muted-foreground">{t.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {view === "chat" && activeTicket && (
              <div className="p-3 border-t border-border/20">
                <div className="flex gap-2">
                  <input id="support-message" name="message" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask AI for help..." className="flex-1 p-2 rounded-lg bg-background border border-border/30 text-sm text-foreground placeholder:text-muted-foreground/50" />
                  <button onClick={sendMessage} disabled={!newMessage.trim() || isTyping} className="p-2 rounded-lg bg-gold text-background hover:bg-gold/90 disabled:opacity-50"><PaperPlaneTilt className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
