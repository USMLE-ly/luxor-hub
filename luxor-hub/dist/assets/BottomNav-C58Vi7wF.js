import { u as useLocation, e as useNavigate, j as jsxRuntimeExports } from "./index-CHmOPdwM.js";
import { d as createLucideIcon, h as haptic } from "./AppContent-Bbhy20ck.js";
import { m as motion } from "./proxy-PXi4GB5x.js";
import { S as Shirt } from "./shirt-B5KBwn5M.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const CalendarDays = createLucideIcon("CalendarDays", [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }],
  ["path", { d: "M8 14h.01", key: "6423bh" }],
  ["path", { d: "M12 14h.01", key: "1etili" }],
  ["path", { d: "M16 14h.01", key: "1gbofw" }],
  ["path", { d: "M8 18h.01", key: "lrp35t" }],
  ["path", { d: "M12 18h.01", key: "mhygvu" }],
  ["path", { d: "M16 18h.01", key: "kzsmim" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const House = createLucideIcon("House", [
  ["path", { d: "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8", key: "5wwlr5" }],
  [
    "path",
    {
      d: "M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",
      key: "1d0kgt"
    }
  ]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Layers = createLucideIcon("Layers", [
  [
    "path",
    {
      d: "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",
      key: "8b97xw"
    }
  ],
  ["path", { d: "m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65", key: "dd6zsq" }],
  ["path", { d: "m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65", key: "ep9fru" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ScanLine = createLucideIcon("ScanLine", [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
  ["path", { d: "M7 12h10", key: "b7w52i" }]
]);
const tabs = [
  { label: "DNA", icon: House, path: "/dashboard" },
  { label: "Schedule", icon: CalendarDays, path: "/outfit-calendar" },
  { label: "Analysis", icon: ScanLine, path: "/outfit-analysis" },
  { label: "Dressing Room", icon: Layers, path: "/dressing-room" },
  { label: "Closet", icon: Shirt, path: "/closet" }
];
function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed bottom-0 inset-x-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/50 pb-[env(safe-area-inset-bottom)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-around h-14 max-w-lg mx-auto", children: tabs.map((tab) => {
    const isActive = location.pathname === tab.path || tab.path === "/dashboard" && location.pathname === "/style-dna" || tab.path === "/dashboard" && location.pathname === "/color-type";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => {
          haptic("selection");
          navigate(tab.path);
        },
        className: "flex flex-col items-center gap-0.5 min-w-[52px] pt-1.5 pb-1 relative",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              animate: { scale: isActive ? 1.12 : 1 },
              transition: { type: "spring", stiffness: 400, damping: 20 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                tab.icon,
                {
                  className: `w-[18px] h-[18px] transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`,
                  strokeWidth: isActive ? 2.4 : 1.8
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: `text-[9px] font-sans transition-colors ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`,
              children: tab.label
            }
          ),
          isActive && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              layoutId: "bottomNavDot",
              className: "absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary",
              transition: { type: "spring", stiffness: 500, damping: 30 }
            }
          )
        ]
      },
      tab.label
    );
  }) }) });
}
export {
  BottomNav as B,
  CalendarDays as C,
  Layers as L
};
