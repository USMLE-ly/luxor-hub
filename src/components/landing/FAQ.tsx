import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How does the AI learn my style?",
    a: "AURELIA analyzes your wardrobe photos, selfies, and style preferences to build a unique Style DNA profile. The more you interact, the smarter it gets.",
  },
  {
    q: "Is my data private and secure?",
    a: "Absolutely. Your photos and style data are encrypted and never shared. We use enterprise-grade security and you can delete your data anytime.",
  },
  {
    q: "Can I try AURELIA before committing?",
    a: "Yes! Every plan includes a 7-day free trial so you can experience the full power of AURELIA. After that, choose the plan that fits your style journey.",
  },
  {
    q: "What body types does the AI support?",
    a: "AURELIA supports all body types and sizes. Our inclusive AI is trained on diverse body shapes to provide flattering suggestions for everyone.",
  },
  {
    q: "Does it work with my existing wardrobe?",
    a: "That's the whole point! Scan what you already own, and AURELIA creates new outfits from your existing pieces before recommending anything new.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time with no penalties. Your data remains accessible for 30 days after cancellation.",
  },
];

const FAQ = () => (
  <section id="faq" className="py-12 md:py-20 bg-background">
    <div className="max-w-3xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="text-center mb-12"
      >
        <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">FAQ</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Common <span className="gold-text">Questions</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="glass rounded-xl px-6 border-none premium-card data-[state=open]:border-l-2 data-[state=open]:border-l-primary/60 transition-all duration-200"
            >
              <AccordionTrigger className="font-sans text-sm font-semibold text-foreground hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="font-sans text-sm text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  </section>
);

export default FAQ;
