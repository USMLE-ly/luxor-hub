import { useState, useEffect, useCallback } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";

export interface WeatherDay {
  date: string;
  temp: number;
  tempMax: number;
  tempMin: number;
  description: string;
  icon: string;
  code: number;
  rain: boolean;
}

/**
 * Shared hook for fetching 7-day weather forecast.
 * Currently used by OutfitCalendar, available for MonthlyReport, Council, etc.
 */
export function useWeatherForecast() {
  const { lat, lon, city, loading: locationLoading } = useUserLocation();
  const [weatherData, setWeatherData] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async () => {
    if (!lat || !lon) return;
    try {
      setLoading(true);
      const resp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max&timezone=auto&forecast_days=7`
      );
      if (!resp.ok) throw new Error("Weather fetch failed");
      const data = await resp.json();
      const days: WeatherDay[] = data.daily.time.map((date: string, i: number) => ({
        date,
        temp: Math.round((data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2),
        tempMax: Math.round(data.daily.temperature_2m_max[i]),
        tempMin: Math.round(data.daily.temperature_2m_min[i]),
        description: getWeatherDescription(data.daily.weathercode[i]),
        icon: getWeatherIcon(data.daily.weathercode[i]),
        code: data.daily.weathercode[i],
        rain: (data.daily.precipitation_probability_max[i] || 0) > 40,
      }));
      setWeatherData(days);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Weather unavailable");
    } finally {
      setLoading(false);
    }
  }, [lat, lon]);

  useEffect(() => {
    if (!locationLoading && lat && lon) fetchForecast();
  }, [locationLoading, lat, lon, fetchForecast]);

  const getWeatherForDate = (date: Date): WeatherDay | undefined => {
    const dateStr = date.toISOString().split("T")[0];
    return weatherData.find(w => w.date === dateStr);
  };

  return { weatherData, getWeatherForDate, loading: loading || locationLoading, error, city, refetch: fetchForecast };
}

function getWeatherDescription(code: number): string {
  const map: Record<number, string> = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Foggy", 48: "Rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow", 80: "Rain showers",
    81: "Moderate rain showers", 82: "Violent rain showers", 95: "Thunderstorm",
  };
  return map[code] || "Unknown";
}

function getWeatherIcon(code: number): string {
  if (code <= 1) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "❄️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}
