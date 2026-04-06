import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "I don't have time for this.",
    a: "Setup takes 3 minutes. Photograph your closet, upload a selfie, done. Your outfit is ready before you wake up.",
  },
  {
    q: "What if the AI gets it wrong?",
    a: "30-day money-back guarantee, no questions. The AI learns from every thumbs-up or swap. Most users see accurate picks within a week.",
  },
  {
    q: "Is my data safe?",
    a: "End-to-end encrypted. Never shared. Export or delete anytime in settings.",
  },
  {
    q: "Does it work for my body type?",
    a: "All of them. The AI uses your measurements — not a generic mannequin. It adjusts cuts, proportions, and color placement for you.",
  },
  {
    q: "I already know how to dress.",
    a: "Even stylists use data. LEXOR® finds combinations you'd miss by cross-referencing weather, your calendar, and pieces buried in your closet.",
  },
  {
    q: "Can I cancel?",
    a: "Yes. Two clicks in settings. No penalties. Your data stays accessible for 30 days after.",
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
        <p className="font-sans text-sm font-semibold text-muted-foreground tracking-widest uppercase mb-3">FAQ</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
          Still on the Fence?
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <Accordion type="single" collapsible className="space-y-0">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="border-b border-border px-0 rounded-none"
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
