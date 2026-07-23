import { getApiUrl } from "@/lib/api";
import React from "react";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { usePlanTier } from "@/hooks/usePlanTier";
import { PLAN_LIMITS } from "@/lib/planRestrictions";
import { motion, AnimatePresence } from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/ui/scroll-reveal";
import { EmptyWardrobe, EmptySearch } from "@/components/ui/luxury-empty-state";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { storeWardrobeItem } from "@/lib/supermemory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { haptic } from "@/lib/haptics";
import {Plus, MagnifyingGlass, TShirt, SlidersHorizontal, TrashSimple, UploadSimple, X, Spinner, Sparkle, CheckCircle, Camera, CaretRight, Sliders, Pulse, Eye, User, StackSimple, CalendarDots, FloppyDisk, FolderOpen, Heart, Receipt, File, Upload} from "@phosphor-icons/react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { fetchSavedOutfits, insertOutfit, deleteOutfit, toggleOutfitFavorite } from "@/lib/outfitService";
import { insertCalendarEvent } from "@/lib/calendarService";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { useWardrobeStore, useWardrobeHydrated, restoreClothingFromIDB, type Category, type ClothingItem as WardrobeClothingItem } from "@/store/useWardrobeStore";
import { loadMannequinModules } from "@/lib/mannequinModules";


import { type BodyDNA, type PosePreset } from "@/components/app/Mannequin3D";


import { WardrobeIntelligence } from "@/components/app/WardrobeIntelligence";
import { WardrobeGapAnalysis } from "@/components/app/WardrobeGapAnalysis";
import { OccasionPicker } from "@/components/app/OccasionPicker";
import { Link } from "react-router-dom";
import { UserFocus } from "@phosphor-icons/react";

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
  "Full Outfits": [],
};
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCreditGuard } from "@/hooks/useCreditGuard";
import { PageCreditBar } from "@/components/app/PageCreditBar";
import { CreditCostBanner } from "@/components/app/CreditCostBanner";

interface ClothingItem {
  id: string;
  name: string | null;
  category: string;
  rawCategory?: string;
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
  "Full Outfits": { label: "Full Outfits", categories: ["full_outfit"] },
};

/** Map a Closet page item to a Zustand ClothingItem for the DressingRoom gallery */
function toWardrobeItem(item: ClothingItem) {
  const cat = (item.category || "").toLowerCase();
  const zustandCat: Category = (["top", "outerwear"].includes(cat) ? "top"
    : ["bottom", "shoes"].includes(cat) ? "bottom"
    : "accessory") as Category;
  return {
    id: item.id,
    name: item.name || "Unnamed",
    category: zustandCat,
    rawCategory: item.category || undefined,
    src: "",
    imageUrl: item.photo_url || undefined,
    photo_url: item.photo_url || undefined,
  };
}

// Map closet categories to mannequin categories
const closetToMannequinCategory: Record<string, string> = {
  top: "tops",
  outerwear: "outerwear",
  bottom: "bottoms",
  shoes: "shoes",
  accessory: "hat",
  dress: "dress",
  full_outfit: "dress",
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

const filterPills = ["All", "Upper Body", "Lower Body", "Shoes", "Accessories", "Dresses", "Full Outfits"];
const uploadCategories = ["top", "bottom", "shoes", "accessory", "outerwear", "dress", "full_outfit", "other"];
const seasons = ["spring", "summer", "fall", "winter", "all-season"];

type MannequinPanel = "dna" | "pose" | "trace" | "measure" | null;

type GarmentFit = "regular" | "slim" | "relaxed";
type FabricType = "default" | "cotton" | "silk" | "denim" | "wool" | "leather";

const CLOSET_CACHE_KEY = "luxor_closet_cache";

function loadCachedCloset(userId: string): ClothingItem[] {
  try {
    const raw = localStorage.getItem(CLOSET_CACHE_KEY + "_" + userId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch { return []; }
}

function saveCachedCloset(userId: string, items: ClothingItem[]) {
  try {
    localStorage.setItem(CLOSET_CACHE_KEY + "_" + userId, JSON.stringify(items));
  } catch {}
}


/** Get Supabase access token for authenticated API calls */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) return { "Authorization": `Bearer ${token}` };
  } catch {}
  return {};
}

