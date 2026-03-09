import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Fashion Blogger",
    quote: "AURELIA completely changed how I approach my wardrobe. I save 20 minutes every morning.",
    avatar: "https://i.pravatar.cc/80?img=5",
  },
  {
    name: "Marcus Johnson",
    role: "Creative Director",
    quote: "The AI understands my style better than I do. Every suggestion feels like it was curated just for me.",
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    name: "Elena Rodriguez",
    role: "Startup Founder",
    quote: "I went from style-confused to confident in two weeks. The color analysis was a game-changer.",
    avatar: "https://i.pravatar.cc/80?img=20",
  },
];

const Testimonials = () => (
  <section className="py-24 bg-background">
    <div className="max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Testimonials</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Loved by <span className="gold-text">Style Seekers</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="glass rounded-2xl p-6 premium-card"
          >
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="font-sans text-sm text-foreground leading-relaxed mb-6">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-sans text-sm font-semibold text-foreground">{t.name}</p>
                <p className="font-sans text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
