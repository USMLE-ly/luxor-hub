import { useEffect, useState } from "react";
import { LuxurySplashScreen } from "@/components/ui/luxury-splash-visual";

const SESSION_KEY = "luxor_splash_shown";

const SplashScreen = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (!alreadyShown) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    // Safety: force-dismiss after 2.5 seconds regardless
    const timer = setTimeout(() => setShow(false), 2500);
    return () => clearTimeout(timer);
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[99999]" style={{ pointerEvents: "none" }}>
      <LuxurySplashScreen tagline="Your Personal Fashion Intelligence" />
    </div>
  );
};

export default SplashScreen;
