import { motion } from "framer-motion";

const CTABanner = () => {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #060f0d 0%, #0c2420 30%, #10352a 50%, #0c2420 70%, #060f0d 100%)" }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(232,200,122,0.06) 0%, transparent 65%)" }} />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              background: `rgba(232,200,122,${0.08 + Math.random() * 0.12})`,
              animation: `cta-float ${6 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * -10}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h2
            className="font-display text-3xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Your Closet Costs You Money Every Day You Wait
          </motion.h2>

          <motion.div
            className="w-10 h-px mx-auto mb-4"
            style={{ backgroundColor: "rgba(232,200,122,0.3)" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.6 }}
          />

          <motion.p
            className="font-sans text-base md:text-lg max-w-xl mx-auto mb-8"
            style={{ color: "rgba(232,200,122,0.5)" }}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Free to start. Results in 3 minutes. Cancel anytime.
          </motion.p>

          <motion.p
            className="font-sans text-xs"
            style={{ color: "rgba(232,200,122,0.25)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.5 }}
          >
            30-day money-back guarantee. Zero risk.
          </motion.p>
        </motion.div>
      </div>

      <style>{`
        @keyframes cta-float {
          0%, 100% { transform: translateY(0); opacity: 0.2; }
          50% { transform: translateY(-12px); opacity: 0.5; }
        }
      `}</style>
    </section>
  );
};

export default CTABanner;
