import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus, Search, Shirt, Trash2, Upload, X, Loader2, Sparkles, CheckCircle, Camera, ChevronRight,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ClothingItem {
  id: string;
  name: string | null;
  category: string;
  color: string | null;
  brand: string | null;
  season: string | null;
  occasion: string | null;
  style: string | null;
  photo_url: string | null;
  notes: string | null;
  price: number | null;
}

const categoryMap: Record<string, { label: string; categories: string[] }> = {
  "Upper Body": { label: "Upper Body", categories: ["top", "outerwear"] },
  "Lower Body": { label: "Lower Body", categories: ["bottom"] },
  "Shoes": { label: "Shoes", categories: ["shoes"] },
  "Accessories": { label: "Accessories", categories: ["accessory"] },
  "Dresses": { label: "Dresses", categories: ["dress"] },
  "Other": { label: "Other", categories: ["other"] },
};

const filterPills = ["All", "Upper Body", "Lower Body", "Shoes", "Accessories", "Dresses"];
const uploadCategories = ["top", "bottom", "shoes", "accessory", "outerwear", "dress", "other"];
const seasons = ["spring", "summer", "fall", "winter", "all-season"];

const Closet = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "", category: "top", color: "", brand: "", season: "all-season", occasion: "", style: "", notes: "", price: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("clothing_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to load closet items");
    else setItems(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const analyzeWithAI = async () => {
    setAnalyzing(true);
    try {
      // Convert file to base64 to avoid sending blob: URLs the AI gateway can't access
      let imageData = previewUrl;
      if (selectedFile) {
        imageData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }
      const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ imageUrl: imageData, itemName: newItem.name }),
      });
      if (!resp.ok) throw new Error("Analysis failed");
      const analysis = await resp.json();
      setNewItem((prev) => ({
        ...prev,
        category: analysis.category || prev.category,
        color: analysis.color || prev.color,
        style: analysis.style || prev.style,
        season: analysis.season || prev.season,
        occasion: analysis.occasion || prev.occasion,
        name: prev.name || analysis.suggestedName || prev.name,
      }));
      toast.success("AI analysis complete!");
    } catch { toast.error("AI analysis failed. Fill in details manually."); }
    finally { setAnalyzing(false); }
  };

  const handleUpload = async () => {
    if (!user) return;
    setUploading(true);
    try {
      let photoUrl: string | null = null;
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("clothing-photos").upload(filePath, selectedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("clothing-photos").getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from("clothing_items").insert({
        user_id: user.id, name: newItem.name || null, category: newItem.category,
        color: newItem.color || null, brand: newItem.brand || null, season: newItem.season || null,
        occasion: newItem.occasion || null, style: newItem.style || null, notes: newItem.notes || null,
        price: newItem.price ? parseFloat(newItem.price) : null, photo_url: photoUrl,
      });
      if (error) throw error;
      toast.success("Item added to your closet!");
      setUploadOpen(false);
      setNewItem({ name: "", category: "top", color: "", brand: "", season: "all-season", occasion: "", style: "", notes: "", price: "" });
      setSelectedFile(null); setPreviewUrl(null); fetchItems();
    } catch (err: any) { toast.error(err.message); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("clothing_items").delete().eq("id", id);
    if (error) toast.error("Failed to delete item");
    else { setItems((prev) => prev.filter((item) => item.id !== id)); toast.success("Item removed"); }
  };

  const handleWornToday = async (itemId: string) => {
    if (!user) return;
    const { error } = await supabase.from("wear_logs").insert({ user_id: user.id, clothing_item_id: itemId });
    if (error) toast.error("Failed to log wear");
    else toast.success("Marked as worn today! 👕");
  };

  // Filter items
  const filtered = items.filter((item) => {
    const matchesSearch = !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeFilter === "All") return matchesSearch;
    const cats = categoryMap[activeFilter]?.categories || [];
    return matchesSearch && cats.includes(item.category);
  });

  // Group items by section
  const groupedItems = Object.entries(categoryMap).reduce((acc, [section, { categories }]) => {
    const sectionItems = filtered.filter((item) => categories.includes(item.category));
    if (sectionItems.length > 0) acc[section] = sectionItems;
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  return (
    <AppLayout>
      <div className="px-5 py-5 max-w-lg mx-auto">
        {/* Header with item counter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-foreground">My Closet</h1>
            <span className="text-xs font-sans font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
              {items.length} / 7 ITEMS UPLOADED
            </span>
          </div>
          {/* Upload progress */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans text-muted-foreground w-14">Tops</span>
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min((items.filter(i => ["top", "outerwear"].includes(i.category)).length / 4) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-sans text-muted-foreground">
                {items.filter(i => ["top", "outerwear"].includes(i.category)).length}/4
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans text-muted-foreground w-14">Bottoms</span>
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min((items.filter(i => i.category === "bottom").length / 3) * 100, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-sans text-muted-foreground">
                {items.filter(i => i.category === "bottom").length}/3
              </span>
            </div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <p className="font-sans font-semibold text-sm text-foreground">New Item</p>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">Add manually</p>
              </motion.button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-display text-xl">Add Clothing Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {/* Photo upload */}
                <div>
                  <Label className="font-sans text-sm text-muted-foreground">Photo</Label>
                  {previewUrl ? (
                    <div className="relative mt-2">
                      <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                      <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 p-1 bg-background/80 rounded-full">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="mt-2 flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground font-sans">Upload photo</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>
                <Button variant="outline" onClick={analyzeWithAI} disabled={analyzing || (!previewUrl && !newItem.name)} className="w-full border-primary/30 text-primary hover:bg-primary/10 font-sans">
                  {analyzing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {analyzing ? "Analyzing..." : "Auto-detect with AI"}
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Name</Label>
                    <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Blue Oxford Shirt" className="bg-secondary border-border mt-1" />
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Category</Label>
                    <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                      <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {uploadCategories.map((c) => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Color</Label>
                    <Input value={newItem.color} onChange={(e) => setNewItem({ ...newItem, color: e.target.value })} placeholder="Navy" className="bg-secondary border-border mt-1" />
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Brand</Label>
                    <Input value={newItem.brand} onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })} placeholder="Zara" className="bg-secondary border-border mt-1" />
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Season</Label>
                    <Select value={newItem.season} onValueChange={(v) => setNewItem({ ...newItem, season: v })}>
                      <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{seasons.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Price</Label>
                    <Input type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} placeholder="49.99" className="bg-secondary border-border mt-1" />
                  </div>
                </div>
                <Button onClick={handleUpload} disabled={uploading} className="w-full gold-gradient text-primary-foreground font-sans">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add to Closet
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setUploadOpen(true)}
            className="rounded-2xl border border-border bg-card p-4 text-left hover:border-primary/40 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <p className="font-sans font-semibold text-sm text-foreground">Upload Items</p>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">Scan with AI</p>
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary border-border rounded-xl h-10"
          />
        </div>

        {/* Occasion Outfit Tabs */}
        <div className="mb-5">
          <h2 className="font-sans font-semibold text-foreground text-sm mb-3">My Closet Outfits</h2>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Everyday", icon: "☀️", color: "hsl(142, 60%, 45%)" },
              { label: "Weekend", icon: "🌸", color: "hsl(330, 60%, 55%)" },
              { label: "Work", icon: "💼", color: "hsl(30, 80%, 55%)" },
              { label: "Party", icon: "🎉", color: "hsl(270, 60%, 55%)" },
            ].map((tab) => {
              const count = items.filter(i => i.occasion?.toLowerCase() === tab.label.toLowerCase()).length;
              return (
                <button
                  key={tab.label}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors"
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-sans text-[10px] font-semibold text-foreground">{tab.label}</span>
                  <span className="text-[9px] font-sans text-muted-foreground">{count} OUTFITS</span>
                </button>
              );
            })}
          </div>
          <div className="rounded-xl border border-dashed border-border p-6 flex flex-col items-center justify-center text-center">
            <Shirt className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground font-sans">Add your items to create outfits</p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
          {filterPills.map((pill) => (
            <button
              key={pill}
              onClick={() => setActiveFilter(pill)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all ${
                activeFilter === pill
                  ? "bg-foreground text-background font-semibold"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Items */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Shirt className="h-14 w-14 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-display text-lg text-foreground mb-1.5">
              {items.length === 0 ? "Your closet is empty" : "No items match"}
            </h3>
            <p className="text-muted-foreground font-sans text-xs mb-5">
              {items.length === 0 ? "Start by adding your first clothing item" : "Try adjusting your search or filters"}
            </p>
            {items.length === 0 && (
              <Button onClick={() => setUploadOpen(true)} className="gold-gradient text-primary-foreground font-sans text-sm h-10 px-5">
                <Plus className="h-4 w-4 mr-2" /> Add Your First Item
              </Button>
            )}
          </motion.div>
        ) : activeFilter !== "All" ? (
          /* Flat grid when filtering */
          <div className="grid grid-cols-3 gap-2">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <ItemCard key={item.id} item={item} index={i} onDelete={handleDelete} onWear={handleWornToday} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Grouped sections */
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([section, sectionItems], si) => (
              <motion.div
                key={section}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: si * 0.1 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-sans font-semibold text-foreground text-sm">{section}</h2>
                  <button className="flex items-center gap-1 text-xs text-muted-foreground font-sans hover:text-foreground transition-colors">
                    {sectionItems.length} items <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {sectionItems.slice(0, 6).map((item, i) => (
                    <ItemCard key={item.id} item={item} index={i} onDelete={handleDelete} onWear={handleWornToday} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

function ItemCard({
  item, index, onDelete, onWear,
}: {
  item: ClothingItem; index: number;
  onDelete: (id: string) => void; onWear: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className="rounded-xl overflow-hidden group bg-card border border-border"
    >
      <div className="aspect-square bg-secondary relative">
        {item.photo_url ? (
          <img src={item.photo_url} alt={item.name || "Item"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button onClick={() => onWear(item.id)} className="p-1.5 rounded-full bg-primary/80 text-primary-foreground hover:bg-primary transition-colors">
            <CheckCircle className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="p-2">
        <p className="font-sans text-xs font-medium text-foreground truncate">{item.name || "Unnamed"}</p>
        <p className="text-[10px] text-muted-foreground font-sans capitalize">{item.category}</p>
      </div>
    </motion.div>
  );
}

export default Closet;
