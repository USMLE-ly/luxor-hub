import { useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  price: number;
  yearlyPrice?: number;
  description: string;
  features: string[];
  popular?: boolean;
  color: string;
}

function CreativePricing({
  tag = "Simple Pricing",
  title = "Choose Your Plan",
  description = "From essential styling to elite personal service",
  tiers,
}: {
  tag?: string;
  title?: string;
  description?: string;
  tiers: PricingTier[];
}) {
  const [yearly, setYearly] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <motion.span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/[0.08] border border-primary/20 text-sm font-sans font-semibold text-primary tracking-wide"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {tag}
        </motion.span>

        <motion.h2
          className="font-display text-4xl md:text-5xl font-bold text-foreground"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h2>

        <motion.p
          className="font-sans text-lg text-muted-foreground max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          {description}
        </motion.p>

        {/* Monthly / Yearly toggle */}
        <motion.div
          className="flex items-center justify-center gap-3 pt-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <span className={cn("text-sm font-sans transition-colors", !yearly ? "text-foreground font-semibold" : "text-muted-foreground")}>
            Monthly
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className={cn(
              "relative w-12 h-6 rounded-full border transition-colors duration-300",
              yearly ? "bg-primary border-primary" : "bg-muted border-border"
            )}
          >
            <motion.div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-primary-foreground shadow-sm"
              animate={{ left: yearly ? "calc(100% - 1.375rem)" : "0.125rem" }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={cn("text-sm font-sans transition-colors", yearly ? "text-foreground font-semibold" : "text-muted-foreground")}>
            Yearly
          </span>
          {yearly && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-1 text-xs font-sans font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
            >
              Save 20%
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {tiers.map((tier, index) => {
          const isPopular = tier.popular;
          const displayPrice = yearly && tier.yearlyPrice ? tier.yearlyPrice : tier.price;

          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn("relative group", isPopular && "md:-mt-4 md:mb-4")}
            >
              {/* Gold glow border for popular */}
              {isPopular && (
                <div className="absolute -inset-[1px] rounded-[1.5rem] bg-gradient-to-br from-primary/60 via-primary/20 to-primary/60 opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]" />
              )}

              <div
                className={cn(
                  "relative rounded-[1.5rem] overflow-hidden transition-all duration-500",
                  "bg-card/60 backdrop-blur-xl border",
                  isPopular
                    ? "border-primary/30 shadow-[0_0_40px_-8px_hsl(var(--primary)/0.2)]"
                    : "border-border hover:border-primary/20",
                  "group-hover:shadow-[0_12px_40px_-12px_hsl(var(--primary)/0.15)]"
                )}
              >
                {/* Popular badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}

                <div className="p-8">
                  {/* Popular label */}
                  {isPopular && (
                    <span className="inline-block text-xs font-sans font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
                      Most Popular
                    </span>
                  )}

                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                      "bg-primary/10 text-primary group-hover:bg-primary/20"
                    )}>
                      {tier.icon}
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {tier.name}
                    </h3>
                  </div>
                  <p className="font-sans text-sm text-muted-foreground mb-6">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-5xl font-bold text-foreground">
                        ${displayPrice}
                      </span>
                      <span className="text-sm font-sans text-muted-foreground">
                        /{yearly ? "yr" : "mo"}
                      </span>
                    </div>
                    {yearly && tier.yearlyPrice && (
                      <p className="text-xs font-sans text-muted-foreground mt-1">
                        ${Math.round(tier.yearlyPrice / 12)}/mo billed annually
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                          isPopular ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="font-sans text-sm text-foreground/80">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => navigate("/auth")}
                    className={cn(
                      "w-full h-12 rounded-xl font-sans font-semibold text-sm tracking-wide transition-all duration-300",
                      isPopular
                        ? "gold-gradient text-primary-foreground hover:opacity-90 shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.4)]"
                        : "bg-muted/80 text-foreground border border-border hover:border-primary/30 hover:bg-primary/5"
                    )}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export { CreativePricing };
export type { PricingTier };
