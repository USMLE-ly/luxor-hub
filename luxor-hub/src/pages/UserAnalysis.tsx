import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/app/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserAnalysis, buildNextActions, type UserAnalysisData } from "@/lib/userAnalysis";
import { ArrowLeft, Sparkle, Compass, Warning, Target, Heart, TrendUp, Palette, Clock, Lightbulb } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";

const Section: React.FC<{ eyebrow: string; title: string; children: React.ReactNode }> = ({ eyebrow, title, children }) => (
  <motion.section
    initial={{ opacity: 0, y: 16 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    className="mb-10"
  >
    <div className="mb-4">
      <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary/70 mb-1">{eyebrow}</p>
      <h2 className="font-display text-2xl md:text-3xl text-foreground">{title}</h2>
      <div className="h-px w-16 bg-primary/50 mt-3" />
    </div>
    {children}
  </motion.section>
);

const Slider: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const [left, right] = label.split("↔").map((s) => s.trim());
  const pct = ((value + 1) / 2) * 100;
  return (
    <div className="py-3">
      <div className="flex justify-between text-[11px] font-sans uppercase tracking-widest text-muted-foreground mb-2">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <div className="relative h-[2px] bg-border">
        <div className="absolute inset-y-0 left-0 bg-primary/40" style={{ width: `${pct}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary shadow-[0_0_0_3px_rgba(0,0,0,0.02)]"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
    </div>
  );
};

const Kpi: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="border border-border/60 p-4 bg-card">
    <p className="font-display text-3xl text-foreground">{value}</p>
    <p className="font-sans text-[10px] tracking-[0.25em] uppercase text-muted-foreground mt-1">{label}</p>
  </div>
);

const LoadingView = () => (
  <div className="max-w-3xl mx-auto px-5 py-8 space-y-8">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-24 w-full" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <Skeleton className="h-96 w-full" />
  </div>
);

const UserAnalysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<UserAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const d = await fetchUserAnalysis(user.id);
      setData(d);
    } catch (e: any) {
      setError(e?.message || "Could not load analysis");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const nextActions = useMemo(() => (data ? buildNextActions(data) : []), [data]);

  if (loading) {
    return <AppLayout><LoadingView /></AppLayout>;
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto px-5 py-16 text-center">
          <p className="font-display text-2xl mb-3">Analysis unavailable</p>
          <p className="font-sans text-sm text-muted-foreground mb-6">{error ?? "No data yet."}</p>
          <button onClick={load} className="px-5 py-2 border border-primary text-primary text-xs uppercase tracking-widest font-sans">
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  const prefs = data.styleProfile.preferences;
  const name = data.profile.display_name || "Stylist";
  const memberSince = data.profile.created_at
    ? new Date(data.profile.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "—";
  const archetype = data.styleProfile.archetype || "Emerging Signature";
  const topMood = (Array.isArray(prefs.styleMood) && prefs.styleMood[0]) || "Refined";
  const bio = [
    prefs.profession ? `${prefs.profession.split(" /")[0]} professional` : "A curator of their own signature",
    prefs.lifestyle ? `living a ${prefs.lifestyle.toLowerCase().split(" /")[0]} rhythm` : null,
    `chasing a ${String(topMood).toLowerCase()} presence.`,
  ].filter(Boolean).join(", ");

  const identityRows: Array<[string, string]> = [
    ["Age", prefs.ageRange || "—"],
    ["Height", typeof prefs.height === "number" ? `${prefs.height} cm` : (prefs.height || "—")],
    ["Body shape", prefs.bodyShape || "—"],
    ["Face shape", prefs.faceShape || "—"],
    ["Build", prefs.sizeRange || "—"],
    ["Budget", prefs.budget || "—"],
    ["Profession", prefs.profession || "—"],
    ["Lifestyle", prefs.lifestyle || "—"],
    ["Brand tier", prefs.brands || "—"],
  ];

  const needs = Array.isArray(prefs.styleGoal) ? prefs.styleGoal : (prefs.styleGoal ? [prefs.styleGoal] : []);
  const frustrations = Array.isArray(prefs.styleChallenge) ? prefs.styleChallenge : (prefs.styleChallenge ? [prefs.styleChallenge] : []);
  const goals = Array.isArray(prefs.styleMood) ? prefs.styleMood : [];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-5 py-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-xs uppercase tracking-widest font-sans text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>

        {/* PERSONA HERO */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 border border-border/60 bg-card"
        >
          <div className="grid md:grid-cols-[220px_1fr] gap-0">
            <div className="aspect-square md:aspect-auto md:h-full bg-gradient-to-br from-foreground/5 via-primary/5 to-transparent flex items-center justify-center relative overflow-hidden">
              {data.profile.avatar_url ? (
                <img src={data.profile.avatar_url} alt={name} className="w-full h-full object-cover" />
              ) : (
                <div className="font-display text-6xl text-primary/40">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-3 left-3 text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-sans">
                Persona 01
              </div>
            </div>
            <div className="p-6 md:p-8">
              <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-primary/70">Style archetype</p>
              <h1 className="font-display text-4xl md:text-5xl leading-tight mt-1">{name}</h1>
              <p className="font-sans text-sm text-muted-foreground mt-2">{archetype} · Member since {memberSince}</p>
              <blockquote className="mt-5 pl-4 border-l border-primary/40 font-display italic text-lg text-foreground/90">
                "{bio}"
              </blockquote>
            </div>
          </div>
        </motion.section>

        {/* IDENTITY GRID */}
        <Section eyebrow="Identity" title="At a glance">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {identityRows.map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-border/40 py-3 text-sm font-sans">
                <span className="uppercase text-[10px] tracking-widest text-muted-foreground">{k}</span>
                <span className="text-foreground font-medium">{v}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* NEEDS / FRUSTRATIONS / GOALS */}
        <Section eyebrow="Motivation" title="Needs, frustrations & goals">
          <div className="grid md:grid-cols-3 gap-5">
            <div className="border border-border/60 p-5 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="font-sans text-[11px] uppercase tracking-widest text-primary">Needs</h3>
              </div>
              <ul className="space-y-2 text-sm font-sans text-foreground/90">
                {needs.length ? needs.map((n: string) => <li key={n}>· {n}</li>) : <li className="text-muted-foreground">—</li>}
              </ul>
            </div>
            <div className="border border-border/60 p-5 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Warning className="w-4 h-4 text-primary" />
                <h3 className="font-sans text-[11px] uppercase tracking-widest text-primary">Frustrations</h3>
              </div>
              <ul className="space-y-2 text-sm font-sans text-foreground/90">
                {frustrations.length ? frustrations.map((n: string) => <li key={n}>· {n}</li>) : <li className="text-muted-foreground">—</li>}
              </ul>
            </div>
            <div className="border border-border/60 p-5 bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Sparkle className="w-4 h-4 text-primary" />
                <h3 className="font-sans text-[11px] uppercase tracking-widest text-primary">Goals</h3>
              </div>
              <ul className="space-y-2 text-sm font-sans text-foreground/90">
                {goals.length ? goals.map((n: string) => <li key={n}>· {n}</li>) : <li className="text-muted-foreground">—</li>}
              </ul>
            </div>
          </div>
        </Section>

        {/* PERSONALITY */}
        <Section eyebrow="Personality" title="How you show up">
          <div className="border border-border/60 p-5 md:p-7 bg-card">
            {Object.entries(data.personality).map(([label, val]) => (
              <Slider key={label} label={label} value={val} />
            ))}
          </div>
        </Section>

        {/* FEELINGS */}
        <Section eyebrow="Current feelings" title="Words that describe you now">
          <div className="flex flex-wrap gap-2">
            {data.feelings.length ? data.feelings.map((f) => (
              <span key={f} className="px-3 py-1 border border-primary/40 text-primary text-xs uppercase tracking-widest font-sans">
                {f}
              </span>
            )) : <p className="text-sm text-muted-foreground font-sans">Add mood answers in onboarding to fill this in.</p>}
          </div>
        </Section>

        {/* STYLE DNA */}
        <Section eyebrow="Style DNA" title="Your signature">
          <div className="border border-border/60 p-5 bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="font-sans text-[11px] uppercase tracking-widest text-primary">Palette from your analyses</h3>
            </div>
            {data.analyses.palette.length ? (
              <div className="flex gap-2 mb-4">
                {data.analyses.palette.map((c) => (
                  <div key={c} className="w-10 h-10 border border-border/60" style={{ background: c }} title={c} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground font-sans mb-4">Analyze an outfit to populate your palette.</p>
            )}
            <p className="font-sans text-sm text-foreground/80">
              Primary archetype: <span className="font-medium">{archetype}</span>
            </p>
            {data.analyses.lastSummary && (
              <p className="font-sans text-sm text-muted-foreground mt-2 italic">"{data.analyses.lastSummary}"</p>
            )}
          </div>
        </Section>

        {/* ACTIVITY KPIS */}
        <Section eyebrow="Activity" title="What you've built">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Closet items" value={data.counts.closetItems} />
            <Kpi label="Outfits analyzed" value={data.counts.analyses} />
            <Kpi label="Avg style score" value={data.analyses.avgScore ?? "—"} />
            <Kpi label="Best score" value={data.analyses.bestScore ?? "—"} />
            <Kpi label="Dressing-room looks" value={data.counts.dressingRoomLooks} />
            <Kpi label="Planned outfits" value={data.counts.calendarEvents} />
            <Kpi label="Council sessions" value={data.counts.councilConversations} />
            <Kpi label="Style points" value={data.counts.stylePoints} />
          </div>
          {Object.keys(data.analyses.categoryMix).length > 0 && (
            <div className="mt-6 border border-border/60 p-5 bg-card">
              <h3 className="font-sans text-[11px] uppercase tracking-widest text-primary mb-3">Category mix</h3>
              <div className="space-y-2">
                {Object.entries(data.analyses.categoryMix)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, n]) => {
                    const max = Math.max(...Object.values(data.analyses.categoryMix));
                    const pct = Math.round((n / max) * 100);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between text-xs font-sans mb-1">
                          <span className="text-foreground/90">{cat}</span>
                          <span className="text-muted-foreground">{n}</span>
                        </div>
                        <div className="h-[2px] bg-border">
                          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </Section>

        {/* JOURNEY */}
        <Section eyebrow="Customer journey" title="Your path so far">
          <div className="border border-border/60 bg-card">
            {data.journey.map((step, i) => (
              <div key={step.label} className={`grid md:grid-cols-[24px_1fr_1.5fr] gap-4 items-start p-5 ${i < data.journey.length - 1 ? "border-b border-border/40" : ""}`}>
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${step.done ? "bg-primary" : "border border-border bg-transparent"}`} />
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">Step {i + 1}</p>
                  <p className="font-display text-lg text-foreground mt-1">{step.label}</p>
                  <p className="font-sans text-xs text-muted-foreground mt-1">
                    {step.done ? (step.date ? new Date(step.date).toLocaleDateString() : "Complete") : "Pending"}
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-3 h-3 mt-1 text-primary flex-shrink-0" />
                  <p className="font-sans text-sm text-foreground/80">{step.opportunity}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* NEXT ACTIONS */}
        {nextActions.length > 0 && (
          <Section eyebrow="What's next" title="Three moves to try">
            <div className="space-y-3">
              {nextActions.map((a, i) => (
                <div key={i} className="border border-border/60 p-4 bg-card flex items-start gap-3">
                  <span className="font-display text-2xl text-primary/60 leading-none">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-sans text-sm text-foreground/90">{a}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        <p className="mt-10 text-center font-sans text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Generated from your onboarding, closet, analyses and dressing-room activity
        </p>
      </div>
    </AppLayout>
  );
};

export default UserAnalysis;