import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/fbPixel";
import {
  SquishyPricingCard,
  BGComponent1,
  BGComponent2,
  BGComponent3,
} from "@/components/ui/squishy-pricing";

const Pricing = () => {
  const navigate = useNavigate();

  const handleCta = () => {
    trackEvent("InitiateCheckout", { content_name: "LUXOR Pricing" });
    navigate("/auth");
  };

  return (
    <section id="pricing" className="py-20 md:py-32 bg-muted/20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <p className="font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            What's Looking Incredible Actually <span className="gold-text">Worth to You</span>?
          </h2>
          <p className="mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground">
            The average person wastes $1,200/year on clothes they barely wear. LUXOR pays for itself in the first month.
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          <SquishyPricingCard
            label="Starter"
            monthlyPrice="9"
            description="Essential AI styling tools for your everyday wardrobe"
            cta="Join Now"
            background="bg-[hsl(43,74%,35%)]"
            BGComponent={BGComponent1}
            onCtaClick={handleCta}
          />
          <SquishyPricingCard
            label="Pro"
            monthlyPrice="29"
            description="Unlock your full style potential with advanced AI"
            cta="Claim Your Spot"
            background="bg-[hsl(43,74%,49%)]"
            BGComponent={BGComponent2}
            onCtaClick={handleCta}
          />
          <SquishyPricingCard
            label="Elite"
            monthlyPrice="99"
            description="Full concierge-level styling with virtual try-on"
            cta="Go Elite"
            background="bg-[hsl(35,80%,42%)]"
            BGComponent={BGComponent3}
            onCtaClick={handleCta}
          />
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex flex-col items-center gap-5"
        >
          <div className="flex items-center gap-3">
            {[
              { src: "/payments/visa.svg", alt: "Visa" },
              { src: "/payments/mastercard.svg", alt: "Mastercard" },
              { src: "/payments/amex.svg", alt: "American Express" },
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
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
