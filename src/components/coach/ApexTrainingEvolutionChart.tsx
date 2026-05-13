import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

interface Props { athleteId: string }

export default function ApexTrainingEvolutionChart({ athleteId }: Props) {
  const [groups, setGroups] = useState<string[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>("");

  useEffect(() => {
    (async () => {
      const [{ data: apex }, { data: fb }] = await Promise.all([
        supabase.from("apex_analyses" as any).select("scores, created_at")
          .eq("athlete_id", athleteId).order("created_at", { ascending: true }),
        supabase.from("training_feedback" as any).select("muscle_connections, session_date")
          .eq("athlete_id", athleteId).order("session_date", { ascending: true }),
      ]);

      const allGroups = new Set<string>();
      (apex || []).forEach((r: any) => Object.keys(r.scores || {}).forEach((k) => allGroups.add(k)));
      (fb || []).forEach((r: any) => Object.keys(r.muscle_connections || {}).forEach((k) => allGroups.add(k)));
      const groupList = Array.from(allGroups);
      setGroups(groupList);
      if (!activeGroup && groupList.length) setActiveGroup(groupList[0]);

      // Build a unified timeline keyed by date
      const map: Record<string, any> = {};
      (apex || []).forEach((r: any) => {
        const d = (r.created_at || "").slice(0, 10);
        map[d] = { ...(map[d] || { date: d }), apex: r.scores };
      });
      (fb || []).forEach((r: any) => {
        const d = r.session_date;
        map[d] = { ...(map[d] || { date: d }), conn: r.muscle_connections };
      });
      setData(Object.values(map).sort((a: any, b: any) => a.date.localeCompare(b.date)));
    })();
  }, [athleteId, activeGroup]);

  const chartData = data.map((d: any) => ({
    date: d.date,
    apex: d.apex?.[activeGroup] ?? null,
    conexao: d.conn?.[activeGroup] ?? null,
  }));

  return (
    <Card className="border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2 text-blue-300">
          <TrendingUp className="h-4 w-4" /> Evolução APEX × Treino
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              className={`text-[11px] px-2 py-1 rounded-md border capitalize ${
                activeGroup === g
                  ? "bg-blue-500/20 border-blue-500/60 text-blue-300"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Line type="monotone" dataKey="apex" name="APEX visual" stroke="#E8A020" strokeWidth={2} connectNulls />
              <Line type="monotone" dataKey="conexao" name="Conexão treino" stroke="#1DB87A" strokeWidth={2} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
