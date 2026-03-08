import { Sparkles, Instagram, Twitter, Github, ArrowRight, ArrowUp, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagneticCursor } from "@/components/ui/magnetic-cursor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers" as any)
      .insert([{ email }] as any);
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already subscribed!", description: "You're already on the list." });
      } else {
        toast({ title: "Error", description: "Something went wrong. Try again.", variant: "destructive" });
      }
    } else {
      setSubscribed(true);
      toast({ title: "Subscribed! ✨", description: "Welcome to the style insider list." });
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="relative border-t border-border bg-background">
      {/* CTA Band */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-primary/[0.08] to-primary/[0.04]" />
        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4"
          >
            Ready to Transform Your <span className="gold-text">Style</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-sans text-lg mb-8 max-w-xl mx-auto"
          >
            Join thousands who've elevated their personal style with AI-powered intelligence.
          </motion.p>
          <MagneticCursor strength={0.25} radius={80}>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl gold-gradient text-primary-foreground font-sans font-semibold text-sm tracking-wide hover:opacity-90 transition-opacity shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]"
            >
              <Sparkles className="w-4 h-4" />
              Start Free Trial
            </motion.button>
          </MagneticCursor>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-display text-2xl font-bold gold-text mb-2">AURELIA</h3>
            <p className="text-sm text-muted-foreground font-sans mb-4">AI Personal Stylist OS</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-sans text-muted-foreground">
              <Sparkles className="w-3 h-3 text-primary" /> Built with AI
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm font-sans text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Quick Links</p>
            <a href="#features" className="hover:text-foreground transition-colors w-fit">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors w-fit">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors w-fit">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors w-fit">FAQ</a>
          </div>

          <div>
            <p className="font-semibold text-foreground text-sm font-sans mb-3">Stay in Style</p>
            <p className="text-xs text-muted-foreground font-sans mb-3">Get weekly AI styling tips and updates.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full h-9 px-3 rounded-lg bg-muted border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-9 px-3 rounded-lg gold-gradient text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50"
              >
                <AnimatePresence mode="wait">
                  {subscribed ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  ) : loading ? (
                    <motion.span key="loading">…</motion.span>
                  ) : (
                    <motion.div key="arrow" initial={{ x: -5 }} animate={{ x: 0 }}>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground font-sans">© 2026 AURELIA. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
            <span className="gold-shimmer">Made with ♥ and AI</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="ml-2 p-1.5 rounded-full border border-border hover:border-primary/30 hover:text-primary transition-all"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
