import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import {
  Plus, Search, Shirt, Trash2, Upload, X, Loader2, Sparkles, CheckCircle, Camera, ChevronRight,
  SlidersHorizontal, Activity, Eye, User, Layers, CalendarDays, Image, Save, FolderOpen, Heart,
  Receipt,
} from "lucide-react";
import Mannequin3D, { type ClothingItem as MannequinClothingItem, type BodyDNA, type PosePreset } from "@/components/app/Mannequin3D";
import { SLOT_MAP, DRESS_REPLACES, type GarmentFit } from "@/components/app/GarmentGeometry";
import type { FabricType } from "@/components/app/FabricMaterials";
import { WardrobeIntelligence } from "@/components/app/WardrobeIntelligence";
import { WardrobeGapAnalysis } from "@/components/app/WardrobeGapAnalysis";

/* Placeholder product images for empty closet sections */
import imgCoatBelted from "@/assets/cal-f-coat-belted.jpg";
import imgShirtClassic from "@/assets/cal-f-shirt-classic.jpg";
import imgTopCami from "@/assets/cal-f-top-cami.jpg";
import imgPantsTailored from "@/assets/cal-f-pants-tailored.jpg";
import imgJeansFlare from "@/assets/cal-f-jeans-flare.jpg";
import imgSkirtMidi from "@/assets/cal-f-skirt-midi.jpg";
import imgShoeHeels from "@/assets/cal-f-shoe-heels.jpg";
import imgShoeBoots from "@/assets/cal-f-shoe-boots.jpg";
import imgAccBag from "@/assets/cal-f-acc-bag.jpg";
import imgAccJewelry from "@/assets/cal-f-acc-jewelry.jpg";
import imgDressMidi from "@/assets/cal-f-dress-midi.jpg";
import imgDressMini from "@/assets/cal-f-dress-mini.jpg";
import imgSunglassesCateye from "@/assets/cal-f-sunglasses-cateye.jpg";

const placeholdersBySection: Record<string, string[]> = {
  "Upper Body": [imgShirtClassic, imgTopCami, imgCoatBelted],
  "Lower Body": [imgPantsTailored, imgJeansFlare, imgSkirtMidi],
  "Shoes": [imgShoeHeels, imgShoeBoots],
  "Accessories": [imgAccBag, imgAccJewelry, imgSunglassesCateye],
  "Dresses": [imgDressMidi, imgDressMini],
  "Other": [],
};
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

// Map closet categories to mannequin categories
const closetToMannequinCategory: Record<string, string> = {
  top: "tops",
  outerwear: "outerwear",
  bottom: "bottoms",
  shoes: "shoes",
  accessory: "hat",
  dress: "dress",
  other: "tops",
};

// Detect bags by name and override category mapping
function getMannequinCategory(category: string, name: string | null): string {
  const nm = (name || "").toLowerCase();
  if (category === "accessory" && (nm.includes("bag") || nm.includes("handbag") || nm.includes("purse") || nm.includes("tote"))) {
    return "bag";
  }
  return closetToMannequinCategory[category] || "tops";
}

const filterPills = ["All", "Upper Body", "Lower Body", "Shoes", "Accessories", "Dresses"];
const uploadCategories = ["top", "bottom", "shoes", "accessory", "outerwear", "dress", "other"];
const seasons = ["spring", "summer", "fall", "winter", "all-season"];

type ClosetTab = "inventory" | "mannequin";
type MannequinPanel = "dna" | "pose" | "trace" | "measure" | null;

