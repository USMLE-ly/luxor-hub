import { motion } from "framer-motion";
import { Plus, Minus, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/ui/animated-text-reveal";

const faqs = [
  {
    q: "How does AURELIA's AI analyze my style?",
    a: "Our Style DNA engine uses computer vision and machine learning to analyze your wardrobe photos, body proportions, color palette preferences, and lifestyle data. It builds a unique style profile that evolves as your taste changes."
  },
  {
    q: "Can I use it with my existing wardrobe?",
    a: "Absolutely. Upload photos of your current clothing and AURELIA's AI will catalog every item — detecting category, color, fabric, season, and occasion. Outfits are generated from what you already own."
  },
  {
    q: "Is my data private and secure?",
    a: "Yes. Your photos and style data are encrypted end-to-end. We never share your personal information with third parties. You can delete your data at any time from your account settings."
  },
  {
    q: "What makes this different from other styling apps?",
    a: "AURELIA combines AI outfit generation, wardrobe analytics, virtual try-on, and community features in one platform. Our Style DNA engine goes beyond simple recommendations — it understands your aesthetic identity."
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel at any time with no penalties. Your data remains accessible for 30 days after cancellation. Downgrade to the free tier to keep basic access."
  },
  {
    q: "Does it work for all body types and styles?",
    a: "AURELIA is designed for every body type, gender expression, and personal style. Our AI is trained on diverse datasets and adapts recommendations to your unique proportions and preferences."
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  return (
    <section className="relative py-28 px-4 overflow-hidden" id="faq">
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url('/patterns/linear-texture.svg')`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary font-sans font-semibold text-sm tracking-widest uppercase mb-4">FAQ</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            <TextReveal mode="word" as="span">Common</TextReveal>{" "}
            <TextReveal mode="blur" as="span" delay={1} className="gold-text">Questions</TextReveal>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className={cn(
                    "w-full text-left rounded-xl px-6 py-5 transition-all duration-300 border",
                    "bg-card/60 backdrop-blur-md",
                    isOpen
                      ? "border-primary/30 shadow-[0_0_20px_-6px_hsl(var(--primary)/0.15)]"
                      : "border-border hover:border-primary/20"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className={cn(
                      "font-sans text-sm md:text-base font-medium transition-colors",
                      isOpen ? "text-foreground" : "text-foreground/80"
                    )}>
                      {faq.q}
                    </span>
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
                      isOpen ? "bg-primary/20 text-primary rotate-0" : "bg-muted text-muted-foreground"
                    )}>
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-sm font-sans text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-sm text-muted-foreground font-sans mb-4">Still have questions?</p>
          <button
            onClick={() => navigate("/auth")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-sans font-semibold text-sm text-primary border border-primary/30 hover:bg-primary/5 transition-all duration-300"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with AI Stylist
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
