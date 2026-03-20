import NumberFlow from '@number-flow/react';
import React from "react";
import { Check } from "lucide-react";

interface TierDetails {
  name: string;
  features: string[];
}

const tierDetails: TierDetails[] = [
  {
    name: "Starter",
    features: [
      "AI outfit suggestions (10/day)",
      "Basic color analysis",
      "Closet digitization (50 items)",
      "Weekly style tips",
    ],
  },
  {
    name: "Pro",
    features: [
      "Unlimited AI suggestions",
      "Full color & style DNA",
      "Unlimited closet items",
      "Weekly capsule wardrobes",
      "Virtual try-on",
      "Priority AI chat",
    ],
  },
  {
    name: "Elite",
    features: [
      "Everything in Pro",
      "1-on-1 stylist sessions",
      "Trend intelligence reports",
      "Exclusive fashion events",
      "Personal shopping concierge",
      "Early access to features",
    ],
  },
];

export function PricingInteraction({
  starterMonth,
  starterAnnual,
  proMonth,
  proAnnual,
  eliteMonth,
  eliteAnnual,
  onGetStarted,
  onTierChange,
  renderFooter,
}: {
  starterMonth: number;
  starterAnnual: number;
  proMonth: number;
  proAnnual: number;
  eliteMonth: number;
  eliteAnnual: number;
  onGetStarted?: () => void;
  onTierChange?: (tier: "starter" | "pro" | "elite") => void;
  renderFooter?: (activeTier: "starter" | "pro" | "elite") => React.ReactNode;
}) {
  const tierNames: ("starter" | "pro" | "elite")[] = ["starter", "pro", "elite"];
  const [active, setActive] = React.useState(1);
  const [period, setPeriod] = React.useState(0);
  const [starter, setStarter] = React.useState(starterMonth);
  const [pro, setPro] = React.useState(proMonth);
  const [elite, setElite] = React.useState(eliteMonth);

  const handleChangePeriod = (index: number) => {
    setPeriod(index);
    if (index === 0) {
      setStarter(starterMonth);
      setPro(proMonth);
      setElite(eliteMonth);
    } else {
      setStarter(starterAnnual);
      setPro(proAnnual);
      setElite(eliteAnnual);
    }
  };

  const savingsPercent = (monthly: number, annual: number) =>
    Math.round(((monthly - annual) / monthly) * 100);

  const tiers = [
    { name: "Starter", price: starter, monthPrice: starterMonth, annualPrice: starterAnnual, badge: null },
    { name: "Pro", price: pro, monthPrice: proMonth, annualPrice: proAnnual, badge: "Popular" },
    { name: "Elite", price: elite, monthPrice: eliteMonth, annualPrice: eliteAnnual, badge: null },
  ];

  const tierRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = React.useState<{ top: number; height: number }>({ top: 0, height: 0 });

  React.useEffect(() => {
    const el = tierRefs.current[active];
    if (el) {
      setIndicatorStyle({ top: el.offsetTop, height: el.offsetHeight });
    }
  }, [active]);

  return (
    <div className="border-2 border-border rounded-[32px] p-3 shadow-md max-w-sm w-full flex flex-col items-center gap-3 bg-card">
      <div className="rounded-full relative w-full bg-muted p-1.5 flex items-center">
        <button
          className="font-semibold rounded-full w-full p-1.5 text-foreground z-20 text-sm"
          onClick={() => handleChangePeriod(0)}
        >
          Monthly
        </button>
        <button
          className="font-semibold rounded-full w-full p-1.5 text-foreground z-20 text-sm"
          onClick={() => handleChangePeriod(1)}
        >
          Yearly
        </button>
        <div
          className="p-1.5 flex items-center justify-center absolute inset-0 w-1/2 z-10"
          style={{
            transform: `translateX(${period * 100}%)`,
            transition: "transform 0.3s",
          }}
        >
          <div className="bg-background shadow-sm rounded-full w-full h-full border border-border"></div>
        </div>
      </div>

      {period === 1 && (
        <p className="text-xs font-medium text-primary font-sans">Save up to 20% annually</p>
      )}

      <div className="w-full relative flex flex-col items-center justify-center gap-3">
        {tiers.map((tier, idx) => (
          <div
            key={tier.name}
            ref={(el) => { tierRefs.current[idx] = el; }}
            className="w-full cursor-pointer border-2 border-border p-4 rounded-2xl transition-all duration-300"
            style={{ opacity: active !== idx ? 0.7 : 1 }}
            onClick={() => setActive(idx)}
          >
            <div className="flex justify-between">
              <div className="flex flex-col items-start">
                <p className="font-semibold text-xl flex items-center gap-2 text-foreground">
                  {tier.name}
                  {tier.badge && (
                    <span className="py-1 px-2 block rounded-lg bg-primary/20 text-primary text-sm">
                      {tier.badge}
                    </span>
                  )}
                </p>
                <p className="text-muted-foreground text-md flex items-center gap-2">
                  <span className="text-foreground font-medium flex items-center">
                    $&nbsp;
                    <NumberFlow className="text-foreground font-medium" value={tier.price} />
                  </span>
                  /month
                  {period === 1 && (
                    <span className="text-[10px] font-semibold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                      Save {savingsPercent(tier.monthPrice, tier.annualPrice)}%
                    </span>
                  )}
                </p>
              </div>
              <div
                className="border-2 size-6 rounded-full mt-0.5 p-1 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: active === idx ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  transition: "border-color 0.3s",
                }}
              >
                <div
                  className="size-3 rounded-full"
                  style={{
                    backgroundColor: "hsl(var(--primary))",
                    opacity: active === idx ? 1 : 0,
                    transition: "opacity 0.3s",
                  }}
                />
              </div>
            </div>

            {/* Plan features - shown when active */}
            <div
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: active === idx ? "200px" : "0px",
                opacity: active === idx ? 1 : 0,
                marginTop: active === idx ? "12px" : "0px",
              }}
            >
              <div className="border-t border-border/50 pt-3 space-y-2">
                {tierDetails[idx].features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-primary flex-shrink-0" />
                    <span className="text-xs text-muted-foreground font-sans">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Dynamic selection indicator */}
        <div
          className="w-full absolute border-[3px] border-primary rounded-2xl pointer-events-none"
          style={{
            top: indicatorStyle.top,
            height: indicatorStyle.height,
            transition: "top 0.3s, height 0.3s",
          }}
        />
      </div>

      <button
        onClick={onGetStarted}
        className="rounded-full gold-gradient text-primary-foreground text-lg font-semibold w-full p-3 active:scale-95 transition-transform duration-300"
      >
        Get Started
      </button>
    </div>
  );
}