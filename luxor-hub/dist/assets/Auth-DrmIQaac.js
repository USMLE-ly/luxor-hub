import { r as reactExports, e as useNavigate, j as jsxRuntimeExports } from "./index-BJjnbSuc.js";
import { B as Button, s as supabase } from "./AppContent-4cFLEqQ4.js";
import { I as Input } from "./input-BLBpTUfT.js";
import { L as Label } from "./label-BI9Vm6gS.js";
import { t as toast } from "./index-DqqhH6-L.js";
import { t as trackEvent } from "./fbPixel-CTUEdhYl.js";
import { G as GoldParticles, P as PremiumCardWrapper, a as GoldDivider, b as GoldShimmerButton } from "./PremiumAuthCard-DAjXfX7J.js";
import { m as motion } from "./proxy-DPNpeU0t.js";
import { A as ArrowLeft } from "./arrow-left-Di9ks3uY.js";
import { U as User } from "./user-5K2EfAuQ.js";
import { M as Mail } from "./mail-BPCICLsx.js";
import { L as Lock } from "./lock-KX049Fqg.js";
import "./index-DoiO9BYn.js";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const Auth = () => {
  const [isLogin, setIsLogin] = reactExports.useState(true);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [displayName, setDisplayName] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [errors, setErrors] = reactExports.useState({});
  const navigate = useNavigate();
  const emailRef = reactExports.useRef(null);
  const passwordRef = reactExports.useRef(null);
  const nameRef = reactExports.useRef(null);
  const validate = () => {
    var _a, _b, _c;
    const newErrors = {};
    if (!isLogin && !displayName.trim()) {
      newErrors.displayName = "Display name is required.";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    if (newErrors.displayName) (_a = nameRef.current) == null ? void 0 : _a.focus();
    else if (newErrors.email) (_b = emailRef.current) == null ? void 0 : _b.focus();
    else if (newErrors.password) (_c = passwordRef.current) == null ? void 0 : _c.focus();
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (loading) return;
    if (!navigator.onLine) {
      toast.error("You appear to be offline. Please check your connection and try again.");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back to LEXOR®!");
        const { data: profile } = await supabase.from("style_profiles").select("onboarding_completed").eq("user_id", (await supabase.auth.getUser()).data.user.id).single();
        navigate((profile == null ? void 0 : profile.onboarding_completed) ? "/dashboard" : "/onboarding");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        trackEvent("CompleteRegistration", { content_name: "LEXOR® Signup" });
        toast.success("Account created! Welcome to LEXOR®!");
        navigate("/onboarding");
      }
    } catch (error) {
      const msg = error.message || "";
      if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch")) {
        toast.error("Network error. Please check your connection and try again.");
      } else if (msg.includes("Invalid login credentials")) {
        toast.error("Incorrect email or password. Please try again.");
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Please verify your email before signing in. Check your inbox.");
      } else if (msg.includes("User already registered")) {
        toast.error("This email is already registered. Try signing in instead.");
      } else {
        toast.error(msg || "Something went wrong. Please try again.");
      }
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
              onClick: () => navigate("/"),
              className: "flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans text-sm",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
                "Back to home"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(PremiumCardWrapper, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-8 bg-gradient-to-r from-transparent to-[hsl(43,80%,58%,0.4)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tracking-[0.3em] text-[hsl(43,80%,58%,0.6)] font-sans uppercase", children: "Est. 2020" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-8 bg-gradient-to-l from-transparent to-[hsl(43,80%,58%,0.4)]" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-bold gold-text", children: "LEXOR®" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GoldDivider, {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm", children: isLogin ? "Welcome back. Your style awaits." : "Begin your style journey." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", "aria-label": "Authentication form", noValidate: true, children: [
              !isLogin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "name", className: "text-sm font-sans text-muted-foreground", children: "Display Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      ref: nameRef,
                      id: "name",
                      type: "text",
                      placeholder: "Your name",
                      value: displayName,
                      onChange: (e) => {
                        setDisplayName(e.target.value);
                        setErrors((p) => ({ ...p, displayName: void 0 }));
                      },
                      autoComplete: "name",
                      "aria-invalid": !!errors.displayName,
                      "aria-describedby": errors.displayName ? "name-error" : void 0,
                      className: "pl-10 bg-secondary border-glass-border rounded-xl h-12 font-sans focus:border-[hsl(43,80%,58%,0.5)] focus:ring-1 focus:ring-[hsl(43,80%,58%,0.3)] transition-all"
                    }
                  )
                ] }),
                errors.displayName && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "name-error", role: "alert", className: "text-xs text-destructive font-sans mt-1", children: errors.displayName })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", className: "text-sm font-sans text-muted-foreground", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      ref: emailRef,
                      id: "email",
                      type: "email",
                      placeholder: "you@example.com",
                      value: email,
                      onChange: (e) => {
                        setEmail(e.target.value);
                        setErrors((p) => ({ ...p, email: void 0 }));
                      },
                      autoComplete: "email",
                      "aria-invalid": !!errors.email,
                      "aria-describedby": errors.email ? "email-error" : void 0,
                      className: "pl-10 bg-secondary border-glass-border rounded-xl h-12 font-sans focus:border-[hsl(43,80%,58%,0.5)] focus:ring-1 focus:ring-[hsl(43,80%,58%,0.3)] transition-all"
                    }
                  )
                ] }),
                errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "email-error", role: "alert", className: "text-xs text-destructive font-sans mt-1", children: errors.email })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "text-sm font-sans text-muted-foreground", children: "Password" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      ref: passwordRef,
                      id: "password",
                      type: "password",
                      placeholder: "••••••••",
                      value: password,
                      onChange: (e) => {
                        setPassword(e.target.value);
                        setErrors((p) => ({ ...p, password: void 0 }));
                      },
                      autoComplete: isLogin ? "current-password" : "new-password",
                      "aria-invalid": !!errors.password,
                      "aria-describedby": errors.password ? "password-error" : void 0,
                      className: "pl-10 bg-secondary border-glass-border rounded-xl h-12 font-sans focus:border-[hsl(43,80%,58%,0.5)] focus:ring-1 focus:ring-[hsl(43,80%,58%,0.3)] transition-all"
                    }
                  )
                ] }),
                errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "password-error", role: "alert", className: "text-xs text-destructive font-sans mt-1", children: errors.password })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(GoldShimmerButton, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "submit",
                  disabled: loading,
                  className: "w-full gold-gradient text-primary-foreground font-semibold rounded-xl h-12 text-base hover:shadow-[0_0_20px_hsl(43,80%,58%,0.3)] transition-all relative",
                  children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: isLogin ? "Sign In" : "Create Account" })
                }
              ) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-center space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => {
                    setIsLogin(!isLogin);
                    setErrors({});
                  },
                  className: "text-sm font-sans block mx-auto group",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: isLogin ? "Don't have an account? " : "Already have an account? " }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-r from-[hsl(38,72%,42%)] to-[hsl(48,80%,58%)] bg-clip-text text-transparent font-medium group-hover:brightness-125 transition-all", children: isLogin ? "Sign up" : "Sign in" })
                  ]
                }
              ),
              isLogin && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => navigate("/forgot-password"),
                  className: "text-xs font-sans block mx-auto bg-gradient-to-r from-[hsl(38,72%,42%)] to-[hsl(48,80%,58%)] bg-clip-text text-transparent hover:brightness-125 transition-all",
                  children: "Forgot your password?"
                }
              )
            ] })
          ] })
        ]
      }
    )
  ] });
};
export {
  Auth as default
};
