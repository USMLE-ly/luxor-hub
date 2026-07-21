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
const OfflineIndicator = React.lazy(() => import("@/components/app/OfflineIndicator"));
const SupportWidget = React.lazy(() => import("@/components/support/SupportWidget"));
const SplashScreen = React.lazy(() => import("@/components/app/SplashScreen"));
const PaywallGate = React.lazy(() => import("@/components/app/PaywallGate"));
const CreditUsage = React.lazy(() => import("@/pages/CreditUsage"));
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
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
const AdminSpend = React.lazy(() => import("./pages/AdminSpend"));
const WardrobeValue = React.lazy(() => import("./pages/WardrobeValue"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogArticle = React.lazy(() => import("./pages/BlogArticle"));
const DeepDive = React.lazy(() => import("./pages/DeepDive"));
const DressingRoom = React.lazy(() => import("./pages/DressingRoom"));
const StyleRecommendations = React.lazy(() => import("./pages/StyleRecommendations"));
const UserAnalysis = React.lazy(() => import("./pages/UserAnalysis"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));

const RouteTracker = () => {
  const location = useLocation();
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) (window as any).fbq('track', 'PageView');
  }, [location.pathname]);
  return null;
};

const AppContent = () => {
  const location = useLocation();
  const queryClientRef = useRef<QueryClient | null>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
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
          <React.Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
          <Routes>
            <Route path="/" element={<ErrorBoundary><Index /></ErrorBoundary>} />
            <Route path="/auth" element={<ErrorBoundary><Auth /></ErrorBoundary>} />
            <Route path="/forgot-password" element={<ErrorBoundary><ForgotPassword /></ErrorBoundary>} />
            <Route path="/reset-password" element={<ErrorBoundary><ResetPassword /></ErrorBoundary>} />
            <Route path="/dashboard" element={<Navigate to="/closet" replace />} />
            <Route path="/onboarding" element={<PaywallGate><ErrorBoundary><Onboarding /></ErrorBoundary></PaywallGate>} />
            <Route path="/closet" element={<PaywallGate><ErrorBoundary fallbackMessage="Closet hit an error. Try refreshing."><Closet /></ErrorBoundary></PaywallGate>} />
            <Route path="/chat" element={<PaywallGate><ErrorBoundary fallbackMessage="Chat hit an error. Try refreshing."><Chat /></ErrorBoundary></PaywallGate>} />
            <Route path="/outfits" element={<PaywallGate><ErrorBoundary><Outfits /></ErrorBoundary></PaywallGate>} />
            <Route path="/analytics" element={<PaywallGate><ErrorBoundary><Analytics /></ErrorBoundary></PaywallGate>} />
            <Route path="/settings" element={<PaywallGate><ErrorBoundary><Settings /></ErrorBoundary></PaywallGate>} />
            <Route path="/inspiration" element={<PaywallGate><ErrorBoundary><Inspiration /></ErrorBoundary></PaywallGate>} />
            <Route path="/outfit-builder" element={<PaywallGate><ErrorBoundary><OutfitBuilder /></ErrorBoundary></PaywallGate>} />
            <Route path="/profile/:userId" element={<PaywallGate><ErrorBoundary><Profile /></ErrorBoundary></PaywallGate>} />
            <Route path="/outfit-analysis" element={<PaywallGate><ErrorBoundary fallbackMessage="Analysis hit an error. Try refreshing."><Analysis /></ErrorBoundary></PaywallGate>} />
            <Route path="/leaderboard" element={<PaywallGate><ErrorBoundary><Leaderboard /></ErrorBoundary></PaywallGate>} />
            <Route path="/weekly-challenge" element={<PaywallGate><ErrorBoundary><WeeklyChallenge /></ErrorBoundary></PaywallGate>} />
            <Route path="/badges" element={<PaywallGate><ErrorBoundary><Badges /></ErrorBoundary></PaywallGate>} />
            <Route path="/notifications" element={<PaywallGate><ErrorBoundary><NotificationCenter /></ErrorBoundary></PaywallGate>} />
            <Route path="/calibration" element={<PaywallGate><ErrorBoundary><Calibration /></ErrorBoundary></PaywallGate>} />
            <Route path="/paywall" element={<ErrorBoundary><Paywall /></ErrorBoundary>} />
            <Route path="/pricing" element={<ErrorBoundary><Paywall /></ErrorBoundary>} />
            <Route path="/credits" element={<PaywallGate><ErrorBoundary><CreditUsage /></ErrorBoundary></PaywallGate>} />
            <Route path="/outfit-calendar" element={<PaywallGate><ErrorBoundary fallbackMessage="Calendar hit an error. Try refreshing."><OutfitCalendar /></ErrorBoundary></PaywallGate>} />
            <Route path="/mood-board" element={<PaywallGate><ErrorBoundary><MoodBoard /></ErrorBoundary></PaywallGate>} />
            <Route path="/video-analysis" element={<PaywallGate><ErrorBoundary><VideoAnalysis /></ErrorBoundary></PaywallGate>} />
            <Route path="/fashion-designer" element={<PaywallGate><ErrorBoundary><FashionDesigner /></ErrorBoundary></PaywallGate>} />
            <Route path="/virtual-tryon" element={<PaywallGate><ErrorBoundary><VirtualTryOn /></ErrorBoundary></PaywallGate>} />
            <Route path="/community-gallery" element={<PaywallGate><ErrorBoundary><CommunityGallery /></ErrorBoundary></PaywallGate>} />
            <Route path="/install" element={<ErrorBoundary><Install /></ErrorBoundary>} />
            <Route path="/council" element={<PaywallGate><ErrorBoundary><Council /></ErrorBoundary></PaywallGate>} />
            <Route path="/admin/spend" element={<ErrorBoundary><AdminSpend /></ErrorBoundary>} />
            <Route path="/monthly-report" element={<PaywallGate><ErrorBoundary><MonthlyReport /></ErrorBoundary></PaywallGate>} />
            <Route path="/wardrobe-value" element={<PaywallGate><ErrorBoundary><WardrobeValue /></ErrorBoundary></PaywallGate>} />
            <Route path="/privacy" element={<ErrorBoundary><Privacy /></ErrorBoundary>} />
            <Route path="/terms" element={<ErrorBoundary><Terms /></ErrorBoundary>} />
            <Route path="/blog" element={<ErrorBoundary><Blog /></ErrorBoundary>} />
            <Route path="/blog/:slug" element={<ErrorBoundary><BlogArticle /></ErrorBoundary>} />
            <Route path="/deep-dive" element={<ErrorBoundary><DeepDive /></ErrorBoundary>} />
            <Route path="/dressing-room" element={<PaywallGate><ErrorBoundary><DressingRoom /></ErrorBoundary></PaywallGate>} />
            <Route path="/style-recommendations" element={<PaywallGate><ErrorBoundary fallbackMessage="Recommendations hit an error. Try refreshing."><StyleRecommendations /></ErrorBoundary></PaywallGate>} />
            <Route path="/user-analysis" element={<PaywallGate><ErrorBoundary><UserAnalysis /></ErrorBoundary></PaywallGate>} />
            <Route path="*" element={<ErrorBoundary><NotFound /></ErrorBoundary>} />
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
