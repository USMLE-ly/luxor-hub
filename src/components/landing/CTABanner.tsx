import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTABanner = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 md:py-24 bg-muted/30">
      <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Ready to Look Incredible?
          </h2>
          <p className="font-sans text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-6">
            Your spot is waiting.
          </p>
          <motion.div className="flex justify-center">
            <Button
              size="lg"
              className="text-base px-8 group"
              onClick={() => navigate("/auth")}
            >
              Join LEXOR® Now
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          <p className="mt-4 font-sans text-xs text-muted-foreground">
            Start free — upgrade anytime.
          </p>
          <p className="mt-2 font-sans text-xs text-muted-foreground">
            30-day money-back guarantee. Zero risk.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABanner;
