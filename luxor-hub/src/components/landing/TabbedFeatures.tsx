import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Check } from "@phosphor-icons/react";

const featureOutfitGen = "/images/recommendation-demo.jpg";

const bullets = [
  "A complete outfit waiting when you wake up",
  "Weather and calendar already factored in",
  "Built entirely from your own closet",
  "Learns what you like \u2014 gets smarter daily",
];

const TabbedFeatures = () => (
  <section id="tabbed-features" className="bg-background py-16 md:py-24">
    <div className="max-w-4xl mx-auto px-4">

      <ScrollReveal direction="up">
        <div className="relative rounded-2xl overflow-hidden mb-10">
          <img
            src={featureOutfitGen}
            alt="Three elegant outfits on mannequins styled by LUXOR AI"
            className="w-full h-auto object-cover rounded-2xl"
            draggable={false}
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background/70 via-background/30 to-transparent rounded-b-2xl pointer-events-none" />
        </div>
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.15}>
        <ul className="space-y-3 max-w-2xl mx-auto">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 font-sans text-sm text-muted-foreground">
              <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </div>
  </section>
);

export default TabbedFeatures;
