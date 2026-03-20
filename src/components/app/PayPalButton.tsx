import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

const PAYPAL_CLIENT_ID =
  "ARa9CFxEtURh2bL23KEBSHEjQ7JJA39Dxl-Jn4JCR7fsRx6AaUEe7IXKl97AaApUq0pwXDUMe97sgco-";

const PLAN_IDS: Record<string, string> = {
  starter: "P-6KB46929KR388530GNG6YDAA",
  pro: "P-3TT76167R1560735XNG6X7TQ",
  elite: "P-6KB46929KR388530GNG6YDAA", // placeholder until Elite ID is provided
};

let sdkPromise: Promise<void> | null = null;

function loadPayPalSDK(): Promise<void> {
  if ((window as any).paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.dataset.sdkIntegrationSource = "button-factory";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("PayPal SDK failed to load"));
    document.head.appendChild(script);
  });

  return sdkPromise;
}

interface PayPalButtonProps {
  tier: "starter" | "pro" | "elite";
  onApprove: (subscriptionId: string) => void;
}

const PayPalButton = ({ tier, onApprove }: PayPalButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const renderedTier = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setLoading(true);
      try {
        await loadPayPalSDK();
        if (cancelled || !containerRef.current) return;

        // Clear previous buttons
        containerRef.current.innerHTML = "";
        renderedTier.current = tier;

        const paypal = (window as any).paypal;
        paypal
          .Buttons({
            style: {
              shape: "pill",
              color: "gold",
              layout: "horizontal",
              label: "subscribe",
            },
            createSubscription: (_data: any, actions: any) => {
              return actions.subscription.create({
                plan_id: PLAN_IDS[tier],
              });
            },
            onApprove: (data: any) => {
              onApprove(data.subscriptionID);
            },
          })
          .render(containerRef.current);
      } catch (err) {
        console.error("PayPal render error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [tier, onApprove]);

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center py-3">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="ml-2 text-xs text-muted-foreground">Loading PayPal…</span>
        </div>
      )}
      <div ref={containerRef} className="w-full min-h-[45px]" />
    </div>
  );
};

export default PayPalButton;
