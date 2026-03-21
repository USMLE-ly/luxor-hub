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
    a: "Upload wardrobe photos and a selfie. LEXOR® maps your body, color season, and taste into a Style DNA profile that sharpens with use.",
  },
  {
    q: "Is my data private?",
    a: "End-to-end encrypted. Never shared. Export or delete anytime from settings.",
  },
  {
    q: "What if it doesn't work for me?",
    a: "30-day money-back guarantee. Full refund, no questions.",
  },
  {
    q: "What body types does it support?",
    a: "All of them. AI adapts to your specific measurements, not a generic mannequin.",
  },
  {
    q: "Does it work with my existing wardrobe?",
    a: "That's the point. LEXOR® creates new combinations from what you own before recommending anything new.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Two clicks. No penalties. Data stays accessible for 30 days.",
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
