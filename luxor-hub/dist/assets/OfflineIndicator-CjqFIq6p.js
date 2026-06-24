import { r as reactExports, j as jsxRuntimeExports } from "./index-CHmOPdwM.js";
import { A as AnimatePresence } from "./index-VsQuQq_u.js";
import { m as motion } from "./proxy-PXi4GB5x.js";
import { d as createLucideIcon } from "./AppContent-Bbhy20ck.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const WifiOff = createLucideIcon("WifiOff", [
  ["path", { d: "M12 20h.01", key: "zekei9" }],
  ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }],
  ["path", { d: "M5 12.859a10 10 0 0 1 5.17-2.69", key: "1dl1wf" }],
  ["path", { d: "M19 12.859a10 10 0 0 0-2.007-1.523", key: "4k23kn" }],
  ["path", { d: "M2 8.82a15 15 0 0 1 4.177-2.643", key: "1grhjp" }],
  ["path", { d: "M22 8.82a15 15 0 0 0-11.288-3.764", key: "z3jwby" }],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Wifi = createLucideIcon("Wifi", [
  ["path", { d: "M12 20h.01", key: "zekei9" }],
  ["path", { d: "M2 8.82a15 15 0 0 1 20 0", key: "dnpr2z" }],
  ["path", { d: "M5 12.859a10 10 0 0 1 14 0", key: "1x1e6c" }],
  ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0", key: "1bycff" }]
]);
const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = reactExports.useState(!navigator.onLine);
  const [showReconnected, setShowReconnected] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3e3);
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AnimatePresence, { children: [
    isOffline && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { y: -60, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -60, opacity: 0 },
        transition: { type: "spring", damping: 20 },
        className: "fixed top-0 left-0 right-0 z-[9999] bg-destructive text-destructive-foreground px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-sans shadow-lg",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "w-4 h-4" }),
          "You're offline — some features may be unavailable"
        ]
      }
    ),
    showReconnected && !isOffline && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { y: -60, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        exit: { y: -60, opacity: 0 },
        transition: { type: "spring", damping: 20 },
        className: "fixed top-0 left-0 right-0 z-[9999] bg-primary text-primary-foreground px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-sans shadow-lg",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wifi, { className: "w-4 h-4" }),
          "You're back online!"
        ]
      }
    )
  ] });
};
export {
  OfflineIndicator as default
};
