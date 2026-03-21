import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { pageview } from "@/lib/fbPixel";
import Index from "./pages/Index";
import { ErrorBoundary } from "@/components/app/ErrorBoundary";
import StarfieldBackground from "@/components/ui/starfield-background";
import OfflineIndicator from "@/components/app/OfflineIndicator";
import SplashScreen from "@/components/app/SplashScreen";
import PaywallGate from "@/components/app/PaywallGate";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Closet from "./pages/Closet";
import Chat from "./pages/Chat";
import Outfits from "./pages/Outfits";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Inspiration from "./pages/Inspiration";
import OutfitBuilder from "./pages/OutfitBuilder";
import Profile from "./pages/Profile";
import OutfitAnalysisPage from "./pages/OutfitAnalysis";
import Leaderboard from "./pages/Leaderboard";
import WeeklyChallenge from "./pages/WeeklyChallenge";
import Badges from "./pages/Badges";
import NotificationCenter from "./pages/NotificationCenter";
import StyleDNA from "./pages/StyleDNA";
import Calibration from "./pages/Calibration";
import ColorType from "./pages/ColorType";
import Paywall from "./pages/Paywall";
import OutfitCalendar from "./pages/OutfitCalendar";
import MoodBoard from "./pages/MoodBoard";
import VideoAnalysis from "./pages/VideoAnalysis";
import FashionDesigner from "./pages/FashionDesigner";
import VirtualTryOn from "./pages/VirtualTryOn";
import CommunityGallery from "./pages/CommunityGallery";
import Install from "./pages/Install";
import Council from "./pages/Council";
import MonthlyReport from "./pages/MonthlyReport";


// Tracks route changes for Facebook Pixel
const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    pageview();
  }, [location.pathname]);
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <StarfieldBackground />
    <OfflineIndicator />
    <SplashScreen />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <RouteTracker />
        <AuthProvider>
          <ErrorBoundary>
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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
