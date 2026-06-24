import { r as reactExports, e as useNavigate, j as jsxRuntimeExports } from "./index-BJjnbSuc.js";
import { B as Button, s as supabase } from "./AppContent-4cFLEqQ4.js";
import { I as Input } from "./input-BLBpTUfT.js";
import { L as Label } from "./label-BI9Vm6gS.js";
import { t as toast } from "./index-DqqhH6-L.js";
import { G as GoldParticles, P as PremiumCardWrapper, a as GoldDivider, b as GoldShimmerButton } from "./PremiumAuthCard-DAjXfX7J.js";
import { m as motion } from "./proxy-DPNpeU0t.js";
import { A as ArrowLeft } from "./arrow-left-Di9ks3uY.js";
import { M as Mail } from "./mail-BPCICLsx.js";
import "./index-DoiO9BYn.js";
const ForgotPassword = () => {
  const [email, setEmail] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [sent, setSent] = reactExports.useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      if (error) throw error;
      setSent(true);
      toast.success("Check your email for a reset link!");
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold gold-text", children: "Reset Password" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GoldDivider, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm", children: sent ? "We've sent you a reset link." : "Enter your email to receive a reset link." })
            ] }),
            sent ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 rounded-full bg-[hsl(43,80%,58%,0.15)] flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-8 h-8 text-[hsl(43,80%,58%)]" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground font-sans", children: [
                "Check your inbox for ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: email }),
                " and click the link to reset your password."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "outline",
                  onClick: () => navigate("/auth"),
                  className: "border-[hsl(43,80%,58%,0.3)] hover:border-[hsl(43,80%,58%,0.5)] rounded-xl font-sans hover:shadow-[0_0_15px_hsl(43,80%,58%,0.15)]",
                  children: "Return to Sign In"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", className: "text-sm font-sans text-muted-foreground", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      id: "email",
                      type: "email",
                      placeholder: "you@example.com",
                      value: email,
                      onChange: (e) => setEmail(e.target.value),
                      required: true,
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
                  children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }) : "Send Reset Link"
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
  ForgotPassword as default
};
