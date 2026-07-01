import { r as reactExports, j as jsxRuntimeExports, R as React, L as Link } from "./index-UvNQFckZ.js";
import { T as Tag, N as NewsletterSignup } from "./NewsletterSignup-Dw1hfizg.js";
import { c as composeEventHandlers, P as Presence, u as useControllableState } from "./index-DD4Lzeau.js";
import { c as createContextScope } from "./index-DbLPExPm.js";
import { u as useComposedRefs, c as cn } from "./AppContent-9kIwMzo7.js";
import { c as createPopperScope, A as Anchor, C as Content, a as Arrow, R as Root2$1 } from "./index-xmQ4FiWw.js";
import { P as Primitive } from "./index-tS1BiThI.js";
import { D as DismissableLayer } from "./index-JMgWy2k0.js";
import { b as useMotionValue, a as useSpring } from "./use-spring-C08f-i-p.js";
import { A as AnimatePresence } from "./index-CI22_94N.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { A as ArrowLeft } from "./arrow-left-Cwmr1lNp.js";
import { C as Clock } from "./clock-DoGYkEt9.js";
import { A as ArrowRight } from "./arrow-right-03HXU5ql.js";
import "./circle-check-big-BdWOWpAd.js";
import "./mail-CrTbxzYt.js";
import "./loader-circle-BUsfaJ2b.js";
var originalBodyUserSelect;
var HOVERCARD_NAME = "HoverCard";
var [createHoverCardContext, createHoverCardScope] = createContextScope(HOVERCARD_NAME, [
  createPopperScope
]);
var usePopperScope = createPopperScope();
var [HoverCardProvider, useHoverCardContext] = createHoverCardContext(HOVERCARD_NAME);
var HoverCard = (props) => {
  const {
    __scopeHoverCard,
    children,
    open: openProp,
    defaultOpen,
    onOpenChange,
    openDelay = 700,
    closeDelay = 300
  } = props;
  const popperScope = usePopperScope(__scopeHoverCard);
  const openTimerRef = reactExports.useRef(0);
  const closeTimerRef = reactExports.useRef(0);
  const hasSelectionRef = reactExports.useRef(false);
  const isPointerDownOnContentRef = reactExports.useRef(false);
  const [open, setOpen] = useControllableState({
    prop: openProp,
    defaultProp: defaultOpen ?? false,
    onChange: onOpenChange,
    caller: HOVERCARD_NAME
  });
  const handleOpen = reactExports.useCallback(() => {
    clearTimeout(closeTimerRef.current);
    openTimerRef.current = window.setTimeout(() => setOpen(true), openDelay);
  }, [openDelay, setOpen]);
  const handleClose = reactExports.useCallback(() => {
    clearTimeout(openTimerRef.current);
    if (!hasSelectionRef.current && !isPointerDownOnContentRef.current) {
      closeTimerRef.current = window.setTimeout(() => setOpen(false), closeDelay);
    }
  }, [closeDelay, setOpen]);
  const handleDismiss = reactExports.useCallback(() => setOpen(false), [setOpen]);
  reactExports.useEffect(() => {
    return () => {
      clearTimeout(openTimerRef.current);
      clearTimeout(closeTimerRef.current);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    HoverCardProvider,
    {
      scope: __scopeHoverCard,
      open,
      onOpenChange: setOpen,
      onOpen: handleOpen,
      onClose: handleClose,
      onDismiss: handleDismiss,
      hasSelectionRef,
      isPointerDownOnContentRef,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Root2$1, { ...popperScope, children })
    }
  );
};
HoverCard.displayName = HOVERCARD_NAME;
var TRIGGER_NAME = "HoverCardTrigger";
var HoverCardTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeHoverCard, ...triggerProps } = props;
    const context = useHoverCardContext(TRIGGER_NAME, __scopeHoverCard);
    const popperScope = usePopperScope(__scopeHoverCard);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Anchor, { asChild: true, ...popperScope, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.a,
      {
        "data-state": context.open ? "open" : "closed",
        ...triggerProps,
        ref: forwardedRef,
        onPointerEnter: composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen)),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose)),
        onFocus: composeEventHandlers(props.onFocus, context.onOpen),
        onBlur: composeEventHandlers(props.onBlur, context.onClose),
        onTouchStart: composeEventHandlers(props.onTouchStart, (event) => event.preventDefault())
      }
    ) });
  }
);
HoverCardTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "HoverCardPortal";
var [PortalProvider, usePortalContext] = createHoverCardContext(PORTAL_NAME, {
  forceMount: void 0
});
var CONTENT_NAME = "HoverCardContent";
var HoverCardContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const portalContext = usePortalContext(CONTENT_NAME, props.__scopeHoverCard);
    const { forceMount = portalContext.forceMount, ...contentProps } = props;
    const context = useHoverCardContext(CONTENT_NAME, props.__scopeHoverCard);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      HoverCardContentImpl,
      {
        "data-state": context.open ? "open" : "closed",
        ...contentProps,
        onPointerEnter: composeEventHandlers(props.onPointerEnter, excludeTouch(context.onOpen)),
        onPointerLeave: composeEventHandlers(props.onPointerLeave, excludeTouch(context.onClose)),
        ref: forwardedRef
      }
    ) });
  }
);
HoverCardContent.displayName = CONTENT_NAME;
var HoverCardContentImpl = reactExports.forwardRef((props, forwardedRef) => {
  const {
    __scopeHoverCard,
    onEscapeKeyDown,
    onPointerDownOutside,
    onFocusOutside,
    onInteractOutside,
    ...contentProps
  } = props;
  const context = useHoverCardContext(CONTENT_NAME, __scopeHoverCard);
  const popperScope = usePopperScope(__scopeHoverCard);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const [containSelection, setContainSelection] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (containSelection) {
      const body = document.body;
      originalBodyUserSelect = body.style.userSelect || body.style.webkitUserSelect;
      body.style.userSelect = "none";
      body.style.webkitUserSelect = "none";
      return () => {
        body.style.userSelect = originalBodyUserSelect;
        body.style.webkitUserSelect = originalBodyUserSelect;
      };
    }
  }, [containSelection]);
  reactExports.useEffect(() => {
    if (ref.current) {
      const handlePointerUp = () => {
        setContainSelection(false);
        context.isPointerDownOnContentRef.current = false;
        setTimeout(() => {
          var _a;
          const hasSelection = ((_a = document.getSelection()) == null ? void 0 : _a.toString()) !== "";
          if (hasSelection) context.hasSelectionRef.current = true;
        });
      };
      document.addEventListener("pointerup", handlePointerUp);
      return () => {
        document.removeEventListener("pointerup", handlePointerUp);
        context.hasSelectionRef.current = false;
        context.isPointerDownOnContentRef.current = false;
      };
    }
  }, [context.isPointerDownOnContentRef, context.hasSelectionRef]);
  reactExports.useEffect(() => {
    if (ref.current) {
      const tabbables = getTabbableNodes(ref.current);
      tabbables.forEach((tabbable) => tabbable.setAttribute("tabindex", "-1"));
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    DismissableLayer,
    {
      asChild: true,
      disableOutsidePointerEvents: false,
      onInteractOutside,
      onEscapeKeyDown,
      onPointerDownOutside,
      onFocusOutside: composeEventHandlers(onFocusOutside, (event) => {
        event.preventDefault();
      }),
      onDismiss: context.onDismiss,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Content,
        {
          ...popperScope,
          ...contentProps,
          onPointerDown: composeEventHandlers(contentProps.onPointerDown, (event) => {
            if (event.currentTarget.contains(event.target)) {
              setContainSelection(true);
            }
            context.hasSelectionRef.current = false;
            context.isPointerDownOnContentRef.current = true;
          }),
          ref: composedRefs,
          style: {
            ...contentProps.style,
            userSelect: containSelection ? "text" : void 0,
            // Safari requires prefix
            WebkitUserSelect: containSelection ? "text" : void 0,
            // re-namespace exposed content custom properties
            ...{
              "--radix-hover-card-content-transform-origin": "var(--radix-popper-transform-origin)",
              "--radix-hover-card-content-available-width": "var(--radix-popper-available-width)",
              "--radix-hover-card-content-available-height": "var(--radix-popper-available-height)",
              "--radix-hover-card-trigger-width": "var(--radix-popper-anchor-width)",
              "--radix-hover-card-trigger-height": "var(--radix-popper-anchor-height)"
            }
          }
        }
      )
    }
  );
});
var ARROW_NAME = "HoverCardArrow";
var HoverCardArrow = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeHoverCard, ...arrowProps } = props;
    const popperScope = usePopperScope(__scopeHoverCard);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Arrow, { ...popperScope, ...arrowProps, ref: forwardedRef });
  }
);
HoverCardArrow.displayName = ARROW_NAME;
function excludeTouch(eventHandler) {
  return (event) => event.pointerType === "touch" ? void 0 : eventHandler();
}
function getTabbableNodes(container) {
  const nodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => {
      return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    }
  });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
}
var Root2 = HoverCard;
var Trigger = HoverCardTrigger;
var Content2 = HoverCardContent;
function encode(obj, pfx) {
  var k, i, tmp, str = "";
  for (k in obj) {
    if ((tmp = obj[k]) !== void 0) {
      if (Array.isArray(tmp)) {
        for (i = 0; i < tmp.length; i++) {
          str && (str += "&");
          str += encodeURIComponent(k) + "=" + encodeURIComponent(tmp[i]);
        }
      } else {
        str && (str += "&");
        str += encodeURIComponent(k) + "=" + encodeURIComponent(tmp);
      }
    }
  }
  return "" + str;
}
const LinkPreview = ({
  children,
  url,
  className,
  width = 200,
  height = 125,
  quality = 50,
  isStatic = false,
  imageSrc = ""
}) => {
  let src;
  if (!isStatic) {
    const params = encode({
      url,
      screenshot: true,
      meta: false,
      embed: "screenshot.url",
      colorScheme: "dark",
      "viewport.isMobile": true,
      "viewport.deviceScaleFactor": 1,
      "viewport.width": width * 3,
      "viewport.height": height * 3
    });
    src = `https://api.microlink.io/?${params}`;
  } else {
    src = imageSrc;
  }
  const [isOpen, setOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const translateX = useSpring(x, springConfig);
  const handleMouseMove = (event) => {
    const targetRect = event.target.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2;
    x.set(offsetFromCenter);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    isMounted ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src,
        width,
        height,
        alt: "hidden preload"
      }
    ) }) : null,
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Root2,
      {
        openDelay: 50,
        closeDelay: 100,
        onOpenChange: (open) => setOpen(open),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Trigger,
            {
              onMouseMove: handleMouseMove,
              className: cn("text-foreground", className),
              asChild: true,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: url, children })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Content2,
            {
              className: "[transform-origin:var(--radix-hover-card-content-transform-origin)]",
              side: "top",
              align: "center",
              sideOffset: 10,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
                motion.div,
                {
                  initial: { opacity: 0, y: 20, scale: 0.6 },
                  animate: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }
                  },
                  exit: { opacity: 0, y: 20, scale: 0.6 },
                  className: "shadow-xl rounded-xl",
                  style: { x: translateX },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: url,
                      className: "block p-1 bg-card border border-border/30 shadow rounded-xl hover:border-border/60 transition-colors",
                      style: { fontSize: 0 },
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: isStatic ? imageSrc : src,
                          width,
                          height,
                          className: "rounded-lg",
                          alt: "preview"
                        }
                      )
                    }
                  )
                }
              ) })
            }
          )
        ]
      }
    )
  ] });
};
const articles = [
  {
    slug: "ai-outfit-recommendation-how-it-works",
    title: "How AI Outfit Recommendation Engines Actually Work in 2026",
    excerpt: "AI outfit engines go beyond color matching. They analyze body proportions, fabric compatibility, weather, and personal taste to build daily looks.",
    category: "Technology",
    readTime: "8 min read",
    date: "April 3, 2026",
    body: [
      "AI has reshaped how people get dressed. What once needed a personal stylist now happens inside an app in under a second.",
      "At the core sits a neural network trained on millions of fashion images. But image recognition is only the start. LEXOR® layers contextual signals on top: calendar events, local forecast, dress codes, and mood.",
      "The algorithm maps your wardrobe into a style space. Each garment is encoded across 40+ attributes — silhouette, color temperature, pattern density, fabric drape, seasonal weight. When you request an outfit, the model finds combinations that maximize harmony while respecting weather and dress code constraints.",
      "What separates AI styling from a static lookbook is the feedback loop. Every time you accept or skip a suggestion, the system recalibrates. Within two weeks, most users say recommendations feel like their own choices — just faster.",
      "Your wardrobe data never leaves encrypted storage. The model runs without exposing individual preferences. Personal styling at scale, without sacrificing privacy."
    ]
  },
  {
    slug: "capsule-wardrobe-guide-minimalist-fashion",
    title: "The Complete Capsule Wardrobe Guide: Build a Minimalist Closet That Works",
    excerpt: "A capsule wardrobe isn't about owning less — it's about owning better. Audit your closet, find versatile staples, and use AI to maximize outfit combinations.",
    category: "Style Guide",
    readTime: "10 min read",
    date: "March 28, 2026",
    body: [
      "The capsule wardrobe concept dates back to the 1970s but has never been more relevant. Fast fashion left the average person with 100+ garments, yet most people wear fewer than 20% of what they own.",
      "Start with an honest audit. Photograph every item — LEXOR® does this automatically, categorizing by type, color, season, and versatility. Patterns emerge fast: duplicate black tees, unworn blazers, zero transitional layers.",
      "A working capsule is 30–40 pieces that interlock. Every top pairs with at least three bottoms. AI tools calculate combinatorial coverage — how many unique outfits your capsule produces and where the gaps are.",
      "Color cohesion beats trend-chasing. Pick a neutral base (navy, charcoal, ivory), add two accent colors that match your skin tone. LEXOR®'s color analysis maps your complexion to a personalized palette.",
      "Users who switch to a capsule get dressed 70% faster and spend 35% less on clothing annually."
    ]
  },
  {
    slug: "what-to-wear-to-work-office-outfit-ideas",
    title: "What to Wear to Work: Smart Office Outfit Ideas for Every Dress Code",
    excerpt: "From business formal to creative casual — here's how to decode your workplace style and build a rotation that looks polished without feeling stiff.",
    category: "Office Style",
    readTime: "7 min read",
    date: "March 20, 2026",
    body: [
      "Office dress codes have fragmented. The suit-and-tie era gave way to business casual, which split into 'smart casual,' 'creative professional,' and the vague 'dress appropriately.' Figuring out what to wear each morning is real friction.",
      "Build a flexible work wardrobe around three tiers. Tier one: polished staples — tailored trousers, structured blazers, quality button-downs. Tier two: smart-casual bridges — chinos, knit polos, loafers. These cover 80% of workdays. Tier three: creative accents that show personality without crossing lines.",
      "Navy and charcoal project authority. Pastels read approachable. Jewel tones signal confidence. LEXOR® factors in your industry and meeting schedule to pick the right register each day.",
      "Seasonal transitions trip up even good dressers. AI handles this by checking the hourly forecast and picking pieces that work at 7 AM and 2 PM.",
      "A $200 blazer worn 100 times costs $2 per wear. A $30 trend piece worn twice costs $15 per wear. AI analytics make cost-per-wear visible for every item in your closet."
    ]
  },
  {
    slug: "color-analysis-for-fashion-find-your-season",
    title: "Color Analysis for Fashion: How to Find Your Season and Dress in Your Best Shades",
    excerpt: "Seasonal color analysis is a proven framework for finding which hues make your skin glow and which wash you out. Here's the science.",
    category: "Color Theory",
    readTime: "9 min read",
    date: "March 12, 2026",
    body: [
      "Color analysis divides human coloring into seasonal archetypes — Spring, Summer, Autumn, Winter — based on undertone, value, and chroma. Knowing your season turns shopping from guesswork into precision.",
      "The traditional method uses fabric drapes under neutral light. AI has made it instant. LEXOR® uses your selfie to map skin undertone, eye color, and hair shade, then outputs your season with 30+ complementary colors.",
      "Colors that match your natural coloring make your skin look healthier and your appearance more intentional. Clashing colors create subtle discord people register as 'something's off.'",
      "Springs shine in coral and golden yellow. Winters command attention in cobalt and crisp white. Autumns glow in olive and burnt orange. Summers look effortless in dusty rose and sage.",
      "The biggest mistake is chasing trendy colors regardless of season. AI styling filters trends through your personal palette so you stay current without losing harmony."
    ]
  },
  {
    slug: "wardrobe-management-app-comparison",
    title: "Best Wardrobe Management Apps in 2026: Features, Pricing, and Honest Reviews",
    excerpt: "We compare the top digital closet apps — from basic cataloging to full AI styling — so you can pick the right one.",
    category: "Reviews",
    readTime: "12 min read",
    date: "March 5, 2026",
    body: [
      "The wardrobe app market has exploded. By 2026, there are over twenty options — but quality varies. Some are glorified photo albums. Others, like LEXOR®, are AI platforms that learn and evolve with your style.",
      "Baseline features every app should have: photo upload with background removal, category tagging, outfit creation, and search. What separates the best is intelligence — does it help you dress better, or just organize what you own?",
      "LEXOR® leads in AI outfit generation (weather + calendar), Style DNA profiling, cost-per-wear analytics, wardrobe gap detection, and a social layer for sharing looks. The free tier works for casual users; Pro unlocks full AI capability.",
      "When evaluating any app, ask: Does it cut decision fatigue? Does it save money? Does it improve over time? Static tools plateau. You want a system that learns with every interaction.",
      "Privacy is non-negotiable. Your wardrobe is intimate data. Look for end-to-end encryption and clear data policies. LEXOR® uses encrypted cloud storage with zero third-party sharing."
    ]
  }
];
const Blog = () => {
  reactExports.useEffect(() => {
    document.title = "Fashion Blog — AI Styling Tips & Wardrobe Guides | LEXOR®";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Expert fashion advice powered by AI. Read guides on capsule wardrobes, color analysis, office outfits, wardrobe management, and AI outfit recommendations from LEXOR®.");
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", "Fashion Blog — AI Styling Tips & Wardrobe Guides | LEXOR®");
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", "Expert fashion advice powered by AI. Guides on capsule wardrobes, color analysis, and AI outfit recommendations.");
    let twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      twitterCard = document.createElement("meta");
      twitterCard.setAttribute("name", "twitter:card");
      twitterCard.setAttribute("content", "summary_large_image");
      document.head.appendChild(twitterCard);
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background dark", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 text-foreground font-display font-bold text-lg tracking-tight", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
        "LEXOR®"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/auth",
          className: "text-xs font-semibold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors",
          children: "Try Free →"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "py-16 md:py-24 text-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center gap-2 rounded-full border border-border/30 bg-card/40 px-3 py-1.5 backdrop-blur-md mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Fashion Intelligence" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-4", children: "The LEXOR® Fashion Blog" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed", children: "Guides on AI styling, capsule wardrobes, color analysis, and smarter dressing — backed by data." })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "max-w-4xl mx-auto px-4 sm:px-6 pb-24", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-10", children: articles.map((article, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.article,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 0.4, delay: i * 0.05 },
          id: article.slug,
          className: "group",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/20 bg-card/30 backdrop-blur-sm p-6 md:p-8 hover:border-primary/20 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3 mb-4 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-primary font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3 h-3" }),
                article.category
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                article.readTime
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: article.date })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl md:text-2xl font-bold text-foreground tracking-tight mb-3 group-hover:text-primary transition-colors", children: article.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm md:text-base text-muted-foreground leading-relaxed mb-5", children: article.excerpt }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 text-sm text-muted-foreground/80 leading-relaxed", children: article.body.slice(0, 2).map((paragraph, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: paragraph }, j)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 pt-4 border-t border-border/10 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                LinkPreview,
                {
                  url: `/blog/${article.slug}`,
                  className: "inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors",
                  isStatic: true,
                  imageSrc: "/og/blog-og.jpg",
                  width: 300,
                  height: 188,
                  children: [
                    "Read Full Article",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5 inline" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: "/auth",
                  className: "inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors",
                  children: "Try LEXOR® Free"
                }
              )
            ] })
          ] })
        },
        article.slug
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx(NewsletterSignup, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.5 },
          className: "mt-12 text-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight mb-4", children: "Ready to Dress Smarter?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-8 max-w-lg mx-auto", children: "Thousands of people use AI to build better wardrobes and save money. Join them." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/auth",
                className: "inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors",
                children: [
                  "Start Free — No Card Needed",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
                ]
              }
            )
          ]
        }
      )
    ] })
  ] });
};
export {
  Blog as default
};
