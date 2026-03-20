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
    a: "You upload wardrobe photos and a selfie. AURELIA maps your body proportions, color season, and aesthetic preferences into a Style DNA profile. The more you use it, the sharper it gets. Most users say it 'clicks' within the first week.",
  },
  {
    q: "Is my data private and secure?",
    a: "Your photos and style data are encrypted end-to-end and never shared with third parties. We use enterprise-grade security. You can export or delete all your data at any time from your settings.",
  },
  {
    q: "What if it doesn't work for me?",
    a: "Every plan comes with a 30-day money-back guarantee. If AURELIA doesn't change how you get dressed, we'll refund every penny. No questions, no hoops.",
  },
  {
    q: "What body types does the AI support?",
    a: "All of them. AURELIA's AI is trained on diverse body shapes, sizes, and proportions. The styling suggestions adapt to your specific measurements, not a generic mannequin.",
  },
  {
    q: "Does it work with my existing wardrobe?",
    a: "That's the whole point. Scan what you already own. AURELIA creates new outfit combinations from your existing pieces before recommending anything new. Most users discover 30+ outfits they never considered.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings with two clicks. No penalties, no retention tricks. Your data stays accessible for 30 days after cancellation.",
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
