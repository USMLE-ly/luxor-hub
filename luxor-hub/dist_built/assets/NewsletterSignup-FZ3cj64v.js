import { d as createLucideIcon, s as supabase } from "./AppContent-h4IlOpH8.js";
import { r as reactExports, j as jsxRuntimeExports } from "./index-CqA86RF3.js";
import { m as motion } from "./proxy-ShtysCL3.js";
import { C as CircleCheckBig } from "./circle-check-big-Dh2MBFHB.js";
import { M as Mail } from "./mail-C5iZYiKe.js";
import { L as LoaderCircle } from "./loader-circle-CEY9nmQc.js";
import { A as ArrowRight } from "./arrow-right-B1HpFnXV.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Tag = createLucideIcon("Tag", [
  [
    "path",
    {
      d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z",
      key: "vktsd0"
    }
  ],
  ["circle", { cx: "7.5", cy: "7.5", r: ".5", fill: "currentColor", key: "kqv944" }]
]);
const NewsletterSignup = () => {
  const [email, setEmail] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("idle");
  const [errorMsg, setErrorMsg] = reactExports.useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: trimmed });
    if (error) {
      if (error.code === "23505") {
        setStatus("success");
      } else {
        setErrorMsg("Something went wrong. Please try again.");
        setStatus("error");
      }
    } else {
      setStatus("success");
    }
  };
  if (status === "success") {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        className: "rounded-2xl border border-border/20 bg-card/30 backdrop-blur-sm p-8 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-8 h-8 text-primary mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground mb-1", children: "You're In!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Weekly style intelligence delivered to your inbox." })
        ]
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 20 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0.5 },
      className: "rounded-2xl border border-border/20 bg-card/30 backdrop-blur-sm p-8",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-5 h-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: "Style Intelligence Weekly" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-5", children: "AI styling tips and trend picks — every Thursday." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              value: email,
              onChange: (e) => {
                setEmail(e.target.value);
                setStatus("idle");
              },
              placeholder: "your@email.com",
              className: "flex-1 h-10 rounded-lg border border-border/30 bg-background/50 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30",
              disabled: status === "loading",
              required: true
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: status === "loading",
              className: "inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground px-4 h-10 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50",
              children: status === "loading" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Subscribe",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5" })
              ] })
            }
          )
        ] }),
        status === "error" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive mt-2", children: errorMsg })
      ]
    }
  );
};
export {
  NewsletterSignup as N,
  Tag as T
};
