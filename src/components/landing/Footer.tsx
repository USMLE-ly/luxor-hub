import { motion } from "framer-motion";
import { Sparkles, Instagram, Twitter, Github, ArrowRight } from "lucide-react";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="relative border-t border-border">
      {/* Gold gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold gold-text mb-2">AURELIA</h3>
            <p className="text-sm text-muted-foreground font-sans mb-4">AI Personal Stylist OS</p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-xs font-sans text-muted-foreground">
              <Sparkles className="w-3 h-3 text-primary" /> Built with AI
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3 text-sm font-sans text-muted-foreground">
            <p className="font-semibold text-foreground mb-1">Quick Links</p>
            <a href="#features" className="hover:text-foreground transition-colors w-fit">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors w-fit">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors w-fit">Pricing</a>
          </div>

          {/* Newsletter */}
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
              />
              <button
                type="submit"
                className="h-9 px-3 rounded-lg gold-gradient text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1"
              >
                {subscribed ? "✓" : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground font-sans">© 2026 AURELIA. All rights reserved.</p>

          {/* Social links */}
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
