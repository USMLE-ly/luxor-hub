import { r as reactExports, j as jsxRuntimeExports } from "./index-CqA86RF3.js";
const ImageSwiper = ({
  images,
  cardWidth = 256,
  cardHeight = 352,
  className = ""
}) => {
  const cardStackRef = reactExports.useRef(null);
  const isSwiping = reactExports.useRef(false);
  const startX = reactExports.useRef(0);
  const currentX = reactExports.useRef(0);
  const animationFrameId = reactExports.useRef(null);
  const imageList = images.split(",").map((img) => img.trim()).filter((img) => img);
  const [cardOrder, setCardOrder] = reactExports.useState(
    () => Array.from({ length: imageList.length }, (_, i) => i)
  );
  const getDurationFromCSS = reactExports.useCallback((variableName, element) => {
    var _a, _b;
    const targetElement = element || document.documentElement;
    const value = (_b = (_a = getComputedStyle(targetElement)) == null ? void 0 : _a.getPropertyValue(variableName)) == null ? void 0 : _b.trim();
    if (!value) return 0;
    if (value.endsWith("ms")) return parseFloat(value);
    if (value.endsWith("s")) return parseFloat(value) * 1e3;
    return parseFloat(value) || 0;
  }, []);
  const getCards = reactExports.useCallback(() => {
    if (!cardStackRef.current) return [];
    return [...cardStackRef.current.querySelectorAll(".image-card")];
  }, []);
  const getActiveCard = reactExports.useCallback(() => {
    const cards = getCards();
    return cards[0] || null;
  }, [getCards]);
  const applySwipeStyles = reactExports.useCallback((deltaX) => {
    const card = getActiveCard();
    if (!card) return;
    card.style.setProperty("--swipe-x", `${deltaX}px`);
    card.style.setProperty("--swipe-rotate", `${deltaX * 0.2}deg`);
    card.style.opacity = (1 - Math.min(Math.abs(deltaX) / 100, 1) * 0.75).toString();
  }, [getActiveCard]);
  const handleStart = reactExports.useCallback((clientX) => {
    if (isSwiping.current) return;
    isSwiping.current = true;
    startX.current = clientX;
    currentX.current = clientX;
    const card = getActiveCard();
    if (card) card.style.transition = "none";
  }, [getActiveCard]);
  const handleEnd = reactExports.useCallback(() => {
    if (!isSwiping.current) return;
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    const deltaX = currentX.current - startX.current;
    const threshold = 50;
    const duration = getDurationFromCSS("--card-swap-duration", cardStackRef.current);
    const card = getActiveCard();
    if (card) {
      card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
      if (Math.abs(deltaX) > threshold) {
        const direction = Math.sign(deltaX);
        card.style.setProperty("--swipe-x", `${direction * 300}px`);
        card.style.setProperty("--swipe-rotate", `${direction * 20}deg`);
        setTimeout(() => {
          setCardOrder((prev) => prev.length === 0 ? [] : [...prev.slice(1), prev[0]]);
        }, duration);
      } else {
        applySwipeStyles(0);
      }
    }
    isSwiping.current = false;
    startX.current = 0;
    currentX.current = 0;
  }, [getDurationFromCSS, getActiveCard, applySwipeStyles]);
  const handleMove = reactExports.useCallback((clientX) => {
    if (!isSwiping.current) return;
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    animationFrameId.current = requestAnimationFrame(() => {
      currentX.current = clientX;
      const deltaX = currentX.current - startX.current;
      applySwipeStyles(deltaX);
      if (Math.abs(deltaX) > 50) handleEnd();
    });
  }, [applySwipeStyles, handleEnd]);
  reactExports.useEffect(() => {
    const el = cardStackRef.current;
    if (!el) return;
    const onDown = (e) => handleStart(e.clientX);
    const onMove = (e) => handleMove(e.clientX);
    const onUp = () => handleEnd();
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [handleStart, handleMove, handleEnd]);
  reactExports.useEffect(() => {
    const cards = getCards();
    cards.forEach((card, i) => {
      card.style.setProperty("--i", (i + 1).toString());
      card.style.setProperty("--swipe-x", "0px");
      card.style.setProperty("--swipe-rotate", "0deg");
      card.style.opacity = "1";
    });
  }, [cardOrder, getCards]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "section",
    {
      ref: cardStackRef,
      className: `relative grid place-content-center select-none ${className}`,
      style: {
        width: cardWidth + 32,
        height: cardHeight + 32,
        touchAction: "none",
        "--card-perspective": "700px",
        "--card-z-offset": "12px",
        "--card-y-offset": "7px",
        "--card-max-z-index": imageList.length.toString(),
        "--card-swap-duration": "0.3s"
      },
      children: cardOrder.map((originalIndex, displayIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "article",
        {
          className: "image-card absolute cursor-grab active:cursor-grabbing place-self-center border border-slate-400 rounded-xl shadow-md overflow-hidden will-change-transform",
          style: {
            zIndex: imageList.length - displayIndex,
            width: cardWidth,
            height: cardHeight,
            transform: `perspective(var(--card-perspective)) translateZ(calc(-1 * var(--card-z-offset) * ${displayIndex + 1})) translateY(calc(var(--card-y-offset) * ${displayIndex + 1})) translateX(var(--swipe-x, 0px)) rotateY(var(--swipe-rotate, 0deg))`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: imageList[originalIndex],
              alt: `Swiper ${originalIndex + 1}`,
              className: "w-full h-full object-cover select-none pointer-events-none",
              draggable: false
            }
          )
        },
        originalIndex
      ))
    }
  );
};
export {
  ImageSwiper as I
};
