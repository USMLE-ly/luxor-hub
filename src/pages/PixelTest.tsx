import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { trackEvent } from "@/lib/fbPixel";
import { CheckCircle, XCircle } from "lucide-react";

const TEST_KEY = "lexor2026";

const events = [
  {
    name: "AddToCart",
    params: { content_name: "LEXOR® Pro", content_ids: ["lexor_pro"], content_type: "product", value: 29.0, currency: "USD", num_items: 1 },
  },
  {
    name: "Subscribe",
    params: { value: 29.0, currency: "USD", content_name: "LEXOR® pro", content_ids: ["lexor_pro"], content_type: "product", num_items: 1 },
  },
  {
    name: "Purchase",
    params: { value: 29.0, currency: "USD", content_name: "LEXOR® pro", content_ids: ["lexor_pro"], content_type: "product", num_items: 1 },
  },
  {
    name: "Lead",
    params: { content_name: "LEXOR® Onboarding Complete" },
  },
  {
    name: "InitiateCheckout",
    params: { content_name: "LEXOR® Paywall View" },
  },
  {
    name: "CompleteRegistration",
    params: { content_name: "LEXOR® Signup", status: true },
  },
];

const PixelTest = () => {
  const [searchParams] = useSearchParams();
  const [fired, setFired] = useState<string[]>([]);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (searchParams.get("key") === TEST_KEY) {
      setAuthorized(true);
    }
  }, [searchParams]);

  const fireEvent = (name: string, params: Record<string, any>) => {
    trackEvent(name, params);
    setFired((prev) => [...prev, name]);
  };

  const fireAll = () => {
    events.forEach((e, i) => {
      setTimeout(() => fireEvent(e.name, e.params), i * 1500);
    });
  };

  if (!authorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-foreground mb-2">Pixel Event Tester</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Fire events from the published domain to activate them in Meta Ads Manager.
      </p>

      <button
        onClick={fireAll}
        className="w-full mb-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
      >
        🚀 Fire All Events (1.5s apart)
      </button>

      <div className="space-y-3">
        {events.map((e) => (
          <div
            key={e.name}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{e.name}</p>
              <p className="text-xs text-muted-foreground">${e.params.value || "—"}</p>
            </div>
            <div className="flex items-center gap-2">
              {fired.includes(e.name) ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-muted-foreground/30" />
              )}
              <button
                onClick={() => fireEvent(e.name, e.params)}
                className="px-3 py-1.5 text-xs rounded-md bg-accent text-accent-foreground"
              >
                Fire
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground/60 text-center mt-8">
        Open Meta Pixel Helper to verify events are firing. Events may take up to 20 minutes to appear active in Ads Manager.
      </p>
    </div>
  );
};

export default PixelTest;
