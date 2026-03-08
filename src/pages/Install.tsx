import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Smartphone, Share, Plus, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md text-center space-y-8"
      >
        <div>
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Install AURELIA</h1>
          <p className="text-muted-foreground font-sans text-sm">
            Add AURELIA to your home screen for the best experience — instant access, offline support, and push notifications.
          </p>
        </div>

        {isInstalled ? (
          <div className="glass rounded-2xl p-8 space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-400" />
            </div>
            <p className="font-sans text-foreground font-medium">AURELIA is installed!</p>
            <p className="text-muted-foreground font-sans text-xs">Open it from your home screen for the full experience.</p>
            <Button onClick={() => navigate("/dashboard")} className="gold-gradient rounded-xl">
              Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : deferredPrompt ? (
          <div className="glass rounded-2xl p-8 space-y-4">
            <Button onClick={handleInstall} className="w-full gold-gradient rounded-xl h-12 text-base font-semibold">
              <Download className="w-5 h-5 mr-2" /> Install App
            </Button>
            <p className="text-muted-foreground font-sans text-xs">One tap to add AURELIA to your home screen</p>
          </div>
        ) : isIOS ? (
          <div className="glass rounded-2xl p-8 space-y-6 text-left">
            <p className="font-sans text-sm text-foreground font-medium text-center">Install on iPhone / iPad</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Share className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-sans text-sm text-foreground">Tap the Share button</p>
                  <p className="font-sans text-xs text-muted-foreground">At the bottom of Safari</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-sans text-sm text-foreground">Tap "Add to Home Screen"</p>
                  <p className="font-sans text-xs text-muted-foreground">Scroll down in the share menu</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-sans text-sm text-foreground">Tap "Add"</p>
                  <p className="font-sans text-xs text-muted-foreground">AURELIA will appear on your home screen</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 space-y-4">
            <p className="font-sans text-sm text-foreground">Use the browser menu to install</p>
            <p className="text-muted-foreground font-sans text-xs">
              Look for "Install app" or "Add to Home Screen" in your browser's menu (⋮)
            </p>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="text-sm text-muted-foreground hover:text-primary transition-colors font-sans"
        >
          Continue in browser instead
        </button>
      </motion.div>
    </div>
  );
};

export default Install;
