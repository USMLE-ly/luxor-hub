import { motion } from "framer-motion";

const mediaBadges = ["VOGUE", "GQ", "FORBES", "ELLE", "BAZAAR", "COSMOPOLITAN", "ESQUIRE", "GLAMOUR"];

const MarqueeRow = ({ reverse = false }: { reverse?: boolean }) => (
  <div className="flex overflow-hidden marquee-fade-mask">
    <motion.div
      className="flex shrink-0 gap-12 md:gap-20 items-center"
      animate={{ x: reverse ? ["0%", "-50%"] : ["-50%", "0%"] }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    >
      {[...mediaBadges, ...mediaBadges].map((name, i) => (
        <span
          key={`${name}-${i}`}
          className="font-display text-lg md:text-2xl font-bold tracking-[0.25em] uppercase select-none text-muted-foreground/30 hover:text-foreground/50 transition-colors duration-500 whitespace-nowrap"
        >
          {name}
        </span>
      ))}
    </motion.div>
  </div>
);

const SocialProofStrip = () => (
  <section className="py-10 md:py-14 border-y border-border bg-background relative overflow-hidden">
    <div className="relative z-10 space-y-6">
      <p className="text-center font-sans text-[10px] md:text-[11px] text-muted-foreground/60 tracking-[0.3em] uppercase">
        As Featured In
      </p>
      <MarqueeRow />
    </div>
  </section>
);

export default SocialProofStrip;
