import { Sparkles, Instagram, Twitter, Github, ArrowRight } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      toast({ title: "Subscribed! ✨", description: "Welcome to the style insider list." });
      setEmail("");
    }
  };

  return (
    <footer className="relative border-t border-border bg-background">
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
          </div>

          <div>
            <p className="font-semibold text-foreground text-sm font-sans mb-3">Stay in Style</p>
            <p className="text-xs text-muted-foreground font-sans mb-3">Get weekly AI styling tips and updates.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 h-9 px-3 rounded-lg bg-muted border border-border text-sm font-sans text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="h-9 px-3 rounded-lg gold-gradient text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1 disabled:opacity-50"
              >
                {loading ? "…" : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground font-sans">© 2026 AURELIA. All rights reserved.</p>
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
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
