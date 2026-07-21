import { useEffect, useState } from "react";
import { LuxurySplashScreen } from "@/components/ui/luxury-splash-visual";

const SESSION_KEY = "luxor_splash_shown";

const SplashScreen = () => {
  const [show, setShow] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    if (!alreadyShown) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setShow(true);
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    // Start fade-out at 2s, fully remove at 2.6s
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    const removeTimer = setTimeout(() => setShow(false), 2600);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] transition-opacity duration-500"
      style={{
        pointerEvents: "none",
        opacity: fading ? 0 : 1,
      }}
    >
      <LuxurySplashScreen tagline="Your Personal Fashion Intelligence" />
    </div>
  );
};

export default SplashScreen;
