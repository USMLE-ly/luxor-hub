import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/app/ErrorBoundary";
import SplashScreen from "@/components/app/SplashScreen";
import PaywallGate from "@/components/app/PaywallGate";

// Route-level code splitting — pages load on demand
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Closet = lazy(() => import("./pages/Closet"));
const Chat = lazy(() => import("./pages/Chat"));
const Outfits = lazy(() => import("./pages/Outfits"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Inspiration = lazy(() => import("./pages/Inspiration"));
const OutfitBuilder = lazy(() => import("./pages/OutfitBuilder"));
const Profile = lazy(() => import("./pages/Profile"));
const OutfitAnalysisPage = lazy(() => import("./pages/OutfitAnalysis"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const WeeklyChallenge = lazy(() => import("./pages/WeeklyChallenge"));
const Badges = lazy(() => import("./pages/Badges"));
const NotificationCenter = lazy(() => import("./pages/NotificationCenter"));
const StyleDNA = lazy(() => import("./pages/StyleDNA"));
const Calibration = lazy(() => import("./pages/Calibration"));
const ColorType = lazy(() => import("./pages/ColorType"));
const Paywall = lazy(() => import("./pages/Paywall"));
const OutfitCalendar = lazy(() => import("./pages/OutfitCalendar"));
const MoodBoard = lazy(() => import("./pages/MoodBoard"));
const VideoAnalysis = lazy(() => import("./pages/VideoAnalysis"));
const FashionDesigner = lazy(() => import("./pages/FashionDesigner"));
const VirtualTryOn = lazy(() => import("./pages/VirtualTryOn"));
const CommunityGallery = lazy(() => import("./pages/CommunityGallery"));
const Install = lazy(() => import("./pages/Install"));
const Council = lazy(() => import("./pages/Council"));
const MonthlyReport = lazy(() => import("./pages/MonthlyReport"));
const WardrobeValue = lazy(() => import("./pages/WardrobeValue"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));
const DeepDive = lazy(() => import("./pages/DeepDive"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <SplashScreen />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<PaywallGate><Dashboard /></PaywallGate>} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/closet" element={<PaywallGate><Closet /></PaywallGate>} />
            <Route path="/chat" element={<PaywallGate><Chat /></PaywallGate>} />
            <Route path="/outfits" element={<PaywallGate><Outfits /></PaywallGate>} />
            <Route path="/analytics" element={<PaywallGate><Analytics /></PaywallGate>} />
            <Route path="/settings" element={<PaywallGate><Settings /></PaywallGate>} />
            <Route path="/inspiration" element={<PaywallGate><Inspiration /></PaywallGate>} />
            <Route path="/outfit-builder" element={<PaywallGate><OutfitBuilder /></PaywallGate>} />
            <Route path="/profile/:userId" element={<PaywallGate><Profile /></PaywallGate>} />
            <Route path="/outfit-analysis" element={<PaywallGate><OutfitAnalysisPage /></PaywallGate>} />
            <Route path="/leaderboard" element={<PaywallGate><Leaderboard /></PaywallGate>} />
            <Route path="/weekly-challenge" element={<PaywallGate><WeeklyChallenge /></PaywallGate>} />
            <Route path="/badges" element={<PaywallGate><Badges /></PaywallGate>} />
            <Route path="/notifications" element={<PaywallGate><NotificationCenter /></PaywallGate>} />
            <Route path="/style-dna" element={<PaywallGate><StyleDNA /></PaywallGate>} />
            <Route path="/calibration" element={<PaywallGate><Calibration /></PaywallGate>} />
            <Route path="/color-type" element={<PaywallGate><ColorType /></PaywallGate>} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
  );
}

export default App;
