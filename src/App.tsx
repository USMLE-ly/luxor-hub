import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import StarfieldBackground from "@/components/ui/starfield-background";
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


const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <StarfieldBackground />
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/closet" element={<Closet />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/outfits" element={<Outfits />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/outfit-builder" element={<OutfitBuilder />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/outfit-analysis" element={<OutfitAnalysisPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/weekly-challenge" element={<WeeklyChallenge />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/style-dna" element={<StyleDNA />} />
            <Route path="/calibration" element={<Calibration />} />
            <Route path="/color-type" element={<ColorType />} />
            <Route path="/paywall" element={<Paywall />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
