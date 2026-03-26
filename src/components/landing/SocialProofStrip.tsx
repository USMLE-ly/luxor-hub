import { Shirt, ScanFace, CloudSun, ShieldCheck } from "lucide-react";

const uvps = [
  { icon: Shirt, label: "Works With Your Existing Closet", sub: "No shopping required" },
  { icon: ScanFace, label: "Learns Your Body, Not a Mannequin", sub: "Personalized to you" },
  { icon: CloudSun, label: "Weather-Checked Every Morning", sub: "Practical daily value" },
  { icon: ShieldCheck, label: "30-Day Money-Back Guarantee", sub: "Zero risk" },
];

const SocialProofStrip = () => (
  <section className="py-10 md:py-14 border-y border-border bg-muted/20">
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {uvps.map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center gap-2">
            <item.icon className="w-6 h-6 text-foreground" />
            <p className="font-sans text-sm font-semibold text-foreground leading-tight">{item.label}</p>
            <p className="font-sans text-xs text-muted-foreground">{item.sub}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default SocialProofStrip;
