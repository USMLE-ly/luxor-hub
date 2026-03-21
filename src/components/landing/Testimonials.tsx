import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "LEXOR® completely changed how I get dressed. I save 20 minutes every morning and actually feel confident walking out the door.",
    name: "Sarah M.",
    role: "Marketing Director",
  },
  {
    quote: "The AI understands my style better than I do. Every outfit suggestion just works — colors, fit, occasion. It's like having a personal stylist on call.",
    name: "James L.",
    role: "Creative Lead",
  },
  {
    quote: "I used to waste money on clothes I never wore. Now every purchase is intentional and my wardrobe actually makes sense together.",
    name: "Amara K.",
    role: "Entrepreneur",
  },
];

const Testimonials = () => (
  <section className="py-20 md:py-28 bg-background relative overflow-hidden" id="testimonials">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.04),transparent_60%)]" />

    <div className="relative z-10 max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-14"
      >
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Testimonials</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Loved by <span className="gold-text">Style-Conscious</span> People
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative group"
          >
            {/* Gold accent border */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/20 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative glass rounded-2xl p-6 md:p-8 backdrop-blur-xl bg-background/40 border border-border/50 h-full flex flex-col">
              <Quote className="w-5 h-5 text-primary/40 mb-4 shrink-0" />
              <p className="font-sans text-sm text-muted-foreground leading-relaxed flex-1">
                "{t.quote}"
              </p>
              <div className="mt-6 pt-4 border-t border-border/30">
                <p className="font-display text-sm font-semibold text-foreground">{t.name}</p>
                <p className="font-sans text-xs text-muted-foreground/70">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
