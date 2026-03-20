import { useState, useEffect } from "react";

interface UserLocation {
  lat: number;
  lon: number;
  city: string;
  loading: boolean;
}

const STORAGE_KEY = "luxor-user-location";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CachedLocation {
  lat: number;
  lon: number;
  city: string;
  timestamp: number;
}

export function useUserLocation(): UserLocation {
  const [location, setLocation] = useState<UserLocation>({
    lat: 40.7128,
    lon: -74.006,
    city: "New York",
    loading: true,
  });

  useEffect(() => {
    const resolve = async () => {
      // Check localStorage cache first
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed: CachedLocation = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setLocation({ lat: parsed.lat, lon: parsed.lon, city: parsed.city, loading: false });
            return;
          }
        }
      } catch {}

      // Try browser geolocation
      let lat = 40.7128, lon = -74.006;
      let gotGeo = false;

      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          gotGeo = true;
        } catch {}
      }

      // If no browser geolocation, try IP-based fallback
      if (!gotGeo) {
        try {
          const resp = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
          if (resp.ok) {
            const data = await resp.json();
            if (data.latitude && data.longitude) {
              lat = data.latitude;
              lon = data.longitude;
              const city = data.city || "Your area";
              const result = { lat, lon, city, loading: false };
              setLocation(result);
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, city, timestamp: Date.now() }));
              return;
            }
          }
        } catch {}
      }

      // Reverse geocode to get city name
      let city = "Your area";
      try {
        const resp = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          { signal: AbortSignal.timeout(4000) }
        );
        if (resp.ok) {
          const data = await resp.json();
          city = data.city || data.locality || data.principalSubdivision || "Your area";
        }
      } catch {}

      const result = { lat, lon, city, loading: false };
      setLocation(result);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, city, timestamp: Date.now() }));
    };

    resolve();
  }, []);

  return location;
}
