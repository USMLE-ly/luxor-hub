import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-dark/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-gold font-medium">
            <Sparkles className="w-4 h-4" />
            AI-Powered Personal Styling
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight mb-8"
        >
          Your AI Stylist That{" "}
          <span className="gold-text">Knows You</span>{" "}
          Better Than You Know Yourself
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-sans"
        >
          Upload your wardrobe. Get daily AI-curated outfits. Shop smarter. 
          Look unstoppable — every single day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" className="gold-gradient text-primary-foreground font-semibold px-8 py-6 text-lg rounded-xl gold-glow hover:opacity-90 transition-opacity">
            Start Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-6 text-lg rounded-xl border-glass-border hover:bg-card/60">
            See How It Works
          </Button>
        </motion.div>

        {/* Floating mockup cards */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-20 relative"
        >
          <div className="glass rounded-2xl p-8 max-w-3xl mx-auto gold-glow">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-3 h-3 rounded-full bg-destructive/70" />
              <div className="w-3 h-3 rounded-full bg-primary/40" />
              <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
              <span className="text-sm text-muted-foreground ml-2 font-sans">AURELIA Dashboard</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4 col-span-2">
                <p className="text-sm text-muted-foreground font-sans mb-2">Today's Outfit</p>
                <p className="font-display text-xl font-semibold gold-text">Modern Power Casual</p>
                <p className="text-sm text-muted-foreground font-sans mt-2">Navy blazer · White tee · Dark jeans · Chelsea boots</p>
                <div className="flex gap-2 mt-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">95% Match</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">Office Ready</span>
                </div>
              </div>
              <div className="glass rounded-xl p-4 flex flex-col justify-between">
                <p className="text-sm text-muted-foreground font-sans mb-2">Style DNA</p>
                <p className="font-display text-lg gold-text">Minimal Power</p>
                <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                  <div className="gold-gradient h-1.5 rounded-full" style={{ width: "87%" }} />
                </div>
                <p className="text-xs text-muted-foreground font-sans mt-1">87 Style Score</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