const Closet = () => {
  const { user } = useAuth();
  const modulesRef = useRef<Awaited<ReturnType<typeof loadMannequinModules>> | null>(null);
  const hasLoadedCloset = useRef(false);
  // Pre-load 3D modules in background on mount
  useEffect(() => { loadMannequinModules().then(m => { modulesRef.current = m; }); }, []);
  const { handleError } = useErrorHandler();
  const { guard, consume } = useCreditGuard();
  const { tier } = usePlanTier();
  const itemLimit = PLAN_LIMITS[tier].closetItems;
  const [flatLayView, setFlatLayView] = useState(false);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const apiBase = getApiUrl();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [analysisEta, setAnalysisEta] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "", category: "top", color: "", brand: "", season: "all-season", occasion: "", style: "", notes: "", price: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Mannequin state
  const gender = useWardrobeStore((s) => s.gender);
  const setGender = useWardrobeStore((s) => s.setGender);
  const hydrated = useWardrobeHydrated();

  // ── Zustand store hooks (single source of truth) ──
  const toggleClothing = useWardrobeStore((s) => s.toggleClothing);

  const handleGenerateDummy = useCallback(async (itemId: string, category: string) => {
    try {
      let blobUrl: string;
      if (category === "bottom") {
        blobUrl = await modulesRef.current!.dummyGLB.generateDummyPantsGLB();
      } else if (category === "accessory" || category === "shoes") {
        blobUrl = await modulesRef.current!.dummyGLB.generateDummyShoesGLB();
      } else {
        blobUrl = await modulesRef.current!.dummyGLB.generateDummyShirtGLB();
      }
      useWardrobeStore.getState().updateClothingSrc(itemId, blobUrl);

      // Persist to IndexedDB so the model survives page reload
      try {
        const response = await fetch(blobUrl);
        const glbBlob = await response.blob();
        const buffer = await glbBlob.arrayBuffer();
        const { set: idbSet } = await import("idb-keyval");
        await idbSet(`luxor-clothing-${itemId}`, buffer);
      } catch {}

      toast.success("3D model generated! View it on the mannequin.");
    } catch (err) {
      console.error("[CLOSET] Dummy generation failed:", err);
      toast.error("Failed to generate 3D model");
    }
  }, []);
  const addCustomClothing = useWardrobeStore((s) => s.addCustomClothing);
  const removeClothing = useWardrobeStore((s) => s.removeClothing);
  const clearOutfit = useWardrobeStore((s) => s.clearOutfit);
  const syncCatalogItems = useWardrobeStore((s) => s.syncCatalogItems);
  const wardrobeSelected = useWardrobeStore((s) => s.selected);
  const catalogItems = useWardrobeStore((s) => s.catalogItems);

  const closetFilterFn = useCallback((item: ClothingItem, tab: string) => {
    if (tab === "All") return true;
    const cats = categoryMap[tab]?.categories || [];
    return cats.includes(item.category);
  }, []);

  const { query: searchQuery, setQuery: setSearchQuery, activeFilter, setActiveFilter, results: filtered } = useSearchFilter({
    items,
    searchFields: ["name", "brand", "color"],
    filterFn: closetFilterFn,
  });

  // Derived: currently wearing (items where selected[category] matches)
  const currentlyWearing = useMemo(() => {
    return (Object.entries(wardrobeSelected) as [Category, string | null][])
      .filter(([, id]) => id !== null)
      .map(([cat, id]) => catalogItems.find((c) => c.id === id))
      .filter(Boolean);
  }, [wardrobeSelected, catalogItems]);

  // ── Auto-spawn: generate dummy 3D for first wearing item missing src ──
  // Uses empty deps [] to run ONCE on mount — prevents infinite re-render loop.
  const autoSpawnedIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    // Snapshot current store state directly (bypasses stale closures)
    const storeState = useWardrobeStore.getState();
    const { selected, catalogItems } = storeState;
    const wearing = (Object.entries(selected) as [Category, string | null][])
      .filter(([, id]) => id !== null)
      .map(([cat, id]) => catalogItems.find((c) => c.id === id))
      .filter(Boolean);

    const item = wearing.find(
      (i) => (!i.src || i.src.length <= 5) && !autoSpawnedIds.current.has(i.id)
    );
    if (!item) return;
    autoSpawnedIds.current.add(item.id);
    const timer = setTimeout(() => {
      handleGenerateDummy(item.id, item.category);
      toast.info(`Auto-generated 3D placeholder for "${item.name}".`);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

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
  const glbAssignRef = useRef<HTMLInputElement>(null);
  const imageAssignRef = useRef<HTMLInputElement>(null);
  const [assigningItemId, setAssigningItemId] = useState<string | null>(null);

  const handleAssignGLB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !assigningItemId) return;
    const validExts = [".glb", ".gltf"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error(`Invalid file type "${ext}". Please upload a .glb 3D model.`);
      e.target.value = "";
      return;
    }
    const item = currentlyWearing.find((c) => c.id === assigningItemId);
    if (!item) return;
    const glbUrl = await modulesRef.current!.assetResolver.uploadAndAssignGLB(item.name, file);
    useWardrobeStore.getState().updateClothingSrc(assigningItemId, glbUrl);

    // Also persist with the item ID key so restoreClothingFromIDB can find it
    try {
      const buffer = await file.arrayBuffer();
      const { set: idbSet } = await import("idb-keyval");
      await idbSet(`luxor-clothing-${assigningItemId}`, buffer);
    } catch {}

    toast.success(`3D model assigned to "${item.name}"`);
    setAssigningItemId(null);
    e.target.value = "";
  };


  const handleImageTo3D = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !assigningItemId) return;
    const validExts = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      toast.error(`Invalid file type "${ext}". Please upload a JPG, PNG, or WebP image.`);
      e.target.value = "";
      return;
    }
    try {
      toast.info("Generating 3D model from image...");
      const item = currentlyWearing.find((c) => c.id === assigningItemId);
      const category = item?.category || "top";
      const blobUrl = await modulesRef.current!.imageToGLB.generateClothingFromImage(file, category);
      useWardrobeStore.getState().updateClothingSrc(assigningItemId, blobUrl);

      // Persist the generated GLB binary to IndexedDB so it survives page reload
      try {
        const response = await fetch(blobUrl);
        const glbBlob = await response.blob();
        const buffer = await glbBlob.arrayBuffer();
        const { set: idbSet } = await import("idb-keyval");
        await idbSet(`luxor-clothing-${assigningItemId}`, buffer);
      } catch (idbErr) {
        console.warn("[IMAGE-TO-3D] Failed to persist to IndexedDB:", idbErr);
        // Non-fatal — the model still works in this session
      }

      toast.success("3D model generated from image! View it on the mannequin.");
    } catch (err) {
      console.error("[CLOSET] Image-to-3D failed:", err);
      toast.error("Failed to generate 3D model from image");
    }
    setAssigningItemId(null);
    e.target.value = "";
  };

  const fetchItems = useCallback(async (): Promise<ClothingItem[]> => {
    // PRIMARY: Supabase (always works, no backend dependency)
    let supabaseFailed = false;
    try {
      const { data: sbData, error: sbErr } = await supabase
        .from("clothing_items")
        .select("id, name, category, color, photo_url, brand, occasion, price, season, style, notes")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (sbErr) {
        console.warn("[CLOSET] Supabase query error:", sbErr.message);
        supabaseFailed = true;
      } else if (sbData && sbData.length > 0) {
        console.log("[CLOSET] Loaded", sbData.length, "items from Supabase");
        return sbData.map((item: any) => ({
          id: item.id || '',
          name: item.name || null,
          category: item.category || 'other',
          rawCategory: item.category || undefined,
          color: item.color || null,
          brand: item.brand || null,
          season: item.season || null,
          occasion: item.occasion || null,
          style: item.style || null,
          photo_url: item.photo_url || null,
          notes: item.notes || null,
          price: item.price || null,
        }));
      } else {
        console.log("[CLOSET] Supabase returned 0 items, trying Qdrant fallback");
        supabaseFailed = true;
      }
    } catch (sbErr) {
      console.warn("[CLOSET] Supabase fetch failed:", sbErr);
      supabaseFailed = true;
    }
    // FALLBACK: Replit backend (Qdrant) — may fail if backend is sleeping
    try {
      const timeoutPromise = new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), 8000)
      );
      const resp = await Promise.race([
        fetch(apiBase + '/api/v1/closet/list-items?user_id=' + encodeURIComponent(user.id), { headers: await getAuthHeaders() }),
        timeoutPromise,
      ]);
      const data = await resp.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        console.log("[CLOSET] Fallback: loaded", data.items.length, "items from Qdrant");
        // Sync back to Supabase so future reads are fast
        try {
          for (const item of data.items) {
            await supabase.from("clothing_items").upsert({
              id: item.id,
              user_id: user.id,
              name: item.label || item.name || null,
              category: item.category || item.type || 'other',
              color: item.color || null,
              brand: item.brand || null,
              photo_url: item.photo_url || null,
              occasion: item.occasion || null,
              price: item.price || null,
            }, { onConflict: "id" });
          }
        } catch (syncErr) { console.warn("[CLOSET] Qdrant->Supabase sync failed:", syncErr); }
        return data.items.map((item: any) => ({
          id: item.id || '',
          name: item.label || item.name || null,
          category: item.category || item.type || 'other',
          rawCategory: item.category || item.type || undefined,
          color: item.color || null,
          brand: item.brand || null,
          season: item.season || null,
          occasion: item.occasion || null,
          style: item.style || null,
          photo_url: (item.photo_url || item.image_url) ? ((item.photo_url || item.image_url).startsWith("http") ? (item.photo_url || item.image_url) : apiBase + (item.photo_url || item.image_url)) : null,
          notes: item.notes || null,
          price: item.price || null,
        }));
      }
    } catch (err) {
      console.warn("[CLOSET] Qdrant fallback also failed:", err);
    }
    return [];
  }, [user, apiBase]);
  // Fetch closet items — cache-first, then background refresh
  useEffect(() => {
    if (hasLoadedCloset.current) return;
    hasLoadedCloset.current = true;
    if (!user) return;

    // Step 1: Show cached items instantly (no green flash)
    const cached = loadCachedCloset(user.id);
    if (cached.length > 0) {
      setItems(cached);
      setLoading(false);
      syncCatalogItems(cached.map(toWardrobeItem));
      restoreClothingFromIDB();
    }

    // Step 2: Fetch fresh data from API in background
    const loadFresh = async () => {
      try {
        const mapped = await fetchItems();
        if (mapped.length > 0) {
          setItems(mapped);
          setLoadError(null);
          saveCachedCloset(user.id, mapped);
          syncCatalogItems(mapped.map(toWardrobeItem));
          restoreClothingFromIDB();
        } else if (cached.length === 0) {
          // API returned empty AND no cache — truly empty closet
          setItems([]);
          setLoadError(null);
        }
        // If API returned empty but cache had items, keep cache (API might be down)
      } catch (e) {
        console.warn("[CLOSET] API fetch failed, keeping cache:", e);
        if (cached.length === 0) {
          setLoadError("Could not load your closet. Please check your connection.");
        }
      } finally {
        setLoading(false);
      }
    };
    loadFresh();
  }, [user]);

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
    // Zustand store handles persistence — no localStorage load needed
  }, [STORAGE_KEY]);

  // Persistence handled by Zustand store — no localStorage needed


  // ── Restore 3D asset mappings and IndexedDB clothing on mount ──
  useEffect(() => {
    if (hydrated) {
      modulesRef.current?.assetResolver.restoreAssetMappings();
      restoreClothingFromIDB();
    }
  }, [hydrated]);

  // ── Supabase-backed mannequin state persistence ──
  const MANNEQUIN_STATE_LOADED = useRef(false);

  // Load mannequin state from Supabase on mount
  useEffect(() => {
    if (!user || MANNEQUIN_STATE_LOADED.current) return;
    MANNEQUIN_STATE_LOADED.current = true;
    supabase
      .from("mannequin_state")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) { console.warn("[MANNEQUIN] Failed to load state:", error.message); return; }
        if (data) {
          if (data.gender) setGender(data.gender as "male" | "female");
          if (data.dna) setDna(data.dna as BodyDNA);
          if (data.pose) setPose(data.pose as PosePreset);
          if (data.tracing_url) setTracingUrl(data.tracing_url);
          if (typeof data.tracing_opacity === "number") setTracingOpacity(data.tracing_opacity);
          if (typeof data.show_measurements === "boolean") setShowMeasurements(data.show_measurements);
          if (Array.isArray(data.clothing) && data.clothing.length > 0) {
            // Only override if localStorage doesn't have a saved outfit
            const local = localStorage.getItem(STORAGE_KEY || "");
            let localCount = 0;
            try { if (local) localCount = JSON.parse(local).length; } catch {}
            if (!local || localCount === 0) {
              // Load Supabase clothing into Zustand store
              (data.clothing || []).forEach((item: any) => {
                const cat = item.category || "tops";
                const zustandCat: Category = (["tops", "outerwear", "top"].includes(cat) ? "top"
                  : ["bottoms", "skirts", "dress"].includes(cat) ? "bottom"
                  : "accessory") as Category;
                const id = `supabase-${zustandCat}-${(item.name || "").replace(/\s+/g, "-").toLowerCase()}`;
                const resolvedSrc = modulesRef.current?.assetResolver.resolve3DAsset(item.name || "", item.category || "top");
                addCustomClothing({
                  id, name: item.name || "Unknown",
                  src: resolvedSrc || "",
                  category: zustandCat,
                  rawCategory: item.category || undefined,
                  color: item.color, fit: item.fit, fabric: item.fabric,
                  imageUrl: item.imageUrl,
                });
                toggleClothing(zustandCat, id);
              });
            }
          }
        }
      });
  }, [user]);

  // Debounced save to Supabase (3s after last change)
  // Use a serialized string of selected item IDs + src checksums to avoid
  // triggering on every catalogItems reference change (which creates new
  // currentlyWearing arrays even when the actual content is identical).
  const mannequinSaveKey = useMemo(() => {
    return currentlyWearing.map((c) => `${c.id}:${c.src?.length || 0}`).join("|");
  }, [currentlyWearing]);
  useEffect(() => {
    if (!user || !MANNEQUIN_STATE_LOADED.current) return;
    const timer = setTimeout(() => {
      supabase
        .from("mannequin_state")
        .upsert({
          user_id: user.id,
          gender,
          dna: dna as any,
          pose,
          tracing_url: tracingUrl || null,
          tracing_opacity: tracingOpacity,
          show_measurements: showMeasurements,
          clothing: currentlyWearing as any,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" })
        .then(({ error }) => {
          if (error) console.warn("[MANNEQUIN] Failed to save state:", error.message);
        });
    }, 3000);
    return () => clearTimeout(timer);
  }, [user, gender, dna, pose, tracingUrl, tracingOpacity, showMeasurements, mannequinSaveKey]);

  // Fetch saved mannequin outfits
  const loadSavedOutfits = useCallback(async () => {
    if (!user) return;
    setLoadingSavedOutfits(true);
    const data = await fetchSavedOutfits(user.id);
    setSavedOutfits(data);
    setLoadingSavedOutfits(false);
  }, [user]);

  useEffect(() => { loadSavedOutfits(); }, [loadSavedOutfits]);

  const saveOutfit = async () => {
    if (!user || !outfitName.trim() || currentlyWearing.length === 0) return;
    setSavingOutfit(true);
    try {
      const { error } = await insertOutfit({
        user_id: user.id,
        name: outfitName.trim(),
        description: `${currentlyWearing.length} items`,
        mannequin_items: currentlyWearing as any,
        ai_generated: false,
      });
      if (error) toast.error("Failed to save outfit");
      else {
        toast.success(`Outfit "${outfitName}" saved!`);
        setOutfitName("");
        setShowSaveDialog(false);
        fetchSavedOutfits();
      }
    } catch (e) {
      console.warn('[CLOSET] saveOutfit error:', e);
      toast.error('Failed to save outfit');
    }
    setSavingOutfit(false);
  };

  const loadOutfit = (outfit: any) => {
    const items = (outfit.mannequin_items || []) as any[];
    // Clear current outfit first
    clearOutfit();
    // Load items into Zustand store
    items.forEach((item: any) => {
      const cat = item.category || "tops";
      const zustandCat: Category = (["tops", "outerwear", "top"].includes(cat) ? "top"
        : ["bottoms", "skirts", "dress"].includes(cat) ? "bottom"
        : "accessory") as Category;
      const id = `outfit-${zustandCat}-${(item.name || "").replace(/\s+/g, "-").toLowerCase()}-${Date.now()}`;
      const outfitSrc = modulesRef.current?.assetResolver.resolve3DAsset(item.name || "", item.category || "top");
      addCustomClothing({
        id, name: item.name || "Unknown",
        src: outfitSrc || "",
        category: zustandCat,
        rawCategory: item.category || undefined,
        color: item.color, fit: item.fit, fabric: item.fabric,
        imageUrl: item.imageUrl,
      });
      toggleClothing(zustandCat, id);
    });
    toast.success(`Loaded "${outfit.name}"`);
  };

  const deleteSavedOutfit = async (id: string) => {
    try {
      const { error } = await deleteOutfit(id);
      if (error) toast.error("Failed to delete outfit");
      else {
        setSavedOutfits(prev => prev.filter(o => o.id !== id));
        toast.success("Outfit deleted");
      }
    } catch (e) {
      console.warn('[CLOSET] deleteSavedOutfit error:', e);
      toast.error('Failed to delete outfit');
    }
  };

  const toggleFavorite = async (outfit: any) => {
    try {
      const newVal = !outfit.is_favorite;
      const { error } = await toggleOutfitFavorite(outfit.id, newVal);
      if (error) toast.error("Failed to update");
      else setSavedOutfits(prev => prev.map(o => o.id === outfit.id ? { ...o, is_favorite: newVal } : o));
    } catch (e) {
      console.warn('[CLOSET] toggleFavorite error:', e);
      toast.error('Failed to update');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
  };

  // ── Image compression: reduce base64 payload by ~80% before sending to backend ──
  const compressImage = useCallback((dataUrl: string, maxWidth = 600): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      // CRITICAL: register callbacks BEFORE setting src to avoid race with cached images
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(dataUrl); return; } // canvas not available, return original
          const ratio = Math.min(maxWidth / img.width, 1);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        } catch (e) {
          console.warn("[COMPRESS] Canvas error, using original:", e);
          resolve(dataUrl);
        }
      };
      img.onerror = () => {
        console.warn("[COMPRESS] Image load failed, using original");
        resolve(dataUrl);
      };
      img.src = dataUrl;
    });
  }, []);

  // ── Guard against infinite re-triggering (fixes Maximum call stack size exceeded) ──
  const isAnalyzingRef = useRef(false);

  const analyzeWithAI = useCallback(async () => {
    if (!guard("closet_analyze")) return;

    if (isAnalyzingRef.current) {
      console.log("[CRASH GUARD] Analysis already in progress. Blocking retrigger.");
      return;
    }
    isAnalyzingRef.current = true;
    setAnalyzing(true);
    setAnalysisStartTime(Date.now());
    setAnalysisEta(null);
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
      if (!imageData) { toast.error("No image to analyze."); return; }

      // Compress image client-side (~80% reduction)
      const compressed = await compressImage(imageData);
      const rawB64 = compressed.includes(",") ? compressed.split(",")[1] : compressed;
      console.log("[CLOSET-AI] Image compressed:", {
        originalLen: imageData.length,
        compressedLen: compressed.length,
        rawB64Len: rawB64.length,
        hasDataPrefix: imageData.startsWith("data:"),
      });

      // 15-second timeout via AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const apiBase = getApiUrl();
      const authH = await getAuthHeaders();
      const resp = await fetch(apiBase + '/api/v1/closet/analyze-item', {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authH },
        body: JSON.stringify({ image_b64: rawB64, item_name: newItem.name }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!resp.ok) throw new Error(`Analysis failed (HTTP ${resp.status})`);
      const analysis = await resp.json();
      if (analysis.success === false) throw new Error(analysis.error || "AI analysis returned no results");
      setNewItem((prev) => {
        const _cats = ["top","bottom","shoes","accessory","outerwear","dress","other"];
        const _rawCat = (analysis.category || analysis.item_category || "").toLowerCase().replace(/[^a-z]/g, "");
        const _normCat = _cats.includes(_rawCat) ? _rawCat : prev.category;
        const _seasons = ["spring","summer","fall","winter","all-season"];
        const _rawSeason = (analysis.season || "").toLowerCase().replace(/[^a-z]/g, "").replace(/^allseason$/,"all-season");
        const _normSeason = _seasons.includes(_rawSeason) ? _rawSeason : prev.season;
        return {
          ...prev,
          category: _normCat,
          color: analysis.color || analysis.item_color || prev.color,
          style: analysis.style || analysis.item_style || prev.style,
          season: _normSeason,
          occasion: analysis.occasion || prev.occasion,
          name: prev.name || analysis.suggested_name || analysis.item_name || prev.name,
        };
      });
      // Deduct credits for AI fill
      await consume("ai_fill_details");
      toast.success("Details filled. Check and save.");
    } catch (err: any) {
      console.error("[CLOSET-AI] Analysis error:", err?.name, err?.message, err);
      if (err?.name === 'AbortError') {
        toast.error("AI analysis timed out (45s). The image may be too large — try a smaller photo.");
      } else {
        toast.error("AI analysis failed. Fill in details manually. " + (err?.message || ""));
      }
    } finally {
      setTimeout(() => { isAnalyzingRef.current = false; setAnalyzing(false); setAnalysisStartTime(null); }, 2000);
    }
  }, [previewUrl, selectedFile, newItem.name]);


  const handleUpload = async () => {
    if (!user) {
      toast.error("Please sign in to add items.");
      return;
    }
    if (!selectedFile && !newItem.name.trim()) {
      toast.error("Please add a name or upload an image.");
      return;
    }
    if (items.length >= itemLimit) {
      toast.error(`Your ${tier} plan allows up to ${itemLimit} items. Upgrade for more.`);
      return;
    }
    setUploading(true);
    const itemName = newItem.name || selectedFile?.name?.replace(/\.[^/.]+$/, "") || "Unknown item";
    try {
      let image_b64 = "";
      if (selectedFile) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile as Blob);
        });
        // Compress client-side to reduce payload by ~80%
        const compressed = await compressImage(dataUrl);
        image_b64 = compressed.includes(",") ? compressed.split(",")[1] : compressed;
      }
      // Upload image to Supabase Storage if present
      let photoUrl = "";
      if (selectedFile) {
        try {
          const fileExt = selectedFile.name.split('.').pop() || 'jpg';
          const filePath = `closet/${user.id}/${Date.now()}.${fileExt}`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from("closet-images")
            .upload(filePath, selectedFile, { upsert: true });
          if (!uploadErr && uploadData) {
            const { data: urlData } = supabase.storage.from("closet-images").getPublicUrl(filePath);
            photoUrl = urlData?.publicUrl || "";
          }
        } catch (storageErr) {
          console.warn("[CLOSET] Storage upload failed, saving without image:", storageErr);
        }
      }
      // Insert directly into Supabase clothing_items table
      const newItemId = crypto.randomUUID();
      const { error: insertErr } = await supabase.from("clothing_items").insert({
        id: newItemId,
        user_id: user.id,
        name: itemName,
        category: newItem.category || "other",
        color: newItem.color || "",
        brand: newItem.brand || "",
        season: newItem.season || "all-season",
        occasion: newItem.occasion || "",
        style: newItem.style || "",
        notes: newItem.notes || "",
        price: newItem.price ? parseFloat(newItem.price) : null,
        photo_url: photoUrl,
      });
      if (insertErr) throw new Error(insertErr.message || "Failed to save item");
      toast.success("Added. Your closet just got stronger.");
      setUploadOpen(false);
      setNewItem({ name: "", category: "top", color: "", brand: "", season: "all-season", occasion: "", style: "", notes: "", price: "" });
      setSelectedFile(null); setPreviewUrl(null);
      const refreshed = await fetchItems();
      setItems(refreshed);
      if (user) saveCachedCloset(user.id, refreshed);
      syncCatalogItems(refreshed.map(toWardrobeItem));
    } catch (err) { handleError(err, "Upload failed"); }
    finally { setUploading(false); }
  };

  const handleDelete = useCallback(async (id: string) => {
    // Remove from UI immediately for instant feedback
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      if (user) saveCachedCloset(user.id, next);
      return next;
    });
    syncCatalogItems(
      useWardrobeStore.getState().catalogItems.filter((c) => c.id !== id)
    );

    // Delete from Supabase (primary source of truth)
    try {
      const { error } = await supabase.from("clothing_items").delete().eq("id", id);
      if (error) console.warn("[CLOSET] Supabase delete failed:", error.message);
    } catch (sbErr) {
      console.warn("[CLOSET] Supabase delete exception:", sbErr);
    }

    // Also delete from Qdrant (legacy storage)
    try {
      const delAuthH = await getAuthHeaders();
      await fetch(apiBase + "/api/v1/closet/delete-item", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...delAuthH },
        body: JSON.stringify({ id }),
      });
    } catch (qtErr) {
      console.warn("[CLOSET] Qdrant delete failed (non-fatal):", qtErr);
    }

    toast.success("Item removed");
  }, [apiBase, user]);
  const handleClearAll = async () => {
    if (!user) return;
    let loadingToast: string | number | undefined;
    try {
      loadingToast = toast.loading("Clearing closet...");

      // 0. Get the user's Supabase access_token for backend-proxied deletion
      let accessToken = "";
      try {
        const { data: { session } } = await supabase.auth.getSession();
        accessToken = session?.access_token || "";
      } catch (tokErr) {
        console.warn("[CLOSET] Failed to get session token:", tokErr);
      }

      // 1. Delete from Qdrant + Supabase + JSON via backend proxy (single authoritative call)
      let backendOk = false;
      try {
        const backendResp = await fetch(apiBase + '/api/v1/closet/clear-all', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            user_id: user.id, 
            access_token: accessToken,
          }),
        });
        const backendResult = await backendResp.json();
        if (backendResult.error) {
          console.warn("[CLOSET] Backend returned error:", backendResult.error);
        } else if (backendResult.success) {
          backendOk = true;
          if (backendResult.supabase_errors && backendResult.supabase_errors.length > 0) {
            console.warn("[CLOSET] Backend Supabase delete had errors:", backendResult.supabase_errors);
          }
        } else {
          console.warn("[CLOSET] Backend clear-all returned unexpected result:", backendResult);
        }
      } catch (qe) {
        console.warn("[CLOSET] Backend clear warning:", qe);
      }

      // 2. Clear mannequin_state in Supabase (prevents re-restore on next mount)
      try {
        await supabase.from('mannequin_state').delete().eq('user_id', user.id);
      } catch (mnErr) {
        console.warn('[CLOSET] Failed to clear mannequin_state:', mnErr);
      }

      // 3. Clear IndexedDB clothing entries
      try {
        const { keys: idbKeys, del: idbDel } = await import('idb-keyval');
        const allKeys = await idbKeys();
        for (const k of allKeys) {
          if (typeof k === 'string' && (k.startsWith('luxor-clothing-') || k.startsWith('luxor-clothing-mapping-'))) {
            await idbDel(k);
          }
        }
      } catch (idbErr) {
        console.warn('[CLOSET] Failed to clear IndexedDB:', idbErr);
      }

      // 4. Update local state
      setItems([]);

      // 5. Nuclear: kill localStorage BEFORE Zustand to prevent persist rehydration
      try {
        localStorage.removeItem('luxor-wardrobe');
      } catch {}
      useWardrobeStore.getState().resetClosetData();
      syncCatalogItems([]);

      // 6. Reset mount flag so mannequin_state doesn't re-restore immediately
      MANNEQUIN_STATE_LOADED.current = false;

      if (loadingToast) toast.dismiss(loadingToast);
      if (!backendOk) {
        toast.success("Items cleared from this view. They will reappear on refresh if the server couldn't clear them. Use the 'Force Clear' option if needed.");
      } else {
        toast.success("All closet items cleared!");
      }

      // 4. Items have been cleared from Supabase + Qdrant + JSON
      // No page reload needed — state already updated above
    } catch (err) {
      if (loadingToast) toast.dismiss(loadingToast);
      handleError(err, "Failed to clear items");
    }
  };

  const handleWornToday = useCallback(async (itemId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase.from("wear_logs").insert({ user_id: user.id, clothing_item_id: itemId });
      if (error) toast.error("Failed to log wear");
      else {
        // Trophy style points
        try {
          await (supabase.from("style_points" as any).insert({ user_id: user.id, points: 5, reason: "Logged wear" }) as any);
        } catch (spErr) {
          console.warn('[CLOSET] Style points error:', spErr);
        }
        toast.success("Logged. +5 style points.");
      }
    } catch (e) {
      console.warn('[CLOSET] handleWornToday error:', e);
      toast.error('Failed to log wear');
    }
  }, [user]);

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
        const receiptItems = await fetchItems(); setItems(receiptItems);
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
  const addToMannequin = useCallback((item: ClothingItem) => {
    setPendingItem(item);
  }, []);

  // Quick try-on: resolve 3D asset or prompt upload
  const quickTryOn = useCallback((item: ClothingItem) => {
    // Use raw category for Zustand mapping (preserves full_outfit, dress, etc.)
    const rawCat = (item.rawCategory || item.category || "").toLowerCase();
    const zustandCat: Category = (["top", "outerwear"].includes(rawCat) ? "top"
      : ["bottom", "shoes"].includes(rawCat) ? "bottom"
      : "accessory") as Category;
    const itemId = `closet-${zustandCat}-${item.name.replace(/\s+/g, "-").toLowerCase()}`;

    // Try to find a 3D GLB for this item
    const glbPath = modulesRef.current?.assetResolver.resolve3DAsset(item.name, item.category);

    addCustomClothing({
      id: itemId,
      name: item.name || item.category,
      src: glbPath || "",
      category: zustandCat,
      rawCategory: item.category || undefined,
      color: item.color || "navy",
      fit: "regular",
      fabric: "default",
      imageUrl: item.photo_url || undefined,
    });
    toggleClothing(zustandCat, itemId);

    if (glbPath) {
      toast.success(`👗 ${item.name} added to mannequin with 3D model`);
    } else {
      toast.info(`👗 ${item.name} added — assign a .glb file for 3D view`);
    }
  }, [addCustomClothing, toggleClothing, modulesRef]);


  const confirmAddToMannequin = () => {
    if (!pendingItem) return;
    // Use raw category for Zustand mapping (preserves full_outfit, dress, etc.)
    const rawCat = (pendingItem.rawCategory || pendingItem.category || "").toLowerCase();
    const zustandCat: Category = (["top", "outerwear"].includes(rawCat) ? "top"
      : ["bottom", "shoes"].includes(rawCat) ? "bottom"
      : "accessory") as Category;
    const itemId = `closet-${zustandCat}-${pendingItem.name.replace(/\s+/g, "-").toLowerCase()}`;

    const glbPath = modulesRef.current?.assetResolver.resolve3DAsset(pendingItem.name, pendingItem.category);

    addCustomClothing({
      id: itemId,
      name: pendingItem.name || pendingItem.category,
      src: glbPath || "",
      category: zustandCat,
      rawCategory: pendingItem.category || undefined,
      color: pendingItem.color || "navy",
      fit: selectedFit,
      fabric: selectedFabric,
      imageUrl: pendingItem.photo_url || undefined,
    });
    toggleClothing(zustandCat, itemId);
    setPendingItem(null);
    setSelectedFit("regular");
    setSelectedFabric("default");

    if (glbPath) {
      toast.success(`Added ${pendingItem.name} to mannequin with 3D model`);
    } else {
      toast.info(`Added ${pendingItem.name} — assign a .glb file for 3D view`);
    }
  };

  const removeFromMannequin = (item: WardrobeClothingItem) => {
    // Deselect in Zustand store
    const catMap: Record<string, Category> = {
      tops: "top", outerwear: "top", top: "top",
      bottoms: "bottom", skirts: "bottom", dress: "bottom",
      shoes: "accessory", hat: "accessory", accessory: "accessory",
    };
    const zustandCat = catMap[item.category] || "accessory";
    if (wardrobeSelected[zustandCat] === item.id) {
      toggleClothing(zustandCat, item.id);
    }
  };

  const saveToCalendar = async (date: string) => {
    if (!user) return;
    try {
      const { error } = await insertCalendarEvent({
        user_id: user.id,
        title: `Outfit: ${currentlyWearing.map((c) => c.name).join(", ")}`,
        event_date: date,
        event_time: null,
        occasion: "Planned Outfit",
        notes: `Mannequin outfit with ${currentlyWearing.length} items`,
        outfit_items: currentlyWearing as any,
        mannequin_image_url: null,
      });
      if (error) toast.error("Failed to save to calendar");
      else { toast.success("Outfit saved to calendar!"); setShowCalendar(false); }
    } catch (e) {
      console.warn('[CLOSET] saveToCalendar error:', e);
      toast.error('Failed to save to calendar');
    }
  };

  const handleTraceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setTracingUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const togglePanel = (p: MannequinPanel) => setActivePanel((prev) => (prev === p ? null : p));



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
      <PageCreditBar action="closet_analyze" costOverride={3} />
      <ScrollReveal delay={0.1}>
      <div className="px-4 sm:px-5 py-2 max-w-lg mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-3">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold text-foreground">Your Closet</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => receiptInputRef.current?.click()}
                disabled={scanningReceipt}
                className="text-xs font-sans font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                {scanningReceipt ? <Spinner className="w-3 h-3 animate-spin" /> : <Receipt className="w-3 h-3" />}
                Scan Receipt
              </button>
              <input id="receiptScan" ref={receiptInputRef} type="file" accept="image/*" className="hidden" onChange={handleReceiptScan} />
              <span className="text-xs font-sans font-semibold text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                {items.length} ITEMS
              </span>
              <Link
                to="/user-analysis"
                aria-label="User analysis"
                title="User analysis"
                className="text-xs font-sans font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                <UserFocus className="w-3 h-3" />
                Analysis
              </Link>
              {items.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-xs font-sans font-semibold text-destructive bg-destructive/10 px-3 py-1 rounded-full hover:bg-destructive/20 transition-colors">
                      Clear All
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">Clear Your Closet?</AlertDialogTitle>
                      <AlertDialogDescription className="font-sans text-muted-foreground">
                        This will permanently delete all {items.length} items from your closet, 
                        outfits, and calendar events. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="font-sans">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="font-sans bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Yes, Clear Everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </motion.div>

        {/* ==================== INVENTORY TAB ==================== */}
            {/* Upload progress */}
            <div className="mb-3 space-y-1.5">
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
            <StaggerContainer staggerDelay={0.06} className="grid grid-cols-2 gap-2 mb-2 items-stretch">
              <StaggerItem className="contents">
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="w-full rounded-2xl border border-border bg-card p-3 text-left hover:border-primary/40 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                      <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <p className="font-sans font-semibold text-sm text-foreground">Add Piece</p>
                    <p className="text-xs text-muted-foreground font-sans mt-0.5">Upload or snap</p>
                  </motion.button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">New Piece</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 mt-3">
                    <div>
                      <Label className="font-sans text-sm text-muted-foreground">Photo</Label>
                      {previewUrl ? (
                        <div className="relative mt-2">
                          <img loading="lazy" src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                          <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 p-1 bg-background/80 rounded-full">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="closetUpload" className="mt-2 flex flex-col items-center justify-center h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                          <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground font-sans">Snap or upload</span>
                          <input id="closetUpload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </label>
                      )}
                    </div>
                    <Button variant="outline" onClick={analyzeWithAI} disabled={analyzing || (!previewUrl && !newItem.name)} className="w-full border-primary/30 text-primary hover:bg-primary/10 font-sans">
                      {analyzing ? <Spinner className="h-4 w-4 animate-spin mr-2" /> : <Sparkle className="h-4 w-4 mr-2" />}
                      {analyzing ? "Analyzing..." : "Let AI fill the details"} <span className="text-[10px] opacity-50 ml-1">· 2 credits</span>
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="newPieceName" className="font-sans text-sm text-muted-foreground">Name</Label>
                        <Input id="newPieceName" name="newPieceName" autoComplete="off" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Blue Oxford Shirt" className="bg-secondary border-border mt-1" />
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
                        <Label htmlFor="newPieceColor" className="font-sans text-sm text-muted-foreground">Color</Label>
                        <Input id="newPieceColor" name="newPieceColor" autoComplete="off" value={newItem.color} onChange={(e) => setNewItem({ ...newItem, color: e.target.value })} placeholder="Navy" className="bg-secondary border-border mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="newPieceBrand" className="font-sans text-sm text-muted-foreground">Brand</Label>
                        <Input id="newPieceBrand" name="newPieceBrand" autoComplete="off" value={newItem.brand} onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })} placeholder="Zara" className="bg-secondary border-border mt-1" />
                      </div>
                      <div>
                        <Label className="font-sans text-sm text-muted-foreground">Season</Label>
                        <Select value={newItem.season} onValueChange={(v) => setNewItem({ ...newItem, season: v })}>
                          <SelectTrigger className="bg-secondary border-border mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>{seasons.map((s) => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="newPiecePrice" className="font-sans text-sm text-muted-foreground">Price</Label>
                        <Input id="newPiecePrice" name="newPiecePrice" autoComplete="off" type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} placeholder="49.99" className="bg-secondary border-border mt-1" />
                      </div>
                    </div>
                    <Button onClick={handleUpload} disabled={uploading} className="w-full gold-gradient text-primary-foreground font-sans">
                      {uploading ? <Spinner className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      Add to Closet
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              </StaggerItem>

              <StaggerItem className="contents">
              <motion.button
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                onClick={() => setUploadOpen(true)}
                className="w-full rounded-2xl border border-border bg-card p-3 text-left hover:border-primary/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Camera className="w-5 h-5 text-primary" />
                </div>
                <p className="font-sans font-semibold text-sm text-foreground">Upload Pieces</p>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">Snap or upload</p>
              </motion.button>
              </StaggerItem>
            </StaggerContainer>

            {/* Occasion Engine */}
            <OccasionPicker />
            {/* Search */}
            <div className="relative mb-2">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="closet-search" name="search" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary border-border rounded-xl h-10" />
            </div>

            {/* Occasion Outfit Tabs */}
            <div className="mb-2">
              <h2 className="font-sans font-semibold text-foreground text-sm mb-1.5">My Closet Outfits</h2>
              <StaggerContainer staggerDelay={0.05} className="grid grid-cols-4 gap-1.5 mb-2">
                {[
                  { label: "Everyday", icon: "☀️" },
                  { label: "Weekend", icon: "🌸" },
                  { label: "Work", icon: "💼" },
                  { label: "Party", icon: "🎉" },
                ].map((tab) => {
                  const count = items.filter(i => (i.occasion || "").toLowerCase() === (tab.label || "").toLowerCase()).length;
                  return (
                    <StaggerItem key={tab.label} className="contents">
                    <button key={tab.label}
                      className="w-full flex flex-col items-center gap-1 p-2 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors">
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-sans text-[10px] font-semibold text-foreground">{tab.label}</span>
                      <span className="text-[9px] font-sans text-muted-foreground">{count} OUTFITS</span>
                    </button>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 mb-2">
              <StaggerContainer staggerDelay={0.03} className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
                {filterPills.map((pill) => (
                  <StaggerItem key={pill}>
                  <button key={pill} onClick={() => setActiveFilter(pill)}
                    className={`px-4 py-1.5 rounded-full text-xs font-sans whitespace-nowrap transition-all ${
                      activeFilter === pill
                        ? "bg-foreground text-background font-semibold"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}>
                    {pill}
                  </button>
                  </StaggerItem>
                ))}
              </StaggerContainer>
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
                <StackSimple className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Items */}
            {loadError ? (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-center p-6">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-sans font-medium text-foreground mb-2">Unable to load your closet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6 font-sans">{loadError}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20 font-sans text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-20">
                <Spinner className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              items.length === 0 ? (
                <EmptyWardrobe onAdd={() => setUploadOpen(true)} />
              ) : (
                <EmptySearch query={searchQuery} />
              )
            ) : flatLayView ? (
              /* ═══ FLAT-LAY MAGAZINE VIEW ═══ */
              <div className="space-y-5">
                {Object.entries(categoryMap).map(([section, { categories }], si) => {
                  const sectionItems = filtered.filter((item) => categories.includes(item.category));
                  if (sectionItems.length === 0) return null;
                  return (
                    <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.08 }}>
                      {/* Section divider */}
                      <StaggerContainer staggerDelay={0.03} className="flex items-center gap-3 mb-2">
                        <div className="flex-1 h-px bg-border/60" />
                        <span className="text-[10px] font-sans font-semibold text-muted-foreground uppercase tracking-[0.2em]">{section}</span>
                        <div className="flex-1 h-px bg-border/60" />
                      </StaggerContainer>
                      <StaggerContainer staggerDelay={0.04} className="grid grid-cols-2 gap-3">
                        {sectionItems.map((item, i) => (
                          <StaggerItem key={item.id}>
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
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
                                  onError={(e) => {
                                    const target = e.currentTarget;
                                    // Prevent infinite loop
                                    if (target.dataset.fallbackAttempted) {
                                      target.style.display = "none";
                                      const parent = target.parentElement;
                                      if (parent) parent.style.backgroundColor = "#1A1A1A";
                                      return;
                                    }
                                    // Mark fallback as attempted
                                    target.dataset.fallbackAttempted = "true";
                                    // Try the local backend /images/ route as fallback
                                    const currentSrc = target.src;
                                    const filename = currentSrc.split('/').pop();
                                    if (filename && !currentSrc.includes('/images/') && (apiBase || '')) {
                                      const fallbackUrl = apiBase + '/images/' + filename;
                                      console.warn('[CLOSET] Image failed, trying fallback:', fallbackUrl);
                                      target.src = fallbackUrl;
                                    } else {
                                      target.style.display = "none";
                                      const parent = target.parentElement;
                                      if (parent) parent.style.backgroundColor = "#1A1A1A";
                                    }
                                  }}
                                />
                              ) : (
                                <TShirt className="w-12 h-12 text-muted-foreground/30" />
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
                                  <TrashSimple className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="px-3 pb-3">
                              <p className="text-xs font-sans font-semibold text-foreground truncate">{item.name || item.rawCategory || item.category}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {item.color && (
                                  <div className="w-2.5 h-2.5 rounded-full border border-border/60" style={{ backgroundColor: item.color || "#6b7b8d" }} />
                                )}
                                {item.brand && <span className="text-[10px] font-sans text-muted-foreground">{item.brand}</span>}
                              </div>
                            </div>
                          </motion.div>
                          </StaggerItem>
                        ))}
                      </StaggerContainer>
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
              <CreditCostBanner action="closet_analyze" className="mb-3" />
                {Object.entries(categoryMap).map(([section, { categories }], si) => {
                  const sectionItems = filtered.filter((item) => categories.includes(item.category));
                  const placeholders = placeholdersBySection[section] || [];
                  return (
                    <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: si * 0.1 }}>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-sans font-semibold text-foreground text-sm">{section}</h2>
                        {sectionItems.length > 0 && (
                          <button className="flex items-center gap-1 text-xs text-muted-foreground font-sans hover:text-foreground transition-colors">
                            {sectionItems.length} items <CaretRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => setUploadOpen(true)}
                          className="aspect-square rounded-xl border border-dashed border-border bg-card flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-[10px] font-sans font-medium text-muted-foreground">Add Piece</span>
                        </button>
                        {sectionItems.slice(0, 5).map((item, i) => (
                          <ItemCard key={item.id} item={item} index={i} onDelete={handleDelete} onWear={handleWornToday} onAddToMannequin={() => addToMannequin(item)} onQuickTryOn={() => quickTryOn(item)} />
                        ))}
                        {sectionItems.length < 2 && placeholders.slice(0, 2 - sectionItems.length).map((src, i) => (
                          <div key={`ph-${i}`} className="aspect-square rounded-xl overflow-hidden border border-border bg-card relative group cursor-pointer" onClick={() => setUploadOpen(true)}>
                            <img loading="lazy" src={src} alt="Example item" className="w-full h-full object-cover opacity-50" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/30">
                              <TShirt className="w-6 h-6 text-muted-foreground mb-1" />
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

                    {/* Currently Wearing — reads from Zustand store */}
            <div className="px-4 py-3 border-t border-border">
              <h3 className="font-sans text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Currently Wearing
              </h3>
              {currentlyWearing.length === 0 ? (
                <p className="text-xs text-muted-foreground font-sans py-2">No items wearing. Use "Try On" to add clothes.</p>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {currentlyWearing.map((item) => {
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
                      <div key={item.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-secondary/60 group">
                        <span className="text-sm">{catIcons[item.category] || "👕"}</span>
                        <div className="w-4 h-4 rounded-full flex-shrink-0 border border-border"
                          style={{ backgroundColor: item.color || "#6b7b8d" }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-sans font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] font-sans text-muted-foreground capitalize">{item.category} • {item.fit || "regular"}</p>
                        </div>
                        <div className="flex gap-1 items-center">
                          {item.src && item.src.length > 5 ? (
                            <span className="text-[9px] font-sans text-emerald-400 px-1 py-0.5 rounded bg-emerald-500/10" title="3D model loaded">✓ 3D</span>
                          ) : (
                            <>
                              <button onClick={() => handleGenerateDummy(item.id, item.category)}
                                className="text-[10px] font-sans text-emerald-400 hover:text-emerald-300 whitespace-nowrap px-1.5 py-0.5 rounded bg-emerald-500/10"
                                title="Generate a placeholder 3D shape">
                                ✦ 3D
                              </button>
                              <button onClick={() => { setAssigningItemId(item.id); imageAssignRef.current?.click(); }}
                                className="text-[10px] font-sans text-amber-400 hover:text-amber-300 whitespace-nowrap px-1.5 py-0.5 rounded bg-amber-500/10"
                                title="Upload a photo — auto-maps image as 3D texture on garment shape">
                                📸
                              </button>
                              <button onClick={() => { setAssigningItemId(item.id); glbAssignRef.current?.click(); }}
                                className="text-[10px] font-sans text-primary hover:text-primary/80 whitespace-nowrap px-1.5 py-0.5 rounded bg-primary/10"
                                title="Upload a .glb 3D model file">
                                +GLB
                              </button>
                            </>
                          )}
                        </div>
                        <button onClick={() => removeFromMannequin(item)}
                          className="w-6 h-6 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-destructive/15 transition-all">
                          <X className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Hidden GLB file input for "Assign 3D Model" */}
              <input ref={glbAssignRef} type="file" accept=".glb,.gltf" className="hidden" onChange={handleAssignGLB} />
              <input ref={imageAssignRef} type="file" accept=".jpg,.jpeg,.png,.webp" className="hidden" onChange={handleImageTo3D} />

              {/* Actions: Save & Schedule */}
              {currentlyWearing.length > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(true)}
                    className="rounded-full text-xs px-4 flex-1">
                    <FloppyDisk className="w-3.5 h-3.5 mr-1.5" /> Save Outfit
                  </Button>
                  <Button size="sm" onClick={() => setShowCalendar(true)}
                    className="rounded-full text-xs px-4 flex-1 bg-primary text-primary-foreground">
                    <CalendarDots className="w-3.5 h-3.5 mr-1.5" /> Schedule
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => clearOutfit()}
                    className="rounded-full text-xs px-3 text-destructive hover:bg-destructive/10">
                    <TrashSimple className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
        </div>
      </ScrollReveal>
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
          <img loading="lazy" src={item.photo_url} alt={item.name || "Item"} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TShirt className="h-8 w-8 text-muted-foreground" />
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
            <TrashSimple className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="p-2 relative">
        <p className="font-sans text-xs font-medium text-foreground break-words pr-7">{item.name || "Unnamed"}</p>
        <p className="text-[10px] text-muted-foreground font-sans capitalize">{item.category}</p>
        <button onClick={() => onDelete(item.id)} className="absolute top-1 right-1 p-1 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/40 transition-colors sm:hidden" aria-label="Delete item">
          <TrashSimple className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}

export default Closet;

