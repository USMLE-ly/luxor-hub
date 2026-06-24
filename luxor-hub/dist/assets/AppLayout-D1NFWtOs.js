import { j as jsxRuntimeExports, e as useNavigate, u as useLocation, r as reactExports } from "./index-he9NPeB4.js";
import { e as useAuth } from "./AppContent-Pfm712F6.js";
import { B as BottomNav } from "./BottomNav-CmhESsg9.js";
import { m as motion } from "./proxy-DbHhgb80.js";
import { A as AnimatePresence } from "./index-CVyze4JH.js";
function PageTransition({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: { duration: 0.3, ease: "easeOut" },
      children
    }
  );
}
function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  reactExports.useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" }) });
  }
  if (!user) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background pb-16", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PageTransition, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("main", { children }) }, location.pathname) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
}
export {
  AppLayout as A
};
