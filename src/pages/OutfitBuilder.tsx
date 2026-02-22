import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shirt, Save, Trash2, RotateCcw, GripVertical, X, ZoomIn, ZoomOut, Move } from "lucide-react";

interface ClosetItem {
  id: string;
  name: string | null;
  category: string;
  color: string | null;
  photo_url: string | null;
}

interface CanvasItem {
  itemId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 600;

const OutfitBuilder = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [closetItems, setClosetItems] = useState<ClosetItem[]>([]);
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [outfitName, setOutfitName] = useState("");
  const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const nextZIndex = useRef(1);
  const [categoryFilter, setCategoryFilter] = useState("All");

  useEffect(() => {
    if (!user) return;
    supabase.from("clothing_items").select("id, name, category, color, photo_url").eq("user_id", user.id)
      .then(({ data }) => { if (data) setClosetItems(data); });
  }, [user]);

  const categories = ["All", ...Array.from(new Set(closetItems.map((i) => i.category)))];
  const filteredItems = categoryFilter === "All" ? closetItems : closetItems.filter((i) => i.category === categoryFilter);

  const addToCanvas = (itemId: string) => {
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
        zIndex: nextZIndex.current++,
      },
    ]);
  };

  const removeFromCanvas = (itemId: string) => {
    setCanvasItems((prev) => prev.filter((ci) => ci.itemId !== itemId));
    if (selectedItem === itemId) setSelectedItem(null);
  };

  const updateCanvasItem = (itemId: string, updates: Partial<CanvasItem>) => {
    setCanvasItems((prev) =>
      prev.map((ci) => (ci.itemId === itemId ? { ...ci, ...updates } : ci))
    );
  };

  const handleCanvasDragStart = (e: React.MouseEvent | React.TouchEvent, itemId: string) => {
    e.preventDefault();
    setSelectedItem(itemId);
    updateCanvasItem(itemId, { zIndex: nextZIndex.current++ });

    const startPos = "touches" in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
    const item = canvasItems.find((ci) => ci.itemId === itemId);
    if (!item) return;
    const startItemPos = { x: item.x, y: item.y };

    const handleMove = (ev: MouseEvent | TouchEvent) => {
      const pos = "touches" in ev ? { x: (ev as TouchEvent).touches[0].clientX, y: (ev as TouchEvent).touches[0].clientY } : { x: (ev as MouseEvent).clientX, y: (ev as MouseEvent).clientY };
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;
      updateCanvasItem(itemId, {
        x: Math.max(0, Math.min(CANVAS_WIDTH - 100, startItemPos.x + dx)),
        y: Math.max(0, Math.min(CANVAS_HEIGHT - 100, startItemPos.y + dy)),
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

  // Drag from sidebar
  const handleSidebarDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
    setDraggingFrom(itemId);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (!itemId) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 50;

    if (canvasItems.find((ci) => ci.itemId === itemId)) {
      updateCanvasItem(itemId, { x: Math.max(0, x), y: Math.max(0, y) });
    } else {
      setCanvasItems((prev) => [
        ...prev,
        { itemId, x: Math.max(0, x), y: Math.max(0, y), scale: 1, rotation: 0, zIndex: nextZIndex.current++ },
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
        name: outfitName || `My Outfit ${new Date().toLocaleDateString()}`,
        description: `Custom outfit with ${canvasItems.length} items`,
        ai_generated: false,
      }).select().single();

      if (error) throw error;

      await supabase.from("outfit_items").insert(
        canvasItems.map((ci) => ({ outfit_id: data.id, clothing_item_id: ci.itemId }))
      );

      toast.success("Outfit saved!");
      setCanvasItems([]);
      setOutfitName("");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const getItemById = (id: string) => closetItems.find((i) => i.id === id);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-2">
            <Move className="h-6 w-6 text-primary" /> Outfit Builder
          </h1>
          <p className="text-muted-foreground font-sans text-sm mt-1 mb-6">
            Drag items from your closet onto the canvas to compose outfits
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Closet Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="glass rounded-xl p-4 sticky top-4">
              <h3 className="font-display text-sm font-bold text-foreground mb-3">Your Closet</h3>

              {/* Category Filter */}
              <div className="flex gap-1 flex-wrap mb-3">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-1 rounded-full text-[10px] font-sans transition-all ${
                      categoryFilter === cat
                        ? "gold-gradient text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredItems.map((item) => {
                  const onCanvas = canvasItems.some((ci) => ci.itemId === item.id);
                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleSidebarDragStart(e, item.id)}
                      onClick={() => !onCanvas && addToCanvas(item.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                        onCanvas
                          ? "bg-primary/10 border border-primary/30"
                          : "bg-secondary/50 hover:bg-secondary border border-transparent"
                      }`}
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <div className="w-8 h-8 rounded bg-secondary flex-shrink-0 overflow-hidden">
                        {item.photo_url ? (
                          <img src={item.photo_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Shirt className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-sans text-foreground truncate">{item.name || "Unnamed"}</p>
                        <p className="text-[10px] text-muted-foreground font-sans capitalize">{item.category}</p>
                      </div>
                      {onCanvas && <span className="text-[9px] text-primary font-sans">✓</span>}
                    </div>
                  );
                })}
                {filteredItems.length === 0 && (
                  <p className="text-xs text-muted-foreground font-sans text-center py-4">No items in closet</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1"
          >
            {/* Toolbar */}
            <div className="flex items-center gap-3 mb-4">
              <Input
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                placeholder="Outfit name..."
                className="bg-secondary border-glass-border max-w-xs font-sans text-sm"
              />
              <div className="flex-1" />
              {selectedItem && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-glass-border"
                    onClick={() => {
                      const item = canvasItems.find((ci) => ci.itemId === selectedItem);
                      if (item) updateCanvasItem(selectedItem, { scale: Math.min(2, item.scale + 0.1) });
                    }}
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-glass-border"
                    onClick={() => {
                      const item = canvasItems.find((ci) => ci.itemId === selectedItem);
                      if (item) updateCanvasItem(selectedItem, { scale: Math.max(0.3, item.scale - 0.1) });
                    }}
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-glass-border"
                    onClick={() => {
                      const item = canvasItems.find((ci) => ci.itemId === selectedItem);
                      if (item) updateCanvasItem(selectedItem, { rotation: item.rotation + 15 });
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-glass-border text-destructive"
                    onClick={() => removeFromCanvas(selectedItem)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
              <Button onClick={saveOutfit} disabled={saving || canvasItems.length === 0} className="gold-gradient text-primary-foreground font-sans text-sm">
                <Save className="h-4 w-4 mr-1" /> Save Outfit
              </Button>
            </div>

            {/* Canvas Area */}
            <div
              ref={canvasRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleCanvasDrop}
              onClick={(e) => {
                if (e.target === canvasRef.current) setSelectedItem(null);
              }}
              className="relative glass rounded-2xl overflow-hidden mx-auto"
              style={{ width: "100%", maxWidth: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
            >
              {/* Grid background */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "radial-gradient(circle, hsl(var(--muted-foreground)) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }} />

              {/* Body outline hint */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <svg viewBox="0 0 200 400" className="h-[80%] opacity-[0.06]" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <ellipse cx="100" cy="50" rx="30" ry="40" />
                  <line x1="100" y1="90" x2="100" y2="240" />
                  <line x1="100" y1="120" x2="40" y2="180" />
                  <line x1="100" y1="120" x2="160" y2="180" />
                  <line x1="100" y1="240" x2="60" y2="380" />
                  <line x1="100" y1="240" x2="140" y2="380" />
                </svg>
              </div>

              {canvasItems.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Shirt className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-sans">Drag items here</p>
                    <p className="text-xs text-muted-foreground/60 font-sans">or click items in your closet</p>
                  </div>
                </div>
              )}

              {canvasItems.map((ci) => {
                const item = getItemById(ci.itemId);
                if (!item) return null;
                const isSelected = selectedItem === ci.itemId;
                return (
                  <div
                    key={ci.itemId}
                    onMouseDown={(e) => handleCanvasDragStart(e, ci.itemId)}
                    onTouchStart={(e) => handleCanvasDragStart(e, ci.itemId)}
                    className={`absolute cursor-move select-none ${
                      isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent" : ""
                    }`}
                    style={{
                      left: ci.x,
                      top: ci.y,
                      width: 100,
                      height: 100,
                      transform: `scale(${ci.scale}) rotate(${ci.rotation}deg)`,
                      transformOrigin: "center center",
                      zIndex: ci.zIndex,
                    }}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden bg-secondary border border-glass-border shadow-lg">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.name || ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-1">
                          <Shirt className="h-6 w-6 text-muted-foreground" />
                          <span className="text-[8px] text-muted-foreground font-sans text-center mt-1 truncate w-full px-1">
                            {item.name || item.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Items on canvas label */}
            {canvasItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {canvasItems.map((ci) => {
                  const item = getItemById(ci.itemId);
                  return (
                    <span
                      key={ci.itemId}
                      className="px-2.5 py-1 rounded-full text-xs font-sans bg-secondary text-foreground flex items-center gap-1"
                    >
                      <Shirt className="h-3 w-3 text-primary" />
                      {item?.name || "Unnamed"}
                      <button onClick={() => removeFromCanvas(ci.itemId)} className="ml-1 text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default OutfitBuilder;
