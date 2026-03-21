import { motion } from "framer-motion";

const mediaBadges = ["VOGUE", "GQ", "FORBES", "ELLE", "BAZAAR", "COSMOPOLITAN", "ESQUIRE", "GLAMOUR"];

const MarqueeRow = () => (
  <div className="flex overflow-hidden marquee-fade-mask">
    <motion.div
      className="flex shrink-0 gap-16 md:gap-24 items-center"
      animate={{ x: ["-50%", "0%"] }}
      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
    >
      {[...mediaBadges, ...mediaBadges].map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="font-display text-base md:text-xl font-bold tracking-[0.3em] uppercase select-none text-muted-foreground/50 hover:text-primary/80 transition-colors duration-500 whitespace-nowrap"
        >
          {name}
        </span>
      ))}
    </motion.div>
  </div>
);

const SocialProofStrip = () => (
  <section className="relative py-8 md:py-10 overflow-hidden">
    {/* Top gold line */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    {/* Bottom gold line */}
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.03),transparent_70%)]" />

    <div className="relative z-10 space-y-5">
      <p className="text-center font-sans text-[10px] md:text-[11px] text-muted-foreground/50 tracking-[0.4em] uppercase">
        Featured In
      </p>
      <MarqueeRow />
    </div>
  </section>
);

export default SocialProofStrip;
