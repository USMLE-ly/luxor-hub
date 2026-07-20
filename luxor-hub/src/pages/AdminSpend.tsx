import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@phosphor-icons/react";

interface SpendSummary {
  date: string;
  total_requests: number;
  total_tokens: number;
  total_users: number;
  estimated_cost_usd: number;
  tier_breakdown: Record<string, { users: number; requests: number; tokens: number }>;
  top_users: Array<{ user_id: string; requests: number; tokens: number; tier: string }>;
}

interface UsageData {
  tier: string;
  used: number;
  limit: number;
  remaining: number;
  tokens_used: number;
}

export default function AdminSpend() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [summaries, setSummaries] = useState<SpendSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch current usage
        const { data: session } = await supabase.auth.getSession();
        const token = session?.session?.access_token;
        if (token) {
          const usageResp = await fetch("/api/v1/spend/usage", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (usageResp.ok) {
            setUsage(await usageResp.json());
          }
        }

        // Fetch historical summaries
        const { data: summariesData } = await supabase
          .from("spend_summary" as any)
          .select("*")
          .order("date", { ascending: false })
          .limit(30);

        if (summariesData) {
          setSummaries(summariesData as unknown as SpendSummary[]);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load spend data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="w-6 h-6 animate-spin text-white/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  const totalRequests = summaries.reduce((sum, s) => sum + s.total_requests, 0);
  const totalTokens = summaries.reduce((sum, s) => sum + s.total_tokens, 0);
  const totalCost = summaries.reduce((sum, s) => sum + s.estimated_cost_usd, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Spend Dashboard</h1>

      {/* Current Usage */}
      {usage && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Today&apos;s Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider">Tier</p>
                <p className="text-white text-2xl font-bold capitalize">{usage.tier}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider">Requests</p>
                <p className="text-white text-2xl font-bold">
                  {usage.used} <span className="text-white/40 text-sm">/ {usage.limit}</span>
                </p>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider">Remaining</p>
                <p className="text-white text-2xl font-bold">{usage.remaining}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider">Tokens</p>
                <p className="text-white text-2xl font-bold">{usage.tokens_used.toLocaleString()}</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-4 h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-white/50 text-xs uppercase tracking-wider">Total Requests (30d)</p>
            <p className="text-white text-2xl font-bold">{totalRequests.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-white/50 text-xs uppercase tracking-wider">Total Tokens (30d)</p>
            <p className="text-white text-2xl font-bold">{totalTokens.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <p className="text-white/50 text-xs uppercase tracking-wider">Estimated Cost (30d)</p>
            <p className="text-white text-2xl font-bold">${totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Summary Table */}
      {summaries.length > 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-lg">Daily Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/50 border-b border-white/10">
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-right py-2 px-3">Requests</th>
                    <th className="text-right py-2 px-3">Tokens</th>
                    <th className="text-right py-2 px-3">Users</th>
                    <th className="text-right py-2 px-3">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {summaries.map((s) => (
                    <tr key={s.date} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-2 px-3 text-white">{s.date}</td>
                      <td className="py-2 px-3 text-white text-right">{s.total_requests}</td>
                      <td className="py-2 px-3 text-white text-right">{s.total_tokens.toLocaleString()}</td>
                      <td className="py-2 px-3 text-white text-right">{s.total_users}</td>
                      <td className="py-2 px-3 text-emerald-400 text-right">${s.estimated_cost_usd.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
