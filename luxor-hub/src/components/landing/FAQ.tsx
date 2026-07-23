import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, MagneticCard } from "@/components/ui/scroll-reveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "I don\'t have time for this.",
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
    a: "Even stylists use data. LUXOR finds combinations you\'d miss by cross-referencing weather, your calendar, and pieces buried in your closet.",
  },
  {
    q: "Can I cancel?",
    a: "Yes. Two clicks in settings. No penalties. Your data stays accessible for 30 days after.",
  },
];

const FAQ = () => (
  <section id="faq" className="relative py-16 md:py-28 overflow-hidden">
    {/* Premium dark background with subtle gold radial */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0d] via-[#0d1210] to-[#0a0f0d]" />
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(43,50%,8%,0.4)_0%,_transparent_60%)]" />
    {/* Subtle texture overlay */}
    <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSIjRThDODdBIi8+PC9zdmc+')]" />
    {/* Gold accent line */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E8C87A]/15 to-transparent" />

    <div className="relative z-10 max-w-3xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        className="text-center mb-14"
      >
        <p className="font-sans text-xs font-semibold text-[#E8C87A]/60 tracking-[0.25em] uppercase mb-4">
          FAQ
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
          Still on the Fence?
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <StaggerContainer staggerDelay={0.04}>
          <Accordion type="single" collapsible className="space-y-0">
            {faqs.map((faq, i) => (
              <StaggerItem key={i}>
                <MagneticCard>
                  <AccordionItem
                    value={`faq-${i}`}
                    className="border-b border-white/[0.06] px-0 rounded-none"
                  >
                    <AccordionTrigger className="font-sans text-sm font-semibold text-white/90 hover:text-[#E8C87A] hover:no-underline py-5 transition-colors duration-200">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="font-sans text-sm text-white/40 leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                </MagneticCard>
              </StaggerItem>
            ))}
          </Accordion>
        </StaggerContainer>
      </motion.div>
    </div>
  </section>
);

export default FAQ;