const Closet = () => {
  const { user } = useAuth();
  const [flatLayView, setFlatLayView] = useState(false);
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

  // Mannequin state
  const [activeTab, setActiveTab] = useState<ClosetTab>("inventory");
  const [mannequinClothing, setMannequinClothing] = useState<MannequinClothingItem[]>([]);
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dna, setDna] = useState<BodyDNA>({ height: 0.5, shoulder: 0.5, waist: 0.5, hips: 0.5, legLength: 0.5 });
  const [pose, setPose] = useState<PosePreset>("neutral");
  const [activePanel, setActivePanel] = useState<MannequinPanel>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [tracingUrl, setTracingUrl] = useState<string | undefined>();
  const [tracingOpacity, setTracingOpacity] = useState(0.3);
  const [pendingItem, setPendingItem] = useState<ClothingItem | null>(null);
  const [selectedFit, setSelectedFit] = useState<GarmentFit>("regular");
  const [selectedFabric, setSelectedFabric] = useState<FabricType>("default");
  const [showCalendar, setShowCalendar] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [outfitName, setOutfitName] = useState("");
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [savedOutfits, setSavedOutfits] = useState<any[]>([]);
  const [loadingSavedOutfits, setLoadingSavedOutfits] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [scanningReceipt, setScanningReceipt] = useState(false);
  const [cleanBgUrls, setCleanBgUrls] = useState<Record<string, string>>({});
  const cleanBgRequested = useRef<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    if (!user) return;
    const [itemsRes, styleRes] = await Promise.all([
      supabase.from("clothing_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("style_profiles").select("preferences").eq("user_id", user.id).single(),
    ]);
    if (itemsRes.error) toast.error("Failed to load closet items");
    else setItems(itemsRes.data || []);
    const prefs = (styleRes.data?.preferences as any) || {};
    if (prefs.gender === "female") setGender("female");
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Auto-remove backgrounds when flat-lay view is active
  useEffect(() => {
    if (!flatLayView) return;
    const itemsWithPhotos = items.filter((i) => i.photo_url && !cleanBgUrls[i.id] && !cleanBgRequested.current.has(i.id));
    itemsWithPhotos.slice(0, 4).forEach(async (item) => {
      cleanBgRequested.current.add(item.id);
      try {
        const { data, error } = await supabase.functions.invoke("remove-bg", {
          body: { imageUrl: item.photo_url },
        });
        if (!error && data?.image) {
          setCleanBgUrls((prev) => ({ ...prev, [item.id]: data.image }));
        }
      } catch {
        // silently fail — show original photo
      }
    });
  }, [flatLayView, items]);

  // localStorage persistence for mannequin clothing
  const STORAGE_KEY = user ? `mannequin-outfit-${user.id}` : null;

  // Restore from localStorage on mount
  useEffect(() => {
    if (!STORAGE_KEY) return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as MannequinClothingItem[];
        if (Array.isArray(parsed) && parsed.length > 0) setMannequinClothing(parsed);
      }
    } catch {}
  }, [STORAGE_KEY]);

  // Persist on change
  useEffect(() => {
    if (!STORAGE_KEY) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mannequinClothing));
  }, [mannequinClothing, STORAGE_KEY]);

  // Fetch saved mannequin outfits
  const fetchSavedOutfits = useCallback(async () => {
    if (!user) return;
    setLoadingSavedOutfits(true);
    const { data, error } = await supabase
      .from("outfits")
      .select("*")
      .eq("user_id", user.id)
      .not("mannequin_items", "eq", "[]")
      .order("created_at", { ascending: false });
    if (!error) setSavedOutfits(data || []);
    setLoadingSavedOutfits(false);
  }, [user]);

  useEffect(() => { fetchSavedOutfits(); }, [fetchSavedOutfits]);

  const saveOutfit = async () => {
    if (!user || !outfitName.trim() || mannequinClothing.length === 0) return;
    setSavingOutfit(true);
    const { error } = await supabase.from("outfits").insert({
      user_id: user.id,
      name: outfitName.trim(),
      description: `${mannequinClothing.length} items`,
      mannequin_items: mannequinClothing as any,
      ai_generated: false,
    });
    if (error) toast.error("Failed to save outfit");
    else {
      toast.success(`Outfit "${outfitName}" saved!`);
      setOutfitName("");
      setShowSaveDialog(false);
      fetchSavedOutfits();
    }
    setSavingOutfit(false);
  };

  const loadOutfit = (outfit: any) => {
    const items = (outfit.mannequin_items || []) as MannequinClothingItem[];
    setMannequinClothing(items);
    toast.success(`Loaded "${outfit.name}"`);
  };

  const deleteSavedOutfit = async (id: string) => {
    const { error } = await supabase.from("outfits").delete().eq("id", id);
    if (error) toast.error("Failed to delete outfit");
    else {
      setSavedOutfits(prev => prev.filter(o => o.id !== id));
      toast.success("Outfit deleted");
    }
  };

  const toggleFavorite = async (outfit: any) => {
    const newVal = !outfit.is_favorite;
    const { error } = await supabase.from("outfits").update({ is_favorite: newVal }).eq("id", outfit.id);
    if (error) toast.error("Failed to update");
    else setSavedOutfits(prev => prev.map(o => o.id === outfit.id ? { ...o, is_favorite: newVal } : o));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  const analyzeWithAI = async () => {
    setAnalyzing(true);
    try {
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
      toast.success("Details filled. Check and save.");
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
      toast.success("Added. Your closet just got stronger.");
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
    else {
      // Award style points
      await (supabase.from("style_points" as any).insert({ user_id: user.id, points: 5, reason: "Logged wear" }) as any);
      toast.success("Logged. +5 style points.");
    }
  };

  const handleReceiptScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setScanningReceipt(true);
    try {
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const { data, error } = await supabase.functions.invoke("scan-receipt", { body: { imageUrl: imageData } });
      if (error) throw error;
      if (data?.items?.length) {
        for (const item of data.items) {
          await supabase.from("clothing_items").insert({
            user_id: user.id,
            name: item.name || null,
            category: item.category || "other",
            color: item.color || null,
            brand: item.brand || null,
            price: item.price || null,
          });
        }
        toast.success(`Added ${data.items.length} items from receipt! 🧾`);
        fetchItems();
      } else {
        toast.info("No clothing items found on this receipt");
      }
    } catch (err: any) {
      toast.error(err.message || "Receipt scan failed");
    } finally {
      setScanningReceipt(false);
    }
  };

  // Add closet item to mannequin and switch to mannequin tab
  const addToMannequin = (item: ClothingItem) => {
    setPendingItem(item);
    setActiveTab("mannequin");
  };

  // Quick try-on: instantly add to mannequin with defaults and switch tab (with replacement)
  const quickTryOn = (item: ClothingItem) => {
    const mappedCat = getMannequinCategory(item.category, item.name);
    const mapped: MannequinClothingItem = {
      category: mappedCat,
      color: item.color || "navy",
      name: item.name || item.category,
      imageUrl: item.photo_url || undefined,
      fit: "regular",
      fabric: "default",
    };
    setMannequinClothing((prev) => replaceBySlot(prev, mapped));
    setActiveTab("mannequin");
    toast.success(`👗 ${mapped.name} added to mannequin`);
  };

  // Same-category replacement logic
  const replaceBySlot = (current: MannequinClothingItem[], newItem: MannequinClothingItem): MannequinClothingItem[] => {
    const cat = newItem.category;
    const conflictSlots = SLOT_MAP[cat] || [cat];
    // If adding a dress, also remove tops/bottoms/skirts
    const toRemove = cat === "dress"
      ? [...conflictSlots, ...DRESS_REPLACES]
      : conflictSlots;
    const filtered = current.filter(item => !toRemove.includes(item.category));
    return [...filtered, newItem];
  };

  const confirmAddToMannequin = () => {
    if (!pendingItem) return;
    const mappedCat = getMannequinCategory(pendingItem.category, pendingItem.name);
    const mapped: MannequinClothingItem = {
      category: mappedCat,
      color: pendingItem.color || "navy",
      name: pendingItem.name || pendingItem.category,
      imageUrl: pendingItem.photo_url || undefined,
      fit: selectedFit,
      fabric: selectedFabric,
    };
    setMannequinClothing((prev) => replaceBySlot(prev, mapped));
    setPendingItem(null);
    setSelectedFit("regular");
    setSelectedFabric("default");
    toast.success(`Added ${mapped.name} to mannequin`);
  };

  const removeFromMannequin = (index: number) => {
    setMannequinClothing((prev) => prev.filter((_, i) => i !== index));
  };

  const saveToCalendar = async (date: string) => {
    if (!user) return;
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: `Outfit: ${mannequinClothing.map((c) => c.name).join(", ")}`,
      event_date: date,
      occasion: "Planned Outfit",
      notes: `Mannequin outfit with ${mannequinClothing.length} items`,
      outfit_items: mannequinClothing as any,
    });
    if (error) toast.error("Failed to save to calendar");
    else { toast.success("Outfit saved to calendar!"); setShowCalendar(false); }
  };

  const handleTraceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setTracingUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const togglePanel = (p: MannequinPanel) => setActivePanel((prev) => (prev === p ? null : p));

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

  const dnaSliders: { key: keyof BodyDNA; label: string }[] = [
    { key: "height", label: "Height" },
    { key: "shoulder", label: "Shoulders" },
    { key: "waist", label: "Waist" },
    { key: "hips", label: "Hips" },
    { key: "legLength", label: "Leg Length" },
  ];

  const poses: { key: PosePreset; label: string }[] = [
    { key: "neutral", label: "Neutral" },
    { key: "fashion", label: "Fashion" },
    { key: "walking", label: "Walking" },
  ];

  return (
    <AppLayout>
      <div className="px-4 sm:px-5 py-5 max-w-lg mx-auto overflow-x-hidden">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-foreground">Your Closet</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => receiptInputRef.current?.click()}
                disabled={scanningReceipt}
                className="text-xs font-sans font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                {scanningReceipt ? <Loader2 className="w-3 h-3 animate-spin" /> : <Receipt className="w-3 h-3" />}
                Scan Receipt
              </button>
              <input ref={receiptInputRef} type="file" accept="image/*" className="hidden" onChange={handleReceiptScan} />
              <span className="text-xs font-sans font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {items.length} ITEMS
              </span>
            </div>
          </div>
        </motion.div>

        {/* Tab Switch: Inventory / Mannequin */}
        <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-5">
          {([
            { key: "inventory" as ClosetTab, label: "👗 Inventory", icon: Shirt },
            { key: "mannequin" as ClosetTab, label: "🧍 3D Mannequin", icon: User },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-sans font-semibold transition-all ${
                activeTab === key
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ==================== INVENTORY TAB ==================== */}
        {activeTab === "inventory" && (
          <>
            {/* Upload progress */}
            <div className="mb-5 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans text-muted-foreground w-14">Tops</span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((items.filter(i => ["top", "outerwear"].includes(i.category)).length / 4) * 100, 100)}%` }} />
                </div>
                <span className="text-[10px] font-sans text-muted-foreground">
                  {items.filter(i => ["top", "outerwear"].includes(i.category)).length}/4
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans text-muted-foreground w-14">Bottoms</span>
                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((items.filter(i => i.category === "bottom").length / 3) * 100, 100)}%` }} />
                </div>
                <span className="text-[10px] font-sans text-muted-foreground">
                  {items.filter(i => i.category === "bottom").length}/3
                </span>
              </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
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
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
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
              <Input placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border rounded-xl h-10" />
            </div>

            {/* Occasion Outfit Tabs */}
            <div className="mb-5">
              <h2 className="font-sans font-semibold text-foreground text-sm mb-3">My Closet Outfits</h2>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: "Everyday", icon: "☀️" },
                  { label: "Weekend", icon: "🌸" },
                  { label: "Work", icon: "💼" },
                  { label: "Party", icon: "🎉" },
                ].map((tab) => {
                  const count = items.filter(i => i.occasion?.toLowerCase() === tab.label.toLowerCase()).length;
                  return (
                    <button key={tab.label}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors">
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-sans text-[10px] font-semibold text-foreground">{tab.label}</span>
                      <span className="text-[9px] font-sans text-muted-foreground">{count} OUTFITS</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                {filterPills.map((pill) => (
                  <button key={pill} onClick={() => setActiveFilter(pill)}
                    className={`px-4 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all ${
                      activeFilter === pill
                        ? "bg-foreground text-background font-semibold"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}>
                    {pill}
                  </button>
                ))}
              </div>
              <motion.button
                onClick={() => {
                  haptic(flatLayView ? "light" : "medium");
                  setFlatLayView(!flatLayView);
                }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-xl transition-colors flex-shrink-0 ${
                  flatLayView ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
                title="Flat-Lay View"
              >
                <Layers className="w-4 h-4" />
              </motion.button>
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
            ) : flatLayView ? (
              /* ═══ FLAT-LAY MAGAZINE VIEW ═══ */
              <div className="space-y-8">
                {Object.entries(categoryMap).map(([section, { categories }], si) => {
                  const sectionItems = filtered.filter((item) => categories.includes(item.category));
                  if (sectionItems.length === 0) return null;
                  return (
                    <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.08 }}>
                      {/* Section divider */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-px bg-border/60" />
                        <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.2em]">{section}</span>
                        <div className="flex-1 h-px bg-border/60" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {sectionItems.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="rounded-2xl overflow-hidden group"
                            style={{
                              background: "hsl(40 30% 96%)",
                              border: "1px solid hsl(var(--border) / 0.4)",
                              boxShadow: "0 4px 16px -4px hsl(var(--foreground) / 0.06)",
                            }}
                          >
                            <div className="aspect-[3/4] relative flex items-center justify-center p-4">
                              {item.photo_url ? (
                                <img
                                  src={cleanBgUrls[item.id] || item.photo_url}
                                  alt={item.name || ""}
                                  className="w-full h-full object-contain transition-opacity duration-500"
                                  style={{ mixBlendMode: "multiply" }}
                                />
                              ) : (
                                <Shirt className="w-12 h-12 text-muted-foreground/30" />
                              )}
                              {/* Hover actions */}
                              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-end justify-center opacity-0 group-hover:opacity-100 pb-3 gap-1.5">
                                <button
                                  onClick={() => quickTryOn(item)}
                                  className="px-2.5 py-1 rounded-full text-[9px] font-sans font-semibold bg-foreground/90 text-background"
                                >
                                  Try On
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1.5 rounded-full bg-destructive/90 text-destructive-foreground"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="px-3 pb-3">
                              <p className="text-xs font-sans font-semibold text-foreground truncate">{item.name || item.category}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {item.color && (
                                  <div className="w-2.5 h-2.5 rounded-full border border-border/60" style={{ backgroundColor: item.color }} />
                                )}
                                {item.brand && <span className="text-[10px] font-sans text-muted-foreground">{item.brand}</span>}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : activeFilter !== "All" ? (
              <div className="grid grid-cols-3 gap-2">
                <AnimatePresence>
                  {filtered.map((item, i) => (
                    <ItemCard key={item.id} item={item} index={i} onDelete={handleDelete} onWear={handleWornToday} onAddToMannequin={() => addToMannequin(item)} onQuickTryOn={() => quickTryOn(item)} />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(categoryMap).map(([section, { categories }], si) => {
                  const sectionItems = filtered.filter((item) => categories.includes(item.category));
                  const placeholders = placeholdersBySection[section] || [];
                  return (
                    <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-sans font-semibold text-foreground text-sm">{section}</h2>
                        {sectionItems.length > 0 && (
                          <button className="flex items-center gap-1 text-xs text-muted-foreground font-sans hover:text-foreground transition-colors">
                            {sectionItems.length} items <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setUploadOpen(true)}
                          className="aspect-square rounded-xl border border-dashed border-border bg-card flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-[10px] font-sans font-medium text-muted-foreground">New Item</span>
                        </button>
                        {sectionItems.slice(0, 5).map((item, i) => (
                          <ItemCard key={item.id} item={item} index={i} onDelete={handleDelete} onWear={handleWornToday} onAddToMannequin={() => addToMannequin(item)} onQuickTryOn={() => quickTryOn(item)} />
                        ))}
                        {sectionItems.length < 2 && placeholders.slice(0, 2 - sectionItems.length).map((src, i) => (
                          <div key={`ph-${i}`} className="aspect-square rounded-xl overflow-hidden border border-border bg-card relative group cursor-pointer" onClick={() => setUploadOpen(true)}>
                            <img src={src} alt="Example item" className="w-full h-full object-cover opacity-50" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30">
                              <Shirt className="w-6 h-6 text-muted-foreground mb-1" />
                              <span className="text-[9px] font-sans text-muted-foreground text-center px-2">Upload your own items</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
            {/* Wardrobe Intelligence */}
            <div className="mt-6 space-y-4">
              <WardrobeGapAnalysis />
              <WardrobeIntelligence />
            </div>
          </>
        )}

        {/* ==================== MANNEQUIN TAB ==================== */}
        {activeTab === "mannequin" && (
          <div className="-mx-5 -mt-2">
            {/* 3D Scene */}
            <div className="relative bg-gradient-to-b from-secondary/10 to-background" style={{ height: "50vh" }}>
              <Mannequin3D
                gender={gender}
                clothing={mannequinClothing}
                dna={dna}
                pose={pose}
                tracingImageUrl={tracingUrl}
                tracingOpacity={tracingOpacity}
                showMeasurements={showMeasurements}
                className="w-full h-full"
              />

              {/* Gender toggle */}
              <div className="absolute top-3 left-3 flex gap-1 bg-background/80 backdrop-blur rounded-full p-1">
                {(["male", "female"] as const).map((g) => (
                  <button key={g} onClick={() => setGender(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition-colors ${
                      gender === g ? "bg-foreground text-background" : "text-muted-foreground"
                    }`}>
                    {g === "male" ? "♂ Male" : "♀ Female"}
                  </button>
                ))}
              </div>

              {/* Item count badge */}
              <div className="absolute top-3 right-3 bg-background/80 backdrop-blur rounded-full px-3 py-1.5">
                <span className="text-xs font-sans font-semibold text-foreground">
                  {mannequinClothing.length} item{mannequinClothing.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Currently Wearing */}
            <div className="px-4 py-3 border-t border-border">
              <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Currently Wearing
              </h3>
              {mannequinClothing.length === 0 ? (
                <p className="text-xs text-muted-foreground font-sans py-2">No items on mannequin. Use "Try On" to add clothes.</p>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {mannequinClothing.map((item, i) => {
                    const catIcons: Record<string, string> = {
                      tops: "👕", outerwear: "🧥", bottoms: "👖", skirts: "👗", dress: "👗",
                      shoes: "👟", hat: "🎩", accessory: "👜",
                    };
                    const catColors: Record<string, string> = {
                      tops: "hsl(210,70%,55%)", outerwear: "hsl(30,60%,50%)", bottoms: "hsl(240,40%,50%)",
                      skirts: "hsl(330,60%,55%)", dress: "hsl(350,55%,55%)", shoes: "hsl(0,0%,40%)",
                      hat: "hsl(45,70%,50%)", accessory: "hsl(160,50%,45%)",
                    };
                    return (
                      <div key={i} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-secondary/60 group">
                        <span className="text-sm">{catIcons[item.category] || "👕"}</span>
                        <div className="w-4 h-4 rounded-full flex-shrink-0 border border-border"
                          style={{ backgroundColor: item.color || "#6b7b8d" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-sans font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] font-sans text-muted-foreground capitalize">{item.category} • {item.fit || "regular"}</p>
                        </div>
                        <button onClick={() => removeFromMannequin(i)}
                          className="w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-destructive/15 transition-all">
                          <X className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions: Save & Schedule */}
              {mannequinClothing.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(true)}
                    className="rounded-full text-xs px-4 flex-1">
                    <Save className="w-3.5 h-3.5 mr-1.5" /> Save Outfit
                  </Button>
                  <Button size="sm" onClick={() => setShowCalendar(true)}
                    className="rounded-full text-xs px-4 flex-1 bg-primary text-primary-foreground">
                    <CalendarDays className="w-3.5 h-3.5 mr-1.5" /> Schedule
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setMannequinClothing([])}
                    className="rounded-full text-xs px-3 text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* Save outfit dialog */}
              <AnimatePresence>
                {showSaveDialog && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="mt-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                    <p className="text-xs font-sans font-semibold text-foreground mb-2">Save this outfit</p>
                    <Input
                      placeholder="Outfit name, e.g. 'Friday Casual'"
                      value={outfitName}
                      onChange={(e) => setOutfitName(e.target.value)}
                      className="bg-secondary border-border rounded-lg h-9 text-sm mb-2"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1 rounded-lg text-xs" onClick={() => { setShowSaveDialog(false); setOutfitName(""); }}>
                        Cancel
                      </Button>
                      <Button size="sm" className="flex-1 rounded-lg text-xs" onClick={saveOutfit} disabled={savingOutfit || !outfitName.trim()}>
                        {savingOutfit ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                        Save
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-sans text-sm font-semibold text-foreground">
                  <FolderOpen className="w-4 h-4 inline mr-1.5" />
                  Saved Outfits
                </h3>
                {savedOutfits.length > 0 && (
                  <button onClick={() => setShowFavoritesOnly(prev => !prev)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-sans font-semibold transition-all ${
                      showFavoritesOnly ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                    <Heart className={`w-3 h-3 ${showFavoritesOnly ? "fill-primary" : ""}`} />
                    Favorites
                  </button>
                )}
              </div>
              {loadingSavedOutfits ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
              ) : savedOutfits.length === 0 ? (
                <p className="text-xs text-muted-foreground font-sans text-center py-4">
                  No saved outfits yet. Dress the mannequin and save your look!
                </p>
              ) : (() => {
                const displayed = showFavoritesOnly
                  ? [...savedOutfits].filter(o => o.is_favorite).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  : [...savedOutfits].sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                return displayed.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-sans text-center py-4">No favorite outfits yet</p>
                ) : (
                  <div className="space-y-2">
                    {displayed.map((outfit) => {
                      const outfitItems = (outfit.mannequin_items || []) as MannequinClothingItem[];
                      return (
                        <motion.div key={outfit.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group">
                          <div className="flex -space-x-1.5 flex-shrink-0">
                            {outfitItems.slice(0, 4).map((item, i) => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-background"
                                style={{ backgroundColor: item.color || "#6b7b8d" }} />
                            ))}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-sans font-semibold text-foreground truncate">{outfit.name}</p>
                            <p className="text-[10px] text-muted-foreground font-sans">
                              {outfitItems.length} item{outfitItems.length !== 1 ? "s" : ""} • {new Date(outfit.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => toggleFavorite(outfit)}>
                              <Heart className={`w-3.5 h-3.5 transition-colors ${outfit.is_favorite ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => loadOutfit(outfit)}>
                              <FolderOpen className="w-3.5 h-3.5 text-primary" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteSavedOutfit(outfit.id)}>
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Add from closet - item grid */}
            <div className="px-4 py-3 border-t border-border">
              <h3 className="font-sans text-sm font-semibold text-foreground mb-3">
                <Layers className="w-4 h-4 inline mr-1.5" />
                Add from Closet
              </h3>

              {/* Pending item confirmation */}
              <AnimatePresence>
                {pendingItem && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="mb-4 p-4 rounded-xl border border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-3 mb-3">
                      {pendingItem.photo_url ? (
                        <img src={pendingItem.photo_url} alt={pendingItem.name || ""} className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                          <Shirt className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-sans font-semibold text-foreground">{pendingItem.name || pendingItem.category}</p>
                        <p className="text-xs text-muted-foreground font-sans capitalize">{pendingItem.category} • {pendingItem.color || "no color"}</p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-sans font-medium text-foreground mb-2">Garment Fit</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["slim", "regular", "oversized"] as GarmentFit[]).map((f) => (
                          <button key={f} onClick={() => setSelectedFit(f)}
                            className={`py-2 rounded-xl text-xs font-sans font-medium capitalize transition-all ${
                              selectedFit === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                            }`}>
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-sans font-medium text-foreground mb-2">Fabric Type</p>
                      <div className="grid grid-cols-3 gap-2">
                        {(["cotton", "denim", "leather", "wool", "silk", "synthetic", "canvas", "knit", "default"] as FabricType[]).map((f) => (
                          <button key={f} onClick={() => setSelectedFabric(f)}
                            className={`py-1.5 rounded-xl text-[11px] font-sans font-medium capitalize transition-all ${
                              selectedFabric === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                            }`}>
                            {f === "default" ? "Auto" : f}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => setPendingItem(null)}>Cancel</Button>
                      <Button size="sm" className="flex-1 rounded-xl" onClick={confirmAddToMannequin}>
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add to Mannequin
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {items.length === 0 ? (
                <div className="text-center py-8">
                  <Shirt className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-sans">No items in closet yet</p>
                  <Button size="sm" className="mt-3 rounded-full" onClick={() => setActiveTab("inventory")}>
                    Go to Inventory
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {items.map((item) => (
                    <button key={item.id} onClick={() => addToMannequin(item)}
                      className="rounded-xl bg-secondary p-1.5 text-center hover:bg-primary/10 transition-colors">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt={item.name || ""} className="w-full aspect-square rounded-lg object-cover mb-1" />
                      ) : (
                        <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-1">
                          <Shirt className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <p className="text-[9px] font-sans text-foreground truncate">{item.name || item.category}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom toolbar */}
            <div className="flex items-center justify-around px-2 py-2 border-t border-border bg-background">
              {[
                { key: "dna" as MannequinPanel, icon: SlidersHorizontal, label: "Body DNA" },
                { key: "pose" as MannequinPanel, icon: Activity, label: "Pose" },
                { key: "trace" as MannequinPanel, icon: Eye, label: "Trace" },
                { key: "measure" as MannequinPanel, icon: User, label: "Measure" },
              ].map(({ key, icon: Icon, label }) => (
                <button key={key} onClick={() => togglePanel(key)}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                    activePanel === key ? "text-primary" : "text-muted-foreground"
                  }`}>
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-sans font-medium">{label}</span>
                </button>
              ))}
            </div>

            {/* Panels */}
            <AnimatePresence>
              {activePanel && (
                <motion.div key={activePanel} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border bg-background">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-display text-sm font-bold text-foreground">
                      {activePanel === "dna" && "Body DNA"}
                      {activePanel === "pose" && "Pose Presets"}
                      {activePanel === "trace" && "Tracing Mode"}
                      {activePanel === "measure" && "Measurements"}
                    </h3>
                    <button onClick={() => setActivePanel(null)}>
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {activePanel === "dna" && (
                    <div className="p-4 space-y-5">
                      {dnaSliders.map(({ key, label }) => (
                        <div key={key}>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-xs font-sans font-medium text-foreground">{label}</span>
                            <span className="text-xs font-sans text-muted-foreground">{Math.round(dna[key] * 100)}%</span>
                          </div>
                          <Slider value={[dna[key]]} min={0} max={1} step={0.01}
                            onValueChange={([v]) => setDna((prev) => ({ ...prev, [key]: v }))} />
                        </div>
                      ))}
                    </div>
                  )}

                  {activePanel === "pose" && (
                    <div className="p-4 grid grid-cols-3 gap-3">
                      {poses.map(({ key, label }) => (
                        <button key={key} onClick={() => setPose(key)}
                          className={`py-4 rounded-xl font-sans text-sm font-medium transition-all ${
                            pose === key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}>
                          {label}
                        </button>
                      ))}
                    </div>
                  )}

                  {activePanel === "trace" && (
                    <div className="p-4 space-y-4">
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleTraceUpload} />
                      <Button variant="outline" className="w-full rounded-xl" onClick={() => fileInputRef.current?.click()}>
                        <Image className="w-4 h-4 mr-2" />
                        {tracingUrl ? "Change Reference Image" : "Upload Reference Image"}
                      </Button>
                      {tracingUrl && (
                        <>
                          <div>
                            <div className="flex justify-between mb-1.5">
                              <span className="text-xs font-sans font-medium text-foreground">Opacity</span>
                              <span className="text-xs font-sans text-muted-foreground">{Math.round(tracingOpacity * 100)}%</span>
                            </div>
                            <Slider value={[tracingOpacity]} min={0.05} max={0.8} step={0.01}
                              onValueChange={([v]) => setTracingOpacity(v)} />
                          </div>
                          <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={() => setTracingUrl(undefined)}>
                            Remove Overlay
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {activePanel === "measure" && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-sans font-medium text-foreground">Show Measurement Lines</span>
                        <button onClick={() => setShowMeasurements(!showMeasurements)}
                          className={`w-12 h-6 rounded-full transition-colors ${showMeasurements ? "bg-primary" : "bg-secondary"}`}>
                          <div className={`w-5 h-5 rounded-full bg-background shadow transition-transform ${showMeasurements ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Calendar modal */}
            <AnimatePresence>
              {showCalendar && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setShowCalendar(false)}>
                  <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    transition={{ type: "spring", damping: 25 }}
                    className="w-full bg-background rounded-t-2xl p-5" onClick={(e) => e.stopPropagation()}>
                    <h3 className="font-display text-lg font-bold text-foreground mb-3">Schedule This Outfit</h3>
                    <p className="text-sm text-muted-foreground font-sans mb-4">
                      Pick a date to wear this look ({mannequinClothing.length} item{mannequinClothing.length !== 1 ? "s" : ""})
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-4">
                      {Array.from({ length: 7 }, (_, i) => {
                        const d = new Date(); d.setDate(d.getDate() + i);
                        const dateStr = d.toISOString().split("T")[0];
                        return (
                          <button key={dateStr} onClick={() => saveToCalendar(dateStr)}
                            className="flex-shrink-0 w-16 py-3 rounded-xl bg-secondary hover:bg-primary/20 transition-colors text-center">
                            <p className="text-[10px] text-muted-foreground font-sans">{d.toLocaleDateString("en", { weekday: "short" })}</p>
                            <p className="text-lg font-bold text-foreground">{d.getDate()}</p>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

function ItemCard({
  item, index, onDelete, onWear, onAddToMannequin, onQuickTryOn,
}: {
  item: ClothingItem; index: number;
  onDelete: (id: string) => void; onWear: (id: string) => void;
  onAddToMannequin?: () => void;
  onQuickTryOn?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.03 }}
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
        {/* Try On button - always visible at bottom */}
        {onQuickTryOn && (
          <button onClick={onQuickTryOn}
            className="absolute bottom-1.5 left-1.5 right-1.5 py-1 rounded-lg bg-primary/90 text-primary-foreground text-[10px] font-sans font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 backdrop-blur-sm">
            <User className="w-3 h-3" /> Try On
          </button>
        )}
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pb-8">
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
