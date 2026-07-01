import { j as jsxRuntimeExports, e as useNavigate, u as useLocation, r as reactExports } from "./index-UvNQFckZ.js";
import { e as useAuth } from "./AppContent-9kIwMzo7.js";
import { B as BottomNav } from "./BottomNav-DDKq4ZnH.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { A as AnimatePresence } from "./index-CI22_94N.js";
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
