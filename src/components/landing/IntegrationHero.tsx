import { GradientButton } from "@/components/ui/gradient-button";
import { motion } from "framer-motion";

const ICONS_ROW1 = [
  "https://cdn-icons-png.flaticon.com/512/2111/2111463.png",   // Instagram
  "https://cdn-icons-png.flaticon.com/512/174/174863.png",     // Pinterest
  "https://cdn-icons-png.flaticon.com/512/5968/5968830.png",   // Shopify
  "https://cdn-icons-png.flaticon.com/512/3536/3536505.png",   // TikTok
  "https://cdn-icons-png.flaticon.com/512/5968/5968764.png",   // Figma
  "https://cdn-icons-png.flaticon.com/512/888/888879.png",     // Google
  "https://cdn-icons-png.flaticon.com/512/5968/5968841.png",   // Spotify
];

const ICONS_ROW2 = [
  "https://cdn-icons-png.flaticon.com/512/733/733635.png",     // Twitter/X
  "https://cdn-icons-png.flaticon.com/512/5968/5968756.png",   // Etsy
  "https://cdn-icons-png.flaticon.com/512/174/174848.png",     // Stripe
  "https://cdn-icons-png.flaticon.com/512/5968/5968958.png",   // Notion
  "https://cdn-icons-png.flaticon.com/512/733/733547.png",     // Facebook
  "https://cdn-icons-png.flaticon.com/512/3670/3670147.png",   // Canva
  "https://cdn-icons-png.flaticon.com/512/732/732200.png",     // Snapchat
];

const repeatedIcons = (icons: string[], repeat = 4) =>
  Array.from({ length: repeat }).flatMap(() => icons);

export default function IntegrationHero() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-background">
      {/* Dot grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--foreground)/0.04)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-5 text-sm rounded-full border border-border bg-card text-foreground font-sans font-medium"
        >
          ⚡ Integrations
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl lg:text-6xl font-bold tracking-tight text-foreground"
        >
          Connect your favorite fashion platforms
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 text-lg font-sans text-muted-foreground max-w-xl mx-auto"
        >
          Sync with Instagram, Pinterest, Shopify, and 250+ apps to elevate your style workflow.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GradientButton className="mt-8">
            Get started
          </GradientButton>
        </motion.div>

        {/* Icon Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 overflow-hidden relative pb-2"
        >
          {/* Row 1 - scrolls left */}
          <div className="flex gap-10 whitespace-nowrap animate-integration-left">
            {repeatedIcons(ICONS_ROW1, 4).map((src, i) => (
              <div
                key={i}
                className="h-16 w-16 flex-shrink-0 rounded-full bg-card shadow-md border border-border flex items-center justify-center"
              >
                <img src={src} alt="" className="h-10 w-10 object-contain" loading="lazy" />
              </div>
            ))}
          </div>

          {/* Row 2 - scrolls right */}
          <div className="flex gap-10 whitespace-nowrap mt-6 animate-integration-right">
            {repeatedIcons(ICONS_ROW2, 4).map((src, i) => (
              <div
                key={i}
                className="h-16 w-16 flex-shrink-0 rounded-full bg-card shadow-md border border-border flex items-center justify-center"
              >
                <img src={src} alt="" className="h-10 w-10 object-contain" loading="lazy" />
              </div>
            ))}
          </div>

          {/* Fade overlays */}
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
