import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const GoldDivider = () => (
  <div className="flex items-center gap-4 my-10 max-w-xs mx-auto">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
  </div>
);

const testimonials = [
  {
    quote: "AURELIA transformed how I approach my wardrobe. The AI suggestions are eerily accurate — it's like having a personal stylist who knows me better than I know myself.",
    name: "Sophia Chen",
    title: "Creative Director",
    number: "01",
  },
  {
    quote: "I used to spend 30 minutes every morning deciding what to wear. Now it takes seconds. The outfit generator considers weather, my calendar, and my mood.",
    name: "Marcus Rivera",
    title: "Startup Founder",
    number: "02",
  },
  {
    quote: "The closet scanner alone is worth it. I discovered I had pieces that paired beautifully together — combinations I never would have tried on my own.",
    name: "Aisha Patel",
    title: "Fashion Editor",
    number: "03",
  },
];

const Testimonials = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden" id="testimonials">
      {/* SVG pattern background */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/patterns/linear-texture.svg')`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">
            Voices of Style
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            What Our <span className="gold-text">Members</span> Say
          </h2>
        </motion.div>

        <GoldDivider />

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="relative group"
            >
              {/* Large editorial number */}
              <span className="font-display text-7xl font-bold text-primary/10 absolute -top-6 -left-2 select-none pointer-events-none">
                {t.number}
              </span>

              <div className="relative glass rounded-2xl p-8 pt-10 border border-border hover:border-primary/30 transition-colors h-full flex flex-col">
                <Quote className="w-5 h-5 text-primary/40 mb-4" />

                <p className="text-sm leading-relaxed text-muted-foreground font-sans flex-1 italic">
                  "{t.quote}"
                </p>

                {/* Thin gold divider */}
                <div className="h-px w-12 bg-gradient-to-r from-primary/50 to-transparent my-6" />

                <div>
                  <p className="font-display text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground font-sans tracking-wide uppercase mt-0.5">
                    {t.title}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
