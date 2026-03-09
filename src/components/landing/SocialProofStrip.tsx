import { motion } from "framer-motion";
import NumberTicker from "@/components/ui/number-ticker";

const stats = [
  { value: 12000, suffix: "+", label: "Active Users" },
  { value: 2.4, suffix: "M", label: "Outfits Generated" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 45, suffix: "s", label: "Avg. Outfit Time" },
];

const SocialProofStrip = () => (
  <section className="py-12 border-y border-border bg-muted/30">
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <p className="font-display text-3xl md:text-4xl font-bold text-foreground">
              <NumberTicker value={stat.value} />
              <span className="text-primary">{stat.suffix}</span>
            </p>
            <p className="font-sans text-sm text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofStrip;
