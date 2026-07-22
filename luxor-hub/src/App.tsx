import React, { lazy, Suspense, Component, useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { initAudio } from "@/lib/audio-system";
import { initMonitor } from "@/lib/support";
import { initResilience } from "@/lib/resilience";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { MotionConfig } from "framer-motion";
import { LuxurySplashScreen } from "@/components/ui/luxury-splash-visual";

const AppContent = lazy(() => import("./AppContent"));

/* Loading spinner — shows while AppContent lazy-loads */
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen" style={{ background: "linear-gradient(180deg, #060f0d 0%, #0c2420 35%, #10352a 55%, #0a1f1a 80%, #060f0d 100%)" }}>
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-[#E8C87A]/20 border-t-[#E8C87A] rounded-full animate-spin" />
      <span className="text-[10px] tracking-[0.5em] uppercase text-[#E8C87A]/20 font-sans">Loading your wardrobe</span>
    </div>
  </div>
);

/* Splash screen — renders on top of everything, fades after 4.2s */
const SplashOverlay = () => {
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 3500);
    const removeTimer = setTimeout(() => setShow(false), 4200);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] transition-opacity duration-700"
      style={{ pointerEvents: "none", opacity: fading ? 0 : 1 }}
    >
      <LuxurySplashScreen tagline="Your Personal Fashion Intelligence" />
    </div>
  );
};

function isChunkLoadError(error: any): boolean {
  return (
    error?.name === 'ChunkLoadError' ||
    error?.name === 'TypeError' && (
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('loading CSS chunk') ||
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('NetworkError')
    ) ||
    error?.message?.includes('ChunkLoadError') ||
    error?.message?.includes('dynamically imported') ||
    error?.code === 'MODULE_NOT_FOUND'
  );
}

class AppErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; isChunkError: boolean }
> {
  state = { hasError: false, error: null, isChunkError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, isChunkError: isChunkLoadError(error) };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[LUXOR APPBOUNDARY]', error.name, error.message, info.componentStack);
  }

  handleRetry = () => {
    if (this.state.isChunkError) {
      window.location.href = window.location.origin + window.location.pathname + '?t=' + Date.now();
    } else {
      this.setState({ hasError: false, error: null, isChunkError: false });
    }
  };

  render() {
    if (this.state.hasError) {
      const isChunk = this.state.isChunkError;
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center" style={{ background: "linear-gradient(180deg, #060f0d 0%, #0c2420 35%, #10352a 55%, #0a1f1a 80%, #060f0d 100%)" }}>
          <div className="max-w-md">
            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${isChunk ? 'bg-gold/20' : 'bg-red-500/20'}`}>
              <svg className={`w-8 h-8 ${isChunk ? 'text-gold' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {isChunk
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                }
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {isChunk ? 'New Version Available' : 'Something went wrong'}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {isChunk
                ? 'A new version of Luxor has been deployed. Please refresh to get the latest update.'
                : 'An unexpected error occurred. Please try again.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-6 py-2.5 bg-gradient-to-r from-gold to-gold/80 text-white font-medium rounded-xl hover:from-gold/90 hover:to-gold/70 transition-all shadow-lg shadow-gold/20"
            >
              {isChunk ? 'Load Latest Version' : 'Try Again'}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AudioInit = () => {
  useEffect(() => {
    initMonitor();
    initResilience();
    const handleInteraction = () => {
      initAudio();
      document.querySelectorAll('video').forEach((video) => {
        if (video.paused) {
          video.play().catch(() => {});
        }
      });
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);
    window.addEventListener("keydown", handleInteraction);
    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, []);
  return null;
};

const App = () => (
  <AppErrorBoundary>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AudioInit />
        <SpeedInsights />
        <SplashOverlay />
        <Suspense fallback={<Loading />}>
          <AppContent />
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  </AppErrorBoundary>
);

export default App;
// deploy-fix-1753141800
