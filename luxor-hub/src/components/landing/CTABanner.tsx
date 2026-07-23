import { motion } from "framer-motion";
import {ArrowRight} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
const timelessBg = "/images/feature-demo.jpg";

const CTABanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 md:py-24 bg-muted/30 overflow-hidden">
      <img
        src={timelessBg}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover opacity-[0.04] pointer-events-none select-none"
      />
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h2 
            className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Your Closet Costs You Money Every Day You Wait
          </motion.h2>
          <motion.p 
            className="font-sans text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-6"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            Free to start. Results in 3 minutes. Cancel anytime.
          </motion.p>
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45, duration: 0.5, type: "spring", stiffness: 200, damping: 18 }}
          >
            <Button
              size="lg"
              className="text-base px-8 group"
              onClick={() => navigate("/auth")}
            >
              Try Free — No Card Needed
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          <motion.p 
            className="mt-4 font-sans text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            30-day money-back guarantee. Zero risk.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
