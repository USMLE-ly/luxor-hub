import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";

const PAYPAL_CLIENT_ID =
  "ARa9CFxEtURh2bL23KEBSHEjQ7JJA39Dxl-Jn4JCR7fsRx6AaUEe7IXKl97AaApUq0pwXDUMe97sgco-";

const PLAN_IDS: Record<string, string> = {
  starter: "P-6KB46929KR388530GNG6YDAA",
  pro: "P-3TT76167R1560735XNG6X7TQ",
  elite: "P-6KB46929KR388530GNG6YDAA",
};

let sdkPromise: Promise<void> | null = null;
let sdkFailed = false;

function loadPayPalSDK(): Promise<void> {
  if ((window as any).paypal) return Promise.resolve();
  if (sdkFailed) return Promise.reject(new Error("PayPal SDK previously failed to load"));
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.dataset.sdkIntegrationSource = "button-factory";
    script.async = true;
    script.onload = () => {
      console.log("PayPal SDK loaded successfully");
      resolve();
    };
    script.onerror = () => {
      sdkFailed = true;
      sdkPromise = null;
      reject(new Error("PayPal SDK failed to load"));
    };
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
  const [error, setError] = useState<string | null>(null);
  const onApproveRef = useRef(onApprove);
  onApproveRef.current = onApprove;

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadPayPalSDK();
        if (cancelled || !containerRef.current) return;

        // Clear previous buttons
        containerRef.current.innerHTML = "";

        const paypal = (window as any).paypal;
        if (!paypal) {
          throw new Error("PayPal object not available after SDK load");
        }

        await paypal
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
              onApproveRef.current(data.subscriptionID);
            },
          })
          .render(containerRef.current);
      } catch (err: any) {
        console.error("PayPal render error:", err);
        if (!cancelled) {
          setError(err?.message || "Failed to load PayPal. Please try on the published site.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [tier]);

  if (error) {
    return (
      <div className="w-full rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
        <AlertCircle className="w-5 h-5 text-destructive mx-auto mb-2" />
        <p className="text-xs text-muted-foreground font-sans">
          PayPal buttons may not load in preview mode.
          <br />
          <span className="text-foreground font-medium">Publish your app to test payments.</span>
        </p>
      </div>
    );
  }

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
