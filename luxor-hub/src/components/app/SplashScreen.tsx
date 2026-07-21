import { useEffect, useState } from "react";
import log from "@/lib/diagnosticLogger";
import { LuxurySplashScreen } from "@/components/ui/luxury-splash-visual";

const SESSION_KEY = "luxor_splash_shown";

const SplashScreen = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem(SESSION_KEY);
    log("SPLASH", "SplashScreen", alreadyShown ? "Already shown this session, skipping" : "Showing splash screen");
    if (!alreadyShown) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setShow(true);
    }
  }, []);

  if (!show) return null;
  log("SPLASH", "SplashScreen", "Rendering LuxurySplashScreen (z-[99999])");

  return <LuxurySplashScreen tagline="Your Personal Fashion Intelligence" />;
};

export default SplashScreen;
