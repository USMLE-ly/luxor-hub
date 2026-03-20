import { Instagram, Twitter, Github, Linkedin, ArrowRight, ArrowUp, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const emailSchema = z.string().trim().email("Please enter a valid email").max(255);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.98a8.21 8.21 0 0 0 3.76.92V6.69z" />
  </svg>
);

const Footer = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setEmailError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email: result.data }]);
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
    } catch {
      toast({ title: "Error", description: "Something went wrong. Try again.", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <footer className="relative border-t border-border bg-background">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-display text-2xl font-bold gold-text mb-2">LUXOR</h3>
            <p className="text-sm text-muted-foreground font-sans mb-4">AI Personal Stylist OS</p>
            
          </div>

          <div className="flex flex-col gap-3 text-sm font-sans text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Quick Links</p>
            <a href="#features" onClick={(e) => scrollTo(e, "features")} className="hover:text-foreground transition-colors w-fit">Features</a>
            <a href="#how-it-works" onClick={(e) => scrollTo(e, "how-it-works")} className="hover:text-foreground transition-colors w-fit">How It Works</a>
            <a href="#pricing" onClick={(e) => scrollTo(e, "pricing")} className="hover:text-foreground transition-colors w-fit">Pricing</a>
            <a href="#faq" onClick={(e) => scrollTo(e, "faq")} className="hover:text-foreground transition-colors w-fit">FAQ</a>
            <a href="#" className="hover:text-foreground transition-colors w-fit">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors w-fit">Terms of Service</a>
          </div>

          <div>
            <p className="font-semibold text-foreground text-sm font-sans mb-3">Stay in Style</p>
            <p className="text-xs text-muted-foreground font-sans mb-3">Get weekly AI styling tips and updates.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
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
            {emailError && (
              <p className="text-xs text-destructive mt-1 font-sans">{emailError}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground font-sans">© 2026 LUXOR. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
            <span className="gold-shimmer">Made with ❤️ for you</span>
          </div>
          <div className="flex items-center gap-4">
            {[
              { icon: Instagram, label: "Instagram" },
              { icon: Twitter, label: "Twitter" },
              { icon: TikTokIcon, label: "TikTok", custom: true },
              { icon: Linkedin, label: "LinkedIn" },
              { icon: Github, label: "GitHub" },
            ].map(({ icon: Icon, label, custom }) => (
              <span
                key={label}
                className="text-muted-foreground/40 cursor-default relative group"
                aria-disabled="true"
                title="Coming Soon"
              >
                {custom ? <TikTokIcon /> : <Icon className="w-4 h-4" />}
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-sans text-muted-foreground bg-muted px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Coming Soon
                </span>
              </span>
            ))}
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
