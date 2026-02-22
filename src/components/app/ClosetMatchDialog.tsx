import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Shirt, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ClosetMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lookTitle: string;
  lookItems: string[];
}

interface MatchResult {
  lookItem: string;
  matched: boolean;
  closetItem?: { name: string | null; category: string; color: string | null; brand: string | null };
}

export const ClosetMatchDialog = ({ open, onOpenChange, lookTitle, lookItems }: ClosetMatchDialogProps) => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);

    const matchItems = async () => {
      const { data: closetItems } = await supabase
        .from("clothing_items")
        .select("name, category, color, brand")
        .eq("user_id", user.id);

      if (!closetItems) {
        setMatches(lookItems.map((item) => ({ lookItem: item, matched: false })));
        setLoading(false);
        return;
      }

      const results: MatchResult[] = lookItems.map((lookItem) => {
        const lowerLook = lookItem.toLowerCase();
        const keywords = lowerLook.split(/[\s-]+/).filter((w) => w.length > 2);

        const match = closetItems.find((ci) => {
          const fields = [ci.name, ci.category, ci.color, ci.brand]
            .filter(Boolean)
            .map((f) => f!.toLowerCase());
          const combined = fields.join(" ");
          return keywords.some((kw) => combined.includes(kw));
        });

        return match
          ? { lookItem, matched: true, closetItem: match }
          : { lookItem, matched: false };
      });

      setMatches(results);
      setLoading(false);
    };

    matchItems();
  }, [open, user, lookItems]);

  const matchCount = matches.filter((m) => m.matched).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-glass-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Recreate: {lookTitle}</DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {loading ? (
            <div className="space-y-3">
              {lookItems.map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-sans mb-4">
                You have <span className="text-primary font-medium">{matchCount}/{lookItems.length}</span> items in your closet
              </p>
              <div className="space-y-2">
                {matches.map((m, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      m.matched
                        ? "border-primary/30 bg-primary/5"
                        : "border-glass-border bg-secondary/30"
                    }`}
                  >
                    {m.matched ? (
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans text-foreground">{m.lookItem}</p>
                      {m.matched && m.closetItem && (
                        <p className="text-xs text-primary font-sans mt-0.5 truncate">
                          → {m.closetItem.name || m.closetItem.category}
                          {m.closetItem.color && ` (${m.closetItem.color})`}
                        </p>
                      )}
                      {!m.matched && (
                        <p className="text-xs text-muted-foreground font-sans mt-0.5">Not in closet</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
