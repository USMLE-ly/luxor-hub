import { e as useNavigate, r as reactExports, j as jsxRuntimeExports } from "./index-he9NPeB4.js";
import { u as usePlanTier } from "./usePlanTier-BsgZhTQz.js";
import { d as createLucideIcon, e as useAuth, B as Button, s as supabase } from "./AppContent-Pfm712F6.js";
import { A as AppLayout } from "./AppLayout-D1NFWtOs.js";
import { G as GradientButton } from "./gradient-button-1wcKRwDR.js";
import { F as FaceShapeIllustration, B as BodyShapeIllustration, G as Glasses, a as Gem } from "./BodyShapeIllustration-DmYhdpmw.js";
import { m as motion } from "./proxy-DbHhgb80.js";
import { A as ArrowRight } from "./arrow-right-Cjd9-f44.js";
import { P as Palette } from "./palette-m4pn_ftc.js";
import { S as Scissors } from "./scissors-CWqelB3K.js";
import { S as Shirt } from "./shirt-fv7ktDre.js";
import { C as Check } from "./check-DWQqrZil.js";
import { G as Gift } from "./gift-P-Kwhx1R.js";
import { S as Sparkles } from "./sparkles-BUuU6D0I.js";
import { S as Star } from "./star-DcHfdK6T.js";
import { U as User } from "./user-BVMiBHRn.js";
import { C as CircleCheck } from "./circle-check-CfChTOOS.js";
import { L as Layers } from "./BottomNav-CmhESsg9.js";
import { S as ShieldCheck } from "./shield-check-DkkPAW_O.js";
import { H as Heart } from "./heart-TC24fZXB.js";
import { T as TrendingUp } from "./trending-up-Cpw59buX.js";
import { C as ChevronRight } from "./chevron-right-IhE33Fp6.js";
import "./useQuery-D2h7yNys.js";
import "./index-CVyze4JH.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Paintbrush = createLucideIcon("Paintbrush", [
  ["path", { d: "m14.622 17.897-10.68-2.913", key: "vj2p1u" }],
  [
    "path",
    {
      d: "M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z",
      key: "18tc5c"
    }
  ],
  [
    "path",
    {
      d: "M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15",
      key: "ytzfxy"
    }
  ]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ScanFace = createLucideIcon("ScanFace", [
  ["path", { d: "M3 7V5a2 2 0 0 1 2-2h2", key: "aa7l1z" }],
  ["path", { d: "M17 3h2a2 2 0 0 1 2 2v2", key: "4qcy5o" }],
  ["path", { d: "M21 17v2a2 2 0 0 1-2 2h-2", key: "6vwrx8" }],
  ["path", { d: "M7 21H5a2 2 0 0 1-2-2v-2", key: "ioqczr" }],
  ["path", { d: "M8 14s1.5 2 4 2 4-2 4-2", key: "1y1vjs" }],
  ["path", { d: "M9 9h.01", key: "1q5me6" }],
  ["path", { d: "M15 9h.01", key: "x1ddxp" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Shapes = createLucideIcon("Shapes", [
  [
    "path",
    {
      d: "M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z",
      key: "1bo67w"
    }
  ],
  ["rect", { x: "3", y: "14", width: "7", height: "7", rx: "1", key: "1bkyp8" }],
  ["circle", { cx: "17.5", cy: "17.5", r: "3.5", key: "w3z12y" }]
]);
const colorNameToHsl = {
  "Navy": "hsl(220, 60%, 25%)",
  "Burgundy": "hsl(345, 60%, 30%)",
  "Forest Green": "hsl(140, 50%, 25%)",
  "Charcoal": "hsl(0, 0%, 30%)",
  "Olive": "hsl(80, 40%, 35%)",
  "Rust": "hsl(15, 70%, 45%)",
  "Teal": "hsl(180, 50%, 35%)",
  "Cream": "hsl(40, 60%, 90%)",
  "Camel": "hsl(30, 50%, 55%)",
  "Slate Blue": "hsl(210, 30%, 50%)",
  "Terracotta": "hsl(15, 55%, 50%)",
  "Sage": "hsl(130, 20%, 55%)",
  "Ivory": "hsl(40, 40%, 92%)",
  "Stone": "hsl(30, 15%, 60%)",
  "Dusty Rose": "hsl(350, 30%, 65%)",
  "Lavender": "hsl(270, 40%, 70%)",
  "Coral": "hsl(16, 80%, 65%)",
  "Mustard": "hsl(45, 80%, 50%)",
  "Black": "hsl(0, 0%, 10%)",
  "White": "hsl(0, 0%, 95%)",
  "Red": "hsl(0, 70%, 50%)",
  "Blue": "hsl(210, 70%, 50%)",
  "Green": "hsl(120, 50%, 40%)",
  "Beige": "hsl(35, 40%, 80%)",
  "Brown": "hsl(25, 50%, 35%)",
  "Gray": "hsl(0, 0%, 50%)",
  "Pink": "hsl(340, 60%, 65%)",
  "Orange": "hsl(25, 80%, 55%)",
  "Yellow": "hsl(50, 80%, 55%)",
  "Purple": "hsl(270, 50%, 45%)"
};
function getColorHsl(name) {
  return colorNameToHsl[name] || `hsl(${Math.abs(name.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % 360}, 50%, 50%)`;
}
function getFaceShapeTips(shape) {
  const s = shape.toLowerCase();
  if (s.includes("oval")) return [
    "Most frames work — go bold or geometric",
    "Side-swept bangs enhance balanced proportions",
    "Crew and V-necks both work. Pick based on mood."
  ];
  if (s.includes("round")) return [
    "Angular frames sharpen a round face instantly",
    "V-necklines and open collars lengthen your face",
    "Longer hair with crown volume creates a slimming effect"
  ];
  if (s.includes("square")) return [
    "Round or oval frames soften a strong jawline",
    "Scoop and round necklines balance angular features",
    "Soft layers with a side part complement bone structure"
  ];
  if (s.includes("heart") || s.includes("inverted triangle")) return [
    "Cat-eye or bottom-heavy frames balance a wider forehead",
    "Chin-length bobs and side-swept bangs add jaw width",
    "V-neck and scoop-neck tops draw attention downward"
  ];
  if (s.includes("oblong") || s.includes("long") || s.includes("rectangle")) return [
    "Wide frames and aviators add horizontal balance",
    "Bangs and chin-length cuts shorten your face visually",
    "Boat-neck and crew-neck tops create width"
  ];
  if (s.includes("diamond")) return [
    "Oval or rimless glasses highlight your cheekbones",
    "V-neck and sweetheart necklines mirror your face geometry",
    "Volume at forehead or chin balances your widest points"
  ];
  return [
    "Choose frames that contrast your face's dominant lines",
    "Necklines that mirror your face shape create visual harmony",
    "Add volume where your face is narrowest for balance"
  ];
}
function getBodyShapeTips(shape) {
  const s = shape.toLowerCase();
  if (s.includes("hourglass")) return [
    "Wrap dresses were made for hourglass figures. Lean into fitted cuts.",
    "Belted coats and high-waisted trousers are your power moves",
    "Structured fabrics hold your shape. Skip overly drapey material."
  ];
  if (s.includes("pear") || s.includes("triangle")) return [
    "Boat-neck, off-shoulder, and statement collars broaden your shoulders",
    "A-line skirts and straight-leg trousers skim the hip area",
    "Dark bottoms paired with lighter tops create balanced proportions"
  ];
  if (s.includes("inverted") || s.includes("trapezoid")) return [
    "V-necklines and vertical details soften broader shoulders",
    "Flared or wide-leg pants add volume to balance your upper body",
    "A-line and fuller skirts create proportional harmony"
  ];
  if (s.includes("rectangle") || s.includes("athletic")) return [
    "Peplum tops, ruching, and belted pieces create curves at the waist",
    "Layering adds dimension — jackets over fitted tops with textured bottoms",
    "High-waisted bottoms with tucked-in tops define your midsection"
  ];
  if (s.includes("round") || s.includes("oval") || s.includes("apple")) return [
    "Empire waistlines and A-line silhouettes skim the midsection",
    "V-necklines create a lengthening vertical line through your torso",
    "Structured blazers define your shape without clinging"
  ];
  return [
    "Focus on fit — well-tailored pieces always beat trendy but ill-fitting items",
    "Use color blocking to highlight areas you love",
    "Structured outer layers add dimension to any silhouette"
  ];
}
const StyleDNA = () => {
  var _a, _b, _c, _d, _e;
  const { user, loading: authLoading } = useAuth();
  usePlanTier();
  const navigate = useNavigate();
  const [profile, setProfile] = reactExports.useState(null);
  const [dna, setDna] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    const fetchProfile = async () => {
      const { data } = await supabase.from("style_profiles").select("*").eq("user_id", user.id).single();
      if (data) {
        setProfile(data);
        const prefs2 = data.preferences;
        if (prefs2 == null ? void 0 : prefs2.aiAnalysis) setDna(prefs2.aiAnalysis);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, authLoading, navigate]);
  if (loading || authLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" }) });
  }
  const archetype = (profile == null ? void 0 : profile.archetype) || "Style Explorer";
  const styleScore = (profile == null ? void 0 : profile.style_score) || 25;
  const calibrationProgress = ((_a = profile == null ? void 0 : profile.preferences) == null ? void 0 : _a.calibrationProgress) || 0;
  const prefs = profile == null ? void 0 : profile.preferences;
  const faceShape = (prefs == null ? void 0 : prefs.faceShape) || null;
  const faceShapeDescription = (prefs == null ? void 0 : prefs.faceShapeDescription) || null;
  const bodyShape = (prefs == null ? void 0 : prefs.bodyShape) || null;
  const bodyShapeTraits = (prefs == null ? void 0 : prefs.bodyShapeTraits) || [];
  const colorSeason = (dna == null ? void 0 : dna.colorSeason) || "—";
  const styleType = archetype;
  const bodyType = bodyShape || "—";
  const lifestyle = ((_b = prefs == null ? void 0 : prefs.lifestyle) == null ? void 0 : _b[0]) || null;
  const profession = ((_c = prefs == null ? void 0 : prefs.profession) == null ? void 0 : _c[0]) || null;
  const styleMood = (prefs == null ? void 0 : prefs.styleMood) || [];
  const styleEvolution = (dna == null ? void 0 : dna.styleEvolution) || [];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-8 overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        className: "mx-4 mt-5 rounded-2xl border border-border/60 overflow-hidden relative bg-card/60 backdrop-blur-xl",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              className: "absolute inset-0 pointer-events-none",
              style: { background: "linear-gradient(105deg, transparent 40%, hsl(var(--primary) / 0.06) 50%, transparent 60%)" },
              initial: { x: "-100%" },
              animate: { x: "200%" },
              transition: { duration: 2.5, delay: 0.8, ease: "easeInOut" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 relative z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground", children: "Your Blueprint for Looking Incredible" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Button,
                {
                  variant: "outline",
                  size: "sm",
                  onClick: () => navigate("/color-type"),
                  className: "rounded-full text-xs px-4 h-8 border-border/60",
                  children: [
                    "View ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3 h-3 ml-1" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3 mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/color-type"), className: "text-left group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors shadow-[0_0_8px_hsl(var(--primary)/0.15)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "w-3.5 h-3.5 text-primary" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans text-muted-foreground", children: "Color type" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans font-bold text-foreground text-sm leading-tight", children: colorSeason })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate("/calibration"), className: "text-left group", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-lg bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors shadow-[0_0_8px_hsl(var(--destructive)/0.15)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Scissors, { className: "w-3.5 h-3.5 text-destructive" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans text-muted-foreground", children: "Style Type" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans font-bold text-foreground text-sm leading-tight", children: styleType })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center shadow-[0_0_8px_hsl(var(--accent)/0.15)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "w-3.5 h-3.5 text-accent" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans text-muted-foreground", children: "Body Type" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans font-bold text-foreground text-sm leading-tight", children: bodyType })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-gradient-to-r from-transparent via-border to-transparent mb-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-bold text-foreground", children: "Sharpen Your Style Edge" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground text-xs font-sans max-w-[280px] mx-auto", children: "The more you calibrate, the sharper your recommendations. Every swipe teaches the AI what makes you, you." }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-9 rounded-full bg-secondary/80 overflow-hidden relative border border-border/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { width: 0 },
                    animate: { width: `${Math.max(calibrationProgress || 30, 10)}%` },
                    transition: { duration: 1.2, ease: "easeOut", delay: 0.5 },
                    className: "h-full rounded-full flex items-center justify-between px-3",
                    style: {
                      background: "linear-gradient(90deg, hsl(142, 60%, 48%), hsl(var(--primary)))"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-primary-foreground" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold text-primary-foreground", children: [
                        calibrationProgress || 30,
                        "%"
                      ] })
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-9 h-9 rounded-full bg-primary/10 border border-border/50 flex items-center justify-center flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-4 h-4 text-primary" }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                GradientButton,
                {
                  onClick: () => navigate("/calibration"),
                  className: "w-full rounded-full h-12 text-base",
                  children: [
                    "Start ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
                  ]
                }
              )
            ] })
          ] })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 mt-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.15 },
          className: "rounded-2xl border border-border bg-card p-5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-5 h-5 text-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans uppercase tracking-widest text-muted-foreground", children: "Who You Are, Styled" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-bold text-foreground mb-3", children: archetype }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-primary", children: styleScore }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-sans", children: "Your Style Power" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0.5 mt-0.5", children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Star,
                  {
                    className: `w-3 h-3 ${s <= Math.round(styleScore / 20) ? "text-[hsl(45,80%,55%)] fill-[hsl(45,80%,55%)]" : "text-muted"}`
                  },
                  s
                )) })
              ] })
            ] }) })
          ]
        }
      ),
      (faceShape || bodyShape) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.2 },
          className: "rounded-2xl border border-border bg-card p-5 space-y-5",
          children: [
            faceShape && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FaceShapeIllustration, { shape: faceShape, size: 100 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ScanFace, { className: "w-5 h-5 text-[hsl(200,50%,60%)]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: faceShape })
                ] }),
                faceShapeDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans text-muted-foreground leading-relaxed", children: faceShapeDescription })
              ] })
            ] }),
            faceShape && bodyShape && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-border" }),
            bodyShape && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BodyShapeIllustration, { shape: bodyShape, size: 120 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-5 h-5 text-[hsl(270,40%,65%)]" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: bodyShape })
                ] }),
                bodyShapeTraits.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: bodyShapeTraits.map((trait, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-full bg-secondary text-xs font-sans text-foreground", children: trait }, i)) })
              ] })
            ] })
          ]
        }
      ),
      faceShape && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.25 },
          className: "rounded-2xl border border-border bg-card p-5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Glasses, { className: "w-5 h-5 text-[hsl(200,50%,60%)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-base font-bold text-foreground", children: [
                "How to Work Your ",
                faceShape,
                " Face"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: getFaceShapeTips(faceShape).map((tip, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-[hsl(200,50%,60%)] mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans text-muted-foreground leading-relaxed", children: tip })
            ] }, i)) })
          ]
        }
      ),
      bodyShape && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.3 },
          className: "rounded-2xl border border-border bg-card p-5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Gem, { className: "w-5 h-5 text-[hsl(270,40%,65%)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-base font-bold text-foreground", children: [
                "Dressing Your ",
                bodyShape,
                " Frame"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: getBodyShapeTips(bodyShape).map((tip, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-[hsl(270,40%,65%)] mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans text-muted-foreground leading-relaxed", children: tip })
            ] }, i)) })
          ]
        }
      ),
      dna && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.button,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.35 },
            onClick: () => navigate("/color-type"),
            className: "w-full rounded-2xl border border-border bg-card p-5 text-left hover:bg-secondary/20 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "w-5 h-5 text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: dna.colorSeason })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-sans text-muted-foreground capitalize", children: [
                  dna.undertone,
                  " undertone"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 mb-3", children: dna.bestColors.slice(0, 8).map((color) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "flex-1 h-8 rounded-lg border border-border",
                  style: { backgroundColor: getColorHsl(color) },
                  title: color
                },
                color
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-sans", children: "Tap to view full palette" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 text-muted-foreground" })
              ] })
            ]
          }
        ),
        ((_d = dna.recommendedPrints) == null ? void 0 : _d.length) || ((_e = dna.recommendedFabrics) == null ? void 0 : _e.length) ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.36 },
            className: "rounded-2xl border border-border bg-card p-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-5 h-5 text-[hsl(15,80%,55%)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: "Textures That Elevate You" })
              ] }),
              dna.recommendedPrints && dna.recommendedPrints.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-2", children: "Recommended Prints" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: dna.recommendedPrints.map((print, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1.5 rounded-full bg-secondary text-xs font-sans text-foreground flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Paintbrush, { className: "w-3 h-3 text-[hsl(15,80%,55%)]" }),
                  print
                ] }, i)) })
              ] }),
              dna.recommendedFabrics && dna.recommendedFabrics.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-sans uppercase tracking-widest text-muted-foreground mb-2", children: "Best Fabrics" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: dna.recommendedFabrics.map((fabric, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1.5 rounded-full bg-secondary text-xs font-sans text-foreground flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-3 h-3 text-[hsl(45,80%,55%)]" }),
                  fabric
                ] }, i)) })
              ] })
            ]
          }
        ) : null,
        dna.flatteringSilhouettes && dna.flatteringSilhouettes.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.37 },
            className: "rounded-2xl border border-border bg-card p-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Shapes, { className: "w-5 h-5 text-[hsl(270,40%,65%)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: "Silhouettes Made for Your Body" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: dna.flatteringSilhouettes.map((sil, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-[hsl(270,40%,65%)] mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans text-muted-foreground leading-relaxed", children: sil })
              ] }, i)) })
            ]
          }
        ),
        dna.colorUsageTips && dna.colorUsageTips.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.38 },
            className: "rounded-2xl border border-border bg-card p-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "w-5 h-5 text-[hsl(45,80%,55%)]" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: "Your Personal Color Playbook" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: dna.colorUsageTips.map((tip, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-6 h-6 rounded-full border border-border flex-shrink-0",
                    style: { backgroundColor: getColorHsl(tip.color) }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-sans font-semibold text-foreground", children: tip.color }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-sans text-muted-foreground ml-1.5", children: [
                    "— ",
                    tip.usage
                  ] })
                ] })
              ] }, i)) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.4 },
            className: "rounded-2xl border border-border bg-card p-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "w-5 h-5 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: "What the AI Sees in You" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm leading-relaxed", children: dna.summary })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.45 },
            className: "rounded-2xl border border-border bg-card p-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-5 h-5 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: "Your Next Moves" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: dna.recommendations.map((rec, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-4 h-4 text-primary mt-0.5 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans text-muted-foreground leading-relaxed", children: rec })
              ] }, i)) })
            ]
          }
        ),
        (lifestyle || profession || styleMood.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.5 },
            className: "rounded-2xl border border-border bg-card p-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-4 h-4 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: "The Mind Behind Your Wardrobe" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 mb-3", children: [
                lifestyle && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-secondary/50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans uppercase tracking-wider mb-1", children: "Lifestyle" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans font-semibold text-foreground", children: lifestyle })
                ] }),
                profession && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-xl bg-secondary/50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans uppercase tracking-wider mb-1", children: "Profession" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-sans font-semibold text-foreground", children: profession })
                ] })
              ] }),
              styleMood.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans uppercase tracking-wider mb-2", children: "Style Mood Goals" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: styleMood.map((mood) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-sans bg-primary/10 text-primary px-3 py-1 rounded-full", children: mood }, mood)) })
              ] })
            ]
          }
        ),
        styleEvolution.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.55 },
            className: "rounded-2xl border border-border bg-card p-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-4 h-4 text-primary" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-base font-bold text-foreground", children: "Where Your Style Is Headed" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-sans mb-4", children: "Based on your habits and goals, here's how you'll evolve over the next 1–3 years" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-primary/10" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: styleEvolution.map((stage, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, x: -10 },
                    animate: { opacity: 1, x: 0 },
                    transition: { delay: 0.6 + i * 0.1 },
                    className: "flex gap-4 pl-1",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-7 h-7 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-shrink-0 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-primary", children: i + 1 }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-secondary/30 p-3 flex-1 -mt-0.5", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground font-sans", children: stage.stage }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-sans", children: stage.timeframe })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mb-2", children: stage.changes.map((change, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-sans bg-primary/10 text-primary px-2 py-0.5 rounded-full", children: change }, j)) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground font-sans italic flex items-start gap-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-3 h-3 mt-0.5 flex-shrink-0" }),
                          " ",
                          stage.trigger
                        ] })
                      ] })
                    ]
                  },
                  stage.stage
                )) })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: 20, opacity: 0 },
            animate: { y: 0, opacity: 1 },
            transition: { delay: 0.5 },
            className: "rounded-2xl border border-border bg-card p-5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans uppercase tracking-widest text-muted-foreground mb-3", children: "Colors Working Against You" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: dna.colorsToAvoid.map((color) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-4 h-4 rounded-full border border-border", style: { backgroundColor: getColorHsl(color) } }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-sans text-foreground", children: color })
              ] }, color)) })
            ]
          }
        )
      ] }),
      !dna && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          transition: { delay: 0.3 },
          className: "rounded-2xl border border-border bg-card p-6 text-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans mb-4", children: "Your full style blueprint is locked. Upload a selfie during onboarding and the AI will map your colors, body, and archetype in seconds." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => navigate("/onboarding"), className: "rounded-xl", children: "Complete Onboarding" })
          ]
        }
      )
    ] })
  ] }) });
};
export {
  StyleDNA as default
};
