import { motion } from "framer-motion";

const mediaBadges = [
  { name: "VOGUE", width: "w-[72px] md:w-[90px]" },
  { name: "GQ", width: "w-[36px] md:w-[44px]" },
  { name: "FORBES", width: "w-[72px] md:w-[90px]" },
  { name: "ELLE", width: "w-[54px] md:w-[68px]" },
  { name: "BAZAAR", width: "w-[72px] md:w-[90px]" },
];

const SocialProofStrip = () => (
  <section className="py-14 md:py-20 border-y border-primary/10 bg-background/80 backdrop-blur-sm relative overflow-hidden">
    {/* Subtle gold glow */}
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />

    <div className="max-w-5xl mx-auto px-4 relative z-10">
      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center font-sans text-[10px] md:text-[11px] text-muted-foreground/60 tracking-[0.3em] uppercase mb-8 md:mb-10"
      >
        As Featured In
      </motion.p>

      {/* Brand logos as elegant typographic marks */}
      <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
        {mediaBadges.map((badge, i) => (
          <motion.div
            key={badge.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="flex items-center gap-6 md:gap-12"
          >
            <span
              className={`font-display text-lg md:text-2xl font-bold tracking-[0.25em] uppercase select-none text-muted-foreground/30 hover:text-primary/50 transition-colors duration-500`}
            >
              {badge.name}
            </span>
            {i < mediaBadges.length - 1 && (
              <span className="hidden md:block w-px h-5 bg-primary/15" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofStrip;
