import { motion } from "framer-motion";
import { Sunrise, Palette, PiggyBank, CalendarCheck, BarChart3, Camera } from "lucide-react";

const features = [
  { icon: Sunrise, title: "End Morning Panic", desc: "AI picks your outfit before you wake up. Weather, schedule, and yesterday's shirt — already factored in." },
  { icon: Palette, title: "Know Your Best Colors", desc: "Science-backed color analysis maps the exact shades that make your skin glow." },
  { icon: PiggyBank, title: "Stop Wasting Money", desc: "See what you actually need before buying. Every recommendation fills a real gap." },
  { icon: CalendarCheck, title: "Dress for Any Event", desc: "Date night, interview, casual Friday — handled. Plan your week on Sunday." },
  { icon: BarChart3, title: "Track What Works", desc: "Cost-per-wear analytics show your smartest buys and forgotten pieces." },
  { icon: Camera, title: "Your Closet, Digitized", desc: "Snap photos. AI tags color, brand, and fabric in seconds." },
];

const Features = () => (
  <section id="features" className="py-16 md:py-24 bg-muted/20">
    <div className="max-w-5xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="text-center mb-14"
      >
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Six Problems. <span className="gold-text">Solved.</span>
        </h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.07, duration: 0.5 }}
            className="rounded-xl border border-border bg-card p-6 space-y-3 hover:border-foreground/20 transition-colors"
          >
            <f.icon className="w-6 h-6 text-foreground" />
            <h3 className="font-display text-lg font-bold text-foreground">{f.title}</h3>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
