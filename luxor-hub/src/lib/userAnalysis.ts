import { supabase } from "@/integrations/supabase/client";

export interface UserAnalysisData {
  profile: { display_name: string | null; avatar_url: string | null; created_at: string | null };
  styleProfile: {
    archetype: string | null;
    style_score: number | null;
    onboarding_completed: boolean | null;
    preferences: Record<string, any>;
    style_formula: Record<string, any>;
  };
  counts: {
    closetItems: number;
    analyses: number;
    dressingRoomLooks: number;
    calendarEvents: number;
    chatMessages: number;
    councilConversations: number;
    badges: number;
    stylePoints: number;
  };
  analyses: {
    avgScore: number | null;
    bestScore: number | null;
    categoryMix: Record<string, number>;
    palette: string[];
    lastSummary: string | null;
  };
  journey: Array<{ label: string; date: string | null; done: boolean; opportunity: string }>;
  personality: Record<string, number>; // -1..1
  feelings: string[];
}

const safe = async <T,>(p: Promise<{ data: T | null; error: any }>, fallback: T): Promise<T> => {
  try {
    const { data, error } = await p;
    if (error) return fallback;
    return (data as T) ?? fallback;
  } catch {
    return fallback;
  }
};

const countRows = async (table: string, userId: string): Promise<number> => {
  try {
    const { count, error } = await (supabase as any)
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
};

const clamp = (n: number, min = -1, max = 1) => Math.max(min, Math.min(max, n));

export async function fetchUserAnalysis(userId: string): Promise<UserAnalysisData> {
  const [profile, styleProfileRow, analysesRows, pointsRows] = await Promise.all([
    safe(
      (supabase as any)
        .from("profiles")
        .select("display_name, avatar_url, created_at")
        .eq("user_id", userId)
        .maybeSingle(),
      { display_name: null, avatar_url: null, created_at: null } as any,
    ),
    safe(
      (supabase as any)
        .from("style_profiles")
        .select("archetype, style_score, onboarding_completed, preferences, style_formula, created_at")
        .eq("user_id", userId)
        .maybeSingle(),
      null as any,
    ),
    safe(
      (supabase as any)
        .from("outfit_analyses")
        .select("style_score, overall_style, color_palette, summary, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      [] as any[],
    ),
    safe(
      (supabase as any).from("style_points").select("points").eq("user_id", userId),
      [] as any[],
    ),
  ]);

  const [closetItems, analysesCount, dressingRoomLooks, calendarEvents, chatMessages, councilConversations, badges] =
    await Promise.all([
      countRows("clothing_items", userId),
      countRows("outfit_analyses", userId),
      countRows("dressing_room_looks", userId),
      countRows("calendar_events", userId),
      countRows("chat_messages", userId),
      countRows("council_conversations", userId),
      countRows("user_badges", userId),
    ]);

  const scores = (analysesRows as any[]).map((r) => r.style_score).filter((n) => typeof n === "number");
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
  const bestScore = scores.length ? Math.max(...scores) : null;

  const categoryMix: Record<string, number> = {};
  (analysesRows as any[]).forEach((r) => {
    const key = (r.overall_style || "Unclassified").toString();
    categoryMix[key] = (categoryMix[key] || 0) + 1;
  });

  const paletteSet = new Set<string>();
  (analysesRows as any[]).slice(0, 20).forEach((r) => {
    const p = r.color_palette;
    if (Array.isArray(p)) p.forEach((c: any) => typeof c === "string" && paletteSet.add(c));
    else if (p && typeof p === "object") {
      Object.values(p).forEach((v: any) => {
        if (typeof v === "string" && v.startsWith("#")) paletteSet.add(v);
      });
    }
  });
  const palette = Array.from(paletteSet).slice(0, 8);

  const prefs = (styleProfileRow?.preferences ?? {}) as Record<string, any>;
  const formula = (styleProfileRow?.style_formula ?? {}) as Record<string, any>;

  // Personality inference (deterministic from onboarding choices + activity)
  const styleMood: string[] = Array.isArray(prefs.styleMood) ? prefs.styleMood : [];
  const lifestyle: string = prefs.lifestyle || "";
  const brands: string = prefs.brands || "";
  const budget: string = prefs.budget || "";
  const goal: string = prefs.elevateStyle || "";

  const personality: Record<string, number> = {
    "Introvert ↔ Extrovert": clamp(
      (styleMood.includes("Bold & attention-grabbing") ? 0.6 : 0) +
        (styleMood.includes("Approachable & friendly") ? 0.3 : 0) +
        (lifestyle.includes("Social") ? 0.4 : lifestyle.includes("Relaxed") ? -0.4 : 0) +
        (chatMessages > 20 ? 0.2 : -0.1),
    ),
    "Sensing ↔ Intuition": clamp(
      (styleMood.includes("Creative & expressive") ? 0.5 : 0) +
        (goal.includes("mix and match") ? 0.3 : 0) +
        (analysesCount > 10 ? -0.2 : 0.1),
    ),
    "Thinking ↔ Feeling": clamp(
      (styleMood.includes("Elegant & refined") ? -0.4 : 0) +
        (styleMood.includes("Relaxed & effortless") ? 0.3 : 0) +
        (styleMood.includes("Confident & powerful") ? -0.2 : 0) +
        (councilConversations > 3 ? -0.2 : 0.1),
    ),
    "Judging ↔ Perceiving": clamp(
      (calendarEvents > 5 ? -0.5 : 0.2) +
        (goal.includes("color palette") ? -0.3 : 0) +
        (dressingRoomLooks > 5 ? 0.3 : 0),
    ),
    "Classic ↔ Experimental": clamp(
      (brands.includes("Luxury") ? -0.4 : 0) +
        (brands.includes("Fast") ? 0.3 : 0) +
        (styleMood.includes("Bold & attention-grabbing") ? 0.4 : 0) +
        (styleMood.includes("Elegant & refined") ? -0.3 : 0),
    ),
    "Minimal ↔ Maximal": clamp(
      (styleMood.includes("Bold & attention-grabbing") ? 0.5 : 0) +
        (styleMood.includes("Creative & expressive") ? 0.3 : 0) +
        (styleMood.includes("Relaxed & effortless") ? -0.3 : 0) +
        (closetItems > 40 ? 0.2 : -0.1),
    ),
    "Practical ↔ Expressive": clamp(
      (styleMood.includes("Creative & expressive") ? 0.5 : 0) +
        (lifestyle.includes("Creative") ? 0.4 : 0) +
        (lifestyle.includes("Corporate") ? -0.4 : 0),
    ),
  };

  const feelings = Array.from(
    new Set([
      ...(styleMood as string[]).map((m) => m.split(" ")[0]),
      avgScore && avgScore > 75 ? "Confident" : null,
      dressingRoomLooks > 3 ? "Curious" : null,
      councilConversations > 0 ? "Reflective" : null,
      calendarEvents > 3 ? "Intentional" : null,
    ].filter(Boolean) as string[]),
  ).slice(0, 8);

  const journey = [
    {
      label: "Joined LUXOR",
      date: (profile as any)?.created_at ?? null,
      done: true,
      opportunity: "Welcome — set your Style DNA to unlock precise recommendations.",
    },
    {
      label: "Completed onboarding",
      date: styleProfileRow?.onboarding_completed ? (styleProfileRow as any)?.created_at ?? null : null,
      done: !!styleProfileRow?.onboarding_completed,
      opportunity: "Refine your archetype anytime from Style DNA.",
    },
    {
      label: "First closet upload",
      date: null,
      done: closetItems > 0,
      opportunity: closetItems < 10 ? "Add 10 items to unlock smarter outfits." : "Keep cataloguing to sharpen fit reads.",
    },
    {
      label: "First outfit analysis",
      date: (analysesRows as any[])[analysesRows.length - 1]?.created_at ?? null,
      done: analysesCount > 0,
      opportunity: analysesCount < 3 ? "Analyze 3 outfits — pattern-matching improves." : "Try weekly analyses to track drift.",
    },
    {
      label: "First Dressing-Room look",
      date: null,
      done: dressingRoomLooks > 0,
      opportunity: dressingRoomLooks === 0 ? "Try the Dressing Room to preview looks." : "Save favorites to your gallery.",
    },
    {
      label: "First planned outfit",
      date: null,
      done: calendarEvents > 0,
      opportunity: calendarEvents === 0 ? "Plan a week ahead — reduces morning friction." : "Log wears to close the loop.",
    },
    {
      label: "Council deliberation",
      date: null,
      done: councilConversations > 0,
      opportunity: councilConversations === 0 ? "Ask the Council when you're torn between two looks." : "Revisit past deliberations.",
    },
  ];

  const totalPoints = (pointsRows as any[]).reduce((a, r) => a + (r.points || 0), 0);

  return {
    profile: profile as any,
    styleProfile: {
      archetype: styleProfileRow?.archetype ?? null,
      style_score: styleProfileRow?.style_score ?? null,
      onboarding_completed: styleProfileRow?.onboarding_completed ?? null,
      preferences: prefs,
      style_formula: formula,
    },
    counts: {
      closetItems,
      analyses: analysesCount,
      dressingRoomLooks,
      calendarEvents,
      chatMessages,
      councilConversations,
      badges,
      stylePoints: totalPoints,
    },
    analyses: {
      avgScore,
      bestScore,
      categoryMix,
      palette,
      lastSummary: (analysesRows as any[])[0]?.summary ?? null,
    },
    journey,
    personality,
    feelings,
  };
}

export function buildNextActions(d: UserAnalysisData): string[] {
  const out: string[] = [];
  if (d.counts.closetItems < 15) out.push("Photograph 10 more closet items to unlock high-fidelity outfit generation.");
  if (d.counts.analyses < 3) out.push("Run three outfit analyses this week — the algorithm needs baseline data.");
  if (d.counts.calendarEvents === 0) out.push("Plan one outfit for tomorrow. Morning decisions get faster after the first save.");
  if (d.counts.dressingRoomLooks < 2) out.push("Preview a look in the Dressing Room before wearing it.");
  if (d.counts.councilConversations === 0) out.push("Ask the Council for a second opinion on your next occasion outfit.");
  return out.slice(0, 3);
}