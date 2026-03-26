import { motion } from "framer-motion";
import { Check } from "lucide-react";
import featureOutfitGen from "@/assets/feature-outfit-gen.jpg";

const bullets = [
  "A complete outfit waiting when you wake up",
  "Weather and calendar already factored in",
  "Built entirely from your own closet",
  "Learns what you like — gets smarter daily",
];

const TabbedFeatures = () => (
  <section id="tabbed-features" className="py-16 md:py-24 bg-background">
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <img
            src={featureOutfitGen}
            alt="LEXOR daily outfit generation screen"
            loading="lazy"
            width={600}
            height={600}
            className="rounded-xl border border-border w-full"
          />
        </motion.div>

        {/* Copy */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-5"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase">Your Morning With LEXOR®</p>
          <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight">
            Open the app. Your outfit is ready.
          </h2>
          <ul className="space-y-3">
            {bullets.map((b) => (
              <li key={b} className="flex items-start gap-3 font-sans text-sm text-muted-foreground">
                <Check className="w-4 h-4 mt-0.5 text-foreground shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  </section>
);

export default TabbedFeatures;
