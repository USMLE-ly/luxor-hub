import { motion } from "framer-motion";
import { Sparkles, Camera, Brain, Sun, ShoppingBag, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Step 1: Digitize Your Wardrobe",
    body: "Start by photographing the clothes you already own. Our computer vision AI identifies each garment in seconds — detecting the category, dominant colors, fabric type, brand, and season. No manual tagging required. Within minutes your entire closet lives in one searchable, visual catalog on your phone.",
  },
  {
    icon: Brain,
    title: "Step 2: AI Learns Your Unique Style DNA",
    body: "LEXOR® doesn't use generic fashion rules. It builds a personal Style DNA profile based on your body measurements, skin-tone color season, lifestyle, and the outfits you actually wear. The algorithm maps your preferences across 40+ style dimensions — from silhouette proportions to pattern affinity — so every recommendation feels like you, not a mannequin.",
  },
  {
    icon: Sun,
    title: "Step 3: Wake Up to a Weather-Checked Outfit",
    body: "Each morning, the AI cross-references your wardrobe, local weather forecast, and calendar events to assemble a complete outfit. Running late for a meeting? It prioritizes business-appropriate pieces. Weekend brunch? It shifts to relaxed, trend-forward combinations. You approve, swap, or skip — and every interaction makes tomorrow's suggestion smarter.",
  },
  {
    icon: ShoppingBag,
    title: "Step 4: Shop Smarter With Wardrobe Gap Analysis",
    body: "Instead of impulse buys, LEXOR® identifies what's genuinely missing from your closet. The AI highlights gaps — a versatile neutral blazer, a transitional-weather layer, the right shade of denim — and recommends specific pieces that multiply outfit possibilities. Users report spending 35% less on clothing while wearing 60% more of what they own.",
  },
  {
    icon: BarChart3,
    title: "Step 5: Track Progress and Build Confidence",
    body: "Your dashboard shows cost-per-wear analytics, style scores, outfit variety metrics, and wardrobe utilization rates. Earn badges for consistency. Watch your confidence grow as you stop second-guessing and start showing up dressed exactly right — every single day.",
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
          Artificial intelligence is transforming the way people get dressed. Here's a step-by-step
          look at how LEXOR® turns your closet into a smart, personal fashion stylist — no fashion
          degree required.
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
            {/* Vertical connector line */}
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

      {/* Closing editorial paragraph for additional SEO word count */}
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
            The average person spends 20 minutes every morning deciding what to wear — and still
            feels unsure about the choice. Over a year, that's more than 120 hours lost to wardrobe
            indecision. AI fashion styling eliminates that friction by doing what human intuition
            can't: processing your entire wardrobe, the day's weather, your schedule, and current
            trends in under a second.
          </p>
          <p>
            Unlike generic style quizzes or static lookbooks, LEXOR® uses machine learning that
            improves with every interaction. The more you use it, the more precisely it understands
            your taste — right down to fabric preferences, color affinities, and occasion-specific
            dress codes. It's not replacing your style; it's amplifying it.
          </p>
          <p>
            Whether you're a busy professional who needs polished outfits without the effort, a
            fashion enthusiast looking to maximize a curated closet, or someone rebuilding their
            confidence through better self-presentation — AI fashion styling adapts to you. That's
            the promise of LEXOR®: look your best, waste nothing, and never overthink getting
            dressed again.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AIFashionEditorial;
