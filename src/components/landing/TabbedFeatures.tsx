import { Check } from "lucide-react";
import { ContainerTextScroll } from "@/components/ui/container-text-scroll";
import featureOutfitGen from "@/assets/feature-outfit-gen.jpg";

const bullets = [
  "A complete outfit waiting when you wake up",
  "Weather and calendar already factored in",
  "Built entirely from your own closet",
  "Learns what you like — gets smarter daily",
];

const TabbedFeatures = () => (
  <section id="tabbed-features" className="bg-background">
    <ContainerTextScroll
      titleComponent={null}
    >
      <div className="relative h-full w-full">
        <img
          src={featureOutfitGen}
          alt="Three elegant outfits on mannequins styled by LEXOR AI"
          className="mx-auto rounded-2xl object-cover h-full w-full object-center"
          draggable={false}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background via-background/60 to-transparent rounded-b-2xl pointer-events-none" />
      </div>
    </ContainerTextScroll>

    {/* Bullets below the scroll card */}
    <div className="max-w-2xl mx-auto px-4 -mt-20 md:-mt-32 pb-16 md:pb-24">
      <p className="font-sans text-xs font-semibold text-primary tracking-widest uppercase mb-3">
        Your Morning With LEXOR®
      </p>
      <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-6">
        Open the app. Your outfit is ready.
      </h3>
      <ul className="space-y-3">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 font-sans text-sm text-muted-foreground">
            <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TabbedFeatures;
