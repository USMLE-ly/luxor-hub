import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { ModernPricingPage, PricingCardProps } from "@/components/ui/animated-glassy-pricing";
import { trackEvent } from "@/lib/fbPixel";

const plans: PricingCardProps[] = [
  {
    planName: "Starter",
    description: "Essential AI styling tools",
    price: "9",
    features: ["200 closet items", "Daily outfit suggestions", "Basic color analysis", "Closet scanner", "Community access"],
    buttonText: "Join Now",
    buttonVariant: "secondary",
  },
  {
    planName: "Pro",
    description: "Unlock your full style potential",
    price: "29",
    features: ["Unlimited closet items", "AI Stylist Chat", "Advanced Style DNA", "Shopping recommendations", "Outfit calendar", "Priority AI processing"],
    buttonText: "Claim Your Spot",
    isPopular: true,
    buttonVariant: "primary",
  },
  {
    planName: "Elite",
    description: "Full concierge-level styling",
    price: "99",
    features: ["Everything in Pro", "Virtual try-on", "Trend intelligence", "Fashion design studio", "Personal style reports", "1-on-1 AI consultations"],
    buttonText: "Go Elite",
    buttonVariant: "primary",
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  const plansWithHandlers = plans.map((plan) => ({
    ...plan,
    onButtonClick: () => {
      trackEvent("InitiateCheckout", { content_name: `LUXOR ${plan.planName}` });
      navigate("/auth");
    },
  }));

  return (
    <section id="pricing">
      <ModernPricingPage
        title={
          <>
            What's Looking Incredible Actually{" "}
            <span className="gold-text">Worth to You</span>?
          </>
        }
        subtitle="The average person wastes $1,200/year on clothes they barely wear. LUXOR pays for itself in the first month."
        plans={plansWithHandlers}
        showAnimatedBackground={true}
        bottomContent={
          <div className="flex flex-col items-center gap-5">
            {/* Payment icons */}
            <div className="flex items-center gap-3">
              {[
                { src: "/payments/visa.svg", alt: "Visa" },
                { src: "/payments/mastercard.svg", alt: "Mastercard" },
                { src: "/payments/amex.svg", alt: "Amex" },
                { src: "/payments/discover.svg", alt: "Discover" },
                { src: "/payments/klarna.svg", alt: "Klarna" },
                { src: "/payments/wechat.svg", alt: "WeChat Pay" },
                { src: "/payments/venmo.svg", alt: "Venmo" },
              ].map((icon) => (
                <img key={icon.alt} src={icon.src} alt={icon.alt} className="h-8 w-auto rounded-md" />
              ))}
            </div>

            <p className="text-xs font-sans text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary urgency-pulse" />
              This price won't last. <span className="font-medium text-foreground">237 founding spots</span> remain.
            </p>

            <div className="flex items-center gap-2 text-xs font-sans text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        }
      />
    </section>
  );
};

export default Pricing;
