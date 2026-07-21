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

  if (!show) return null;

  return <LuxurySplashScreen tagline="Your Personal Fashion Intelligence" />;
};

export default SplashScreen;
