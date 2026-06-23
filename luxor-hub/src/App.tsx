import { useEffect, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";

// Lazy-load all UI and page components
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));
const TooltipProvider = lazy(() => import("@/components/ui/tooltip").then(m => ({ default: m.TooltipProvider })));
const ErrorBoundary = lazy(() => import("@/components/app/ErrorBoundary").then(m => ({ default: m.ErrorBoundary })));
const StarfieldBackground = lazy(() => import("@/components/ui/starfield-background"));
const OfflineIndicator = lazy(() => import("@/components/app/OfflineIndicator"));
const SplashScreen = lazy(() => import("@/components/app/SplashScreen"));
const PaywallGate = lazy(() => import("@/components/app/PaywallGate").then(m => ({ default: m.PaywallGate })));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Closet = lazy(() => import("./pages/Closet"));
const Chat = lazy(() => import("./pages/Chat"));
const Outfits = lazy(() => import("./pages/Outfits"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Settings = lazy(() => import("./pages/Settings"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Inspiration = lazy(() => import("./pages/Inspiration"));
const OutfitBuilder = lazy(() => import("./pages/OutfitBuilder"));
const Profile = lazy(() => import("./pages/Profile"));
const Analysis = lazy(() => import("./pages/Analysis"));
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
const DressingRoom = lazy(() => import("./pages/DressingRoom"));
const NotFound = lazy(() => import("./pages/NotFound"));

const pageview = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView');
  }
};

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => { pageview(); }, [location.pathname]);
  return null;
};

const queryClient = new QueryClient();

const Loading = () => <div className="flex items-center justify-center min-h-screen bg-background"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

const FallbackUI = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center">
    <div className="text-destructive text-4xl mb-4">⚠</div>
    <h2 className="text-xl font-semibold text-foreground mb-2">Something went wrong</h2>
    <p className="text-muted-foreground max-w-md">The app encountered an error. Please refresh the page.</p>
    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg">Refresh</button>
  </div>
);

class AppErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      console.error('App Error:', this.state.error);
      return <FallbackUI />;
    }
    return this.props.children;
  }
}

const App = () => (
  <AppErrorBoundary>
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <Suspense fallback={null}><StarfieldBackground /></Suspense>
    <Suspense fallback={null}><OfflineIndicator /></Suspense>
    <Suspense fallback={null}><SplashScreen /></Suspense>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}><TooltipProvider /></Suspense>
      <Suspense fallback={null}><Toaster /></Suspense>
      <Suspense fallback={null}><Sonner /></Suspense>
      <BrowserRouter>
        <RouteTracker />
        <AuthProvider>
          <Suspense fallback={null}><ErrorBoundary /></Suspense>
          <Suspense fallback={<Loading />}>
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
            <Route path="/outfit-analysis" element={<PaywallGate><Analysis /></PaywallGate>} />
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
            <Route path="/dressing-room" element={<PaywallGate><DressingRoom /></PaywallGate>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
  </AppErrorBoundary>
);

export default App;
