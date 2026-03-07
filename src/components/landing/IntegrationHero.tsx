import { motion } from "framer-motion";

const platforms = [
  { name: "Instagram", logo: "/logos/instagram.png" },
  { name: "Pinterest", logo: "/logos/pinterest.png" },
  { name: "Shopify", logo: "/logos/shopify.png" },
  { name: "TikTok", logo: "/logos/tiktok.png" },
  { name: "ASOS", logo: "/logos/asos.png" },
  { name: "Zara", logo: "/logos/zara.png" },
];

export default function IntegrationHero() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-muted/30">
      <div className="relative max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Connects to your <span className="gold-text">favorite platforms</span>
            </h3>
            <p className="text-sm text-muted-foreground font-sans max-w-sm">
              Sync your style across Instagram, Pinterest, Shopify, and more.
            </p>
          </motion.div>

          {/* Platform logos */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex gap-4 flex-wrap justify-center"
          >
            {platforms.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:shadow-[0_0_16px_hsl(var(--primary)/0.1)] transition-all duration-300 p-2.5">
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    loading="lazy"
                  />
                </div>
                <span className="text-[10px] font-sans font-medium text-muted-foreground">{p.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
