import { motion } from "framer-motion";
import { Sparkles, Camera, Brain, Sun, ShoppingBag, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Step 1: Digitize Your Wardrobe",
    body: "Photograph your clothes. The AI identifies each piece in seconds — category, colors, fabric, brand, season. No manual tagging. Your entire closet lives in one searchable catalog on your phone.",
  },
  {
    icon: Brain,
    title: "Step 2: AI Learns Your Style DNA",
    body: "LEXOR® builds a personal Style DNA profile from your body measurements, skin-tone color season, lifestyle, and the outfits you actually wear. It maps 40+ style dimensions so every recommendation feels like you.",
  },
  {
    icon: Sun,
    title: "Step 3: Wake Up to a Weather-Checked Outfit",
    body: "Each morning, the AI checks your wardrobe, local weather, and calendar to assemble a complete outfit. Late for a meeting? It picks business-appropriate pieces. Weekend brunch? Relaxed and current. Every interaction makes tomorrow smarter.",
  },
  {
    icon: ShoppingBag,
    title: "Step 4: Shop Smarter With Gap Analysis",
    body: "Instead of impulse buys, LEXOR® shows what's actually missing — a neutral blazer, a transitional layer, the right denim shade. Users spend 35% less on clothing while wearing 60% more of what they own.",
  },
  {
    icon: BarChart3,
    title: "Step 5: Track Progress and Build Confidence",
    body: "Your dashboard shows cost-per-wear, style scores, outfit variety, and wardrobe utilization. Earn badges for consistency. Stop second-guessing and start showing up dressed right every day.",
  },
];

const AIFashionEditorial = () => (
  <section className="py-16 md:py-28 bg-background" aria-labelledby="ai-fashion-editorial-heading">
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="text-center mb-14"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-border/30 bg-card/40 px-3 py-1.5 backdrop-blur-md mb-6">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Deep Dive
          </span>
        </div>
        <h2
          id="ai-fashion-editorial-heading"
          className="font-display text-3xl md:text-5xl font-bold text-foreground tracking-tight mb-4"
        >
          How AI Fashion Styling Actually Works
        </h2>
        <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Here's how LEXOR® turns your closet into a personal AI fashion stylist — step by step, no fashion degree required.
        </p>
      </motion.div>

      <div className="space-y-10 md:space-y-14">
        {steps.map((step, i) => (
          <motion.article
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="relative pl-12 md:pl-16"
          >
            {i < steps.length - 1 && (
              <div className="absolute left-[18px] md:left-[22px] top-12 bottom-[-2.5rem] md:bottom-[-3.5rem] w-px bg-border/30" />
            )}

            <div className="absolute left-0 top-0 flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-xl border border-border/20 bg-card/50 backdrop-blur-sm">
              <step.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>

            <h3 className="font-display text-lg md:text-xl font-semibold text-foreground mb-2 tracking-tight">
              {step.title}
            </h3>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              {step.body}
            </p>
          </motion.article>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="mt-14 md:mt-20 border-t border-border/20 pt-10"
      >
        <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground mb-4 tracking-tight">
          Why AI-Powered Fashion Styling Matters
        </h3>
        <div className="space-y-4 text-sm md:text-base text-muted-foreground leading-relaxed">
          <p>
            The average person spends 20 minutes every morning deciding what to wear — and still feels unsure. Over a year, that's 120+ hours lost. AI styling fixes this by processing your entire wardrobe, the day's weather, your schedule, and current trends in under a second.
          </p>
          <p>
            LEXOR® uses machine learning that improves with every interaction. The more you use it, the better it understands your taste — fabrics, colors, occasion-specific dress codes. It's not replacing your style. It's making it sharper.
          </p>
          <p>
            Whether you're a busy professional, a fashion enthusiast maximizing a curated closet, or someone rebuilding confidence through better self-presentation — AI styling adapts to you.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AIFashionEditorial;
