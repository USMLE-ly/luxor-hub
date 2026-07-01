import { r as reactExports, e as useNavigate, j as jsxRuntimeExports } from "./index-UvNQFckZ.js";
import { s as supabase, B as Button } from "./AppContent-9kIwMzo7.js";
import { I as Input } from "./input-DAE276Fi.js";
import { L as Label } from "./label-DFUG8H2k.js";
import { t as toast } from "./index-CXhnqnHQ.js";
import { G as GoldParticles, P as PremiumCardWrapper, a as GoldDivider, b as GoldShimmerButton } from "./PremiumAuthCard-m73dNHiH.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { A as ArrowLeft } from "./arrow-left-Cwmr1lNp.js";
import { C as CircleCheckBig } from "./circle-check-big-BdWOWpAd.js";
import { L as Lock } from "./lock-BDMviZcR.js";
import "./index-tS1BiThI.js";
const ResetPassword = () => {
  const [password, setPassword] = reactExports.useState("");
  const [confirmPassword, setConfirmPassword] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [success, setSuccess] = reactExports.useState(false);
  const [isRecovery, setIsRecovery] = reactExports.useState(false);
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
    return () => subscription.unsubscribe();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("Password updated successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-1/4 right-1/4 w-80 h-80 bg-[hsl(43,80%,42%)]/10 rounded-full blur-[100px]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(GoldParticles, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 },
        className: "relative z-10 w-full max-w-md",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => navigate("/auth"),
              className: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
                "Back to sign in"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(PremiumCardWrapper, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-8 bg-gradient-to-r from-transparent to-[hsl(43,80%,58%,0.4)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-[0.3em] text-[hsl(43,80%,58%,0.6)] font-sans uppercase", children: "LEXOR®" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-8 bg-gradient-to-l from-transparent to-[hsl(43,80%,58%,0.4)]" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold gold-text", children: success ? "All Set!" : "New Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GoldDivider, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm", children: success ? "Your password has been updated." : "Choose a new password for your account." })
            ] }),
            success ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-[hsl(43,80%,58%,0.15)] flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-8 h-8 text-[hsl(43,80%,58%)]" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GoldShimmerButton, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  onClick: () => navigate("/dashboard"),
                  className: "w-full gold-gradient text-primary-foreground font-semibold rounded-xl h-12 hover:shadow-[0_0_20px_hsl(43,80%,58%,0.3)] transition-all relative",
                  children: "Go to Dashboard"
                }
              ) })
            ] }) : !isRecovery ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: "This link may have expired. Please request a new password reset." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => navigate("/forgot-password"),
                  className: "border-[hsl(43,80%,58%,0.3)] hover:border-[hsl(43,80%,58%,0.5)] rounded-xl font-sans hover:shadow-[0_0_15px_hsl(43,80%,58%,0.15)]",
                  children: "Request New Link"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "text-sm font-sans text-muted-foreground", children: "New Password" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "password",
                      type: "password",
                      placeholder: "••••••••",
                      value: password,
                      onChange: (e) => setPassword(e.target.value),
                      required: true,
                      minLength: 6,
                      className: "pl-10 bg-secondary border-glass-border rounded-xl h-12 font-sans focus:border-[hsl(43,80%,58%,0.5)] focus:ring-1 focus:ring-[hsl(43,80%,58%,0.3)] transition-all"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "confirm", className: "text-sm font-sans text-muted-foreground", children: "Confirm Password" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "confirm",
                      type: "password",
                      placeholder: "••••••••",
                      value: confirmPassword,
                      onChange: (e) => setConfirmPassword(e.target.value),
                      required: true,
                      minLength: 6,
                      className: "pl-10 bg-secondary border-glass-border rounded-xl h-12 font-sans focus:border-[hsl(43,80%,58%,0.5)] focus:ring-1 focus:ring-[hsl(43,80%,58%,0.3)] transition-all"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GoldShimmerButton, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  disabled: loading,
                  className: "w-full gold-gradient text-primary-foreground font-semibold rounded-xl h-12 text-base hover:shadow-[0_0_20px_hsl(43,80%,58%,0.3)] transition-all relative",
                  children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }) : "Update Password"
                }
              ) })
            ] })
          ] })
        ]
      }
    )
  ] });
};
export {
  ResetPassword as default
};
