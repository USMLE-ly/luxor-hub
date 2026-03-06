import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LayoutGrid, Plus, Trash2, Image, Type, Palette, Link2, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BoardItem {
  id: string;
  type: "image" | "color" | "text" | "link";
  content: any;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Board {
  id: string;
  name: string;
  created_at: string;
}

const MoodBoard = () => {
  const { user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemType, setNewItemType] = useState<"image" | "color" | "text" | "link">("image");
  const [newItemContent, setNewItemContent] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchBoards();
  }, [user]);

  const fetchBoards = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("mood_boards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      setBoards(data as Board[]);
      if (data.length > 0 && !activeBoard) {
        setActiveBoard(data[0] as Board);
        fetchItems(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchItems = async (boardId: string) => {
    const { data } = await (supabase as any)
      .from("mood_board_items")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at");
    if (data) {
      setItems((data as any[]).map((d: any) => ({
        id: d.id,
        type: d.type,
        content: d.content,
        x: d.position_x,
        y: d.position_y,
        width: d.width,
        height: d.height,
      })));
    }
  };

  const createBoard = async () => {
    if (!user || !newBoardName.trim()) return;
    const { data, error } = await (supabase as any)
      .from("mood_boards")
      .insert({ user_id: user.id, name: newBoardName.trim() })
      .select()
      .single();
    if (error) toast.error("Failed to create board");
    else {
      toast.success("Board created!");
      setShowNewBoard(false);
      setNewBoardName("");
      setActiveBoard(data as Board);
      setItems([]);
      fetchBoards();
    }
  };

  const deleteBoard = async (id: string) => {
    await (supabase as any).from("mood_board_items").delete().eq("board_id", id);
    const { error } = await (supabase as any).from("mood_boards").delete().eq("id", id);
    if (error) toast.error("Failed to delete board");
    else {
      toast.success("Board deleted");
      if (activeBoard?.id === id) { setActiveBoard(null); setItems([]); }
      fetchBoards();
    }
  };

  const addItem = async () => {
    if (!user || !activeBoard) return;
    let content: any = {};
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
      height: newItemType === "color" ? 80 : newItemType === "text" ? 60 : 180,
    };

    const { data, error } = await (supabase as any).from("mood_board_items").insert(newDbItem).select().single();
    if (error) toast.error("Failed to add item");
    else {
      const d = data as any;
      setItems(prev => [...prev, {
        id: d.id, type: d.type, content: d.content,
        x: d.position_x, y: d.position_y, width: d.width, height: d.height,
      }]);
      setShowAddItem(false);
      setNewItemContent("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !activeBoard) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/moodboard/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("look-photos").upload(path, file);
      if (uploadErr) { toast.error("Upload failed"); return; }
      const { data: urlData } = supabase.storage.from("look-photos").getPublicUrl(path);
      
      const newDbItem = {
        board_id: activeBoard.id, type: "image",
        content: { url: urlData.publicUrl },
        position_x: 20 + Math.random() * 200, position_y: 20 + Math.random() * 200,
        width: 180, height: 180,
      };
      const { data, error } = await (supabase as any).from("mood_board_items").insert(newDbItem).select().single();
      if (!error && data) {
        const d = data as any;
        setItems(prev => [...prev, { id: d.id, type: "image", content: d.content, x: d.position_x, y: d.position_y, width: 180, height: 180 }]);
        toast.success("Image added!");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const deleteItem = async (id: string) => {
    await (supabase as any).from("mood_board_items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragging(itemId);
    setDragOffset({ x: e.clientX - rect.left - item.x, y: e.clientY - rect.top - item.y });
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const newY = Math.max(0, e.clientY - rect.top - dragOffset.y);
    setItems(prev => prev.map(i => i.id === dragging ? { ...i, x: newX, y: newY } : i));
  }, [dragging, dragOffset]);

  const handleMouseUp = useCallback(async () => {
    if (!dragging) return;
    const item = items.find(i => i.id === dragging);
    if (item) {
      await (supabase as any).from("mood_board_items").update({ position_x: item.x, position_y: item.y }).eq("id", item.id);
    }
    setDragging(null);
  }, [dragging, items]);

  const renderItem = (item: BoardItem) => {
    switch (item.type) {
      case "image":
        return <img src={item.content?.url} alt="" className="w-full h-full object-cover rounded-lg" />;
      case "color":
        return <div className="w-full h-full rounded-lg" style={{ backgroundColor: item.content?.hex || "#ccc" }} />;
      case "text":
        return <div className="w-full h-full flex items-center justify-center p-2"><p className="font-sans text-xs text-foreground text-center">{item.content?.text}</p></div>;
      case "link":
        return (
          <a href={item.content?.url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center p-2 bg-secondary/50 rounded-lg">
            <div className="text-center">
              <Link2 className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-sans text-[10px] text-muted-foreground truncate">{item.content?.url}</p>
            </div>
          </a>
        );
      default: return null;
    }
  };

  if (loading) {
    return <AppLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="p-5 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <LayoutGrid className="h-6 w-6 text-primary" /> Mood Boards
            </h1>
            <p className="text-muted-foreground font-sans text-xs mt-0.5">Curate your style inspiration</p>
          </div>
          <Button size="sm" onClick={() => setShowNewBoard(true)} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> New Board</Button>
        </motion.div>

        {/* Board Tabs */}
        {boards.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            {boards.map(board => (
              <button key={board.id}
                onClick={() => { setActiveBoard(board); fetchItems(board.id); }}
                className={`px-4 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeBoard?.id === board.id ? "bg-foreground text-background font-semibold" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}>
                {board.name}
                <button onClick={(e) => { e.stopPropagation(); deleteBoard(board.id); }} className="hover:text-destructive">
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>
        )}

        {/* Canvas */}
        {activeBoard ? (
          <>
            <div className="flex gap-2 mb-3 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => { setNewItemType("image"); setShowAddItem(true); }} className="gap-1.5 text-xs">
                <Image className="w-3.5 h-3.5" /> Image URL
              </Button>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-1.5 text-xs">
                <Image className="w-3.5 h-3.5" /> Upload
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setNewItemType("color"); setShowAddItem(true); }} className="gap-1.5 text-xs">
                <Palette className="w-3.5 h-3.5" /> Color
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setNewItemType("text"); setShowAddItem(true); }} className="gap-1.5 text-xs">
                <Type className="w-3.5 h-3.5" /> Text
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setNewItemType("link"); setShowAddItem(true); }} className="gap-1.5 text-xs">
                <Link2 className="w-3.5 h-3.5" /> Link
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>

            <div
              ref={canvasRef}
              className="relative rounded-2xl border border-border bg-card min-h-[500px] overflow-hidden select-none"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {items.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground font-sans text-sm">Add items to start building your mood board</p>
                </div>
              )}
              {items.map(item => (
                <div
                  key={item.id}
                  className={`absolute group cursor-move rounded-lg border border-border shadow-sm overflow-hidden ${dragging === item.id ? "ring-2 ring-primary z-50" : "hover:ring-1 hover:ring-primary/50"}`}
                  style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
                  onMouseDown={e => handleMouseDown(e, item.id)}
                >
                  {renderItem(item)}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="glass rounded-2xl p-10 text-center">
            <LayoutGrid className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-sans text-sm mb-3">Create a board to start pinning inspiration</p>
            <Button onClick={() => setShowNewBoard(true)}>Create Board</Button>
          </div>
        )}

        {/* New Board Dialog */}
        <Dialog open={showNewBoard} onOpenChange={setShowNewBoard}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="font-display">New Board</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Board name" value={newBoardName} onChange={e => setNewBoardName(e.target.value)} />
              <Button onClick={createBoard} disabled={!newBoardName.trim()} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Item Dialog */}
        <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="font-display">Add {newItemType}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder={
                  newItemType === "image" ? "Image URL" :
                  newItemType === "color" ? "Hex color (e.g. #D4A574)" :
                  newItemType === "text" ? "Your text" : "URL"
                }
                value={newItemContent}
                onChange={e => setNewItemContent(e.target.value)}
              />
              <Button onClick={addItem} className="w-full">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default MoodBoard;
