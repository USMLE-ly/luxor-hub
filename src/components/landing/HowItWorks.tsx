import { motion } from "framer-motion";
import { Camera, User, Wand2, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Scan Your Closet",
    description: "Upload photos of your clothing items. Our AI instantly categorizes, tags, and analyzes each piece.",
    step: "01",
  },
  {
    icon: User,
    title: "Build Your Profile",
    description: "Answer a quick style quiz. We'll create your unique Style DNA — your fashion fingerprint.",
    step: "02",
  },
  {
    icon: Wand2,
    title: "Get AI Outfits",
    description: "Receive daily outfit recommendations tailored to your style, weather, calendar, and mood.",
    step: "03",
  },
  {
    icon: TrendingUp,
    title: "Optimize & Grow",
    description: "Track wear frequency, discover underused gems, and evolve your style with data-driven insights.",
    step: "04",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const HowItWorks = () => {
  return (
    <section className="py-32 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">How It Works</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Four Steps to <span className="gold-text">Effortless Style</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {steps.map((step) => (
            <motion.div
              key={step.step}
              variants={itemVariants}
              className="glass rounded-2xl p-6 group hover:gold-glow transition-all duration-500 hover:-translate-y-1"
            >
              <span className="text-5xl font-display font-bold text-muted/40 group-hover:text-primary/30 transition-colors">
                {step.step}
              </span>
              <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center mt-4 mb-4 group-hover:scale-110 transition-transform duration-300">
                <step.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
