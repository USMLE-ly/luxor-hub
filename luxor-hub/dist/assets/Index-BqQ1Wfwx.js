import { r as reactExports, e as useNavigate, j as jsxRuntimeExports, R as React } from "./index-BJjnbSuc.js";
import { t as trackEvent, c as captureUTMParams } from "./fbPixel-CTUEdhYl.js";
import { N as Navbar, F as Footer } from "./Footer-DmCkalIJ.js";
import { f as frame, c as cancelFrame, s as supportsViewTimeline, a as supportsScrollTimeline, p as progress, v as velocityPerSecond, i as isHTMLElement, b as interpolate, d as defaultOffset$1, e as clamp, n as noop, r as resize, g as frameData, u as useConstant, h as useIsomorphicLayoutEffect, j as microtask, k as cancelMicrotask, l as motionValue, o as invariant, q as resolveElements, m as motion } from "./proxy-DPNpeU0t.js";
import { u as useTransform, a as useSpring } from "./use-spring-DcSHrtYD.js";
import { S as Star } from "./star-eEybA0EU.js";
import { A as ArrowRight } from "./arrow-right-tIMF6hRe.js";
import { C as ChevronDown } from "./chevron-down-CefZn6xR.js";
import { C as Crown } from "./crown-BuPDFDON.js";
import { d as createLucideIcon, c as cn, B as Button, u as useComposedRefs, e as useAuth, f as useQueryClient, s as supabase } from "./AppContent-4cFLEqQ4.js";
import { A as ArrowLeft } from "./arrow-left-Di9ks3uY.js";
import { A as AnimatePresence } from "./index-CWYjAC1K.js";
import { C as Check } from "./check-H0qDKe8z.js";
import { A as ArrowUpRight } from "./arrow-up-right-CEvJ3L08.js";
import { S as SquishyPricingCard, P as PayPalButton, a as Shield, B as BGComponent1, b as BGComponent2, c as BGComponent3 } from "./squishy-pricing-Bo_0Awba.js";
import { t as toast } from "./index-DqqhH6-L.js";
import { u as useControllableState, c as composeEventHandlers, P as Presence, b as useLayoutEffect2 } from "./index-ZAaTSPdI.js";
import { c as createContextScope } from "./index-ZUFtIYVr.js";
import { P as Primitive } from "./index-DoiO9BYn.js";
import { u as useId } from "./index-BGgHy4vq.js";
import { c as createCollection } from "./index-BdIuB2-P.js";
import { u as useDirection } from "./index-CNBvEil4.js";
import { X } from "./x-kMbRGhbO.js";
import { A as ArrowUp } from "./arrow-up-DJkQ3zvm.js";
import "./index-2IwOMQc0.js";
import "./index-DO_vXmCh.js";
import "./index-CH0dcRRL.js";
import "./index-pRgia8Qu.js";
import "./use-toast-DNAK29hB.js";
import "./lock-KX049Fqg.js";
import "./loader-circle-De8pAAiQ.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Diamond = createLucideIcon("Diamond", [
  [
    "path",
    {
      d: "M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z",
      key: "1f1r0c"
    }
  ]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Minus = createLucideIcon("Minus", [["path", { d: "M5 12h14", key: "1ays0h" }]]);
