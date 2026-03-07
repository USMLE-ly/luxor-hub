import { useNavigate } from "react-router-dom";
import { ContainerScroll } from "@/components/ui/container-scroll";
import { GradientButton } from "@/components/ui/gradient-button";
import { Sparkles, TrendingUp, Palette, Calendar, ShoppingBag, BarChart3 } from "lucide-react";

const AppPreview = () => {
  const navigate = useNavigate();
  return (
    <section className="relative overflow-hidden bg-background">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center gap-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-sans font-medium tracking-wide">
              <Sparkles className="w-4 h-4" /> App Preview
            </span>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
              Your Style Command Center
            </h2>
            <p className="text-muted-foreground font-sans text-lg max-w-2xl">
              Everything you need to master your personal style — powered by AI, designed for you.
            </p>
            <GradientButton onClick={() => navigate("/auth")} className="mt-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Try It Free
            </GradientButton>
          </div>
        }
      >
        {/* Mock Dashboard UI */}
        <div className="h-full w-full p-4 md:p-6 overflow-hidden bg-background rounded-xl">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-sans text-muted-foreground uppercase tracking-widest">Welcome back</p>
              <h3 className="font-display text-xl font-bold text-foreground">Your Style DNA</h3>
            </div>
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>

          {/* Style Formula Card */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, hsl(30 40% 95%), hsl(35 50% 92%))' }}>
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-muted-foreground mb-3">Style Formula</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Palette, label: "Color Type", value: "Warm Autumn" },
                { icon: TrendingUp, label: "Style Type", value: "Modern Classic" },
                { icon: BarChart3, label: "Body Type", value: "Inverted Triangle" },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-card/60">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-sans text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-sans font-semibold text-foreground text-center">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Calendar, label: "Calendar", count: "3 events" },
              { icon: ShoppingBag, label: "Closet", count: "48 items" },
              { icon: TrendingUp, label: "Style Score", count: "100/100" },
              { icon: BarChart3, label: "Analytics", count: "View" },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 flex flex-col items-center gap-2 hover-lift cursor-default">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-sans font-semibold text-foreground">{item.label}</span>
                <span className="text-[10px] font-sans text-muted-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </ContainerScroll>
    </section>
  );
};

export default AppPreview;
