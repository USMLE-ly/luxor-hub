import { Button } from "@/components/ui/button";
import { Check, Pencil, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

function CreativePricing({
  tag = "Simple Pricing",
  title = "Make Short Videos That Pop",
  description = "Edit, enhance, and go viral in minutes",
  tiers,
}: {
  tag?: string;
  title?: string;
  description?: string;
  tiers: PricingTier[];
}) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center space-y-6 mb-16">
        <div className="font-display text-xl text-primary rotate-[-1deg]">
          {tag}
        </div>
        <div className="relative">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground rotate-[-1deg]">
            {title}
            <div className="absolute -right-12 top-0 text-primary rotate-12">
              ✨
            </div>
            <div className="absolute -left-8 bottom-0 text-primary -rotate-12">
              ⭐️
            </div>
          </h2>
          <div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-44 h-3 bg-primary/20 
            rotate-[-1deg] rounded-full blur-sm"
          />
        </div>
        <p className="font-sans text-xl text-muted-foreground rotate-[-1deg]">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={cn(
              "relative group",
              "transition-all duration-300",
              index === 0 && "rotate-[-1deg]",
              index === 1 && "rotate-[1deg]",
              index === 2 && "rotate-[-2deg]"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-card",
                "border-2 border-foreground",
                "rounded-lg shadow-[4px_4px_0px_0px] shadow-foreground",
                "transition-all duration-300",
                "group-hover:shadow-[8px_8px_0px_0px]",
                "group-hover:translate-x-[-4px]",
                "group-hover:translate-y-[-4px]"
              )}
            />

            <div className="relative p-6">
              {tier.popular && (
                <div
                  className="absolute -top-2 -right-2 bg-primary text-primary-foreground 
                  font-display px-3 py-1 rounded-full rotate-12 text-sm border-2 border-foreground"
                >
                  Popular!
                </div>
              )}

              <div className="mb-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full mb-4",
                    "flex items-center justify-center",
                    "border-2 border-foreground",
                    "text-primary"
                  )}
                >
                  {tier.icon}
                </div>
                <h3 className="font-display text-2xl text-foreground">
                  {tier.name}
                </h3>
                <p className="font-sans text-muted-foreground">
                  {tier.description}
                </p>
              </div>

              <div className="mb-6 font-display">
                <span className="text-4xl font-bold text-foreground">
                  ${tier.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <div className="space-y-3 mb-6">
                {tier.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-foreground 
                      flex items-center justify-center"
                    >
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="font-sans text-lg text-foreground">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                className={cn(
                  "w-full h-12 font-display text-lg relative",
                  "border-2 border-foreground",
                  "transition-all duration-300",
                  "shadow-[4px_4px_0px_0px] shadow-foreground",
                  "hover:shadow-[6px_6px_0px_0px]",
                  "hover:translate-x-[-2px] hover:translate-y-[-2px]",
                  tier.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                Get Started
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };
