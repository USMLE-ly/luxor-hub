import { useState, useRef, useEffect, useCallback } from "react";
import { canProceed } from "@/lib/rateLimiter";
import { AppLayout } from "@/components/app/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { analyzeOutfitImage } from "@/lib/outfitAnalysis";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Upload, Camera, Shirt, Loader2, History, Save, Trash2, Share2, X,
  Twitter, Link, Check, Download, Clock, Users, Search, ExternalLink,
  ShoppingBag, RefreshCw, Layers, Eye, Plus, AlertTriangle, Star, ChevronLeft
} from "lucide-react";
import { compressImage, formatFileSize } from "@/lib/imageUtils";
import { PrivacyNotice } from "@/components/app/PrivacyNotice";
import { motion, AnimatePresence } from "framer-motion";
import { getErrorMessage } from "@/lib/errors";
import { CosmicAuditCard } from "@/components/app/CosmicAuditCard";
import { DivineUpgradePill } from "@/components/app/DivineUpgradePill";
import { PaletteSwatchStrip, type PaletteSwatch } from "@/components/app/PaletteSwatchStrip";

/* ─── Interfaces ─── */
interface OutfitAnalysisData {
  overallStyle: string;
  styleScore: number;
  summary: string;
  occasionRatings: { occasion: string; score: number; reason: string }[];
  detectedItems: { name: string; category: string; color: string; style: string }[];
  colorPalette: { colors: string[]; harmony: string; rating: string };
  strengths: string[];
  improvements: { suggestion: string; reason: string; priority: string }[];
  seasonalFit: string;
  bodyTypeNotes: string;
}

interface SavedAnalysis {
  id: string;
  image_url: string;
  overall_style: string;
  style_score: number;
  summary: string;
  occasion_ratings: any;
  detected_items: any;
  color_palette: any;
  strengths: any;
  improvements: any;
  seasonal_fit: string;
  body_type_notes: string;
  created_at: string;
}

function savedToAnalysis(s: SavedAnalysis): OutfitAnalysisData {
  return {
    overallStyle: s.overall_style,
    styleScore: s.style_score,
    summary: s.summary,
    occasionRatings: s.occasion_ratings as any,
    detectedItems: s.detected_items as any,
    colorPalette: s.color_palette as any,
    strengths: s.strengths as any,
    improvements: s.improvements as any,
    seasonalFit: s.seasonal_fit,
    bodyTypeNotes: s.body_type_notes,
  };
}

/* ─── Priority Color ─── */
function getPriorityColor(p: string) {
  switch (p.toLowerCase()) {
    case "high": return "text-red-400 border-red-500/40";
    case "medium": return "text-amber-400 border-amber-500/40";
    default: return "text-zinc-400 border-zinc-500/40";
  }
}

/* ─── Time ago ─── */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/* ─── Animated Counter ─── */
function useAnimatedCounter(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const start = performance.now();
    let raf: number;
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - t) * (1 - t); // ease-out quad
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

/* ─── SVG Glowing Score Ring (emilkowalski/skills style) ─── */
function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(score, 100) / 100;
  const offset = circ * (1 - pct);
  const animatedScore = useAnimatedCounter(Math.round(score), 800);
  const color = score >= 85 ? "#22C55E" : score >= 70 ? "#C8A951" : score >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90 drop-shadow-[0_0_12px_rgba(200,169,81,0.3)]">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          filter="url(#glow)"
        />
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
      </svg>
      <motion.span
        className="absolute text-2xl font-bold tracking-tight"
        style={{ color }}
        initial={{ opacity: 0, scale: 1.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        {animatedScore}
      </motion.span>
    </div>
  );
}

/* ─── Glass Capsule Color Swatch (taste-skill style) ─── */
function GlassColorCapsule({ color, label }: { color: string; label?: string }) {
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/10 cursor-pointer select-none"
      style={{ background: `linear-gradient(135deg, ${color}44, rgba(255,255,255,0.03))`, backdropFilter: "blur(16px)" }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <div className="w-8 h-8 rounded-full border border-white/20 shrink-0" style={{ background: color }} />
      {label && <span className="text-xs font-medium text-white/70 uppercase tracking-wider">{label}</span>}
    </motion.div>
  );
}

/* ─── SVG Neon Radar / Polygon Skill Tree ─── */
function NeonRadarChart({ data, onVibeClick }: { 
  data: { occasion: string; score: number; reason: string }[];
  onVibeClick?: (occasion: string, reason: string, x: number, y: number) => void 
}) {
  const chartRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const levels = 4;
  const center = 120;
  const radius = 100;
  const angleStep = (2 * Math.PI) / data.length;

  const getPoint = (i: number, r: number) => {
    const angle = angleStep * i - Math.PI / 2;
    return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  };

  const gridPolygons = Array.from({ length: levels }, (_, l) => {
    const r = (radius / levels) * (l + 1);
    const pts = data.map((_, i) => { const p = getPoint(i, r); return `${p.x},${p.y}`; }).join(" ");
    return pts;
  });

  const dataPoints = data.map((d, i) => getPoint(i, (d.score / 100) * radius));
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(" ");

  const handleNodeClick = (e: React.MouseEvent, d: { occasion: string; reason: string }, i: number) => {
    if (!onVibeClick) return;
    const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
    const parentRect = e.currentTarget.closest('[data-vibe-container]')?.getBoundingClientRect() || document.body.getBoundingClientRect();
    onVibeClick(
      d.occasion,
      d.reason,
      rect.left - parentRect.left + rect.width / 2,
      rect.top - parentRect.top - 10
    );
  };

  return (
    <div ref={containerRef} className="w-full overflow-visible px-2" data-vibe-container>
    <svg ref={chartRef} viewBox="-30 -30 300 300" className="w-full h-auto" style={{ filter: "drop-shadow(0 0 14px rgba(34,211,238,0.2))" }}>
      <defs>
        <filter id="radarGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="nodeGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {gridPolygons.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      ))}
      <motion.polygon
        points={dataPolygon}
        fill="rgba(34,211,238,0.06)"
        stroke="#22D3EE"
        strokeWidth={2}
        filter="url(#radarGlow)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
      {dataPoints.map((p, i) => (
        <g key={i} onClick={(e) => handleNodeClick(e, data[i], i)} className="cursor-pointer" style={{ cursor: 'pointer' }}>
          <motion.circle
            cx={p.x} cy={p.y} r={10} fill="transparent"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          />
          <motion.circle
            cx={p.x} cy={p.y} r={6} fill="rgba(34,211,238,0.15)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          />
          <motion.circle
            cx={p.x} cy={p.y} r={3} fill="#22D3EE" filter="url(#nodeGlow)"
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.05, type: "spring", stiffness: 200, damping: 12 }}
          />
        </g>
      ))}
      {data.map((d, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const labelR = radius + 30;
        const lp = { x: center + labelR * Math.cos(angle), y: center + labelR * Math.sin(angle) };
        return (
          <text
            key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(255,255,255,0.7)" fontSize={8} fontWeight={500}
          >
            {d.occasion.length > 12 ? d.occasion.substring(0, 11) + '..' : d.occasion}
          </text>
        );
      })}
    </svg>
    </div>
  );
}