function observeTimeline(update, timeline) {
  let prevProgress;
  const onFrame = () => {
    const { currentTime } = timeline;
    const percentage = currentTime === null ? 0 : currentTime.value;
    const progress2 = percentage / 100;
    if (prevProgress !== progress2) {
      update(progress2);
    }
    prevProgress = progress2;
  };
  frame.preUpdate(onFrame, true);
  return () => cancelFrame(onFrame);
}
function canUseNativeTimeline(target) {
  if (typeof window === "undefined")
    return false;
  return target ? supportsViewTimeline() : supportsScrollTimeline();
}
const maxElapsed = 50;
const createAxisInfo = () => ({
  current: 0,
  offset: [],
  progress: 0,
  scrollLength: 0,
  targetOffset: 0,
  targetLength: 0,
  containerLength: 0,
  velocity: 0
});
const createScrollInfo = () => ({
  time: 0,
  x: createAxisInfo(),
  y: createAxisInfo()
});
const keys = {
  x: {
    length: "Width",
    position: "Left"
  },
  y: {
    length: "Height",
    position: "Top"
  }
};
function updateAxisInfo(element, axisName, info, time) {
  const axis = info[axisName];
  const { length, position } = keys[axisName];
  const prev = axis.current;
  const prevTime = info.time;
  axis.current = Math.abs(element[`scroll${position}`]);
  axis.scrollLength = element[`scroll${length}`] - element[`client${length}`];
  axis.offset.length = 0;
  axis.offset[0] = 0;
  axis.offset[1] = axis.scrollLength;
  axis.progress = progress(0, axis.scrollLength, axis.current);
  const elapsed = time - prevTime;
  axis.velocity = elapsed > maxElapsed ? 0 : velocityPerSecond(axis.current - prev, elapsed);
}
function updateScrollInfo(element, info, time) {
  updateAxisInfo(element, "x", info, time);
  updateAxisInfo(element, "y", info, time);
  info.time = time;
}
function calcInset(element, container) {
  const inset = { x: 0, y: 0 };
  let current = element;
  while (current && current !== container) {
    if (isHTMLElement(current)) {
      inset.x += current.offsetLeft;
      inset.y += current.offsetTop;
      current = current.offsetParent;
    } else if (current.tagName === "svg") {
      const svgBoundingBox = current.getBoundingClientRect();
      current = current.parentElement;
      const parentBoundingBox = current.getBoundingClientRect();
      inset.x += svgBoundingBox.left - parentBoundingBox.left;
      inset.y += svgBoundingBox.top - parentBoundingBox.top;
    } else if (current instanceof SVGGraphicsElement) {
      const { x, y } = current.getBBox();
      inset.x += x;
      inset.y += y;
      let svg = null;
      let parent = current.parentNode;
      while (!svg) {
        if (parent.tagName === "svg") {
          svg = parent;
        }
        parent = current.parentNode;
      }
      current = svg;
    } else {
      break;
    }
  }
  return inset;
}
const namedEdges = {
  start: 0,
  center: 0.5,
  end: 1
};
function resolveEdge(edge, length, inset = 0) {
  let delta = 0;
  if (edge in namedEdges) {
    edge = namedEdges[edge];
  }
  if (typeof edge === "string") {
    const asNumber = parseFloat(edge);
    if (edge.endsWith("px")) {
      delta = asNumber;
    } else if (edge.endsWith("%")) {
      edge = asNumber / 100;
    } else if (edge.endsWith("vw")) {
      delta = asNumber / 100 * document.documentElement.clientWidth;
    } else if (edge.endsWith("vh")) {
      delta = asNumber / 100 * document.documentElement.clientHeight;
    } else {
      edge = asNumber;
    }
  }
  if (typeof edge === "number") {
    delta = length * edge;
  }
  return inset + delta;
}
const defaultOffset = [0, 0];
function resolveOffset(offset, containerLength, targetLength, targetInset) {
  let offsetDefinition = Array.isArray(offset) ? offset : defaultOffset;
  let targetPoint = 0;
  let containerPoint = 0;
  if (typeof offset === "number") {
    offsetDefinition = [offset, offset];
  } else if (typeof offset === "string") {
    offset = offset.trim();
    if (offset.includes(" ")) {
      offsetDefinition = offset.split(" ");
    } else {
      offsetDefinition = [offset, namedEdges[offset] ? offset : `0`];
    }
  }
  targetPoint = resolveEdge(offsetDefinition[0], targetLength, targetInset);
  containerPoint = resolveEdge(offsetDefinition[1], containerLength);
  return targetPoint - containerPoint;
}
const ScrollOffset = {
  Enter: [
    [0, 1],
    [1, 1]
  ],
  Exit: [
    [0, 0],
    [1, 0]
  ],
  Any: [
    [1, 0],
    [0, 1]
  ],
  All: [
    [0, 0],
    [1, 1]
  ]
};
const point = { x: 0, y: 0 };
function getTargetSize(target) {
  return "getBBox" in target && target.tagName !== "svg" ? target.getBBox() : { width: target.clientWidth, height: target.clientHeight };
}
function resolveOffsets(container, info, options) {
  const { offset: offsetDefinition = ScrollOffset.All } = options;
  const { target = container, axis = "y" } = options;
  const lengthLabel = axis === "y" ? "height" : "width";
  const inset = target !== container ? calcInset(target, container) : point;
  const targetSize = target === container ? { width: container.scrollWidth, height: container.scrollHeight } : getTargetSize(target);
  const containerSize = {
    width: container.clientWidth,
    height: container.clientHeight
  };
  info[axis].offset.length = 0;
  let hasChanged = !info[axis].interpolate;
  const numOffsets = offsetDefinition.length;
  for (let i = 0; i < numOffsets; i++) {
    const offset = resolveOffset(offsetDefinition[i], containerSize[lengthLabel], targetSize[lengthLabel], inset[axis]);
    if (!hasChanged && offset !== info[axis].interpolatorOffsets[i]) {
      hasChanged = true;
    }
    info[axis].offset[i] = offset;
  }
  if (hasChanged) {
    info[axis].interpolate = interpolate(info[axis].offset, defaultOffset$1(offsetDefinition), { clamp: false });
    info[axis].interpolatorOffsets = [...info[axis].offset];
  }
  info[axis].progress = clamp(0, 1, info[axis].interpolate(info[axis].current));
}
function measure(container, target = container, info) {
  info.x.targetOffset = 0;
  info.y.targetOffset = 0;
  if (target !== container) {
    let node = target;
    while (node && node !== container) {
      info.x.targetOffset += node.offsetLeft;
      info.y.targetOffset += node.offsetTop;
      node = node.offsetParent;
    }
  }
  info.x.targetLength = target === container ? target.scrollWidth : target.clientWidth;
  info.y.targetLength = target === container ? target.scrollHeight : target.clientHeight;
  info.x.containerLength = container.clientWidth;
  info.y.containerLength = container.clientHeight;
}
function createOnScrollHandler(element, onScroll, info, options = {}) {
  return {
    measure: (time) => {
      measure(element, options.target, info);
      updateScrollInfo(element, info, time);
      if (options.offset || options.target) {
        resolveOffsets(element, info, options);
      }
    },
    notify: () => onScroll(info)
  };
}
const scrollListeners = /* @__PURE__ */ new WeakMap();
const resizeListeners = /* @__PURE__ */ new WeakMap();
const onScrollHandlers = /* @__PURE__ */ new WeakMap();
const scrollSize = /* @__PURE__ */ new WeakMap();
const dimensionCheckProcesses = /* @__PURE__ */ new WeakMap();
const getEventTarget = (element) => element === document.scrollingElement ? window : element;
function scrollInfo(onScroll, { container = document.scrollingElement, trackContentSize = false, ...options } = {}) {
  if (!container)
    return noop;
  let containerHandlers = onScrollHandlers.get(container);
  if (!containerHandlers) {
    containerHandlers = /* @__PURE__ */ new Set();
    onScrollHandlers.set(container, containerHandlers);
  }
  const info = createScrollInfo();
  const containerHandler = createOnScrollHandler(container, onScroll, info, options);
  containerHandlers.add(containerHandler);
  if (!scrollListeners.has(container)) {
    const measureAll = () => {
      for (const handler of containerHandlers) {
        handler.measure(frameData.timestamp);
      }
      frame.preUpdate(notifyAll);
    };
    const notifyAll = () => {
      for (const handler of containerHandlers) {
        handler.notify();
      }
    };
    const listener2 = () => frame.read(measureAll);
    scrollListeners.set(container, listener2);
    const target = getEventTarget(container);
    window.addEventListener("resize", listener2);
    if (container !== document.documentElement) {
      resizeListeners.set(container, resize(container, listener2));
    }
    target.addEventListener("scroll", listener2);
    listener2();
  }
  if (trackContentSize && !dimensionCheckProcesses.has(container)) {
    const listener2 = scrollListeners.get(container);
    const size = {
      width: container.scrollWidth,
      height: container.scrollHeight
    };
    scrollSize.set(container, size);
    const checkScrollDimensions = () => {
      const newWidth = container.scrollWidth;
      const newHeight = container.scrollHeight;
      if (size.width !== newWidth || size.height !== newHeight) {
        listener2();
        size.width = newWidth;
        size.height = newHeight;
      }
    };
    const dimensionCheckProcess = frame.read(checkScrollDimensions, true);
    dimensionCheckProcesses.set(container, dimensionCheckProcess);
  }
  const listener = scrollListeners.get(container);
  frame.read(listener, false, true);
  return () => {
    var _a;
    cancelFrame(listener);
    const currentHandlers = onScrollHandlers.get(container);
    if (!currentHandlers)
      return;
    currentHandlers.delete(containerHandler);
    if (currentHandlers.size)
      return;
    const scrollListener = scrollListeners.get(container);
    scrollListeners.delete(container);
    if (scrollListener) {
      getEventTarget(container).removeEventListener("scroll", scrollListener);
      (_a = resizeListeners.get(container)) == null ? void 0 : _a();
      window.removeEventListener("resize", scrollListener);
    }
    const dimensionCheckProcess = dimensionCheckProcesses.get(container);
    if (dimensionCheckProcess) {
      cancelFrame(dimensionCheckProcess);
      dimensionCheckProcesses.delete(container);
    }
    scrollSize.delete(container);
  };
}
const presets = [
  [ScrollOffset.Enter, "entry"],
  [ScrollOffset.Exit, "exit"],
  [ScrollOffset.Any, "cover"],
  [ScrollOffset.All, "contain"]
];
const stringToProgress = {
  start: 0,
  end: 1
};
function parseStringOffset(s) {
  const parts = s.trim().split(/\s+/);
  if (parts.length !== 2)
    return void 0;
  const a = stringToProgress[parts[0]];
  const b = stringToProgress[parts[1]];
  if (a === void 0 || b === void 0)
    return void 0;
  return [a, b];
}
function normaliseOffset(offset) {
  if (offset.length !== 2)
    return void 0;
  const result = [];
  for (const item of offset) {
    if (Array.isArray(item)) {
      result.push(item);
    } else if (typeof item === "string") {
      const parsed = parseStringOffset(item);
      if (!parsed)
        return void 0;
      result.push(parsed);
    } else {
      return void 0;
    }
  }
  return result;
}
function matchesPreset(offset, preset) {
  const normalised = normaliseOffset(offset);
  if (!normalised)
    return false;
  for (let i = 0; i < 2; i++) {
    const o = normalised[i];
    const p = preset[i];
    if (o[0] !== p[0] || o[1] !== p[1])
      return false;
  }
  return true;
}
function offsetToViewTimelineRange(offset) {
  if (!offset) {
    return { rangeStart: "contain 0%", rangeEnd: "contain 100%" };
  }
  for (const [preset, name] of presets) {
    if (matchesPreset(offset, preset)) {
      return { rangeStart: `${name} 0%`, rangeEnd: `${name} 100%` };
    }
  }
  return void 0;
}
const timelineCache = /* @__PURE__ */ new Map();
function scrollTimelineFallback(options) {
  const currentTime = { value: 0 };
  const cancel = scrollInfo((info) => {
    currentTime.value = info[options.axis].progress * 100;
  }, options);
  return { currentTime, cancel };
}
function getTimeline({ source, container, ...options }) {
  const { axis } = options;
  if (source)
    container = source;
  let containerCache = timelineCache.get(container);
  if (!containerCache) {
    containerCache = /* @__PURE__ */ new Map();
    timelineCache.set(container, containerCache);
  }
  const targetKey = options.target ?? "self";
  let targetCache = containerCache.get(targetKey);
  if (!targetCache) {
    targetCache = {};
    containerCache.set(targetKey, targetCache);
  }
  const axisKey = axis + (options.offset ?? []).join(",");
  if (!targetCache[axisKey]) {
    if (options.target && canUseNativeTimeline(options.target)) {
      const range = offsetToViewTimelineRange(options.offset);
      if (range) {
        targetCache[axisKey] = new ViewTimeline({
          subject: options.target,
          axis
        });
      } else {
        targetCache[axisKey] = scrollTimelineFallback({
          container,
          ...options
        });
      }
    } else if (canUseNativeTimeline()) {
      targetCache[axisKey] = new ScrollTimeline({
        source: container,
        axis
      });
    } else {
      targetCache[axisKey] = scrollTimelineFallback({
        container,
        ...options
      });
    }
  }
  return targetCache[axisKey];
}
function attachToAnimation(animation, options) {
  const timeline = getTimeline(options);
  const range = options.target ? offsetToViewTimelineRange(options.offset) : void 0;
  const useNative = options.target ? canUseNativeTimeline(options.target) && !!range : canUseNativeTimeline();
  return animation.attachTimeline({
    timeline: useNative ? timeline : void 0,
    ...range && useNative && {
      rangeStart: range.rangeStart,
      rangeEnd: range.rangeEnd
    },
    observe: (valueAnimation) => {
      valueAnimation.pause();
      return observeTimeline((progress2) => {
        valueAnimation.time = valueAnimation.iterationDuration * progress2;
      }, timeline);
    }
  });
}
function isElementTracking(options) {
  return options && (options.target || options.offset);
}
function isOnScrollWithInfo(onScroll) {
  return onScroll.length === 2;
}
function attachToFunction(onScroll, options) {
  if (isOnScrollWithInfo(onScroll) || isElementTracking(options)) {
    return scrollInfo((info) => {
      onScroll(info[options.axis].progress, info);
    }, options);
  } else {
    return observeTimeline(onScroll, getTimeline(options));
  }
}
function scroll(onScroll, { axis = "y", container = document.scrollingElement, ...options } = {}) {
  if (!container)
    return noop;
  const optionsWithDefaults = { axis, container, ...options };
  return typeof onScroll === "function" ? attachToFunction(onScroll, optionsWithDefaults) : attachToAnimation(onScroll, optionsWithDefaults);
}
const createScrollMotionValues = () => ({
  scrollX: motionValue(0),
  scrollY: motionValue(0),
  scrollXProgress: motionValue(0),
  scrollYProgress: motionValue(0)
});
const isRefPending = (ref) => {
  if (!ref)
    return false;
  return !ref.current;
};
function makeAccelerateConfig(axis, options, container, target) {
  return {
    // Refs attach child-first; defer so target.current is populated
    // before scroll() reads it.
    factory: (animation) => {
      let cleanup;
      const start = () => {
        if (isRefPending(container) || isRefPending(target)) {
          microtask.read(start);
          return;
        }
        cleanup = scroll(animation, {
          ...options,
          axis,
          container: (container == null ? void 0 : container.current) || void 0,
          target: (target == null ? void 0 : target.current) || void 0
        });
      };
      microtask.read(start);
      return () => {
        cancelMicrotask(start);
        cleanup == null ? void 0 : cleanup();
      };
    },
    times: [0, 1],
    keyframes: [0, 1],
    ease: (v) => v,
    duration: 1
  };
}
function canAccelerateScroll(target, offset) {
  if (typeof window === "undefined")
    return false;
  return target ? supportsViewTimeline() && !!offsetToViewTimelineRange(offset) : supportsScrollTimeline();
}
function useScroll({ container, target, ...options } = {}) {
  const values = useConstant(createScrollMotionValues);
  if (canAccelerateScroll(target, options.offset)) {
    values.scrollXProgress.accelerate = makeAccelerateConfig("x", options, container, target);
    values.scrollYProgress.accelerate = makeAccelerateConfig("y", options, container, target);
  }
  const scrollAnimation = reactExports.useRef(null);
  const needsStart = reactExports.useRef(false);
  const start = reactExports.useCallback(() => {
    scrollAnimation.current = scroll((_progress, { x, y }) => {
      values.scrollX.set(x.current);
      values.scrollXProgress.set(x.progress);
      values.scrollY.set(y.current);
      values.scrollYProgress.set(y.progress);
    }, {
      ...options,
      container: (container == null ? void 0 : container.current) || void 0,
      target: (target == null ? void 0 : target.current) || void 0
    });
    return () => {
      var _a;
      (_a = scrollAnimation.current) == null ? void 0 : _a.call(scrollAnimation);
    };
  }, [container, target, JSON.stringify(options.offset)]);
  useIsomorphicLayoutEffect(() => {
    needsStart.current = false;
    if (isRefPending(container) || isRefPending(target)) {
      needsStart.current = true;
      return;
    } else {
      return start();
    }
  }, [start]);
  reactExports.useEffect(() => {
    if (!needsStart.current)
      return;
    let cleanup;
    const tryStart = () => {
      const containerPending = isRefPending(container);
      const targetPending = isRefPending(target);
      invariant(!containerPending, "Container ref is defined but not hydrated", "use-scroll-ref");
      invariant(!targetPending, "Target ref is defined but not hydrated", "use-scroll-ref");
      if (!containerPending && !targetPending)
        cleanup = start();
    };
    microtask.read(tryStart);
    return () => {
      cancelMicrotask(tryStart);
      cleanup == null ? void 0 : cleanup();
    };
  }, [start]);
  return values;
}
const thresholds = {
  some: 0,
  all: 1
};
function inView(elementOrSelector, onStart, { root, margin: rootMargin, amount = "some" } = {}) {
  const elements = resolveElements(elementOrSelector);
  const activeIntersections = /* @__PURE__ */ new WeakMap();
  const onIntersectionChange = (entries) => {
    entries.forEach((entry) => {
      const onEnd = activeIntersections.get(entry.target);
      if (entry.isIntersecting === Boolean(onEnd))
        return;
      if (entry.isIntersecting) {
        const newOnEnd = onStart(entry.target, entry);
        if (typeof newOnEnd === "function") {
          activeIntersections.set(entry.target, newOnEnd);
        } else {
          observer.unobserve(entry.target);
        }
      } else if (typeof onEnd === "function") {
        onEnd(entry);
        activeIntersections.delete(entry.target);
      }
    });
  };
  const observer = new IntersectionObserver(onIntersectionChange, {
    root,
    rootMargin,
    threshold: typeof amount === "number" ? amount : thresholds[amount]
  });
  elements.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
}
function useInView(ref, { root, margin, amount, once = false, initial = false } = {}) {
  const [isInView, setInView] = reactExports.useState(initial);
  reactExports.useEffect(() => {
    if (!ref.current || once && isInView)
      return;
    const onEnter = () => {
      setInView(true);
      return once ? void 0 : () => setInView(false);
    };
    const options = {
      root: root && root.current || void 0,
      margin,
      amount
    };
    return inView(ref.current, onEnter, options);
  }, [root, ref, margin, once, amount]);
  return isInView;
}
const heroVideo = "/assets/hero-video-E4yPSOzM.mp4";
const FloatingCircle = ({
  size,
  top,
  left,
  gradient,
  duration,
  delay
}) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  motion.div,
  {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: [0, 15, 0] },
    transition: {
      opacity: { duration: 1.5, delay },
      y: { duration, repeat: Infinity, ease: "easeInOut", delay }
    },
    className: "absolute rounded-full pointer-events-none border border-white/[0.08] backdrop-blur-[2px]",
    style: {
      width: size,
      height: size,
      top,
      left,
      background: gradient
    }
  }
);
const TESTIMONIALS = [
  { quote: "I save 20 minutes every morning. Haven't second-guessed an outfit in weeks.", name: "Jessica M.", detail: "Premium · NYC", stars: 5 },
  { quote: "Stopped buying clothes I never wear. The AI knows my style better than I do.", name: "David R.", detail: "Style Plan · London", stars: 5 },
  { quote: "Everyone asks how I always look put together. This is why.", name: "Aisha K.", detail: "Premium · Dubai", stars: 5 }
];
const StatItem = ({ value, label }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center transition-transform hover:-translate-y-1 cursor-default", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-foreground sm:text-2xl", children: value }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-wider text-muted-foreground font-medium sm:text-xs", children: label })
] });
function GlassmorphismTrustHero() {
  const navigate = useNavigate();
  const heroRef = reactExports.useRef(null);
  const touchStartX = reactExports.useRef(0);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const videoY = useTransform(scrollYProgress, [0, 1], ["0%", "35%"]);
  const videoScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.1]);
  const [testimonialIdx, setTestimonialIdx] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length), 5e3);
    return () => clearInterval(timer);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: heroRef, className: "relative w-full bg-background text-foreground overflow-hidden font-sans", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes heroFadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroKenBurns {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        @keyframes heroMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .hero-animate-fade-in {
          animation: heroFadeSlideIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .hero-animate-marquee {
          animation: heroMarquee 60s linear infinite;
        }
        .hero-delay-100 { animation-delay: 0.1s; }
        .hero-delay-200 { animation-delay: 0.2s; }
        .hero-delay-300 { animation-delay: 0.3s; }
        .hero-delay-400 { animation-delay: 0.4s; }
        .hero-delay-500 { animation-delay: 0.5s; }
      ` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { className: "absolute inset-0 z-0", style: { y: videoY, scale: videoScale }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "video",
        {
          src: heroVideo,
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          className: "absolute inset-0 w-full h-[120%] object-cover",
          style: { animation: "heroKenBurns 20s ease-in-out infinite" }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-background/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 opacity-30",
          style: {
            background: "radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.2), transparent 60%), radial-gradient(ellipse at 70% 80%, hsl(var(--accent) / 0.15), transparent 60%)"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 pointer-events-none",
          style: { boxShadow: "inset 0 0 120px 60px hsl(var(--background))" }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 z-[1] overflow-hidden pointer-events-none", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingCircle, { size: 320, top: "-5%", left: "-8%", gradient: "radial-gradient(circle, hsl(var(--primary) / 0.1) 0%, transparent 70%)", duration: 14, delay: 0 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingCircle, { size: 200, top: "15%", left: "75%", gradient: "radial-gradient(circle, hsl(var(--accent) / 0.08) 0%, transparent 70%)", duration: 12, delay: 1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingCircle, { size: 400, top: "55%", left: "60%", gradient: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)", duration: 16, delay: 2 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingCircle, { size: 150, top: "70%", left: "10%", gradient: "radial-gradient(circle, hsla(0, 0%, 100%, 0.06) 0%, transparent 70%)", duration: 10, delay: 0.5 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingCircle, { size: 250, top: "30%", left: "40%", gradient: "radial-gradient(circle, hsl(var(--accent) / 0.06) 0%, transparent 70%)", duration: 13, delay: 1.5 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-12 sm:px-6 md:pt-32 md:pb-20 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-7 flex flex-col justify-center space-y-8 pt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hero-animate-fade-in hero-delay-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center gap-2 rounded-full border border-border/30 bg-card/50 px-3 py-1.5 backdrop-blur-md transition-colors hover:bg-card/80", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2", children: [
          "AI-Powered Styling",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3.5 h-3.5 text-yellow-400 fill-yellow-400" })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "h1",
          {
            className: "hero-animate-fade-in hero-delay-200 font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium tracking-tighter leading-[0.9]",
            style: {
              maskImage: "linear-gradient(180deg, black 0%, black 80%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(180deg, black 0%, black 80%, transparent 100%)"
            },
            children: [
              "Your AI Fashion Stylist",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "That Actually" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              "Knows You"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "hero-animate-fade-in hero-delay-300 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed", children: "Upload your closet. Get a weather-checked outfit every morning — built from what you already own." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hero-animate-fade-in hero-delay-400 flex flex-col sm:flex-row gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => navigate("/auth"),
              className: "group inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-background transition-all hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]",
              children: [
                "Try Free — No Card Needed",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4 transition-transform group-hover:translate-x-1" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                var _a;
                return (_a = document.getElementById("how-it-works")) == null ? void 0 : _a.scrollIntoView({ behavior: "smooth" });
              },
              className: "group inline-flex items-center justify-center gap-2 rounded-full border border-border/30 bg-card/30 px-8 py-4 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:bg-card/50 hover:border-border/50",
              children: [
                "See How It Works",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-5 space-y-6 lg:mt-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hero-animate-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-border/20 bg-card/30 p-8 backdrop-blur-xl shadow-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl font-bold tracking-tight text-foreground", children: "2,400+" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground", children: "Active Members" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Outfit Match Accuracy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: "96%" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-muted/30", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-[96%] rounded-full gold-gradient" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-full bg-border/20 mb-6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatItem, { value: "12K+", label: "Outfits Built" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatItem, { value: "24/7", label: "AI Stylist" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(StatItem, { value: "4.9★", label: "Rating" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full border border-border/20 bg-card/30 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-2 w-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-green-500" })
                ] }),
                "LIVE"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-1.5 rounded-full border border-border/20 bg-card/30 px-3 py-1 text-[10px] font-medium tracking-wide text-muted-foreground", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "w-3 h-3 text-yellow-500" }),
                "PREMIUM"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "hero-animate-fade-in hero-delay-500 relative overflow-hidden rounded-3xl border border-border/20 bg-card/30 p-6 backdrop-blur-xl touch-pan-y",
            onTouchStart: (e) => {
              touchStartX.current = e.touches[0].clientX;
            },
            onTouchEnd: (e) => {
              const diff = touchStartX.current - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 40) {
                setTestimonialIdx((prev) => diff > 0 ? (prev + 1) % TESTIMONIALS.length : (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
              }
            },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-2 left-4 text-3xl text-primary/40 font-serif select-none", children: '"' }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative min-h-[110px]", children: TESTIMONIALS.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: "transition-all duration-700 ease-in-out pl-4",
                  style: {
                    opacity: i === testimonialIdx ? 1 : 0,
                    position: i === testimonialIdx ? "relative" : "absolute",
                    top: i === testimonialIdx ? void 0 : 0,
                    left: i === testimonialIdx ? void 0 : 0,
                    right: i === testimonialIdx ? void 0 : 0
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed italic", children: t.quote }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-foreground", children: t.name }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: t.detail })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-auto flex gap-0.5", children: [...Array(t.stars)].map((_, j) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3 h-3 text-yellow-400 fill-yellow-400" }, j)) })
                    ] })
                  ]
                },
                i
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2 mt-5", children: TESTIMONIALS.map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setTestimonialIdx(i),
                  className: `h-1.5 rounded-full transition-all duration-500 ${i === testimonialIdx ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`,
                  "aria-label": `Show testimonial ${i + 1}`
                },
                i
              )) })
            ]
          }
        )
      ] })
    ] }) })
  ] });
}
const Hero = () => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(GlassmorphismTrustHero, {});
};
function isObject$1(subject) {
  return Object.prototype.toString.call(subject) === "[object Object]";
}
function isRecord(subject) {
  return isObject$1(subject) || Array.isArray(subject);
}
function canUseDOM() {
  return !!(typeof window !== "undefined" && window.document && window.document.createElement);
}
function areOptionsEqual(optionsA, optionsB) {
  const optionsAKeys = Object.keys(optionsA);
  const optionsBKeys = Object.keys(optionsB);
  if (optionsAKeys.length !== optionsBKeys.length) return false;
  const breakpointsA = JSON.stringify(Object.keys(optionsA.breakpoints || {}));
  const breakpointsB = JSON.stringify(Object.keys(optionsB.breakpoints || {}));
  if (breakpointsA !== breakpointsB) return false;
  return optionsAKeys.every((key) => {
    const valueA = optionsA[key];
    const valueB = optionsB[key];
    if (typeof valueA === "function") return `${valueA}` === `${valueB}`;
    if (!isRecord(valueA) || !isRecord(valueB)) return valueA === valueB;
    return areOptionsEqual(valueA, valueB);
  });
}
function sortAndMapPluginToOptions(plugins) {
  return plugins.concat().sort((a, b) => a.name > b.name ? 1 : -1).map((plugin) => plugin.options);
}
function arePluginsEqual(pluginsA, pluginsB) {
  if (pluginsA.length !== pluginsB.length) return false;
  const optionsA = sortAndMapPluginToOptions(pluginsA);
  const optionsB = sortAndMapPluginToOptions(pluginsB);
  return optionsA.every((optionA, index) => {
    const optionB = optionsB[index];
    return areOptionsEqual(optionA, optionB);
  });
}
function isNumber(subject) {
  return typeof subject === "number";
}
function isString(subject) {
  return typeof subject === "string";
}
function isBoolean(subject) {
  return typeof subject === "boolean";
}
function isObject(subject) {
  return Object.prototype.toString.call(subject) === "[object Object]";
}
function mathAbs(n) {
  return Math.abs(n);
}
function mathSign(n) {
  return Math.sign(n);
}
function deltaAbs(valueB, valueA) {
  return mathAbs(valueB - valueA);
}
function factorAbs(valueB, valueA) {
  if (valueB === 0 || valueA === 0) return 0;
  if (mathAbs(valueB) <= mathAbs(valueA)) return 0;
  const diff = deltaAbs(mathAbs(valueB), mathAbs(valueA));
  return mathAbs(diff / valueB);
}
function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}
function arrayKeys(array) {
  return objectKeys(array).map(Number);
}
function arrayLast(array) {
  return array[arrayLastIndex(array)];
}
function arrayLastIndex(array) {
  return Math.max(0, array.length - 1);
}
function arrayIsLastIndex(array, index) {
  return index === arrayLastIndex(array);
}
function arrayFromNumber(n, startAt = 0) {
  return Array.from(Array(n), (_, i) => startAt + i);
}
function objectKeys(object) {
  return Object.keys(object);
}
function objectsMergeDeep(objectA, objectB) {
  return [objectA, objectB].reduce((mergedObjects, currentObject) => {
    objectKeys(currentObject).forEach((key) => {
      const valueA = mergedObjects[key];
      const valueB = currentObject[key];
      const areObjects = isObject(valueA) && isObject(valueB);
      mergedObjects[key] = areObjects ? objectsMergeDeep(valueA, valueB) : valueB;
    });
    return mergedObjects;
  }, {});
}
function isMouseEvent(evt, ownerWindow) {
  return typeof ownerWindow.MouseEvent !== "undefined" && evt instanceof ownerWindow.MouseEvent;
}
function Alignment(align, viewSize) {
  const predefined = {
    start,
    center,
    end
  };
  function start() {
    return 0;
  }
  function center(n) {
    return end(n) / 2;
  }
  function end(n) {
    return viewSize - n;
  }
  function measure2(n, index) {
    if (isString(align)) return predefined[align](n);
    return align(viewSize, n, index);
  }
  const self = {
    measure: measure2
  };
  return self;
}
function EventStore() {
  let listeners = [];
  function add(node, type, handler, options = {
    passive: true
  }) {
    let removeListener;
    if ("addEventListener" in node) {
      node.addEventListener(type, handler, options);
      removeListener = () => node.removeEventListener(type, handler, options);
    } else {
      const legacyMediaQueryList = node;
      legacyMediaQueryList.addListener(handler);
      removeListener = () => legacyMediaQueryList.removeListener(handler);
    }
    listeners.push(removeListener);
    return self;
  }
  function clear() {
    listeners = listeners.filter((remove) => remove());
  }
  const self = {
    add,
    clear
  };
  return self;
}
function Animations(ownerDocument, ownerWindow, update, render) {
  const documentVisibleHandler = EventStore();
  const fixedTimeStep = 1e3 / 60;
  let lastTimeStamp = null;
  let accumulatedTime = 0;
  let animationId = 0;
  function init() {
    documentVisibleHandler.add(ownerDocument, "visibilitychange", () => {
      if (ownerDocument.hidden) reset();
    });
  }
  function destroy() {
    stop();
    documentVisibleHandler.clear();
  }
  function animate(timeStamp) {
    if (!animationId) return;
    if (!lastTimeStamp) {
      lastTimeStamp = timeStamp;
      update();
      update();
    }
    const timeElapsed = timeStamp - lastTimeStamp;
    lastTimeStamp = timeStamp;
    accumulatedTime += timeElapsed;
    while (accumulatedTime >= fixedTimeStep) {
      update();
      accumulatedTime -= fixedTimeStep;
    }
    const alpha = accumulatedTime / fixedTimeStep;
    render(alpha);
    if (animationId) {
      animationId = ownerWindow.requestAnimationFrame(animate);
    }
  }
  function start() {
    if (animationId) return;
    animationId = ownerWindow.requestAnimationFrame(animate);
  }
  function stop() {
    ownerWindow.cancelAnimationFrame(animationId);
    lastTimeStamp = null;
    accumulatedTime = 0;
    animationId = 0;
  }
  function reset() {
    lastTimeStamp = null;
    accumulatedTime = 0;
  }
  const self = {
    init,
    destroy,
    start,
    stop,
    update,
    render
  };
  return self;
}
function Axis(axis, contentDirection) {
  const isRightToLeft = contentDirection === "rtl";
  const isVertical = axis === "y";
  const scroll2 = isVertical ? "y" : "x";
  const cross = isVertical ? "x" : "y";
  const sign = !isVertical && isRightToLeft ? -1 : 1;
  const startEdge = getStartEdge();
  const endEdge = getEndEdge();
  function measureSize(nodeRect) {
    const {
      height,
      width
    } = nodeRect;
    return isVertical ? height : width;
  }
  function getStartEdge() {
    if (isVertical) return "top";
    return isRightToLeft ? "right" : "left";
  }
  function getEndEdge() {
    if (isVertical) return "bottom";
    return isRightToLeft ? "left" : "right";
  }
  function direction(n) {
    return n * sign;
  }
  const self = {
    scroll: scroll2,
    cross,
    startEdge,
    endEdge,
    measureSize,
    direction
  };
  return self;
}
function Limit(min = 0, max = 0) {
  const length = mathAbs(min - max);
  function reachedMin(n) {
    return n < min;
  }
  function reachedMax(n) {
    return n > max;
  }
  function reachedAny(n) {
    return reachedMin(n) || reachedMax(n);
  }
  function constrain(n) {
    if (!reachedAny(n)) return n;
    return reachedMin(n) ? min : max;
  }
  function removeOffset(n) {
    if (!length) return n;
    return n - length * Math.ceil((n - max) / length);
  }
  const self = {
    length,
    max,
    min,
    constrain,
    reachedAny,
    reachedMax,
    reachedMin,
    removeOffset
  };
  return self;
}
function Counter(max, start, loop) {
  const {
    constrain
  } = Limit(0, max);
  const loopEnd = max + 1;
  let counter = withinLimit(start);
  function withinLimit(n) {
    return !loop ? constrain(n) : mathAbs((loopEnd + n) % loopEnd);
  }
  function get() {
    return counter;
  }
  function set(n) {
    counter = withinLimit(n);
    return self;
  }
  function add(n) {
    return clone().set(get() + n);
  }
  function clone() {
    return Counter(max, get(), loop);
  }
  const self = {
    get,
    set,
    add,
    clone
  };
  return self;
}
function DragHandler(axis, rootNode, ownerDocument, ownerWindow, target, dragTracker, location, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, baseFriction, watchDrag) {
  const {
    cross: crossAxis,
    direction
  } = axis;
  const focusNodes = ["INPUT", "SELECT", "TEXTAREA"];
  const nonPassiveEvent = {
    passive: false
  };
  const initEvents = EventStore();
  const dragEvents = EventStore();
  const goToNextThreshold = Limit(50, 225).constrain(percentOfView.measure(20));
  const snapForceBoost = {
    mouse: 300,
    touch: 400
  };
  const freeForceBoost = {
    mouse: 500,
    touch: 600
  };
  const baseSpeed = dragFree ? 43 : 25;
  let isMoving = false;
  let startScroll = 0;
  let startCross = 0;
  let pointerIsDown = false;
  let preventScroll = false;
  let preventClick = false;
  let isMouse = false;
  function init(emblaApi) {
    if (!watchDrag) return;
    function downIfAllowed(evt) {
      if (isBoolean(watchDrag) || watchDrag(emblaApi, evt)) down(evt);
    }
    const node = rootNode;
    initEvents.add(node, "dragstart", (evt) => evt.preventDefault(), nonPassiveEvent).add(node, "touchmove", () => void 0, nonPassiveEvent).add(node, "touchend", () => void 0).add(node, "touchstart", downIfAllowed).add(node, "mousedown", downIfAllowed).add(node, "touchcancel", up).add(node, "contextmenu", up).add(node, "click", click, true);
  }
  function destroy() {
    initEvents.clear();
    dragEvents.clear();
  }
  function addDragEvents() {
    const node = isMouse ? ownerDocument : rootNode;
    dragEvents.add(node, "touchmove", move, nonPassiveEvent).add(node, "touchend", up).add(node, "mousemove", move, nonPassiveEvent).add(node, "mouseup", up);
  }
  function isFocusNode(node) {
    const nodeName = node.nodeName || "";
    return focusNodes.includes(nodeName);
  }
  function forceBoost() {
    const boost = dragFree ? freeForceBoost : snapForceBoost;
    const type = isMouse ? "mouse" : "touch";
    return boost[type];
  }
  function allowedForce(force, targetChanged) {
    const next = index.add(mathSign(force) * -1);
    const baseForce = scrollTarget.byDistance(force, !dragFree).distance;
    if (dragFree || mathAbs(force) < goToNextThreshold) return baseForce;
    if (skipSnaps && targetChanged) return baseForce * 0.5;
    return scrollTarget.byIndex(next.get(), 0).distance;
  }
  function down(evt) {
    const isMouseEvt = isMouseEvent(evt, ownerWindow);
    isMouse = isMouseEvt;
    preventClick = dragFree && isMouseEvt && !evt.buttons && isMoving;
    isMoving = deltaAbs(target.get(), location.get()) >= 2;
    if (isMouseEvt && evt.button !== 0) return;
    if (isFocusNode(evt.target)) return;
    pointerIsDown = true;
    dragTracker.pointerDown(evt);
    scrollBody.useFriction(0).useDuration(0);
    target.set(location);
    addDragEvents();
    startScroll = dragTracker.readPoint(evt);
    startCross = dragTracker.readPoint(evt, crossAxis);
    eventHandler.emit("pointerDown");
  }
  function move(evt) {
    const isTouchEvt = !isMouseEvent(evt, ownerWindow);
    if (isTouchEvt && evt.touches.length >= 2) return up(evt);
    const lastScroll = dragTracker.readPoint(evt);
    const lastCross = dragTracker.readPoint(evt, crossAxis);
    const diffScroll = deltaAbs(lastScroll, startScroll);
    const diffCross = deltaAbs(lastCross, startCross);
    if (!preventScroll && !isMouse) {
      if (!evt.cancelable) return up(evt);
      preventScroll = diffScroll > diffCross;
      if (!preventScroll) return up(evt);
    }
    const diff = dragTracker.pointerMove(evt);
    if (diffScroll > dragThreshold) preventClick = true;
    scrollBody.useFriction(0.3).useDuration(0.75);
    animation.start();
    target.add(direction(diff));
    evt.preventDefault();
  }
  function up(evt) {
    const currentLocation = scrollTarget.byDistance(0, false);
    const targetChanged = currentLocation.index !== index.get();
    const rawForce = dragTracker.pointerUp(evt) * forceBoost();
    const force = allowedForce(direction(rawForce), targetChanged);
    const forceFactor = factorAbs(rawForce, force);
    const speed = baseSpeed - 10 * forceFactor;
    const friction = baseFriction + forceFactor / 50;
    preventScroll = false;
    pointerIsDown = false;
    dragEvents.clear();
    scrollBody.useDuration(speed).useFriction(friction);
    scrollTo.distance(force, !dragFree);
    isMouse = false;
    eventHandler.emit("pointerUp");
  }
  function click(evt) {
    if (preventClick) {
      evt.stopPropagation();
      evt.preventDefault();
      preventClick = false;
    }
  }
  function pointerDown() {
    return pointerIsDown;
  }
  const self = {
    init,
    destroy,
    pointerDown
  };
  return self;
}
function DragTracker(axis, ownerWindow) {
  const logInterval = 170;
  let startEvent;
  let lastEvent;
  function readTime(evt) {
    return evt.timeStamp;
  }
  function readPoint(evt, evtAxis) {
    const property = evtAxis || axis.scroll;
    const coord = `client${property === "x" ? "X" : "Y"}`;
    return (isMouseEvent(evt, ownerWindow) ? evt : evt.touches[0])[coord];
  }
  function pointerDown(evt) {
    startEvent = evt;
    lastEvent = evt;
    return readPoint(evt);
  }
  function pointerMove(evt) {
    const diff = readPoint(evt) - readPoint(lastEvent);
    const expired = readTime(evt) - readTime(startEvent) > logInterval;
    lastEvent = evt;
    if (expired) startEvent = evt;
    return diff;
  }
  function pointerUp(evt) {
    if (!startEvent || !lastEvent) return 0;
    const diffDrag = readPoint(lastEvent) - readPoint(startEvent);
    const diffTime = readTime(evt) - readTime(startEvent);
    const expired = readTime(evt) - readTime(lastEvent) > logInterval;
    const force = diffDrag / diffTime;
    const isFlick = diffTime && !expired && mathAbs(force) > 0.1;
    return isFlick ? force : 0;
  }
  const self = {
    pointerDown,
    pointerMove,
    pointerUp,
    readPoint
  };
  return self;
}
function NodeRects() {
  function measure2(node) {
    const {
      offsetTop,
      offsetLeft,
      offsetWidth,
      offsetHeight
    } = node;
    const offset = {
      top: offsetTop,
      right: offsetLeft + offsetWidth,
      bottom: offsetTop + offsetHeight,
      left: offsetLeft,
      width: offsetWidth,
      height: offsetHeight
    };
    return offset;
  }
  const self = {
    measure: measure2
  };
  return self;
}
function PercentOfView(viewSize) {
  function measure2(n) {
    return viewSize * (n / 100);
  }
  const self = {
    measure: measure2
  };
  return self;
}
function ResizeHandler(container, eventHandler, ownerWindow, slides, axis, watchResize, nodeRects) {
  const observeNodes = [container].concat(slides);
  let resizeObserver;
  let containerSize;
  let slideSizes = [];
  let destroyed = false;
  function readSize(node) {
    return axis.measureSize(nodeRects.measure(node));
  }
  function init(emblaApi) {
    if (!watchResize) return;
    containerSize = readSize(container);
    slideSizes = slides.map(readSize);
    function defaultCallback(entries) {
      for (const entry of entries) {
        if (destroyed) return;
        const isContainer = entry.target === container;
        const slideIndex = slides.indexOf(entry.target);
        const lastSize = isContainer ? containerSize : slideSizes[slideIndex];
        const newSize = readSize(isContainer ? container : slides[slideIndex]);
        const diffSize = mathAbs(newSize - lastSize);
        if (diffSize >= 0.5) {
          emblaApi.reInit();
          eventHandler.emit("resize");
          break;
        }
      }
    }
    resizeObserver = new ResizeObserver((entries) => {
      if (isBoolean(watchResize) || watchResize(emblaApi, entries)) {
        defaultCallback(entries);
      }
    });
    ownerWindow.requestAnimationFrame(() => {
      observeNodes.forEach((node) => resizeObserver.observe(node));
    });
  }
  function destroy() {
    destroyed = true;
    if (resizeObserver) resizeObserver.disconnect();
  }
  const self = {
    init,
    destroy
  };
  return self;
}
function ScrollBody(location, offsetLocation, previousLocation, target, baseDuration, baseFriction) {
  let scrollVelocity = 0;
  let scrollDirection = 0;
  let scrollDuration = baseDuration;
  let scrollFriction = baseFriction;
  let rawLocation = location.get();
  let rawLocationPrevious = 0;
  function seek() {
    const displacement = target.get() - location.get();
    const isInstant = !scrollDuration;
    let scrollDistance = 0;
    if (isInstant) {
      scrollVelocity = 0;
      previousLocation.set(target);
      location.set(target);
      scrollDistance = displacement;
    } else {
      previousLocation.set(location);
      scrollVelocity += displacement / scrollDuration;
      scrollVelocity *= scrollFriction;
      rawLocation += scrollVelocity;
      location.add(scrollVelocity);
      scrollDistance = rawLocation - rawLocationPrevious;
    }
    scrollDirection = mathSign(scrollDistance);
    rawLocationPrevious = rawLocation;
    return self;
  }
  function settled() {
    const diff = target.get() - offsetLocation.get();
    return mathAbs(diff) < 1e-3;
  }
  function duration() {
    return scrollDuration;
  }
  function direction() {
    return scrollDirection;
  }
  function velocity() {
    return scrollVelocity;
  }
  function useBaseDuration() {
    return useDuration(baseDuration);
  }
  function useBaseFriction() {
    return useFriction(baseFriction);
  }
  function useDuration(n) {
    scrollDuration = n;
    return self;
  }
  function useFriction(n) {
    scrollFriction = n;
    return self;
  }
  const self = {
    direction,
    duration,
    velocity,
    seek,
    settled,
    useBaseFriction,
    useBaseDuration,
    useFriction,
    useDuration
  };
  return self;
}
function ScrollBounds(limit, location, target, scrollBody, percentOfView) {
  const pullBackThreshold = percentOfView.measure(10);
  const edgeOffsetTolerance = percentOfView.measure(50);
  const frictionLimit = Limit(0.1, 0.99);
  let disabled = false;
  function shouldConstrain() {
    if (disabled) return false;
    if (!limit.reachedAny(target.get())) return false;
    if (!limit.reachedAny(location.get())) return false;
    return true;
  }
  function constrain(pointerDown) {
    if (!shouldConstrain()) return;
    const edge = limit.reachedMin(location.get()) ? "min" : "max";
    const diffToEdge = mathAbs(limit[edge] - location.get());
    const diffToTarget = target.get() - location.get();
    const friction = frictionLimit.constrain(diffToEdge / edgeOffsetTolerance);
    target.subtract(diffToTarget * friction);
    if (!pointerDown && mathAbs(diffToTarget) < pullBackThreshold) {
      target.set(limit.constrain(target.get()));
      scrollBody.useDuration(25).useBaseFriction();
    }
  }
  function toggleActive(active) {
    disabled = !active;
  }
  const self = {
    shouldConstrain,
    constrain,
    toggleActive
  };
  return self;
}
function ScrollContain(viewSize, contentSize, snapsAligned, containScroll, pixelTolerance) {
  const scrollBounds = Limit(-contentSize + viewSize, 0);
  const snapsBounded = measureBounded();
  const scrollContainLimit = findScrollContainLimit();
  const snapsContained = measureContained();
  function usePixelTolerance(bound, snap) {
    return deltaAbs(bound, snap) <= 1;
  }
  function findScrollContainLimit() {
    const startSnap = snapsBounded[0];
    const endSnap = arrayLast(snapsBounded);
    const min = snapsBounded.lastIndexOf(startSnap);
    const max = snapsBounded.indexOf(endSnap) + 1;
    return Limit(min, max);
  }
  function measureBounded() {
    return snapsAligned.map((snapAligned, index) => {
      const {
        min,
        max
      } = scrollBounds;
      const snap = scrollBounds.constrain(snapAligned);
      const isFirst = !index;
      const isLast = arrayIsLastIndex(snapsAligned, index);
      if (isFirst) return max;
      if (isLast) return min;
      if (usePixelTolerance(min, snap)) return min;
      if (usePixelTolerance(max, snap)) return max;
      return snap;
    }).map((scrollBound) => parseFloat(scrollBound.toFixed(3)));
  }
  function measureContained() {
    if (contentSize <= viewSize + pixelTolerance) return [scrollBounds.max];
    if (containScroll === "keepSnaps") return snapsBounded;
    const {
      min,
      max
    } = scrollContainLimit;
    return snapsBounded.slice(min, max);
  }
  const self = {
    snapsContained,
    scrollContainLimit
  };
  return self;
}
function ScrollLimit(contentSize, scrollSnaps, loop) {
  const max = scrollSnaps[0];
  const min = loop ? max - contentSize : arrayLast(scrollSnaps);
  const limit = Limit(min, max);
  const self = {
    limit
  };
  return self;
}
function ScrollLooper(contentSize, limit, location, vectors) {
  const jointSafety = 0.1;
  const min = limit.min + jointSafety;
  const max = limit.max + jointSafety;
  const {
    reachedMin,
    reachedMax
  } = Limit(min, max);
  function shouldLoop(direction) {
    if (direction === 1) return reachedMax(location.get());
    if (direction === -1) return reachedMin(location.get());
    return false;
  }
  function loop(direction) {
    if (!shouldLoop(direction)) return;
    const loopDistance = contentSize * (direction * -1);
    vectors.forEach((v) => v.add(loopDistance));
  }
  const self = {
    loop
  };
  return self;
}
function ScrollProgress(limit) {
  const {
    max,
    length
  } = limit;
  function get(n) {
    const currentLocation = n - max;
    return length ? currentLocation / -length : 0;
  }
  const self = {
    get
  };
  return self;
}
function ScrollSnaps(axis, alignment, containerRect, slideRects, slidesToScroll) {
  const {
    startEdge,
    endEdge
  } = axis;
  const {
    groupSlides
  } = slidesToScroll;
  const alignments = measureSizes().map(alignment.measure);
  const snaps = measureUnaligned();
  const snapsAligned = measureAligned();
  function measureSizes() {
    return groupSlides(slideRects).map((rects) => arrayLast(rects)[endEdge] - rects[0][startEdge]).map(mathAbs);
  }
  function measureUnaligned() {
    return slideRects.map((rect) => containerRect[startEdge] - rect[startEdge]).map((snap) => -mathAbs(snap));
  }
  function measureAligned() {
    return groupSlides(snaps).map((g) => g[0]).map((snap, index) => snap + alignments[index]);
  }
  const self = {
    snaps,
    snapsAligned
  };
  return self;
}
function SlideRegistry(containSnaps, containScroll, scrollSnaps, scrollContainLimit, slidesToScroll, slideIndexes) {
  const {
    groupSlides
  } = slidesToScroll;
  const {
    min,
    max
  } = scrollContainLimit;
  const slideRegistry = createSlideRegistry();
  function createSlideRegistry() {
    const groupedSlideIndexes = groupSlides(slideIndexes);
    const doNotContain = !containSnaps || containScroll === "keepSnaps";
    if (scrollSnaps.length === 1) return [slideIndexes];
    if (doNotContain) return groupedSlideIndexes;
    return groupedSlideIndexes.slice(min, max).map((group, index, groups) => {
      const isFirst = !index;
      const isLast = arrayIsLastIndex(groups, index);
      if (isFirst) {
        const range = arrayLast(groups[0]) + 1;
        return arrayFromNumber(range);
      }
      if (isLast) {
        const range = arrayLastIndex(slideIndexes) - arrayLast(groups)[0] + 1;
        return arrayFromNumber(range, arrayLast(groups)[0]);
      }
      return group;
    });
  }
  const self = {
    slideRegistry
  };
  return self;
}
function ScrollTarget(loop, scrollSnaps, contentSize, limit, targetVector) {
  const {
    reachedAny,
    removeOffset,
    constrain
  } = limit;
  function minDistance(distances) {
    return distances.concat().sort((a, b) => mathAbs(a) - mathAbs(b))[0];
  }
  function findTargetSnap(target) {
    const distance = loop ? removeOffset(target) : constrain(target);
    const ascDiffsToSnaps = scrollSnaps.map((snap, index2) => ({
      diff: shortcut(snap - distance, 0),
      index: index2
    })).sort((d1, d2) => mathAbs(d1.diff) - mathAbs(d2.diff));
    const {
      index
    } = ascDiffsToSnaps[0];
    return {
      index,
      distance
    };
  }
  function shortcut(target, direction) {
    const targets = [target, target + contentSize, target - contentSize];
    if (!loop) return target;
    if (!direction) return minDistance(targets);
    const matchingTargets = targets.filter((t) => mathSign(t) === direction);
    if (matchingTargets.length) return minDistance(matchingTargets);
    return arrayLast(targets) - contentSize;
  }
  function byIndex(index, direction) {
    const diffToSnap = scrollSnaps[index] - targetVector.get();
    const distance = shortcut(diffToSnap, direction);
    return {
      index,
      distance
    };
  }
  function byDistance(distance, snap) {
    const target = targetVector.get() + distance;
    const {
      index,
      distance: targetSnapDistance
    } = findTargetSnap(target);
    const reachedBound = !loop && reachedAny(target);
    if (!snap || reachedBound) return {
      index,
      distance
    };
    const diffToSnap = scrollSnaps[index] - targetSnapDistance;
    const snapDistance = distance + shortcut(diffToSnap, 0);
    return {
      index,
      distance: snapDistance
    };
  }
  const self = {
    byDistance,
    byIndex,
    shortcut
  };
  return self;
}
function ScrollTo(animation, indexCurrent, indexPrevious, scrollBody, scrollTarget, targetVector, eventHandler) {
  function scrollTo(target) {
    const distanceDiff = target.distance;
    const indexDiff = target.index !== indexCurrent.get();
    targetVector.add(distanceDiff);
    if (distanceDiff) {
      if (scrollBody.duration()) {
        animation.start();
      } else {
        animation.update();
        animation.render(1);
        animation.update();
      }
    }
    if (indexDiff) {
      indexPrevious.set(indexCurrent.get());
      indexCurrent.set(target.index);
      eventHandler.emit("select");
    }
  }
  function distance(n, snap) {
    const target = scrollTarget.byDistance(n, snap);
    scrollTo(target);
  }
  function index(n, direction) {
    const targetIndex = indexCurrent.clone().set(n);
    const target = scrollTarget.byIndex(targetIndex.get(), direction);
    scrollTo(target);
  }
  const self = {
    distance,
    index
  };
  return self;
}
function SlideFocus(root, slides, slideRegistry, scrollTo, scrollBody, eventStore, eventHandler, watchFocus) {
  const focusListenerOptions = {
    passive: true,
    capture: true
  };
  let lastTabPressTime = 0;
  function init(emblaApi) {
    if (!watchFocus) return;
    function defaultCallback(index) {
      const nowTime = (/* @__PURE__ */ new Date()).getTime();
      const diffTime = nowTime - lastTabPressTime;
      if (diffTime > 10) return;
      eventHandler.emit("slideFocusStart");
      root.scrollLeft = 0;
      const group = slideRegistry.findIndex((group2) => group2.includes(index));
      if (!isNumber(group)) return;
      scrollBody.useDuration(0);
      scrollTo.index(group, 0);
      eventHandler.emit("slideFocus");
    }
    eventStore.add(document, "keydown", registerTabPress, false);
    slides.forEach((slide, slideIndex) => {
      eventStore.add(slide, "focus", (evt) => {
        if (isBoolean(watchFocus) || watchFocus(emblaApi, evt)) {
          defaultCallback(slideIndex);
        }
      }, focusListenerOptions);
    });
  }
  function registerTabPress(event) {
    if (event.code === "Tab") lastTabPressTime = (/* @__PURE__ */ new Date()).getTime();
  }
  const self = {
    init
  };
  return self;
}
function Vector1D(initialValue) {
  let value = initialValue;
  function get() {
    return value;
  }
  function set(n) {
    value = normalizeInput(n);
  }
  function add(n) {
    value += normalizeInput(n);
  }
  function subtract(n) {
    value -= normalizeInput(n);
  }
  function normalizeInput(n) {
    return isNumber(n) ? n : n.get();
  }
  const self = {
    get,
    set,
    add,
    subtract
  };
  return self;
}
function Translate(axis, container) {
  const translate = axis.scroll === "x" ? x : y;
  const containerStyle = container.style;
  let previousTarget = null;
  let disabled = false;
  function x(n) {
    return `translate3d(${n}px,0px,0px)`;
  }
  function y(n) {
    return `translate3d(0px,${n}px,0px)`;
  }
  function to(target) {
    if (disabled) return;
    const newTarget = roundToTwoDecimals(axis.direction(target));
    if (newTarget === previousTarget) return;
    containerStyle.transform = translate(newTarget);
    previousTarget = newTarget;
  }
  function toggleActive(active) {
    disabled = !active;
  }
  function clear() {
    if (disabled) return;
    containerStyle.transform = "";
    if (!container.getAttribute("style")) container.removeAttribute("style");
  }
  const self = {
    clear,
    to,
    toggleActive
  };
  return self;
}
function SlideLooper(axis, viewSize, contentSize, slideSizes, slideSizesWithGaps, snaps, scrollSnaps, location, slides) {
  const roundingSafety = 0.5;
  const ascItems = arrayKeys(slideSizesWithGaps);
  const descItems = arrayKeys(slideSizesWithGaps).reverse();
  const loopPoints = startPoints().concat(endPoints());
  function removeSlideSizes(indexes, from) {
    return indexes.reduce((a, i) => {
      return a - slideSizesWithGaps[i];
    }, from);
  }
  function slidesInGap(indexes, gap) {
    return indexes.reduce((a, i) => {
      const remainingGap = removeSlideSizes(a, gap);
      return remainingGap > 0 ? a.concat([i]) : a;
    }, []);
  }
  function findSlideBounds(offset) {
    return snaps.map((snap, index) => ({
      start: snap - slideSizes[index] + roundingSafety + offset,
      end: snap + viewSize - roundingSafety + offset
    }));
  }
  function findLoopPoints(indexes, offset, isEndEdge) {
    const slideBounds = findSlideBounds(offset);
    return indexes.map((index) => {
      const initial = isEndEdge ? 0 : -contentSize;
      const altered = isEndEdge ? contentSize : 0;
      const boundEdge = isEndEdge ? "end" : "start";
      const loopPoint = slideBounds[index][boundEdge];
      return {
        index,
        loopPoint,
        slideLocation: Vector1D(-1),
        translate: Translate(axis, slides[index]),
        target: () => location.get() > loopPoint ? initial : altered
      };
    });
  }
  function startPoints() {
    const gap = scrollSnaps[0];
    const indexes = slidesInGap(descItems, gap);
    return findLoopPoints(indexes, contentSize, false);
  }
  function endPoints() {
    const gap = viewSize - scrollSnaps[0] - 1;
    const indexes = slidesInGap(ascItems, gap);
    return findLoopPoints(indexes, -contentSize, true);
  }
  function canLoop() {
    return loopPoints.every(({
      index
    }) => {
      const otherIndexes = ascItems.filter((i) => i !== index);
      return removeSlideSizes(otherIndexes, viewSize) <= 0.1;
    });
  }
  function loop() {
    loopPoints.forEach((loopPoint) => {
      const {
        target,
        translate,
        slideLocation
      } = loopPoint;
      const shiftLocation = target();
      if (shiftLocation === slideLocation.get()) return;
      translate.to(shiftLocation);
      slideLocation.set(shiftLocation);
    });
  }
  function clear() {
    loopPoints.forEach((loopPoint) => loopPoint.translate.clear());
  }
  const self = {
    canLoop,
    clear,
    loop,
    loopPoints
  };
  return self;
}
function SlidesHandler(container, eventHandler, watchSlides) {
  let mutationObserver;
  let destroyed = false;
  function init(emblaApi) {
    if (!watchSlides) return;
    function defaultCallback(mutations) {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          emblaApi.reInit();
          eventHandler.emit("slidesChanged");
          break;
        }
      }
    }
    mutationObserver = new MutationObserver((mutations) => {
      if (destroyed) return;
      if (isBoolean(watchSlides) || watchSlides(emblaApi, mutations)) {
        defaultCallback(mutations);
      }
    });
    mutationObserver.observe(container, {
      childList: true
    });
  }
  function destroy() {
    if (mutationObserver) mutationObserver.disconnect();
    destroyed = true;
  }
  const self = {
    init,
    destroy
  };
  return self;
}
function SlidesInView(container, slides, eventHandler, threshold) {
  const intersectionEntryMap = {};
  let inViewCache = null;
  let notInViewCache = null;
  let intersectionObserver;
  let destroyed = false;
  function init() {
    intersectionObserver = new IntersectionObserver((entries) => {
      if (destroyed) return;
      entries.forEach((entry) => {
        const index = slides.indexOf(entry.target);
        intersectionEntryMap[index] = entry;
      });
      inViewCache = null;
      notInViewCache = null;
      eventHandler.emit("slidesInView");
    }, {
      root: container.parentElement,
      threshold
    });
    slides.forEach((slide) => intersectionObserver.observe(slide));
  }
  function destroy() {
    if (intersectionObserver) intersectionObserver.disconnect();
    destroyed = true;
  }
  function createInViewList(inView2) {
    return objectKeys(intersectionEntryMap).reduce((list, slideIndex) => {
      const index = parseInt(slideIndex);
      const {
        isIntersecting
      } = intersectionEntryMap[index];
      const inViewMatch = inView2 && isIntersecting;
      const notInViewMatch = !inView2 && !isIntersecting;
      if (inViewMatch || notInViewMatch) list.push(index);
      return list;
    }, []);
  }
  function get(inView2 = true) {
    if (inView2 && inViewCache) return inViewCache;
    if (!inView2 && notInViewCache) return notInViewCache;
    const slideIndexes = createInViewList(inView2);
    if (inView2) inViewCache = slideIndexes;
    if (!inView2) notInViewCache = slideIndexes;
    return slideIndexes;
  }
  const self = {
    init,
    destroy,
    get
  };
  return self;
}
function SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow) {
  const {
    measureSize,
    startEdge,
    endEdge
  } = axis;
  const withEdgeGap = slideRects[0] && readEdgeGap;
  const startGap = measureStartGap();
  const endGap = measureEndGap();
  const slideSizes = slideRects.map(measureSize);
  const slideSizesWithGaps = measureWithGaps();
  function measureStartGap() {
    if (!withEdgeGap) return 0;
    const slideRect = slideRects[0];
    return mathAbs(containerRect[startEdge] - slideRect[startEdge]);
  }
  function measureEndGap() {
    if (!withEdgeGap) return 0;
    const style = ownerWindow.getComputedStyle(arrayLast(slides));
    return parseFloat(style.getPropertyValue(`margin-${endEdge}`));
  }
  function measureWithGaps() {
    return slideRects.map((rect, index, rects) => {
      const isFirst = !index;
      const isLast = arrayIsLastIndex(rects, index);
      if (isFirst) return slideSizes[index] + startGap;
      if (isLast) return slideSizes[index] + endGap;
      return rects[index + 1][startEdge] - rect[startEdge];
    }).map(mathAbs);
  }
  const self = {
    slideSizes,
    slideSizesWithGaps,
    startGap,
    endGap
  };
  return self;
}
function SlidesToScroll(axis, viewSize, slidesToScroll, loop, containerRect, slideRects, startGap, endGap, pixelTolerance) {
  const {
    startEdge,
    endEdge,
    direction
  } = axis;
  const groupByNumber = isNumber(slidesToScroll);
  function byNumber(array, groupSize) {
    return arrayKeys(array).filter((i) => i % groupSize === 0).map((i) => array.slice(i, i + groupSize));
  }
  function bySize(array) {
    if (!array.length) return [];
    return arrayKeys(array).reduce((groups, rectB, index) => {
      const rectA = arrayLast(groups) || 0;
      const isFirst = rectA === 0;
      const isLast = rectB === arrayLastIndex(array);
      const edgeA = containerRect[startEdge] - slideRects[rectA][startEdge];
      const edgeB = containerRect[startEdge] - slideRects[rectB][endEdge];
      const gapA = !loop && isFirst ? direction(startGap) : 0;
      const gapB = !loop && isLast ? direction(endGap) : 0;
      const chunkSize = mathAbs(edgeB - gapB - (edgeA + gapA));
      if (index && chunkSize > viewSize + pixelTolerance) groups.push(rectB);
      if (isLast) groups.push(array.length);
      return groups;
    }, []).map((currentSize, index, groups) => {
      const previousSize = Math.max(groups[index - 1] || 0);
      return array.slice(previousSize, currentSize);
    });
  }
  function groupSlides(array) {
    return groupByNumber ? byNumber(array, slidesToScroll) : bySize(array);
  }
  const self = {
    groupSlides
  };
  return self;
}
function Engine(root, container, slides, ownerDocument, ownerWindow, options, eventHandler) {
  const {
    align,
    axis: scrollAxis,
    direction,
    startIndex,
    loop,
    duration,
    dragFree,
    dragThreshold,
    inViewThreshold,
    slidesToScroll: groupSlides,
    skipSnaps,
    containScroll,
    watchResize,
    watchSlides,
    watchDrag,
    watchFocus
  } = options;
  const pixelTolerance = 2;
  const nodeRects = NodeRects();
  const containerRect = nodeRects.measure(container);
  const slideRects = slides.map(nodeRects.measure);
  const axis = Axis(scrollAxis, direction);
  const viewSize = axis.measureSize(containerRect);
  const percentOfView = PercentOfView(viewSize);
  const alignment = Alignment(align, viewSize);
  const containSnaps = !loop && !!containScroll;
  const readEdgeGap = loop || !!containScroll;
  const {
    slideSizes,
    slideSizesWithGaps,
    startGap,
    endGap
  } = SlideSizes(axis, containerRect, slideRects, slides, readEdgeGap, ownerWindow);
  const slidesToScroll = SlidesToScroll(axis, viewSize, groupSlides, loop, containerRect, slideRects, startGap, endGap, pixelTolerance);
  const {
    snaps,
    snapsAligned
  } = ScrollSnaps(axis, alignment, containerRect, slideRects, slidesToScroll);
  const contentSize = -arrayLast(snaps) + arrayLast(slideSizesWithGaps);
  const {
    snapsContained,
    scrollContainLimit
  } = ScrollContain(viewSize, contentSize, snapsAligned, containScroll, pixelTolerance);
  const scrollSnaps = containSnaps ? snapsContained : snapsAligned;
  const {
    limit
  } = ScrollLimit(contentSize, scrollSnaps, loop);
  const index = Counter(arrayLastIndex(scrollSnaps), startIndex, loop);
  const indexPrevious = index.clone();
  const slideIndexes = arrayKeys(slides);
  const update = ({
    dragHandler,
    scrollBody: scrollBody2,
    scrollBounds,
    options: {
      loop: loop2
    }
  }) => {
    if (!loop2) scrollBounds.constrain(dragHandler.pointerDown());
    scrollBody2.seek();
  };
  const render = ({
    scrollBody: scrollBody2,
    translate,
    location: location2,
    offsetLocation: offsetLocation2,
    previousLocation: previousLocation2,
    scrollLooper,
    slideLooper,
    dragHandler,
    animation: animation2,
    eventHandler: eventHandler2,
    scrollBounds,
    options: {
      loop: loop2
    }
  }, alpha) => {
    const shouldSettle = scrollBody2.settled();
    const withinBounds = !scrollBounds.shouldConstrain();
    const hasSettled = loop2 ? shouldSettle : shouldSettle && withinBounds;
    const hasSettledAndIdle = hasSettled && !dragHandler.pointerDown();
    if (hasSettledAndIdle) animation2.stop();
    const interpolatedLocation = location2.get() * alpha + previousLocation2.get() * (1 - alpha);
    offsetLocation2.set(interpolatedLocation);
    if (loop2) {
      scrollLooper.loop(scrollBody2.direction());
      slideLooper.loop();
    }
    translate.to(offsetLocation2.get());
    if (hasSettledAndIdle) eventHandler2.emit("settle");
    if (!hasSettled) eventHandler2.emit("scroll");
  };
  const animation = Animations(ownerDocument, ownerWindow, () => update(engine), (alpha) => render(engine, alpha));
  const friction = 0.68;
  const startLocation = scrollSnaps[index.get()];
  const location = Vector1D(startLocation);
  const previousLocation = Vector1D(startLocation);
  const offsetLocation = Vector1D(startLocation);
  const target = Vector1D(startLocation);
  const scrollBody = ScrollBody(location, offsetLocation, previousLocation, target, duration, friction);
  const scrollTarget = ScrollTarget(loop, scrollSnaps, contentSize, limit, target);
  const scrollTo = ScrollTo(animation, index, indexPrevious, scrollBody, scrollTarget, target, eventHandler);
  const scrollProgress = ScrollProgress(limit);
  const eventStore = EventStore();
  const slidesInView = SlidesInView(container, slides, eventHandler, inViewThreshold);
  const {
    slideRegistry
  } = SlideRegistry(containSnaps, containScroll, scrollSnaps, scrollContainLimit, slidesToScroll, slideIndexes);
  const slideFocus = SlideFocus(root, slides, slideRegistry, scrollTo, scrollBody, eventStore, eventHandler, watchFocus);
  const engine = {
    ownerDocument,
    ownerWindow,
    eventHandler,
    containerRect,
    slideRects,
    animation,
    axis,
    dragHandler: DragHandler(axis, root, ownerDocument, ownerWindow, target, DragTracker(axis, ownerWindow), location, animation, scrollTo, scrollBody, scrollTarget, index, eventHandler, percentOfView, dragFree, dragThreshold, skipSnaps, friction, watchDrag),
    eventStore,
    percentOfView,
    index,
    indexPrevious,
    limit,
    location,
    offsetLocation,
    previousLocation,
    options,
    resizeHandler: ResizeHandler(container, eventHandler, ownerWindow, slides, axis, watchResize, nodeRects),
    scrollBody,
    scrollBounds: ScrollBounds(limit, offsetLocation, target, scrollBody, percentOfView),
    scrollLooper: ScrollLooper(contentSize, limit, offsetLocation, [location, offsetLocation, previousLocation, target]),
    scrollProgress,
    scrollSnapList: scrollSnaps.map(scrollProgress.get),
    scrollSnaps,
    scrollTarget,
    scrollTo,
    slideLooper: SlideLooper(axis, viewSize, contentSize, slideSizes, slideSizesWithGaps, snaps, scrollSnaps, offsetLocation, slides),
    slideFocus,
    slidesHandler: SlidesHandler(container, eventHandler, watchSlides),
    slidesInView,
    slideIndexes,
    slideRegistry,
    slidesToScroll,
    target,
    translate: Translate(axis, container)
  };
  return engine;
}
function EventHandler() {
  let listeners = {};
  let api;
  function init(emblaApi) {
    api = emblaApi;
  }
  function getListeners(evt) {
    return listeners[evt] || [];
  }
  function emit(evt) {
    getListeners(evt).forEach((e) => e(api, evt));
    return self;
  }
  function on(evt, cb) {
    listeners[evt] = getListeners(evt).concat([cb]);
    return self;
  }
  function off(evt, cb) {
    listeners[evt] = getListeners(evt).filter((e) => e !== cb);
    return self;
  }
  function clear() {
    listeners = {};
  }
  const self = {
    init,
    emit,
    off,
    on,
    clear
  };
  return self;
}
const defaultOptions = {
  align: "center",
  axis: "x",
  container: null,
  slides: null,
  containScroll: "trimSnaps",
  direction: "ltr",
  slidesToScroll: 1,
  inViewThreshold: 0,
  breakpoints: {},
  dragFree: false,
  dragThreshold: 10,
  loop: false,
  skipSnaps: false,
  duration: 25,
  startIndex: 0,
  active: true,
  watchDrag: true,
  watchResize: true,
  watchSlides: true,
  watchFocus: true
};
function OptionsHandler(ownerWindow) {
  function mergeOptions(optionsA, optionsB) {
    return objectsMergeDeep(optionsA, optionsB || {});
  }
  function optionsAtMedia(options) {
    const optionsAtMedia2 = options.breakpoints || {};
    const matchedMediaOptions = objectKeys(optionsAtMedia2).filter((media) => ownerWindow.matchMedia(media).matches).map((media) => optionsAtMedia2[media]).reduce((a, mediaOption) => mergeOptions(a, mediaOption), {});
    return mergeOptions(options, matchedMediaOptions);
  }
  function optionsMediaQueries(optionsList) {
    return optionsList.map((options) => objectKeys(options.breakpoints || {})).reduce((acc, mediaQueries) => acc.concat(mediaQueries), []).map(ownerWindow.matchMedia);
  }
  const self = {
    mergeOptions,
    optionsAtMedia,
    optionsMediaQueries
  };
  return self;
}
function PluginsHandler(optionsHandler) {
  let activePlugins = [];
  function init(emblaApi, plugins) {
    activePlugins = plugins.filter(({
      options
    }) => optionsHandler.optionsAtMedia(options).active !== false);
    activePlugins.forEach((plugin) => plugin.init(emblaApi, optionsHandler));
    return plugins.reduce((map, plugin) => Object.assign(map, {
      [plugin.name]: plugin
    }), {});
  }
  function destroy() {
    activePlugins = activePlugins.filter((plugin) => plugin.destroy());
  }
  const self = {
    init,
    destroy
  };
  return self;
}
function EmblaCarousel(root, userOptions, userPlugins) {
  const ownerDocument = root.ownerDocument;
  const ownerWindow = ownerDocument.defaultView;
  const optionsHandler = OptionsHandler(ownerWindow);
  const pluginsHandler = PluginsHandler(optionsHandler);
  const mediaHandlers = EventStore();
  const eventHandler = EventHandler();
  const {
    mergeOptions,
    optionsAtMedia,
    optionsMediaQueries
  } = optionsHandler;
  const {
    on,
    off,
    emit
  } = eventHandler;
  const reInit = reActivate;
  let destroyed = false;
  let engine;
  let optionsBase = mergeOptions(defaultOptions, EmblaCarousel.globalOptions);
  let options = mergeOptions(optionsBase);
  let pluginList = [];
  let pluginApis;
  let container;
  let slides;
  function storeElements() {
    const {
      container: userContainer,
      slides: userSlides
    } = options;
    const customContainer = isString(userContainer) ? root.querySelector(userContainer) : userContainer;
    container = customContainer || root.children[0];
    const customSlides = isString(userSlides) ? container.querySelectorAll(userSlides) : userSlides;
    slides = [].slice.call(customSlides || container.children);
  }
  function createEngine(options2) {
    const engine2 = Engine(root, container, slides, ownerDocument, ownerWindow, options2, eventHandler);
    if (options2.loop && !engine2.slideLooper.canLoop()) {
      const optionsWithoutLoop = Object.assign({}, options2, {
        loop: false
      });
      return createEngine(optionsWithoutLoop);
    }
    return engine2;
  }
  function activate(withOptions, withPlugins) {
    if (destroyed) return;
    optionsBase = mergeOptions(optionsBase, withOptions);
    options = optionsAtMedia(optionsBase);
    pluginList = withPlugins || pluginList;
    storeElements();
    engine = createEngine(options);
    optionsMediaQueries([optionsBase, ...pluginList.map(({
      options: options2
    }) => options2)]).forEach((query) => mediaHandlers.add(query, "change", reActivate));
    if (!options.active) return;
    engine.translate.to(engine.location.get());
    engine.animation.init();
    engine.slidesInView.init();
    engine.slideFocus.init(self);
    engine.eventHandler.init(self);
    engine.resizeHandler.init(self);
    engine.slidesHandler.init(self);
    if (engine.options.loop) engine.slideLooper.loop();
    if (container.offsetParent && slides.length) engine.dragHandler.init(self);
    pluginApis = pluginsHandler.init(self, pluginList);
  }
  function reActivate(withOptions, withPlugins) {
    const startIndex = selectedScrollSnap();
    deActivate();
    activate(mergeOptions({
      startIndex
    }, withOptions), withPlugins);
    eventHandler.emit("reInit");
  }
  function deActivate() {
    engine.dragHandler.destroy();
    engine.eventStore.clear();
    engine.translate.clear();
    engine.slideLooper.clear();
    engine.resizeHandler.destroy();
    engine.slidesHandler.destroy();
    engine.slidesInView.destroy();
    engine.animation.destroy();
    pluginsHandler.destroy();
    mediaHandlers.clear();
  }
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    mediaHandlers.clear();
    deActivate();
    eventHandler.emit("destroy");
    eventHandler.clear();
  }
  function scrollTo(index, jump, direction) {
    if (!options.active || destroyed) return;
    engine.scrollBody.useBaseFriction().useDuration(jump === true ? 0 : options.duration);
    engine.scrollTo.index(index, direction || 0);
  }
  function scrollNext(jump) {
    const next = engine.index.add(1).get();
    scrollTo(next, jump, -1);
  }
  function scrollPrev(jump) {
    const prev = engine.index.add(-1).get();
    scrollTo(prev, jump, 1);
  }
  function canScrollNext() {
    const next = engine.index.add(1).get();
    return next !== selectedScrollSnap();
  }
  function canScrollPrev() {
    const prev = engine.index.add(-1).get();
    return prev !== selectedScrollSnap();
  }
  function scrollSnapList() {
    return engine.scrollSnapList;
  }
  function scrollProgress() {
    return engine.scrollProgress.get(engine.offsetLocation.get());
  }
  function selectedScrollSnap() {
    return engine.index.get();
  }
  function previousScrollSnap() {
    return engine.indexPrevious.get();
  }
  function slidesInView() {
    return engine.slidesInView.get();
  }
  function slidesNotInView() {
    return engine.slidesInView.get(false);
  }
  function plugins() {
    return pluginApis;
  }
  function internalEngine() {
    return engine;
  }
  function rootNode() {
    return root;
  }
  function containerNode() {
    return container;
  }
  function slideNodes() {
    return slides;
  }
  const self = {
    canScrollNext,
    canScrollPrev,
    containerNode,
    internalEngine,
    destroy,
    off,
    on,
    emit,
    plugins,
    previousScrollSnap,
    reInit,
    rootNode,
    scrollNext,
    scrollPrev,
    scrollProgress,
    scrollSnapList,
    scrollTo,
    selectedScrollSnap,
    slideNodes,
    slidesInView,
    slidesNotInView
  };
  activate(userOptions, userPlugins);
  setTimeout(() => eventHandler.emit("init"), 0);
  return self;
}
EmblaCarousel.globalOptions = void 0;
function useEmblaCarousel(options = {}, plugins = []) {
  const storedOptions = reactExports.useRef(options);
  const storedPlugins = reactExports.useRef(plugins);
  const [emblaApi, setEmblaApi] = reactExports.useState();
  const [viewport, setViewport] = reactExports.useState();
  const reInit = reactExports.useCallback(() => {
    if (emblaApi) emblaApi.reInit(storedOptions.current, storedPlugins.current);
  }, [emblaApi]);
  reactExports.useEffect(() => {
    if (areOptionsEqual(storedOptions.current, options)) return;
    storedOptions.current = options;
    reInit();
  }, [options, reInit]);
  reactExports.useEffect(() => {
    if (arePluginsEqual(storedPlugins.current, plugins)) return;
    storedPlugins.current = plugins;
    reInit();
  }, [plugins, reInit]);
  reactExports.useEffect(() => {
    if (canUseDOM() && viewport) {
      EmblaCarousel.globalOptions = useEmblaCarousel.globalOptions;
      const newEmblaApi = EmblaCarousel(viewport, storedOptions.current, storedPlugins.current);
      setEmblaApi(newEmblaApi);
      return () => newEmblaApi.destroy();
    } else {
      setEmblaApi(void 0);
    }
  }, [viewport, setEmblaApi]);
  return [setViewport, emblaApi];
}
useEmblaCarousel.globalOptions = void 0;
const CarouselContext = reactExports.createContext(null);
function useCarousel() {
  const context = reactExports.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}
const Carousel = reactExports.forwardRef(
  ({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y"
      },
      plugins
    );
    const [canScrollPrev, setCanScrollPrev] = reactExports.useState(false);
    const [canScrollNext, setCanScrollNext] = reactExports.useState(false);
    const onSelect = reactExports.useCallback((api2) => {
      if (!api2) {
        return;
      }
      setCanScrollPrev(api2.canScrollPrev());
      setCanScrollNext(api2.canScrollNext());
    }, []);
    const scrollPrev = reactExports.useCallback(() => {
      api == null ? void 0 : api.scrollPrev();
    }, [api]);
    const scrollNext = reactExports.useCallback(() => {
      api == null ? void 0 : api.scrollNext();
    }, [api]);
    const handleKeyDown = reactExports.useCallback(
      (event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext]
    );
    reactExports.useEffect(() => {
      if (!api || !setApi) {
        return;
      }
      setApi(api);
    }, [api, setApi]);
    reactExports.useEffect(() => {
      if (!api) {
        return;
      }
      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);
      return () => {
        api == null ? void 0 : api.off("select", onSelect);
      };
    }, [api, onSelect]);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CarouselContext.Provider,
      {
        value: {
          carouselRef,
          api,
          opts,
          orientation: orientation || ((opts == null ? void 0 : opts.axis) === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            ref,
            onKeyDownCapture: handleKeyDown,
            className: cn("relative", className),
            role: "region",
            "aria-roledescription": "carousel",
            ...props,
            children
          }
        )
      }
    );
  }
);
Carousel.displayName = "Carousel";
const CarouselContent = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: carouselRef, className: "overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        className: cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className),
        ...props
      }
    ) });
  }
);
CarouselContent.displayName = "CarouselContent";
const CarouselItem = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        ref,
        role: "group",
        "aria-roledescription": "slide",
        className: cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className),
        ...props
      }
    );
  }
);
CarouselItem.displayName = "CarouselItem";
const CarouselPrevious = reactExports.forwardRef(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        ref,
        variant,
        size,
        className: cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal" ? "-left-12 top-1/2 -translate-y-1/2" : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className
        ),
        disabled: !canScrollPrev,
        onClick: scrollPrev,
        ...props,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Previous slide" })
        ]
      }
    );
  }
);
CarouselPrevious.displayName = "CarouselPrevious";
const CarouselNext = reactExports.forwardRef(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        ref,
        variant,
        size,
        className: cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal" ? "-right-12 top-1/2 -translate-y-1/2" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className
        ),
        disabled: !canScrollNext,
        onClick: scrollNext,
        ...props,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Next slide" })
        ]
      }
    );
  }
);
CarouselNext.displayName = "CarouselNext";
const Gallery4 = ({
  title = "Case Studies",
  description = "Discover how leading companies and developers are leveraging modern web technologies.",
  items
}) => {
  const [carouselApi, setCarouselApi] = reactExports.useState();
  const [canScrollPrev, setCanScrollPrev] = reactExports.useState(false);
  const [canScrollNext, setCanScrollNext] = reactExports.useState(false);
  const [currentSlide, setCurrentSlide] = reactExports.useState(0);
  const [showSwipeHint, setShowSwipeHint] = reactExports.useState(true);
  reactExports.useEffect(() => {
    if (!carouselApi) return;
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
      if (carouselApi.selectedScrollSnap() > 0) setShowSwipeHint(false);
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    const timer = setTimeout(() => setShowSwipeHint(false), 4e3);
    return () => {
      carouselApi.off("select", updateSelection);
      clearTimeout(timer);
    };
  }, [carouselApi]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "py-24 md:py-32", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "container mx-auto px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.6, ease: "easeOut" },
        className: "mb-8 flex flex-col md:flex-row items-start md:items-end justify-between md:mb-14 lg:mb-16 gap-4",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-bold md:text-4xl lg:text-5xl text-foreground", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "max-w-lg text-muted-foreground font-sans", children: description })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden shrink-0 gap-2 md:flex", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => carouselApi == null ? void 0 : carouselApi.scrollPrev(),
                disabled: !canScrollPrev,
                className: "disabled:pointer-events-auto",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                onClick: () => carouselApi == null ? void 0 : carouselApi.scrollNext(),
                disabled: !canScrollNext,
                className: "disabled:pointer-events-auto",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-5" })
              }
            )
          ] })
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.7, delay: 0.15, ease: "easeOut" },
        className: "w-full",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Carousel,
            {
              setApi: setCarouselApi,
              opts: {
                breakpoints: {
                  "(max-width: 768px)": {
                    dragFree: true
                  }
                }
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CarouselContent, { className: "ml-4 md:ml-[max(4rem,calc(50vw-600px))] mr-4 md:mr-[max(0rem,calc(50vw-600px))]", children: items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                CarouselItem,
                {
                  className: "max-w-[300px] pl-[20px] lg:max-w-[360px]",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: item.href, className: "group rounded-xl block", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative h-full min-h-[27rem] max-w-full overflow-hidden rounded-xl md:aspect-[5/4] lg:aspect-[16/9]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: item.image,
                        alt: item.title,
                        className: "absolute h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105",
                        loading: "lazy"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 h-full bg-[linear-gradient(to_top,hsl(var(--primary)/0.95)_0%,hsl(var(--primary)/0.85)_15%,hsl(var(--primary)/0.6)_30%,hsl(var(--primary)/0.2)_45%,transparent_60%)]" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 bottom-0 flex flex-col items-start p-6 text-primary-foreground md:p-8", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 pt-4 text-xl font-display font-semibold md:mb-3 md:pt-4 lg:pt-4", children: item.title }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 line-clamp-2 font-sans text-sm md:mb-12 lg:mb-9", children: item.description }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm font-sans", children: [
                        "Learn more",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 size-5 transition-transform group-hover:translate-x-1" })
                      ] })
                    ] }),
                    index === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showSwipeHint && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                        className: "absolute inset-0 flex items-center justify-end pointer-events-none md:hidden",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          motion.div,
                          {
                            animate: { x: [0, -16, 0] },
                            transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
                            className: "mr-3 flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm px-3 py-1.5 shadow-lg",
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-3.5 text-foreground/70" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-foreground/70", children: "Swipe" })
                            ]
                          }
                        )
                      }
                    ) })
                  ] }) })
                },
                item.id
              )) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 flex justify-center gap-2", children: items.map((_, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: `h-2 w-2 rounded-full transition-colors ${currentSlide === index ? "bg-primary" : "bg-primary/20"}`,
              onClick: () => carouselApi == null ? void 0 : carouselApi.scrollTo(index),
              "aria-label": `Go to slide ${index + 1}`
            },
            index
          )) })
        ]
      }
    )
  ] });
};
const transparencyBg = "/assets/transparency-B8C3yBrH.png";
const featureStyleDna = "/assets/feature-style-dna-D49Ef_HL.jpg";
const featureClosetScanner = "/assets/feature-closet-scanner-DSdzcdPx.jpg";
const featureOutfitGen = "/assets/feature-outfit-gen-DdFHi2ea.jpg";
const featureAiChat = "/assets/feature-ai-chat-BGUSqXHi.jpg";
const featureShopping = "/assets/feature-shopping-CesaJvf8.jpg";
const featureAnalytics = "/assets/feature-analytics-DgZvKf6X.jpg";
const howItWorksItems = [
  {
    id: "scan-closet",
    title: "Photograph Your Closet",
    description: "Snap photos. AI tags every piece in under two minutes.",
    href: "#features",
    image: featureClosetScanner
  },
  {
    id: "style-dna",
    title: "Let the AI Learn You",
    description: "Body shape, color season, lifestyle — mapped in one session.",
    href: "#features",
    image: featureStyleDna
  },
  {
    id: "daily-outfits",
    title: "Wake Up to Your Outfit",
    description: "A complete look every morning, weather-checked.",
    href: "#features",
    image: featureOutfitGen
  },
  {
    id: "ai-stylist",
    title: "Ask Anything",
    description: '"What do I wear tonight?" — answered in seconds.',
    href: "#features",
    image: featureAiChat
  },
  {
    id: "smart-shopping",
    title: "Buy Only What You Need",
    description: "AI finds wardrobe gaps. Every pick fills one.",
    href: "#features",
    image: featureShopping
  },
  {
    id: "track-progress",
    title: "Watch Your Confidence Grow",
    description: "Style scores, cost-per-wear, and earned badges.",
    href: "#features",
    image: featureAnalytics
  }
];
const HowItWorks = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "how-it-works", className: "relative overflow-hidden", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: transparencyBg, alt: "", "aria-hidden": true, className: "absolute inset-0 w-full h-full object-cover opacity-[0.03] pointer-events-none select-none z-0" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    Gallery4,
    {
      title: "Three Steps. That's It.",
      description: "Scan your closet. Let AI learn you. Wake up to your outfit.",
      items: howItWorksItems
    }
  )
] });
const DEVICE_SPECS = {
  x: { w: 375, h: 812, radius: 50, bezel: 12, topSafe: 47, bottomSafe: 34, notch: { w: 210, h: 35, r: 18 } },
  "14": { w: 390, h: 844, radius: 56, bezel: 12, topSafe: 47, bottomSafe: 34, notch: { w: 225, h: 33, r: 18 } },
  "14-pro": { w: 393, h: 852, radius: 56, bezel: 12, topSafe: 59, bottomSafe: 34, island: { w: 126, h: 37, r: 20 } },
  "15": { w: 393, h: 852, radius: 56, bezel: 12, topSafe: 59, bottomSafe: 34, island: { w: 126, h: 37, r: 20 } },
  "15-pro": { w: 393, h: 852, radius: 56, bezel: 12, topSafe: 59, bottomSafe: 34, island: { w: 126, h: 37, r: 20 } },
  plain: { w: 390, h: 844, radius: 56, bezel: 12, topSafe: 16, bottomSafe: 16 }
};
const PRESET_COLORS = {
  black: "#0b0b0d",
  midnight: "#0b0c10",
  silver: "#d7d8dc",
  starlight: "#f1eee9",
  "space-black": "#1c1e22",
  gold: "#f2dfb3",
  blue: "#2b4fa8",
  pink: "#ffbfd1",
  titanium: "#837a72",
  "natural-titanium": "#a69a8a",
  green: "#2b622e",
  red: "#c81f2f"
};
function shade(hex, pct) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex.trim());
  if (!m) return hex;
  const [r, g, b] = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
  const k = (100 + pct) / 100;
  const to = (v) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `#${to(r).toString(16).padStart(2, "0")}${to(g).toString(16).padStart(2, "0")}${to(b).toString(16).padStart(2, "0")}`;
}
const IPhoneMockup = ({
  model = "14-pro",
  color = "space-black",
  orientation = "portrait",
  scale = 1,
  bezel,
  radius,
  shadow = true,
  screenBg = "#000",
  wallpaper,
  wallpaperFit = "cover",
  wallpaperPosition = "center",
  showDynamicIsland,
  showNotch,
  islandWidth,
  islandHeight,
  islandRadius,
  notchWidth,
  notchHeight,
  notchRadius,
  safeArea = false,
  safeAreaOverrides,
  showHomeIndicator = true,
  innerShadow = true,
  style,
  className,
  frameStyle,
  screenStyle,
  children
}) => {
  var _a, _b, _c, _d, _e, _f;
  const spec = DEVICE_SPECS[model];
  const isLandscape = orientation === "landscape";
  const screenWidth = isLandscape ? spec.h : spec.w;
  const screenHeight = isLandscape ? spec.w : spec.h;
  const resolvedRadius = radius ?? spec.radius;
  const resolvedBezel = bezel ?? spec.bezel;
  const outerWidth = screenWidth + resolvedBezel * 2;
  const outerHeight = screenHeight + resolvedBezel * 2;
  const outerRadius = resolvedRadius + resolvedBezel;
  const colorHex = PRESET_COLORS[color] ?? color;
  const frameGradient = `linear-gradient(145deg, ${shade(colorHex, 18)} 0%, ${shade(colorHex, 6)} 20%, ${colorHex} 45%, ${shade(colorHex, -10)} 70%, ${shade(colorHex, -20)} 100%)`;
  const useIsland = typeof showDynamicIsland === "boolean" ? showDynamicIsland : Boolean(spec.island);
  const useNotch = typeof showNotch === "boolean" ? showNotch : Boolean(spec.notch) && !useIsland;
  const finalIslandW = islandWidth ?? ((_a = spec.island) == null ? void 0 : _a.w) ?? 0;
  const finalIslandH = islandHeight ?? ((_b = spec.island) == null ? void 0 : _b.h) ?? 0;
  const finalIslandR = islandRadius ?? ((_c = spec.island) == null ? void 0 : _c.r) ?? 0;
  const finalNotchW = notchWidth ?? ((_d = spec.notch) == null ? void 0 : _d.w) ?? 0;
  const finalNotchH = notchHeight ?? ((_e = spec.notch) == null ? void 0 : _e.h) ?? 0;
  const finalNotchR = notchRadius ?? ((_f = spec.notch) == null ? void 0 : _f.r) ?? 0;
  const insets = {
    top: (safeAreaOverrides == null ? void 0 : safeAreaOverrides.top) ?? spec.topSafe,
    bottom: (safeAreaOverrides == null ? void 0 : safeAreaOverrides.bottom) ?? spec.bottomSafe,
    left: (safeAreaOverrides == null ? void 0 : safeAreaOverrides.left) ?? 0,
    right: (safeAreaOverrides == null ? void 0 : safeAreaOverrides.right) ?? 0
  };
  const outerShadow = typeof shadow === "string" ? shadow : shadow ? "0 0 0 1px rgba(255,255,255,0.08), 0 0 20px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.5), 0 20px 60px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)" : "none";
  const innerShadowCss = innerShadow ? "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 10px 20px rgba(0,0,0,0.35), inset 0 -8px 16px rgba(0,0,0,0.28)" : "none";
  const cutoutCommon = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#000",
    zIndex: 2,
    boxShadow: "0 1px 2px rgba(0,0,0,0.7)"
  };
  const contentStyle = safeArea ? { position: "absolute", top: insets.top, right: insets.right, bottom: insets.bottom, left: insets.left, overflow: "hidden", zIndex: 1, display: "flex", flexDirection: "column" } : { position: "absolute", inset: 0, overflow: "hidden", zIndex: 1, display: "flex", flexDirection: "column" };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, style: { display: "inline-block", transform: `scale(${scale})`, transformOrigin: "top center", ...style }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { width: outerWidth, height: outerHeight, borderRadius: outerRadius, background: frameGradient, padding: resolvedBezel, boxSizing: "border-box", boxShadow: outerShadow, position: "relative", overflow: "hidden", ...frameStyle }, "aria-label": `iPhone mockup (${model})`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { position: "absolute", inset: 0, borderRadius: outerRadius, border: "1px solid rgba(255,255,255,0.08)", pointerEvents: "none", zIndex: 4 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { position: "absolute", top: 0, left: 0, right: 0, height: "50%", borderRadius: `${outerRadius}px ${outerRadius}px 0 0`, background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)", pointerEvents: "none", zIndex: 4 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { position: "absolute", left: -2, top: 160, width: 3, height: 32, borderRadius: "2px 0 0 2px", background: `linear-gradient(180deg, ${shade(colorHex, 10)}, ${shade(colorHex, -8)})`, zIndex: 5 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { position: "absolute", left: -2, top: 210, width: 3, height: 52, borderRadius: "2px 0 0 2px", background: `linear-gradient(180deg, ${shade(colorHex, 10)}, ${shade(colorHex, -8)})`, zIndex: 5 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { position: "absolute", left: -2, top: 275, width: 3, height: 52, borderRadius: "2px 0 0 2px", background: `linear-gradient(180deg, ${shade(colorHex, 10)}, ${shade(colorHex, -8)})`, zIndex: 5 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { position: "absolute", right: -2, top: 220, width: 3, height: 72, borderRadius: "0 2px 2px 0", background: `linear-gradient(180deg, ${shade(colorHex, 10)}, ${shade(colorHex, -8)})`, zIndex: 5 } }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { width: "100%", height: "100%", borderRadius: resolvedRadius, position: "relative", overflow: "hidden", background: screenBg, boxShadow: innerShadowCss, ...screenStyle }, children: [
      wallpaper && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { position: "absolute", inset: 0, backgroundImage: `url(${wallpaper})`, backgroundSize: wallpaperFit, backgroundPosition: wallpaperPosition, backgroundRepeat: "no-repeat", zIndex: 0 } }),
      useIsland && finalIslandW > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { ...cutoutCommon, top: 12, width: finalIslandW, height: finalIslandH, borderRadius: finalIslandR } }),
      !useIsland && useNotch && finalNotchW > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { ...cutoutCommon, top: 8, width: finalNotchW, height: finalNotchH, borderRadius: finalNotchR } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: contentStyle, children }),
      showHomeIndicator && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, style: { position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: Math.round(screenWidth * 0.34), maxWidth: 140, height: 5, borderRadius: 3, background: "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.35))", opacity: 0.9, zIndex: 3, pointerEvents: "none" } })
    ] })
  ] }) });
};
const featureDemo = "/assets/feature-demo-CWLNLVRw.mp4";
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = reactExports.useState(void 0);
  reactExports.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const shimmerParticles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 15 + Math.random() * 70,
  y: 20 + Math.random() * 60,
  size: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 3
}));
const featureNames = [
  "AI Outfit Analysis",
  "Virtual Try-On",
  "Trend Forecasting",
  "Wardrobe Management",
  "Style DNA Mapping",
  "Color Analysis"
];
const Features = () => {
  const sectionRef = reactExports.useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const isMobile = useIsMobile();
  const [activeFeature, setActiveFeature] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % featureNames.length);
    }, 2400);
    return () => clearInterval(interval);
  }, []);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  const mockupY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const glowOpacity = useTransform(scrollYProgress, [0.2, 0.5, 0.8], [0.2, 0.6, 0.3]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "features", className: "pt-16 md:pt-24 pb-0 bg-muted/20 overflow-hidden", ref: sectionRef, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        className: "text-center mb-6",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-semibold text-primary tracking-widest uppercase mb-3", children: "Features" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-3xl md:text-5xl font-bold text-foreground", children: [
            "Every Fashion Tool You Need.",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "One App." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-2xl mx-auto text-sm text-muted-foreground leading-relaxed", children: "AI outfit analysis, trend forecasting, wardrobe management, and virtual try-on — all in one app." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-7 flex items-center justify-center overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.span,
            {
              initial: { opacity: 0, y: 14 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -14 },
              transition: { duration: 0.4, ease: "easeOut" },
              className: "font-sans text-sm font-medium tracking-wider uppercase text-primary/80",
              children: featureNames[activeFeature]
            },
            activeFeature
          ) }) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.9 },
        animate: isInView ? { opacity: 1, scale: 1 } : {},
        transition: { duration: 0.8, ease: "easeOut", delay: 0.2 },
        style: { y: mockupY },
        className: "flex justify-center relative mb-[-340px] md:mb-[-140px]",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, scale: 0.7 },
              animate: isInView ? {
                opacity: [0, 0.25, 0.08, 0.25, 0],
                scale: [0.7, 1.05, 1.1, 1.05, 0.7]
              } : {},
              transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 pointer-events-none",
              style: { width: isMobile ? 200 : 320, height: isMobile ? 200 : 320 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, scale: 0.6 },
              animate: isInView ? {
                opacity: [0, 0.15, 0.05, 0.15, 0],
                scale: [0.6, 1.15, 1.2, 1.15, 0.6]
              } : {},
              transition: { duration: 6, delay: 1.5, repeat: Infinity, ease: "easeInOut" },
              className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 pointer-events-none",
              style: { width: isMobile ? 260 : 400, height: isMobile ? 260 : 400 }
            }
          ),
          isInView && shimmerParticles.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.span,
            {
              initial: { opacity: 0, y: 0 },
              animate: {
                opacity: [0, 0.7, 0],
                y: [0, -20 - Math.random() * 30, -50],
                x: [0, (Math.random() - 0.5) * 24]
              },
              transition: {
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut"
              },
              className: "absolute rounded-full bg-primary pointer-events-none",
              style: {
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                filter: `blur(${p.size > 3.5 ? 1 : 0}px)`
              }
            },
            p.id
          )),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            IPhoneMockup,
            {
              model: "15-pro",
              color: "space-black",
              scale: isMobile ? 0.55 : 0.75,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "video",
                {
                  src: featureDemo,
                  autoPlay: true,
                  loop: true,
                  muted: true,
                  playsInline: true,
                  style: { width: "100%", height: "100%", objectFit: "cover" }
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              style: { opacity: glowOpacity },
              className: "absolute -bottom-4 left-1/2 -translate-x-1/2 w-1/2 h-12 rounded-full bg-primary/15 blur-2xl pointer-events-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/60 to-transparent pointer-events-none z-10" })
        ]
      }
    )
  ] }) });
};
const ContainerScroll = ({
  titleComponent,
  children
}) => {
  const containerRef = reactExports.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef
  });
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);
  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20",
      ref: containerRef,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "py-10 md:py-40 w-full relative",
          style: {
            perspective: "1000px"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Header$1, { translate, titleComponent }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { rotate, translate, scale, children })
          ]
        }
      )
    }
  );
};
const Header$1 = ({
  translate,
  titleComponent
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      style: {
        translateY: translate
      },
      className: "div max-w-5xl mx-auto text-center",
      children: titleComponent
    }
  );
};
const Card = ({
  rotate,
  scale,
  children
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      style: {
        rotateX: rotate,
        scale,
        boxShadow: "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003"
      },
      className: "max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-border p-2 md:p-6 bg-card rounded-[30px] shadow-2xl",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full overflow-hidden rounded-2xl bg-muted md:rounded-2xl md:p-4", children })
    }
  );
};
const bullets = [
  "A complete outfit waiting when you wake up",
  "Weather and calendar already factored in",
  "Built entirely from your own closet",
  "Learns what you like — gets smarter daily"
];
const TabbedFeatures = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "tabbed-features", className: "bg-background", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    ContainerScroll,
    {
      titleComponent: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs font-semibold text-primary tracking-widest uppercase", children: "Your Morning With LEXOR®" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl md:text-4xl font-bold text-foreground leading-tight", children: "Open the app. Your outfit is ready." })
      ] }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: featureOutfitGen,
            alt: "Three elegant outfits on mannequins styled by LEXOR AI",
            className: "mx-auto rounded-2xl object-cover h-full w-full object-center",
            draggable: false
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background/70 via-background/30 to-transparent rounded-b-2xl pointer-events-none" })
      ] })
    }
  ),
  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto px-4 -mt-20 md:-mt-32 pb-16 md:pb-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: bullets.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-3 font-sans text-sm text-muted-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 mt-0.5 text-primary shrink-0" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: b })
  ] }, b)) }) })
] });
const AnimatedGradientBackground = ({
  startingGap = 125,
  Breathing = false,
  gradientColors = [
    "#0A0A0A",
    "#2979FF",
    "#FF80AB",
    "#FF6D00",
    "#FFD600",
    "#00E676",
    "#3D5AFE"
  ],
  gradientStops = [35, 50, 60, 70, 80, 90, 100],
  animationSpeed = 0.02,
  breathingRange = 5,
  containerStyle = {},
  topOffset = 0,
  containerClassName = ""
}) => {
  if (gradientColors.length !== gradientStops.length) {
    throw new Error(
      `GradientColors and GradientStops must have the same length.`
    );
  }
  const containerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    let animationFrame;
    let width = startingGap;
    let directionWidth = 1;
    const animateGradient = () => {
      if (width >= startingGap + breathingRange) directionWidth = -1;
      if (width <= startingGap - breathingRange) directionWidth = 1;
      if (!Breathing) directionWidth = 0;
      width += directionWidth * animationSpeed;
      const gradientStopsString = gradientStops.map((stop, index) => `${gradientColors[index]} ${stop}%`).join(", ");
      const gradient = `radial-gradient(${width}% ${width + topOffset}% at 50% 20%, ${gradientStopsString})`;
      if (containerRef.current) {
        containerRef.current.style.background = gradient;
      }
      animationFrame = requestAnimationFrame(animateGradient);
    };
    animationFrame = requestAnimationFrame(animateGradient);
    return () => cancelAnimationFrame(animationFrame);
  }, [startingGap, Breathing, gradientColors, gradientStops, animationSpeed, breathingRange, topOffset]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, scale: 1.5 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 2, ease: [0.25, 0.1, 0.25, 1] }
      },
      className: `absolute inset-0 overflow-hidden ${containerClassName}`,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          ref: containerRef,
          style: containerStyle,
          className: "absolute inset-0 transition-transform"
        }
      )
    },
    "animated-gradient-background"
  );
};
function TestimonialCard({ handleShuffle, testimonial, position, id, author, image }) {
  const dragRef = reactExports.useRef(0);
  const isFront = position === "front";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      style: {
        zIndex: position === "front" ? "2" : position === "middle" ? "1" : "0"
      },
      animate: {
        rotate: position === "front" ? "-6deg" : position === "middle" ? "0deg" : "6deg",
        x: position === "front" ? "0%" : position === "middle" ? "33%" : "66%"
      },
      drag: true,
      dragElastic: 0.35,
      dragListener: isFront,
      dragConstraints: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      },
      onDragStart: (e, info) => {
        dragRef.current = info.point.x;
      },
      onDragEnd: (e, info) => {
        if (dragRef.current - info.point.x > 100 || info.offset.x < -100) {
          handleShuffle();
        }
        dragRef.current = 0;
      },
      transition: { duration: 0.35 },
      className: `absolute left-0 top-0 grid h-[380px] w-[260px] md:h-[520px] md:w-[350px] select-none grid-rows-[1fr_auto] rounded-2xl border-2 border-border/40 bg-card/20 shadow-xl backdrop-blur-md overflow-hidden ${isFront ? "cursor-grab active:cursor-grabbing" : ""}`,
      children: [
        image ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: image,
              alt: `Revenue proof from ${author}`,
              className: "pointer-events-none w-full h-full object-cover object-top"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/95 via-background/40 to-transparent" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: `https://i.pravatar.cc/128?img=${id}`,
            alt: `Avatar of ${author}`,
            className: "pointer-events-none h-32 w-32 rounded-full border-2 border-border/40 bg-muted object-cover"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "block text-sm leading-relaxed text-muted-foreground", children: [
            '"',
            testimonial,
            '"'
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-sm font-semibold text-primary", children: author })
        ] })
      ]
    }
  );
}
const statsMain = "/assets/stats-main-B5TTQAqs.png";
const sales10k = "/assets/sales-10k-BGrluNiL.png";
const grossSales390k = "/assets/gross-sales-390k-BrAQ1w4i.jpg";
const sales105k = "/assets/sales-105k-CN6LIkx8.png";
const stripePayout = "/assets/stripe-payout-BjO9urCG.jpg";
const sales81k = "/assets/sales-81k-D616Nld9.jpeg";
const sales673k = "/assets/sales-673k-C4vOAFL-.jpg";
const shuffleScreenshots = [
  { id: 1, image: sales673k, testimonial: "$673,912 total sales — 56% growth in 90 days.", author: "Shopify Dashboard" },
  { id: 2, image: sales105k, testimonial: "$105,525 revenue — 1,300% increase, 3.35K orders.", author: "Shopify Analytics" },
  { id: 3, image: grossSales390k, testimonial: "€390,033 gross sales, 11,880 orders, 391K sessions.", author: "Store Overview" },
  { id: 4, image: sales81k, testimonial: "$81,452 across 1.01K orders over 5 months.", author: "Sales Report" },
  { id: 5, image: sales10k, testimonial: "$10,349 early-stage — 330 orders, 1.88% conversion.", author: "Early Growth" },
  { id: 6, image: stripePayout, testimonial: "€48,579.84 Stripe payout confirmed.", author: "Stripe Payout" }
];
const ShuffleSection = () => {
  const [positions, setPositions] = reactExports.useState(["front", "middle", "back"]);
  const [startIdx, setStartIdx] = reactExports.useState(0);
  const handleShuffle = () => {
    setPositions((prev) => {
      const n = [...prev];
      n.unshift(n.pop());
      return n;
    });
    setStartIdx((prev) => (prev + 1) % shuffleScreenshots.length);
  };
  const visible = [0, 1, 2].map((offset) => shuffleScreenshots[(startIdx + offset) % shuffleScreenshots.length]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative -ml-[70px] h-[380px] w-[260px] md:-ml-[175px] md:h-[520px] md:w-[350px]", children: visible.map((s, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    TestimonialCard,
    {
      ...s,
      handleShuffle,
      position: positions[index]
    },
    s.id
  )) });
};
const Testimonials = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative py-20 md:py-32", id: "proof", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(
    AnimatedGradientBackground,
    {
      Breathing: true,
      animationSpeed: 0.015,
      breathingRange: 8,
      startingGap: 130,
      topOffset: 20,
      gradientColors: [
        "hsl(0 0% 4%)",
        "hsl(0 0% 8%)",
        "hsl(0 0% 10%)",
        "hsl(0 0% 8%)",
        "hsl(0 0% 6%)",
        "hsl(0 0% 5%)",
        "hsl(0 0% 4%)"
      ],
      gradientStops: [0, 30, 45, 55, 70, 85, 100],
      containerClassName: "rounded-none"
    }
  ),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 max-w-6xl mx-auto px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6 },
        className: "text-center mb-12",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-3xl md:text-5xl font-bold text-foreground", children: [
            "Real Results. ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gold-text", children: "Real Revenue." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground leading-relaxed", children: "Unedited dashboard screenshots. No inflated numbers. Actual data." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.6, delay: 0.15 },
        className: "mb-12",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass rounded-2xl overflow-hidden border border-border/30 hover:border-primary/20 transition-all duration-500", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: statsMain,
              alt: "LEXOR® revenue dashboard showing real earnings across multiple platforms",
              className: "w-full h-auto rounded-t-2xl",
              loading: "lazy"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 left-5 right-5 flex items-end justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-lg md:text-xl font-bold text-white", children: "Revenue Overview" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs text-white/60 mt-0.5", children: "Multi-platform earnings across all channels" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 bg-emerald-500/20 backdrop-blur-sm text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "w-3 h-3" }),
              "Live"
            ] })
          ] })
        ] }) })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid place-content-center overflow-hidden px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShuffleSection, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center mt-4 text-xs text-muted-foreground/60 font-sans", children: "Swipe left to see more →" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.p,
      {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        transition: { delay: 0.4 },
        className: "text-center mt-8 text-[11px] text-muted-foreground/50 font-sans",
        children: "All screenshots are unedited. Revenue figures from live dashboards."
      }
    )
  ] })
] });
const brutalistBg = "/assets/brutalist-lines-4z5Po5rm.png";
var COLLAPSIBLE_NAME = "Collapsible";
var [createCollapsibleContext, createCollapsibleScope] = createContextScope(COLLAPSIBLE_NAME);
var [CollapsibleProvider, useCollapsibleContext] = createCollapsibleContext(COLLAPSIBLE_NAME);
var Collapsible$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      __scopeCollapsible,
      open: openProp,
      defaultOpen,
      disabled,
      onOpenChange,
      ...collapsibleProps
    } = props;
    const [open, setOpen] = useControllableState({
      prop: openProp,
      defaultProp: defaultOpen ?? false,
      onChange: onOpenChange,
      caller: COLLAPSIBLE_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      CollapsibleProvider,
      {
        scope: __scopeCollapsible,
        disabled,
        contentId: useId(),
        open,
        onOpenToggle: reactExports.useCallback(() => setOpen((prevOpen) => !prevOpen), [setOpen]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            "data-state": getState$1(open),
            "data-disabled": disabled ? "" : void 0,
            ...collapsibleProps,
            ref: forwardedRef
          }
        )
      }
    );
  }
);
Collapsible$1.displayName = COLLAPSIBLE_NAME;
var TRIGGER_NAME$1 = "CollapsibleTrigger";
var CollapsibleTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeCollapsible, ...triggerProps } = props;
    const context = useCollapsibleContext(TRIGGER_NAME$1, __scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.button,
      {
        type: "button",
        "aria-controls": context.open ? context.contentId : void 0,
        "aria-expanded": context.open || false,
        "data-state": getState$1(context.open),
        "data-disabled": context.disabled ? "" : void 0,
        disabled: context.disabled,
        ...triggerProps,
        ref: forwardedRef,
        onClick: composeEventHandlers(props.onClick, context.onOpenToggle)
      }
    );
  }
);
CollapsibleTrigger$1.displayName = TRIGGER_NAME$1;
var CONTENT_NAME$1 = "CollapsibleContent";
var CollapsibleContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { forceMount, ...contentProps } = props;
    const context = useCollapsibleContext(CONTENT_NAME$1, props.__scopeCollapsible);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Presence, { present: forceMount || context.open, children: ({ present }) => /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContentImpl, { ...contentProps, ref: forwardedRef, present }) });
  }
);
CollapsibleContent$1.displayName = CONTENT_NAME$1;
var CollapsibleContentImpl = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeCollapsible, present, children, ...contentProps } = props;
  const context = useCollapsibleContext(CONTENT_NAME$1, __scopeCollapsible);
  const [isPresent, setIsPresent] = reactExports.useState(present);
  const ref = reactExports.useRef(null);
  const composedRefs = useComposedRefs(forwardedRef, ref);
  const heightRef = reactExports.useRef(0);
  const height = heightRef.current;
  const widthRef = reactExports.useRef(0);
  const width = widthRef.current;
  const isOpen = context.open || isPresent;
  const isMountAnimationPreventedRef = reactExports.useRef(isOpen);
  const originalStylesRef = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    const rAF = requestAnimationFrame(() => isMountAnimationPreventedRef.current = false);
    return () => cancelAnimationFrame(rAF);
  }, []);
  useLayoutEffect2(() => {
    const node = ref.current;
    if (node) {
      originalStylesRef.current = originalStylesRef.current || {
        transitionDuration: node.style.transitionDuration,
        animationName: node.style.animationName
      };
      node.style.transitionDuration = "0s";
      node.style.animationName = "none";
      const rect = node.getBoundingClientRect();
      heightRef.current = rect.height;
      widthRef.current = rect.width;
      if (!isMountAnimationPreventedRef.current) {
        node.style.transitionDuration = originalStylesRef.current.transitionDuration;
        node.style.animationName = originalStylesRef.current.animationName;
      }
      setIsPresent(present);
    }
  }, [context.open, present]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Primitive.div,
    {
      "data-state": getState$1(context.open),
      "data-disabled": context.disabled ? "" : void 0,
      id: context.contentId,
      hidden: !isOpen,
      ...contentProps,
      ref: composedRefs,
      style: {
        [`--radix-collapsible-content-height`]: height ? `${height}px` : void 0,
        [`--radix-collapsible-content-width`]: width ? `${width}px` : void 0,
        ...props.style
      },
      children: isOpen && children
    }
  );
});
function getState$1(open) {
  return open ? "open" : "closed";
}
var Root = Collapsible$1;
var Trigger = CollapsibleTrigger$1;
var Content = CollapsibleContent$1;
const Collapsible = Root;
const CollapsibleTrigger = CollapsibleTrigger$1;
const CollapsibleContent = CollapsibleContent$1;
const tiers = [
  {
    key: "free",
    label: "Free",
    price: "0",
    desc: "Explore the basics — no credit card needed",
    isFree: true,
    features: [
      "AI outfit suggestions — 3 per day",
      "Closet digitization — up to 15 items",
      "Basic Style DNA snapshot",
      { text: "Color analysis", included: false },
      { text: "Capsule wardrobes", included: false },
      { text: "Virtual try-on", included: false },
      { text: "Personal concierge", included: false }
    ],
    bg: "bg-muted/20",
    BG: BGComponent1
  },
  {
    key: "starter",
    label: "Starter",
    price: "9",
    desc: "The essentials to start dressing smarter",
    features: [
      "AI outfit suggestions — 10 per day",
      "Basic color analysis",
      "Closet digitization — up to 50 items",
      "Daily outfit of the day",
      { text: "Style DNA deep analysis", included: false },
      { text: "Weekly capsule wardrobes", included: false },
      { text: "Virtual try-on", included: false },
      { text: "Personal concierge", included: false }
    ],
    bg: "bg-muted/30",
    BG: BGComponent1
  },
  {
    key: "pro",
    label: "Pro",
    price: "29",
    desc: "Unlimited AI styling — no closet limits",
    features: [
      "Unlimited AI outfit suggestions",
      "Full color & style DNA analysis",
      "Unlimited closet items",
      "Weekly capsule wardrobes",
      "Priority AI stylist chat",
      "Outfit calendar & planning",
      { text: "Virtual try-on", included: false },
      { text: "Personal concierge", included: false }
    ],
    bg: "bg-foreground/5",
    BG: BGComponent2
  },
  {
    key: "elite",
    label: "Elite",
    price: "99",
    desc: "Your AI concierge handles everything",
    features: [
      "Everything in Pro, plus:",
      "Virtual try-on technology",
      "Personal style concierge",
      "Trend intelligence reports",
      "Shopping recommendations",
      "Wardrobe gap analysis",
      "Monthly style report",
      "Priority support"
    ],
    bg: "bg-foreground/10",
    BG: BGComponent3
  }
];
const comparisonCategories = [
  {
    name: "AI Styling",
    features: [
      { label: "AI outfit suggestions", free: "3/day", starter: "10/day", pro: "Unlimited", elite: "Unlimited" },
      { label: "Style DNA analysis", free: "Basic", starter: "Basic", pro: "Full", elite: "Full" },
      { label: "Color analysis", free: false, starter: true, pro: true, elite: true },
      { label: "AI stylist chat", free: false, starter: false, pro: "Priority", elite: "Priority" }
    ]
  },
  {
    name: "Wardrobe",
    features: [
      { label: "Closet items", free: "15", starter: "50", pro: "Unlimited", elite: "Unlimited" },
      { label: "Capsule wardrobes", free: false, starter: false, pro: true, elite: true },
      { label: "Outfit calendar", free: false, starter: false, pro: true, elite: true },
      { label: "Wardrobe gap analysis", free: false, starter: false, pro: false, elite: true }
    ]
  },
  {
    name: "Premium",
    features: [
      { label: "Virtual try-on", free: false, starter: false, pro: false, elite: true },
      { label: "Personal concierge", free: false, starter: false, pro: false, elite: true },
      { label: "Trend intelligence", free: false, starter: false, pro: false, elite: true },
      { label: "Shopping recommendations", free: false, starter: false, pro: false, elite: true },
      { label: "Monthly style report", free: false, starter: false, pro: false, elite: true }
    ]
  },
  {
    name: "Support",
    features: [
      { label: "Priority support", free: false, starter: false, pro: false, elite: true }
    ]
  }
];
const CellValue = ({ value }) => {
  if (value === true) return /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-foreground mx-auto" });
  if (value === false) return /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-4 h-4 text-muted-foreground/40 mx-auto" });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-sans text-foreground", children: value });
};
const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [compareOpen, setCompareOpen] = reactExports.useState(false);
  const grantAccess = reactExports.useCallback(() => {
    if (user) {
      queryClient.setQueryData(["subscription-check", user.id], true);
    }
  }, [user, queryClient]);
  const handlePayPalApprove = reactExports.useCallback(
    async (subscriptionId, tier) => {
      if (!user) {
        navigate("/auth");
        return;
      }
      try {
        const { error } = await supabase.from("subscriptions").insert({
          user_id: user.id,
          paypal_subscription_id: subscriptionId,
          plan_tier: tier,
          status: "active"
        });
        if (error) throw error;
        localStorage.setItem("luxor_paid", "true");
        grantAccess();
        toast.success("Welcome to Lexor! Your style journey begins now.");
        navigate("/dashboard");
      } catch {
        toast.error("Something went wrong saving your subscription.");
      }
    },
    [user, navigate, grantAccess]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "pricing", className: "relative py-20 md:py-32 bg-background overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: brutalistBg, alt: "", "aria-hidden": true, className: "absolute inset-0 w-full h-full object-cover opacity-[0.03] pointer-events-none select-none" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-6xl mx-auto px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          className: "text-center mb-16",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-semibold text-muted-foreground tracking-widest uppercase mb-3", children: "Pricing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl md:text-5xl font-bold text-foreground", children: "Pick Your Level" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-lg mx-auto font-sans text-sm text-muted-foreground", children: "Costs less than one bad outfit." })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 justify-center items-stretch", children: tiers.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 40 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.15 },
          transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
          className: t.isFree ? "relative" : "",
          children: [
            t.isFree && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-3 left-1/2 -translate-x-1/2 z-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 rounded-full text-[10px] font-sans font-bold uppercase tracking-widest border border-dashed border-foreground/20 bg-background text-muted-foreground", children: "FREE" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: t.isFree ? "border border-dashed border-foreground/15 rounded-2xl" : "", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              SquishyPricingCard,
              {
                label: t.label,
                monthlyPrice: t.price,
                description: t.desc,
                features: t.features,
                background: t.bg,
                popular: t.key === "pro",
                BGComponent: t.BG,
                footer: t.isFree ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => navigate("/auth"),
                    className: "w-full h-10 rounded-lg border border-foreground/20 text-foreground font-sans font-semibold text-sm hover:bg-foreground/5 transition-colors",
                    children: "Start Free"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  PayPalButton,
                  {
                    tier: t.key,
                    onApprove: (subId) => handlePayPalApprove(subId, t.key)
                  }
                ) })
              }
            ) })
          ]
        },
        t.key
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { delay: 0.2 },
          className: "mt-12",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapsible, { open: compareOpen, onOpenChange: setCompareOpen, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(CollapsibleTrigger, { className: "mx-auto flex items-center gap-2 text-sm font-sans font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Compare All Features" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-4 h-4 transition-transform duration-200 ${compareOpen ? "rotate-180" : ""}` })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CollapsibleContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full min-w-[600px] text-sm font-sans", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-3 px-2 text-muted-foreground font-medium w-[200px]", children: "Feature" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-3 px-2 text-muted-foreground font-medium", children: "Free" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-3 px-2 text-muted-foreground font-medium", children: "Starter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-3 px-2 font-semibold text-foreground", children: "Pro" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center py-3 px-2 text-muted-foreground font-medium", children: "Elite" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: comparisonCategories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "pt-5 pb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest", children: cat.name }) }, cat.name),
                cat.features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border/50", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-foreground", children: f.label }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CellValue, { value: f.free }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CellValue, { value: f.starter }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CellValue, { value: f.pro }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2.5 px-2 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CellValue, { value: f.elite }) })
                ] }, f.label))
              ] })) })
            ] }) }) })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 16 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { delay: 0.3 },
          className: "mt-12 flex flex-col items-center gap-5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: [
              { src: "/payments/visa.svg", alt: "Visa" },
              { src: "/payments/mastercard.svg", alt: "Mastercard" },
              { src: "/payments/amex.svg", alt: "American Express" },
              { src: "/payments/discover.svg", alt: "Discover" },
              { src: "/payments/klarna.svg", alt: "Klarna" },
              { src: "/payments/wechat.svg", alt: "WeChat Pay" },
              { src: "/payments/venmo.svg", alt: "Venmo" }
            ].map((icon) => /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: icon.src, alt: icon.alt, className: "h-8 w-auto rounded-md" }, icon.alt)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans text-muted-foreground", children: "Cancel anytime. No hidden fees." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-sans text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-4 h-4 text-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "30-day money-back guarantee" })
            ] })
          ]
        }
      )
    ] })
  ] });
};
const ombraBg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAAAOCAYAAAC1i+ttAAAFcElEQVR4AcxWb4hUVRQ/543bl4Si0PxD/6WiP0tJBSXk1gc/FClU7IJrZFlWlqU5b9ydNzrn7c6MOTOilBFFZX+lREiFIgJbP2QQBGW1BiVEWYgGRbR92Z2Z0+/c2Zkd3dndNxtBl3PeOff8u/eee89916P/oEmqp6OVsH2bem5oxf7/ZBsmE7c3m8+4xEqw8VYY+xL4+yQVz0sqsTSbTM5t5jyZrD8Vv3QyfaNOy6Wljf0JeMacBhrwgCTjz/b1+osnsB8nxlqkwd9i7QqT8fR01lcLrqw7V69e3Vbr1+hpiZWU/xZR5TCM8zBYRso+qe4v8civmNR9kEWGMjFiTW2OMXdObVW3sEqo4d3EvLHi0aEwFV9Vt5ia6YBJDVcqs4zQyBeS9K+HvCWQZPxaOFw9b9Y5m0FPg3piJUhsJ6UVSOReYDe1lc5HHyXK65WwBNU9kkpETG6J4LsIp2PcgNTQwiDRDbsnGkSR2IryHcR0FysnzEGV1xmNihVVcTE8rwtr3YtY8+CbBrYG7NXGfeRMR88EYeDfS6TrbBDJFTuBu0W2/y65wleSze+AvEuJmJHcTPDMhRS9hRIkbm5mLonEPCV9pZluKllfLj8gmcKH6Vy+QMTfE9FFwJbAxejfugdr7YTjSWK6BTQyiMgM5AyVoh/A6YIwiC8DrYNLLEr/JpOUYzEBRQ7xbQAMvgcn60UouKTeogZVFPadpkZtanJMrqk2klDcpukVWODXkRyaG2FZdBKqcfckZBMCl4YedEr2XjaqxGuM1tAllgmlRXqiv3/rYE0xjnp0wMmYoieWOcSiF0gQf8H5jn5wpfSB7UAFZECxZzgvxkRECfxPDBH7cyYapIo+GtHVmXmoPWNw6maGKf9p8O3AY8DooGx+xyWTP4DZ/wzHJZkgmA/qwCVWlRYQ8QmapI1o6RunVo5edpUK1k4DhN3ET+pOQgvteaK6CYo30J0u2BPHkJToMorFcGpbCtXhNmZk6DjWvsN5qm5zNMJHgg23YdxriPl1M+cKu1Nb5hFLtonIJRbcx8CF4vtzQJvCWRp72BTKdNhoVJzBFSuZEu7p98xHWd8FPSXZ4kpMjsG3DJIteIaI2QVnD/R9bNwS8FHBNgXI5zoH1S533blOlI9na6JyWQ9u6vUXl1Q/NS9Vvd+o4Whi+TPrcFvzksoE6+cr8z1mE6u0lthUdttPWDgmwjMllbDkzuYYL7dY/wKxJ6TVZGjcxVFaSRGbvQpsY1jpKefC/LjI+vMcP8VHJD4bJm6sGJ56NYTMYI4k4yuMcYn1PD6IzlEkT+zBLD09l6DvQHo3XFWiGXbU21F3uzdvKbR0Yi0IEvA2M72EBHcS07Z0X97GA4uIZjBNzPX2zoLrjUBi5SNGW0BN5wrPYxL74NPBw7G1oFMCD1dPK2a+yp5sdWR1FU3M7tS6xG7GT8vzvE5EdcmlWPnHMPCPSZD4gTzvO8hxP+pzeH51g58WpDOFx+B4VDKF6glDZ7qA+3HAcNgrnSLiB5joD1TBRxSxeaM/L2c+zGvh/xcO1Rqst+nT0NkRkVFcZVZ9Q8jFa/Zkq2Om+Cri/A2bJTi17S6x6FBDcnPof4tauxw/mIuBu3DSunEn1i9m6CMBBkKYMdPRzRsTTJ/rgCtQvwQtKtNyzP8I+EiAqwBTq5pKPv+LevQkeihxrV4N6DSDsPpWvVJJtzTTI09VuUcr6ok1Q0xuEHdPALwOSWif+9ufZyOhD6GUd5s+KkqmeAgxOJ0r4rk15mXxx3pEpjc7xJdG+QS8OttsgcdocSF4H1UQ6bRKJi+w574z5iX9hTdNDnT34wTjUzpb3A8bDrMFO3zjzLCerOmx/sQ/AAAA//8WU/GrAAAABklEQVQDANYALUjtcB5mAAAAAElFTkSuQmCC";
var ACCORDION_NAME = "Accordion";
var ACCORDION_KEYS = ["Home", "End", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"];
var [Collection, useCollection, createCollectionScope] = createCollection(ACCORDION_NAME);
var [createAccordionContext, createAccordionScope] = createContextScope(ACCORDION_NAME, [
  createCollectionScope,
  createCollapsibleScope
]);
var useCollapsibleScope = createCollapsibleScope();
var Accordion$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { type, ...accordionProps } = props;
    const singleProps = accordionProps;
    const multipleProps = accordionProps;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Provider, { scope: props.__scopeAccordion, children: type === "multiple" ? /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplMultiple, { ...multipleProps, ref: forwardedRef }) : /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImplSingle, { ...singleProps, ref: forwardedRef }) });
  }
);
Accordion$1.displayName = ACCORDION_NAME;
var [AccordionValueProvider, useAccordionValueContext] = createAccordionContext(ACCORDION_NAME);
var [AccordionCollapsibleProvider, useAccordionCollapsibleContext] = createAccordionContext(
  ACCORDION_NAME,
  { collapsible: false }
);
var AccordionImplSingle = reactExports.forwardRef(
  (props, forwardedRef) => {
    const {
      value: valueProp,
      defaultValue,
      onValueChange = () => {
      },
      collapsible = false,
      ...accordionSingleProps
    } = props;
    const [value, setValue] = useControllableState({
      prop: valueProp,
      defaultProp: defaultValue ?? "",
      onChange: onValueChange,
      caller: ACCORDION_NAME
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionValueProvider,
      {
        scope: props.__scopeAccordion,
        value: reactExports.useMemo(() => value ? [value] : [], [value]),
        onItemOpen: setValue,
        onItemClose: reactExports.useCallback(() => collapsible && setValue(""), [collapsible, setValue]),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionSingleProps, ref: forwardedRef }) })
      }
    );
  }
);
var AccordionImplMultiple = reactExports.forwardRef((props, forwardedRef) => {
  const {
    value: valueProp,
    defaultValue,
    onValueChange = () => {
    },
    ...accordionMultipleProps
  } = props;
  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? [],
    onChange: onValueChange,
    caller: ACCORDION_NAME
  });
  const handleItemOpen = reactExports.useCallback(
    (itemValue) => setValue((prevValue = []) => [...prevValue, itemValue]),
    [setValue]
  );
  const handleItemClose = reactExports.useCallback(
    (itemValue) => setValue((prevValue = []) => prevValue.filter((value2) => value2 !== itemValue)),
    [setValue]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    AccordionValueProvider,
    {
      scope: props.__scopeAccordion,
      value,
      onItemOpen: handleItemOpen,
      onItemClose: handleItemClose,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionCollapsibleProvider, { scope: props.__scopeAccordion, collapsible: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionImpl, { ...accordionMultipleProps, ref: forwardedRef }) })
    }
  );
});
var [AccordionImplProvider, useAccordionContext] = createAccordionContext(ACCORDION_NAME);
var AccordionImpl = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, disabled, dir, orientation = "vertical", ...accordionProps } = props;
    const accordionRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(accordionRef, forwardedRef);
    const getItems = useCollection(__scopeAccordion);
    const direction = useDirection(dir);
    const isDirectionLTR = direction === "ltr";
    const handleKeyDown = composeEventHandlers(props.onKeyDown, (event) => {
      var _a;
      if (!ACCORDION_KEYS.includes(event.key)) return;
      const target = event.target;
      const triggerCollection = getItems().filter((item) => {
        var _a2;
        return !((_a2 = item.ref.current) == null ? void 0 : _a2.disabled);
      });
      const triggerIndex = triggerCollection.findIndex((item) => item.ref.current === target);
      const triggerCount = triggerCollection.length;
      if (triggerIndex === -1) return;
      event.preventDefault();
      let nextIndex = triggerIndex;
      const homeIndex = 0;
      const endIndex = triggerCount - 1;
      const moveNext = () => {
        nextIndex = triggerIndex + 1;
        if (nextIndex > endIndex) {
          nextIndex = homeIndex;
        }
      };
      const movePrev = () => {
        nextIndex = triggerIndex - 1;
        if (nextIndex < homeIndex) {
          nextIndex = endIndex;
        }
      };
      switch (event.key) {
        case "Home":
          nextIndex = homeIndex;
          break;
        case "End":
          nextIndex = endIndex;
          break;
        case "ArrowRight":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              moveNext();
            } else {
              movePrev();
            }
          }
          break;
        case "ArrowDown":
          if (orientation === "vertical") {
            moveNext();
          }
          break;
        case "ArrowLeft":
          if (orientation === "horizontal") {
            if (isDirectionLTR) {
              movePrev();
            } else {
              moveNext();
            }
          }
          break;
        case "ArrowUp":
          if (orientation === "vertical") {
            movePrev();
          }
          break;
      }
      const clampedIndex = nextIndex % triggerCount;
      (_a = triggerCollection[clampedIndex].ref.current) == null ? void 0 : _a.focus();
    });
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionImplProvider,
      {
        scope: __scopeAccordion,
        disabled,
        direction: dir,
        orientation,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.Slot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Primitive.div,
          {
            ...accordionProps,
            "data-orientation": orientation,
            ref: composedRefs,
            onKeyDown: disabled ? void 0 : handleKeyDown
          }
        ) })
      }
    );
  }
);
var ITEM_NAME = "AccordionItem";
var [AccordionItemProvider, useAccordionItemContext] = createAccordionContext(ITEM_NAME);
var AccordionItem$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, value, ...accordionItemProps } = props;
    const accordionContext = useAccordionContext(ITEM_NAME, __scopeAccordion);
    const valueContext = useAccordionValueContext(ITEM_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    const triggerId = useId();
    const open = value && valueContext.value.includes(value) || false;
    const disabled = accordionContext.disabled || props.disabled;
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AccordionItemProvider,
      {
        scope: __scopeAccordion,
        open,
        disabled,
        triggerId,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Root,
          {
            "data-orientation": accordionContext.orientation,
            "data-state": getState(open),
            ...collapsibleScope,
            ...accordionItemProps,
            ref: forwardedRef,
            disabled,
            open,
            onOpenChange: (open2) => {
              if (open2) {
                valueContext.onItemOpen(value);
              } else {
                valueContext.onItemClose(value);
              }
            }
          }
        )
      }
    );
  }
);
AccordionItem$1.displayName = ITEM_NAME;
var HEADER_NAME = "AccordionHeader";
var AccordionHeader = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...headerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(HEADER_NAME, __scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Primitive.h3,
      {
        "data-orientation": accordionContext.orientation,
        "data-state": getState(itemContext.open),
        "data-disabled": itemContext.disabled ? "" : void 0,
        ...headerProps,
        ref: forwardedRef
      }
    );
  }
);
AccordionHeader.displayName = HEADER_NAME;
var TRIGGER_NAME = "AccordionTrigger";
var AccordionTrigger$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...triggerProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleContext = useAccordionCollapsibleContext(TRIGGER_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Collection.ItemSlot, { scope: __scopeAccordion, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Trigger,
      {
        "aria-disabled": itemContext.open && !collapsibleContext.collapsible || void 0,
        "data-orientation": accordionContext.orientation,
        id: itemContext.triggerId,
        ...collapsibleScope,
        ...triggerProps,
        ref: forwardedRef
      }
    ) });
  }
);
AccordionTrigger$1.displayName = TRIGGER_NAME;
var CONTENT_NAME = "AccordionContent";
var AccordionContent$1 = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAccordion, ...contentProps } = props;
    const accordionContext = useAccordionContext(ACCORDION_NAME, __scopeAccordion);
    const itemContext = useAccordionItemContext(CONTENT_NAME, __scopeAccordion);
    const collapsibleScope = useCollapsibleScope(__scopeAccordion);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      Content,
      {
        role: "region",
        "aria-labelledby": itemContext.triggerId,
        "data-orientation": accordionContext.orientation,
        ...collapsibleScope,
        ...contentProps,
        ref: forwardedRef,
        style: {
          "--radix-accordion-content-height": "var(--radix-collapsible-content-height)",
          "--radix-accordion-content-width": "var(--radix-collapsible-content-width)",
          ...props.style
        }
      }
    );
  }
);
AccordionContent$1.displayName = CONTENT_NAME;
function getState(open) {
  return open ? "open" : "closed";
}
var Root2 = Accordion$1;
var Item = AccordionItem$1;
var Header = AccordionHeader;
var Trigger2 = AccordionTrigger$1;
var Content2 = AccordionContent$1;
const Accordion = Root2;
const AccordionItem = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Header, { className: "flex", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Trigger2,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = Trigger2.displayName;
const AccordionContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = Content2.displayName;
const faqs = [
  {
    q: "I don't have time for this.",
    a: "Setup takes 3 minutes. Photograph your closet, upload a selfie, done. Your outfit is ready before you wake up."
  },
  {
    q: "What if the AI gets it wrong?",
    a: "30-day money-back guarantee, no questions. The AI learns from every thumbs-up or swap. Most users see accurate picks within a week."
  },
  {
    q: "Is my data safe?",
    a: "End-to-end encrypted. Never shared. Export or delete anytime in settings."
  },
  {
    q: "Does it work for my body type?",
    a: "All of them. The AI uses your measurements — not a generic mannequin. It adjusts cuts, proportions, and color placement for you."
  },
  {
    q: "I already know how to dress.",
    a: "Even stylists use data. LEXOR® finds combinations you'd miss by cross-referencing weather, your calendar, and pieces buried in your closet."
  },
  {
    q: "Can I cancel?",
    a: "Yes. Two clicks in settings. No penalties. Your data stays accessible for 30 days after."
  }
];
const FAQ = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "faq", className: "relative py-12 md:py-20 bg-background overflow-hidden", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: ombraBg, alt: "", "aria-hidden": true, className: "absolute inset-0 w-full h-full object-cover opacity-[0.04] pointer-events-none select-none" }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto px-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        className: "text-center mb-12",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-semibold text-muted-foreground tracking-widest uppercase mb-3", children: "FAQ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl md:text-5xl font-bold text-foreground", children: "Still on the Fence?" })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Accordion, { type: "single", collapsible: true, className: "space-y-0", children: faqs.map((faq, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          AccordionItem,
          {
            value: `faq-${i}`,
            className: "border-b border-border px-0 rounded-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionTrigger, { className: "font-sans text-sm font-semibold text-foreground hover:no-underline py-5", children: faq.q }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AccordionContent, { className: "font-sans text-sm text-muted-foreground leading-relaxed", children: faq.a })
            ]
          },
          i
        )) })
      }
    )
  ] })
] });
const timelessBg = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGwAAAAQCAYAAADzhpp3AAAEy0lEQVR4AeRZXWgcVRQ+9yapiGhBBVGKb8ZKiygqVLG0VUrfSm1mZmdMZjYGwSD6IBatYOnmQXxQagV/aDW1O5vN7uwsLRYE9aFJFfwLilJQRAoFU0VBX0Shye4cv5t1lv2b2d2SjUm7nJN77/m/c+bee+ZGUo9+tq7f2q1pJ5EY7FbnSpOXjqlze9RSjQ9mNJHYAr3ZRnp13Efpar/TjgjeihJ1TO2g0yZW29K3tdKH3uyIqW1vxYuj2aY+A9245xPE6UP3UeCnwACo7KDVXnIs/f4ovTHTvMU2tUOQn7Mr/ufRv+Bg/iMje2+Wbt4XtchEswHxjlqamy82JSzKYUhXS9cxjQPhuF2bNLUXIfMwMAZ4oj6u+tgzOf9MjPIlsVjQ9hifapot7Tqm7hLxbQHLp6AfPmfJTN8OlOjHVkq2YewqUflrSfIclWlPJu+rPGygdaU7ScjzU1MnfpWtFJePxmN4sx9oZw8yW5nEM+3k1gp/eHj4OsRq9/+zcGjK875DvwoZr+hP+v6fVUJNR8hgC4afp/OFN13fv4D+ErjuyT/cXGFpx+ppwrBSHxMkMkteY/5IEkeJeSxGZE2x1tHCBgT807FTp/5C2wXITSTE+3EKMo65HDxBnMFefCTKFrbCN5jFB65XjA00Sn810t/L+t8jrgU7oeloOwY8q4/w4ibGdu++Nkqp5wlzK+ffYNIyjMYgsM9r2ArvzXiFfY28tT5m5gkhRME2jXFd19d3Mp903p+E3LnSNVd9gmTvRb8Jep4w5THoK9uYgOc4j9ygxgoty7oRbT4oUxJtx+CYWqoGUTmq6rGCHRvpQlAw76jxp3xXfUZVpcq8OqswZwOrZuvV/XQ+mTBehfyDiheHKFCeFgEdRbKfcEy9bCf0/aPW0MZQZ0USls2emGcihy7250PHA1zKkuDxKd9vWTGFcm1aAX6I6K4IhP5UG+tQJQ0JGOb+0u2BDOYpoCOOqb0SqwRm2vPfht4u2Ud3CUnrA5Y/2P9tryuSMMIPJSqKD/GzYxrPJy3tOZB+c3PFd9F2BS622GYspkCb6MpQh8IsxAxsK/tN2OlnRCZz8vdMrnh4UfTtJBIb1WqjDn7Hs/5ZN+e/ICUbWHHe0ndYB3rLJuJ6BVSCPM4snsQb5Cyb4TViKJ/P/4JQ0yy47dYIuSocny76xPSlXJT39GyFRV0BlFkaJKmpAKlGd5l38KIWMcU7gN2B4A+JxGDPEkYRv6znzbnT/lcR7HZkHIXtRP5//uOWdVNUFI5lJHH4fRbFj6Sz2MOScAsSKbEqGZjrqoyrLqhFKr2TNI19dUQMktbQJmJ+mYm/wLAO1B2iY+pzwEQdAwOc+ykSxAN/X/xmxVcY/F8yMIlt+AifiUIHJX+UcUHiYJSeokfp4exIKX4UjrS4VMZxcJgp2OxULqvP4oEXHEs/zSwP4DNhFEVMU4F0rHK+vQZ/+6GnLnsnbVN7vaLHm3GfuFPdnDQljImbjLWaDAfBoijTs614itapHSUbYoBL57Df2OIhnFE24xAyLf97ALupOD3Fa/SnxoreDpVcI6J6PI2kjJbkwPUoy0eZA78kBoZwfplpr/hxo3w4Bn/a9fy7+6nvPhHItJTCRZX4UMbzNXWfqOT+BQAA//+L/2zwAAAABklEQVQDABzFodlz2jA6AAAAAElFTkSuQmCC";
const CTABanner = () => {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative py-16 md:py-24 bg-muted/30 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        src: timelessBg,
        alt: "",
        "aria-hidden": true,
        className: "absolute inset-0 w-full h-full object-cover opacity-[0.04] pointer-events-none select-none"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 max-w-3xl mx-auto px-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.8, ease: "easeOut" },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl md:text-5xl font-bold text-foreground mb-4", children: "Your Closet Costs You Money Every Day You Wait" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-muted-foreground text-base md:text-lg max-w-xl mx-auto mb-6", children: "Free to start. Results in 3 minutes. Cancel anytime." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "lg",
              className: "text-base px-8 group",
              onClick: () => navigate("/auth"),
              children: [
                "Try Free — No Card Needed",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" })
              ]
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-sans text-xs text-muted-foreground", children: "30-day money-back guarantee. Zero risk." })
        ]
      }
    ) })
  ] });
};
const DISMISSED_KEY$1 = "luxor-banner-dismissed";
const TIMER_END_KEY = "luxor-countdown-end";
const COUNTDOWN_HOURS = 24;
function getOrCreateEndTime() {
  const stored = localStorage.getItem(TIMER_END_KEY);
  if (stored) {
    const end2 = parseInt(stored, 10);
    if (end2 > Date.now()) return end2;
  }
  const end = Date.now() + COUNTDOWN_HOURS * 60 * 60 * 1e3;
  localStorage.setItem(TIMER_END_KEY, String(end));
  return end;
}
function formatTime(ms) {
  if (ms <= 0) return { h: "00", m: "00", s: "00" };
  const totalSec = Math.floor(ms / 1e3);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor(totalSec % 3600 / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return { h, m, s };
}
function AnnouncementBanner() {
  const [visible, setVisible] = reactExports.useState(
    () => sessionStorage.getItem(DISMISSED_KEY$1) !== "1"
  );
  const [remaining, setRemaining] = reactExports.useState(() => getOrCreateEndTime() - Date.now());
  const [infoIndex, setInfoIndex] = reactExports.useState(0);
  reactExports.useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      const diff = getOrCreateEndTime() - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    }, 1e3);
    return () => clearInterval(id);
  }, [visible]);
  reactExports.useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => setInfoIndex((i) => (i + 1) % 1), 4e3);
    return () => clearInterval(id);
  }, [visible]);
  const dismiss = reactExports.useCallback(() => {
    sessionStorage.setItem(DISMISSED_KEY$1, "1");
    setVisible(false);
  }, []);
  const { h, m, s } = formatTime(remaining);
  const infoSlots = [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Lock in founding pricing" })
    ] })
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { height: 0, opacity: 0 },
      animate: { height: 40, opacity: 1 },
      exit: { height: 0, opacity: 0 },
      transition: { duration: 0.3, ease: "easeInOut" },
      className: "relative z-[60] overflow-hidden bg-muted/50 border-b border-border",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-10 flex items-center justify-center px-10 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-sans font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Diamond, { className: "w-3 h-3 text-foreground shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "Early Access" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 font-mono text-[11px] text-foreground font-bold tracking-wider", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: h }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "countdown-colon", children: ":" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: m }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "countdown-colon", children: ":" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline-flex items-center gap-2", children: infoSlots[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden inline-flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.span,
            {
              initial: { opacity: 0, y: 6 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -6 },
              transition: { duration: 0.25 },
              className: "inline-flex items-center gap-2",
              children: infoSlots[infoIndex]
            },
            infoIndex
          ) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: dismiss,
            className: "absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
            "aria-label": "Dismiss",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
          }
        )
      ] })
    }
  ) });
}
const DISMISSED_KEY = "luxor-sticky-bar-dismissed";
function StickyPricingBar() {
  const navigate = useNavigate();
  const [visible, setVisible] = reactExports.useState(false);
  const [dismissed, setDismissed] = reactExports.useState(
    () => sessionStorage.getItem(DISMISSED_KEY) === "1"
  );
  reactExports.useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const heroEnd = window.innerHeight;
      const pricingEl = document.getElementById("pricing");
      const pricingTop = (pricingEl == null ? void 0 : pricingEl.getBoundingClientRect().top) ?? Infinity;
      const pricingBottom = (pricingEl == null ? void 0 : pricingEl.getBoundingClientRect().bottom) ?? Infinity;
      const pastHero = window.scrollY > heroEnd;
      const pricingInView = pricingTop < window.innerHeight && pricingBottom > 0;
      setVisible(pastHero && !pricingInView);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);
  const dismiss = () => {
    sessionStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
    setVisible(false);
  };
  const handleCTA = () => {
    trackEvent("InitiateCheckout", { content_name: "Sticky Bar CTA" });
    navigate("/auth");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: visible && !dismissed && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { y: 80, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 80, opacity: 0 },
      transition: { type: "spring", stiffness: 300, damping: 30 },
      className: "fixed bottom-0 inset-x-0 z-50 px-4 pb-4 pointer-events-none",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto pointer-events-auto glass-strong rounded-2xl px-5 py-3 flex items-center justify-between gap-4 shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-sm font-bold text-foreground truncate", children: "Join LEXOR® Now" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-sans text-muted-foreground", children: "Founding member pricing — limited spots" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleCTA,
              className: "rounded-full px-5 py-2 text-xs font-sans font-bold flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Get Started" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-3.5 h-3.5" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: dismiss,
              className: "p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
              "aria-label": "Dismiss",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
            }
          )
        ] })
      ] })
    }
  ) });
}
function ScrollToTop() {
  const [visible, setVisible] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: visible && /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.button,
    {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
      transition: { duration: 0.25 },
      onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      className: "fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full bg-primary/90 text-primary-foreground shadow-lg backdrop-blur-sm flex items-center justify-center hover:bg-primary transition-colors",
      "aria-label": "Scroll to top",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-4 h-4" })
    }
  ) });
}
const Index = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 1e-3 });
  reactExports.useEffect(() => {
    captureUTMParams();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen overflow-x-hidden dark", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        className: "fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left gold-gradient",
        style: { scaleX }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnnouncementBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Hero, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabbedFeatures, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Features, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HowItWorks, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Testimonials, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Pricing, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(FAQ, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(CTABanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(StickyPricingBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ScrollToTop, {})
  ] });
};
export {
  Index as default
};
