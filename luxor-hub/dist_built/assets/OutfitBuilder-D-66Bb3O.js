import { r as reactExports, j as jsxRuntimeExports } from "./index-CqA86RF3.js";
import { A as AppLayout } from "./AppLayout-QSRtcW1a.js";
import { d as createLucideIcon, e as useAuth, s as supabase, B as Button } from "./AppContent-h4IlOpH8.js";
import { I as Input } from "./input-7xxs-MwO.js";
import { t as toast } from "./index-J9_vYcP0.js";
import { m as motion } from "./proxy-ShtysCL3.js";
import { G as GripVertical } from "./grip-vertical-CEZV2zQL.js";
import { S as Shirt } from "./shirt-Cl12YkbS.js";
import { R as RotateCcw } from "./rotate-ccw-wpZg36pS.js";
import { X } from "./x-BJDvVtyz.js";
import { S as Save } from "./save-CKE_I0Ip.js";
import "./BottomNav-DTwSgLpq.js";
import "./index-CwmenB4e.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Move = createLucideIcon("Move", [
  ["path", { d: "M12 2v20", key: "t6zp3m" }],
  ["path", { d: "m15 19-3 3-3-3", key: "11eu04" }],
  ["path", { d: "m19 9 3 3-3 3", key: "1mg7y2" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }],
  ["path", { d: "m5 9-3 3 3 3", key: "j64kie" }],
  ["path", { d: "m9 5 3-3 3 3", key: "l8vdw6" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ZoomIn = createLucideIcon("ZoomIn", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
  ["line", { x1: "11", x2: "11", y1: "8", y2: "14", key: "1vmskp" }],
  ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const ZoomOut = createLucideIcon("ZoomOut", [
  ["circle", { cx: "11", cy: "11", r: "8", key: "4ej97u" }],
  ["line", { x1: "21", x2: "16.65", y1: "21", y2: "16.65", key: "13gj7c" }],
  ["line", { x1: "8", x2: "14", y1: "11", y2: "11", key: "durymu" }]
]);
const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;
const OutfitBuilder = () => {
  const { user } = useAuth();
  const canvasRef = reactExports.useRef(null);
  const [closetItems, setClosetItems] = reactExports.useState([]);
  const [canvasItems, setCanvasItems] = reactExports.useState([]);
  const [selectedItem, setSelectedItem] = reactExports.useState(null);
  const [outfitName, setOutfitName] = reactExports.useState("");
  const [draggingFrom, setDraggingFrom] = reactExports.useState(null);
  reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const nextZIndex = reactExports.useRef(1);
  const [categoryFilter, setCategoryFilter] = reactExports.useState("All");
  reactExports.useEffect(() => {
    if (!user) return;
    supabase.from("clothing_items").select("id, name, category, color, photo_url").eq("user_id", user.id).then(({ data }) => {
      if (data) setClosetItems(data);
    });
  }, [user]);
  const categories = ["All", ...Array.from(new Set(closetItems.map((i) => i.category)))];
  const filteredItems = categoryFilter === "All" ? closetItems : closetItems.filter((i) => i.category === categoryFilter);
  const addToCanvas = (itemId) => {
    if (canvasItems.find((ci) => ci.itemId === itemId)) {
      toast.info("Item already on canvas");
      return;
    }
    setCanvasItems((prev) => [
      ...prev,
      {
        itemId,
        x: CANVAS_WIDTH / 2 - 50,
        y: CANVAS_HEIGHT / 2 - 50,
        scale: 1,
        rotation: 0,
        zIndex: nextZIndex.current++
      }
    ]);
  };
  const removeFromCanvas = (itemId) => {
    setCanvasItems((prev) => prev.filter((ci) => ci.itemId !== itemId));
    if (selectedItem === itemId) setSelectedItem(null);
  };
  const updateCanvasItem = (itemId, updates) => {
    setCanvasItems(
      (prev) => prev.map((ci) => ci.itemId === itemId ? { ...ci, ...updates } : ci)
    );
  };
  const handleCanvasDragStart = (e, itemId) => {
    e.preventDefault();
    setSelectedItem(itemId);
    updateCanvasItem(itemId, { zIndex: nextZIndex.current++ });
    const startPos = "touches" in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    const item = canvasItems.find((ci) => ci.itemId === itemId);
    if (!item) return;
    const startItemPos = { x: item.x, y: item.y };
    const handleMove = (ev) => {
      const pos = "touches" in ev ? { x: ev.touches[0].clientX, y: ev.touches[0].clientY } : { x: ev.clientX, y: ev.clientY };
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      updateCanvasItem(itemId, {
        x: Math.max(0, Math.min(CANVAS_WIDTH - 100, startItemPos.x + dx)),
        y: Math.max(0, Math.min(CANVAS_HEIGHT - 100, startItemPos.y + dy))
      });
    };
    const handleEnd = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);
  };
  const handleSidebarDragStart = (e, itemId) => {
    e.dataTransfer.setData("text/plain", itemId);
    setDraggingFrom(itemId);
  };
  const handleCanvasDrop = (e) => {
    var _a;
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (!itemId) return;
    const rect = (_a = canvasRef.current) == null ? void 0 : _a.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 50;
    if (canvasItems.find((ci) => ci.itemId === itemId)) {
      updateCanvasItem(itemId, { x: Math.max(0, x), y: Math.max(0, y) });
    } else {
      setCanvasItems((prev) => [
        ...prev,
        { itemId, x: Math.max(0, x), y: Math.max(0, y), scale: 1, rotation: 0, zIndex: nextZIndex.current++ }
      ]);
    }
    setDraggingFrom(null);
  };
  const saveOutfit = async () => {
    if (!user || canvasItems.length === 0) {
      toast.error("Add items to the canvas first");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.from("outfits").insert({
        user_id: user.id,
        name: outfitName || `My Outfit ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
        description: `Custom outfit with ${canvasItems.length} items`,
        ai_generated: false
      }).select().single();
      if (error) throw error;
      await supabase.from("outfit_items").insert(
        canvasItems.map((ci) => ({ outfit_id: data.id, clothing_item_id: ci.itemId }))
      );
      toast.success("Outfit saved!");
      setCanvasItems([]);
      setOutfitName("");
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };
  const getItemById = (id) => closetItems.find((i) => i.id === id);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-3xl font-bold text-foreground flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Move, { className: "h-6 w-6 text-primary" }),
        " Outfit Builder"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm mt-1 mb-6", children: "Drag items from your closet onto the canvas to compose outfits" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, x: -20 },
          animate: { opacity: 1, x: 0 },
          className: "lg:w-64 flex-shrink-0",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl p-4 sticky top-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-sm font-bold text-foreground mb-3", children: "Your Closet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1 flex-wrap mb-3", children: categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setCategoryFilter(cat),
                className: `px-2 py-1 rounded-full text-[10px] font-sans transition-all ${categoryFilter === cat ? "gold-gradient text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`,
                children: cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)
              },
              cat
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-h-[60vh] overflow-y-auto pr-1", children: [
              filteredItems.map((item) => {
                const onCanvas = canvasItems.some((ci) => ci.itemId === item.id);
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    draggable: true,
                    onDragStart: (e) => handleSidebarDragStart(e, item.id),
                    onClick: () => !onCanvas && addToCanvas(item.id),
                    className: `flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all ${onCanvas ? "bg-primary/10 border border-primary/30" : "bg-secondary/50 hover:bg-secondary border border-transparent"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-3 w-3 text-muted-foreground flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded bg-secondary flex-shrink-0 overflow-hidden", children: item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: "", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "h-4 w-4 text-muted-foreground" }) }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans text-foreground truncate", children: item.name || "Unnamed" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-sans capitalize", children: item.category })
                      ] }),
                      onCanvas && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-primary font-sans", children: "✓" })
                    ]
                  },
                  item.id
                );
              }),
              filteredItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground font-sans text-center py-4", children: "No items in closet" })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          className: "flex-1",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Input,
                {
                  value: outfitName,
                  onChange: (e) => setOutfitName(e.target.value),
                  placeholder: "Outfit name...",
                  className: "bg-secondary border-glass-border max-w-xs font-sans text-sm"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
              selectedItem && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "icon",
                    className: "h-8 w-8 border-glass-border",
                    onClick: () => {
                      const item = canvasItems.find((ci) => ci.itemId === selectedItem);
                      if (item) updateCanvasItem(selectedItem, { scale: Math.min(2, item.scale + 0.1) });
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "icon",
                    className: "h-8 w-8 border-glass-border",
                    onClick: () => {
                      const item = canvasItems.find((ci) => ci.itemId === selectedItem);
                      if (item) updateCanvasItem(selectedItem, { scale: Math.max(0.3, item.scale - 0.1) });
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "icon",
                    className: "h-8 w-8 border-glass-border",
                    onClick: () => {
                      const item = canvasItems.find((ci) => ci.itemId === selectedItem);
                      if (item) updateCanvasItem(selectedItem, { rotation: item.rotation + 15 });
                    },
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "h-3.5 w-3.5" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    variant: "outline",
                    size: "icon",
                    className: "h-8 w-8 border-glass-border text-destructive",
                    onClick: () => removeFromCanvas(selectedItem),
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: saveOutfit, disabled: saving || canvasItems.length === 0, className: "gold-gradient text-primary-foreground font-sans text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-1" }),
                " Save Outfit"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                ref: canvasRef,
                onDragOver: (e) => e.preventDefault(),
                onDrop: handleCanvasDrop,
                onClick: (e) => {
                  if (e.target === canvasRef.current) setSelectedItem(null);
                },
                className: "relative glass rounded-2xl overflow-hidden mx-auto",
                style: { width: "100%", maxWidth: CANVAS_WIDTH, height: CANVAS_HEIGHT },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-10", style: {
                    backgroundImage: "radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)",
                    backgroundSize: "20px 20px"
                  } }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 200 400", className: "h-[80%] opacity-[0.06]", fill: "none", stroke: "currentColor", strokeWidth: "1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("ellipse", { cx: "100", cy: "50", rx: "30", ry: "40" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "100", y1: "90", x2: "100", y2: "240" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "100", y1: "120", x2: "40", y2: "180" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "100", y1: "120", x2: "160", y2: "180" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "100", y1: "240", x2: "60", y2: "380" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "100", y1: "240", x2: "140", y2: "380" })
                  ] }) }),
                  canvasItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "h-10 w-10 text-muted-foreground mx-auto mb-2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: "Drag items here" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/60 font-sans", children: "or click items in your closet" })
                  ] }) }),
                  canvasItems.map((ci) => {
                    const item = getItemById(ci.itemId);
                    if (!item) return null;
                    const isSelected = selectedItem === ci.itemId;
                    return /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        onMouseDown: (e) => handleCanvasDragStart(e, ci.itemId),
                        onTouchStart: (e) => handleCanvasDragStart(e, ci.itemId),
                        className: `absolute cursor-move select-none ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent" : ""}`,
                        style: {
                          left: ci.x,
                          top: ci.y,
                          width: 100,
                          height: 100,
                          transform: `scale(${ci.scale}) rotate(${ci.rotation}deg)`,
                          transformOrigin: "center center",
                          zIndex: ci.zIndex
                        },
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full rounded-xl overflow-hidden bg-secondary border border-glass-border shadow-lg", children: item.photo_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: item.photo_url, alt: item.name || "", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center p-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "h-6 w-6 text-muted-foreground" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] text-muted-foreground font-sans text-center mt-1 truncate w-full px-1", children: item.name || item.category })
                        ] }) })
                      },
                      ci.itemId
                    );
                  })
                ]
              }
            ),
            canvasItems.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2 mt-4", children: canvasItems.map((ci) => {
              const item = getItemById(ci.itemId);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "px-2.5 py-1 rounded-full text-xs font-sans bg-secondary text-foreground flex items-center gap-1",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Shirt, { className: "h-3 w-3 text-primary" }),
                    (item == null ? void 0 : item.name) || "Unnamed",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => removeFromCanvas(ci.itemId), className: "ml-1 text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }) })
                  ]
                },
                ci.itemId
              );
            }) })
          ]
        }
      )
    ] })
  ] }) });
};
export {
  OutfitBuilder as default
};
