import { motion } from "framer-motion";

const VogueLogo = () => (
  <svg viewBox="0 0 120 28" className="h-5 md:h-7 w-auto" fill="currentColor">
    <text fontFamily="'Times New Roman', Georgia, serif" fontSize="26" fontWeight="400" letterSpacing="6" y="23" x="0">VOGUE</text>
  </svg>
);

const GQLogo = () => (
  <svg viewBox="0 0 52 30" className="h-5 md:h-7 w-auto" fill="currentColor">
    <text fontFamily="'Times New Roman', Georgia, serif" fontSize="28" fontWeight="700" letterSpacing="2" y="24" x="0">GQ</text>
  </svg>
);

const ForbesLogo = () => (
  <svg viewBox="0 0 130 28" className="h-5 md:h-7 w-auto" fill="currentColor">
    <text fontFamily="'Georgia', 'Times New Roman', serif" fontSize="26" fontWeight="400" fontStyle="italic" letterSpacing="3" y="23" x="0">Forbes</text>
  </svg>
);

const ElleLogo = () => (
  <svg viewBox="0 0 90 30" className="h-5 md:h-7 w-auto" fill="currentColor">
    <text fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontSize="28" fontWeight="900" letterSpacing="8" y="24" x="0">ELLE</text>
  </svg>
);

const BazaarLogo = () => (
  <svg viewBox="0 0 160 28" className="h-4 md:h-6 w-auto" fill="currentColor">
    <text fontFamily="'Didot', 'Bodoni MT', 'Times New Roman', serif" fontSize="18" fontWeight="400" letterSpacing="10" y="20" x="0">HARPER'S BAZAAR</text>
  </svg>
);

const logos = [
  { name: "Vogue", Component: VogueLogo },
  { name: "GQ", Component: GQLogo },
  { name: "Forbes", Component: ForbesLogo },
  { name: "Elle", Component: ElleLogo },
  { name: "Bazaar", Component: BazaarLogo },
];

const SocialProofStrip = () => (
  <section className="py-14 md:py-20 border-y border-primary/10 bg-background/80 backdrop-blur-sm relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04),transparent_70%)]" />

    <div className="max-w-5xl mx-auto px-4 relative z-10">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center font-sans text-[10px] md:text-[11px] text-muted-foreground/60 tracking-[0.3em] uppercase mb-8 md:mb-10"
      >
        As Featured In
      </motion.p>

      <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
        {logos.map((logo, i) => (
          <motion.div
            key={logo.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="flex items-center gap-8 md:gap-14"
          >
            <span className="text-muted-foreground/25 hover:text-primary/50 transition-colors duration-500">
              <logo.Component />
            </span>
            {i < logos.length - 1 && (
              <span className="hidden md:block w-px h-5 bg-primary/15" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofStrip;
