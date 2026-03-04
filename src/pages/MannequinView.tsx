import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/app/AppLayout";
import Mannequin3D, { type ClothingItem, type BodyDNA, type PosePreset } from "@/components/app/Mannequin3D";
import type { GarmentFit } from "@/components/app/GarmentGeometry";
import type { FabricType } from "@/components/app/FabricMaterials";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft, Plus, X, CalendarDays, Shirt, Image,
  User, Activity, Layers, SlidersHorizontal, Eye,
} from "lucide-react";
import { toast } from "sonner";

type Panel = "dna" | "pose" | "closet" | "trace" | "measure" | null;

const MannequinView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [clothing, setClothing] = useState<ClothingItem[]>([]);
  const [closetItems, setClosetItems] = useState<any[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [showMeasurements, setShowMeasurements] = useState(false);

  // Body DNA
  const [dna, setDna] = useState<BodyDNA>({
    height: 0.5, shoulder: 0.5, waist: 0.5, hips: 0.5, legLength: 0.5,
  });

  // Pose
  const [pose, setPose] = useState<PosePreset>("neutral");

  // Tracing
  const [tracingUrl, setTracingUrl] = useState<string | undefined>();
  const [tracingOpacity, setTracingOpacity] = useState(0.3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [styleRes, closetRes] = await Promise.all([
        supabase.from("style_profiles").select("preferences").eq("user_id", user.id).single(),
        supabase.from("clothing_items").select("*").eq("user_id", user.id).limit(50),
      ]);
      const prefs = (styleRes.data?.preferences as any) || {};
      if (prefs.gender === "female") setGender("female");
      if (closetRes.data) setClosetItems(closetRes.data);
    };
    fetchData();
  }, [user]);

  const [pendingItem, setPendingItem] = useState<any>(null);
  const [selectedFit, setSelectedFit] = useState<GarmentFit>("regular");
  const [selectedFabric, setSelectedFabric] = useState<FabricType>("default");

  const confirmAddItem = () => {
    if (!pendingItem) return;
    const mapped: ClothingItem = {
      category: pendingItem.category || "tops",
      color: pendingItem.color || "navy",
      name: pendingItem.name || pendingItem.category,
      imageUrl: pendingItem.photo_url,
      fit: selectedFit,
      fabric: selectedFabric,
    };
    setClothing((prev) => [...prev, mapped]);
    setPendingItem(null);
    setSelectedFit("regular");
    setSelectedFabric("default");
  };

  const addItem = (item: any) => {
    setPendingItem(item);
  };

  const removeItem = (index: number) => {
    setClothing((prev) => prev.filter((_, i) => i !== index));
  };

  const saveToCalendar = async (date: string) => {
    if (!user) return;
    const { error } = await supabase.from("calendar_events").insert({
      user_id: user.id,
      title: `Outfit: ${clothing.map((c) => c.name).join(", ")}`,
      event_date: date,
      occasion: "Planned Outfit",
      notes: `Mannequin outfit with ${clothing.length} items`,
      outfit_items: clothing as any,
    });
    if (error) toast.error("Failed to save to calendar");
    else {
      toast.success("Outfit saved to calendar!");
      setShowCalendar(false);
    }
  };

  const handleTraceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setTracingUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const togglePanel = (p: Panel) => setActivePanel((prev) => (prev === p ? null : p));

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
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-display text-lg font-bold text-foreground">Style Mannequin</h1>
          <button
            onClick={() => setShowCalendar(true)}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          >
            <CalendarDays className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* 3D Scene */}
        <div className="flex-1 relative bg-gradient-to-b from-secondary/10 to-background">
          <Mannequin3D
            gender={gender}
            clothing={clothing}
            dna={dna}
            pose={pose}
            tracingImageUrl={tracingUrl}
            tracingOpacity={tracingOpacity}
            showMeasurements={showMeasurements}
            className="w-full h-full"
          />

          {/* Gender toggle - top left */}
          <div className="absolute top-3 left-3 flex gap-1 bg-background/80 backdrop-blur rounded-full p-1">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-semibold transition-colors ${
                  gender === g ? "bg-foreground text-background" : "text-muted-foreground"
                }`}
              >
                {g === "male" ? "♂ Male" : "♀ Female"}
              </button>
            ))}
          </div>
        </div>

        {/* Clothing strip */}
        <div className="px-4 py-2 border-t border-border">
          <div className="flex items-center gap-2 mb-1.5">
            <Shirt className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-sans font-semibold text-foreground">Items ({clothing.length})</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {clothing.map((item, i) => (
              <div key={i} className="relative flex-shrink-0 w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <div className="w-7 h-7 rounded-full" style={{ backgroundColor: item.color || "#6b7b8d" }} />
                <button onClick={() => removeItem(i)} className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
                  <X className="w-2.5 h-2.5 text-destructive-foreground" />
                </button>
              </div>
            ))}
            <button
              onClick={() => togglePanel("closet")}
              className="flex-shrink-0 w-12 h-12 rounded-lg border-2 border-dashed border-border flex items-center justify-center"
            >
              <Plus className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Bottom toolbar */}
        <div className="flex items-center justify-around px-2 py-2 border-t border-border bg-background">
          {[
            { key: "dna" as Panel, icon: SlidersHorizontal, label: "Body DNA" },
            { key: "pose" as Panel, icon: Activity, label: "Pose" },
            { key: "closet" as Panel, icon: Layers, label: "Closet" },
            { key: "trace" as Panel, icon: Eye, label: "Trace" },
            { key: "measure" as Panel, icon: User, label: "Measure" },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => togglePanel(key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                activePanel === key ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-sans font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Panels */}
        <AnimatePresence>
          {activePanel && (
            <motion.div
              key={activePanel}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-2xl border-t border-border max-h-[55vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border sticky top-0 bg-background z-10">
                <h3 className="font-display text-sm font-bold text-foreground">
                  {activePanel === "dna" && "Body DNA"}
                  {activePanel === "pose" && "Pose Presets"}
                  {activePanel === "closet" && "Add from Closet"}
                  {activePanel === "trace" && "Tracing Mode"}
                  {activePanel === "measure" && "Measurements"}
                </h3>
                <button onClick={() => setActivePanel(null)}>
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Body DNA Panel */}
              {activePanel === "dna" && (
                <div className="p-4 space-y-5">
                  {dnaSliders.map(({ key, label }) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-xs font-sans font-medium text-foreground">{label}</span>
                        <span className="text-xs font-sans text-muted-foreground">{Math.round(dna[key] * 100)}%</span>
                      </div>
                      <Slider
                        value={[dna[key]]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={([v]) => setDna((prev) => ({ ...prev, [key]: v }))}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl"
                    onClick={() => setDna({ height: 0.5, shoulder: 0.5, waist: 0.5, hips: 0.5, legLength: 0.5 })}
                  >
                    Reset to Default
                  </Button>
                </div>
              )}

              {/* Pose Panel */}
              {activePanel === "pose" && (
                <div className="p-4 grid grid-cols-3 gap-3">
                  {poses.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setPose(key)}
                      className={`py-4 rounded-xl font-sans text-sm font-medium transition-all ${
                        pose === key
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Closet Panel */}
              {activePanel === "closet" && (
                <>
                  {pendingItem ? (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        {pendingItem.photo_url ? (
                          <img src={pendingItem.photo_url} alt={pendingItem.name} className="w-14 h-14 rounded-lg object-cover" />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                            <Shirt className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-sans font-semibold text-foreground">{pendingItem.name || pendingItem.category}</p>
                          <p className="text-xs text-muted-foreground font-sans">{pendingItem.category}</p>
                        </div>
                      </div>

                      {/* Fit selector */}
                      <div>
                        <p className="text-xs font-sans font-medium text-foreground mb-2">Garment Fit</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(["slim", "regular", "oversized"] as GarmentFit[]).map((f) => (
                            <button
                              key={f}
                              onClick={() => setSelectedFit(f)}
                              className={`py-2.5 rounded-xl text-xs font-sans font-medium capitalize transition-all ${
                                selectedFit === f
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                              }`}
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fabric selector */}
                      <div>
                        <p className="text-xs font-sans font-medium text-foreground mb-2">Fabric Type</p>
                        <div className="grid grid-cols-3 gap-2">
                          {(["cotton", "denim", "leather", "wool", "silk", "synthetic", "canvas", "knit", "default"] as FabricType[]).map((f) => (
                            <button
                              key={f}
                              onClick={() => setSelectedFabric(f)}
                              className={`py-2 rounded-xl text-[11px] font-sans font-medium capitalize transition-all ${
                                selectedFabric === f
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                              }`}
                            >
                              {f === "default" ? "Auto" : f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl" onClick={() => setPendingItem(null)}>
                          Back
                        </Button>
                        <Button size="sm" className="flex-1 rounded-xl" onClick={confirmAddItem}>
                          Add to Mannequin
                        </Button>
                      </div>
                    </div>
                  ) : closetItems.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-muted-foreground text-sm font-sans">No items in your closet yet.</p>
                      <Button onClick={() => navigate("/closet")} size="sm" className="mt-3 rounded-full">Go to Closet</Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 p-4">
                      {closetItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => addItem(item)}
                          className="rounded-xl bg-secondary p-2 text-center hover:bg-secondary/80 transition-colors"
                        >
                          {item.photo_url ? (
                            <img src={item.photo_url} alt={item.name} className="w-full aspect-square rounded-lg object-cover mb-1" />
                          ) : (
                            <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-1">
                              <Shirt className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <p className="text-[10px] font-sans text-foreground truncate">{item.name || item.category}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Trace Panel */}
              {activePanel === "trace" && (
                <div className="p-4 space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleTraceUpload}
                  />
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
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
                        <Slider
                          value={[tracingOpacity]}
                          min={0.05}
                          max={0.8}
                          step={0.01}
                          onValueChange={([v]) => setTracingOpacity(v)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive"
                        onClick={() => setTracingUrl(undefined)}
                      >
                        Remove Overlay
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Measurements Panel */}
              {activePanel === "measure" && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-sans font-medium text-foreground">Show Measurement Lines</span>
                    <button
                      onClick={() => setShowMeasurements(!showMeasurements)}
                      className={`w-12 h-6 rounded-full transition-colors ${showMeasurements ? "bg-primary" : "bg-secondary"}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-background shadow transition-transform ${showMeasurements ? "translate-x-6" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground font-sans">
                    Display proportional measurement guidelines on the mannequin for shoulder, waist, hips, and inseam.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar modal */}
        <AnimatePresence>
          {showCalendar && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-end"
              onClick={() => setShowCalendar(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="w-full bg-background rounded-t-2xl p-5"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="font-display text-lg font-bold text-foreground mb-3">Post to Calendar</h3>
                <p className="text-sm text-muted-foreground font-sans mb-4">
                  Pick a date to save this outfit ({clothing.length} items)
                </p>
                <div className="flex gap-2 overflow-x-auto pb-4">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const dateStr = d.toISOString().split("T")[0];
                    const dayName = d.toLocaleDateString("en", { weekday: "short" });
                    const dayNum = d.getDate();
                    return (
                      <button
                        key={dateStr}
                        onClick={() => saveToCalendar(dateStr)}
                        className="flex-shrink-0 w-16 py-3 rounded-xl bg-secondary hover:bg-primary/20 transition-colors text-center"
                      >
                        <p className="text-[10px] text-muted-foreground font-sans">{dayName}</p>
                        <p className="text-lg font-bold text-foreground">{dayNum}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default MannequinView;
