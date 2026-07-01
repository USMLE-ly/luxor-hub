import { d as createLucideIcon } from "./AppContent-9kIwMzo7.js";
import { r as reactExports } from "./index-UvNQFckZ.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Cloud = createLucideIcon("Cloud", [
  ["path", { d: "M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z", key: "p7xjir" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Droplets = createLucideIcon("Droplets", [
  [
    "path",
    {
      d: "M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",
      key: "1ptgy4"
    }
  ],
  [
    "path",
    {
      d: "M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",
      key: "1sl1rz"
    }
  ]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const MapPin = createLucideIcon("MapPin", [
  [
    "path",
    {
      d: "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",
      key: "1r0f0z"
    }
  ],
  ["circle", { cx: "12", cy: "10", r: "3", key: "ilqhr7" }]
]);
const STORAGE_KEY = "luxor-user-location";
const CACHE_TTL = 30 * 60 * 1e3;
function useUserLocation() {
  const [location, setLocation] = reactExports.useState({
    lat: 40.7128,
    lon: -74.006,
    city: "New York",
    loading: true
  });
  reactExports.useEffect(() => {
    const resolve = async () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            setLocation({ lat: parsed.lat, lon: parsed.lon, city: parsed.city, loading: false });
            return;
          }
        }
      } catch {
      }
      let lat = 40.7128, lon = -74.006;
      let gotGeo = false;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise(
            (resolve2, reject) => navigator.geolocation.getCurrentPosition(resolve2, reject, { timeout: 5e3 })
          );
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
          gotGeo = true;
        } catch {
        }
      }
      if (!gotGeo) {
        try {
          const resp = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4e3) });
          if (resp.ok) {
            const data = await resp.json();
            if (data.latitude && data.longitude) {
              lat = data.latitude;
              lon = data.longitude;
              const city2 = data.city || "Your area";
              const result2 = { lat, lon, city: city2, loading: false };
              setLocation(result2);
              localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, city: city2, timestamp: Date.now() }));
              return;
            }
          }
        } catch {
        }
      }
      let city = "Your area";
      try {
        const resp = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
          { signal: AbortSignal.timeout(4e3) }
        );
        if (resp.ok) {
          const data = await resp.json();
          city = data.city || data.locality || data.principalSubdivision || "Your area";
        }
      } catch {
      }
      const result = { lat, lon, city, loading: false };
      setLocation(result);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lat, lon, city, timestamp: Date.now() }));
    };
    resolve();
  }, []);
  return location;
}
export {
  Cloud as C,
  Droplets as D,
  MapPin as M,
  useUserLocation as u
};
