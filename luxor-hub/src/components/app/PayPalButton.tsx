import { useEffect, useRef, useState } from "react";
import { Spinner, Lock } from "@phosphor-icons/react";

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || "";

const PLAN_IDS: Record<string, string> = {
  starter: import.meta.env.VITE_PAYPAL_STARTER_PLAN_ID || "",
  pro: import.meta.env.VITE_PAYPAL_PRO_PLAN_ID || "",
  elite: import.meta.env.VITE_PAYPAL_ELITE_PLAN_ID || "",
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
    script.onload = () => resolve();
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

      if (!PAYPAL_CLIENT_ID || !PLAN_IDS[tier]) {
        setError("PayPal is not configured. Missing environment variables.");
        setLoading(false);
        return;
      }

      try {
        await loadPayPalSDK();
        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = "";

        const paypal = (window as any).paypal;
        if (!paypal) {
          throw new Error("PayPal SDK not available after load");
        }

        await paypal
          .Buttons({
            style: {
              shape: "pill",
              color: "white",
              layout: "vertical",
              label: "subscribe",
              height: 40,
              tagline: false,
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
          setError(err?.message || "Failed to load PayPal.");
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
      <div className="w-full rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-md border border-white/[0.08] p-5 text-center shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
        <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.08] mx-auto mb-3 flex items-center justify-center">
          <Lock className="w-4 h-4 text-white/40" />
        </div>
        <p className="text-[12px] text-white/50 font-sans leading-relaxed">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="flex items-center justify-center py-4 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-md border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]">
          <Spinner className="w-4 h-4 animate-spin text-white/60" />
          <span className="ml-2 text-[11px] text-white/50 font-sans tracking-wide">Preparing checkout…</span>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full min-h-[40px] rounded-2xl overflow-hidden [&_iframe]:rounded-2xl border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4)]"
        style={{ background: "linear-gradient(to bottom, hsl(var(--forest)), hsl(var(--forest)))" }}
      />
      {!loading && !error && (
        <p className="mt-3 text-center text-[10px] text-white/30 font-sans flex items-center justify-center gap-1.5 tracking-wide">
          <Lock className="w-3 h-3" />
          Secured by PayPal
        </p>
      )}
    </div>
  );
};

export default PayPalButton;
