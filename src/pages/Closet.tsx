import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus, Search, Filter, Shirt, Trash2, Upload, X, Edit2, Loader2,
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

const categories = ["All", "top", "bottom", "shoes", "accessory", "outerwear", "dress", "other"];
const seasons = ["spring", "summer", "fall", "winter", "all-season"];

const Closet = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    if (error) {
      toast.error("Failed to load closet items");
    } else {
      setItems(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!user) return;
    setUploading(true);
    try {
      let photoUrl: string | null = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("clothing-photos")
          .upload(filePath, selectedFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("clothing-photos")
          .getPublicUrl(filePath);
        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("clothing_items").insert({
        user_id: user.id,
        name: newItem.name || null,
        category: newItem.category,
        color: newItem.color || null,
        brand: newItem.brand || null,
        season: newItem.season || null,
        occasion: newItem.occasion || null,
        style: newItem.style || null,
        notes: newItem.notes || null,
        price: newItem.price ? parseFloat(newItem.price) : null,
        photo_url: photoUrl,
      });

      if (error) throw error;
      toast.success("Item added to your closet!");
      setUploadOpen(false);
      setNewItem({ name: "", category: "top", color: "", brand: "", season: "all-season", occasion: "", style: "", notes: "", price: "" });
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchItems();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("clothing_items").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete item");
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item removed");
    }
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.color?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">My Closet</h1>
            <p className="text-muted-foreground font-sans text-sm mt-1">{items.length} items in your wardrobe</p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gold-gradient text-primary-foreground font-sans">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-glass-border max-w-md max-h-[90vh] overflow-y-auto">
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
                    <label className="mt-2 flex flex-col items-center justify-center h-32 border-2 border-dashed border-glass-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground font-sans">Upload photo</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Name</Label>
                    <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Blue Oxford Shirt" className="bg-secondary border-glass-border mt-1" />
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Category</Label>
                    <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
                      <SelectTrigger className="bg-secondary border-glass-border mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.filter((c) => c !== "All").map((c) => (
                          <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Color</Label>
                    <Input value={newItem.color} onChange={(e) => setNewItem({ ...newItem, color: e.target.value })} placeholder="Navy" className="bg-secondary border-glass-border mt-1" />
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Brand</Label>
                    <Input value={newItem.brand} onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })} placeholder="Zara" className="bg-secondary border-glass-border mt-1" />
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Season</Label>
                    <Select value={newItem.season} onValueChange={(v) => setNewItem({ ...newItem, season: v })}>
                      <SelectTrigger className="bg-secondary border-glass-border mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {seasons.map((s) => (
                          <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-sans text-sm text-muted-foreground">Price</Label>
                    <Input type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} placeholder="49.99" className="bg-secondary border-glass-border mt-1" />
                  </div>
                </div>

                <Button onClick={handleUpload} disabled={uploading} className="w-full gold-gradient text-primary-foreground font-sans">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Add to Closet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-glass-border"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans transition-all ${
                  categoryFilter === cat
                    ? "gold-gradient text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "All" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Shirt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-xl text-foreground mb-2">
              {items.length === 0 ? "Your closet is empty" : "No items match your filters"}
            </h3>
            <p className="text-muted-foreground font-sans text-sm mb-6">
              {items.length === 0 ? "Start by adding your first clothing item" : "Try adjusting your search or filters"}
            </p>
            {items.length === 0 && (
              <Button onClick={() => setUploadOpen(true)} className="gold-gradient text-primary-foreground font-sans">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl overflow-hidden group"
                >
                  <div className="aspect-square bg-secondary relative">
                    {item.photo_url ? (
                      <img src={item.photo_url} alt={item.name || "Clothing item"} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Shirt className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-full bg-destructive/80 text-destructive-foreground hover:bg-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-sans text-sm font-medium text-foreground truncate">{item.name || "Unnamed"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-primary font-sans capitalize">{item.category}</span>
                      {item.color && <span className="text-xs text-muted-foreground font-sans">• {item.color}</span>}
                    </div>
                    {item.brand && <p className="text-xs text-muted-foreground font-sans mt-1">{item.brand}</p>}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Closet;
