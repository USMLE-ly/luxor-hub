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
      titleComponent={
        <>
          <h2 className="text-3xl md:text-5xl font-bold font-display leading-tight drop-shadow-lg">
            Your Morning With
            <br />
            <span className="text-5xl md:text-[6rem] font-bold mt-1 leading-none gold-text">
              LEXOR®
            </span>
          </h2>
        </>
      }
    >
      <img
        src={featureOutfitGen}
        alt="Three elegant outfits on mannequins styled by LEXOR AI"
        className="mx-auto rounded-2xl object-cover h-full w-full object-center"
        draggable={false}
      />
    </ContainerTextScroll>

    {/* Bullets below the scroll card */}
    <div className="max-w-2xl mx-auto px-4 -mt-32 md:-mt-48 pb-16 md:pb-24">
      <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-4">
        Your Morning With LEXOR®
      </p>
      <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground leading-tight mb-5">
        Open the app. Your outfit is ready.
      </h3>
      <ul className="space-y-3">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 font-sans text-sm text-muted-foreground">
            <Check className="w-4 h-4 mt-0.5 text-foreground shrink-0" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default TabbedFeatures;
