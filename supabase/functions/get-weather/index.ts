import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon } = await req.json();

    // Input validation
    if (lat !== undefined && (typeof lat !== "number" || lat < -90 || lat > 90)) {
      return new Response(JSON.stringify({ error: "Invalid latitude. Must be a number between -90 and 90." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (lon !== undefined && (typeof lon !== "number" || lon < -180 || lon > 180)) {
      return new Response(JSON.stringify({ error: "Invalid longitude. Must be a number between -180 and 180." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use Open-Meteo (free, no API key needed)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat || 40.7128}&longitude=${lon || -74.006}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&temperature_unit=celsius`;
    
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Weather API failed");
    
    const data = await resp.json();
    const current = data.current;
    
    // Map weather codes to descriptions
    const weatherMap: Record<number, { desc: string; icon: string }> = {
      0: { desc: "Clear sky", icon: "☀️" },
      1: { desc: "Mainly clear", icon: "🌤️" },
      2: { desc: "Partly cloudy", icon: "⛅" },
      3: { desc: "Overcast", icon: "☁️" },
      45: { desc: "Foggy", icon: "🌫️" },
      48: { desc: "Rime fog", icon: "🌫️" },
      51: { desc: "Light drizzle", icon: "🌦️" },
      53: { desc: "Drizzle", icon: "🌦️" },
      55: { desc: "Heavy drizzle", icon: "🌧️" },
      61: { desc: "Light rain", icon: "🌧️" },
      63: { desc: "Rain", icon: "🌧️" },
      65: { desc: "Heavy rain", icon: "🌧️" },
      71: { desc: "Light snow", icon: "🌨️" },
      73: { desc: "Snow", icon: "❄️" },
      75: { desc: "Heavy snow", icon: "❄️" },
      80: { desc: "Rain showers", icon: "🌧️" },
      95: { desc: "Thunderstorm", icon: "⛈️" },
    };
    
    const code = current.weathercode;
    const weather = weatherMap[code] || { desc: "Unknown", icon: "🌡️" };
    
    // Generate outfit tip based on weather
    const temp = current.temperature_2m;
    let tip = "";
    if (temp < 5) tip = "Bundle up! Heavy layers, coat, and scarf recommended.";
    else if (temp < 15) tip = "Layer up with a jacket or sweater.";
    else if (temp < 22) tip = "Perfect for light layers — a light jacket or cardigan.";
    else if (temp < 30) tip = "Keep it breezy with light fabrics.";
    else tip = "Stay cool! Lightweight, breathable clothing.";
    
    if ([51, 53, 55, 61, 63, 65, 80].includes(code)) {
      tip += " Don't forget a waterproof layer!";
    }

    // Reverse geocode to get city name
    let city = "Your area";
    let country = "";
    try {
      const geoResp = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat || 40.7128}&longitude=${lon || -74.006}&localityLanguage=en`
      );
      if (geoResp.ok) {
        const geoData = await geoResp.json();
        city = geoData.city || geoData.locality || geoData.principalSubdivision || "Your area";
        country = geoData.countryName || "";
      }
    } catch { /* silently fail */ }

    return new Response(JSON.stringify({
      temp: Math.round(temp),
      description: weather.desc,
      icon: weather.icon,
      humidity: current.relativehumidity_2m,
      wind: Math.round(current.windspeed_10m),
      outfitTip: tip,
      city,
      country,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
