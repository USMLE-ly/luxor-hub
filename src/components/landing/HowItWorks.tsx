import { motion } from "framer-motion";
import { Camera, User, Wand2, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from "recharts";

const steps = [
  { icon: Camera, title: "Scan Closet", desc: "Upload photos and let AI catalog every item in seconds.", score: 25, fill: "hsl(43, 74%, 49%)" },
  { icon: User, title: "Style DNA", desc: "We build a unique profile of your taste, lifestyle, and goals.", score: 50, fill: "hsl(43, 74%, 55%)" },
  { icon: Wand2, title: "AI Outfits", desc: "Get context-aware outfits generated from your own wardrobe.", score: 80, fill: "hsl(43, 74%, 60%)" },
  { icon: TrendingUp, title: "Optimize", desc: "Track insights, improve your score, and refine your look.", score: 95, fill: "hsl(43, 74%, 65%)" },
];

const areaData = steps.map((s, i) => ({ name: s.title, score: s.score, step: i + 1 }));

/* Thin decorative gold divider — PDF-inspired */
const GoldDivider = () => (
  <div className="flex items-center gap-4 my-10 max-w-xs mx-auto">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-primary/40" />
    <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-primary/40" />
  </div>
);

const HowItWorks = () => {
  return (
    <section className="relative py-32 px-4 overflow-hidden" id="how-it-works">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/patterns/linear-texture.svg')`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">How It Works</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Four Steps to <span className="gold-text">Effortless Style</span>
          </h2>
        </motion.div>

        <GoldDivider />

        {/* Style progression area chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="glass rounded-2xl p-6 mb-10 border border-border"
        >
          <p className="text-xs text-muted-foreground font-sans uppercase tracking-wider mb-4">Style Score Progression</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(43, 74%, 49%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(43, 74%, 49%)"
                strokeWidth={3}
                fill="url(#goldGrad)"
                dot={{ r: 6, fill: "hsl(43, 74%, 49%)", stroke: "hsl(var(--background))", strokeWidth: 3 }}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Step cards — editorial numbering */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-5 border border-border flex flex-col items-center text-center group hover:-translate-y-1 transition-transform"
            >
              {/* Large editorial number */}
              <span className="font-serif text-5xl font-light text-primary/20 leading-none mb-2 select-none">
                0{i + 1}
              </span>

              <div className="relative w-20 h-20 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                    barSize={6} startAngle={90} endAngle={-270}
                    data={[{ value: step.score, fill: step.fill }]}
                  >
                    <RadialBar dataKey="value" background={{ fill: "hsl(var(--muted))" }} cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
              </div>

              <h3 className="font-display text-sm font-semibold text-foreground mt-1">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.desc}</p>
              <span className="text-lg font-bold text-primary mt-2">{step.score}%</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
