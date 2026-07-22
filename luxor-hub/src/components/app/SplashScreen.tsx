import { useEffect, useState } from "react";
import { LuxurySplashScreen } from "@/components/ui/luxury-splash-visual";

const SplashScreen = () => {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show every page load — fade out after 3.5s, fully remove at 4.2s
    const fadeTimer = setTimeout(() => setFading(true), 3500);
    const removeTimer = setTimeout(() => setShow(false), 4200);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] transition-opacity duration-700"
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