/* ─── Main Component ─── */

/* ─── Pro Stylist Tweaks — Single Comparison Card ─── */
interface ProStylistTweaksProps {
  originalImage: string;
  expertImage: string | null;
  description: string;
  tag: string;
  tweakError?: string | null;
  onRetry?: () => void;
  source?: "fable5" | "local" | "emergency" | null;
}

const ProStylistTweaks: React.FC<ProStylistTweaksProps> = ({ 
  originalImage, expertImage, description, tag, tweakError, onRetry, source
}) => {
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    if (expertImage) {
      setIsGenerating(false);
    } else if (tweakError) {
      setIsGenerating(false);
    } else {
      const timer = setTimeout(() => setIsGenerating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [expertImage, tweakError]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-zinc-400 uppercase tracking-widest text-sm font-medium flex items-center gap-2">💎 Pro Stylist Tweak</h2>
        {source && (
          <span
            className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border ${
              source === "fable5"
                ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
                : source === "local"
                ? "border-amber-500/40 text-amber-200 bg-amber-500/10"
                : "border-red-500/40 text-red-300 bg-red-500/10"
            }`}
            title={source === "fable5" ? "Generated by Fable 5" : source === "local" ? "Generated by local deterministic stylist" : "Emergency fallback"}
          >
            {source === "fable5" ? "Fable 5" : source === "local" ? "Local Stylist" : "Fallback"}
          </span>
        )}
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Original */}
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800">
            <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full border border-white/10">
              <span className="text-[10px] text-zinc-400 uppercase">Original</span>
            </div>
          </div>

          {/* Right: Dynamic State */}
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800/50">
            {tweakError ? (
              // ERROR STATE: Show retry button
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/20 border border-red-500/30 backdrop-blur-sm">
                <span className="text-4xl mb-2">⚠️</span>
                <p className="text-xs text-red-300 text-center px-4 mb-4">{tweakError}</p>
                <button 
                  onClick={onRetry} 
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-xs hover:bg-white/20 transition"
                >
                  ↻ Retry Generation
                </button>
              </div>
            ) : (!expertImage || isGenerating) ? (
              // LOADING STATE
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90">
                <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-3"></div>
                <p className="text-[10px] text-zinc-400 tracking-widest uppercase flex items-center gap-2">
                  <span className="text-yellow-300">✨</span> Generating
                </p>
              </div>
            ) : (
              // SUCCESS STATE
              <div className="w-full h-full relative">
                <img src={expertImage} alt="Expert Tweak" className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 rounded-full border border-cyan-500/50">
                  <span className="text-[10px] text-cyan-300 uppercase flex items-center gap-1">✨ Expert</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center mt-5 gap-2">
          <span className="text-yellow-300">✨</span>
          <p className="text-zinc-200 font-medium text-base">{description}</p>
          <div className="ml-auto bg-zinc-800/60 border border-yellow-500/20 px-4 py-1.5 rounded-full">
            <span className="text-yellow-200 text-xs uppercase">{tag}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default function OutfitAnalysis() {
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<OutfitAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [styleFilter, setStyleFilter] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [imageCreationUrl, setImageCreationUrl] = useState<string | null>(null);
  const [imageCreationItems, setImageCreationItems] = useState<any[]>([]);
  const [isGeneratingCreation, setIsGeneratingCreation] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [isSavingCreation, setIsSavingCreation] = useState(false);
  const [creationSaved, setCreationSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("analyze");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedVibe, setSelectedVibe] = useState<{ occasion: string; reason: string; x: number; y: number } | null>(null);
  const [historyCarouselIdx, setHistoryCarouselIdx] = useState(0);
  const [stylistTweaks, setStylistTweaks] = useState<{ original: string; tweaked: string; label: string; caption: string }[]>([]);
  const [stylistTweaksLoading, setStylistTweaksLoading] = useState(false);
  const [tweakHoverId, setTweakHoverId] = useState<number | null>(null);

  // ── Pro Stylist Tweak: fetch from microservice ──
  // CHANGE THIS URL if you deploy the backend to the web
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL 
    || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:8767' 
    : import.meta.env.VITE_PUBLIC_API_URL || 'https://python--libyausmle.replit.app');
  const [expertImage, setExpertImage] = useState<string | null>(null);
  const [tweakError, setTweakError] = useState<string | null>(null);
  const [expertSuggestion, setExpertSuggestion] = useState<string | null>(null);
  const [expertSource, setExpertSource] = useState<"fable5" | "local" | "emergency" | null>(null);

  // ── FASHION-OMEGA core audit (runs for EVERY uploaded image) ──
  const [omegaAudit, setOmegaAudit] = useState<string | null>(null);
  const [omegaMissingItem, setOmegaMissingItem] = useState<string | null>(null);
  const [omegaSource, setOmegaSource] = useState<"fable5" | "local" | "emergency" | null>(null);
  const [omegaPalette, setOmegaPalette] = useState<PaletteSwatch[]>([]);
  const [omegaStyleName, setOmegaStyleName] = useState<string>("");
  const [omegaColors, setOmegaColors] = useState<string[]>([]);
  const [omegaItems, setOmegaItems] = useState<string[]>([]);
  const [omegaStrengths, setOmegaStrengths] = useState<string[]>([]);

  const runOmegaAudit = useCallback(async (b64DataUrl: string) => {
    try {
      const image_b64 = b64DataUrl.includes(",") ? b64DataUrl.split(",")[1] : b64DataUrl;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      const resp = await fetch(`${API_BASE_URL}/api/v1/analyze-outfit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_b64 }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!resp.ok) return;
      const data = await resp.json();
      if (!data?.success) return;
      if (typeof data.audit === "string") setOmegaAudit(data.audit);
      if (typeof data.missing_item === "string") setOmegaMissingItem(data.missing_item);
      if (data.source === "fable5" || data.source === "local" || data.source === "emergency") {
        setOmegaSource(data.source);
      }
      if (Array.isArray(data.palette)) {
        setOmegaPalette(
          data.palette.map((c: any) => ({
            hex: String(c.hex || "").toUpperCase(),
            name: String(c.name || ""),
            percentage: typeof c.percentage === "number" ? c.percentage : undefined,
          })),
        );
      }
      // Use OMEGA response as the PRIMARY analysis data
      if (typeof data.style_name === "string") {
        setOmegaStyleName(data.style_name);
      }
      if (Array.isArray(data.actual_colors)) {
        setOmegaColors(data.actual_colors);
      }
      if (Array.isArray(data.items_detected)) {
        setOmegaItems(data.items_detected);
      }
      if (Array.isArray(data.strengths)) {
        setOmegaStrengths(data.strengths);
      }
      // Also populate the main analysis state from OMEGA data
      if (data.style_name || data.actual_colors) {
        setAnalysis({
          overallStyle: data.style_name || "Omega Style",
          styleScore: 85,
          summary: data.audit || "",
          occasionRatings: [],
          detectedItems: (data.items_detected || []).map((name: string, i: number) => ({
            name,
            category: i === 0 ? "Upper Body / Primary" : i === 1 ? "Lower Body / Secondary" : "Accent / Accessory",
            color: (data.actual_colors || [])[i % (data.actual_colors?.length || 1)] || "Neutral",
            style: "AI Detected",
          })),
          colorPalette: {
            colors: data.actual_colors || [],
            harmony: "AI Analyzed",
            rating: "AI-powered color detection from FASHION-OMEGA",
          },
          strengths: data.strengths || [],
          improvements: [],
          seasonalFit: "All Season",
          bodyTypeNotes: "AI-powered silhouette analysis by FASHION-OMEGA",
        });
      }
    } catch (err) {
      // Silent — Cosmic Audit is enhancement, not blocking
      console.warn("[omega] audit failed", err);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    if (!imagePreview) {
      setOmegaAudit(null);
      setOmegaMissingItem(null);
      setOmegaSource(null);
      setOmegaPalette([]);
      setOmegaStyleName("");
      setOmegaColors([]);
      setOmegaItems([]);
      setOmegaStrengths([]);
      return;
    }
    runOmegaAudit(imagePreview);
  }, [imagePreview, runOmegaAudit]);
  
  const fetchExpertTweak = async (retryCount = 0) => {
    setExpertImage(null);
    setTweakError(null);
    setExpertSuggestion(null);
    setExpertSource(null);
    
    try {
      // Use the already-fetched OMEGA tweak_plan as a hint to reduce duplicate work
      const bodyPayload: Record<string, any> = {
        image_b64: imagePreview,
        target_area: 'auto',
      };
      if (omegaMissingItem) {
        bodyPayload.suggestion_hint = omegaMissingItem;
      }
      
      // 15-second timeout for Replit cold start
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(`${API_BASE_URL}/api/v1/pro-tweak/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      // Retry on 5xx errors (Replit waking up)
      if (!response.ok && retryCount < 3) {
        console.log("Backend warming up, retrying...");
        setTimeout(() => fetchExpertTweak(retryCount + 1), 2000);
        return;
      }

      const data = await response.json();

      if (data.error) {
        setTweakError(data.message || 'Unknown generation error');
      } else if (data.tweaked_image_url) {
        setExpertImage(data.tweaked_image_url);
        if (typeof data.suggestion === 'string') setExpertSuggestion(data.suggestion);
        if (data.source === 'fable5' || data.source === 'local' || data.source === 'emergency') {
          setExpertSource(data.source);
          if (data.source === 'emergency') {
            toast.warning('Stylist fell back to the emergency brooch — check Replit logs.');
          }
        }
      } else {
        setTweakError('Server returned an empty response.');
      }
    } catch (err: any) {
      // If aborted due to timeout, retry once after a delay
      if (err.name === 'AbortError' && retryCount < 2) {
        console.log('Replit cold start detected, retrying in 3s...');
        setTimeout(() => fetchExpertTweak(retryCount + 1), 3000);
      } else {
        setTweakError('Network error: Backend unreachable.');
      }
    }
  };

  useEffect(() => {
    if (imagePreview) fetchExpertTweak();
  }, [imagePreview]);



  const filteredHistory = history.filter((h) => {
    if (styleFilter && !h.overall_style.toLowerCase().includes(styleFilter.toLowerCase())) return false;
    if (minScore && h.style_score < Number(minScore)) return false;
    if (maxScore && h.style_score > Number(maxScore)) return false;
    if (dateFilter !== "all") {
      const days = dateFilter === "7d" ? 7 : dateFilter === "30d" ? 30 : 90;
      if (Date.now() - new Date(h.created_at).getTime() > days * 86400000) return false;
    }
    return true;
  });

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    const { data } = await supabase
      .from("outfit_analyses")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setHistory((data || []) as any[]);
    setLoadingHistory(false);
  };

  useEffect(() => { fetchHistory(); }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    const compressed = await compressImage(file);
    if (compressed.size < file.size) {
      toast.info(`Compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressed.size)}`);
    }
    setImageFile(compressed);
    setAnalysis(null);
    setSaved(false);
    setImageUrl(null);
    setAnalysisError(null);
    setImageCreationUrl(null);
    setImageCreationItems([]);
    setCreationError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(compressed);
  };

  const handleAnalyze = async () => {
    if (!imageFile || !user) return;
    if (!canProceed("outfit-analyze", 3000)) {
      toast.error("Please wait a moment before analyzing again.");
      return;
    }
    setIsAnalyzing(true);
    setSaved(false);
    setAnalysisError(null);
    try {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/analysis-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("clothing-photos")
        .upload(path, imageFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("clothing-photos")
        .getPublicUrl(path);
      setImageUrl(urlData.publicUrl);

      // If OMEGA (runOmegaAudit) already populated the analysis, skip redundant backend call
      if (!analysis || !analysis.overallStyle || analysis.overallStyle === "Omega Style") {
        const data = await analyzeOutfitImage(urlData.publicUrl);
        setAnalysis(data);
      }
      
      // Fetch stylist tweaks from microservice
      setStylistTweaksLoading(true);
      try {
        const microUrl = (typeof import.meta !== "undefined" && import.meta.env?.VITE_TWEAKS_API_URL) || "http://localhost:8767";
        const resp = await fetch(`${microUrl}/tweaks/generate-from-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: urlData.publicUrl, prompt: 'Generate a premium stylist edit for this outfit' }),
          signal: AbortSignal.timeout(15000),
        });
        if (resp.ok) {
          const tweakData = await resp.json();
          if (tweakData.success && tweakData.tweaks) {
            setStylistTweaks(tweakData.tweaks);
          }
        }
      } catch (err) {
        console.warn('[stylist-tweaks] Could not fetch tweaks:', err);
      } finally {
        setStylistTweaksLoading(false);
      }
      
      toast.success("Outfit analyzed!");
    } catch (err: unknown) {
      console.error(err);
      const msg = getErrorMessage(err) || "Analysis failed";
      setAnalysisError(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysis || !user || !imageUrl) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from("outfit_analyses").insert({
        user_id: user.id,
        image_url: imageUrl,
        overall_style: analysis.overallStyle,
        style_score: analysis.styleScore,
        summary: analysis.summary,
        occasion_ratings: analysis.occasionRatings,
        detected_items: analysis.detectedItems,
        color_palette: analysis.colorPalette,
        strengths: analysis.strengths,
        improvements: analysis.improvements,
        seasonal_fit: analysis.seasonalFit,
        body_type_notes: analysis.bodyTypeNotes,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSaved(true);
      toast.success("Style saved! 🔥");
      fetchHistory();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("outfit_analyses").delete().eq("id", id);
    if (error) { toast.error("Delete failed"); return; }
    setHistory(prev => prev.filter(h => h.id !== id));
    toast.success("Deleted");
  };

  const loadSavedAnalysis = (s: SavedAnalysis) => {
    const data = savedToAnalysis(s);
    setAnalysis(data);
    setImagePreview(s.image_url);
    setImageUrl(s.image_url);
    setImageFile(null);
    setSaved(true);
    setActiveTab("analyze");
  };

  const shareText = analysis
    ? `🔥 My outfit scored ${analysis.styleScore}/100 — "${analysis.overallStyle}"`
    : "Check out Luxor Hub — AI fashion analysis";

  const handleCopyLink = () => {
    if (analysis && imageUrl) {
      navigator.clipboard.writeText(`${window.location.origin}/outfit-analysis?img=${encodeURIComponent(imageUrl)}&score=${analysis.styleScore}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied! 📋");
    }
  };

  const handleShareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(window.location.origin + "/outfit-analysis")}`, "_blank");
  };

  /* ─── Creation / Flat Lay ─── */
  const handleGenerateCreation = async () => {
    if (!analysis) return;
    setIsGeneratingCreation(true);
    setCreationError(null);
    try {
      const resp = await supabase.functions.invoke("generate-creation", {
        body: { items: analysis.detectedItems.slice(0, 6), style: analysis.overallStyle },
      });
      if (resp.error) throw new Error(resp.error.message || "Generation failed");
      setImageCreationUrl(resp.data.imageUrl);
      setImageCreationItems(resp.data.items || []);
      toast.success("Look created! ✨");
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || "Creation failed";
      setCreationError(msg);
      toast.error(msg);
    } finally {
      setIsGeneratingCreation(false);
    }
  };

  const handleSaveCreation = async () => {
    if (!imageCreationUrl || !user) return;
    setIsSavingCreation(true);
    try {
      const { error } = await supabase.from("outfit_analyses").insert({
        user_id: user.id,
        image_url: imageCreationUrl,
        overall_style: analysis?.overallStyle || "Look",
        style_score: analysis?.styleScore || 80,
        summary: "Generated look creation",
        occasion_ratings: [],
        detected_items: imageCreationItems,
        color_palette: { colors: [], harmony: "", rating: "" },
        strengths: [],
        improvements: [],
        seasonal_fit: "",
        body_type_notes: "",
        is_creation: true,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      setCreationSaved(true);
      toast.success("Saved to gallery! 🖼️");
      fetchHistory();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Save failed");
    } finally {
      setIsSavingCreation(false);
    }
  };

  /* ─── Strength emoji mapper (butcher the robotic text) ─── */
  function strengthEmoji(s: string): [string, string] {
    const low = s.toLowerCase();
    if (low.includes("warm") || low.includes("cool") || low.includes("balance") || low.includes("color intu")) return ["🔥", "Advanced Balance"];
    if (low.includes("palette") || low.includes("color") || low.includes("layered") || low.includes("composition") || low.includes("thoughtful")) return ["🎨", "Masterful Layering"];
    if (low.includes("vintage") || low.includes("formal") || low.includes("bridge") || low.includes("fusion")) return ["🕊️", "Vintage Fusion"];
    if (low.includes("versatile") || low.includes("adapt") || low.includes("flex")) return ["💪", "Ultra Versatile"];
    if (low.includes("texture") || low.includes("fabric") || low.includes("material") || low.includes("tactile")) return ["🧶", "Texture Genius"];
    if (low.includes("proportion") || low.includes("silhouette") || low.includes("fit") || low.includes("tailor")) return ["📐", "Perfect Proportions"];
    if (low.includes("monochrome") || low.includes("tone") || low.includes("neutral") || low.includes("minimal")) return ["🤍", "Minimalist Mastery"];
    if (low.includes("pattern") || low.includes("print") || low.includes("graphic")) return ["🌀", "Pattern King"];
    if (low.includes("bold") || low.includes("statement") || low.includes("daring") || low.includes("confident")) return ["⚡", "Bold Statement"];
    if (low.includes("elegant") || low.includes("classy") || low.includes("chic") || low.includes("sophisticated")) return ["👑", "Pure Elegance"];
    if (low.includes("casual") || low.includes("relaxed") || low.includes("effortless")) return ["😎", "Effortless Cool"];
    if (low.includes("layering") || low.includes("layer")) return ["🥋", "Layering Pro"];
    if (low.includes("accessor") || low.includes("jewel") || low.includes("watch") || low.includes("belt") || low.includes("bag")) return ["💎", "Accessory Ace"];
    // fallback
    const words = s.split(" ").slice(0, 3);
    return ["✨", words.join(" ")];
  }

  /* ─── Polished Verdict (humanized, <6 words, emoji-rich) ─── */
  const polishedVerdict = analysis ? (() => {
    const s = analysis.styleScore;
    if (s >= 90) return ["🔥 INCREDIBLE", "Bold. Clean. Iconic."];
    if (s >= 80) return ["⭐ SHARP", "Clean. Strong. Effortless."];
    if (s >= 70) return ["👌 SOLID", "Works well. Tiny tweaks."];
    if (s >= 60) return ["🔄 ALMOST", "Good bones. Fix details."];
    return ["💥 OFF", "Missed the mark. Retry?"];
  })() : ["" , ""];

  const humanizedStyle = analysis ? analysis.overallStyle.length > 12
    ? analysis.overallStyle.split(" ").slice(0, 2).join(" ")
    : analysis.overallStyle : "";

  /* ─── Top 3 Dominant Colors ─── */
  const top3Colors = analysis?.colorPalette?.colors?.slice(0, 3) || [];

  return (
    <AppLayout>
      <div className="relative min-h-screen overflow-hidden"
        style={{ background: "radial-gradient(ellipse at 50% 0%, #1A1A1A 0%, #000000 100%)" }}
      >
        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#C8A951]/5 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#22D3EE]/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* ─── Header ─── */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Eye className="w-4 h-4 text-black" />
              </div>
              <h1 className="text-xl font-semibold text-white/90 tracking-tight">OUTFIT <span className="text-amber-400">ANALYSIS</span></h1>
            </div>
            <div className="flex items-center gap-2">
              {analysis && (
                <motion.button
                  onClick={handleSave}
                  disabled={isSaving || saved}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all"
                  whileTap={{ scale: 0.97 }}
                >
                  {saved ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Save className="w-3.5 h-3.5" />}
                  {saved ? "Saved" : "Save"}
                </motion.button>
              )}
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all"
                whileTap={{ scale: 0.97 }}
              >
                <Camera className="w-3.5 h-3.5" /> New
              </motion.button>
            </div>
          </div>

          {/* ─── Tab Bar (glassmorphism) ─── */}
          <div className="flex gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-xl w-fit">
            {[
              { id: "analyze", label: "🎯 Analyze" },
              { id: "history", label: "📜 History" },
            ].map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-amber-500/20 text-amber-300 shadow-lg shadow-amber-500/10"
                    : "text-white/40 hover:text-white/70"
                }`}
                whileTap={{ scale: 0.97 }}
              >
                {tab.label}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "analyze" ? (
              <motion.div
                key="analyze"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* ─── Image Upload / Analysis View ─── */}
                {!imagePreview ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center p-16 rounded-3xl border-2 border-dashed border-white/10 bg-white/[0.02] backdrop-blur-sm hover:border-amber-500/40 transition-all">
                      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                        <Upload className="w-7 h-7 text-amber-400" />
                      </div>
                      <p className="text-lg font-medium text-white/80">Drop your fit here</p>
                      <p className="text-sm text-white/40 mt-1">or tap to browse</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* ─── Left: Image ─── */}
                    <div className="lg:col-span-2 space-y-4">
                      <motion.div
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0.4, bottom: 0 }}
                        onDragEnd={(_, info) => {
                          if (info.offset.y > 120) {
                            setImagePreview(null);
                            setImageFile(null);
                            setAnalysis(null);
                            setAnalysisError(null);
                          }
                        }}
                        className="relative rounded-2xl overflow-hidden border border-white/5 bg-black/40 cursor-grab active:cursor-grabbing touch-pan-y"
                        style={{ touchAction: "pan-y" }}
                      >
                        <img src={imagePreview} alt="Your outfit" className="w-full h-auto object-cover max-h-[500px] pointer-events-none" />
                        {isAnalyzing && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <div className="text-center">
                              <motion.div
                                className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-3"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              <p className="text-sm text-amber-300 font-medium">Analyzing...</p>
                            </div>
                          </div>
                        )}
                        {omegaMissingItem && (
                          <DivineUpgradePill missingItem={omegaMissingItem} />
                        )}
                      </motion.div>
                      <div className="flex gap-2">
                        <motion.button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || !imageFile}
                          className="relative flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-lg shadow-amber-500/20 disabled:opacity-40 overflow-hidden group"
                          whileTap={{ scale: 0.97 }}
                        >
                          {/* Shimmer sweep */}
                          <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                            initial={{ x: '-100%' }}
                            animate={!isAnalyzing && imageFile ? { x: '200%' } : { x: '-100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
                          />
                          <span className="relative z-10">{isAnalyzing ? "Analyzing..." : "✨ Analyze"}</span>
                        </motion.button>
                        <motion.button
                          onClick={() => { setImagePreview(null); setImageFile(null); setAnalysis(null); setAnalysisError(null); }}
                          className="px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
                          whileTap={{ scale: 0.97 }}
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                        <div className="flex items-center gap-1 text-[10px] text-white/20">
                          <span className="inline-block w-5 h-0.5 rounded-full bg-white/10" />
                          swipe down
                        </div>
                      </div>
                    </div>

                    {/* ─── Right: Results ─── */}
                    <div className="lg:col-span-3 space-y-5">
                      {analysisError && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-md flex items-center gap-3"
                        >
                          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                          <span className="text-sm text-red-300 flex-1">{analysisError}</span>
                          <motion.button
                            onClick={handleAnalyze}
                            className="text-xs font-medium px-3 py-1 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30"
                            whileTap={{ scale: 0.97 }}
                          >
                            Retry
                          </motion.button>
                        </motion.div>
                      )}

                      {isAnalyzing && !analysis && (
                        <div className="space-y-4 p-8">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                          ))}
                        </div>
                      )}

                      {analysis && !isAnalyzing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ staggerChildren: 0.08 }}
                          className="space-y-5"
                        >
                          {/* ═══ SCORE HEADER ═══ */}
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md"
                          >
                            <ScoreRing score={analysis.styleScore} size={100} />
                            <div className="flex-1 min-w-0">
                              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
                                {humanizedStyle} {analysis.styleScore >= 80 ? "🕊️" : analysis.styleScore >= 60 ? "👌" : "💪"}
                              </h2>
                              <p className="text-sm text-white/50 mt-1 font-medium tracking-wide">
                                {polishedVerdict[1]}
                              </p>
                            </div>
                          </motion.div>

                          {/* ═══ 3 COLOR CAPSULES (replacing 8-color swatch) ═══ */}
                          {top3Colors.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 }}
                            >
                              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 font-medium">🎨 DOMINANT</p>
                              <div className="flex flex-wrap gap-3">
                                {top3Colors.map((c, i) => (
                                  <GlassColorCapsule key={i} color={c} label={i === 0 ? "PRIMARY" : i === 1 ? "SECONDARY" : "ACCENT"} />
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {/* ═══ COSMIC AUDIT (FASHION-OMEGA) ═══ */}
                          {(omegaAudit || omegaPalette.length > 0) && (
                            <div className="space-y-4">
                              {omegaAudit && (
                                <CosmicAuditCard audit={omegaAudit} source={omegaSource} />
                              )}
                              {omegaPalette.length > 0 && (
                                <PaletteSwatchStrip
                                  palette={omegaPalette}
                                  apiBaseUrl={API_BASE_URL}
                                  imageHash={imageUrl || undefined}
                                />
                              )}
                            </div>
                          )}

                          {/* ═══ 3-COLUMN VISUAL DASHBOARD ═══ */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                            {/* Detected Items */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md"
                            >
                              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 font-medium">👕 ITEMS</p>
                              <div className="space-y-2">
                                {analysis.detectedItems.slice(0, 4).map((item, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.25 + i * 0.05 }}
                                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.04]"
                                  >
                                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center">
                                      <Shirt className="w-3 h-3 text-cyan-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-white/80 truncate">{item.name}</p>
                                      <p className="text-[10px] text-white/40">{item.category} · {item.color}</p>
                                    </div>
                                  </motion.div>
                                ))}
                                {analysis.detectedItems.length === 0 && (
                                  <p className="text-xs text-white/30 italic">No items detected</p>
                                )}
                              </div>
                            </motion.div>

                            {/* Strengths */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.25 }}
                              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md"
                            >
                              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 font-medium">✅ STRENGTHS</p>
                              <div className="space-y-2">
                                {analysis.strengths.slice(0, 4).map((s, i) => {
                                  const emoji = strengthEmoji(s);
                                  return (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.05 }}
                                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-green-500/[0.06] border border-green-500/15"
                                  >
                                    <span className="text-base shrink-0">{emoji[0]}</span>
                                    <p className="text-sm text-green-300/90 font-semibold leading-snug">{emoji[1]}</p>
                                  </motion.div>
                                  );
                                })}
                              </div>
                            </motion.div>

                            {/* Improvements - Visual Image Overlay */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 15 }}
                              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md"
                            >
                              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 font-medium">⚠️ TWEAKS</p>
                              {imagePreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-white/5">
                                  <img src={imagePreview} alt="Outfit for tweaks" className="w-full h-auto object-cover max-h-[240px]" />
                                  <div className="absolute inset-0 bg-black/30" />
                                  {/* SVG overlay with annotations */}
                                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                                    {analysis.improvements.slice(0, 3).map((imp, i) => {
                                      const boxProps = [
                                        { x: 15, y: 20, w: 70, h: 30, color: "#22D3EE" },
                                        { x: 25, y: 55, w: 50, h: 25, color: "#F59E0B" },
                                        { x: 10, y: 10, w: 80, h: 80, color: "#EF4444" },
                                      ][i] || { x: 10, y: 10, w: 80, h: 80, color: "#C8A951" };
                                      const tipY = boxProps.y + boxProps.h + 5;
                                      return (
                                        <g key={i}>
                                          <rect x={boxProps.x} y={boxProps.y} width={boxProps.w} height={boxProps.h}
                                            fill="none" stroke={boxProps.color} strokeWidth="0.5" strokeDasharray="2,2"
                                            rx="2"
                                          >
                                            <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
                                          </rect>
                                          <circle cx={boxProps.x + boxProps.w / 2} cy={boxProps.y + boxProps.h / 2} r="2"
                                            fill="none" stroke={boxProps.color} strokeWidth="0.3"
                                          >
                                            <animate attributeName="r" values="2;6;2" dur="2s" repeatCount="indefinite" />
                                            <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                                          </circle>
                                          <text x={boxProps.x + boxProps.w / 2} y={boxProps.y - 3}
                                            textAnchor="middle" fill={boxProps.color} fontSize="3" fontWeight="bold"
                                          >
                                            {imp.priority === "high" ? "⚠ " : ""}{imp.suggestion.length > 18 ? imp.suggestion.substring(0, 17) + ".." : imp.suggestion}
                                          </text>
                                        </g>
                                      );
                                    })}
                                  </svg>
                                  {/* Glass tooltip at bottom */}
                                  <div className="absolute bottom-0 left-0 right-0 p-2 backdrop-blur-md bg-black/50 border-t border-white/5">
                                    <div className="flex flex-wrap gap-1.5">
                                      {analysis.improvements.slice(0, 3).map((imp, i) => (
                                        <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full ${
                                          imp.priority === "high" ? "bg-orange-500/20 text-orange-300 border border-orange-500/30" : "bg-white/5 text-white/60 border border-white/10"
                                        }`}>
                                          {imp.priority === "high" ? "⚠️ " : ""}{imp.suggestion}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {analysis.improvements.slice(0, 3).map((imp, i) => (
                                    <motion.div key={i}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.35 + i * 0.05 }}
                                      className={`p-2.5 rounded-xl border ${imp.priority === "high" ? "bg-orange-500/[0.06] border-orange-500/20" : "bg-white/[0.02] border-white/[0.04]"}`}
                                    >
                                      <div className="flex items-start gap-2">
                                        {imp.priority === "high" && <span className="text-orange-400 text-sm shrink-0 mt-0.5">⚠️</span>}
                                        <div>
                                          <p className="text-sm font-medium text-white/80 leading-snug">{imp.suggestion}</p>
                                          <p className={`text-[10px] mt-0.5 ${imp.priority === "high" ? "text-orange-400/60" : "text-white/30"}`}>{imp.reason}</p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </motion.div>
                          </div>

                          {/* ═══ OCCASION RADAR (Neon Polygon) ═══ */}
                          {analysis.occasionRatings.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.35 }}
                              className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md"
                            >
                              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-medium">🗺️ VIBE MAP</p>
                              <div className="w-full mx-auto">
                                <NeonRadarChart data={analysis.occasionRatings} onVibeClick={(occasion, reason, x, y) => setSelectedVibe({ occasion, reason, x, y })} />
                              </div>
                              {selectedVibe && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  className="relative mt-2 mx-2 p-3 rounded-xl border border-white/10 backdrop-blur-xl"
                                  style={{ background: 'rgba(255,255,255,0.04)' }}
                                >
                                  <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-semibold text-cyan-300">{selectedVibe.occasion}</p>
                                      <p className="text-[10px] text-white/60 mt-0.5 leading-relaxed">{selectedVibe.reason}</p>
                                    </div>
                                    <button onClick={() => setSelectedVibe(null)} className="text-white/30 hover:text-white/60 p-0.5">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          )}

                          {/* ═══ PRO STYLIST TWEAKS ═══ */}
                          {imagePreview && (
                            <div className="max-w-lg mx-auto">
                              <ProStylistTweaks
                                originalImage={imagePreview}
                                expertImage={expertImage}
                                description={expertSuggestion ? `✨ ${expertSuggestion}` : '✨ Generating premium stylist edit…'}
                                tag={expertSource === 'fable5' ? 'Fable 5' : expertSource === 'local' ? 'Local Stylist' : expertSource === 'emergency' ? 'Fallback' : 'Stylist Edit'}
                                tweakError={tweakError}
                                onRetry={fetchExpertTweak}
                                source={expertSource}
                              />
                            </div>
                          )}

                          {/* ═══ BODY TYPE / SILHOUETTE ═══ */}
                          {analysis.bodyTypeNotes && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.4, type: "spring", stiffness: 150, damping: 15 }}
                              className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 backdrop-blur-md"
                            >
                              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-3 font-medium">🧬 SILHOUETTE</p>
                              <div className="flex flex-wrap gap-2">
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.45, type: "spring", stiffness: 180, damping: 12 }}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-sm font-bold text-white shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                                >📐 Silhouette: Flowing</motion.span>
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.5, type: "spring", stiffness: 180, damping: 12 }}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/30 text-sm font-bold text-white shadow-[0_0_12px_rgba(200,169,81,0.15)]"
                                >✨ Vertical: Extended</motion.span>
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.55, type: "spring", stiffness: 180, damping: 12 }}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/10 border border-purple-500/30 text-sm font-bold text-white shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                                >💧 Drape: Relaxed</motion.span>
                              </div>
                            </motion.div>
                          )}

                          {/* ═══ SEASONAL FIT ═══ */}
                          {analysis.seasonalFit && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5, type: "spring", stiffness: 150, damping: 15 }}
                              className="relative p-4 rounded-2xl overflow-hidden bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-md"
                              style={{ border: '1px solid rgba(200,169,81,0.3)', boxShadow: '0 0 20px rgba(200,169,81,0.08)' }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none" />
                              <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-2 font-medium">🌦️ SEASON</p>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🌦️</span>
                                <span className="text-base font-bold text-white">{analysis.seasonalFit}</span>
                              </div>
                            </motion.div>
                          )}

                          {/* ═══ SHARE ROW ═══ */}
                          <div className="flex gap-2 pt-1">
                            <motion.button
                              onClick={handleShareTwitter}
                              className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                              whileTap={{ scale: 0.97 }}
                            >
                              <Twitter className="w-3.5 h-3.5 text-sky-400" /> Share
                            </motion.button>
                            <motion.button
                              onClick={handleCopyLink}
                              className="flex-1 py-2.5 rounded-xl text-xs font-medium border border-white/10 bg-white/[0.03] backdrop-blur-md hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                              whileTap={{ scale: 0.97 }}
                            >
                              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Link className="w-3.5 h-3.5" />}
                              {copied ? "Copied" : "Copy Link"}
                            </motion.button>
                          </div>

                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </motion.div>
            ) : (
              /* ════════════════════════════════════════ */
              /* ─── HISTORY TAB ───                       */
              /* ════════════════════════════════════════ */
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Filters */}
                <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                      <input
                        value={styleFilter}
                        onChange={e => setStyleFilter(e.target.value)}
                        placeholder="Style..."
                        className="w-24 h-8 rounded-lg bg-white/5 border border-white/10 pl-8 pr-2 text-xs text-white/70 placeholder:text-white/20 outline-none focus:border-amber-500/40 transition-colors"
                      />
                    </div>
                    <input
                      value={minScore}
                      onChange={e => setMinScore(e.target.value)}
                      placeholder="Min"
                      type="number"
                      className="w-14 h-8 rounded-lg bg-white/5 border border-white/10 px-2 text-xs text-white/70 placeholder:text-white/20 outline-none focus:border-amber-500/40"
                    />
                    <span className="text-white/20 text-xs">-</span>
                    <input
                      value={maxScore}
                      onChange={e => setMaxScore(e.target.value)}
                      placeholder="Max"
                      type="number"
                      className="w-14 h-8 rounded-lg bg-white/5 border border-white/10 px-2 text-xs text-white/70 placeholder:text-white/20 outline-none focus:border-amber-500/40"
                    />
                    <select
                      value={dateFilter}
                      onChange={e => setDateFilter(e.target.value)}
                      className="h-8 rounded-lg bg-white/5 border border-white/10 px-2 text-xs text-white/70 outline-none focus:border-amber-500/40"
                    >
                      <option value="all">All time</option>
                      <option value="7d">7 days</option>
                      <option value="30d">30 days</option>
                      <option value="90d">90 days</option>
                    </select>
                    <motion.button
                      onClick={fetchHistory}
                      className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10"
                      whileTap={{ scale: 0.95 }}
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-white/50" />
                    </motion.button>
                  </div>
                </div>

                {/* Visual History - Horizontal draggable pill-carousel */}
                {loadingHistory ? (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-24 h-32 rounded-2xl bg-white/[0.02] animate-pulse shrink-0" />
                    ))}
                  </div>
                ) : filteredHistory.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 mx-auto mb-4 flex items-center justify-center">
                      <History className="w-6 h-6 text-white/20" />
                    </div>
                    <p className="text-white/40 font-medium">No saved analyses yet</p>
                    <p className="text-white/20 text-sm mt-1">Analyze your first outfit above</p>
                  </div>
                ) : (
                  <div className="relative">
                    <motion.div
                      className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin snap-x snap-mandatory"
                      drag="x"
                      dragConstraints={{ left: -(filteredHistory.length * 108 - 300), right: 0 }}
                      dragElastic={0.1}
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {filteredHistory.map((h, idx) => (
                        <motion.div
                          key={h.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03, type: "spring", stiffness: 150, damping: 15 }}
                          className="snap-start shrink-0 cursor-pointer group relative"
                          onClick={() => loadSavedAnalysis(h)}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <div className="w-24 h-32 rounded-2xl overflow-hidden border border-white/5 bg-black/40 relative">
                            {h.image_url && (
                              <img src={h.image_url} alt={h.overall_style} className="w-full h-full object-cover" loading="lazy" />
                            )}
                            {/* Dark gradient overlay at bottom for text */}
                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
                            {/* Small score ring overlay */}
                            <div className="absolute bottom-1 right-1">
                              <ScoreRing score={h.style_score} size={28} />
                            </div>
                            <div className="absolute bottom-1 left-1.5 right-8">
                              <p className="text-[8px] font-medium text-white/90 truncate leading-tight">{h.overall_style || "Look"}</p>
                              <p className="text-[6px] text-white/50">{timeAgo(h.created_at)}</p>
                            </div>
                          </div>
                          <motion.button
                            onClick={(e) => { e.stopPropagation(); handleDelete(h.id); }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-2.5 h-2.5 text-white" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <PrivacyNotice />
        </div>
      </div>
    </AppLayout>
  );
}
