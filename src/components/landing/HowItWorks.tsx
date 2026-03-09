import { motion } from "framer-motion";
import { Camera, Cpu, Shirt } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Scan Your Closet",
    description: "Snap photos of your clothes. Our AI identifies each item, color, and fabric instantly.",
  },
  {
    icon: Cpu,
    title: "AI Analyzes Your Style",
    description: "AURELIA learns your preferences, body shape, and lifestyle to build your unique Style DNA.",
  },
  {
    icon: Shirt,
    title: "Get Daily Outfits",
    description: "Receive personalized outfit suggestions each morning — weather-aware and occasion-ready.",
  },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 bg-background">
    <div className="max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">How It Works</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Three Steps to <span className="gold-text">Effortless Style</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative glass rounded-2xl p-8 text-center hover-lift premium-card"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-xs font-bold text-primary-foreground font-sans">
              {i + 1}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <step.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">{step.title}</h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
