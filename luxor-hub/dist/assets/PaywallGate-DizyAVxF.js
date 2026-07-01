import { j as jsxRuntimeExports, N as Navigate } from "./index-DFKWyX4C.js";
import { e as useAuth, s as supabase } from "./AppContent-bHL5AEXz.js";
import { u as useQuery } from "./useQuery-DcgQYXXN.js";
const PaywallGate = ({ children }) => {
  const { user, loading } = useAuth();
  const { data: hasAccess, isLoading: subLoading } = useQuery({
    queryKey: ["subscription-check", user == null ? void 0 : user.id],
    queryFn: async () => {
      if (!user) return false;
      const localPaid = localStorage.getItem("luxor_paid");
      if (localPaid && localPaid !== "false") return true;
      const { data } = await supabase.from("subscriptions").select("id, plan_tier").eq("user_id", user.id).eq("status", "active").limit(1).maybeSingle();
      if (data) {
        localStorage.setItem("luxor_paid", data.plan_tier || "starter");
        return true;
      }
      return false;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1e3
  });
  if (loading || subLoading) return null;
  if (!user) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/auth", replace: true });
  if (!hasAccess) return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/paywall", replace: true });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
};
export {
  PaywallGate as default
};
