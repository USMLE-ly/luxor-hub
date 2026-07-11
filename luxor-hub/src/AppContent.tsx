import React, { useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/app/ErrorBoundary";

// Lazy-load all UI and page components
const Toaster = React.lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = React.lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const TooltipProvider = React.lazy(() => import("@/components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));
const StarfieldBackground = React.lazy(() => import("@/components/ui/starfield-background"));
const OfflineIndicator = React.lazy(() => import("@/components/app/OfflineIndicator"));
const SupportWidget = React.lazy(() => import("@/components/support/SupportWidget"));
const SplashScreen = React.lazy(() => import("@/components/app/SplashScreen"));
const PaywallGate = React.lazy(() => import("@/components/app/PaywallGate"));
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Onboarding = React.lazy(() => import("./pages/Onboarding"));
const Closet = React.lazy(() => import("./pages/Closet"));
const Chat = React.lazy(() => import("./pages/Chat"));
const Outfits = React.lazy(() => import("./pages/Outfits"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Settings = React.lazy(() => import("./pages/Settings"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Inspiration = React.lazy(() => import("./pages/Inspiration"));
const OutfitBuilder = React.lazy(() => import("./pages/OutfitBuilder"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Analysis = React.lazy(() => import("./pages/Analysis"));
const Leaderboard = React.lazy(() => import("./pages/Leaderboard"));
const WeeklyChallenge = React.lazy(() => import("./pages/WeeklyChallenge"));
const Badges = React.lazy(() => import("./pages/Badges"));
const NotificationCenter = React.lazy(() => import("./pages/NotificationCenter"));
const Calibration = React.lazy(() => import("./pages/Calibration"));
const Paywall = React.lazy(() => import("./pages/Paywall"));
const OutfitCalendar = React.lazy(() => import("./pages/OutfitCalendar"));
const MoodBoard = React.lazy(() => import("./pages/MoodBoard"));
const VideoAnalysis = React.lazy(() => import("./pages/VideoAnalysis"));
const FashionDesigner = React.lazy(() => import("./pages/FashionDesigner"));
const VirtualTryOn = React.lazy(() => import("./pages/VirtualTryOn"));
const CommunityGallery = React.lazy(() => import("./pages/CommunityGallery"));
const Install = React.lazy(() => import("./pages/Install"));
const Council = React.lazy(() => import("./pages/Council"));
const MonthlyReport = React.lazy(() => import("./pages/MonthlyReport"));
const WardrobeValue = React.lazy(() => import("./pages/WardrobeValue"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogArticle = React.lazy(() => import("./pages/BlogArticle"));
const DeepDive = React.lazy(() => import("./pages/DeepDive"));
import { ClassicLoader } from "@/components/ui/loader";
const DressingRoom = React.lazy(() => import("./pages/DressingRoom"));
const StyleRecommendations = React.lazy(() => import("./pages/StyleRecommendations"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const RouteTracker = () => {
  const location = useLocation();
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'PageView');
  }, [location.pathname]);
  return null;
};

const Loading = () => <div className="flex items-center justify-center min-h-screen bg-background"><ClassicLoader /></div>;

const AppContent = () => {
  const location = useLocation();
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <React.Suspense fallback={null}><StarfieldBackground /></React.Suspense>
      <React.Suspense fallback={null}><OfflineIndicator /></React.Suspense>
      <React.Suspense fallback={null}><SplashScreen /></React.Suspense>
      <QueryClientProvider client={queryClientRef.current}>
        <React.Suspense fallback={null}><TooltipProvider /></React.Suspense>
        <React.Suspense fallback={null}><Toaster /></React.Suspense>
        <React.Suspense fallback={null}><Sonner /></React.Suspense>
        <RouteTracker />
        <AuthProvider>
          <ErrorBoundary>
          <React.Suspense fallback={null}><SupportWidget /></React.Suspense>
          <React.Suspense fallback={<Loading />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Navigate to="/closet" replace />} />
            <Route path="/onboarding" element={<PaywallGate><Onboarding /></PaywallGate>} />
            <Route path="/closet" element={<PaywallGate><Closet /></PaywallGate>} />
            <Route path="/chat" element={<PaywallGate><Chat /></PaywallGate>} />
            <Route path="/outfits" element={<PaywallGate><Outfits /></PaywallGate>} />
            <Route path="/analytics" element={<PaywallGate><Analytics /></PaywallGate>} />
            <Route path="/settings" element={<PaywallGate><Settings /></PaywallGate>} />
            <Route path="/inspiration" element={<PaywallGate><Inspiration /></PaywallGate>} />
            <Route path="/outfit-builder" element={<PaywallGate><OutfitBuilder /></PaywallGate>} />
            <Route path="/profile/:userId" element={<PaywallGate><Profile /></PaywallGate>} />
            <Route path="/outfit-analysis" element={<PaywallGate><Analysis /></PaywallGate>} />
            <Route path="/leaderboard" element={<PaywallGate><Leaderboard /></PaywallGate>} />
            <Route path="/weekly-challenge" element={<PaywallGate><WeeklyChallenge /></PaywallGate>} />
            <Route path="/badges" element={<PaywallGate><Badges /></PaywallGate>} />
            <Route path="/notifications" element={<PaywallGate><NotificationCenter /></PaywallGate>} />

            <Route path="/calibration" element={<PaywallGate><Calibration /></PaywallGate>} />

            <Route path="/paywall" element={<Paywall />} />
            <Route path="/outfit-calendar" element={<PaywallGate><OutfitCalendar /></PaywallGate>} />
            <Route path="/mood-board" element={<PaywallGate><MoodBoard /></PaywallGate>} />
            <Route path="/video-analysis" element={<PaywallGate><VideoAnalysis /></PaywallGate>} />
            <Route path="/fashion-designer" element={<PaywallGate><FashionDesigner /></PaywallGate>} />
            <Route path="/virtual-tryon" element={<PaywallGate><VirtualTryOn /></PaywallGate>} />
            <Route path="/community-gallery" element={<PaywallGate><CommunityGallery /></PaywallGate>} />
            <Route path="/install" element={<Install />} />
            <Route path="/council" element={<PaywallGate><Council /></PaywallGate>} />
            <Route path="/monthly-report" element={<PaywallGate><MonthlyReport /></PaywallGate>} />
            <Route path="/wardrobe-value" element={<PaywallGate><WardrobeValue /></PaywallGate>} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/deep-dive" element={<DeepDive />} />
            <Route path="/dressing-room" element={<PaywallGate><DressingRoom /></PaywallGate>} />
            <Route path="/style-recommendations" element={<PaywallGate><StyleRecommendations /></PaywallGate>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
            </motion.div>
          </AnimatePresence>
          </React.Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
    </HelmetProvider>
  );
};

export default AppContent;
