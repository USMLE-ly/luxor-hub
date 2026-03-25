import { useEffect, useState } from "react";
import { Cloud, Droplets, Wind, Thermometer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useUserLocation } from "@/hooks/useUserLocation";
import { supabase } from "@/integrations/supabase/client";
import { usePlanTier } from "@/hooks/usePlanTier";
import { hasTierAccess } from "@/lib/planRestrictions";
import { motion } from "framer-motion";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  humidity: number;
  wind: number;
  outfitTip: string;
  city: string;
  country: string;
}

export function WeatherOutfitCard() {
  const { lat, lon, loading: locLoading } = useUserLocation();
  const { tier } = usePlanTier();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locLoading) return;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("get-weather", {
          body: { lat, lon },
        });
        if (data) setWeather(data);
      } catch (e) {
        console.error("Weather fetch error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [lat, lon, locLoading]);

  if (loading || locLoading) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="h-16 rounded-xl bg-secondary animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!weather) return null;

  const showTip = hasTierAccess(tier, "starter");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/60 bg-card/60 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Weather icon + temp */}
            <div className="flex flex-col items-center min-w-[64px]">
              <span className="text-3xl leading-none">{weather.icon}</span>
              <span className="text-2xl font-bold text-foreground mt-1">{weather.temp}°</span>
              <span className="text-[10px] text-muted-foreground font-sans">{weather.city}</span>
            </div>

            {/* Details + tip */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground font-sans">{weather.description}</p>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground font-sans">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3" /> {weather.humidity}%
                </span>
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3" /> {weather.wind} km/h
                </span>
              </div>

              {showTip && weather.outfitTip && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-secondary/60 border border-border/40">
                  <p className="text-xs text-foreground/80 font-sans leading-relaxed">
                    👗 {weather.outfitTip}
                  </p>
                </div>
              )}

              {!showTip && (
                <p className="text-[10px] text-muted-foreground/60 mt-2 font-sans">
                  Upgrade to Starter for outfit tips
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
