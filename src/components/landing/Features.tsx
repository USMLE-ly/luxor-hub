import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Sunrise, Palette, PiggyBank, CalendarCheck, BarChart3, Camera, Play, X } from "lucide-react";
import heroVideo from "@/assets/hero-video.mp4";

const features = [
  { icon: Sunrise, title: "End Morning Panic", desc: "AI picks your outfit before you wake up. Weather, schedule, and yesterday's shirt — already factored in." },
  { icon: Palette, title: "Know Your Best Colors", desc: "Science-backed color analysis maps the exact shades that make your skin glow." },
  { icon: PiggyBank, title: "Stop Wasting Money", desc: "See what you actually need before buying. Every recommendation fills a real gap." },
  { icon: CalendarCheck, title: "Dress for Any Event", desc: "Date night, interview, casual Friday — handled. Plan your week on Sunday." },
  { icon: BarChart3, title: "Track What Works", desc: "Cost-per-wear analytics show your smartest buys and forgotten pieces." },
  { icon: Camera, title: "Your Closet, Digitized", desc: "Snap photos. AI tags color, brand, and fabric in seconds." },
];

const Features = () => {
  const [videoOpen, setVideoOpen] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section id="features" className="py-16 md:py-24 bg-muted/20" ref={sectionRef}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Side Panel Video + Header */}
        <div className="mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            className="text-center mb-8"
          >
            <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Features</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
              Everything You Need.{" "}
              <span className="gold-text">One App.</span>
            </h2>
          </motion.div>

          {/* Side Panel Video */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative max-w-4xl mx-auto"
          >
            <div
              className={`relative rounded-2xl border border-border overflow-hidden transition-all duration-500 ${
                videoOpen ? "bg-background shadow-2xl" : "bg-card cursor-pointer hover:border-foreground/20 hover:shadow-lg"
              }`}
            >
              {/* Collapsed state — teaser bar */}
              {!videoOpen && (
                <button
                  onClick={() => setVideoOpen(true)}
                  className="w-full flex items-center justify-between p-5 md:p-6 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Play className="w-4 h-4 md:w-5 md:h-5 text-primary ml-0.5" />
                    </div>
                    <div className="text-left">
                      <p className="font-display text-sm md:text-base font-semibold text-foreground">See LEXOR® in Action</p>
                      <p className="font-sans text-xs text-muted-foreground">Watch how it works — 30 seconds</p>
                    </div>
                  </div>
                  <span className="font-sans text-xs text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block">
                    Click to watch →
                  </span>
                </button>
              )}

              {/* Expanded state — video player */}
              <AnimatePresence>
                {videoOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  >
                    <div className="flex items-center justify-between p-4 md:p-5 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Play className="w-3 h-3 text-primary ml-0.5" />
                        </div>
                        <p className="font-display text-sm font-semibold text-foreground">LEXOR® Product Demo</p>
                      </div>
                      <button
                        onClick={() => setVideoOpen(false)}
                        className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                      >
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                    </div>
                    <div className="p-3 md:p-6">
                      <video
                        className="w-full rounded-xl"
                        src={heroVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Feature cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              className="group rounded-xl border border-border bg-card p-6 space-y-3 hover:border-foreground/20 hover:shadow-lg transition-all duration-300"
              whileHover={{ y: -4 }}
            >
              <f.icon className="w-6 h-6 text-foreground icon-shimmer-hover" />
              <h3 className="font-display text-lg font-bold text-foreground">{f.title}</h3>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
