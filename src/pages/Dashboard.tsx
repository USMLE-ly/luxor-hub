import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Shirt, Wand2, Star, TrendingUp, RefreshCw, Sparkles, CloudSun, Droplets, Wind } from "lucide-react";
import { CalendarWidget } from "@/components/app/CalendarWidget";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ items: 0, outfits: 0, styleScore: 0 });
  const [profile, setProfile] = useState<{ display_name: string | null }>({ display_name: null });
  const [styleProfile, setStyleProfile] = useState<{ onboarding_completed: boolean | null; archetype: string | null }>({ onboarding_completed: null, archetype: null });
  const [weather, setWeather] = useState<{ temp: number; description: string; icon: string; humidity: number; wind: number; outfitTip: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [itemsRes, outfitsRes, profileRes, styleRes] = await Promise.all([
        supabase.from("clothing_items").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("outfits").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase.from("style_profiles").select("onboarding_completed, archetype, style_score").eq("user_id", user.id).single(),
      ]);
      setStats({
        items: itemsRes.count || 0,
        outfits: outfitsRes.count || 0,
        styleScore: (styleRes.data as any)?.style_score || 0,
      });
      if (profileRes.data) setProfile(profileRes.data);
      if (styleRes.data) setStyleProfile(styleRes.data);
    };
    fetchData();

    // Fetch weather
    const fetchWeather = async () => {
      try {
        // Try to get user location
        let lat = 40.7128, lon = -74.006; // Default NYC
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 })
          );
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        } catch {}

        const resp = await supabase.functions.invoke("get-weather", {
          body: { lat, lon },
        });
        if (resp.data && !resp.error) setWeather(resp.data);
      } catch {}
    };
    fetchWeather();
  }, [user]);

  useEffect(() => {
    // Only redirect if we've actually loaded the data (not null) and it's explicitly false
    if (styleProfile.onboarding_completed === false && user) {
      navigate("/onboarding");
    }
  }, [styleProfile.onboarding_completed, user, navigate]);

  const displayName = profile.display_name || user?.user_metadata?.display_name || "there";
  const firstName = displayName.split(" ")[0];

  const statCards = [
    { label: "Closet Items", value: stats.items, icon: Shirt, color: "text-primary" },
    { label: "Outfits Created", value: stats.outfits, icon: Wand2, color: "text-gold-light" },
    { label: "Style Score", value: stats.styleScore, icon: Star, color: "text-primary" },
    { label: "Trend Match", value: "87%", icon: TrendingUp, color: "text-gold-light" },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-1">
            Welcome back, <span className="gold-text">{firstName}</span>
          </h1>
          <p className="text-muted-foreground font-sans text-sm mb-8">Here's your style overview for today.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="glass rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-muted-foreground font-sans text-xs mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Weather Widget */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl">{weather.icon}</span>
                  <div>
                    <p className="font-display text-3xl font-bold text-foreground">{weather.temp}°C</p>
                    <p className="text-muted-foreground font-sans text-sm">{weather.description}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-3 text-xs text-muted-foreground font-sans">
                  <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {weather.humidity}%</span>
                  <span className="flex items-center gap-1"><Wind className="h-3 w-3" /> {weather.wind} km/h</span>
                </div>
              </div>
              <div className="max-w-xs text-right">
                <p className="text-xs text-primary font-sans font-medium flex items-center justify-end gap-1 mb-1">
                  <CloudSun className="h-3 w-3" /> Weather-based tip
                </p>
                <p className="text-sm text-muted-foreground font-sans">{weather.outfitTip}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Today's Outfit Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass rounded-2xl p-6 lg:p-8 gold-glow mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Today's Outfit
              </h2>
              <p className="text-muted-foreground font-sans text-sm mt-1">AI-curated for your day</p>
            </div>
            <Button variant="outline" size="sm" className="border-glass-border hover:border-primary/50 font-sans">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>

          {stats.items === 0 ? (
            <div className="text-center py-12">
              <Shirt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-sans mb-4">Add items to your closet to get outfit recommendations</p>
              <Button onClick={() => navigate("/closet")} className="gold-gradient text-primary-foreground font-sans">
                Go to My Closet
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground font-sans">Outfit generation coming soon!</p>
            </div>
          )}
        </motion.div>

        {/* Calendar Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mb-8"
        >
          <CalendarWidget />
        </motion.div>

        {/* Style DNA */}
        {styleProfile.archetype && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Your Style DNA</h2>
            <p className="text-primary font-display text-lg">{styleProfile.archetype}</p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
