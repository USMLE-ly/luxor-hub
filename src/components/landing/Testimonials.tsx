import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Fashion Blogger",
    quote: "AURELIA completely changed how I approach my wardrobe. I save 20 minutes every morning and feel more confident than ever.",
    rating: 5,
    avatar: "https://i.pravatar.cc/80?img=5",
  },
  {
    name: "Marcus Johnson",
    role: "Creative Director",
    quote: "The AI understands my style better than I do. Every suggestion feels like it was curated just for me. Worth every penny.",
    rating: 5,
    avatar: "https://i.pravatar.cc/80?img=12",
  },
  {
    name: "Elena Rodriguez",
    role: "Startup Founder",
    quote: "I went from style-confused to confident in two weeks. The color analysis was a game-changer for my professional image.",
    rating: 5,
    avatar: "https://i.pravatar.cc/80?img=20",
  },
  {
    name: "James Park",
    role: "Photographer",
    quote: "As someone who works in visuals, AURELIA's eye for color and composition is impressive. It's like having a stylist on call 24/7.",
    rating: 5,
    avatar: "https://i.pravatar.cc/80?img=33",
  },
  {
    name: "Amara Osei",
    role: "Marketing VP",
    quote: "The capsule wardrobe feature alone paid for itself. I've reduced my shopping by 60% while looking better than ever.",
    rating: 5,
    avatar: "https://i.pravatar.cc/80?img=25",
  },
  {
    name: "Liam Foster",
    role: "Tech Entrepreneur",
    quote: "Finally, a fashion app that gets men's style right. The outfit suggestions are practical, modern, and always on point.",
    rating: 5,
    avatar: "https://i.pravatar.cc/80?img=60",
  },
];

const Testimonials = () => (
  <section className="relative py-24 overflow-hidden" id="testimonials">
    {/* Animated gradient background */}
    <AnimatedGradientBackground
      Breathing={true}
      animationSpeed={0.015}
      breathingRange={8}
      startingGap={130}
      topOffset={20}
      gradientColors={[
        "hsl(240 10% 6%)",
        "hsl(43 74% 15%)",
        "hsl(43 60% 20%)",
        "hsl(30 40% 12%)",
        "hsl(43 74% 10%)",
        "hsl(240 10% 8%)",
        "hsl(240 10% 6%)",
      ]}
      gradientStops={[0, 30, 45, 55, 70, 85, 100]}
      containerClassName="rounded-none"
    />

    <div className="relative z-10 max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">
          Success Stories
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Loved by <span className="gold-text">Style Seekers</span>
        </h2>
        <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
          Join thousands who transformed their style with AURELIA's AI-powered fashion intelligence.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass rounded-2xl p-6 premium-card group relative"
          >
            <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
            
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>

            <p className="font-sans text-sm text-foreground leading-relaxed mb-6">
              "{t.quote}"
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-border/50">
              <img
                src={t.avatar}
                alt={t.name}
                className="w-10 h-10 rounded-full ring-2 ring-primary/20"
                loading="lazy"
              />
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
