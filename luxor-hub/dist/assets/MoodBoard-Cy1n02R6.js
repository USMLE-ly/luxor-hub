import { r as reactExports, j as jsxRuntimeExports } from "./index-UvNQFckZ.js";
import { A as AppLayout } from "./AppLayout-C2fJ8nQA.js";
import { d as createLucideIcon, e as useAuth, s as supabase, B as Button } from "./AppContent-9kIwMzo7.js";
import { t as toast } from "./index-CXhnqnHQ.js";
import { I as Input } from "./input-DAE276Fi.js";
import { D as Dialog, b as DialogContent, c as DialogHeader, d as DialogTitle } from "./dialog-CG9oJSSE.js";
import { m as motion } from "./proxy-DuKBf0zJ.js";
import { P as Plus } from "./plus-BmpjMKS9.js";
import { X } from "./x-DeR7balG.js";
import { I as Image } from "./image-BSYT6HAI.js";
import { P as Palette } from "./palette-BoqQyCmz.js";
import { L as Link2 } from "./link-2-B1t9rEnO.js";
import { G as GripVertical } from "./grip-vertical-ClLjtLm7.js";
import "./BottomNav-DDKq4ZnH.js";
import "./shirt-iptwcFqR.js";
import "./index-CI22_94N.js";
import "./index-C4LdyOW3.js";
import "./index-DD4Lzeau.js";
import "./index-DbLPExPm.js";
import "./index-B_9TlE7I.js";
import "./index-JMgWy2k0.js";
import "./index-tS1BiThI.js";
import "./index-D1pSGaqh.js";
import "./index-C-kGGVnc.js";
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const LayoutGrid = createLucideIcon("LayoutGrid", [
  ["rect", { width: "7", height: "7", x: "3", y: "3", rx: "1", key: "1g98yp" }],
  ["rect", { width: "7", height: "7", x: "14", y: "3", rx: "1", key: "6d4xhi" }],
  ["rect", { width: "7", height: "7", x: "14", y: "14", rx: "1", key: "nxv5o0" }],
  ["rect", { width: "7", height: "7", x: "3", y: "14", rx: "1", key: "1bb6yr" }]
]);
/**
 * @license lucide-react v0.462.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Type = createLucideIcon("Type", [
  ["polyline", { points: "4 7 4 4 20 4 20 7", key: "1nosan" }],
  ["line", { x1: "9", x2: "15", y1: "20", y2: "20", key: "swin9y" }],
  ["line", { x1: "12", x2: "12", y1: "4", y2: "20", key: "1tx1rr" }]
]);
const MoodBoard = () => {
  const { user } = useAuth();
  const [boards, setBoards] = reactExports.useState([]);
  const [activeBoard, setActiveBoard] = reactExports.useState(null);
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [dragging, setDragging] = reactExports.useState(null);
  const dragOffsetRef = reactExports.useRef({ x: 0, y: 0 });
  const [showNewBoard, setShowNewBoard] = reactExports.useState(false);
  const [newBoardName, setNewBoardName] = reactExports.useState("");
  const [showAddItem, setShowAddItem] = reactExports.useState(false);
  const [newItemType, setNewItemType] = reactExports.useState("image");
  const [newItemContent, setNewItemContent] = reactExports.useState("");
  const canvasRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const draggingRef = reactExports.useRef(null);
  const itemsRef = reactExports.useRef([]);
  reactExports.useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  reactExports.useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);
  reactExports.useEffect(() => {
    if (!user) return;
    fetchBoards();
  }, [user]);
  const fetchBoards = async () => {
    if (!user) return;
    const { data } = await supabase.from("mood_boards").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) {
      setBoards(data);
      if (data.length > 0 && !activeBoard) {
        setActiveBoard(data[0]);
        fetchItems(data[0].id);
      }
    }
    setLoading(false);
  };
  const fetchItems = async (boardId) => {
    const { data } = await supabase.from("mood_board_items").select("*").eq("board_id", boardId).order("created_at");
    if (data) {
      setItems(data.map((d) => ({
        id: d.id,
        type: d.type,
        content: d.content,
        x: d.position_x,
        y: d.position_y,
        width: d.width,
        height: d.height
      })));
    }
  };
  const createBoard = async () => {
    if (!user || !newBoardName.trim()) return;
    const { data, error } = await supabase.from("mood_boards").insert({ user_id: user.id, name: newBoardName.trim() }).select().single();
    if (error) toast.error("Failed to create board");
    else {
      toast.success("Board created!");
      setShowNewBoard(false);
      setNewBoardName("");
      setActiveBoard(data);
      setItems([]);
      fetchBoards();
    }
  };
  const deleteBoard = async (id) => {
    await supabase.from("mood_board_items").delete().eq("board_id", id);
    const { error } = await supabase.from("mood_boards").delete().eq("id", id);
    if (error) toast.error("Failed to delete board");
    else {
      toast.success("Board deleted");
      if ((activeBoard == null ? void 0 : activeBoard.id) === id) {
        setActiveBoard(null);
        setItems([]);
      }
      fetchBoards();
    }
  };
  const addItem = async () => {
    if (!user || !activeBoard) return;
    let content = {};
    if (newItemType === "text") content = { text: newItemContent };
    else if (newItemType === "color") content = { hex: newItemContent || "#D4A574" };
    else if (newItemType === "link") content = { url: newItemContent };
    else if (newItemType === "image") content = { url: newItemContent };
    const newDbItem = {
      board_id: activeBoard.id,
      type: newItemType,
      content,
      position_x: 20 + Math.random() * 200,
      position_y: 20 + Math.random() * 200,
      width: newItemType === "color" ? 80 : newItemType === "text" ? 200 : 180,
      height: newItemType === "color" ? 80 : newItemType === "text" ? 60 : 180
    };
    const { data, error } = await supabase.from("mood_board_items").insert(newDbItem).select().single();
    if (error) toast.error("Failed to add item");
    else {
      const d = data;
      setItems((prev) => [...prev, {
        id: d.id,
        type: d.type,
        content: d.content,
        x: d.position_x,
        y: d.position_y,
        width: d.width,
        height: d.height
      }]);
      setShowAddItem(false);
      setNewItemContent("");
    }
  };
  const handleImageUpload = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file || !user || !activeBoard) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/moodboard/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("look-photos").upload(path, file);
      if (uploadErr) {
        toast.error("Upload failed");
        return;
      }
      const { data: urlData } = supabase.storage.from("look-photos").getPublicUrl(path);
      const newDbItem = {
        board_id: activeBoard.id,
        type: "image",
        content: { url: urlData.publicUrl },
        position_x: 20 + Math.random() * 200,
        position_y: 20 + Math.random() * 200,
        width: 180,
        height: 180
      };
      const { data, error } = await supabase.from("mood_board_items").insert(newDbItem).select().single();
      if (!error && data) {
        const d = data;
        setItems((prev) => [...prev, { id: d.id, type: "image", content: d.content, x: d.position_x, y: d.position_y, width: 180, height: 180 }]);
        toast.success("Image added!");
      }
    };
    reader.readAsArrayBuffer(file);
  };
  const deleteItem = async (id) => {
    await supabase.from("mood_board_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };
  const getPointerPos = (e) => {
    if ("touches" in e) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  };
  const handlePointerDown = (e, itemId) => {
    const item = items.find((i) => i.id === itemId);
    if (!item || !canvasRef.current) return;
    e.preventDefault();
    const pos = getPointerPos(e);
    const rect = canvasRef.current.getBoundingClientRect();
    setDragging(itemId);
    dragOffsetRef.current = { x: pos.x - rect.left - item.x, y: pos.y - rect.top - item.y };
  };
  const handlePointerMove = reactExports.useCallback((e) => {
    if (!draggingRef.current || !canvasRef.current) return;
    e.preventDefault();
    const pos = "touches" in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(rect.width - 40, pos.x - rect.left - dragOffsetRef.current.x));
    const newY = Math.max(0, Math.min(rect.height - 40, pos.y - rect.top - dragOffsetRef.current.y));
    setItems((prev) => prev.map((i) => i.id === draggingRef.current ? { ...i, x: newX, y: newY } : i));
  }, []);
  const handlePointerUp = reactExports.useCallback(async () => {
    const dragId = draggingRef.current;
    if (!dragId) return;
    const item = itemsRef.current.find((i) => i.id === dragId);
    if (item) {
      await supabase.from("mood_board_items").update({ position_x: item.x, position_y: item.y }).eq("id", item.id);
    }
    setDragging(null);
  }, []);
  const renderItem = (item) => {
    var _a, _b, _c, _d, _e;
    switch (item.type) {
      case "image":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: (_a = item.content) == null ? void 0 : _a.url, alt: "", className: "w-full h-full object-cover rounded-lg pointer-events-none", draggable: false });
      case "color":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full rounded-lg pointer-events-none", style: { backgroundColor: ((_b = item.content) == null ? void 0 : _b.hex) || "#ccc" } });
      case "text":
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center p-2 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs text-foreground text-center", children: (_c = item.content) == null ? void 0 : _c.text }) });
      case "link":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: (_d = item.content) == null ? void 0 : _d.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "w-full h-full flex items-center justify-center p-2 bg-secondary/50 rounded-lg",
            onClick: (e) => {
              if (dragging) e.preventDefault();
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "w-5 h-5 text-primary mx-auto mb-1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-[10px] text-muted-foreground truncate", children: (_e = item.content) == null ? void 0 : _e.url })
            ] })
          }
        );
      default:
        return null;
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppLayout, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-display text-2xl font-bold text-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "h-6 w-6 text-primary" }),
          " Mood Boards"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-xs mt-0.5", children: "Curate your style inspiration" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", onClick: () => setShowNewBoard(true), className: "gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" }),
        " New Board"
      ] })
    ] }),
    boards.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none", children: boards.map((board) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => {
          setActiveBoard(board);
          fetchItems(board.id);
        },
        className: `px-4 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${(activeBoard == null ? void 0 : activeBoard.id) === board.id ? "bg-foreground text-background font-semibold" : "bg-secondary text-muted-foreground hover:text-foreground"}`,
        children: [
          board.name,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { onClick: (e) => {
            e.stopPropagation();
            deleteBoard(board.id);
          }, className: "hover:text-destructive cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" }) })
        ]
      },
      board.id
    )) }),
    activeBoard ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          setNewItemType("image");
          setShowAddItem(true);
        }, className: "gap-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-3.5 h-3.5" }),
          " Image URL"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          var _a;
          return (_a = fileInputRef.current) == null ? void 0 : _a.click();
        }, className: "gap-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-3.5 h-3.5" }),
          " Upload"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          setNewItemType("color");
          setShowAddItem(true);
        }, className: "gap-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "w-3.5 h-3.5" }),
          " Color"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          setNewItemType("text");
          setShowAddItem(true);
        }, className: "gap-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { className: "w-3.5 h-3.5" }),
          " Text"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { size: "sm", variant: "outline", onClick: () => {
          setNewItemType("link");
          setShowAddItem(true);
        }, className: "gap-1.5 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link2, { className: "w-3.5 h-3.5" }),
          " Link"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", className: "hidden", onChange: handleImageUpload })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          ref: canvasRef,
          className: "relative rounded-2xl border border-border bg-card min-h-[500px] overflow-hidden select-none touch-none",
          onMouseMove: handlePointerMove,
          onMouseUp: handlePointerUp,
          onMouseLeave: handlePointerUp,
          onTouchMove: handlePointerMove,
          onTouchEnd: handlePointerUp,
          onTouchCancel: handlePointerUp,
          children: [
            items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm", children: "Add items to start building your mood board" }) }),
            items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `absolute group rounded-lg border border-border shadow-sm overflow-hidden transition-shadow ${dragging === item.id ? "ring-2 ring-primary z-50 shadow-lg cursor-grabbing" : "hover:ring-1 hover:ring-primary/50 cursor-grab"}`,
                style: { left: item.x, top: item.y, width: item.width, height: item.height },
                onMouseDown: (e) => handlePointerDown(e, item.id),
                onTouchStart: (e) => handlePointerDown(e, item.id),
                children: [
                  renderItem(item),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1 left-1 w-5 h-5 rounded bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "w-3 h-3 text-foreground/60" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      },
                      onMouseDown: (e) => e.stopPropagation(),
                      onTouchStart: (e) => e.stopPropagation(),
                      className: "absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
                    }
                  )
                ]
              },
              item.id
            ))
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "w-12 h-12 text-muted-foreground mx-auto mb-3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground font-sans text-sm mb-3", children: "Create a board to start pinning inspiration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setShowNewBoard(true), children: "Create Board" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showNewBoard, onOpenChange: setShowNewBoard, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display", children: "New Board" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Board name", value: newBoardName, onChange: (e) => setNewBoardName(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createBoard, disabled: !newBoardName.trim(), className: "w-full", children: "Create" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showAddItem, onOpenChange: setShowAddItem, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { className: "font-display", children: [
        "Add ",
        newItemType
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            placeholder: newItemType === "image" ? "Image URL" : newItemType === "color" ? "Hex color (e.g. #D4A574)" : newItemType === "text" ? "Your text" : "URL",
            value: newItemContent,
            onChange: (e) => setNewItemContent(e.target.value)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: addItem, className: "w-full", children: "Add" })
      ] })
    ] }) })
  ] }) });
};
export {
  MoodBoard as default
};
